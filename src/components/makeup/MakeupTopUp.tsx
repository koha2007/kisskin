// AI 메이크업 — 결제 화면(페이월) · 2026-10-28 결제 동선 새 디자인
// ────────────────────────────────────────────────────────────────────
// 왜 바꿨나(10/28 점검): 무료 1룩을 만든 21명 중 결제창을 연 사람 0명(10/8~10/28 Polar
//   checkout 0건). 예전 충전 화면은 "무료 체험을 다 썼어요" + 크레딧 팩 2줄이라
//   **사용자가 무엇을 얻는지**(=내 얼굴의 다음 룩)가 화면에 없었다.
// 원칙(벤치마크 — PhotoRoom·LookLab 류 "첫 결과 직후 페이월"):
//   1) 방금 만든 **내 결과**를 9칸 중 1칸에 넣어 "1/9 완성"을 보여 준다(값어치 = 나머지 8칸).
//   2) 추천안(9룩 $4.99)을 **미리 선택**, 하단 고정 버튼 하나로 결제. 1룩당 단가를 같이 적는다.
//   3) 투명하게 — 1회 결제·구독 아님, 환불 기간, 세금은 결제창에서 더해질 수 있음.
//
// 흐름: 팩 선택 → /api/checkout(pack) → Polar 호스티드 체크아웃(success_url=/analysis/ 복귀).
//   9룩은 셀카를 기기(IndexedDB)에 먼저 맡겨야 복귀 후 이어 만들 수 있어서 결제를 직접 열지 않고
//   컬렉션 화면(onCollection)으로 넘긴다 — 거기서 셀카 보관 + 결제를 한다.
// 앱(Expo 웹뷰)에서는 체크아웃을 시스템 브라우저로 넘긴다(Play 정책) — packCheckout.ts.
import { useEffect, useState } from 'react'
import { getCreditBalance } from '../../lib/credits'
import { startPackCheckout } from '../../lib/makeup/packCheckout'
import { MAKEUP_STYLES, type MakeupStyleId } from '../../lib/makeup/styles'
import { lookImage } from '../../lib/makeup/lookImages'
import { PRIMARY, BORDER, screenBg, surfaceStyle, footerScrim, btnPrimary, btnPrimaryStyle, eyebrow } from './theme'

function gtagEvent(name: string, params?: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

type PlanId = 'collection' | 'starter' | 'plus'
interface Plan { id: PlanId; credits: number; usd: number }

const PLANS: Record<PlanId, Plan> = {
  collection: { id: 'collection', credits: 9, usd: 4.99 },
  starter: { id: 'starter', credits: 5, usd: 2.99 },
  plus: { id: 'plus', credits: 15, usd: 6.99 },
}
const perLook = (p: Plan) => `$${(p.usd / p.credits).toFixed(2)}`

interface Props {
  isEn: boolean
  onBack: () => void
  /** 방금 만든 결과(무료 1룩) — 9칸 중 그 룩 자리에 넣는다 */
  resultSrc?: string
  /** 결과의 룩 */
  doneStyle?: MakeupStyleId
  /** 결과가 없을 때 가운데 칸에 넣을 내 셀카 */
  photo?: string
  /** 9룩 컬렉션 화면으로(셀카 보관 + $4.99 결제). 없으면 9룩 안은 숨긴다 */
  onCollection?: () => void
  /** 어디서 왔는지(GA4) — result · style_select · error · direct */
  from?: string
}

export default function MakeupTopUp({ isEn, onBack, resultSrc, doneStyle, photo, onCollection, from = 'direct' }: Props) {
  const [balance, setBalance] = useState<number | null>(null)
  const [plan, setPlan] = useState<PlanId>(onCollection ? 'collection' : 'starter')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  // 앱에서 브라우저로 결제를 넘긴 뒤 "돌아오세요" 안내를 띄우는 상태
  const [awaitingExternal, setAwaitingExternal] = useState(false)

  const refreshBalance = () => { getCreditBalance().then(setBalance).catch(() => setBalance(0)) }

  useEffect(() => {
    refreshBalance()
    gtagEvent('paywall_view', { from, has_result: !!resultSrc })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 브라우저에서 결제를 마치고 앱으로 돌아오면 잔액이 이미 충전돼 있다(서버 웹훅).
  useEffect(() => {
    if (!awaitingExternal) return
    const onVisible = () => { if (document.visibilityState === 'visible') refreshBalance() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [awaitingExternal])

  async function buy() {
    const p = PLANS[plan]
    gtagEvent('paywall_cta', { from, plan: p.id, value: p.usd })
    if (p.id === 'collection' && onCollection) { onCollection(); return }
    setErr(null); setBusy(true)
    const outcome = await startPackCheckout({ id: p.id, credits: p.credits, value: p.usd })
    if (outcome === 'external') { setAwaitingExternal(true); setBusy(false) }
    else if (outcome === 'error') {
      setErr(isEn ? 'Could not start checkout. Please try again.' : '결제를 시작하지 못했어요. 다시 시도해 주세요.')
      setBusy(false)
    }
  }

  const hasResult = !!(resultSrc && doneStyle)
  const options: PlanId[] = onCollection ? ['collection', 'starter', 'plus'] : ['starter', 'plus']
  const sel = PLANS[plan]

  const ctaLabel = sel.id === 'collection'
    ? (isEn ? `Get all 9 looks · $${sel.usd}` : `9룩 전부 만들기 · $${sel.usd}`)
    : (isEn ? `Get ${sel.credits} looks · $${sel.usd}` : `${sel.credits}룩 충전하기 · $${sel.usd}`)

  return (
    <div className="min-h-[100dvh] font-display text-white" style={screenBg}>
      <header className="px-5 pt-5 flex items-center gap-3 max-w-md w-full mx-auto">
        <button onClick={onBack} disabled={busy} aria-label={isEn ? 'Back' : '뒤로'} className="shrink-0 -ml-1 p-1 text-white/80 hover:text-white disabled:opacity-50">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <p className={`flex-1 text-center text-white/55 ${eyebrow}`}>{isEn ? 'AI Makeup' : 'AI 메이크업'}</p>
        <span className="shrink-0 px-2.5 py-1 text-[11px] font-extrabold tabular-nums" style={surfaceStyle}>
          {hasResult ? '1 / 9' : '0 / 9'}
        </span>
      </header>

      <main className="px-5 pt-5 pb-48 max-w-md w-full mx-auto">
        {/* 9칸 — 내 결과 1칸 + 아직 안 만든 8칸(룩 예시). 값어치를 말이 아니라 그림으로. */}
        <div className="grid grid-cols-3 gap-1.5 overflow-hidden rounded-2xl p-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
          {MAKEUP_STYLES.map((s, i) => {
            const mine = hasResult ? s.id === doneStyle : (!!photo && i === 4)
            const src = mine ? (hasResult ? resultSrc : photo) : lookImage(s.id)?.after
            return (
              <div key={s.id} className="relative aspect-[4/5] overflow-hidden rounded-lg" style={{ background: s.mood }}>
                {src && <img src={src} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
                {!mine && <span className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,9,83,0.88) 0%, rgba(7,9,83,0.25) 55%, rgba(7,9,83,0.35) 100%)' }} />}
                {mine ? (
                  <>
                    <span className="absolute inset-0 rounded-lg" style={{ boxShadow: `inset 0 0 0 3px ${PRIMARY}` }} />
                    <span className="absolute left-1.5 top-1.5 px-1.5 py-0.5 text-[10px] font-extrabold" style={{ background: PRIMARY }}>
                      {hasResult ? (isEn ? 'You ✓' : '내 얼굴 ✓') : (isEn ? 'You' : '내 얼굴')}
                    </span>
                  </>
                ) : (
                  <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-black/35">
                    <span className="material-symbols-outlined text-[13px] text-white/85">lock</span>
                  </span>
                )}
                <span className="absolute inset-x-1.5 bottom-1.5 text-[10px] font-extrabold leading-tight drop-shadow">
                  {isEn ? s.subEn : s.nameKo}
                </span>
              </div>
            )
          })}
        </div>

        <h1 className="mt-7 text-[30px] font-extrabold leading-[1.15] tracking-[-0.03em] break-keep">
          {hasResult
            ? (isEn ? <>See the other 8 looks<br />on your face.</> : <>나머지 8룩도<br />내 얼굴로 볼까요?</>)
            : (isEn ? <>See all 9 looks<br />on your face.</> : <>9룩 전부,<br />내 얼굴로 볼까요?</>)}
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-white/75 break-keep">
          {balance != null && balance > 0
            ? (isEn ? `You have ${balance} credit${balance === 1 ? '' : 's'}. Add more anytime — 1 look uses 1 credit.` : `지금 크레딧 ${balance}개가 있어요. 1룩에 1개씩 쓰이고, 언제든 더 채울 수 있어요.`)
            : (isEn ? 'Your free look is used. One payment, no subscription — same selfie, new looks.' : '무료 1룩은 다 썼어요. 한 번만 결제하면 같은 셀카로 바로 이어서 만들어요. 구독이 아니에요.')}
        </p>

        {/* 요금 — 라디오 카드. 추천안 미리 선택, 1룩당 값을 같이 보여 비교를 쉽게. */}
        <div role="radiogroup" aria-label={isEn ? 'Choose a plan' : '요금 선택'} className="mt-6 flex flex-col gap-2.5">
          {options.map((id) => {
            const p = PLANS[id]
            const on = plan === id
            const title = id === 'collection'
              ? (isEn ? 'All 9 looks + grid image' : '9룩 전부 + 모아보기 1장')
              : (isEn ? `${p.credits} looks (credits)` : `${p.credits}룩 (크레딧 ${p.credits}개)`)
            const note = id === 'collection'
              ? (isEn ? 'Made in one go · about 2–3 min' : '한 번에 자동 완성 · 약 2~3분')
              : id === 'starter'
                ? (isEn ? 'Pick looks one by one' : '원하는 룩만 하나씩')
                : (isEn ? 'Lowest price per look' : '1룩당 가장 저렴')
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPlan(id)}
                className="relative flex items-center gap-3 px-4 py-4 text-left transition-colors"
                style={{ background: on ? 'rgba(235,71,99,0.12)' : surfaceStyle.background, border: `${on ? 2 : 1}px solid ${on ? PRIMARY : BORDER}` }}
              >
                {id === 'collection' && (
                  <span className="absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em]" style={{ background: PRIMARY }}>
                    {isEn ? 'Best pick' : '추천'}
                  </span>
                )}
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ border: `2px solid ${on ? PRIMARY : 'rgba(255,255,255,0.4)'}` }}>
                  {on && <span className="h-2.5 w-2.5 rounded-full" style={{ background: PRIMARY }} />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-extrabold">{title}</span>
                  <span className="block text-[12px] text-white/60">{note}</span>
                </span>
                <span className="text-right">
                  <span className="block text-[18px] font-extrabold tabular-nums">${p.usd}</span>
                  <span className="block text-[11px] text-white/55 tabular-nums">{isEn ? `${perLook(p)} / look` : `1룩 ${perLook(p)}`}</span>
                </span>
              </button>
            )
          })}
        </div>

        {/* 안심 — 실제 적용되는 것만 */}
        <ul className="mt-5 grid grid-cols-1 gap-2 text-[12.5px] text-white/75">
          {[
            ['block', isEn ? 'One-time payment — not a subscription' : '1회 결제 · 구독 아님, 자동 결제 없음'],
            ['replay', isEn ? 'Come straight back here after paying — same selfie' : '결제 후 바로 돌아와 같은 셀카로 이어서'],
            ['verified_user', isEn ? 'Secure checkout by Polar · refund requests within 14 days' : 'Polar 안전 결제 · 14일 이내 환불 요청 가능'],
          ].map(([icon, text]) => (
            <li key={icon} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-white/55">{icon}</span>
              {text}
            </li>
          ))}
        </ul>

        {awaitingExternal && (
          <div className="mt-5 px-4 py-3 text-xs leading-relaxed text-white/90" style={surfaceStyle}>
            {isEn
              ? 'Checkout opened in your browser. Finish payment there, then come back — your credits will appear automatically.'
              : '브라우저에서 결제창을 열었어요. 결제를 마치고 앱으로 돌아오면 크레딧이 자동으로 반영됩니다.'}
          </div>
        )}
      </main>

      {/* 하단 고정 — 버튼 하나 */}
      <footer className="fixed inset-x-0 bottom-0 px-5 pt-8 pb-[max(16px,env(safe-area-inset-bottom))]" style={footerScrim}>
        <div className="max-w-md mx-auto">
          {err && <p className="mb-2 text-center text-xs text-red-200">{err}</p>}
          <button onClick={buy} disabled={busy} className={btnPrimary} style={btnPrimaryStyle}>
            {busy ? (isEn ? 'Opening checkout…' : '결제창 여는 중…') : ctaLabel}
          </button>
          <p className="mt-2 text-center text-[11px] text-white/50 break-keep">
            {isEn ? 'Taxes may be added at checkout depending on your region · ' : '지역에 따라 결제창에서 세금이 더해질 수 있어요 · '}
            <a href={isEn ? '/en/refund/' : '/refund/'} className="underline underline-offset-2">{isEn ? 'Refund policy' : '환불 정책'}</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
