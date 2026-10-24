// 럭키 메이크업 가격 안내 — 화면 문구 단일 소스 (2026-10-22, 10/24 장수 표기로)
// ────────────────────────────────────────────────────────────────────
// 운영자 10/24: "$2.99 = 1장?"으로 읽혔다 → 크레딧 말을 빼고 **장수로만** 보여 준다.
//   첫 장 무료(가입 무료권) → 5장 $2.99 → 9가지 운 전부 9장 $4.99. 크레딧은 결제 화면에서만.
// 실제 금액·크레딧 수는 functions/api/_packs.ts(CREDIT_PACKS)가 정본 — 여기 숫자를 바꾸면 그쪽도 확인.
//   1장 = 크레딧 1개 · starter 5개 $2.99 · collection 9개 $4.99
export const LUCKY_PRICE = {
  single: { credits: 1 },
  starter: { credits: 5, usd: 2.99 },
  nine: { credits: 9, usd: 4.99 },
  lineKo: '첫 장 무료 · 5장 $2.99 · 9가지 운 전부 9장 $4.99',
  lineEn: 'First look free · 5 looks $2.99 · all 9 lucks $4.99',
} as const
