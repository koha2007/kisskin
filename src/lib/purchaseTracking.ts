// GA4 `purchase` 추적 — 크레딧 충전(MakeupTopUp → Polar 호스티드 → /analysis/?checkout_id=) 복귀 처리.
//
// 2026-09-30 — 라이브 결제 경로가 `purchase` 를 한 번도 쏘지 않고 있었다.
//   `purchase` 는 죽은 코드 AnalysisApp.tsx 에만 있었고, 지금 /analysis/ 에 뜨는 MakeupFlow 는
//   `checkout_id` 를 읽지 않았다. 그래서 결제가 있어도 GA4 매출은 $0 으로 남는다(9월은 실제로도
//   Polar 주문 0건이라 어긋남은 없었다). 이 파일이 그 복귀 처리를 맡는다.
import { isInternalTraffic, isInternalEmail, markInternalIfFamily } from './internalTraffic'

const PENDING_KEY = 'kisskin_pending_pack'
const FIRED_KEY = 'kisskin_purchased'

export interface PendingPack { id: string; credits: number; value: number }

function gtagEvent(name: string, params?: Record<string, unknown>) {
  // 가족·운영자 기기는 대시보드에서 뺀다.
  if (isInternalTraffic()) return
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

// Fire GA4 `purchase` at most once per Polar checkout id. The embedded-checkout
// success/confirmed callback and the mobile redirect-return path can both resolve
// for a single payment with the SAME checkout id (success_url uses {CHECKOUT_ID},
// which equals the embed's checkout id), which would otherwise double-count revenue:
// GA4 sums event-level revenue but dedupes transactions by transaction_id.
// localStorage persists across the redirect/reload, unlike a module-level flag.
// Also drops family/operator purchases — Polar returns the checkout customerEmail,
// which lets us catch family devices that paid before logging in (so the
// markInternalIfFamily login-hook never ran). Polar dashboard is untouched.
export function firePurchaseOnce(transactionId: string, params: Record<string, unknown>, customerEmail?: string | null) {
  if (!transactionId) return
  if (isInternalEmail(customerEmail)) { markInternalIfFamily(customerEmail); return }
  try {
    const fired: string[] = JSON.parse(localStorage.getItem(FIRED_KEY) || '[]')
    if (fired.includes(transactionId)) return
    localStorage.setItem(FIRED_KEY, JSON.stringify([...fired, transactionId].slice(-20)))
  } catch { /* localStorage blocked — fire once rather than drop the conversion */ }
  gtagEvent('purchase', { transaction_id: transactionId, ...params })
}

/** Polar 로 넘기기 직전에 고른 팩을 적어 둔다(복귀 시 item 이름·크레딧 수용). */
export function rememberPendingPack(pack: PendingPack) {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(pack)) } catch { /* 없으면 금액만으로 보낸다 */ }
}

/**
 * /analysis/?checkout_id=… 로 돌아왔으면 결제를 서버에서 확인하고 `purchase` 를 1회 쏜다.
 * 금액은 Polar 가 돌려준 실제 결제액(할인 반영) — 100% 할인코드 테스트는 value 0 으로 들어간다.
 * 앱에서 시스템 브라우저로 결제한 경우엔 sessionStorage 가 비어 있어도 금액만으로 보낸다.
 */
export async function trackCheckoutReturn(): Promise<void> {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const checkoutId = params.get('checkout_id')
  if (!checkoutId) return
  // 새로고침·공유로 같은 주소가 다시 처리되지 않게 쿼리에서 걷어낸다(다른 쿼리는 유지).
  params.delete('checkout_id')
  const qs = params.toString()
  window.history.replaceState(window.history.state, '', window.location.pathname + (qs ? '?' + qs : ''))

  let pack: PendingPack | null = null
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    if (raw) pack = JSON.parse(raw) as PendingPack
    sessionStorage.removeItem(PENDING_KEY)
  } catch { /* 없으면 금액만 */ }

  try {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutId }),
    })
    const r = (await res.json().catch(() => ({}))) as { status?: string; amount?: number; currency?: string; customerEmail?: string | null }
    if (!res.ok) throw new Error(`verify ${res.status}`)
    if (r.status !== 'succeeded' && r.status !== 'confirmed') {
      gtagEvent('checkout_abandoned', { checkout_type: 'credit', pack: pack?.id, transaction_id: checkoutId, status: r.status || 'unknown' })
      return
    }
    const value = typeof r.amount === 'number' ? r.amount / 100 : (pack?.value ?? 0)
    const itemId = pack ? `credit_${pack.id}` : 'credit_pack'
    firePurchaseOnce(checkoutId, {
      value,
      currency: (r.currency || 'usd').toUpperCase(),
      checkout_type: 'credit',
      checkout_method: 'redirect',
      pack: pack?.id,
      items: [{ item_id: itemId, item_name: pack ? `AI Makeup credits x${pack.credits}` : 'AI Makeup credits', price: value, quantity: 1 }],
    }, r.customerEmail)
  } catch (err) {
    gtagEvent('checkout_error', { checkout_type: 'credit', stage: 'return_verify', reason: err instanceof Error ? err.message.slice(0, 100) : 'unknown' })
  }
}
