#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// seoTitle / seoDescription 백필 — 이미 발행된 뉴스·제품에 SERP 용 메타를 채운다
// ────────────────────────────────────────────────────────────────────
// 왜: 2026-07-28 실측에서 프리렌더 216장 중 검색 결과에 잘려 나가는 페이지가
//     대부분이었다(한글 title 83% · 영문 title 60% 초과, 영문 최장 174자 · 설명 430자).
//     원인은 아이템에 seoTitle/seoDescription 이 없어 본문 제목·요약으로 폴백한 것.
//     생성기(gen-news/gen-products)는 같은 날 고쳤지만, 이미 쌓인 글은 손대야 한다.
//
// 왜 "자르지" 않고 다시 쓰는가: 87자짜리 한글 제목을 30자에서 자르면 문장이 부서진다.
//     제목은 줄이는 게 아니라 **다시 쓰는** 문제라 모델을 쓴다. 다만 사실을 새로
//     만들지 않도록 "주어진 제목·요약 안에 있는 내용만" 쓰라고 못을 박는다.
//
// 안전장치:
//   · 이미 seoTitle 이 있는 아이템은 건너뛴다(재실행 안전).
//   · 배치로 묶어 호출 수를 줄인다. 응답은 slug 로 매칭 — 순서에 의존하지 않는다.
//   · 파일 수정은 아이템 블록 안에서 tags/featured 줄 뒤에 삽입하는 방식이라
//     기존 필드를 건드리지 않는다. 삽입 실패 시 그 아이템만 건너뛰고 계속한다.
//   · _seoMeta.mjs 의 fitText 로 마지막에 한 번 더 길이를 강제한다.
//
// 사용: node scripts/backfill-seo-meta.mjs [--dry] [--only=news|products]
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { LIMITS, fitText } from './_seoMeta.mjs'

const MODEL = process.env.GEMINI_NEWS_MODEL || 'gemini-2.5-flash'
const BATCH = 8

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').split('=')[1] || ''

const TARGETS = [
  { kind: 'news', locale: 'ko', file: 'src/lib/news/items.ts' },
  { kind: 'news', locale: 'en', file: 'src/lib/news/items.en.ts' },
  { kind: 'products', locale: 'ko', file: 'src/lib/products/items.ts' },
  { kind: 'products', locale: 'en', file: 'src/lib/products/items.en.ts' },
].filter((t) => !ONLY || t.kind === ONLY)

function loadEnv(name) {
  if (process.env[name]) return process.env[name]
  for (const f of ['.dev.vars', '.env']) {
    try {
      const m = readFileSync(resolve(f), 'utf8').match(new RegExp(`^${name}=(.*)$`, 'm'))
      if (m) return m[1].trim().replace(/^["']|["']$/g, '')
    } catch { /* 없으면 다음 후보 */ }
  }
  return null
}

/** 아이템 블록을 slug 단위로 잘라 낸다(gen-sitemap 과 같은 방식). */
function parseItems(src) {
  const marks = [...src.matchAll(/^\s{4}slug:\s*'([^']+)',$/gm)].map((m) => ({ slug: m[1], idx: m.index }))
  return marks.map((mk, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].idx : src.length
    const chunk = src.slice(mk.idx, end)
    const pick = (re) => {
      const m = chunk.match(re)
      return m ? m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\') : ''
    }
    return {
      slug: mk.slug,
      idx: mk.idx,
      end,
      chunk,
      title: pick(/^\s*title:\s*'((?:[^'\\]|\\.)*)',$/m),
      brand: pick(/^\s*brand:\s*'((?:[^'\\]|\\.)*)',$/m),
      name: pick(/^\s*name:\s*'((?:[^'\\]|\\.)*)',$/m),
      summary: pick(/^\s*summary:\s*\n?\s*'((?:[^'\\]|\\.)*)',$/m),
      hasSeo: /^\s*seoTitle:/m.test(chunk),
    }
  })
}

const PROMPT = (kind, locale, items) => {
  const lim = LIMITS[locale]
  const ko = locale === 'ko'
  const what = kind === 'news' ? (ko ? '뉴스 기사' : 'news articles') : ko ? '메이크업 제품 소개' : 'makeup product pages'
  return ko
    ? `당신은 검색 결과에 노출될 제목·설명을 쓰는 SEO 에디터입니다. 아래 ${what} 각각에 대해 검색 결과용 제목과 설명을 다시 씁니다.

규칙:
- **주어진 제목·요약 안에 있는 내용만** 사용하세요. 사실·수치·브랜드를 새로 만들지 마세요.
- seoTitle: ${lim.titleMax}자 이내. 원문을 자른 게 아니라, 이 페이지를 찾을 사람이 실제로 검색할 말로 다시 쓴 **완결된 제목**. 사이트명("kissinskin" 등) 붙이지 마세요.
- seoDescription: ${lim.descMin}~${lim.descMax}자. 이 페이지에서 얻을 수 있는 게 뭔지 한 문장으로. 문장을 중간에 끊지 마세요.
- 낚시성 표현·과장 금지. 없는 평점·가격을 암시하지 마세요.

입력:
\`\`\`json
${JSON.stringify(items, null, 2)}
\`\`\`

출력 — JSON 배열 하나만, \`\`\`json 코드블록으로 감싸서(다른 텍스트 금지):
[{ "slug": "...", "seoTitle": "...", "seoDescription": "..." }]`
    : `You are an SEO editor writing search-result titles and descriptions. Rewrite the SERP title and description for each of the following ${what}.

Rules:
- Use ONLY what is already in the given title/summary. Do not invent facts, numbers, or brands.
- seoTitle: max ${lim.titleMax} characters. Not a truncation — a complete, natural headline someone would actually search. Do not append the site name.
- seoDescription: ${lim.descMin}-${lim.descMax} characters. One sentence on what this page gives. Never cut off mid-sentence.
- No clickbait, no exaggeration, and never imply ratings or prices we do not have.

Input:
\`\`\`json
${JSON.stringify(items, null, 2)}
\`\`\`

Output — ONLY one JSON array wrapped in a \`\`\`json code block:
[{ "slug": "...", "seoTitle": "...", "seoDescription": "..." }]`
}

async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
    }),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
  const m = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\[[\s\S]*\])/)
  if (!m) throw new Error('JSON 배열을 찾지 못함')
  return JSON.parse(m[1])
}

const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"

/** 아이템 블록의 마지막 줄(닫는 '},') 바로 앞에 seo 필드를 끼워 넣는다. */
function injectInto(chunk, seoTitle, seoDescription) {
  const lines = chunk.split('\n')
  // 뒤에서부터 블록을 닫는 '  },' 를 찾는다.
  let close = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^\s{2}\},\s*$/.test(lines[i])) { close = i; break }
  }
  if (close === -1) return null
  lines.splice(close, 0, `    seoTitle: ${q(seoTitle)},`, '    seoDescription:', `      ${q(seoDescription)},`)
  return lines.join('\n')
}

async function run() {
  const apiKey = loadEnv('GEMINI_API_KEY')
  if (!apiKey) { console.error('GEMINI_API_KEY 없음 (.dev.vars/.env 또는 env)'); process.exit(1) }

  for (const t of TARGETS) {
    const path = resolve(t.file)
    let src = readFileSync(path, 'utf8')
    const all = parseItems(src)
    const todo = all.filter((it) => !it.hasSeo)
    console.log(`\n── ${t.file} · 전체 ${all.length} · 채울 것 ${todo.length}`)
    if (!todo.length) continue

    const results = new Map()
    for (let i = 0; i < todo.length; i += BATCH) {
      const batch = todo.slice(i, i + BATCH)
      const payload = batch.map((it) => ({
        slug: it.slug,
        title: t.kind === 'products' ? `${it.brand} ${it.name} — ${it.title}` : it.title,
        summary: it.summary,
      }))
      let got = null
      for (let attempt = 1; attempt <= 3 && !got; attempt++) {
        try {
          got = await callGemini(apiKey, PROMPT(t.kind, t.locale, payload))
        } catch (e) {
          console.warn(`   배치 ${i / BATCH + 1} 시도 ${attempt} 실패: ${e.message}`)
        }
      }
      if (!got) { console.warn(`   배치 ${i / BATCH + 1} 포기 — 이 배치는 건너뜀`); continue }
      for (const r of got) {
        if (!r?.slug || !r.seoTitle || !r.seoDescription) continue
        results.set(r.slug, {
          seoTitle: fitText(r.seoTitle, LIMITS[t.locale].titleMax),
          seoDescription: fitText(r.seoDescription, LIMITS[t.locale].descMax, { sentence: true }),
        })
      }
      console.log(`   배치 ${i / BATCH + 1}/${Math.ceil(todo.length / BATCH)} — 누적 ${results.size}건`)
    }

    // 뒤에서부터 삽입해야 앞 아이템의 인덱스가 밀리지 않는다.
    let written = 0
    for (const it of [...todo].sort((a, b) => b.idx - a.idx)) {
      const r = results.get(it.slug)
      if (!r) continue
      const next = injectInto(it.chunk, r.seoTitle, r.seoDescription)
      if (!next) { console.warn(`   ⚠ 블록 닫는 줄을 못 찾음: ${it.slug}`); continue }
      src = src.slice(0, it.idx) + next + src.slice(it.end)
      written++
    }
    console.log(`   → ${written}건 삽입${DRY ? ' (--dry: 파일 미저장)' : ''}`)
    if (!DRY && written) writeFileSync(path, src)
  }
}

run().catch((e) => { console.error(e); process.exit(1) })
