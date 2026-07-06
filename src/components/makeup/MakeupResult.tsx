// AI 메이크업 — 비포/애프터 결과 화면 (FREE_PIVOT_PLAN §2 / 커밋 P1-1, screen3 시안)
// ────────────────────────────────────────────────────────────────────
// 저장·공유·이메일 3경로 모두 buildMakeupComposite(룩 + 스타일 라벨 + kissinskin
// 브랜딩) 단일 소스를 쓴다(1-039.jpg 스타일). 옛 AnalysisApp 이 갖고 있던
//   · 합성 저장(브랜딩 포함)  · /result/{id} 공유 링크(OG 미리보기)  · 이메일 전송
// 을 free-pivot 흐름에 복원한다. 이 흐름엔 톤 분석 텍스트가 없어 합성/이메일은
// 룩 이미지 + 스타일명/설명 + 브랜딩으로 구성된다.

import { useState, useEffect } from 'react'
import ResultGrid from '../result-grid/ResultGrid'
import { ProductGridCard } from '../result-grid/ProductGridCard'
import BeforeAfterSlider from './BeforeAfterSlider'
import { styleById, type MakeupStyleId } from '../../lib/makeup/styles'
import { buildMakeupComposite } from '../../lib/makeup/composite'
import { saveSharedResult } from '../../lib/shareResult'
import { supabase } from '../../lib/supabase'
import type { ProductRec } from '../../lib/recommendations/types'

const PRIMARY = '#eb4763'
const NAVY = '#070953'
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

interface Props {
  styleId: MakeupStyleId
  /** 원본 셀카 */
  beforeSrc?: string
  /** 실제 인페인팅 결과(P1-3). 없으면 "생성 준비 중" 자리표시 — 디버그 마스크는 노출 안 함. */
  afterSrc?: string
  onRetake: () => void
  onBack: () => void
  isEn?: boolean
}

export default function MakeupResult({ styleId, beforeSrc, afterSrc, onRetake, onBack, isEn = false }: Props) {
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

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data }) => {
      const e = data.session?.user?.email
      if (!cancelled && e) setEmail((cur) => cur || e)
    }).catch(() => { /* 세션 없음 — 익명 입력 */ })
    return () => { cancelled = true }
  }, [])

  const fileName = `kisskin-makeup-${styleId}.jpg`
  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iP(hone|ad|od)/i.test(navigator.userAgent || '')

  const buildComposite = () => buildMakeupComposite({ afterSrc: afterSrc!, styleName, styleDesc, isEn })

  // 결과를 Supabase 에 저장하고 /result/{id} 공유 URL 을 반환(중복 저장 방지).
  const ensureShareUrl = async (compositeDataUrl: string): Promise<string> => {
    if (shareId) return `https://kissinskin.net/result/${shareId}`
    const report = JSON.stringify({ analysis: null, products: [], look: styleName })
    const id = await saveSharedResult(compositeDataUrl, report, '', [styleName])
    setShareId(id)
    return `https://kissinskin.net/result/${id}`
  }

  // 저장 — 모바일: 네이티브 공유 시트("사진 앨범에 저장"). 데스크톱: 파일 다운로드.
  const handleSave = async () => {
    if (!afterSrc) return
    try {
      const canvas = await buildComposite()
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92)
      const file = new File([blob], fileName, { type: 'image/jpeg' })
      const nav = navigator
      if (isMobile && typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file] })
          gtagEvent('makeup_save', { style: styleId, method: 'share_sheet' })
          return
        } catch (e) {
          if (isAbort(e)) return
          /* 폴백으로 진행 */
        }
      }
      const url = URL.createObjectURL(blob)
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
    } catch {
      showToast(isEn ? 'Save failed — try again' : '저장에 실패했어요. 다시 시도해 주세요')
    }
  }

  // 공유 — ① 결과를 저장해 /result 링크 생성 ② 모바일: 이미지+링크 네이티브 공유
  //        ③ 데스크톱: 링크 복사(+ 하단 링크바 상시 노출). 데스크톱에서 "복사 링크가
  //        안 보이던" 문제를 상시 링크바로 확실히 해결.
  const handleShare = async () => {
    if (!afterSrc) return
    setSavingShare(true)
    try {
      const canvas = await buildComposite()
      const compositeDataUrl = canvas.toDataURL('image/jpeg', 0.9)
      let shareUrl = 'https://kissinskin.net/analysis/'
      try {
        shareUrl = await ensureShareUrl(compositeDataUrl)
      } catch (e) {
        console.warn('[makeup-share] save failed, falling back to tool URL', e)
      }
      const title = isEn ? 'AI Makeup — kisskin' : 'AI 메이크업 — kisskin'
      const text = isEn
        ? `I tried the ${styleName} look with AI makeup! Try it free 👉`
        : `AI 메이크업으로 ${styleName} 룩 완성! 나도 무료로 해보기 👉`
      const nav = navigator
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92)
      const file = new File([blob], fileName, { type: 'image/jpeg' })

      // 모바일: 이미지 파일 + 링크 네이티브 공유(바이럴 핵심)
      if (isMobile && typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title, text, url: shareUrl })
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
      const canvas = await buildComposite()
      const compositeDataUrl = canvas.toDataURL('image/jpeg', 0.9)
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
