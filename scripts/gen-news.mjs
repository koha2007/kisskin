#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 뉴스 자동 생성기 — Gemini + Google Search 그라운딩으로 "실제 최신" K-뷰티 뉴스 1편 생성
// ────────────────────────────────────────────────────────────────────
// 목적(2026-07-07 방향): 뉴스는 "내가 쓴 글"이 아니라 매일 급변하는 글로벌 메이크업
//   시장의 트렌드·정보·기술을 실시간으로 담는 정보 피드. → 자동 생성/발행.
//
// 안전장치:
//   · Google Search 그라운딩 → 실제 검색 결과에 근거. 허구 통계·브랜드·인용 금지 지시.
//   · 기존 slug 를 프롬프트에 넘겨 중복 주제 회피 + 파싱해 slug 충돌 시 거절.
//   · NewsItem 스키마/카테고리/날짜/본문 마크업 검증 후에만 items.ts 에 삽입.
//   · 커밋/푸시는 하지 않음(자동화 워크플로가 담당). 이 스크립트는 파일만 수정.
//
// 사용: GEMINI_API_KEY=... node scripts/gen-news.mjs [개수(기본1)]
//       (.dev.vars/.env 에 GEMINI_API_KEY 있으면 자동 로드)
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ITEMS = resolve('src/lib/news/items.ts')
const MODEL = process.env.GEMINI_NEWS_MODEL || 'gemini-2.5-flash'
const CATEGORIES = ['trend', 'lip', 'eye', 'base', 'cheek', 'skincare', 'fragrance', 'hair', 'global']

// ── env 로드(.dev.vars/.env 폴백) ──
function loadEnv(key) {
  if (process.env[key]) return process.env[key]
  for (const f of ['.dev.vars', '.env']) {
    try {
      for (const line of readFileSync(resolve(f), 'utf8').split('\n')) {
        const t = line.trim()
        if (!t || t.startsWith('#') || !t.includes('=')) continue
        const i = t.indexOf('=')
        if (t.slice(0, i).trim() === key) return t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
      }
    } catch { /* missing */ }
  }
  return undefined
}

// ── 오늘 날짜(YYYY-MM-DD) ── (빌드/CI 컨텍스트라 Date 사용 정상)
const today = new Date().toISOString().slice(0, 10)

// ── 기존 slug + 제목 추출(중복 회피용) ──
function existing() {
  const s = readFileSync(ITEMS, 'utf8')
  const slugs = [...s.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])
  const titles = [...s.matchAll(/title:\s*'([^']+)'/g)].map((m) => m[1])
  return { slugs, titles, set: new Set(slugs) }
}

const PROMPT = (ex) => `당신은 글로벌 뷰티 미디어 kissinskin 의 K-뷰티 산업 뉴스 에디터입니다.
Google 검색을 사용해 **최근 2~3주 이내 실제로 일어난** 글로벌 메이크업·K-뷰티 시장의 새 소식 1건을 찾아 한국어 뉴스 기사로 작성하세요.
소재 예: 신제품 출시, 시장/수출 데이터, 트렌드 부상, 뷰티 테크, 규제 변화, 브랜드 동향, 컬러/포뮬러 유행.

절대 규칙(신뢰성):
- 통계·가격·날짜·브랜드명·인용문은 **검색 결과에 실제로 나온 것만** 사용. 불확실하면 수치 대신 질적으로 서술. 절대 지어내지 말 것.
- 광고성 문구 금지. 일반 독자에게 정보를 전달하는 톤.
- 아래 "이미 다룬 주제"와 중복되지 않는 새로운 소식.

이미 다룬 slug(중복 금지): ${ex.slugs.slice(0, 40).join(', ')}

출력 형식 — 아래 스키마의 JSON 하나만, \`\`\`json 코드블록으로 감싸서 출력(다른 텍스트 금지):
{
  "slug": "english-kebab-case-unique",           // 영어 소문자-하이픈, 위 목록과 겹치지 않게
  "category": "${CATEGORIES.join('|')}",          // 이 중 하나
  "title": "한국어 제목(구체적 수치/브랜드 포함 권장)",
  "summary": "한국어 2문장 요약",
  "body": [
    "> TLDR: 핵심1 | 핵심2 | 핵심3",              // 첫 요소는 TLDR 박스(| 로 2~3개)
    "본문 문단(한국어, 150~350자).",              // 일반 문단 여러 개
    "> DATA: 검색에서 확인된 수치 기반 서술",       // 콜아웃(선택): DATA/KEY/WARN/TIP 중 1~2개
    "> QUOTE: 인용 문장 | 출처명",                 // 실제 출처가 있을 때만
    "마무리 문단(소비자 관점 시사점)."
  ],                                              // 총 6~9개 요소, 콜아웃 1~2개 포함
  "date": "${today}",
  "readMinutes": 4,                               // 본문 길이에 맞춰 3~6
  "tags": ["한글태그", "한글태그", "한글태그"],     // 3~4개
  "featured": false
}`

async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }], // 그라운딩
      generationConfig: { temperature: 0.9, maxOutputTokens: 4096 },
    }),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  const parts = data.candidates?.[0]?.content?.parts || []
  const text = parts.map((p) => p.text || '').join('')
  if (!text) throw new Error('Gemini 응답에 텍스트 없음: ' + JSON.stringify(data).slice(0, 300))
  return text
}

function extractJson(text) {
  const m = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/)
  if (!m) throw new Error('JSON 블록을 찾지 못함')
  return JSON.parse(m[1])
}

function validate(item, ex) {
  const err = []
  if (!item.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.slug)) err.push('slug 형식 오류')
  if (ex.set.has(item.slug)) err.push(`slug 중복: ${item.slug}`)
  if (!CATEGORIES.includes(item.category)) err.push(`category 오류: ${item.category}`)
  if (!item.title || item.title.length < 8) err.push('title 너무 짧음')
  if (!item.summary || item.summary.length < 20) err.push('summary 너무 짧음')
  if (!Array.isArray(item.body) || item.body.length < 5) err.push('body 5개 미만')
  if (!Array.isArray(item.tags) || item.tags.length < 2) err.push('tags 부족')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date || '')) item.date = today
  if (typeof item.readMinutes !== 'number') {
    const chars = (item.body || []).join('').length
    item.readMinutes = Math.max(3, Math.min(7, Math.round(chars / 500)))
  }
  return err
}

// ── NewsItem → items.ts 리터럴 직렬화(파일 스타일: 2-space, single-quote) ──
const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
function serialize(item) {
  const lines = []
  lines.push('  {')
  lines.push(`    slug: ${q(item.slug)},`)
  lines.push(`    category: ${q(item.category)},`)
  lines.push(`    title: ${q(item.title)},`)
  lines.push(`    summary:`)
  lines.push(`      ${q(item.summary)},`)
  lines.push('    body: [')
  for (const p of item.body) lines.push(`      ${q(p)},`)
  lines.push('    ],')
  lines.push(`    date: ${q(item.date)},`)
  lines.push(`    readMinutes: ${item.readMinutes},`)
  lines.push(`    tags: [${item.tags.map(q).join(', ')}],`)
  if (item.featured) lines.push('    featured: true,')
  lines.push('  },')
  return lines.join('\n')
}

function insert(item) {
  const src = readFileSync(ITEMS, 'utf8')
  const anchor = 'export const NEWS_ITEMS: NewsItem[] = ['
  const idx = src.indexOf(anchor)
  if (idx === -1) throw new Error('NEWS_ITEMS 배열 시작점을 못 찾음')
  const at = idx + anchor.length
  const next = src.slice(0, at) + '\n' + serialize(item) + src.slice(at)
  writeFileSync(ITEMS, next)
}

async function main() {
  const apiKey = loadEnv('GEMINI_API_KEY')
  if (!apiKey) { console.error('GEMINI_API_KEY 없음 (.dev.vars/.env 또는 env)'); process.exit(1) }
  const count = Math.max(1, parseInt(process.argv[2] || '1', 10))

  for (let i = 0; i < count; i++) {
    const ex = existing() // 매번 최신 slug 반영(같은 실행에서 중복 방지)
    let ok = false
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const text = await callGemini(apiKey, PROMPT(ex))
        const item = extractJson(text)
        const errs = validate(item, ex)
        if (errs.length) { console.warn(`  시도 ${attempt} 검증 실패: ${errs.join('; ')}`); continue }
        insert(item)
        console.log(`✅ 추가: [${item.category}] ${item.title}  (slug: ${item.slug}, ${item.readMinutes}분)`)
        ok = true
      } catch (e) {
        console.warn(`  시도 ${attempt} 오류: ${e.message}`)
      }
    }
    if (!ok) { console.error('생성 실패(3회) — 중단'); process.exit(1) }
  }
  console.log('\n다음: `npm run gen:sitemap` 는 빌드에서 자동 실행됩니다. 변경 확인 후 커밋하세요.')
}

main()
