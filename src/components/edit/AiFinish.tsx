// AI 완성본(크레딧 1개) — 페이스 페인팅·헤어 컬러 공용 (2026-11-11)
// 로그인 → 크레딧 확인 → 생성 → 전후 비교 + 저장·메일(ResultSaveEmail). 크레딧이 없으면 5장 $2.99 충전 후 같은 페이지로 복귀(?paid=1).
// 페이지를 떠나기 전 onStash 로 사진·고른 것을 세션에 맡긴다(로그인·결제 왕복).
import { useEffect, useRef, useState } from 'react'
import ResultSaveEmail from '../makeup/ResultSaveEmail'
import { supabase } from '../../lib/supabase'
import { getCreditBalance } from '../../lib/credits'
import { trackEvent } from '../../lib/analytics'
import { generateEdit, type EditPool } from '../../lib/makeup/generateEdit'
import { newJobId, type GenError } from '../../lib/makeup/generateLook'
import { startPackCheckout, type CheckoutPack } from '../../lib/makeup/packCheckout'

const STARTER: CheckoutPack = { id: 'starter', credits: 5, value: 2.99 }

type Gen = { k: 'idle' } | { k: 'busy' } | { k: 'done'; image: string; balance?: number } | { k: 'error'; e: GenError }

interface Props {
  isEn: boolean
  /** 이 페이지 경로(결제·로그인 복귀) */
  base: string
  pool: EditPool
  /** 지금 상태로 만들 수 있나(내 사진 + 고른 것) */
  ready: boolean
  /** 못 만들 때 이유 */
  blockedHint?: string
  /** 생성 직전에 보낼 이미지·지시문을 만든다 */
  build: () => { source: HTMLImageElement | HTMLCanvasElement; prompt: string; styleId: string } | null
  /** 전후 비교의 "전" */
  before: string | null
  name: string
  desc: string
  onStash: () => void
  /** 고른 것이 바뀌면 이전 결과를 지운다 */
  resetKey: string
  /** 결제 복귀 등으로 잔액을 다시 읽을 신호 */
  refreshKey?: number
}

const KO = {
  kicker: 'AI 완성본', title: '실제로 칠한 것처럼', sub: '크레딧 1개 · 약 30초~1분',
  make: 'AI 완성본 만들기', login: '로그인하고 만들기', buy: '5장 충전 $2.99 · 바로 이어서', loading: '만드는 중… 화면을 닫지 마세요',
  left: (n: number) => `보유 크레딧 ${n}개`, before: '전', after: 'AI 완성본', again: '다시 만들기(크레딧 1개)',
  note: '같은 사진·같은 선택은 실패해도 다시 눌러 이어서 만들어요(추가 차감 없음). 결과는 AI 가 만든 이미지예요.',
  err: { login: '로그인이 필요해요.', topup: '크레딧이 없어요. 충전하면 바로 이어서 만들 수 있어요.', free_used: '', choose: '', unavailable: '서비스가 잠시 준비 중이에요. 잠시 후 다시 시도해 주세요.', retry: '생성에 실패했어요. 다시 눌러 주세요. 추가로 차감되지 않아요.' } as Record<GenError, string>,
  checkoutErr: '결제창을 열지 못했어요. 잠시 후 다시 시도해 주세요.',
}
const EN: typeof KO = {
  kicker: 'AI finish', title: 'Make it look real', sub: '1 credit · about 30–60 seconds',
  make: 'Make the AI finish', login: 'Log in to make it', buy: 'Top up 5 for $2.99 · continue here', loading: 'Making it… please keep this page open',
  left: (n: number) => `${n} credits left`, before: 'Before', after: 'AI finish', again: 'Make again (1 credit)',
  note: 'If it fails, tap again with the same photo and choice — you won’t be charged twice. The result is an AI-generated image.',
  err: { login: 'Please log in.', topup: 'No credits left. Top up and carry on right here.', free_used: '', choose: '', unavailable: 'Service is briefly unavailable. Please try again shortly.', retry: 'Generation failed. Tap again — you won’t be charged twice.' },
  checkoutErr: 'Couldn’t open checkout. Please try again shortly.',
}

export default function AiFinish({ isEn, base, pool, ready, blockedHint, build, before, name, desc, onStash, resetKey, refreshKey }: Props) {
  const T = isEn ? EN : KO
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [gen, setGen] = useState<Gen>({ k: 'idle' })
  const [paying, setPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const jobRef = useRef('')
  const keyRef = useRef(resetKey)

  useEffect(() => {
    let off = false
    supabase.auth.getSession().then(({ data }) => {
      if (off) return
      setLoggedIn(!!data.session)
      if (data.session) getCreditBalance().then((b) => { if (!off) setBalance(b) }).catch(() => {})
    }).catch(() => setLoggedIn(false))
    return () => { off = true }
  }, [gen.k, refreshKey])

  // 고른 것이 바뀌면 새 작업(새 jobId) — 같은 선택 재시도만 같은 jobId
  useEffect(() => {
    if (keyRef.current === resetKey) return
    keyRef.current = resetKey
    jobRef.current = ''
    setGen((g) => (g.k === 'busy' ? g : { k: 'idle' }))
  }, [resetKey])

  const make = async () => {
    if (!ready) return
    if (!loggedIn) {
      onStash()
      trackEvent('makeup_login_gate', { style: `${pool}` })
      window.location.href = '/auth?next=' + encodeURIComponent(`${base}?resume=1`)
      return
    }
    const b = build(); if (!b) return
    if (!jobRef.current) jobRef.current = newJobId()
    setGen({ k: 'busy' }); setErr(null)
    const r = await generateEdit({ ...b, jobId: jobRef.current, pool })
    if (r.ok) {
      jobRef.current = ''
      setGen({ k: 'done', image: r.image, balance: r.balance })
      if (typeof r.balance === 'number') setBalance(r.balance)
      trackEvent('makeup_generated', { style: `${pool}:${b.styleId}` })
      trackEvent('credit_used', { style: `${pool}:${b.styleId}` })
    } else {
      if (r.error !== 'retry' && r.error !== 'unavailable') jobRef.current = ''
      setGen({ k: 'error', e: r.error })
      if (r.error === 'login') setLoggedIn(false)
    }
  }
  const buy = async () => {
    onStash(); setPaying(true); setErr(null)
    trackEvent('paywall_cta', { plan: STARTER.id, from: `${pool}_page` })
    const out = await startPackCheckout(STARTER, base)
    if (out === 'error') setErr(T.checkoutErr)
    if (out !== 'redirect') setPaying(false)
  }

  const btn = 'flex w-full items-center justify-center gap-1.5 py-3.5 text-[15px] font-bold transition-colors disabled:opacity-50'
  const noCredit = loggedIn && balance === 0
  return (
    <div className="bg-navy p-5 text-white md:p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-on-dark">{T.kicker}</p>
      <h3 className="mt-1 text-xl font-extrabold">{T.title}</h3>
      <p className="mt-0.5 text-[13px] text-white/75">{T.sub}</p>
      {gen.k === 'done' && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <figure><img src={before ?? ''} alt="" className="aspect-[3/4] w-full object-cover" /><figcaption className="mt-1 text-center text-[11px] font-bold text-white/70">{T.before}</figcaption></figure>
            <figure><img src={gen.image} alt={name} className="aspect-[3/4] w-full object-cover" /><figcaption className="mt-1 text-center text-[11px] font-bold">{T.after}</figcaption></figure>
          </div>
          <ResultSaveEmail image={gen.image} name={name} desc={desc} fileName={`kissinskin-${pool}.jpg`} tag={`${pool}:ai`} isEn={isEn} />
        </div>
      )}
      <div className="mt-4 space-y-2">
        {err && <p className="bg-primary/20 px-3 py-2 text-[13px] font-bold">{err}</p>}
        {gen.k === 'error' && T.err[gen.e] && <p className="bg-primary/20 px-3 py-2 text-[13px] font-bold">{T.err[gen.e]}</p>}
        {gen.k === 'busy' ? (
          <p className="animate-pulse bg-white/10 py-4 text-center text-sm font-bold">{T.loading}</p>
        ) : loggedIn === false ? (
          <button type="button" disabled={!ready} onClick={() => void make()} className={`${btn} bg-primary text-navy`}>{T.login}</button>
        ) : noCredit ? (
          <button type="button" disabled={paying} onClick={() => void buy()} className={`${btn} bg-primary text-navy`}>{T.buy}</button>
        ) : (
          <button type="button" disabled={!ready} onClick={() => void make()} className={`${btn} bg-primary text-navy`}>{gen.k === 'done' ? T.again : T.make}</button>
        )}
        {!ready && blockedHint && <p className="text-center text-[12px] font-semibold text-white/80 break-keep">{blockedHint}</p>}
        {typeof balance === 'number' && loggedIn && <p className="text-center text-[11px] text-white/70">{T.left(balance)}</p>}
        <p className="text-[11px] leading-relaxed text-white/60 break-keep">{T.note}</p>
      </div>
    </div>
  )
}
