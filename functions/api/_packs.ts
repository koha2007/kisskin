// ════════════════════════════════════════════════════════════════════
// 크레딧 팩 단일 소스 (Polar Product ID ↔ 크레딧 수) · FREE_PIVOT_PLAN P1-5 4단계
// ────────────────────────────────────────────────────────────────────
// checkout.ts(결제 생성)와 polar-webhook.ts(충전)가 공유한다 → 한 곳만 고치면 양쪽 반영.
//
// ⚠ 여기 Product ID 는 Polar 대시보드의 "Makeup Credits" 일회성 상품 2종 전용.
//   기존 $2.99 분석 one-time(checkout.ts/ONE_TIME_PRODUCT_ID)·Early Member 구독과는
//   완전히 별개 상품이다(절대 그쪽 ID 를 여기 넣지 말 것).
// ════════════════════════════════════════════════════════════════════

export type PackId = 'starter' | 'plus' | 'collection' | 'first'

export interface CreditPack {
  id: string // Polar Product ID (UUID)
  credits: number // 충전 크레딧 수
  price: number // USD (표시·참고용)
}

export const CREDIT_PACKS: Record<PackId, CreditPack> = {
  starter: { id: '19f49fb0-31f4-4a0f-b967-ab6d02a8f949', credits: 5, price: 2.99 },
  plus: { id: 'a3c74cb9-1a1f-4326-a176-1d2c4cab6ff7', credits: 15, price: 6.99 },
  // 9룩 컬렉션(2026-10-12) — 셀카 한 장으로 9룩 전부 + 3×3 모아보기. 크레딧 9개 충전 후
  // 클라이언트(MakeupCollection)가 9룩을 자동 생성한다. 컬렉션 생성은 무료 1회를 쓰지 않는다
  // (makeup-edit `collection: true`) — 무료로 찍은 셀카와 섞이면 모아보기 얼굴·옷·배경이 달라진다.
  // ⚠ id 가 비어 있으면 결제를 열지 않는다(checkout.ts). Polar 상품을 만든 뒤 여기에 넣을 것.
  collection: { id: '46e0ad9c-2e74-4d94-bd8f-d79fc322d25e', credits: 9, price: 4.99 },
  // 첫 결제 한정 $0.99 · 1크레딧(2026-10-21 운영자 결정) — 상시 상품 X, 계정당 1회.
  //   목적 = 첫 결제의 문턱 낮추기(결제자 0명). 수수료(4%+$0.40, 해외카드 +1.5%) 빼면 실수령 ≈ $0.54.
  //   자격(계정에 충전 이력 0)은 checkout.ts 가 검사. ⚠ id 가 비어 있으면 화면에 안 뜨고 결제도 안 열린다
  //   → Polar 대시보드에서 상품을 만든 뒤 여기에 넣을 것(현재 토큰엔 상품 생성 권한이 없다).
  first: { id: '', credits: 1, price: 0.99 },
}

export function isPackId(v: unknown): v is PackId {
  return v === 'starter' || v === 'plus' || v === 'collection' || v === 'first'
}

/**
 * Polar Product ID → 충전할 크레딧 수.
 * 크레딧 상품이 아니면 null (기존 분석 one-time·구독 주문은 충전 대상 아님).
 */
export function creditsForProduct(productId: string | null | undefined): number | null {
  if (!productId) return null
  for (const p of Object.values(CREDIT_PACKS)) {
    if (p.id && p.id === productId) return p.credits
  }
  return null
}
