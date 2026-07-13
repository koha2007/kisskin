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
import { styleById, promptWholeFace, MAKEUP_STYLES, type MakeupStyleId } from '../../lib/makeup/styles'
import { fitPreserveAspect } from '../../lib/makeup/compose'
import { takePendingSelfie } from '../../lib/makeup/pendingSelfie'
import { supabase } from '../../lib/supabase'

const NAVY = '#070953'
const PRIMARY = '#eb4763'
const screenBg = { background: `linear-gradient(160deg, ${NAVY} 0%, #1a1268 45%, ${PRIMARY} 125%)` }

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
function loginHref(): string {
  if (typeof window === 'undefined') return '/auth'
  return '/auth?next=' + encodeURIComponent(window.location.pathname + window.location.search)
}

// 에러 후 행동: 같은 작업 재생성 / 처음부터 / 로그인 필요 / 크레딧 충전
type ErrAction = 'regenerate' | 'restart' | 'login' | 'topup'

type Step = 'upload' | 'style' | 'processing' | 'result' | 'error' | 'topup'
interface Selfie { photo: string }

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
  const runIdRef = useRef(0)
  const jobIdRef = useRef('')   // 현재 생성 작업의 차감 멱등 키(재시도 시 유지)

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
        setErrMsg(isEn
          ? 'Log in to try AI makeup — your 1st try is free, no card needed.'
          : '로그인하면 AI 메이크업을 무료 1회 체험할 수 있어요. 카드 필요 없어요.')
        setErrAction('login')
        setStep('error')
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
      if (!jobIdRef.current) jobIdRef.current = makeJobId()   // 재시도면 기존 키 유지(이중차감 방지)
      const res = await fetch('/api/makeup-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image: baseUrl, prompt: promptWholeFace(style), styleId: id, jobId: jobIdRef.current, size }),
      })
      if (!alive()) return
      const data = (await res.json().catch(() => ({}))) as { image?: string; used?: number; free?: number; tier?: 'free' | 'credit'; error?: string; balance?: number }
      if (!res.ok) {
        const code = data.error
        if (code === 'login_required') {
          setErrMsg(isEn ? 'Log in to try AI makeup — your 1st try is free, no card needed.' : '로그인하면 AI 메이크업을 무료 1회 체험할 수 있어요. 카드 필요 없어요.')
          setErrAction('login')
        } else if (res.status === 401) {
          setErrMsg(isEn ? 'Your session expired. Please log in again.' : '로그인이 만료됐어요. 다시 로그인해 주세요.')
          setErrAction('login')
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
        setUsage({ tier: data.tier, used: data.used, free: data.free, balance: data.balance })
      }

      gtagEvent('makeup_generated', { style: id })
      if (data.tier === 'free' && data.used === 1) gtagEvent('free_trial_used', { style: id })
      if (data.tier === 'credit') gtagEvent('credit_used', { style: id })
      jobIdRef.current = ''   // 성공 → 다음 생성은 새 작업(새 차감)
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

  // 테스트/직접진입: /analysis/?topup=1 → 크레딧 충전 화면 바로 표시(무료 소진·잔액0 상태를
  // 만들 필요 없이 결제 흐름을 눈으로 확인·테스트). 충전은 100% 할인코드로 무료 결제 가능.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('topup') === '1') setStep('topup')
    // 홈 캐러셀 카드 선택 → ?style=<id> 로 룩 프리셀렉트(유효한 id 만 반영).
    const s = params.get('style')
    const hasStyle = !!s && MAKEUP_STYLES.some((st) => st.id === s)
    if (hasStyle) {
      setStyleId(s as MakeupStyleId)
      setPreselected(true)
    }

    // 홈 히어로에서 이미 사진을 고르고 왔다면(세션에 맡겨둔 셀카) 업로드 단계를 건너뛴다.
    // 룩까지 정해져 있으면 곧장 생성으로, 아니면 스타일 선택으로.
    const pending = takePendingSelfie()
    if (pending) {
      setSelfie({ photo: pending })
      jobIdRef.current = ''
      setStep(hasStyle ? 'processing' : 'style')
    }
  }, [])

  const reset = () => { runIdRef.current++; jobIdRef.current = ''; setAfterSrc(null); setBaseSrc(null); setUsage(null); setStep('upload') }
  // 같은 작업 재생성(차감 멱등 키 유지 → 일시 실패는 무료 재호출, 부족/로그인은 조치 후 재시도)
  const regenerate = () => { setErrMsg(null); setStep('processing') }

  // ── 렌더 ──
  if (step === 'upload') {
    return (
      <MakeupSelfieUpload
        isEn={isEn}
        hintLabel={preselected ? (isEn ? styleById(styleId).subEn : styleById(styleId).nameKo) : undefined}
        loginHref={loggedOut ? loginHref() : undefined}
        onBack={() => { void navigate('/') }}
        onNext={(data) => { jobIdRef.current = ''; setSelfie(data); setStep(preselected ? 'processing' : 'style') }}
      />
    )
  }

  if (step === 'style') {
    return (
      <MakeupStyleSelect
        isEn={isEn}
        initialStyle={styleId}
        loginHref={loggedOut ? loginHref() : undefined}
        onBack={() => setStep('upload')}
        onConfirm={(id) => { jobIdRef.current = ''; setStyleId(id); setStep('processing') }}
      />
    )
  }

  if (step === 'processing') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-5 font-display text-white px-8 text-center" style={screenBg}>
        <div className="w-12 h-12 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-sm text-white/85">{status || (isEn ? 'Analyzing…' : '분석 중…')}</p>
        <p className="text-xs text-white/55">{isEn ? 'This can take up to a minute.' : '최대 1분 정도 걸려요.'}</p>
      </div>
    )
  }

  if (step === 'error') {
    const btn = 'rounded-full px-6 py-3 font-extrabold text-[14px] text-white shadow-lg active:scale-[0.98] transition'
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-5 font-display text-white px-8 text-center" style={screenBg}>
        <span className="material-symbols-outlined text-5xl text-white/70">sentiment_dissatisfied</span>
        <p className="text-sm text-white/85 max-w-xs">{errMsg}</p>
        {errAction === 'login' ? (
          <div className="flex flex-col items-center gap-3">
            <a href={loginHref()} className={btn} style={{ background: PRIMARY }}>
              {isEn ? 'Log in' : '로그인'}
            </a>
            <button onClick={regenerate} className="text-xs text-white/60 underline underline-offset-2">
              {isEn ? 'Already logged in? Try again' : '이미 로그인했다면 다시 시도'}
            </button>
          </div>
        ) : errAction === 'topup' ? (
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => setStep('topup')} className={btn} style={{ background: PRIMARY }}>
              {isEn ? 'Top up credits' : '크레딧 충전'}
            </button>
            <button onClick={regenerate} className="text-xs text-white/60 underline underline-offset-2">
              {isEn ? 'Already topped up? Try again' : '이미 충전했다면 다시 시도'}
            </button>
          </div>
        ) : (
          <button
            onClick={errAction === 'regenerate' ? regenerate : reset}
            className={btn}
            style={{ background: PRIMARY }}
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
    />
  )
}
