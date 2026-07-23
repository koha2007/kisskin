// AI 메이크업 — 크레딧 충전(팩 선택) 화면 (FREE_PIVOT_PLAN P1-5 4단계)
// ────────────────────────────────────────────────────────────────────
// 무료 소진 → 로그인 → 여기서 Starter/Plus 선택 → /api/checkout(pack) 호출 →
//   Polar 호스티드 체크아웃으로 풀페이지 이동(success_url=/analysis/ 복귀).
// 결제 성공 시 충전은 서버 웹훅(polar-webhook.ts/chargeCredits)이 처리한다.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getCreditBalance } from '../../lib/credits'

const NAVY = '#070953'
const PRIMARY = '#eb4763'
const screenBg = { background: `linear-gradient(160deg, ${NAVY} 0%, #1a1268 45%, ${PRIMARY} 125%)` }

function gtagEvent(name: string, params?: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

type PackId = 'starter' | 'plus'
interface Pack { id: PackId; credits: number; price: string; value: number; popular?: boolean }

const PACKS: Pack[] = [
  { id: 'starter', credits: 5, price: '$2.99', value: 2.99 },
  { id: 'plus', credits: 15, price: '$6.99', value: 6.99, popular: true },
]

export default function MakeupTopUp({ isEn, onBack }: { isEn: boolean; onBack: () => void }) {
  const [balance, setBalance] = useState<number | null>(null)
  const [busy, setBusy] = useState<PackId | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    getCreditBalance().then(setBalance).catch(() => setBalance(0))
  }, [])

  async function buy(pack: Pack) {
    setErr(null); setBusy(pack.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) { window.location.href = '/auth'; return }

      gtagEvent('begin_checkout', { checkout_type: 'credit', pack: pack.id, value: pack.value, currency: 'USD' })

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pack: pack.id, redirect: true, email: session?.user?.email }),
      })
      if (res.status === 401) { window.location.href = '/auth'; return }
      const d = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !d.url) {
        setErr(isEn ? 'Could not start checkout. Please try again.' : '결제를 시작하지 못했어요. 다시 시도해 주세요.')
        setBusy(null); return
      }
      window.location.href = d.url // Polar 호스티드 체크아웃으로 이동
    } catch {
      setErr(isEn ? 'Something went wrong. Please try again.' : '문제가 생겼어요. 다시 시도해 주세요.')
      setBusy(null)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 font-display text-white px-6 py-10 text-center" style={screenBg}>
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold">{isEn ? 'Top up credits' : '크레딧 충전'}</h1>
        <p className="text-sm text-white/80 max-w-xs mx-auto">
          {balance != null && balance > 0
            ? (isEn
              ? 'Add more credits anytime to keep creating makeup looks.'
              : '크레딧을 추가로 충전하면 메이크업을 계속 만들 수 있어요.')
            : (isEn
              ? 'Your free tries are used up. Pick a pack to keep creating makeup looks.'
              : '무료 체험을 다 썼어요. 팩을 선택하면 메이크업을 계속 만들 수 있어요.')}
        </p>
        {balance != null && (
          <p className="text-xs text-white/55">
            {isEn ? `Current balance: ${balance} credit(s)` : `현재 잔액: ${balance} 크레딧`}
          </p>
        )}
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {PACKS.map((pack) => (
          <button
            key={pack.id}
            onClick={() => buy(pack)}
            disabled={busy != null}
            className="relative flex items-center justify-between rounded-2xl bg-white/10 border border-white/20 px-5 py-4 text-left active:scale-[0.98] transition disabled:opacity-60"
          >
            {pack.popular && (
              <span
                className="absolute -top-2 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white"
                style={{ background: PRIMARY }}
              >
                {isEn ? 'Popular' : '인기'}
              </span>
            )}
            <div>
              <div className="text-base font-extrabold">
                {pack.credits} {isEn ? 'credits' : '크레딧'}
              </div>
              <div className="text-xs text-white/60">
                {isEn
                  ? `${pack.credits} makeup looks`
                  : `메이크업 ${pack.credits}회`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold">{pack.price}</div>
              {busy === pack.id && (
                <div className="text-[11px] text-white/70">{isEn ? 'Opening…' : '이동 중…'}</div>
              )}
            </div>
          </button>
        ))}
      </div>

      {err && <p className="text-xs text-red-200 max-w-xs">{err}</p>}

      <div className="flex flex-col items-center gap-3">
        <p className="text-[11px] text-white/50 max-w-xs">
          {isEn
            ? 'Secure checkout via Polar. 7-day refund guarantee.'
            : 'Polar 안전 결제 · 7일 환불 보장.'}
        </p>
        <button
          onClick={onBack}
          disabled={busy != null}
          className="text-xs text-white/60 underline underline-offset-2 disabled:opacity-50"
        >
          {isEn ? 'Back' : '뒤로'}
        </button>
      </div>
    </div>
  )
}
