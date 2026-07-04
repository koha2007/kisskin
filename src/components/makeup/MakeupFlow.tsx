// AI 메이크업 실제 플로우 오케스트레이터 (FREE_PIVOT_PLAN P1-3)
// ────────────────────────────────────────────────────────────────────
// 업로드(②) → 스타일 선택(①) → 마스크 생성 + OpenAI 인페인팅 → 결과(③).
//   · MediaPipe 얼굴 랜드마크 → 선택 스타일 maskAreas 마스크(입술·볼·눈, 페더링).
//   · /api/makeup-edit (gpt-image-1) 로 마스크 영역만 재생성.
//   · 결과 합성: 마스크 밖은 원본 픽셀 그대로(§8 얼굴변형 방지) + glow 레이어.
//   · 비용 가드: 서버에서 무료 1회(fingerprint+IP). 초과 시 402.
// 엔진(FaceLandmarker)은 모듈 레벨에서 1회 로드해 캐시.

import { useEffect, useRef, useState, useCallback } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import MakeupSelfieUpload, { type MakeupGender, type MakeupSkin } from './MakeupSelfieUpload'
import MakeupStyleSelect from './MakeupStyleSelect'
import MakeupResult from './MakeupResult'
import MakeupTopUp from './MakeupTopUp'
import { styleById, promptFor, type MakeupStyleId } from '../../lib/makeup/styles'
import { initEngine, detectAndBuildMask, toOpenAIMask, toAlphaMask, type Engine } from '../../lib/makeup/maskBuilder'
import { fitToSupported, compositeInsideMask, applyGlow } from '../../lib/makeup/compose'
import { deviceFingerprint } from '../../lib/makeup/fingerprint'
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

// 에러 후 행동: 같은 작업 재생성 / 처음부터 / 로그인 필요 / 크레딧 충전
type ErrAction = 'regenerate' | 'restart' | 'login' | 'topup'

// 엔진 1회 로드 캐시 (분석 여러 번 해도 모델 재다운로드 없음)
let enginePromise: Promise<Engine> | null = null
function getEngine(onStatus: (s: string) => void): Promise<Engine> {
  if (!enginePromise) enginePromise = initEngine(onStatus)
  return enginePromise
}

type Step = 'upload' | 'style' | 'processing' | 'result' | 'error' | 'topup'
interface Selfie { photo: string; gender: MakeupGender; skin: MakeupSkin }

export default function MakeupFlow() {
  const { locale } = useI18n()
  const isEn = locale === 'en'

  const [step, setStep] = useState<Step>('upload')
  const [selfie, setSelfie] = useState<Selfie | null>(null)
  const [styleId, setStyleId] = useState<MakeupStyleId>('signature')
  const [status, setStatus] = useState('')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [errAction, setErrAction] = useState<ErrAction>('restart')
  const [baseSrc, setBaseSrc] = useState<string | null>(null)   // 지원사이즈로 맞춘 원본(슬라이더 BEFORE)
  const [afterSrc, setAfterSrc] = useState<string | null>(null) // 합성+glow 최종 결과(AFTER)
  const runIdRef = useRef(0)
  const jobIdRef = useRef('')   // 현재 생성 작업의 차감 멱등 키(재시도 시 유지)

  // ── 생성: 마스크 → OpenAI 인페인팅 → 마스크밖 원본합성 → glow (processing 진입 시) ──
  const runGenerate = useCallback(async (photo: string, id: MakeupStyleId, gender: MakeupGender) => {
    const myRun = ++runIdRef.current
    const alive = () => runIdRef.current === myRun
    setErrMsg(null); setAfterSrc(null)
    const style = styleById(id)
    try {
      setStatus(isEn ? 'Loading face engine…' : '얼굴 분석 엔진 로딩…')
      const engine = await getEngine((s) => { if (alive()) setStatus(s) })

      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('image load failed')); img.src = photo })
      if (!alive()) return

      setStatus(isEn ? 'Detecting face…' : '얼굴 인식 중…')
      await new Promise((r) => setTimeout(r, 30)) // 스피너 양보
      const { canvas: srcCanvas, size } = fitToSupported(img)
      const baseUrl = srcCanvas.toDataURL('image/png')
      setBaseSrc(baseUrl)
      const result = detectAndBuildMask(engine, srcCanvas, style.maskAreas)
      if (!alive()) return
      if (!result.ok || !result.mask || !result.landmarks) {
        setErrMsg(result.reason === 'side-angle'
          ? (isEn
            ? 'Your face is turned too far to the side. Please upload a front-facing selfie (no hat or sunglasses).'
            : '얼굴이 너무 옆으로 돌아가 있어요. 모자·선글라스 없이 정면을 바라본 셀카로 다시 올려주세요.')
          : (isEn
            ? 'No face detected. Please use a clear, front-facing selfie.'
            : '얼굴을 찾지 못했어요. 정면이 잘 보이는 셀카로 다시 시도해 주세요.'))
        setErrAction('restart')   // 새 사진 필요 → 처음부터
        setStep('error'); return
      }

      // OpenAI 인페인팅 호출 (서버: 무료 가드 → 소진 시 로그인+크레딧 차감 → gpt-image-1)
      setStatus(isEn ? 'Creating your makeup… (up to ~1 min)' : '메이크업 생성 중… (최대 1분)')
      const fingerprint = await deviceFingerprint()
      if (!jobIdRef.current) jobIdRef.current = makeJobId()   // 재시도면 기존 키 유지(이중차감 방지)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch('/api/makeup-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ image: baseUrl, mask: toOpenAIMask(result.mask).toDataURL('image/png'), prompt: promptFor(style, gender), styleId: id, fingerprint, jobId: jobIdRef.current, size }),
      })
      if (!alive()) return
      const data = (await res.json().catch(() => ({}))) as { image?: string; used?: number; tier?: string; error?: string; balance?: number }
      if (!res.ok) {
        const code = data.error
        if (res.status === 402 && code === 'login_required') {
          setErrMsg(isEn ? 'You’ve used your free tries. Log in to continue with credits.' : '무료 체험을 다 썼어요. 로그인하면 크레딧으로 이어갈 수 있어요.')
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

      // 결과 합성: 마스크 밖은 원본 픽셀 그대로(§8) + glow
      setStatus(isEn ? 'Finishing…' : '마무리 중…')
      const editedImg = new Image()
      await new Promise<void>((r, j) => { editedImg.onload = () => r(); editedImg.onerror = () => j(new Error('result load failed')); editedImg.src = data.image! })
      if (!alive()) return
      const composite = compositeInsideMask(srcCanvas, editedImg, toAlphaMask(result.mask))
      applyGlow(composite, result.landmarks, style.glow)
      setAfterSrc(composite.toDataURL('image/jpeg', 0.92))

      gtagEvent('mask_built', { style: id, areas: style.maskAreas.join(',') })
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
    if (step === 'processing' && selfie) runGenerate(selfie.photo, styleId, selfie.gender)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const reset = () => { runIdRef.current++; jobIdRef.current = ''; setAfterSrc(null); setBaseSrc(null); setStep('upload') }
  // 같은 작업 재생성(차감 멱등 키 유지 → 일시 실패는 무료 재호출, 부족/로그인은 조치 후 재시도)
  const regenerate = () => { setErrMsg(null); setStep('processing') }

  // ── 렌더 ──
  if (step === 'upload') {
    return (
      <MakeupSelfieUpload
        isEn={isEn}
        onBack={reset}
        onNext={(data) => { jobIdRef.current = ''; setSelfie(data); setStep('style') }}
      />
    )
  }

  if (step === 'style') {
    return (
      <MakeupStyleSelect
        isEn={isEn}
        initialStyle={styleId}
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
            <a href="/auth" className={btn} style={{ background: PRIMARY }}>
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
    return <MakeupTopUp isEn={isEn} onBack={() => setStep('error')} />
  }

  // result
  return (
    <MakeupResult
      isEn={isEn}
      styleId={styleId}
      beforeSrc={baseSrc ?? selfie?.photo}
      afterSrc={afterSrc ?? undefined}
      onBack={() => setStep('style')}
      onRetake={reset}
    />
  )
}
