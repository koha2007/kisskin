#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 메이크업 제품 자동 생성기 — Gemini + Google Search 그라운딩으로 "새로 나온"
// 메이크업 제품을 발굴해 사진 위주 제품소개(KO+EN)로 발행
// ────────────────────────────────────────────────────────────────────
// 흐름:
//   0) 카테고리/시장 로테이션 결정 → 립만 계속 나오지 않도록 강제
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
// 사용: GEMINI_API_KEY=... node scripts/gen-products.mjs [건수]
//   PRODUCT_CATEGORY=eye  → 로테이션 무시하고 카테고리 고정
//   PRODUCT_MARKET=global → 로테이션 무시하고 시장 고정(kr|global)
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const ITEMS = resolve('src/lib/products/items.ts')
const ITEMS_EN = resolve('src/lib/products/items.en.ts')
const EN_SLUGS = resolve('src/lib/products/enSlugs.ts')
const IMG_DIR = resolve('public/products')
const MODEL = process.env.GEMINI_PRODUCT_MODEL || 'gemini-2.5-flash'
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'imagen-4.0-generate-001'
// 카테고리별 폴백 장면. 평소엔 모델이 제품 실물(컬러·제형·마무리)에 맞춰 써 주는
// imageScene 을 쓰고, 그게 없을 때만 여기로 떨어진다.
const CAT_APPLIED = {
  lip: 'a beauty portrait of a young woman wearing a fresh, dewy lip tint',
  eye: 'a beauty portrait of a young woman wearing soft shimmery eyeshadow and delicate eyeliner',
  cheek: 'a beauty portrait of a young woman with soft, diffused blush across the cheeks',
  base: 'a beauty portrait of a young woman with flawless, glowing base makeup and natural skin texture',
  skincare: 'a beauty portrait of a young woman with glowing, deeply hydrated, healthy skin',
  fragrance: "a soft-focus portrait of a young woman's face, neck and collarbone, romantic airy fragrance-ad mood",
  hair: 'a portrait of a young woman with glossy, healthy, smooth hair catching soft light',
  trend: 'an editorial beauty portrait of a young woman wearing a fresh, of-the-moment makeup look',
  global: 'an editorial beauty portrait of a young woman wearing a fresh, of-the-moment makeup look',
}
const WANT_IMAGE = process.env.PRODUCT_IMAGES !== '0' // 기본 on, PRODUCT_IMAGES=0 으로 끔

const CATEGORIES = ['trend', 'lip', 'eye', 'base', 'cheek', 'skincare', 'fragrance', 'hair', 'global']
const CLIO_CATS = ['main', 'base', 'lip', 'eye', 'cheek']
// 컬러 메이크업 카테고리만 클리오(색조) 스토어 노출.
const COLOR_CATS = new Set(['trend', 'lip', 'eye', 'base', 'cheek'])

// ── 다양성 강제 ──────────────────────────────────────────────────────
// 카테고리를 모델에게 맡기면 검색 결과가 넘치는 '립'으로만 쏠린다(홈 4장 전부 립).
// 그래서 발행 시점에 카테고리를 정해 프롬프트에 못 박는다. 최근 쓴 카테고리는
// 제외하므로 한 바퀴(8일)를 돌기 전엔 같은 종류가 다시 나오지 않는다.
const ROTATION = ['lip', 'eye', 'base', 'cheek', 'trend', 'skincare', 'hair', 'fragrance']
const AVOID_RECENT = ROTATION.length - 1

function nextCategory(recentCats) {
  const forced = process.env.PRODUCT_CATEGORY
  if (forced) return forced
  const recent = recentCats.slice(0, AVOID_RECENT)
  const start = ROTATION.indexOf(recentCats[0] ?? '') // 미발견(-1)이면 자연스럽게 0부터
  for (let i = 1; i <= ROTATION.length; i++) {
    const c = ROTATION[(start + i) % ROTATION.length]
    if (!recent.includes(c)) return c
  }
  return ROTATION[0]
}

// 시장도 번갈아 — 국내 유행 제품과 글로벌 유행 제품을 교대로 소개한다.
const nextMarket = (n) => process.env.PRODUCT_MARKET || (n % 2 === 0 ? 'kr' : 'global')

// 이미지가 매번 똑같아지지 않도록 구도/조명/배경/분위기를 슬러그 해시로 고른다.
// (같은 슬러그 → 항상 같은 그림 = 재실행해도 결과 재현 가능)
const FRAMING = [
  'head-and-shoulders portrait, straight-on, eyes to camera',
  'three-quarter angle portrait, chin slightly lowered, gaze off-camera',
  'tight face crop from brow to chin, filling the frame',
  'side profile turning toward camera, soft over-the-shoulder pose',
  'upper-body portrait with one hand resting near the jawline',
  'slightly-from-above selfie angle, relaxed candid expression',
]
const LIGHTING = [
  'soft diffused daylight from a window',
  'warm golden-hour sunlight with gentle lens flare',
  'clean bright studio beauty lighting with a catchlight in the eyes',
  'cool overcast light with soft, even shadows',
  'dreamy backlight with a bright halo around the hair',
  'moody low-key light with a single soft key from the side',
]
const BACKDROP = [
  'seamless off-white studio backdrop',
  'muted beige paper backdrop',
  'blurred green outdoor foliage',
  'soft grey gradient backdrop',
  'blurred warm interior with bokeh',
  'pale pastel pink backdrop',
]
// 국내 인기 제품엔 한국인 모델. 글로벌 제품은 인종을 섞는다.
// (Imagen 은 인종 지시를 곧잘 흘려버려서 프롬프트 끝에서 한 번 더 못 박는다.)
const SUBJECT_KR = [
  'a young Korean woman in her early twenties',
  'a young Korean woman with long straight black hair',
  'a young Korean woman with a soft brown bob',
  'a young Korean woman with her hair tied back',
  'a young Korean man with clean, groomed brows',
  'a young Korean woman with wavy shoulder-length hair',
]
const SUBJECT_GLOBAL = [
  'a young Korean woman with long black hair',
  'a young Black woman with deep brown skin and short curls',
  'a young white woman with freckles and auburn hair',
  'a young Latina woman with wavy dark hair',
  'a young South Asian woman with warm brown skin',
  'a young East Asian woman with a sleek ponytail',
]

const hash = (s) => { let h = 5381; for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return h }
const pick = (arr, h, salt) => arr[(h + salt) % arr.length]

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
  const cats = [...s.matchAll(/category:\s*'([^']+)'/g)].map((m) => m[1])
  return { slugs, names, cats, set: new Set(slugs) }
}

// 카테고리별 "어떤 제품을 찾아야 하는가" — 립만 반복되지 않도록 예시로 못 박는다.
const CAT_BRIEF = {
  lip: '립 제품(틴트·립스틱·글로스·립밤·립라이너)',
  eye: '아이 제품(아이섀도 팔레트·마스카라·아이라이너·아이브로우)',
  base: '베이스 제품(쿠션·파운데이션·컨실러·프라이머·파우더·픽서)',
  cheek: '치크 제품(블러셔·하이라이터·셰이딩/컨투어·브론저)',
  trend: '지금 가장 화제인 메이크업 신제품(멀티 팔레트·한정판·컬래버 등 위 부위에 딱 안 맞는 것)',
  skincare: '메이크업 전후 스킨케어(선크림·세럼·수분크림·클렌저·마스크)',
  hair: '헤어 제품(트리트먼트·헤어오일·샴푸·스타일링)',
  fragrance: '향수 제품(오드퍼퓸·오드뚜왈렛·바디미스트·핸드크림 향)',
}

const MARKET_BRIEF = {
  kr: `**지금 한국에서 실제로 유행 중인 인기 제품**.
근거로 삼을 것: 올리브영 랭킹/어워즈, 다이소 뷰티 품절템, 무신사 뷰티, 화해·글로우픽 랭킹, 국내 유튜브·인스타 화제템.
브랜드 예: 롬앤, 클리오, 페리페라, 에뛰드, 헤라, 힌스, 데이지크, 어뮤즈, 라카, 티르티르, 조선미녀, 아누아, 코스알엑스 등(예시일 뿐 — 검색으로 확인된 현재 인기 제품이어야 함).`,
  global: `**지금 글로벌(미국·유럽·동남아)에서 실제로 유행 중인 인기 제품**.
근거로 삼을 것: 세포라 베스트셀러, 틱톡·유튜브 바이럴, Ulta 랭킹, Allure/Byrdie 어워즈, 아마존 뷰티 베스트셀러.
브랜드 예: Rare Beauty, Rhode, Charlotte Tilbury, NARS, Dior, YSL, Fenty Beauty, Glossier, Laneige, Beauty of Joseon, Tirtir, Anua 등(예시일 뿐 — 검색으로 확인된 현재 인기 제품이어야 함).
한국 브랜드라도 해외에서 크게 유행 중이면 OK. 한국에서 못 사는 제품이어도 무방.`,
}

const PROMPT = (ex, category, market) => `당신은 글로벌 뷰티 미디어 kissinskin 의 메이크업 제품 에디터입니다.
Google 검색을 사용해 아래 조건에 **정확히 맞는 실제 제품 1건**을 찾아 "제품 소개" 카드용 데이터를 작성하세요.
사진 위주로 짧게 보여줄 카드라 글은 간결하게.

■ 이번에 찾을 제품 종류(반드시 준수): ${CAT_BRIEF[category] || CAT_BRIEF.trend}
   → category 필드는 반드시 "${category}". 다른 종류의 제품을 고르면 실패입니다.

■ 이번에 찾을 시장: ${MARKET_BRIEF[market] || MARKET_BRIEF.kr}

■ 제품 선정 기준: "새로 나왔지만 아무도 모르는 것"이 아니라 **지금 사람들이 실제로 많이 사고 화제인 인기 제품**.
   최근 1년 이내 출시됐거나, 지금 랭킹/바이럴 상위에 올라 있는 것을 고르세요.

절대 규칙(신뢰성):
- 브랜드명·제품명은 검색 결과에 실제 존재하는 것만. 스펙/성분/컬러도 확인된 것만. 지어내지 말 것.
- 가격은 적지 말 것(수시로 바뀜 — "구매 링크에서 확인" 전제).
- 아래 "이미 다룬 제품"과 중복 금지.

이미 다룬 slug: ${ex.slugs.slice(0, 40).join(', ')}
이미 다룬 제품명: ${ex.names.slice(0, 40).join(', ')}

출력 — 아래 스키마의 JSON 하나만, \`\`\`json 코드블록으로 감싸서(다른 텍스트 금지):
{
  "slug": "brand-product-english-kebab",        // 영어 소문자-하이픈, 위 목록과 겹치지 않게
  "category": "${category}",                     // 반드시 이 값 그대로
  "brand": "브랜드명(한국어 표기, 글로벌 브랜드는 한국에서 통용되는 표기)",
  "name": "제품명(한국어)",
  "title": "카드 헤드라인 — 브랜드+제품+한 줄 훅(한국어, 구체적으로)",
  "summary": "1~2문장 소개(한국어, 60~140자).",
  "highlights": ["짧은 특징1", "짧은 특징2", "짧은 특징3"],   // 실제 제품의 구체적 특징(제형·발색·지속력·성분·마무리 등) 2~4개, 각 6~16자. 뭉뚱그린 광고문구 금지.
  "details": ["특징 설명 문장1", "문장2", "문장3"],           // highlights 를 풀어 쓴 실제 특징 문장 3~4개(제형·발색·지속력·컬러구성·사용팁 등). 각 40~90자. 구체적으로, 지어내지 말 것.
  "whoFor": "누구에게 맞는 제품인지 2문장(한국어, 80~160자). 피부타입·톤·상황을 구체적으로. '모두에게 좋다' 식 금지.",
  "howTo": ["사용법 문장1", "문장2"],                        // 실제 사용 순서·양·팁 2~3문장, 각 40~90자. 제품 특성에 근거해서.
  "pros": ["장점1", "장점2"],                                 // 2~3개, 각 20~60자. 구체적 근거가 있는 것만.
  "cons": ["정직한 단점1"],                                   // 1~2개, 각 20~60자. **반드시 정직하게.** 호불호가 갈리는 지점·주의사항(예: 건조함, 향, 색 선택 폭, 지속력 한계). 지어내지 말고, 알려진 게 없으면 "호불호가 갈릴 수 있는 지점"을 쓸 것. 빈 배열도 허용.
  "colorFit": "색조 제품이면: 어울리는 퍼스널컬러(봄 웜/여름 쿨/가을 웜/겨울 쿨 중) + 왜 그런지 한 줄(한국어, 40~90자). 색조가 아니면 빈 문자열.",
  "imageScene": "English. 이 제품을 실제로 바른 사람의 모습 한 문장. 제품의 실제 컬러 계열·제형·마무리(예: sheer coral gloss / matte terracotta blush / glossy inner-corner shimmer)를 구체적으로 묘사. 제품 용기·손·글자는 묘사하지 말 것. 예: 'wearing a sheer coral lip tint with a glossy, plumped finish'",
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
    // thinking off + 넉넉한 토큰 → JSON 잘림 방지(과거 analyze truncation fix 와 동일 원리).
    generationConfig: { temperature: grounded ? 0.9 : 0.3, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 0 } },
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

function validate(item, ex, category, market) {
  const err = []
  if (!item.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.slug)) err.push('slug 형식 오류')
  if (ex.set.has(item.slug)) err.push(`slug 중복: ${item.slug}`)
  // 로테이션이 정한 카테고리가 최종 결정권을 갖는다(모델이 딴 걸 넣어도 무시).
  if (!CATEGORIES.includes(item.category)) err.push(`category 오류: ${item.category}`)
  item.category = category
  item.market = market
  if (!item.brand || !item.name) err.push('brand/name 누락')
  if (!item.title || item.title.length < 6) err.push('title 너무 짧음')
  if (!item.summary || item.summary.length < 15) err.push('summary 너무 짧음')
  if (!Array.isArray(item.highlights) || item.highlights.length < 2) err.push('highlights 부족')
  if (!item.coupangQuery) err.push('coupangQuery 누락')
  if (!Array.isArray(item.tags) || item.tags.length < 2) err.push('tags 부족')
  // 파생값 보정 — 카테고리는 위에서 강제됐으므로 여기 맞춰 다시 계산.
  item.clioCategory = CLIO_CATS.includes(item.category) ? item.category : 'main'
  // 클리오 공식스토어 버튼은 "국내 색조"일 때만. 글로벌 브랜드에 붙으면 뜬금없다.
  item.clio = market === 'kr' && COLOR_CATS.has(item.category)
  item.date = today
  item.highlights = item.highlights.slice(0, 4)
  if (Array.isArray(item.details)) item.details = item.details.slice(0, 4)
  // 본문 보강 필드 — 없으면 그냥 빠진다(구 제품과 호환). 있으면 길이만 제한한다.
  if (Array.isArray(item.howTo)) item.howTo = item.howTo.slice(0, 3)
  if (Array.isArray(item.pros)) item.pros = item.pros.slice(0, 3)
  if (Array.isArray(item.cons)) item.cons = item.cons.slice(0, 2)
  // colorFit 은 색조에만 의미가 있다 — 스킨케어/헤어에 붙으면 뜬금없으니 지운다.
  if (!COLOR_CATS.has(item.category)) item.colorFit = ''
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
  if (Array.isArray(item.details) && item.details.length) {
    L.push('    details: [')
    for (const d of item.details) L.push(`      ${q(d)},`)
    L.push('    ],')
  }
  if (item.whoFor) {
    L.push('    whoFor:')
    L.push(`      ${q(item.whoFor)},`)
  }
  for (const [key, arr] of [['howTo', item.howTo], ['pros', item.pros], ['cons', item.cons]]) {
    if (Array.isArray(arr) && arr.length) {
      L.push(`    ${key}: [`)
      for (const v of arr) L.push(`      ${q(v)},`)
      L.push('    ],')
    }
  }
  if (item.colorFit) {
    L.push('    colorFit:')
    L.push(`      ${q(item.colorFit)},`)
  }
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

// ── 무드컷 생성(선택) — Imagen → sharp webp. 실패 시 throw(호출부에서 폴백). ──
// 제품마다 완전히 다른 그림이 나오도록: 모델이 써 준 제품별 장면(imageScene)
// + 슬러그 해시로 고른 구도·조명·배경·인물. 카드 비율(4:5)에 맞춰 세로 3:4.
function buildImagePrompt(item, retry = 0) {
  const h = hash(item.slug) + retry
  const scene = item.imageScene?.trim() || CAT_APPLIED[item.category] || CAT_APPLIED.trend
  const pool = item.market === 'global' ? SUBJECT_GLOBAL : SUBJECT_KR
  // 남성 모델은 립/치크에 어울리지 않으니 헤어·스킨케어·향수에서만 허용.
  const subjects = ['hair', 'skincare', 'fragrance'].includes(item.category)
    ? pool
    : pool.filter((s) => !s.includes(' man '))
  const subject = pick(subjects, h, 0)
  const framing = pick(FRAMING, h, 1)
  const lighting = pick(LIGHTING, h, 2)
  const backdrop = pick(BACKDROP, h, 3)
  return [
    `A beauty portrait photograph of ${subject} ${scene}.`,
    `Composition: ${framing}.`,
    `Lighting: ${lighting}. Background: ${backdrop}.`,
    'Editorial beauty advertising photography, realistic skin texture with visible pores, natural retouching, sharp focus on the face, shallow depth of field.',
    'The makeup is fully blended and finished, as actually worn — no swatches, streaks, stripes or unblended patches of product on the skin.',
    'Show only the person — no product packaging, no tubes, no bottles.',
    'Absolutely no text, letters, numbers, logos or watermark anywhere.',
    `Important: the model is ${subject}. Vertical portrait 3:4.`,
  ].join(' ')
}

async function imagenOnce(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:predict?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '3:4' } }),
  })
  if (!res.ok) throw new Error(`imagen ${res.status}: ${(await res.text()).slice(0, 150)}`)
  const data = await res.json()
  return data.predictions?.[0]?.bytesBase64Encoded
}

async function genImage(apiKey, item) {
  // 프롬프트가 슬러그로 고정이라, 안전필터에 걸려 빈 응답이 오면 같은 프롬프트를
  // 재시도해도 소용없다 → 인물/구도 변주를 바꿔가며 다시 시도한다.
  let b64
  for (let retry = 0; retry < 3 && !b64; retry++) {
    b64 = await imagenOnce(apiKey, buildImagePrompt(item, retry))
    if (!b64) console.warn(`  ↻ imagen 빈 응답(안전필터 추정) — 변주 ${retry + 1} 재시도`)
  }
  if (!b64) throw new Error('imagen: 이미지 바이트 없음(변주 3회 모두 차단)')
  const buf = Buffer.from(b64, 'base64')
  mkdirSync(IMG_DIR, { recursive: true })
  const outPath = resolve(IMG_DIR, `${item.slug}.webp`)
  const sharp = (await import('sharp')).default
  await sharp(buf).resize(960, 1280, { fit: 'cover' }).webp({ quality: 80 }).toFile(outPath)
  return `/products/${item.slug}.webp`
}

const EN_PROMPT = (item) => `Translate this Korean K-beauty product card into natural English for a global audience.
Rules: keep facts exact, do not invent. Romanize the brand and product name (e.g. 롬앤→rom&nd, 클리오→CLIO). Keep it concise.
Return ONLY one JSON object in a \`\`\`json code block with this schema:
{ "brand": "...", "name": "...", "title": "...", "summary": "...", "highlights": ["..."], "details": ["..."], "whoFor": "...", "howTo": ["..."], "pros": ["..."], "cons": ["..."], "colorFit": "...", "tags": ["..."] }
Translate every field that is present in the Korean input. If a field is absent or empty there, return it empty — do not invent one.
For "colorFit", use the English season names (Spring Warm / Summer Cool / Autumn Warm / Winter Cool).

Korean:
\`\`\`json
${JSON.stringify({ brand: item.brand, name: item.name, title: item.title, summary: item.summary, highlights: item.highlights, details: item.details || [], whoFor: item.whoFor || '', howTo: item.howTo || [], pros: item.pros || [], cons: item.cons || [], colorFit: item.colorFit || '', tags: item.tags }, null, 2)}
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
    ...(Array.isArray(en.details) && en.details.length ? { details: en.details.slice(0, 4) } : {}),
    ...(en.whoFor ? { whoFor: en.whoFor } : {}),
    ...(Array.isArray(en.howTo) && en.howTo.length ? { howTo: en.howTo.slice(0, 3) } : {}),
    ...(Array.isArray(en.pros) && en.pros.length ? { pros: en.pros.slice(0, 3) } : {}),
    ...(Array.isArray(en.cons) && en.cons.length ? { cons: en.cons.slice(0, 2) } : {}),
    ...(en.colorFit ? { colorFit: en.colorFit } : {}),
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

async function generateOne(apiKey) {
  // 매번 파일에서 다시 읽는다 → 한 번에 여러 건 뽑아도 로테이션/중복검사가 맞물린다.
  const ex = existing()
  const category = nextCategory(ex.cats)
  const market = nextMarket(ex.slugs.length)
  console.log(`\n▶ [${category}] ${market === 'kr' ? '국내 인기' : '글로벌 인기'} 제품 찾는 중…`)

  let item = null
  for (let attempt = 1; attempt <= 3 && !item; attempt++) {
    try {
      const cand = extractJson(await callGemini(apiKey, PROMPT(ex, category, market), true))
      const errs = validate(cand, ex, category, market)
      if (errs.length) { console.warn(`  시도 ${attempt} 검증 실패: ${errs.join('; ')}`); continue }
      item = cand
    } catch (e) {
      console.warn(`  시도 ${attempt} 오류: ${e.message}`)
    }
  }
  if (!item) throw new Error(`제품 생성 실패(3회) — category=${category} market=${market}`)

  // 무드컷(선택) — 실패해도 계속(디자인 카드 폴백).
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
}

// ── 이미지만 다시 뽑기: node scripts/gen-products.mjs regen [slug...|all] ──
// 글은 그대로 두고 무드컷만 새 프롬프트로 재촬영할 때. 파일명이 slug 기준이라
// items.ts 는 건드릴 필요가 없다(이미 image 경로가 같은 파일을 가리킴).
async function regen(apiKey, wanted) {
  const src = readFileSync(ITEMS, 'utf8')
  const items = [...src.matchAll(/slug:\s*'([^']+)',\s*\n\s*category:\s*'([^']+)'/g)]
    .map(([, slug, category]) => ({ slug, category, market: process.env.PRODUCT_MARKET || 'kr' }))
  const targets = wanted.includes('all') ? items : items.filter((i) => wanted.includes(i.slug))
  if (!targets.length) { console.error(`대상 없음. 사용 가능한 slug: ${items.map((i) => i.slug).join(', ')}`); process.exit(1) }

  for (const item of targets) {
    try {
      console.log(`▶ [${item.category}] ${item.slug} 재촬영…`)
      console.log(`  🖼️  ${await genImage(apiKey, item)}`)
    } catch (e) {
      console.warn(`  ⚠️ 실패: ${e.message}`)
    }
  }
}

async function main() {
  const apiKey = loadEnv('GEMINI_API_KEY')
  if (!apiKey) { console.error('GEMINI_API_KEY 없음 (.dev.vars/.env 또는 env)'); process.exit(1) }

  if (process.argv[2] === 'regen') return regen(apiKey, process.argv.slice(3))

  const count = Math.max(1, Math.min(8, Number(process.argv[2]) || 1))
  let ok = 0
  for (let i = 0; i < count; i++) {
    try { await generateOne(apiKey); ok++ } catch (e) { console.error(`  ❌ ${e.message}`) }
  }
  if (!ok) { console.error('\n한 건도 생성하지 못함 — 중단'); process.exit(1) }

  console.log(`\n총 ${ok}/${count}건 발행. \`npm run gen:sitemap\` 은 빌드에서 자동 실행됩니다. 변경 확인 후 커밋하세요.`)
}

main()
