// AI 메이크업 — 비포/애프터 결과 화면 (FREE_PIVOT_PLAN §2 / 커밋 P1-1, screen3 시안)
// ────────────────────────────────────────────────────────────────────
// 저장·공유·이메일 3경로 모두 buildMakeupComposite(룩 + 스타일 라벨 + kissinskin
// 브랜딩) 단일 소스를 쓴다(1-039.jpg 스타일). 옛 AnalysisApp 이 갖고 있던
//   · 합성 저장(브랜딩 포함)  · /result/{id} 공유 링크(OG 미리보기)  · 이메일 전송
// 을 free-pivot 흐름에 복원한다. 이 흐름엔 톤 분석 텍스트가 없어 합성/이메일은
// 룩 이미지 + 스타일명/설명 + 브랜딩으로 구성된다.

import { useState, useEffect, useRef } from 'react'
import ResultGrid from '../result-grid/ResultGrid'
import { ProductGridCard } from '../result-grid/ProductGridCard'
import BeforeAfterSlider from './BeforeAfterSlider'
import { styleById, type MakeupStyleId } from '../../lib/makeup/styles'
import { buildMakeupComposite } from '../../lib/makeup/composite'
import { saveSharedResult } from '../../lib/shareResult'
import { isNativeApp, nativeSaveImage, nativeShareImage } from '../../lib/nativePicker'
import { supabase } from '../../lib/supabase'
import { getCreditBalance } from '../../lib/credits'
import type { ProductRec } from '../../lib/recommendations/types'

const PRIMARY = '#eb4763'
const NAVY = '#070953'
const TOOL_URL = 'https://kissinskin.net/analysis/'
const screenBg = { background: `linear-gradient(170deg, ${NAVY} 0%, #15123f 60%, #241a52 100%)` }

function gtagEvent(name: string, params?: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

async function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob null'))), type, quality)
  })
}

const isAbort = (e: unknown) => e instanceof Error && e.name === 'AbortError'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function ActionBtn({ icon, label, onClick, disabled }: { icon: string; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 border border-white/15 py-3 active:scale-[0.97] transition disabled:opacity-40 disabled:active:scale-100"
    >
      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <span className="text-[11px] font-bold">{label}</span>
    </button>
  )
}

// 플레이스홀더 추천 (실제 도구 추천 데이터 연결 전). searchKeywords 는
// check:keywords 규칙(≤5단어·제품속성만) 준수 → 실제 affiliate 검색 동작.
const PLACEHOLDER_PRODUCTS: ProductRec[] = [
  {
    category: '베이스', categoryEn: 'Base',
    title: '루미너스 실크 파운데이션', titleEn: 'Luminous silk foundation',
    features: ['은은한 광채', '얇은 밀착', '자연 커버'],
    brandExamples: ['에스쁘아', '헤라'],
    whyForType: '속광 베이스로 글래스 스킨의 핵심인 촉촉한 광을 만들어줘요.',
    searchKeywords: '루미너스 실크 파운데이션 광채',
    icon: 'water_drop',
  },
  {
    category: '스킨케어', categoryEn: 'Care',
    title: '하이드레이팅 세럼', titleEn: 'Hydrating serum',
    features: ['수분 충전', '결 정돈', '광 부스터'],
    brandExamples: ['토리든', '아누아'],
    whyForType: '메이크업 전 수분 베이스를 잡아 광채가 더 오래 갑니다.',
    searchKeywords: '하이드레이팅 수분 세럼',
    icon: 'spa',
  },
  {
    category: '립', categoryEn: 'Lip',
    title: '모브 글로우 틴트', titleEn: 'Mauve glow tint',
    features: ['촉촉 글로우', '자연 발색', 'MLBB'],
    brandExamples: ['롬앤', '페리페라'],
    whyForType: '은은한 모브 톤으로 속광 룩과 자연스럽게 어울려요.',
    searchKeywords: 'MLBB 모브 글로우 틴트',
    icon: 'favorite',
  },
]

/** 이번 생성이 무료 체험이었는지 크레딧 차감이었는지 — /api/makeup-edit 응답 그대로. */
export interface MakeupUsage {
  tier: 'free' | 'credit'
  /** free tier: 지금까지 쓴 무료 횟수 / 총 무료 횟수 */
  used?: number
  free?: number
  /** credit tier: 차감 후 잔액(서버 권위값) */
  balance?: number
}

interface Props {
  styleId: MakeupStyleId
  /** 원본 셀카 */
  beforeSrc?: string
  /** 실제 인페인팅 결과(P1-3). 없으면 "생성 준비 중" 자리표시 — 디버그 마스크는 노출 안 함. */
  afterSrc?: string
  /** 이번 생성의 과금 결과. 없으면(재진입 등) 잔액만 조회해 표시. */
  usage?: MakeupUsage
  onRetake: () => void
  onBack: () => void
  isEn?: boolean
}

export default function MakeupResult({ styleId, beforeSrc, afterSrc, usage, onRetake, onBack, isEn = false }: Props) {
  const style = styleById(styleId)
  // 실제 메이크업 결과가 아직 없으면(P1-3 미연결) 안전한 "생성 준비 중" 상태만 노출.
  const pending = !afterSrc

  const styleName = isEn ? style.subEn : style.nameKo
  const styleDesc = isEn ? style.descEn : style.descKo
  const lang = isEn ? 'en' : 'ko'

  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2400)
  }

  // 공유 링크(/result/{id}) — 최초 공유/저장 시 1회 생성 후 재사용.
  const [shareId, setShareId] = useState<string | null>(null)
  const [savingShare, setSavingShare] = useState(false)

  // 이메일 — 로그인 사용자는 세션 이메일로 자동 채움. 익명 사용자는 직접 입력.
  const [email, setEmail] = useState('')
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // 남은 크레딧 — 로그인 유저만. 생성 직후(afterSrc 변경) 최신 잔액 반영.
  const [loggedIn, setLoggedIn] = useState(false)
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data }) => {
      const e = data.session?.user?.email
      if (cancelled) return
      if (e) setEmail((cur) => cur || e)
      if (data.session?.user) {
        setLoggedIn(true)
        getCreditBalance().then((n) => { if (!cancelled) setCreditsLeft(n) }).catch(() => {})
      }
    }).catch(() => { /* 세션 없음 — 익명 입력 */ })
    return () => { cancelled = true }
  }, [afterSrc])

  // 크레딧 차감 직후에는 서버가 돌려준 잔액이 가장 정확하다(RPC 재조회는 한 박자 늦을 수 있음).
  const balanceNow =
    usage?.tier === 'credit' && typeof usage.balance === 'number' ? usage.balance : creditsLeft

  const fileName = `kisskin-makeup-${styleId}.jpg`
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
  const isMobile = /Mobi|Android|iP(hone|ad|od)/i.test(ua)
  // iPadOS Safari 는 UA 를 Mac 으로 보고하므로 터치 여부로 함께 판별.
  const isIOS = /iP(hone|ad|od)/i.test(ua) || (/Mac/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document)

  const buildComposite = () => buildMakeupComposite({ afterSrc: afterSrc!, styleName, styleDesc, isEn })

  // 결과를 Supabase 에 저장하고 /result/{id} 공유 URL 을 반환(중복 저장 방지).
  const ensureShareUrl = async (compositeDataUrl: string): Promise<string> => {
    if (shareId) return `https://kissinskin.net/result/${shareId}`
    const report = JSON.stringify({ analysis: null, products: [], look: styleName })
    const id = await saveSharedResult(compositeDataUrl, report, '', [styleName])
    setShareId(id)
    return `https://kissinskin.net/result/${id}`
  }

  // ── 모바일 공유/저장 안정화(iOS Safari) ──
  // navigator.share() 는 호출 시점에 "사용자 제스처(transient activation)" 가 살아
  // 있어야 한다. 합성 캔버스 생성·Supabase 저장 같은 async 를 탭 이후에 await 하면
  // 활성화가 만료돼 share() 가 NotAllowedError 로 실패하고, 저장 폴백 <a download> 는
  // iOS 가 무시해 "아무 일도 안 일어남" 이 된다. 그래서 결과가 준비되면 합성 파일을
  // 미리 만들어 캐시하고, 탭 핸들러는 캐시 파일로 즉시 share() 를 호출한다.
  type Composite = { file: File; dataUrl: string }
  const compositeRef = useRef<Composite | null>(null)

  const makeComposite = async (): Promise<Composite> => {
    const canvas = await buildComposite()
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92)
    const file = new File([blob], fileName, { type: 'image/jpeg' })
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    return { file, dataUrl }
  }

  const getComposite = async (): Promise<Composite> => {
    if (compositeRef.current) return compositeRef.current
    const c = await makeComposite()
    compositeRef.current = c
    return c
  }

  // 결과 준비 → 합성 파일 미리 생성(탭 시 즉시 공유 → iOS 활성화 보존).
  // 공유 링크(/result/{id})도 백그라운드로 미리 만들어 둔다 → 탭 시 개인화된 결과
  // 페이지 URL(OG 미리보기 O)을 즉시 공유. 실패해도 탭 때 TOOL_URL 로 폴백.
  useEffect(() => {
    compositeRef.current = null
    if (!afterSrc) return
    let cancelled = false
    makeComposite()
      .then((c) => {
        if (cancelled) return
        compositeRef.current = c
        void ensureShareUrl(c.dataUrl).catch(() => { /* 탭 시 폴백 */ })
      })
      .catch(() => { /* 탭 시 온디맨드로 재시도 */ })
    return () => { cancelled = true }
    // styleName/styleDesc 는 styleId 파생값 → afterSrc 만 추적하면 충분.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [afterSrc])

  // 이미지를 새 탭으로 연다(iOS 사진첩 저장 경로). 팝업이 막히면 false.
  const openImageTab = (file: File): boolean => {
    const url = URL.createObjectURL(file)
    const win = window.open(url, '_blank', 'noopener')
    if (!win) {
      URL.revokeObjectURL(url)
      return false
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    return true
  }

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    gtagEvent('makeup_save', { style: styleId, method: 'download' })
    showToast(isEn ? 'Saved to your device' : '이미지를 저장했어요')
  }

  // 저장 — "저장"은 공유 시트를 열지 않는다(그건 공유 버튼의 일). 실제로 파일이
  // 기기에 남는 경로만 쓴다:
  //   · iOS: <a download> 는 Files 앱으로 새거나 인앱 웹뷰에서 무시된다 → 이미지를
  //     새 탭으로 열어 "길게 눌러 → 사진에 저장"(사진첩에 확실히 들어가는 경로).
  //   · Android/데스크톱: <a download> 로 바로 저장.
  // 합성은 결과 표시 시 미리 만들어 두므로 탭 핸들러가 동기적으로 열려 팝업차단이 없다.
  const handleSave = async () => {
    if (!afterSrc) return
    // 앱 웹뷰: <a download> 가 무반응이라 네이티브 갤러리 저장 브릿지를 쓴다.
    if (isNativeApp()) {
      try {
        const c = compositeRef.current ?? await getComposite()
        const ok = await nativeSaveImage(c.dataUrl)
        if (ok) {
          gtagEvent('makeup_save', { style: styleId, method: 'native' })
          showToast(isEn ? 'Saved to your gallery' : '갤러리에 저장했어요')
        } else {
          showToast(isEn ? 'Save failed — allow photo permission and try again' : '저장에 실패했어요. 사진 권한을 허용하고 다시 시도해 주세요')
        }
      } catch {
        showToast(isEn ? 'Save failed — try again' : '저장에 실패했어요. 다시 시도해 주세요')
      }
      return
    }
    const cached = compositeRef.current
    const saveHint = isEn
      ? 'Press & hold the image → "Save to Photos"'
      : '이미지를 길게 눌러 "사진에 저장"을 선택하세요'
    if (isIOS && cached && openImageTab(cached.file)) {
      gtagEvent('makeup_save', { style: styleId, method: 'newtab' })
      showToast(saveHint)
      return
    }
    try {
      const c = cached ?? await getComposite()
      // 캐시가 없어 방금 만든 경우: await 이후라 팝업이 막힐 수 있다 → 막히면 다운로드.
      if (isIOS && openImageTab(c.file)) {
        gtagEvent('makeup_save', { style: styleId, method: 'newtab' })
        showToast(saveHint)
        return
      }
      downloadFile(c.file)
    } catch {
      showToast(isEn ? 'Save failed — try again' : '저장에 실패했어요. 다시 시도해 주세요')
    }
  }

  // 공유 — 모바일: 이미지+링크 네이티브 공유(바이럴 핵심) / 데스크톱: 링크 복사.
  //   빠른 경로: 캐시된 파일로 탭 즉시 공유(iOS 활성화 보존). /result 링크는 공유를
  //   막지 않도록 백그라운드로 생성해 하단 복사 링크바에 채운다.
  const handleShare = async () => {
    if (!afterSrc) return
    const nav = navigator
    const title = isEn ? 'AI Makeup — kisskin' : 'AI 메이크업 — kisskin'
    const text = isEn
      ? `I tried the ${styleName} look with AI makeup! Try it free 👉`
      : `AI 메이크업으로 ${styleName} 룩 완성! 나도 무료로 해보기 👉`
    const cached = compositeRef.current

    // 앱 웹뷰: navigator.share 가 없어 클립보드 폴백으로 새던 것 → 네이티브 공유 시트.
    if (isNativeApp()) {
      try {
        const c = cached ?? await getComposite()
        void ensureShareUrl(c.dataUrl).catch(() => {})   // 하단 복사 링크바용 /result 링크
        const ok = await nativeShareImage(c.dataUrl)
        if (ok) gtagEvent('makeup_share', { style: styleId, method: 'native' })
        else showToast(isEn ? 'Share failed — try again' : '공유에 실패했어요. 다시 시도해 주세요')
      } catch {
        showToast(isEn ? 'Share failed — try again' : '공유에 실패했어요. 다시 시도해 주세요')
      }
      return
    }

    // 빠른 경로: 캐시된 파일 → 탭 즉시 공유 시트(iOS 활성화 유지).
    if (cached && isMobile && typeof nav.canShare === 'function' && nav.canShare({ files: [cached.file] })) {
      try {
        await nav.share({ files: [cached.file], title, text, url: shareId ? `https://kissinskin.net/result/${shareId}` : TOOL_URL })
        gtagEvent('makeup_share', { style: styleId, method: 'file' })
        void ensureShareUrl(cached.dataUrl).catch(() => {})   // 하단 복사 링크바용 /result 링크 백그라운드 생성
        return
      } catch (e) {
        if (isAbort(e)) return
      }
    }

    // 느린 경로: 합성 생성 + /result 링크 후 공유/복사.
    setSavingShare(true)
    try {
      const c = cached ?? await getComposite()
      let shareUrl = TOOL_URL
      try {
        shareUrl = await ensureShareUrl(c.dataUrl)
      } catch (e) {
        console.warn('[makeup-share] save failed, falling back to tool URL', e)
      }
      if (isMobile && typeof nav.canShare === 'function' && nav.canShare({ files: [c.file] })) {
        try {
          await nav.share({ files: [c.file], title, text, url: shareUrl })
          gtagEvent('makeup_share', { style: styleId, method: 'file' })
          return
        } catch (e) {
          if (isAbort(e)) return
        }
      }
      if (isMobile && typeof nav.share === 'function') {
        try {
          await nav.share({ title, text, url: shareUrl })
          gtagEvent('makeup_share', { style: styleId, method: 'url' })
          return
        } catch (e) {
          if (isAbort(e)) return
        }
      }
      // 데스크톱: 링크 복사(하단 링크바도 함께 노출됨)
      try {
        await nav.clipboard.writeText(shareUrl)
        gtagEvent('makeup_share', { style: styleId, method: 'copy' })
        showToast(isEn ? 'Link copied to clipboard!' : '공유 링크를 복사했어요!')
      } catch {
        showToast(isEn ? 'Link ready below — copy it to share' : '아래 링크를 복사해 공유하세요')
      }
    } catch {
      showToast(isEn ? 'Share failed — try again' : '공유에 실패했어요. 다시 시도해 주세요')
    } finally {
      setSavingShare(false)
    }
  }

  const copyShareLink = async () => {
    if (!shareId) return
    try {
      await navigator.clipboard.writeText(`https://kissinskin.net/result/${shareId}`)
      showToast(isEn ? 'Link copied!' : '링크를 복사했어요!')
    } catch {
      showToast(isEn ? 'Copy failed' : '복사에 실패했어요')
    }
  }

  // 이메일 전송 — 합성 이미지를 첨부해 send-report 로 전송(리포트 없는 룩 전용 페이로드).
  const handleEmail = async () => {
    if (!afterSrc) return
    const target = email.trim()
    if (!EMAIL_RE.test(target)) {
      setEmailState('error')
      showToast(isEn ? 'Enter a valid email' : '올바른 이메일을 입력해 주세요')
      return
    }
    setEmailState('sending')
    try {
      const { dataUrl: compositeDataUrl } = await getComposite()
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: target,
          report: { summary: styleDesc || '', products: [] },
          styles: [styleName],
          resultImage: compositeDataUrl,
          lang,
        }),
      })
      if (!res.ok) throw new Error('send failed')
      setEmailState('sent')
      gtagEvent('makeup_email_sent', { style: styleId, email_domain: target.split('@')[1] })
    } catch {
      setEmailState('error')
      showToast(isEn ? 'Failed to send — try again' : '전송에 실패했어요. 다시 시도해 주세요')
    }
  }

  return (
    <div className="min-h-[100dvh] font-display text-white" style={screenBg}>
      {/* 상단: 뒤로 + 타이틀 + 스타일 칩 */}
      <header className="px-5 pt-5 flex items-center gap-3 max-w-xl w-full mx-auto">
        <button
          onClick={onBack}
          aria-label={isEn ? 'Back' : '뒤로'}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 transition"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-base font-bold tracking-tight">{isEn ? 'AI Makeup' : 'AI 메이크업'}</h1>
        <span className="shrink-0 text-[11px] font-bold bg-white/15 rounded-full px-3 py-1">{styleName}</span>
      </header>

      <main className="px-5 pt-5 pb-10 max-w-xl w-full mx-auto">
        {pending ? (
          /* P1-3 인페인팅 미연결 — 디버그 마스크 대신 안전한 "생성 준비 중" 자리표시 */
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-navy border border-white/10">
            {beforeSrc && <img src={beforeSrc} alt={isEn ? 'Your selfie' : '내 셀카'} className="absolute inset-0 w-full h-full object-cover opacity-35" />}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6" style={{ background: 'linear-gradient(180deg, rgba(7,9,83,0.55), rgba(7,9,83,0.78))' }}>
              <span className="material-symbols-outlined text-4xl text-white/85" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <p className="text-base font-extrabold">{isEn ? 'Preparing your makeup…' : '메이크업 생성 준비 중'}</p>
              <p className="text-xs text-white/70 leading-relaxed max-w-[15rem]">
                {isEn
                  ? 'Your real makeup result will appear here soon.'
                  : '실제 메이크업 결과가 곧 여기에 표시돼요.'}
              </p>
            </div>
          </div>
        ) : (
          <BeforeAfterSlider
            beforeSrc={beforeSrc}
            afterSrc={afterSrc}
            afterMood={style.mood}
            isEn={isEn}
          />
        )}

        {/* 액션 — 저장/공유는 결과 이미지가 있어야 의미 있음(생성 준비 중이면 비활성) */}
        <div className="mt-4 flex gap-2.5">
          <ActionBtn icon="download" label={isEn ? 'Save' : '저장'} onClick={handleSave} disabled={pending} />
          <ActionBtn icon="ios_share" label={isEn ? 'Share' : '공유'} onClick={handleShare} disabled={pending || savingShare} />
          <ActionBtn icon="refresh" label={isEn ? 'Retry' : '다시'} onClick={onRetake} />
        </div>

        {/* 이번 생성이 무료였는지 크레딧 차감이었는지 + 남은 잔액.
            "무료 1회를 쓴 건데 크레딧이 안 줄었다"는 오해가 없도록 사용 내역을 명시한다.
            credit tier 는 서버가 내려준 차감 후 잔액(권위값)을 우선 쓴다. */}
        {loggedIn && (usage || creditsLeft !== null) && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[12px]">
            <span className="material-symbols-outlined text-sm text-white/60" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            {usage && (
              <span className="font-bold text-white/90">
                {usage.tier === 'free'
                  ? (isEn ? 'Free trial used' : '무료 체험 1회 사용')
                  : (isEn ? '1 credit used' : '크레딧 1개 사용')}
              </span>
            )}
            {balanceNow !== null && (
              <span className="text-white/70">
                {usage ? '· ' : ''}
                {isEn ? `${balanceNow} credit${balanceNow === 1 ? '' : 's'} left` : `크레딧 ${balanceNow}개 남음`}
              </span>
            )}
            <a href="/analysis/?topup=1" className="font-bold underline underline-offset-2 text-white/85">
              {isEn ? 'Top up' : '충전'}
            </a>
          </div>
        )}

        {/* 공유 링크바 — 생성되면 상시 노출(데스크톱에서도 링크 복사 확실히 보이게) */}
        {shareId && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 px-3 py-2">
            <span className="material-symbols-outlined text-base text-white/70 shrink-0">link</span>
            <span className="flex-1 truncate text-[12px] text-white/75">{`kissinskin.net/result/${shareId}`}</span>
            <button
              type="button"
              onClick={copyShareLink}
              className="shrink-0 rounded-full bg-white/15 hover:bg-white/25 px-3 py-1 text-[11px] font-bold active:scale-95 transition"
            >
              {isEn ? 'Copy' : '복사'}
            </button>
          </div>
        )}

        {/* 이메일로 받기 — 로그인 시 자동 채움, 익명은 직접 입력 */}
        {!pending && (
          <section className="mt-4 rounded-2xl bg-white/10 border border-white/15 p-4">
            {emailState === 'sent' ? (
              <div className="flex items-center gap-2 text-[13px] font-bold text-emerald-300">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
                {isEn ? 'Sent! Check your inbox (and spam).' : '전송 완료! 받은편지함(스팸함)을 확인하세요.'}
              </div>
            ) : (
              <>
                <label className="flex items-center gap-1.5 text-[12px] font-bold text-white/80 mb-2">
                  <span className="material-symbols-outlined text-base">mail</span>
                  {isEn ? 'Email me this result' : '이 결과를 이메일로 받기'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailState === 'error') setEmailState('idle') }}
                    placeholder={isEn ? 'you@example.com' : '이메일 주소'}
                    className="flex-1 min-w-0 rounded-xl bg-white/90 text-navy placeholder:text-slate-400 px-3 py-2.5 text-[14px] font-medium outline-none focus:ring-2 focus:ring-white/60"
                    style={{ color: NAVY }}
                  />
                  <button
                    type="button"
                    onClick={handleEmail}
                    disabled={emailState === 'sending'}
                    className="shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-extrabold text-white active:scale-[0.97] transition disabled:opacity-50"
                    style={{ background: PRIMARY }}
                  >
                    {emailState === 'sending' ? (isEn ? 'Sending…' : '전송 중…') : (isEn ? 'Send' : '보내기')}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-white/45">
                  {isEn
                    ? 'We email the look image + branding. No spam, unsubscribe anytime.'
                    : '룩 이미지와 브랜딩을 이메일로 보내드려요. 스팸 없이, 언제든 수신 거부 가능.'}
                </p>
              </>
            )}
          </section>
        )}

        {/* 룩 설명 */}
        <section className="mt-8">
          <h2 className="text-2xl font-extrabold tracking-tight">{styleName}</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-white/80">{styleDesc}</p>
        </section>

        {/* 추천 제품 — 실제 ProductGridCard 구조 (플레이스홀더 데이터) */}
        <section className="mt-8">
          <h3 className="text-sm font-bold tracking-[0.15em] text-white/55 uppercase mb-3">
            {isEn ? 'Recommended products' : '추천 제품'}
          </h3>
          <ResultGrid>
            {PLACEHOLDER_PRODUCTS.map((p) => (
              <ProductGridCard key={p.title} item={p} accent={PRIMARY} pageType="makeup" pageSlug={`makeup-${styleId}`} />
            ))}
          </ResultGrid>
          <p className="mt-3 text-center text-[11px] text-white/45">
            {isEn
              ? 'Affiliate links — we may earn a commission. Products shown are placeholders.'
              : '제휴 링크 — 구매 시 수수료를 받을 수 있어요. 표시된 제품은 플레이스홀더입니다.'}
          </p>
        </section>
      </main>

      {/* 저장/복사 피드백 토스트 (모바일 네이티브 시트는 자체 피드백이 있어 토스트 없음) */}
      {toast && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-5 pointer-events-none"
        >
          <div className="rounded-full bg-black/80 backdrop-blur px-5 py-2.5 text-[13px] font-bold text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}
