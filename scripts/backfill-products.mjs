#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 이미 발행된 제품 상세에 본문 보강 필드를 채워 넣는 1회성 백필.
// ────────────────────────────────────────────────────────────────────
// 왜: 제품 상세가 726자뿐이라 구글이 "크롤링됨 – 색인 안 됨"으로 버렸고(미색인 90개),
//     Commission Factory 도 같은 이유("콘텐츠가 채워지지 않음")로 퍼블리셔 신청을 반려했다.
//     gen-products.mjs 는 고쳐 놨지만 그건 **앞으로 나올 제품**에만 적용된다.
//     이미 나간 것들은 이 스크립트로 한 번 채운다.
//
// 채우는 필드: whoFor / howTo / pros / cons / colorFit
//   (항목 구성은 CF 가 공개한 "좋은 제휴 리뷰란?" 가이드를 따랐다)
//
// 방식: items.ts / items.en.ts 를 텍스트로 수술한다(gen-products.mjs 와 동일한 방식).
//       이미 whoFor 가 있는 항목은 건너뛴다 → 여러 번 돌려도 안전(멱등).
//
// 사용: GEMINI_API_KEY=... node scripts/backfill-products.mjs [--dry]
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ITEMS_KO = resolve('src/lib/products/items.ts')
const ITEMS_EN = resolve('src/lib/products/items.en.ts')
const DRY = process.argv.includes('--dry')
const COLOR_CATS = new Set(['base', 'lip', 'eye', 'cheek'])

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey && !DRY) {
  console.error('GEMINI_API_KEY 없음 — 중단'); process.exit(1)
}

// ── items 파일에서 각 제품 블록을 잘라낸다 ──
function parseItems(file) {
  const s = readFileSync(file, 'utf8')
  const marks = [...s.matchAll(/^ {2}\{\n {4}slug: '([^']+)',/gm)].map((m) => ({ slug: m[1], idx: m.index }))
  return marks.map((mk, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].idx : s.length
    const chunk = s.slice(mk.idx, end)
    const get = (k) => (chunk.match(new RegExp(`${k}:\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'`)) || [])[1] || ''
    const arr = (k) => {
      const m = chunk.match(new RegExp(`${k}: \\[([\\s\\S]*?)\\]`))
      return m ? [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1]) : []
    }
    return {
      slug: mk.slug, chunk, start: mk.idx, end,
      category: get('category'), brand: get('brand'), name: get('name'),
      summary: get('summary'), details: arr('details'),
      hasBackfill: /\n {4}whoFor:/.test(chunk),
    }
  })
}

const PROMPT = (it, en) => `${en ? 'You are writing in ENGLISH.' : '한국어로 작성한다.'}
Below is a real K-beauty product we already published. Add the missing sections of a good product write-up.

Product: ${it.brand} ${it.name}  (category: ${it.category})
Summary: ${it.summary}
Known features:
${it.details.map((d) => '- ' + d).join('\n') || '- (none recorded)'}

RULES — this is the important part:
- Base everything on the known features above and on what is genuinely known about this product.
- **Do not invent specifics** (no made-up ingredients, shade counts, prices, or claims).
- "cons" must be HONEST. Every product has a trade-off — dryness, scent, limited shades, staying power,
  price, a finish that divides people. If you truly know none, name the thing people are most likely to
  dislike about this *type* of product. Never write "no downsides".
- No advertising fluff. No "perfect for everyone".

Return ONLY one JSON object in a \`\`\`json code block:
{
  "whoFor": "${en ? '2 sentences: which skin type / tone / occasion this actually suits (80-160 chars).' : '2문장. 어떤 피부·톤·상황에 맞는지 구체적으로(80~160자).'}",
  "howTo": ["${en ? '2-3 sentences on how to actually apply it (40-90 chars each).' : '실제 사용 순서·양·팁 2~3문장(각 40~90자).'}"],
  "pros": ["${en ? '2-3 concrete strengths (20-60 chars each).' : '구체적 장점 2~3개(각 20~60자).'}"],
  "cons": ["${en ? '1-2 honest trade-offs (20-60 chars each).' : '정직한 단점·호불호 1~2개(각 20~60자).'}"],
  "colorFit": "${COLOR_CATS.has(it.category)
    ? (en ? 'Which personal color season suits it (Spring Warm / Summer Cool / Autumn Warm / Winter Cool) + one line of why.' : '어울리는 퍼스널컬러(봄 웜/여름 쿨/가을 웜/겨울 쿨) + 왜 그런지 한 줄(40~90자).')
    : ''}"
}`

async function gemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 2048, temperature: 0.7 },
    }),
  })
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 160)}`)
  const txt = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text || ''
  const m = txt.match(/```json\s*([\s\S]*?)```/)
  if (!m) throw new Error('JSON 블록 없음')
  return JSON.parse(m[1])
}

const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"

/** 기존 블록의 `image:` 또는 `coupangQuery:` 줄 **앞**에 새 필드를 끼워 넣는다. */
function withFields(chunk, f, category) {
  const L = []
  if (f.whoFor) { L.push('    whoFor:'); L.push(`      ${q(f.whoFor)},`) }
  for (const [k, arr] of [['howTo', f.howTo], ['pros', f.pros], ['cons', f.cons]]) {
    if (Array.isArray(arr) && arr.length) {
      L.push(`    ${k}: [`)
      for (const v of arr.slice(0, k === 'cons' ? 2 : 3)) L.push(`      ${q(v)},`)
      L.push('    ],')
    }
  }
  if (f.colorFit && COLOR_CATS.has(category)) { L.push('    colorFit:'); L.push(`      ${q(f.colorFit)},`) }
  if (!L.length) return chunk
  const anchor = chunk.match(/^ {4}(image|coupangQuery):/m)
  if (!anchor) throw new Error('삽입 지점(image/coupangQuery)을 못 찾음')
  const at = chunk.indexOf(anchor[0])
  return chunk.slice(0, at) + L.join('\n') + '\n' + chunk.slice(at)
}

async function run(file, en) {
  const items = parseItems(file)
  const todo = items.filter((i) => !i.hasBackfill)
  console.log(`\n[${en ? 'EN' : 'KO'}] 제품 ${items.length}개 · 백필 대상 ${todo.length}개`)
  if (!todo.length) return

  let src = readFileSync(file, 'utf8')
  for (const it of todo) {
    try {
      const f = DRY ? { whoFor: '(dry)', howTo: [], pros: [], cons: [] } : await gemini(PROMPT(it, en))
      if (!f.whoFor) throw new Error('whoFor 없음')
      if (!Array.isArray(f.cons) || !f.cons.length) console.warn(`  ⚠ ${it.slug}: cons 비어 있음 — 모델이 단점을 못 냈다`)
      const next = withFields(it.chunk, f, it.category)
      src = src.replace(it.chunk, next)          // 원본 블록을 통째로 치환
      console.log(`  ✅ ${it.slug}  (+${next.length - it.chunk.length}자)`)
    } catch (e) {
      console.error(`  ❌ ${it.slug}: ${e.message}`)
    }
  }
  if (!DRY) writeFileSync(file, src)
}

await run(ITEMS_KO, false)
await run(ITEMS_EN, true)
console.log('\n완료. `npm run build` 로 검증할 것.')
