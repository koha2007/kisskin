#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 메이크업 MBTI 16개 유형 페이지에 **유형별 고유 본문**을 채우는 1회성 백필.
// ────────────────────────────────────────────────────────────────────
// 왜: 유형 페이지 16개가 서로 **85% 동일**해서 구글이 전부 "크롤링됨 – 색인 안 됨"으로 버렸다.
//     본문 3,120자 중 고유한 건 455자뿐이었다. 원인은 두 가지다.
//       ① KO: 2026-05-06 리디자인 때 "도구 결과 -30,000자 트리밍"으로 detailParagraphs 가
//          16개 전부 1문단(~90자)으로 깎였다. 타입 정의는 "3~5문단"을 요구하는데도.
//       ② EN: detailParagraphs 번역이 아예 없어서 MakeupMbtiResult 가 `!isEn` 으로 막아뒀다.
//          → 영문 유형 페이지는 본문이 통째로 비어 있었다. 게다가 한글 해시태그가 노출됐다.
//     영문 MBTI 허브는 우리 **최다 유입 페이지**(28일 24클릭 중 14)다. 그 아래가 비어 있었다.
//
// 채우는 것: types.ts 의 detailParagraphs(KO) · types.en.ts 의 detailParagraphs + hashtags(EN)
// 근거: 이미 있는 유형 데이터(tagline/shortDesc/traits/signature/tips)만 재료로 쓴다 → 지어내지 않음.
// 멱등: 이미 3문단 이상이면 건너뛴다.
//
// 사용: GEMINI_API_KEY=... node scripts/backfill-mbti-body.mjs [--dry] [--only=ESTJ]
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const KO_FILE = resolve('src/lib/makeup-mbti/types.ts')
const EN_FILE = resolve('src/lib/makeup-mbti/types.en.ts')
const DRY = process.argv.includes('--dry')
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1]

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey && !DRY) { console.error('GEMINI_API_KEY 없음 — 중단'); process.exit(1) }

const strs = (s) => [...s.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1])

/** types.ts 에서 유형별 블록과 재료를 뽑는다. */
function parseKo() {
  const s = readFileSync(KO_FILE, 'utf8')
  const out = []
  // types.ts 는 배열이 아니라 Record<MbtiCode, ...> 다 → 블록이 `  INTJ: {` 로 시작한다.
  for (const m of s.matchAll(/^  (\w{4}): \{$/gm)) {
    const start = m.index
    const rest = s.slice(start)
    const endRel = rest.indexOf('\n  },')
    const chunk = rest.slice(0, endRel + 5)
    const one = (k) => (chunk.match(new RegExp(`${k}:\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'`)) || [])[1] || ''
    // ⚠ 앞 들여쓰기(4칸)까지 함께 잡아야 한다. 안 그러면 치환 블록의 들여쓰기가 덧붙어 8칸이 된다.
    const dpM = chunk.match(/^ {4}detailParagraphs: \[[\s\S]*?\n {4}\],\n/m)
    out.push({
      code: m[1], chunk, start,
      koName: one('koName'), tagline: one('tagline'), shortDesc: one('shortDesc'),
      traits: strs((chunk.match(/traits: \[([\s\S]*?)\n    \],/) || [])[1] || ''),
      signature: (chunk.match(/signature: \{[^}]*\}/) || [''])[0],
      detailParagraphs: dpM ? strs(dpM[0]) : [],
      dpRaw: dpM ? dpM[0] : null,
    })
  }
  return out
}

/** types.en.ts 에서 유형별 블록과 재료를 뽑는다. */
function parseEn() {
  const s = readFileSync(EN_FILE, 'utf8')
  const out = []
  for (const m of s.matchAll(/^  (\w{4}): \{$/gm)) {
    const start = m.index
    const rest = s.slice(start)
    const chunk = rest.slice(0, rest.indexOf('\n  },') + 5)
    const one = (k) => (chunk.match(new RegExp(`${k}:\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'`)) || [])[1] || ''
    return_: out.push({
      code: m[1], chunk,
      enPersona: one('enPersona'), tagline: one('tagline'), shortDesc: one('shortDesc'),
      avoidTip: one('avoidTip'), boostTip: one('boostTip'),
      hasBody: /\n {4}detailParagraphs:/.test(chunk),
    })
  }
  return out
}

const PROMPT = (ko, en, lang) => `${lang === 'ko'
  ? '너는 K-뷰티 에디터다. 한국어로 쓴다.'
  : 'You are a K-beauty editor writing in ENGLISH for a global audience.'}

우리 "메이크업 MBTI" 도구의 **${ko.code}** 유형 상세 페이지에 들어갈 본문을 쓴다.
이 유형에 대해 이미 확정된 설정은 아래가 전부다. **이 설정에서 벗어나거나 새 사실을 만들지 말 것.**

- 페르소나: ${lang === 'ko' ? ko.koName : en?.enPersona || ''}
- 한 줄: ${lang === 'ko' ? ko.tagline : en?.tagline || ko.tagline}
- 요약: ${lang === 'ko' ? ko.shortDesc : en?.shortDesc || ko.shortDesc}
- 특징: ${ko.traits.join(' / ')}
- 시그니처: ${ko.signature}
- 피할 것: ${en?.avoidTip || ''}
- 더 살릴 것: ${en?.boostTip || ''}

${lang === 'ko' ? `쓸 것 — 문단 4개. 각 문단 150~250자. 이 유형에만 해당하는 내용이어야 한다.
1) 이 유형이 **왜** 그런 메이크업을 고르는가 — 성향과 선택의 연결.
2) 시그니처 룩을 실제로 구현하는 순서 — 베이스→눈→입술→볼, 제품 종류와 요령을 구체적으로.
3) 이 유형이 자주 하는 **실수**와 그 대신 할 것. 정직하게.
4) 상황별 변주 — 데일리와 중요한 자리에서 무엇을 바꾸는가.

⚠️ 다른 15개 유형에도 그대로 통하는 일반론(예: "본인에게 어울리는 색을 찾으세요")은 쓰지 말 것.
   문단마다 ${ko.code} 만의 구체가 있어야 한다.`
  : `Write FOUR paragraphs, 150-250 characters each, specific to this type only.
1) WHY this type gravitates to this makeup — connect the personality to the choice.
2) How to actually build the signature look, in order: base → eyes → lips → cheeks. Be concrete about product types and technique.
3) The mistake this type most often makes, and what to do instead. Be honest.
4) How the look shifts between an everyday face and a high-stakes one.

⚠️ Nothing generic. If a sentence would be equally true of the other 15 types, cut it.`}

출력 — JSON 하나만, \`\`\`json 코드블록으로:
{
  "detailParagraphs": ["문단1", "문단2", "문단3", "문단4"]${lang === 'en' ? ',\n  "hashtags": ["#ESTJMakeup", "#...", "#...", "#..."]   // 4개, 영어, 이 유형의 무드를 담은 것' : ''}
}`

async function gemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 4096, temperature: 0.8 },
    }),
  })
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 160)}`)
  const txt = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text || ''
  const m = txt.match(/```json\s*([\s\S]*?)```/)
  if (!m) throw new Error('JSON 블록 없음')
  return JSON.parse(m[1])
}

const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
const arrBlock = (key, vals, indent = '    ') =>
  `${indent}${key}: [\n` + vals.map((v) => `${indent}  ${q(v)},`).join('\n') + `\n${indent}],`

// ── KO ──
const koTypes = parseKo()
const enTypes = parseEn()
const enBy = Object.fromEntries(enTypes.map((e) => [e.code, e]))

let koSrc = readFileSync(KO_FILE, 'utf8')
let enSrc = readFileSync(EN_FILE, 'utf8')

for (const ko of koTypes) {
  if (ONLY && ko.code !== ONLY) continue
  const en = enBy[ko.code]

  // KO: detailParagraphs 가 3문단 미만이면 다시 쓴다.
  if (ko.detailParagraphs.length < 3) {
    try {
      const r = DRY ? { detailParagraphs: ['(dry)'] } : await gemini(PROMPT(ko, en, 'ko'))
      const paras = (r.detailParagraphs || []).filter((p) => p && p.length > 40)
      if (paras.length < 3) throw new Error(`문단 부족(${paras.length})`)
      if (!DRY) koSrc = koSrc.replace(ko.dpRaw, arrBlock('detailParagraphs', paras) + '\n')  // dpRaw 가 들여쓰기까지 포함하므로 그대로 치환된다
      console.log(`  ✅ KO ${ko.code}: ${ko.detailParagraphs.length}문단 → ${paras.length}문단 (${paras.reduce((a, p) => a + p.length, 0)}자)`)
    } catch (e) { console.error(`  ❌ KO ${ko.code}: ${e.message}`) }
  } else {
    console.log(`  – KO ${ko.code}: 이미 ${ko.detailParagraphs.length}문단 — 건너뜀`)
  }

  // EN: detailParagraphs + hashtags 가 없으면 채운다.
  if (en && !en.hasBody) {
    try {
      const r = DRY ? { detailParagraphs: ['(dry)'], hashtags: ['#x'] } : await gemini(PROMPT(ko, en, 'en'))
      const paras = (r.detailParagraphs || []).filter((p) => p && p.length > 40)
      const tags = (r.hashtags || []).filter(Boolean).slice(0, 4)
      if (paras.length < 3) throw new Error(`문단 부족(${paras.length})`)
      if (!tags.length) throw new Error('hashtags 없음')
      if (!DRY) {
        // shortDesc 바로 뒤에 끼워 넣는다.
        const anchor = en.chunk.match(/^ {4}traits: \[/m)
        if (!anchor) throw new Error('traits 앵커 없음')
        const at = en.chunk.indexOf(anchor[0])
        const next = en.chunk.slice(0, at)
          + arrBlock('detailParagraphs', paras) + '\n'
          + arrBlock('hashtags', tags) + '\n'
          + en.chunk.slice(at)
        enSrc = enSrc.replace(en.chunk, next)
      }
      console.log(`  ✅ EN ${ko.code}: ${paras.length}문단 (${paras.reduce((a, p) => a + p.length, 0)}자) + 해시태그 ${tags.length}개`)
    } catch (e) { console.error(`  ❌ EN ${ko.code}: ${e.message}`) }
  } else if (en) {
    console.log(`  – EN ${ko.code}: 이미 본문 있음 — 건너뜀`)
  }
}

if (!DRY) {
  writeFileSync(KO_FILE, koSrc)
  writeFileSync(EN_FILE, enSrc)
}
console.log('\n완료. `npx tsc --noEmit && npm run build` 로 검증할 것.')
