#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 이미 발행된 뉴스 카드(98개, 전부 무드컷 없음)에 사진을 1회성으로 채운다.
// ────────────────────────────────────────────────────────────────────
// 왜: gen-news.mjs 에는 원래 이미지 생성이 없었다(제품 카드만 있었음) — 그래서
//     /news 98개 전부가 그라데이션+이모지 폴백으로만 나왔다. gen-news.mjs 는
//     2026-09-10 에 제품 카드와 같은 파이프라인(OpenAI gpt-image-1)으로 이미지
//     생성을 추가했지만 그건 **앞으로 나올** 기사에만 적용된다. 이미 나간 것들은
//     이 스크립트로 한 번 채운다.
//
// 방식:
//   1) items.ts 에서 `image:` 없는 블록을 찾는다.
//   2) 각 기사 사실(title/summary/category/tags)로 LLM 에게 "이 기사 주제·분위기에
//      맞는 에디토리얼 뷰티 장면" 한 문장(imageScene)을 받는다.
//      LLM 실패 시 카테고리 폴백 장면(_productImagePrompt.mjs CAT_APPLIED) 사용.
//   3) _productImagePrompt.buildImagePrompt → _openaiImage(gpt-image-1) → sharp webp.
//      → public/news/{slug}.webp
//   4) items.ts / items.en.ts 의 해당 블록에 `image:` 줄을 삽입(tags 다음 줄).
//
// 멱등: 이미 `image:` 가 있는 블록은 건너뛴다 → 여러 번 돌려도 안전.
//
// 사용:
//   OPENAI_API_KEY=... GEMINI_API_KEY=... node scripts/backfill-news-images.mjs [옵션]
//     --dry            대상 목록만 출력하고 종료(API 호출 없음)
//     --limit N        앞에서 N 개만 처리(먼저 소량으로 확인할 때)
//     --only a,b,c     지정한 slug 만 처리
//     --no-scene       LLM 장면 생성 생략(카테고리 폴백 장면만) — 텍스트 쿼터 아낄 때
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildImagePrompt, hash } from './_productImagePrompt.mjs'
import { IMAGE_MODEL, generateImageB64 } from './_openaiImage.mjs'
import { callGeminiText } from './_geminiText.mjs'

const ITEMS_KO = resolve('src/lib/news/items.ts')
const ITEMS_EN = resolve('src/lib/news/items.en.ts')
const IMG_DIR = resolve('public/news')

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry')
const NO_SCENE = argv.includes('--no-scene')
const LIMIT = (() => { const i = argv.indexOf('--limit'); return i >= 0 ? Math.max(1, Number(argv[i + 1]) || 0) : Infinity })()
const ONLY = (() => { const i = argv.indexOf('--only'); return i >= 0 ? new Set((argv[i + 1] || '').split(',').map((s) => s.trim()).filter(Boolean)) : null })()

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

// ── items 파일에서 각 기사 블록을 잘라낸다 (backfill-product-images.mjs 와 같은 방식) ──
function parseBlocks(file) {
  const s = readFileSync(file, 'utf8')
  const marks = [...s.matchAll(/^ {2}\{\n {4}slug: '([^']+)',/gm)].map((m) => ({ slug: m[1], idx: m.index }))
  return marks.map((mk, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].idx : s.length
    const chunk = s.slice(mk.idx, end)
    const str = (k) => (chunk.match(new RegExp(`${k}:\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'`)) || [])[1] || ''
    const list = (k) => {
      const m = chunk.match(new RegExp(`${k}: \\[([\\s\\S]*?)\\]`))
      if (!m) return []
      return [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'"))
    }
    return {
      slug: mk.slug,
      chunk,
      hasImage: /\n {4}image:\s*'/.test(chunk),
      category: str('category'),
      title: str('title'),
      summary: str('summary'),
      tags: list('tags'),
    }
  })
}

// ── LLM: 기사 사실 → { imageScene } ──
const SCENE_PROMPT = (b) => `You write one image-generation scene note for a K-beauty news article's editorial mood image.
Output: a single raw JSON object and NOTHING else — no code fence, no prose, no explanation.
Shape:
{"imageScene":"<English, ONE sentence: an editorial beauty-portrait scene fitting this article's topic and mood — e.g. 'with fresh dewy K-beauty skin and a soft glossy lip, evoking export-market confidence' or 'wearing a bold experimental eye look, evoking a rising color trend'. No product packaging, tubes, bottles, brand logos, real people's names, charts, text or numbers — just a person's beauty look.>"}

Article facts:
- category: ${b.category}
- title: ${b.title}
- summary: ${b.summary}
- tags: ${b.tags.join(', ')}`

function extractJson(text) {
  const cands = []
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) cands.push(fence[1])
  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  if (first >= 0 && last > first) cands.push(text.slice(first, last + 1))
  for (const c of cands) {
    try { return JSON.parse(c) } catch { /* 다음 후보 */ }
  }
  throw new Error('JSON 파싱 실패')
}

async function sceneFor(geminiKey, b) {
  if (NO_SCENE) return ''
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const out = await callGeminiText(geminiKey, SCENE_PROMPT(b), { temperature: 0.5, maxOutputTokens: 512, lowThinking: true })
      const j = extractJson(out)
      const scene = typeof j.imageScene === 'string' ? j.imageScene.trim() : ''
      if (!scene) throw new Error('imageScene 비어 있음')
      return scene
    } catch (e) {
      console.warn(`    ⚠️ 장면 생성 시도 ${attempt} 실패: ${e.message}`)
    }
  }
  console.warn('    ⚠️ 장면 생성 3회 실패 — 카테고리 폴백 장면 사용')
  return ''
}

// ── 이미지 1장: 변주 3회 재시도 → sharp webp. 뉴스엔 market 개념이 없어 슬러그
// 해시로 갈라 인물 다양성만 준다(gen-news.mjs genImage 와 동일한 규칙). ──
async function genImage(openaiKey, item) {
  const market = hash(item.slug) % 2 === 0 ? 'kr' : 'global'
  const promptItem = { slug: item.slug, category: item.category, market, imageScene: item.imageScene }
  let b64
  for (let retry = 0; retry < 3 && !b64; retry++) {
    b64 = await generateImageB64(openaiKey, buildImagePrompt(promptItem, retry), '3:4')
    if (!b64) console.warn(`    ↻ ${IMAGE_MODEL} 빈 응답(콘텐츠 필터 추정) — 변주 ${retry + 1} 재시도`)
  }
  if (!b64) throw new Error(`${IMAGE_MODEL}: 이미지 바이트 없음(변주 3회 모두 차단)`)
  mkdirSync(IMG_DIR, { recursive: true })
  const outPath = resolve(IMG_DIR, `${item.slug}.webp`)
  const sharp = (await import('sharp')).default
  await sharp(Buffer.from(b64, 'base64')).resize(960, 1280, { fit: 'cover' }).webp({ quality: 80 }).toFile(outPath)
  return `/news/${item.slug}.webp`
}

// ── items 파일 블록에 `image:` 줄 삽입 (tags 다음 줄, gen-news.mjs serialize() 와 같은 위치) ──
function insertImageLine(file, slug, imagePath) {
  const src = readFileSync(file, 'utf8')
  const re = new RegExp(`(\\n {2}\\{\\n {4}slug: '${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]*?\\n {4}tags: \\[[^\\]]*\\],)`)
  const m = src.match(re)
  if (!m) return { ok: false, reason: '블록/tags 앵커 없음' }
  if (/\n {4}image:\s*'/.test(m[1])) return { ok: false, reason: '이미 image 있음' }
  const next = src.replace(re, `$1\n    image: '${imagePath}',`)
  if (next === src) return { ok: false, reason: '치환 실패' }
  writeFileSync(file, next)
  return { ok: true }
}

async function main() {
  const openaiKey = loadEnv('OPENAI_API_KEY')
  const geminiKey = loadEnv('GEMINI_API_KEY')
  if (!DRY && !openaiKey) { console.error('OPENAI_API_KEY 없음 — 이미지 생성 불가'); process.exit(1) }

  const koBlocks = parseBlocks(ITEMS_KO)
  const enSlugs = new Set(parseBlocks(ITEMS_EN).map((b) => b.slug))

  let targets = koBlocks.filter((b) => !b.hasImage)
  if (ONLY) targets = targets.filter((b) => ONLY.has(b.slug))
  targets = targets.slice(0, LIMIT)

  console.log(`무드컷 없는 뉴스: ${koBlocks.filter((b) => !b.hasImage).length}개 · 이번 처리 대상: ${targets.length}개${DRY ? ' (--dry)' : ''}\n`)
  for (const b of targets) console.log(`  · [${b.category}] ${b.slug}  ${b.title}`)
  if (DRY) { console.log('\n--dry: 여기까지. API 호출 없음.'); return }
  console.log('')

  let ok = 0, fail = 0
  for (const b of targets) {
    try {
      console.log(`▶ [${b.category}] ${b.slug}`)
      const imageScene = await sceneFor(geminiKey, b)
      console.log(`    ${imageScene ? `장면="${imageScene}"` : '장면=카테고리 폴백'}`)
      const imagePath = await genImage(openaiKey, { slug: b.slug, category: b.category, imageScene })
      const koRes = insertImageLine(ITEMS_KO, b.slug, imagePath)
      if (!koRes.ok) throw new Error(`KO 삽입 실패: ${koRes.reason}`)
      let enNote = '(EN 블록 없음 — 건너뜀)'
      if (enSlugs.has(b.slug)) {
        const enRes = insertImageLine(ITEMS_EN, b.slug, imagePath)
        enNote = enRes.ok ? 'EN 삽입' : `EN 삽입 실패: ${enRes.reason}`
      }
      console.log(`    ✅ ${imagePath}  · KO 삽입 · ${enNote}`)
      ok++
    } catch (e) {
      console.warn(`    ❌ ${e.message}`)
      fail++
    }
  }

  console.log(`\n완료: 성공 ${ok} · 실패 ${fail}. 남은 무드컷 없는 뉴스: ${parseBlocks(ITEMS_KO).filter((b) => !b.hasImage).length}개`)
  console.log('변경 확인 후 커밋하세요. (실패분은 다시 실행하면 멱등하게 이어서 처리됩니다)')
}

main()
