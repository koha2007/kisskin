#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 메이크업 제품 자동 생성기 — Gemini + Google Search 그라운딩으로 "새로 나온"
// K-뷰티 메이크업 제품 1건을 발굴해 사진 위주 제품소개(KO+EN)로 발행
// ────────────────────────────────────────────────────────────────────
// 흐름:
//   1) Gemini + 검색 그라운딩 → 최근 출시/화제 제품 1건 ProductPost(KO) 생성
//   2) (선택) Imagen 으로 감성 무드컷 1장 생성 → sharp 로 webp 변환 →
//      public/products/{slug}.webp 저장. 실패해도 무시(디자인 카드 폴백).
//   3) Gemini 로 EN 번역 → items.en.ts + enSlugs.ts 삽입
//   4) KO 를 items.ts 최상단에 삽입
//
// 안전장치:
//   · 그라운딩으로 실제 제품 근거. 허구 스펙/가격 금지, 가격은 링크에서 확인 톤.
//   · 구매 링크는 검색 링크(제품명 기반) → 정확 딥링크 불필요, 항상 동작.
//   · 이미지 생성 실패는 치명적이지 않음 → 사진 없이도 디자인 카드로 발행.
//   · 커밋/푸시는 워크플로가 담당. 이 스크립트는 파일만 수정.
//
// 사용: GEMINI_API_KEY=... node scripts/gen-products.mjs
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const ITEMS = resolve('src/lib/products/items.ts')
const ITEMS_EN = resolve('src/lib/products/items.en.ts')
const EN_SLUGS = resolve('src/lib/products/enSlugs.ts')
const IMG_DIR = resolve('public/products')
const MODEL = process.env.GEMINI_PRODUCT_MODEL || 'gemini-2.5-flash'
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'imagen-3.0-generate-002'
const WANT_IMAGE = process.env.PRODUCT_IMAGES !== '0' // 기본 on, PRODUCT_IMAGES=0 으로 끔

const CATEGORIES = ['trend', 'lip', 'eye', 'base', 'cheek', 'skincare', 'fragrance', 'hair', 'global']
const CLIO_CATS = ['main', 'base', 'lip', 'eye', 'cheek']
// 컬러 메이크업 카테고리만 클리오(색조) 스토어 노출.
const COLOR_CATS = new Set(['trend', 'lip', 'eye', 'base', 'cheek'])

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

const today = new Date().toISOString().slice(0, 10)

function existing() {
  const s = readFileSync(ITEMS, 'utf8')
  const slugs = [...s.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])
  const names = [...s.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1])
  return { slugs, names, set: new Set(slugs) }
}

const PROMPT = (ex) => `당신은 글로벌 뷰티 미디어 kissinskin 의 K-뷰티 제품 에디터입니다.
Google 검색을 사용해 **최근 2~3개월 이내 새로 출시됐거나 지금 화제인** 한국 메이크업/색조·베이스 제품(또는 향수/헤어) 1건을 찾아 "제품 소개" 카드용 데이터를 작성하세요.
사진 위주로 짧게 보여줄 카드라 글은 간결하게.

절대 규칙(신뢰성):
- 브랜드명·제품명은 검색 결과에 실제 존재하는 것만. 스펙/성분/컬러도 확인된 것만. 지어내지 말 것.
- 가격은 적지 말 것(수시로 바뀜 — "구매 링크에서 확인" 전제).
- 아래 "이미 다룬 제품"과 중복 금지.

이미 다룬 slug: ${ex.slugs.slice(0, 40).join(', ')}
이미 다룬 제품명: ${ex.names.slice(0, 40).join(', ')}

출력 — 아래 스키마의 JSON 하나만, \`\`\`json 코드블록으로 감싸서(다른 텍스트 금지):
{
  "slug": "brand-product-english-kebab",        // 영어 소문자-하이픈, 위 목록과 겹치지 않게
  "category": "${CATEGORIES.join('|')}",         // 이 중 하나(색조=lip/eye/base/cheek/trend, 그 외 skincare/fragrance/hair/global)
  "brand": "브랜드명(한국어 표기)",
  "name": "제품명(한국어)",
  "title": "카드 헤드라인 — 브랜드+제품+한 줄 훅(한국어, 구체적으로)",
  "summary": "1~2문장 소개(한국어, 60~140자).",
  "highlights": ["짧은 특징1", "짧은 특징2", "짧은 특징3"],   // 실제 제품의 구체적 특징(제형·발색·지속력·성분·마무리 등) 2~4개, 각 6~16자. 뭉뚱그린 광고문구 금지.
  "coupangQuery": "쿠팡 검색어(브랜드+제품, 한국어, ≤6단어)",
  "globalQuery": "Amazon/YesStyle english search (brand + product line)",
  "clioCategory": "${CLIO_CATS.join('|')}",       // 색조면 해당 부위, 아니면 main
  "tags": ["한글태그", "한글태그", "한글태그"],
  "featured": false
}`

async function callGemini(apiKey, prompt, grounded) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: grounded ? 0.9 : 0.3, maxOutputTokens: 2048 },
  }
  if (grounded) body.tools = [{ google_search: {} }]
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
  if (!text) throw new Error('Gemini 응답에 텍스트 없음')
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
  if (!item.brand || !item.name) err.push('brand/name 누락')
  if (!item.title || item.title.length < 6) err.push('title 너무 짧음')
  if (!item.summary || item.summary.length < 15) err.push('summary 너무 짧음')
  if (!Array.isArray(item.highlights) || item.highlights.length < 2) err.push('highlights 부족')
  if (!item.coupangQuery) err.push('coupangQuery 누락')
  if (!Array.isArray(item.tags) || item.tags.length < 2) err.push('tags 부족')
  if (!CLIO_CATS.includes(item.clioCategory)) item.clioCategory = 'main'
  // 파생값 보정
  item.clio = COLOR_CATS.has(item.category)
  item.date = today
  item.highlights = item.highlights.slice(0, 4)
  return err
}

const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
function serialize(item) {
  const L = []
  L.push('  {')
  L.push(`    slug: ${q(item.slug)},`)
  L.push(`    category: ${q(item.category)},`)
  L.push(`    brand: ${q(item.brand)},`)
  L.push(`    name: ${q(item.name)},`)
  L.push(`    title: ${q(item.title)},`)
  L.push('    summary:')
  L.push(`      ${q(item.summary)},`)
  L.push('    highlights: [' + item.highlights.map(q).join(', ') + '],')
  if (item.image) L.push(`    image: ${q(item.image)},`)
  L.push(`    coupangQuery: ${q(item.coupangQuery)},`)
  if (item.globalQuery) L.push(`    globalQuery: ${q(item.globalQuery)},`)
  L.push(`    clio: ${item.clio ? 'true' : 'false'},`)
  L.push(`    clioCategory: ${q(item.clioCategory)},`)
  L.push(`    date: ${q(item.date)},`)
  L.push('    tags: [' + item.tags.map(q).join(', ') + '],')
  if (item.featured) L.push('    featured: true,')
  L.push('  },')
  return L.join('\n')
}

function insertAt(file, anchor, text) {
  const src = readFileSync(file, 'utf8')
  const idx = src.indexOf(anchor)
  if (idx === -1) throw new Error(`앵커를 못 찾음: ${anchor} (${file})`)
  const at = idx + anchor.length
  writeFileSync(file, src.slice(0, at) + '\n' + text + src.slice(at))
}

// ── 무드컷 생성(선택) — Imagen → sharp webp. 실패 시 null 반환(폴백). ──
async function genImage(apiKey, item) {
  const prompt = `Editorial product mood photograph for a K-beauty ${item.category} item: "${item.name}" by ${item.brand}. High-end beauty magazine still life / flat-lay, soft studio lighting, clean pastel background, elegant and minimal. No text, no logo, no watermark, no human face.`
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:predict?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '3:4' } }),
  })
  if (!res.ok) throw new Error(`imagen ${res.status}: ${(await res.text()).slice(0, 150)}`)
  const data = await res.json()
  const b64 = data.predictions?.[0]?.bytesBase64Encoded
  if (!b64) throw new Error('imagen: 이미지 바이트 없음')
  const buf = Buffer.from(b64, 'base64')
  mkdirSync(IMG_DIR, { recursive: true })
  const outPath = resolve(IMG_DIR, `${item.slug}.webp`)
  const sharp = (await import('sharp')).default
  await sharp(buf).resize(800, 1000, { fit: 'cover' }).webp({ quality: 80 }).toFile(outPath)
  return `/products/${item.slug}.webp`
}

const EN_PROMPT = (item) => `Translate this Korean K-beauty product card into natural English for a global audience.
Rules: keep facts exact, do not invent. Romanize the brand and product name (e.g. 롬앤→rom&nd, 클리오→CLIO). Keep it concise.
Return ONLY one JSON object in a \`\`\`json code block with this schema:
{ "brand": "...", "name": "...", "title": "...", "summary": "...", "highlights": ["..."], "tags": ["..."] }

Korean:
\`\`\`json
${JSON.stringify({ brand: item.brand, name: item.name, title: item.title, summary: item.summary, highlights: item.highlights, tags: item.tags }, null, 2)}
\`\`\``

async function translateAndInsertEn(apiKey, item) {
  const en = extractJson(await callGemini(apiKey, EN_PROMPT(item), false))
  if (!en.name || !en.title || !Array.isArray(en.highlights) || !Array.isArray(en.tags)) {
    throw new Error('EN 번역 검증 실패(필드 부족)')
  }
  const enItem = {
    slug: item.slug,
    category: item.category,
    brand: en.brand || item.brand,
    name: en.name,
    title: en.title,
    summary: en.summary || en.title,
    highlights: en.highlights.slice(0, 4),
    image: item.image,
    coupangQuery: item.coupangQuery,
    globalQuery: item.globalQuery,
    clio: item.clio,
    clioCategory: item.clioCategory,
    date: item.date,
    tags: en.tags,
    ...(item.featured ? { featured: true } : {}),
  }
  insertAt(ITEMS_EN, 'export const PRODUCT_ITEMS_EN: ProductPost[] = [', serialize(enItem))
  insertAt(EN_SLUGS, 'export const EN_PRODUCT_SLUGS = [', `  ${q(item.slug)},`)
}

async function main() {
  const apiKey = loadEnv('GEMINI_API_KEY')
  if (!apiKey) { console.error('GEMINI_API_KEY 없음 (.dev.vars/.env 또는 env)'); process.exit(1) }

  const ex = existing()
  let item = null
  for (let attempt = 1; attempt <= 3 && !item; attempt++) {
    try {
      const cand = extractJson(await callGemini(apiKey, PROMPT(ex), true))
      const errs = validate(cand, ex)
      if (errs.length) { console.warn(`  시도 ${attempt} 검증 실패: ${errs.join('; ')}`); continue }
      item = cand
    } catch (e) {
      console.warn(`  시도 ${attempt} 오류: ${e.message}`)
    }
  }
  if (!item) { console.error('제품 생성 실패(3회) — 중단'); process.exit(1) }

  // 무드컷(선택) — 실패해도 계속.
  if (WANT_IMAGE) {
    try {
      item.image = await genImage(apiKey, item)
      console.log(`  🖼️  무드컷 저장: ${item.image}`)
    } catch (e) {
      console.warn(`  ⚠️ 이미지 생성 건너뜀(디자인 카드 폴백): ${e.message}`)
    }
  }

  insertAt(ITEMS, 'export const PRODUCT_ITEMS: ProductPost[] = [', serialize(item))
  console.log(`✅ KO 추가: [${item.category}] ${item.brand} ${item.name} (slug: ${item.slug})`)

  try {
    await translateAndInsertEn(apiKey, item)
    console.log(`  🌐 EN 번역 추가: ${item.slug}`)
  } catch (e) {
    console.warn(`  ⚠️ EN 번역 건너뜀: ${e.message}`)
  }

  console.log('\n다음: `npm run gen:sitemap` 는 빌드에서 자동 실행됩니다. 변경 확인 후 커밋하세요.')
}

main()
