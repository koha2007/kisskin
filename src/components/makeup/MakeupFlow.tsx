// AI 메이크업 실제 플로우 오케스트레이터 (FREE_PIVOT_PLAN P1-3)
// ────────────────────────────────────────────────────────────────────
// 업로드(②) → 스타일 선택(①) → OpenAI whole-face 편집 → 결과(③).
//   · 옛 9룩 방식 복원(2026-07-05): MediaPipe 마스크 없이 사진 전체를 프롬프트로
//     재생성한다(promptWholeFace). 얼굴 보존은 프롬프트 FACE_LOCK에 위임(변형 리스크 감수).
//   · /api/makeup-edit (gpt-image-2) 로 whole-face 편집. 결과 이미지를 그대로 표시.
//   · 비용 가드: 서버에서 무료 1회(fingerprint+IP). 초과 시 402.
//   · Stage 2(MediaPipe 마스크+glow) 코드는 maskBuilder/compose에 보존(재사용 대비).

import { useEffect, useRef, useState, useCallback } from 'react'
import { navigate } from 'vike/client/router'
import { useI18n } from '../../i18n/I18nContext'
import MakeupSelfieUpload from './MakeupSelfieUpload'
import MakeupStyleSelect from './MakeupStyleSelect'
import MakeupResult, { type MakeupUsage } from './MakeupResult'
import MakeupTopUp from './MakeupTopUp'
import MakeupCollection from './MakeupCollection'
import { styleById, promptWholeFace, MAKEUP_STYLES, type MakeupStyleId } from '../../lib/makeup/styles'
import { fitPreserveAspect } from '../../lib/makeup/compose'
import { takePendingSelfie, keepPendingSelfie, savePendingSelfieFromSrc, clearPendingSelfie } from '../../lib/makeup/pendingSelfie'
import { supabase } from '../../lib/supabase'
import { trackCheckoutReturn } from '../../lib/purchaseTracking'
import { getCreditBalance } from '../../lib/credits'
import { getFreeStatus, type PayChoice } from '../../lib/freeStatus'
import { screenBg, btnPrimary, btnPrimaryStyle } from './theme'

function gtagEvent(name: string, params?: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

// 차감 멱등 키. 같은 생성 작업(재시도 포함)은 같은 jobId → 서버에서 이중차감 방지.
function makeJobId(): string {
  try { return crypto.randomUUID() } catch { /* secure context 아니면 폴백 */ }
  return 'job-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

// 로그인 후 이 화면으로 되돌아오게 한다(?style= 등 현재 쿼리 유지). 로그인 성공 후
// 홈으로 튕기면 셀카를 처음부터 다시 올려야 한다 — 게이트 직전 이탈의 주원인.
// style 을 주면 next 에 ?style= 을 실어, 복귀 시 (세션에 보관된 셀카와 함께)
// 스타일 선택까지 건너뛰고 곧장 생성으로 이어진다.
function loginHref(style?: MakeupStyleId): string {
  if (typeof window === 'undefined') return '/auth'
  const params = new URLSearchParams(window.location.search)
  if (style) params.set('style', style)
  const qs = params.toString()
  return '/auth?next=' + encodeURIComponent(window.location.pathname + (qs ? '?' + qs : ''))
}

// 에러 후 행동: 같은 작업 재생성 / 처음부터 / 로그인 필요 / 크레딧 충전
type ErrAction = 'regenerate' | 'restart' | 'login' | 'topup' | 'choose'

type Step = 'upload' | 'style' | 'processing' | 'result' | 'error' | 'topup' | 'collection'
interface Selfie { photo: string }

// 크레딧 충전(Polar) 왕복에도 고르던 룩이 살아남게 — 셀카는 pendingSelfie 가 맡는다.
const RESUME_STYLE_KEY = 'kisskin_resume_style'

// 충전 복귀 안내: 확인 중 → 잔액 확인됨 / 웹훅 반영이 늦음
type PaidNotice = { state: 'checking' } | { state: 'ok'; balance: number } | { state: 'late' }

export default function MakeupFlow() {
  const { locale } = useI18n()
  const isEn = locale === 'en'

  const [step, setStep] = useState<Step>('upload')
  const [selfie, setSelfie] = useState<Selfie | null>(null)
  const [styleId, setStyleId] = useState<MakeupStyleId>('natural-glow')
  // 홈 캐러셀에서 카드를 골라 들어오면 /analysis/?style=<id> 로 룩이 지정된다.
  // 이 경우 업로드 후 스타일 선택 단계를 건너뛰고 바로 그 룩으로 생성한다.
  const [preselected, setPreselected] = useState(false)
  const [status, setStatus] = useState('')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [errAction, setErrAction] = useState<ErrAction>('restart')
  const [baseSrc, setBaseSrc] = useState<string | null>(null)   // 지원사이즈로 맞춘 원본(슬라이더 BEFORE)
  const [afterSrc, setAfterSrc] = useState<string | null>(null) // 합성+glow 최종 결과(AFTER)
  const [usage, setUsage] = useState<MakeupUsage | null>(null)  // 이번 생성의 과금 결과(무료/크레딧)
  // 미로그인 여부를 업로드 화면에서 미리 알려준다(사진 올린 뒤 게이트에 걸리는 헛수고 방지).
  const [loggedOut, setLoggedOut] = useState(false)
  // 9룩 컬렉션(2026-10-12): 업로드 뒤 컬렉션으로 갈지 / 결제 복귀로 이어 만들지
  const [collectionMode, setCollectionMode] = useState(false)
  const [collectionResume, setCollectionResume] = useState(false)
  // 2026-10-17: 유일한 외부 결제자가 크레딧을 한 번도 못 쓰고 떠났다. 충전 후 복귀하면
  // 안내 없이 '사진 올리기' 첫 화면이 떠서 결제가 된 건지조차 알 수 없었다 → 복귀 안내 + 셀카·룩 복원.
  // checkout_id 는 trackCheckoutReturn 이 주소에서 걷어내므로 첫 렌더에 미리 잡아 둔다.
  const paidReturnRef = useRef(typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('checkout_id'))
  const [paidNotice, setPaidNotice] = useState<PaidNotice | null>(null)
  const runIdRef = useRef(0)
  const jobIdRef = useRef('')   // 현재 생성 작업의 차감 멱등 키(재시도 시 유지)
  // 이번 생성의 결제수단 — 사용자가 고른다(무료권/크레딧 우선순위 없음, 2026-10-21).
  const payRef = useRef<PayChoice | undefined>(undefined)

  // ── 생성: 마스크 → OpenAI 인페인팅 → 마스크밖 원본합성 → glow (processing 진입 시) ──
  const runGenerate = useCallback(async (photo: string, id: MakeupStyleId) => {
    const myRun = ++runIdRef.current
    const alive = () => runIdRef.current === myRun
    setErrMsg(null); setAfterSrc(null); setUsage(null)
    const style = styleById(id)
    try {
      // ── 로그인 게이트 ── AI 메이크업은 무료 1회도 로그인 필요(익명 무료 남용 차단).
      // 진단 도구는 무로그인 유지, 생성당 실비용이 나가는 이 기능만 로그인 뒤로.
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        // 2026-10-17: 찡그린 얼굴 에러 화면 → '로그인' 한 번 더, 를 건너뛰고 곧장 로그인으로.
        // 셀카는 업로드 때 세션에 맡겨 뒀고(savePendingSelfieFromSrc) 룩은 ?style= 로 실려 가서,
        // 로그인 화면이 "이 룩을 바로 만들어 드려요"로 받고 복귀 즉시 생성이 이어진다.
        gtagEvent('makeup_login_gate', { style: id })
        window.location.href = loginHref(id)
        return
      }

      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('image load failed')); img.src = photo })
      if (!alive()) return

      // 원본 비율 유지(크롭 없이 축소)한 입력 + size='auto' → 출력이 원본 비율을 따른다.
      const { canvas: srcCanvas, size } = fitPreserveAspect(img)
      const baseUrl = srcCanvas.toDataURL('image/png')
      setBaseSrc(baseUrl)

      // whole-face 편집(옛 9룩 방식): 마스크 없이 사진 전체를 프롬프트로 재생성.
      // (서버: 무료 가드 → 소진 시 로그인+크레딧 차감 → gpt-image-2 whole-face 편집)
      setStatus(isEn ? 'Creating your makeup… (up to ~1 min)' : '메이크업 생성 중… (최대 1분)')
      // 스타일 선택을 건너뛰고 들어온 경우(홈 카드 ?style= · 로그인 복귀) 결제수단을 아직 안 골랐다.
      // 무료권·크레딧 둘 다 있으면 고르는 화면으로, 하나뿐이면 그걸로 — 몰래 정하지 않는다.
      if (!payRef.current) {
        const st = await getFreeStatus()
        if (!alive()) return
        if (st && st.makeup.left > 0 && st.balance > 0) { setStep('style'); return }
        if (st) payRef.current = st.makeup.left > 0 ? 'free' : 'credit'
      }
      if (!jobIdRef.current) jobIdRef.current = makeJobId()   // 재시도면 기존 키 유지(이중차감 방지)
      const res = await fetch('/api/makeup-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image: baseUrl, prompt: promptWholeFace(style), styleId: id, jobId: jobIdRef.current, size, pay: payRef.current }),
      })
      if (!alive()) return
      const data = (await res.json().catch(() => ({}))) as { image?: string; used?: number; free?: number; tier?: 'free' | 'credit'; error?: string; balance?: number; freeLeft?: number }
      if (!res.ok) {
        const code = data.error
        if (code === 'login_required') {
          setErrMsg(isEn ? 'Sign up and get your first look free · No card needed.' : '회원가입하면 첫 1룩 무료 · 카드 등록 없음.')
          setErrAction('login')
        } else if (res.status === 401) {
          setErrMsg(isEn ? 'Your session expired. Please log in again.' : '로그인이 만료됐어요. 다시 로그인해 주세요.')
          setErrAction('login')
        } else if (res.status === 409 && code === 'free_pass_used') {
          setErrMsg(isEn ? 'Your free pass is already used. You can make it with a credit.' : '무료권을 이미 사용했어요. 크레딧으로 만들 수 있어요.')
          setErrAction('choose')
        } else if (res.status === 409 && code === 'pay_required') {
          setErrMsg(isEn ? 'Choose whether to use your free pass or a credit.' : '무료권과 크레딧 중 무엇을 쓸지 골라 주세요.')
          setErrAction('choose')
        } else if (res.status === 402 && code === 'insufficient_credits') {
          setErrMsg(isEn ? 'Not enough credits. Top up to continue.' : '크레딧이 부족해요. 충전하면 이어서 만들 수 있어요.')
          setErrAction('topup')
        } else if (res.status === 503) {
          setErrMsg(isEn ? 'Service is not ready yet. Please try again shortly.' : '서비스가 아직 준비 중이에요. 잠시 후 다시 시도해 주세요.')
          setErrAction('regenerate')
        } else {
          // OpenAI 일시 실패 등(retryable) — 크레딧은 이미 차감됐어도 같은 jobId 재시도 = 무료 재호출
          setErrMsg(isEn ? 'Makeup generation failed. Please try again.' : '메이크업 생성에 실패했어요. 다시 시도해 주세요.')
          setErrAction('regenerate')
        }
        setStep('error'); return
      }

      // whole-face 결과: 편집된 전체 이미지를 그대로 표시(마스크 합성/glow 불필요).
      setStatus(isEn ? 'Finishing…' : '마무리 중…')
      const editedImg = new Image()
      await new Promise<void>((r, j) => { editedImg.onload = () => r(); editedImg.onerror = () => j(new Error('result load failed')); editedImg.src = data.image! })
      if (!alive()) return
      setAfterSrc(data.image!)
      // 결과화면에 "무료 체험 1회 사용" / "크레딧 1개 사용 · N개 남음" 을 표시하기 위해
      // 서버가 판정한 과금 결과를 그대로 전달한다.
      if (data.tier === 'free' || data.tier === 'credit') {
        setUsage({ tier: data.tier, used: data.used, free: data.free, balance: data.balance, freeLeft: data.freeLeft })
      }

      gtagEvent('makeup_generated', { style: id })
      if (data.tier === 'free' && data.used === 1) gtagEvent('free_trial_used', { style: id })
      if (data.tier === 'credit') gtagEvent('credit_used', { style: id })
      jobIdRef.current = ''   // 성공 → 다음 생성은 새 작업(새 차감)
      payRef.current = undefined   // 다음 생성은 다시 고른다
      clearPendingSelfie()    // 왕복 보존용 셀카 정리(다음 방문에 옛 사진 부활 방지)
      setStep('result')
    } catch (e) {
      if (!alive()) return
      console.error('[MakeupFlow] generate failed', e)
      setErrMsg(isEn
        ? 'Something went wrong. Check your network and try again.'
        : '문제가 생겼어요. 네트워크 확인 후 다시 시도해 주세요.')
      setStep('error')
    }
  }, [isEn])

  useEffect(() => {
    if (step === 'processing' && selfie) runGenerate(selfie.photo, styleId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // 로그인 상태 선확인 — 업로드 화면에 "로그인하면 무료 1회" 안내를 띄우기 위함.
  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession()
      .then(({ data }) => { if (!cancelled) setLoggedOut(!data.session) })
      .catch(() => { /* 확인 실패 시 안내를 띄우지 않음(생성 시 게이트가 최종 판정) */ })
    return () => { cancelled = true }
  }, [])

  // 크레딧 결제 복귀(/analysis/?checkout_id=) → 결제 확인 후 GA4 purchase 1회. 충전 자체는 서버 웹훅 몫.
  useEffect(() => { trackCheckoutReturn() }, [])

  // 테스트/직접진입: /analysis/?topup=1 → 크레딧 충전 화면 바로 표시(무료 소진·잔액0 상태를
  // 만들 필요 없이 결제 흐름을 눈으로 확인·테스트). 충전은 100% 할인코드로 무료 결제 가능.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('topup') === '1') setStep('topup')
    // 9룩 컬렉션: collection=1 = 결제 복귀(기기에 저장한 셀카로 이어 만들기),
    // collection=new = 셀카부터 올리고 컬렉션으로(룩 페이지·SNS 링크용 입구).
    const col = params.get('collection')
    if (col === '1') { setCollectionResume(true); setStep('collection'); return }
    if (col === 'new') setCollectionMode(true)
    // 홈 캐러셀 카드 선택 → ?style=<id> 로 룩 프리셀렉트(유효한 id 만 반영).
    const s = params.get('style')
    const hasStyle = !!s && MAKEUP_STYLES.some((st) => st.id === s)
    if (hasStyle) {
      setStyleId(s as MakeupStyleId)
      setPreselected(true)
    }
    // 충전 복귀: 충전 전에 고르던 룩을 선택해 둔다(곧장 생성하진 않는다 — 한 번 눌러 확인).
    if (paidReturnRef.current) {
      try {
        const r = sessionStorage.getItem(RESUME_STYLE_KEY)
        sessionStorage.removeItem(RESUME_STYLE_KEY)
        if (!hasStyle && r && MAKEUP_STYLES.some((st) => st.id === r)) setStyleId(r as MakeupStyleId)
      } catch { /* 없으면 첫 룩 */ }
    }

    // 홈 히어로에서 이미 사진을 고르고 왔다면(세션에 맡겨둔 셀카) 업로드 단계를 건너뛴다.
    // 룩까지 정해져 있으면 곧장 생성으로, 아니면 스타일 선택으로.
    const pending = takePendingSelfie()
    if (pending) {
      // 로그인 게이트 → /auth 왕복에도 살아남도록 되돌려 놓는다.
      // (생성 성공/다시 찍기에서 clearPendingSelfie 로 정리됨)
      keepPendingSelfie(pending)
      setSelfie({ photo: pending })
      jobIdRef.current = ''
      setStep(col === 'new' ? 'collection' : hasStyle ? 'processing' : 'style')
    }
  }, [])

  // 충전 복귀 → 잔액이 들어올 때까지(웹훅) 잠깐 기다렸다가 "결제 완료 · 크레딧 N개"를 보여 준다.
  useEffect(() => {
    if (!paidReturnRef.current) return
    let cancelled = false
    setPaidNotice({ state: 'checking' })
    ;(async () => {
      for (let i = 0; i < 10 && !cancelled; i++) {
        const b = await getCreditBalance().catch(() => 0)
        if (cancelled) return
        if (b > 0) { setPaidNotice({ state: 'ok', balance: b }); return }
        await new Promise((r) => setTimeout(r, 2000))
      }
      if (!cancelled) setPaidNotice({ state: 'late' })
    })()
    return () => { cancelled = true }
  }, [])

  // 충전 화면으로 — Polar 왕복(페이지 이동)에도 지금 셀카·룩을 이어 쓰도록 맡겨 둔다.
  const goTopup = () => {
    if (selfie) void savePendingSelfieFromSrc(selfie.photo)
    try { sessionStorage.setItem(RESUME_STYLE_KEY, styleId) } catch { /* 없으면 첫 룩 */ }
    setStep('topup')
  }

  const reset = () => { runIdRef.current++; jobIdRef.current = ''; payRef.current = undefined; setAfterSrc(null); setBaseSrc(null); setUsage(null); setCollectionMode(false); clearPendingSelfie(); setStep('upload') }
  // 같은 작업 재생성(차감 멱등 키 유지 → 일시 실패는 무료 재호출, 부족/로그인은 조치 후 재시도)
  const regenerate = () => { setErrMsg(null); setStep('processing') }

  // 충전 복귀 안내 — 사진 올리기·룩 고르기 화면 위에 띄운다. 생성을 시작하면 닫는다.
  const notice = paidNotice && (step === 'upload' || step === 'style') ? (
    <div role="status" className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[max(12px,env(safe-area-inset-top))] font-display">
      <button
        onClick={() => setPaidNotice(null)}
        className="flex w-full max-w-md items-start gap-2 rounded-2xl px-4 py-3 text-left text-[13px] leading-snug text-white shadow-lg break-keep"
        style={{ background: paidNotice.state === 'late' ? '#7a4b12' : '#1f5e3a' }}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          {paidNotice.state === 'ok' ? 'check_circle' : paidNotice.state === 'late' ? 'schedule' : 'hourglass_top'}
        </span>
        <span className="flex-1">
          {paidNotice.state === 'checking' && (isEn ? 'Confirming your payment…' : '결제를 확인하고 있어요…')}
          {paidNotice.state === 'ok' && (isEn
            ? `Payment complete — you have ${paidNotice.balance} credit${paidNotice.balance === 1 ? '' : 's'}. ${selfie ? 'Pick a look to continue.' : 'Upload a selfie to start.'} Each look uses 1.`
            : `결제 완료 — 크레딧 ${paidNotice.balance}개가 들어왔어요. ${selfie ? '룩을 고르면 이어서 만들어요.' : '셀카를 올리면 바로 시작해요.'} 룩 하나에 1개씩 쓰여요.`)}
          {paidNotice.state === 'late' && (isEn
            ? 'Payment received, but your credits are taking longer to appear. Refresh in a minute — if they still don\'t show, contact us from the Contact page.'
            : '결제는 접수됐는데 크레딧 반영이 늦어지고 있어요. 1분 뒤 새로고침해 주세요. 그래도 안 보이면 문의하기로 알려 주세요.')}
        </span>
      </button>
    </div>
  ) : null

  // ── 렌더 ──
  if (step === 'upload') {
    return (
      <>{notice}
      <MakeupSelfieUpload
        isEn={isEn}
        hintLabel={preselected ? (isEn ? styleById(styleId).subEn : styleById(styleId).nameKo) : undefined}
        loginHref={loggedOut ? loginHref() : undefined}
        onBack={() => { void navigate('/') }}
        onNext={(data) => {
          jobIdRef.current = ''
          setSelfie(data)
          // 로그인/충전으로 페이지를 떠나도 사진이 살아있도록 세션에 보관해 둔다
          // (실패해도 진행에는 지장 없음 — 그 경우만 왕복 시 재업로드).
          void savePendingSelfieFromSrc(data.photo)
          setStep(collectionMode ? 'collection' : preselected ? 'processing' : 'style')
        }}
      />
      </>
    )
  }

  if (step === 'style') {
    return (
      <>{notice}
      <MakeupStyleSelect
        isEn={isEn}
        initialStyle={styleId}
        loginHref={loggedOut ? loginHref() : undefined}
        onBack={() => setStep('upload')}
        onConfirm={(id, pay) => { jobIdRef.current = ''; payRef.current = pay; setStyleId(id); setPaidNotice(null); setStep('processing') }}
        onCollection={() => { setCollectionMode(true); setStep('collection') }}
      />
      </>
    )
  }

  if (step === 'processing') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-5 font-display text-white px-8 text-center" style={screenBg}>
        <div className="w-12 h-12 border-[3px] border-white/25 border-t-white rounded-full animate-spin" />
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
          {isEn ? 'AI Makeup' : 'AI 메이크업'}
        </p>
        <p className="text-lg font-extrabold tracking-tight">{status || (isEn ? 'Analyzing…' : '분석 중…')}</p>
        <p className="text-xs text-white/55">{isEn ? 'This can take up to a minute.' : '최대 1분 정도 걸려요.'}</p>
      </div>
    )
  }

  if (step === 'error') {
    const btn = `${btnPrimary} max-w-[260px]`
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-5 font-display text-white px-8 text-center" style={screenBg}>
        <span className="material-symbols-outlined text-5xl text-white/55">sentiment_dissatisfied</span>
        <p className="text-[15px] leading-relaxed text-white/85 max-w-xs break-keep">{errMsg}</p>
        {errAction === 'login' ? (
          <div className="flex w-full max-w-[260px] flex-col items-center gap-3">
            {/* 로그인 복귀 시 셀카(세션 보관)+선택한 룩(?style=)으로 곧장 생성 재개 */}
            <a href={loginHref(styleId)} className={`${btn} block text-center`} style={btnPrimaryStyle}>
              {isEn ? 'Log in' : '로그인'}
            </a>
            <button onClick={regenerate} className="text-xs text-white/60 underline underline-offset-2">
              {isEn ? 'Already logged in? Try again' : '이미 로그인했다면 다시 시도'}
            </button>
          </div>
        ) : errAction === 'topup' ? (
          <div className="flex w-full max-w-[260px] flex-col items-center gap-3">
            <button onClick={goTopup} className={btn} style={btnPrimaryStyle}>
              {isEn ? 'Top up credits' : '크레딧 충전'}
            </button>
            <button onClick={regenerate} className="text-xs text-white/60 underline underline-offset-2">
              {isEn ? 'Already topped up? Try again' : '이미 충전했다면 다시 시도'}
            </button>
          </div>
        ) : errAction === 'choose' ? (
          <button onClick={() => { payRef.current = undefined; jobIdRef.current = ''; setStep('style') }} className={btn} style={btnPrimaryStyle}>
            {isEn ? 'Choose again' : '다시 고르기'}
          </button>
        ) : (
          <button
            onClick={errAction === 'regenerate' ? regenerate : reset}
            className={btn}
            style={btnPrimaryStyle}
          >
            {isEn ? 'Try again' : '다시 시도'}
          </button>
        )}
      </div>
    )
  }

  if (step === 'topup') {
    // 충전 성공 → Polar 가 /analysis/ 로 복귀(페이지 리로드). 잔액이 생긴 상태로 재시작.
    // onBack → 에러 화면으로 복귀(같은 작업 재시도 가능).
    return <MakeupTopUp isEn={isEn} onBack={() => setStep(errMsg ? 'error' : 'upload')} />
  }

  if (step === 'collection') {
    return (
      <MakeupCollection
        isEn={isEn}
        photo={collectionResume ? undefined : selfie?.photo}
        resume={collectionResume}
        loginHref={loginHref()}
        onBack={() => {
          setCollectionMode(false); setCollectionResume(false)
          setStep(afterSrc ? 'result' : selfie ? 'style' : 'upload')
        }}
        onRetake={() => {
          runIdRef.current++; jobIdRef.current = ''; setSelfie(null); clearPendingSelfie()
          setCollectionResume(false); setCollectionMode(true); setStep('upload')
        }}
      />
    )
  }

  // result
  return (
    <MakeupResult
      isEn={isEn}
      styleId={styleId}
      beforeSrc={baseSrc ?? selfie?.photo}
      afterSrc={afterSrc ?? undefined}
      usage={usage ?? undefined}
      onBack={() => setStep('style')}
      onRetake={reset}
      onCollection={() => { setCollectionMode(true); setStep('collection') }}
      onTopup={goTopup}
    />
  )
}
