// AI 메이크업 — 5스타일 선택 화면 (FREE_PIVOT_PLAN §2-1 / 커밋 P1-1)
// ────────────────────────────────────────────────────────────────────
// Stitch 시안(screen.png) 레이아웃 채용: 2열 글래스 카드 + 가운데 5번째.
// 시안 폰트(Plus Jakarta Sans)·색(#ffb2b8)은 전부 우리 토큰으로 교체 —
// Pretendard(font-display) / navy #070953 / primary #eb4763.
// 무드 그라데이션·글래스 카드 언어는 QuizScreen 의 grid variant 를 그대로 따라간다.
//
// §8 가짜 이미지 금지: 카드는 AI 생성 가짜 얼굴/제품 이미지 없이 스타일별
// "무드 색" 글래스 스와치만 쓴다. (추천 제품·결과 이미지는 P1-3 결과 화면에서
//  실제 affiliate ProductGridCard / 텍스트 카드로 처리)
//
// 1개 선택 = 1크레딧 = 결과 1장.

import { useState } from 'react'
import { MAKEUP_STYLES, type MakeupStyleId } from '../../lib/makeup/styles'

const NAVY = '#070953'
const PRIMARY = '#eb4763'

// 화면 배경: 결과 IdentityCard·QuizScreen 과 동일한 navy → primary 그라데이션.
const screenBg = { background: `linear-gradient(160deg, ${NAVY} 0%, #1a1268 45%, ${PRIMARY} 125%)` }

function gtagEvent(name: string, params?: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

interface Props {
  /** "이 스타일로 생성하기" → 선택된 스타일 id 전달 (다음 단계 = 셀카 업로드/생성) */
  onConfirm: (styleId: MakeupStyleId) => void
  onBack: () => void
  isEn?: boolean
  /** 진입 시 미리 선택해 둘 스타일 (없으면 첫 스타일) */
  initialStyle?: MakeupStyleId
}

export default function MakeupStyleSelect({ onConfirm, onBack, isEn = false, initialStyle }: Props) {
  const [selected, setSelected] = useState<MakeupStyleId>(initialStyle ?? MAKEUP_STYLES[0].id)

  const grid = MAKEUP_STYLES.slice(0, 4) // 2열 × 2
  const last = MAKEUP_STYLES[4] // 가운데 5번째

  const handleConfirm = () => {
    gtagEvent('style_selected', { style: selected })
    onConfirm(selected)
  }

  const Card = ({ id }: { id: MakeupStyleId }) => {
    const s = MAKEUP_STYLES.find((x) => x.id === id)!
    const isSel = selected === id
    return (
      <button
        type="button"
        onClick={() => setSelected(id)}
        aria-pressed={isSel}
        className={`style-card group relative w-full rounded-2xl aspect-[4/5] p-4 flex flex-col justify-end text-left overflow-hidden transition-all active:scale-[0.97] ${
          isSel
            ? 'ring-2 ring-white shadow-2xl shadow-black/40 scale-[1.02]'
            : 'ring-1 ring-white/15 opacity-90 hover:opacity-100'
        }`}
        style={{ background: s.mood }}
      >
        {/* 무드 색 위 하단 스크림 — 흰 텍스트 가독성 (밝은 그라데이션 대비) */}
        <span className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/60 to-transparent" />

        {/* 선택 체크 (시안 우상단 동그라미 체크) */}
        {isSel && (
          <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white text-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              check
            </span>
          </span>
        )}

        <span className="relative">
          {isEn ? (
            <span className="block text-white font-extrabold text-[13.5px] leading-tight tracking-wide drop-shadow-md">
              {s.subEn}
            </span>
          ) : (
            <>
              <span className="block text-white font-extrabold text-[15px] leading-tight drop-shadow-md">
                {s.nameKo}
              </span>
              <span className="block text-white/75 text-[10px] font-bold tracking-wider mt-0.5 drop-shadow">
                {s.subEn}
              </span>
            </>
          )}
          <span className="block text-white/85 text-[11px] leading-snug mt-1.5 drop-shadow">
            {isEn ? s.descEn : s.descKo}
          </span>
        </span>
      </button>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col font-display text-white" style={screenBg}>
      {/* 상단: 뒤로 + 타이틀 + 진행 점 (스타일→셀카→결과) */}
      <header className="px-5 pt-5 flex items-center gap-3 max-w-xl w-full mx-auto">
        <button
          onClick={onBack}
          aria-label={isEn ? 'Back' : '뒤로'}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 transition"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-base font-bold tracking-tight">{isEn ? 'AI Makeup' : 'AI 메이크업'}</h1>
        <div className="shrink-0 flex items-center gap-1.5" aria-hidden>
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </header>

      {/* 본문: 제목 + 5 카드 */}
      <main className="flex-1 flex flex-col px-5 pt-6 pb-4 max-w-xl w-full mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold leading-snug tracking-tight">
            {isEn ? 'Which makeup shall we try?' : '어떤 메이크업을 입혀볼까요?'}
          </h2>
          <p className="text-sm md:text-base text-white/70 mt-2">
            {isEn ? 'Pick one style to try on.' : '스타일 하나를 골라주세요'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {grid.map((s) => (
            <Card key={s.id} id={s.id} />
          ))}
        </div>
        {/* 가운데 5번째 (시안 레이아웃) */}
        <div className="mt-3 flex justify-center">
          <div className="w-1/2 px-1.5">
            <Card id={last.id} />
          </div>
        </div>
      </main>

      {/* 하단: "1장 생성" 안내 + CTA (sticky) */}
      <footer
        className="sticky bottom-0 px-5 pt-3 pb-6 max-w-xl w-full mx-auto"
        style={{ background: 'linear-gradient(to top, rgba(7,9,83,0.95) 60%, transparent)' }}
      >
        <p className="text-center text-xs font-bold text-white/80 mb-2.5 inline-flex w-full items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          {isEn ? '1 credit · 1 result image' : '1크레딧 = 결과 1장 생성'}
        </p>
        <button
          onClick={handleConfirm}
          className="w-full rounded-full py-4 font-extrabold text-[15px] text-white shadow-xl shadow-primary/30 active:scale-[0.98] transition-transform"
          style={{ background: PRIMARY }}
        >
          {isEn ? 'Try this style' : '이 스타일로 생성하기'}
        </button>
      </footer>
    </div>
  )
}
