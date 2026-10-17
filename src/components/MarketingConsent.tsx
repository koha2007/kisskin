// 광고성 정보(주간 K-뷰티 메일) 수신 동의 — 2026-10-17.
// ────────────────────────────────────────────────────────────────────
// 정보통신망법 제50조: 광고성 메일은 **명시적 사전 동의**가 있어야 보낼 수 있다. 무료 회원가입은
// '대가를 치른 거래관계' 예외가 아니라서 회원이라는 이유만으로 보낼 수 없다(KISA 안내서).
// 동의 요청 메일을 보내는 것도 광고 전송으로 보므로, 동의는 사이트 안에서만 받는다.
//
// 저장: Supabase user_metadata.marketing_consent(true/false) + marketing_consent_at.
// announce-products.ts 는 marketing_consent === true 인 회원에게만 보낸다.
//
//   variant="prompt"  — 아직 고르지 않은 회원에게만 뜨는 카드(결정하면 사라짐)
//   variant="setting" — 마이페이지: 현재 상태 + 켜기/끄기
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Consent = boolean | null // null = 아직 안 고름

export default function MarketingConsent({ isEn, variant }: { isEn: boolean; variant: 'prompt' | 'setting' }) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [consent, setConsent] = useState<Consent>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      const u = data.session?.user
      setLoggedIn(!!u)
      const v = u?.user_metadata?.marketing_consent
      setConsent(typeof v === 'boolean' ? v : null)
    }).catch(() => { /* 비로그인 취급 */ })
    return () => { cancelled = true }
  }, [])

  const save = async (v: boolean) => {
    setBusy(true)
    const { error } = await supabase.auth.updateUser({
      data: { marketing_consent: v, marketing_consent_at: new Date().toISOString() },
    })
    setBusy(false)
    if (!error) { setConsent(v); setDone(true) }
  }

  if (!loggedIn) return null
  if (variant === 'prompt' && consent !== null && !done) return null
  if (variant === 'prompt' && done) {
    return (
      <p className="mt-4 text-center text-xs text-white/70">
        {consent
          ? (isEn ? 'Done — the weekly K-beauty letter will start on Sunday.' : '신청 완료 — 일요일마다 K-뷰티 메일을 보내 드려요.')
          : (isEn ? 'Got it — no letters.' : '알겠어요. 메일은 보내지 않을게요.')}
      </p>
    )
  }

  const title = isEn ? 'Weekly K-beauty letter' : '주간 K-뷰티 메일'
  const desc = isEn
    ? 'New K-beauty products, news and one makeup how-to, every Sunday. Includes promotional content; unsubscribe anytime.'
    : '일요일마다 신제품·뉴스·이번 주 메이크업 방법 한 가지. 광고성 정보가 포함되며 언제든 끊을 수 있어요.'

  if (variant === 'setting') {
    return (
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-navy">{title} {isEn ? '(optional)' : '(선택)'}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 break-keep">{desc}</p>
        </div>
        <button
          disabled={busy}
          onClick={() => save(!consent)}
          role="switch"
          aria-checked={!!consent}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${consent ? 'bg-navy text-white' : 'border border-navy/25 text-navy'}`}
        >
          {consent ? (isEn ? 'On' : '받는 중') : (isEn ? 'Off' : '받지 않음')}
        </button>
      </div>
    )
  }

  // prompt — 어두운 메이크업 결과 화면 위에 얹힌다
  return (
    <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4 text-left">
      <p className="text-sm font-bold text-white">{title} {isEn ? '(optional)' : '(선택)'}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/70 break-keep">{desc}</p>
      <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={() => save(true)} className="flex-1 rounded-full bg-white px-4 py-2 text-xs font-bold text-navy">
          {isEn ? 'Yes, send it' : '받을게요'}
        </button>
        <button disabled={busy} onClick={() => save(false)} className="flex-1 rounded-full border border-white/25 px-4 py-2 text-xs font-bold text-white/80">
          {isEn ? 'No thanks' : '괜찮아요'}
        </button>
      </div>
    </div>
  )
}
