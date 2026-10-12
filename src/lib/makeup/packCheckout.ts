// 크레딧 팩 결제 시작 — 충전 화면(MakeupTopUp)과 9룩 컬렉션(MakeupCollection) 공용.
// ────────────────────────────────────────────────────────────────────
// /api/checkout(pack) → Polar 호스티드 체크아웃으로 풀페이지 이동.
// 앱(Expo 웹뷰)에서는 시스템 브라우저로 넘긴다(Play 정책: 웹뷰 안 결제 = 앱 내 디지털상품).
// 충전 자체는 서버 웹훅(polar-webhook.ts/chargeCredits) 몫이다.
import { supabase } from '../supabase'
import { isNativeApp, nativeOpenExternal } from '../nativePicker'
import { rememberPendingPack } from '../purchaseTracking'

function gtagEvent(name: string, params?: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

export interface CheckoutPack { id: 'starter' | 'plus' | 'collection'; credits: number; value: number }

/**
 * 'redirect' = 결제창으로 이동 중(이 페이지는 곧 떠난다) · 'external' = 앱이 브라우저로 넘김
 * (돌아오면 잔액을 다시 읽을 것) · 'login' = 로그인 화면으로 보냄 · 'error' = 시작 실패
 */
export type CheckoutOutcome = 'redirect' | 'external' | 'login' | 'error'

export async function startPackCheckout(pack: CheckoutPack): Promise<CheckoutOutcome> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) { window.location.href = '/auth'; return 'login' }

    gtagEvent('begin_checkout', { checkout_type: 'credit', pack: pack.id, value: pack.value, currency: 'USD' })

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pack: pack.id, redirect: true, email: session?.user?.email }),
    })
    if (res.status === 401) { window.location.href = '/auth'; return 'login' }
    const d = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
    if (!res.ok || !d.url) return 'error'

    // 복귀(/analysis/?checkout_id=) 때 GA4 purchase 에 팩 정보를 싣기 위해 적어 둔다.
    rememberPendingPack({ id: pack.id, credits: pack.credits, value: pack.value })

    // 앱이면 시스템 브라우저로. 브릿지가 없는 옛 APK 는 false 가 오므로
    // 그때는 기존대로 웹뷰 안에서 진행한다(결제가 아예 막히는 것보다 낫다).
    if (isNativeApp()) {
      gtagEvent('checkout_redirect', { checkout_type: 'credit', pack: pack.id, checkout_method: 'external_browser' })
      if (await nativeOpenExternal(d.url)) return 'external'
    }

    window.location.href = d.url // Polar 호스티드 체크아웃으로 이동
    return 'redirect'
  } catch {
    return 'error'
  }
}
