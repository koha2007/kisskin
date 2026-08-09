#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 이 키로 실제 쓸 수 있는 모델이 뭔지 찍는다. 토큰을 안 쓰는 메타데이터
// 호출이라 과금 없음.
//
// 왜 있나: 2026-08-09, 새 프로젝트에서 발급한 키가 `gemini-2.5-flash` 로
// 404 를 맞았다 — "This model is no longer available to new users".
// 키는 멀쩡했고 결제 문제도 아니었는데, 로그에는 404 만 찍혀서 원인을 잡는 데
// 왕복이 한 번 더 들었다. 사용 가능 목록이 로그에 있었으면 즉시 끝났을 일이다.
//
// ⚠️ 한계 두 가지. 이 목록만 믿으면 안 된다:
//   ① 여기 있어도 generateContent 가 404 를 낼 수 있다 — 실제로 `gemini-2.5-flash` 는
//      목록에 뜨면서 호출은 "no longer available to new users" 로 거부됐다.
//   ② 쿼터는 안 보인다. 목록에 있고 호출도 되지만 무료 티어 쿼터가 0 이라 429 가 날 수 있다
//      (3.x 계열이 그렇다). 그래서 실제 모델 선택은 _geminiText.mjs 가 호출해 보며 정한다.
// 그래도 "이 키가 어느 세대까지 보는가" 를 로그에 남겨두면 원인 추적이 훨씬 빠르다.
//
// 실패해도 발행을 막지 않는다(워크플로에서 continue-on-error).
// ════════════════════════════════════════════════════════════════════
import { TEXT_CANDIDATES } from './_geminiText.mjs'
import { IMAGE_MODEL } from './_geminiImage.mjs'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('GEMINI_API_KEY 없음 — 점검 생략')
  process.exit(1)
}

// 우리가 실제로 시도하는 모델들(단일 소스에서 가져온다).
const WANTED = [...TEXT_CANDIDATES, IMAGE_MODEL]

const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
  headers: { 'x-goog-api-key': apiKey },
})
if (!res.ok) {
  console.error(`모델 목록 조회 실패 ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`)
  console.error('  403 = 결제/키 정지 · 400·401 = 키 오류 · 그 외는 일시 장애')
  process.exit(1)
}

const { models = [] } = await res.json()
const usable = new Set(
  models
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => (m.name || '').replace(/^models\//, '')),
)

console.log(`이 키로 generateContent 가능한 모델 ${usable.size}개:`)
for (const n of [...usable].sort()) console.log(`  · ${n}`)

console.log('\n우리가 쓰는 모델 확인:')
let missing = 0
for (const w of [...new Set(WANTED)]) {
  const ok = usable.has(w)
  if (!ok) missing++
  console.log(`  ${ok ? '✅' : '❌'} ${w}`)
}
if (missing) {
  console.log(`\n⚠️ ${missing}개 모델을 이 키로 못 쓴다. 위 목록에서 대체 모델을 골라`)
  console.log('   GEMINI_NEWS_MODEL / GEMINI_PRODUCT_MODEL / GEMINI_IMAGE_MODEL 로 지정하거나')
  console.log('   스크립트 기본값을 바꿀 것. 배경은 리포 루트 GEMINI_HOLD.md')
}
