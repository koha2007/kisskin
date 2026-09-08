#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 이미 발행된 제품 카드 중 무드컷이 없는 것들에 사진을 1회성으로 채운다.
// ────────────────────────────────────────────────────────────────────
// 왜: 2026-08-09 결제 사고 이후 daily-news.yml 이 PRODUCT_IMAGES='0' 으로 이미지
//     생성을 꺼 뒀다(Gemini 무료 티어에 이미지 쿼터가 없어서). 그 사이 발행된
//     31개(2026-08-09~09-06) 카드가 그라데이션+이모지 폴백으로만 나온다.
//     gen-products.mjs 는 OpenAI(gpt-image-1)로 옮겨 고쳤지만 그건 **앞으로 나올**
//     제품에만 적용된다. 이미 나간 것들은 이 스크립트로 한 번 채운다.
//
// 방식:
//   1) items.ts 에서 `image:` 없는 블록을 찾는다.
//   2) 각 제품 사실(brand/name/highlights/details/colorFit …)로 LLM 에게
//      "이 제품을 실제로 바른 사람" 한 문장(imageScene)과 시장(kr|global)을 받는다.
//      LLM 실패 시 카테고리 폴백 장면 + clio 로 시장 추정.
//   3) _productImagePrompt.buildImagePrompt → _openaiImage(gpt-image-1) → sharp webp.
//      → public/products/{slug}.webp
//   4) items.ts / items.en.ts 의 해당 블록에 `image:` 줄을 삽입(coupangQuery 앞).
//
// 멱등: 이미 `image:` 가 있는 블록은 건너뛴다 → 여러 번 돌려도 안전.
//
// 사용:
//   OPENAI_API_KEY=... GEMINI_API_KEY=... node scripts/backfill-product-images.mjs [옵션]
//     --dry            대상 목록만 출력하고 종료(API 호출 없음)
//     --limit N        앞에서 N 개만 처리(먼저 소량으로 확인할 때)
//     --only a,b,c     지정한 slug 만 처리
//     --no-scene       LLM 장면 생성 생략(카테고리 폴백 장면만) — 텍스트 쿼터 아낄 때
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildImagePrompt } from './_productImagePrompt.mjs'
import { IMAGE_MODEL, generateImageB64 } from './_openaiImage.mjs'
import { callGeminiText } from './_geminiText.mjs'

const ITEMS_KO = resolve('src/lib/products/items.ts')
const ITEMS_EN = resolve('src/lib/products/items.en.ts')
const IMG_DIR = resolve('public/products')

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

// ── items 파일에서 각 제품 블록을 잘라낸다 (backfill-products.mjs 와 같은 방식) ──
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
      brand: str('brand'),
      name: str('name'),
      title: str('title'),
      summary: str('summary'),
      colorFit: str('colorFit'),
      clio: /\n {4}clio:\s*true/.test(chunk),
      highlights: list('highlights'),
      details: list('details'),
      tags: list('tags'),
    }
  })
}

// ── LLM: 제품 사실 → { imageScene, market } ──
const SCENE_PROMPT = (b) => `You write one image-generation scene note for a K-beauty product card.
Output: a single raw JSON object and NOTHING else — no code fence, no prose, no explanation.
Shape:
{"imageScene":"<English, ONE sentence: a person actually wearing / showing this product, describing its REAL colour family, texture and finish — e.g. 'wearing a sheer coral lip tint with a glossy, plumped finish' or 'with matte terracotta blush diffused high on the cheeks' or 'with deeply hydrated, glass-like glowing skin'. No product packaging, tubes, bottles, hands, text or brand name.>","market":"<kr if this is primarily a Korea-market popular product, global if it trends mainly in the US/EU/SEA>"}

Product facts:
- category: ${b.category}
- brand: ${b.brand}
- name: ${b.name}
- title: ${b.title}
- summary: ${b.summary}
- highlights: ${b.highlights.join(' / ')}
- details: ${b.details.join(' / ')}
- colorFit: ${b.colorFit || '(none)'}
- tags: ${b.tags.join(', ')}`

function extractJson(text) {
  // ```json 펜스 → 아무 { … } → 마지막 { … } 순으로 시도(모델이 앞뒤 설명을 붙여도 건짐).
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
  // 시장 판정이 실패하면 'kr' 로 떨어진다 — 이 사이트 카탈로그는 대부분 국내 K-뷰티라
  // 한국인 모델이 안전한 기본값이다. 'global'(인종 혼합)은 LLM 이 명시할 때만.
  const fallbackMarket = 'kr'
  if (NO_SCENE) return { imageScene: '', market: fallbackMarket }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const out = await callGeminiText(geminiKey, SCENE_PROMPT(b), { temperature: 0.5, maxOutputTokens: 512, lowThinking: true })
      const j = extractJson(out)
      const scene = typeof j.imageScene === 'string' ? j.imageScene.trim() : ''
      if (!scene) throw new Error('imageScene 비어 있음')
      const market = j.market === 'global' ? 'global' : j.market === 'kr' ? 'kr' : fallbackMarket
      return { imageScene: scene, market }
    } catch (e) {
      console.warn(`    ⚠️ 장면 생성 시도 ${attempt} 실패: ${e.message}`)
    }
  }
  console.warn('    ⚠️ 장면 생성 3회 실패 — 카테고리 폴백 장면 사용')
  return { imageScene: '', market: fallbackMarket }
}

// ── 이미지 1장: 변주 3회 재시도 → sharp webp ──
async function genImage(openaiKey, item) {
  let b64
  for (let retry = 0; retry < 3 && !b64; retry++) {
    b64 = await generateImageB64(openaiKey, buildImagePrompt(item, retry), '3:4')
    if (!b64) console.warn(`    ↻ ${IMAGE_MODEL} 빈 응답(콘텐츠 필터 추정) — 변주 ${retry + 1} 재시도`)
  }
  if (!b64) throw new Error(`${IMAGE_MODEL}: 이미지 바이트 없음(변주 3회 모두 차단)`)
  mkdirSync(IMG_DIR, { recursive: true })
  const outPath = resolve(IMG_DIR, `${item.slug}.webp`)
  const sharp = (await import('sharp')).default
  await sharp(Buffer.from(b64, 'base64')).resize(960, 1280, { fit: 'cover' }).webp({ quality: 80 }).toFile(outPath)
  return `/products/${item.slug}.webp`
}

// ── items 파일 블록에 `image:` 줄 삽입 (coupangQuery 앞, serialize() 와 같은 위치) ──
function insertImageLine(file, slug, imagePath) {
  const src = readFileSync(file, 'utf8')
  const re = new RegExp(`(\\n {2}\\{\\n {4}slug: '${slug.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}',[\\s\\S]*?)(\\n {4}coupangQuery:)`)
  const m = src.match(re)
  if (!m) return { ok: false, reason: '블록/coupangQuery 앵커 없음' }
  if (/\n {4}image:\s*'/.test(m[1])) return { ok: false, reason: '이미 image 있음' }
  const next = src.replace(re, `$1\n    image: '${imagePath}',$2`)
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

  console.log(`무드컷 없는 제품: ${koBlocks.filter((b) => !b.hasImage).length}개 · 이번 처리 대상: ${targets.length}개${DRY ? ' (--dry)' : ''}\n`)
  for (const b of targets) console.log(`  · [${b.category}] ${b.slug}  ${b.brand} ${b.name}`)
  if (DRY) { console.log('\n--dry: 여기까지. API 호출 없음.'); return }
  console.log('')

  let ok = 0, fail = 0
  for (const b of targets) {
    try {
      console.log(`▶ [${b.category}] ${b.slug}`)
      const { imageScene, market } = await sceneFor(geminiKey, b)
      console.log(`    시장=${market}${imageScene ? ` · 장면="${imageScene}"` : ' · 장면=카테고리 폴백'}`)
      const imagePath = await genImage(openaiKey, { slug: b.slug, category: b.category, market, imageScene })
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

  console.log(`\n완료: 성공 ${ok} · 실패 ${fail}. 남은 무드컷 없는 제품: ${parseBlocks(ITEMS_KO).filter((b) => !b.hasImage).length}개`)
  console.log('변경 확인 후 커밋하세요. (실패분은 다시 실행하면 멱등하게 이어서 처리됩니다)')
}

main()
