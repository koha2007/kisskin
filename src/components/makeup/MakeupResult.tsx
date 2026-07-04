// AI 메이크업 — 비포/애프터 결과 화면 (FREE_PIVOT_PLAN §2 / 커밋 P1-1, screen3 시안)
// ────────────────────────────────────────────────────────────────────
// Stitch 시안(screen3.png) 레이아웃 채용: 상단 스타일 칩 → 비포/애프터 슬라이더
// → 저장/공유/다시 액션 → 룩 설명 → 추천 제품. 시안 폰트·색은 전부 우리 토큰.
//
// §8 가짜 이미지 금지(실데이터 연결 전 플레이스홀더):
//   · 비포/애프터: BeforeAfterSlider 의 텍스트+무드 스와치 플레이스홀더 (AI 가짜 얼굴 X)
//   · 추천 제품: 실제 affiliate 구조인 ProductGridCard 그대로 (이미지 없는 구조) +
//     플레이스홀더 ProductRec 데이터. AI 생성 가짜 제품 이미지 X.
// 실제 비포/애프터(P1-3)·실제 추천(도구 추천 데이터)이 붙으면 props 만 교체.

import { useState } from 'react'
import ResultGrid from '../result-grid/ResultGrid'
import { ProductGridCard } from '../result-grid/ProductGridCard'
import BeforeAfterSlider from './BeforeAfterSlider'
import { styleById, type MakeupStyleId } from '../../lib/makeup/styles'
import type { ProductRec } from '../../lib/recommendations/types'

const PRIMARY = '#eb4763'
const NAVY = '#070953'
const screenBg = { background: `linear-gradient(170deg, ${NAVY} 0%, #15123f 60%, #241a52 100%)` }

function gtagEvent(name: string, params?: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

// afterSrc 는 캔버스에서 만든 로컬 data URL(toDataURL) → CORS 없이 바로 Blob/File 변환 가능.
function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',')
  const mime = head.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bin = atob(body)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

const isAbort = (e: unknown) => e instanceof Error && e.name === 'AbortError'

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

  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2200)
  }

  const fileName = `kisskin-makeup-${styleId}.jpg`

  // 저장 — 데스크톱/안드로이드: <a download> 파일 다운로드. iOS Safari 는 blob download 를
  // 무시하므로 네이티브 공유 시트("이미지 저장")로 우회.
  const handleSave = async () => {
    if (!afterSrc) return
    const nav = typeof navigator !== 'undefined' ? navigator : undefined
    const isIOS = !!nav && /iP(hone|ad|od)/.test(nav.userAgent || '')
    if (isIOS && nav && typeof nav.canShare === 'function') {
      try {
        const file = new File([dataUrlToBlob(afterSrc)], fileName, { type: 'image/jpeg' })
        if (nav.canShare({ files: [file] })) {
          await nav.share({ files: [file] })
          gtagEvent('makeup_save', { style: styleId, method: 'ios_share' })
          return
        }
      } catch (e) {
        if (isAbort(e)) return
        /* 폴백으로 진행 */
      }
    }
    try {
      const url = URL.createObjectURL(dataUrlToBlob(afterSrc))
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
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

  // 공유 — ① 결과 이미지 파일 자체 공유(모바일 네이티브 시트, 바이럴 핵심)
  //        ② 파일 미지원 → URL 공유  ③ navigator.share 없음(데스크톱) → 링크 복사
  const handleShare = async () => {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const title = isEn ? 'AI Makeup — kisskin' : 'AI 메이크업 — kisskin'
    const text = isEn
      ? `I tried the ${style.subEn} look with AI makeup! Try it free 👉`
      : `AI 메이크업으로 ${style.nameKo} 룩 완성! 나도 무료로 해보기 👉`

    // ① 이미지 파일 공유
    if (afterSrc && nav && typeof nav.canShare === 'function') {
      try {
        const file = new File([dataUrlToBlob(afterSrc)], fileName, { type: 'image/jpeg' })
        if (nav.canShare({ files: [file] })) {
          await nav.share({ files: [file], title, text })
          gtagEvent('makeup_share', { style: styleId, method: 'file' })
          return
        }
      } catch (e) {
        if (isAbort(e)) return
        /* 링크 공유로 폴백 */
      }
    }
    // ② URL 공유
    if (nav && typeof nav.share === 'function') {
      try {
        await nav.share({ title, text, url: shareUrl })
        gtagEvent('makeup_share', { style: styleId, method: 'url' })
        return
      } catch (e) {
        if (isAbort(e)) return
        /* 클립보드로 폴백 */
      }
    }
    // ③ 데스크톱 폴백 — 링크 복사
    try {
      await nav!.clipboard.writeText(shareUrl)
      gtagEvent('makeup_share', { style: styleId, method: 'copy' })
      showToast(isEn ? 'Link copied to clipboard!' : '링크를 복사했어요!')
    } catch {
      showToast(isEn ? 'Copy failed — copy the URL manually' : '복사 실패 — 주소창의 링크를 복사해 주세요')
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
        <span className="shrink-0 text-[11px] font-bold bg-white/15 rounded-full px-3 py-1">
          {isEn ? style.subEn : style.nameKo}
        </span>
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
          <ActionBtn icon="ios_share" label={isEn ? 'Share' : '공유'} onClick={handleShare} disabled={pending} />
          <ActionBtn icon="refresh" label={isEn ? 'Retry' : '다시'} onClick={onRetake} />
        </div>

        {/* 룩 설명 */}
        <section className="mt-8">
          <h2 className="text-2xl font-extrabold tracking-tight">{isEn ? style.subEn : style.nameKo}</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-white/80">
            {isEn ? style.descEn : style.descKo}
          </p>
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
