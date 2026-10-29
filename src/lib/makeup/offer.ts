// AI 메이크업 무료·가격 안내 — 화면 문구 단일 소스 (2026-10-28 문구 통일)
// ────────────────────────────────────────────────────────────────────
// 실제 값의 정본은 서버다 — 여기 숫자를 바꾸면 그쪽도 확인할 것.
//   • 무료: functions/api/_freeUsage.ts FREE_LIMITS.makeup (가입 회원 1룩, 로그인 필요, 9룩 묶음엔 안 씀)
//   • 1룩 = 1크레딧: functions/api/makeup-edit.ts deductCredits(…, 1, …)
//   • 팩: functions/api/_packs.ts CREDIT_PACKS (starter 5개 $2.99 · collection 9개 $4.99)
//   • 9룩 소요: MakeupCollection 진행 화면 "2~3분"
export const MAKEUP_OFFER = {
  freeLooks: 1,
  creditsPerLook: 1,
  starter: { credits: 5, usd: 2.99 },
  collection: { credits: 9, usd: 4.99 },
  freeKo: '회원가입하면 첫 1룩 무료 · 카드 등록 없음',
  freeEn: 'Sign up and get your first look free · No card needed',
  priceKo: '1룩 = 크레딧 1개 · 크레딧 5개 $2.99부터 · 9룩 전부 $4.99',
  priceEn: '1 look = 1 credit · Credits from $2.99 (5 credits) · All 9 looks $4.99',
  timeKo: '약 2~3분이면 9룩 완성',
  timeEn: 'All 9 looks in about 2–3 minutes',
} as const
