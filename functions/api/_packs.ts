// ════════════════════════════════════════════════════════════════════
// 크레딧 팩 단일 소스 (Polar Product ID ↔ 크레딧 수) · FREE_PIVOT_PLAN P1-5 4단계
// ────────────────────────────────────────────────────────────────────
// checkout.ts(결제 생성)와 polar-webhook.ts(충전)가 공유한다 → 한 곳만 고치면 양쪽 반영.
//
// ⚠ 여기 Product ID 는 Polar 대시보드의 "Makeup Credits" 일회성 상품 2종 전용.
//   기존 $2.99 분석 one-time(checkout.ts/ONE_TIME_PRODUCT_ID)·Early Member 구독과는
//   완전히 별개 상품이다(절대 그쪽 ID 를 여기 넣지 말 것).
// ════════════════════════════════════════════════════════════════════

export type PackId = 'starter' | 'plus'

export interface CreditPack {
  id: string // Polar Product ID (UUID)
  credits: number // 충전 크레딧 수
  price: number // USD (표시·참고용)
}

export const CREDIT_PACKS: Record<PackId, CreditPack> = {
  starter: { id: '19f49fb0-31f4-4a0f-b967-ab6d02a8f949', credits: 5, price: 2.99 },
  plus: { id: 'a3c74cb9-1a1f-4326-a176-1d2c4cab6ff7', credits: 15, price: 6.99 },
}

export function isPackId(v: unknown): v is PackId {
  return v === 'starter' || v === 'plus'
}

/**
 * Polar Product ID → 충전할 크레딧 수.
 * 크레딧 상품이 아니면 null (기존 분석 one-time·구독 주문은 충전 대상 아님).
 */
export function creditsForProduct(productId: string | null | undefined): number | null {
  if (!productId) return null
  for (const p of Object.values(CREDIT_PACKS)) {
    if (p.id === productId) return p.credits
  }
  return null
}
