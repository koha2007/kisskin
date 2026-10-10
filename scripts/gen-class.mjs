#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 메이크업 클래스 주간 자동 발행 — 커리큘럼(src/lib/class/curriculum.ts) 순서대로 다음 한 편
// ────────────────────────────────────────────────────────────────────
// 2026-10-10 운영자 요청: 뉴스·제품처럼 주 1회 자동으로, 완전 기초부터 단계별로.
// weekly-content.yml(화 06:00 KST)이 부른다.
//
// 흐름:
//   1) lessons.json 에 아직 없는 첫 커리큘럼 편을 고른다(36편 다 나가면 아무것도 안 하고 끝)
//   2) 텍스트 모델(_geminiText.mjs — Gemini 막히면 OpenAI)로 KO+EN 본문 JSON 한 번에 생성
//   3) 검증(형식·부위·검색어 규칙·효능 표현 금지어) — 어기면 최대 3회 재생성
//   4) 페이스 차트 1장(_classChart.mjs, ≈$0.22) — 실패하면 발행 자체를 취소(차트 없는 편은 깨진다)
//   5) lessons.json 끝에 덧붙인다. 커밋·푸시·사이트맵·IndexNow 는 워크플로 몫.
//
// 안전장치:
//   · 같은 주 재실행 방지: 이번 주 화요일 이후 이미 나갔으면 건너뜀(CLASS_FORCE=1 로 무시).
//   · 문구 규칙은 9룩(src/lib/looks/howto.ts 상단)과 같다 — 화장품법 효능 표현 금지,
//     실존 인물 이름 금지, 제품은 브랜드가 아니라 "종류" 검색어.
//   · 사람 검수 없는 대량 발행은 구글 단속 대상 → 주 1편 고정. 여러 편을 한 번에 돌리지 말 것.
//
// 사용: node --experimental-strip-types scripts/gen-class.mjs
//   CLASS_DRY=1   → 생성·검증만 하고 파일을 쓰지 않음(차트도 안 만듦, 비용 = 텍스트 1회)
//   CLASS_FORCE=1 → 같은 주 재실행 방지 무시
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { callGeminiText } from './_geminiText.mjs'
import { makeClassChart } from './_classChart.mjs'

const LESSONS = resolve('src/lib/class/lessons.json')
const { CURRICULUM, CLASS_PARTS } = await import(pathToFileURL(resolve('src/lib/class/curriculum.ts')).href)

const DRY = process.env.CLASS_DRY === '1'
const lessons = JSON.parse(readFileSync(LESSONS, 'utf8'))
const done = new Set(lessons.map((l) => l.slug))
const item = CURRICULUM.find((c) => !done.has(c.slug))
if (!item) {
  console.log('[gen-class] 커리큘럼 36편 모두 발행됨 — 할 일 없음')
  process.exit(0)
}

const todayKst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)
// 같은 주 재실행 방지: 이번 주 화요일(KST, 발행 요일) 이후에 이미 한 편 나갔으면 건너뛴다.
// (예전 '6일 이내' 규칙은 10/10 첫 4편 뒤 10/13 정기 발행까지 막아 버렸다.)
const dow = new Date(`${todayKst}T00:00:00Z`).getUTCDay() // 0=일 … 2=화
const thisTuesday = new Date(Date.parse(`${todayKst}T00:00:00Z`) - ((dow - 2 + 7) % 7) * 86400000).toISOString().slice(0, 10)
const last = lessons.map((l) => l.publishedAt).sort().pop()
if (!DRY && process.env.CLASS_FORCE !== '1' && last && last >= thisTuesday) {
  console.log(`[gen-class] 이번 주(${thisTuesday}~) 이미 ${last} 에 발행 — 건너뜀(CLASS_FORCE=1 로 무시)`)
  process.exit(0)
}

const AREAS = ['skin', 'brows', 'eyes', 'cheeks', 'lips', 'hair']
const CROPS = ['eyeLid', 'eyeOuter', 'underEye', 'cheekTemple', 'cheekBlend', 'lipLine', 'jaw']
const part = CLASS_PARTS.find((p) => p.id === item.part)
const prevTitles = CURRICULUM.filter((c) => c.n < item.n).map((c) => `${c.n}. ${c.titleKo}`).join(' / ')
const nextTitles = CURRICULUM.filter((c) => c.n > item.n).map((c) => `${c.n}. ${c.titleKo}`).join(' / ')
const example = lessons[0]

const prompt = `You are a senior Korean makeup artist writing lesson ${item.n} of a free ${CURRICULUM.length}-lesson beginner makeup class for kissinskin.net (K-beauty site, Korean + global English readers).

LESSON
- n: ${item.n}  part: ${part.en} (${part.ko})
- Korean title: ${item.titleKo}
- English title: ${item.titleEn}
- Scope (follow it exactly): ${item.focus}
- Earlier lessons (don't re-teach, you may refer to them by number): ${prevTitles || '(none)'}
- Later lessons (don't cover these here — say "N편에서 다뤄요" / "lesson N" if needed): ${nextTitles || '(none)'}

WRITING RULES (must follow — legal review):
- Korean is the original; English is a natural rewrite for global readers, not a literal translation.
- Korean style: friendly 해요체, short sentences, concrete (amounts, directions, seconds). No hype, no emojis.
- NO efficacy claims (Korean cosmetics law): never say makeup or a product improves/treats/heals/whitens/soothes/removes wrinkles, acne, scars or pores. Only describe how it LOOKS ("가려 보여요", "매끈해 보여요", "looks smoother").
- NO real people: no celebrity, idol, influencer or brand names anywhere.
- Products are product TYPES, never brands. searchKeywords = Korean Coupang search, max 5 words, product attributes only (texture, color, type), never body positions or actions (no 광대, 볼 위, 사선, 둥글게, face-shape names). shopEn = 2-4 word English search.
- Safety: if the lesson involves eye area glitter/pencils near the waterline, cutting tools, or anything with a real safety note, put it in safetyKo/safetyEn; otherwise omit those keys.

STRUCTURE
- 3 to 6 steps. Each step: area ∈ ${JSON.stringify(AREAS)}; optional crop ∈ ${JSON.stringify(CROPS)} (a tighter close-up of the face chart: eyeLid=one eyelid, eyeOuter=outer eye corner, underEye=under one eye, cheekTemple=temple-to-cheek, cheekBlend=cheek color only, lipLine=lip outline, jaw=jawline). Use crops so consecutive steps on the same area don't show the same picture.
- swatches: 1-3 hex colors that represent the product shade for that step.
- tipsKo/tipsEn: exactly 2 each. mistakeKo/mistakeEn: one common beginner mistake and what it causes.
- minutes: realistic time. levelKo ∈ 쉬움|보통|도전 with matching levelEn ∈ Easy|Medium|Bold.
- chartPrompt: ENGLISH description of the makeup to paint on a blank pencil face chart (front-facing woman) so the steps are visible — colors, textures, exact placement. Paint ONLY on the face and neck; you may describe swatch stripes or product dots on the skin if that teaches the lesson. Never add hands, tools, products, objects, text, arrows or numbers.
- Korean fields must be pure Korean (no English words mixed into Korean sentences; T존·SPF·MLBB are fine).

Return ONLY a JSON object with exactly these keys (example of a finished lesson below — match its tone, length and shape, but write new content for THIS lesson):
${JSON.stringify({ ...example, slug: undefined, publishedAt: undefined }, null, 1)}`

// '주름에 끼어요'처럼 모양을 말하는 건 허용, '주름 개선'처럼 효과를 주장하는 것만 막는다.
const BANNED_KO = /(주름\s*(개선|완화|감소|을\s*없|이\s*없어|예방)|미백|치료|재생|진정\s*(시|효과|돼|되)|흉터\s*(제거|완화)|피부\s*개선|모공\s*(축소|을\s*줄|이\s*줄)|탄력\s*(개선|강화)|트러블\s*(완화|개선))/
const BANNED_EN = /\b(cure|treat|heal|whiten|anti-?aging|repair|shrink pores|reduce wrinkles)\w*/i
const BANNED_KW_TOKENS = new Set(['둥글게', '둥글', '사선', '세로', '가로', 'V자', '광대', '헤어라인', '콧등', '각진형', '둥근형', '긴형', '하트형', '계란형', '오벌형'])

function extractJson(text) {
  const m = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/)
  if (!m) throw new Error('JSON 블록 없음')
  return JSON.parse(m[1])
}

function validate(o) {
  const errs = []
  const str = (k) => typeof o[k] === 'string' && o[k].trim().length > 0
  for (const k of ['introKo', 'introEn', 'mistakeKo', 'mistakeEn', 'chartPrompt']) if (!str(k)) errs.push(`${k} 없음`)
  if (!(o.minutes > 0 && o.minutes <= 60)) errs.push('minutes')
  if (!['쉬움', '보통', '도전'].includes(o.levelKo) || !['Easy', 'Medium', 'Bold'].includes(o.levelEn)) errs.push('level')
  for (const k of ['tipsKo', 'tipsEn']) if (!Array.isArray(o[k]) || o[k].length < 1 || o[k].length > 3) errs.push(k)
  if (!Array.isArray(o.steps) || o.steps.length < 3 || o.steps.length > 6) errs.push('steps 개수')
  for (const [i, s] of (o.steps ?? []).entries()) {
    const at = `step${i + 1}`
    if (!AREAS.includes(s.area)) errs.push(`${at}.area=${s.area}`)
    if (s.crop != null && !CROPS.includes(s.crop) && !AREAS.includes(s.crop)) errs.push(`${at}.crop=${s.crop}`)
    for (const k of ['titleKo', 'titleEn', 'bodyKo', 'bodyEn', 'toolsKo', 'toolsEn', 'searchKeywords', 'shopEn'])
      if (typeof s[k] !== 'string' || !s[k].trim()) errs.push(`${at}.${k}`)
    if (!Array.isArray(s.swatches) || !s.swatches.length || s.swatches.some((h) => !/^#[0-9a-fA-F]{6}$/.test(h))) errs.push(`${at}.swatches`)
    const words = String(s.searchKeywords ?? '').trim().split(/\s+/)
    if (words.length > 5 || words.some((w) => BANNED_KW_TOKENS.has(w))) errs.push(`${at}.searchKeywords 규칙 위반: ${s.searchKeywords}`)
  }
  const join = (...xs) => xs.flat(3).filter((x) => typeof x === 'string').join('\n')
  const ko = join(o.introKo, o.tipsKo, o.mistakeKo, o.safetyKo, (o.steps ?? []).map((s) => [s.titleKo, s.bodyKo, s.toolsKo]))
  const en = join(o.introEn, o.tipsEn, o.mistakeEn, o.safetyEn, (o.steps ?? []).map((s) => [s.titleEn, s.bodyEn]))
  const bk = ko.match(BANNED_KO); if (bk) errs.push(`효능 표현(KO): ${bk[0]}`)
  // 한국어 문장에 영어 단어가 섞이면('uniform하게') 번역투 → 다시 쓰게 한다
  const latin = ko.replace(/\b(SPF|PA|MLBB|BB|CC|UV|K)\b/g, '').match(/[A-Za-z]{3,}/)
  if (latin) errs.push(`한국어 문장에 영어 단어: ${latin[0]}`)
  const be = en.match(BANNED_EN); if (be) errs.push(`효능 표현(EN): ${be[0]}`)
  return errs
}

const KEYS = ['introKo', 'introEn', 'minutes', 'levelKo', 'levelEn', 'steps', 'tipsKo', 'tipsEn', 'mistakeKo', 'mistakeEn', 'chartPrompt', 'safetyKo', 'safetyEn']
const STEP_KEYS = ['area', 'crop', 'titleKo', 'titleEn', 'bodyKo', 'bodyEn', 'toolsKo', 'toolsEn', 'swatches', 'searchKeywords', 'shopEn']
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] != null && o[k] !== '').map((k) => [k, o[k]]))

console.log(`[gen-class] ${item.n}편 「${item.titleKo}」 (${item.slug}) 생성`)
let body = null
let feedback = ''
// 503(일시 과부하)은 시도 횟수로 치지 않는다 — 검증 실패만 3회까지
let rejected = 0
for (let attempt = 1; attempt <= 8 && rejected < 3 && !body; attempt++) {
  let text
  try {
    text = await callGeminiText(process.env.GEMINI_API_KEY, prompt + feedback, { temperature: 0.5, maxOutputTokens: 6000, lowThinking: true })
  } catch (e) {
    // 503(일시 과부하)은 잠깐 기다리면 풀린다 — 이번 회차를 소모하고 다시 시도
    console.warn(`  ✗ ${attempt}회: ${String(e.message).slice(0, 120)} — 30초 뒤 재시도`)
    await new Promise((r) => setTimeout(r, 30000))
    continue
  }
  let o
  try { o = extractJson(text) } catch (e) { rejected++; console.warn(`  ✗ ${attempt}회: JSON 파싱 실패 — ${e.message}`); continue }
  const errs = validate(o)
  if (errs.length) {
    rejected++
    console.warn(`  ✗ ${attempt}회 검증 실패: ${errs.join(' · ')}`)
    feedback = `\n\nYOUR PREVIOUS ANSWER WAS REJECTED for: ${errs.join('; ')}. Fix these and return the full JSON again.`
    continue
  }
  body = { slug: item.slug, publishedAt: todayKst, ...pick(o, KEYS), steps: o.steps.map((s) => pick(s, STEP_KEYS)) }
}
if (!body) {
  console.error('[gen-class] 3회 모두 검증 실패 — 이번 주 발행 취소')
  process.exit(1)
}

// 교정 한 번 — 오타('자여분')·어색한 표현·번역투를 고친다. 결과가 검증을 못 넘으면 원본을 쓴다.
try {
  const fixedText = await callGeminiText(process.env.GEMINI_API_KEY,
    'You are a meticulous Korean and English copy editor for a beauty site. Fix typos, awkward or unnatural phrasing, ' +
    'and translationese in this lesson JSON. Keep the meaning, structure, keys, step order, colors and search keywords exactly. ' +
    'Do not add efficacy claims, brand names or people. Return ONLY the corrected JSON.\n\n' + JSON.stringify(body),
    { temperature: 0.2, maxOutputTokens: 6000, lowThinking: true })
  const fixed = extractJson(fixedText)
  const errs = validate(fixed)
  if (errs.length) console.warn(`  · 교정본 검증 실패(${errs.join(' · ')}) — 원본 사용`)
  else {
    body = { ...body, ...pick(fixed, KEYS), steps: fixed.steps.map((s, i) => ({ ...pick(s, STEP_KEYS), searchKeywords: body.steps[i]?.searchKeywords ?? s.searchKeywords })) }
    console.log('  · 교정 완료')
  }
} catch (e) {
  console.warn(`  · 교정 단계 건너뜀: ${String(e.message).slice(0, 120)}`)
}

if (DRY) {
  console.log(JSON.stringify(body, null, 2))
  console.log('[gen-class] CLASS_DRY=1 — 파일·차트 생성 안 함')
  process.exit(0)
}

const out = await makeClassChart(process.env.OPENAI_API_KEY, item.slug, body.chartPrompt)
console.log(`  · 차트 ${out}`)
lessons.push(body)
writeFileSync(LESSONS, JSON.stringify(lessons, null, 2) + '\n')
console.log(`[gen-class] ✅ ${item.n}편 발행 — /class/${item.slug}/ · /en/class/${item.slug}/`)
