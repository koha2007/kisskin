#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 퍼스널컬러 4개 타입의 **한국어** detailParagraphs 복원.
// ────────────────────────────────────────────────────────────────────
// 왜: 2026-05-06 "도구 결과 -30,000자 트리밍" 때 한국어 본문만 1문단(~130자)으로 깎였다.
//     영문(detailParagraphsEn)은 5문단(~1,550자)이 온전히 남아 있다.
//     → 새로 지어내지 말고 **영문을 한국어로 옮긴다**(근거가 확실하고 내용이 일치한다).
//
// 멱등: KO 가 이미 3문단 이상이면 건너뛴다.
// 사용: GEMINI_API_KEY=... node scripts/backfill-pc-ko-body.mjs [--dry]
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const FILE = resolve('src/lib/personal-color/types.ts')
const DRY = process.argv.includes('--dry')
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey && !DRY) { console.error('GEMINI_API_KEY 없음 — 중단'); process.exit(1) }

const strs = (s) => [...s.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1])
const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
const arrBlock = (key, vals) =>
  `    ${key}: [\n` + vals.map((v) => `      ${q(v)},`).join('\n') + `\n    ],`

let src = readFileSync(FILE, 'utf8')

for (const code of ['spring', 'summer', 'autumn', 'winter']) {
  const i = src.indexOf(`  ${code}: {`)
  const j = src.indexOf('\n  },', i)
  const chunk = src.slice(i, j)

  const koM = chunk.match(/^ {4}detailParagraphs: \[[\s\S]*?\n {4}\],/m)
  const enM = chunk.match(/^ {4}detailParagraphsEn: \[[\s\S]*?\n {4}\],/m)
  if (!koM || !enM) { console.error(`  ❌ ${code}: 블록을 못 찾음`); continue }

  const ko = strs(koM[0])
  const en = strs(enM[0])
  if (ko.length >= 3) { console.log(`  – ${code}: 이미 ${ko.length}문단 — 건너뜀`); continue }

  try {
    const prompt = `아래는 우리 퍼스널컬러 진단 도구의 "${code}" 타입 상세 본문(영문 원본)이다.
이걸 **자연스러운 한국어**로 옮겨라. K-뷰티 에디터의 어조로, 직역투를 쓰지 말 것.

규칙:
- 문단 수와 순서를 그대로 유지한다(${en.length}문단).
- **사실을 바꾸거나 추가하지 말 것.** 컬러명·계절명·제품 카테고리는 원문 그대로.
- 한국 독자에게 익숙한 표기를 쓴다(예: Spring Warm → 봄 웜톤).

영문 원본:
${en.map((p, k) => `${k + 1}) ${p}`).join('\n\n')}

출력 — JSON 하나만, \`\`\`json 코드블록으로:
{ "detailParagraphs": [${en.map((_, k) => `"문단${k + 1}"`).join(', ')}] }`

    if (DRY) { console.log(`  (dry) ${code}: EN ${en.length}문단 → KO 번역 예정`); continue }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 4096, temperature: 0.5 },
      }),
    })
    if (!res.ok) throw new Error(`gemini ${res.status}`)
    const txt = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text || ''
    const m = txt.match(/```json\s*([\s\S]*?)```/)
    if (!m) throw new Error('JSON 블록 없음')
    const paras = (JSON.parse(m[1]).detailParagraphs || []).filter((p) => p && p.length > 40)
    if (paras.length < 3) throw new Error(`문단 부족(${paras.length})`)

    src = src.replace(koM[0], arrBlock('detailParagraphs', paras))
    console.log(`  ✅ ${code}: 1문단 → ${paras.length}문단 (${paras.reduce((a, p) => a + p.length, 0)}자)`)
  } catch (e) {
    console.error(`  ❌ ${code}: ${e.message}`)
  }
}

if (!DRY) writeFileSync(FILE, src)
console.log('\n완료. `npx tsc -b && npm run build` 로 검증할 것.')
