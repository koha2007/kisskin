// AI 메이크업 — 9스타일 선택 화면 (2026-07-05: 여성 9룩 복원, 3×3 그리드)
// ────────────────────────────────────────────────────────────────────
// 폰트·색은 우리 토큰 — Pretendard(font-display) / navy #070953 / primary #eb4763.
// 무드 그라데이션·글래스 카드 언어는 QuizScreen 의 grid variant 를 그대로 따라간다.
//
// §8 가짜 이미지 금지: 카드는 AI 생성 가짜 얼굴/제품 이미지 없이 스타일별
// "무드 색" 글래스 스와치만 쓴다. (추천 제품·결과 이미지는 결과 화면에서
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
  const selectedStyle = MAKEUP_STYLES.find((s) => s.id === selected) ?? MAKEUP_STYLES[0]

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
        className={`style-card group relative w-full rounded-xl aspect-[4/5] p-2.5 flex flex-col justify-end text-left overflow-hidden transition-all active:scale-[0.97] ${
          isSel
            ? 'ring-2 ring-white shadow-2xl shadow-black/40 scale-[1.03]'
            : 'ring-1 ring-white/15 opacity-90 hover:opacity-100'
        }`}
        style={{ background: s.mood }}
      >
        {/* 무드 색 위 하단 스크림 — 흰 텍스트 가독성 (밝은 그라데이션 대비) */}
        <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/65 to-transparent" />

        {/* 선택 체크 (우상단 동그라미 체크) */}
        {isSel && (
          <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              check
            </span>
          </span>
        )}

        <span className="relative">
          {isEn ? (
            <span className="block text-white font-extrabold text-[10.5px] leading-tight tracking-tight drop-shadow-md">
              {s.subEn}
            </span>
          ) : (
            <>
              <span className="block text-white font-extrabold text-[12px] leading-tight drop-shadow-md">
                {s.nameKo}
              </span>
              <span className="block text-white/70 text-[7.5px] font-bold tracking-wide mt-0.5 drop-shadow leading-tight">
                {s.subEn}
              </span>
            </>
          )}
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

        <div className="grid grid-cols-3 gap-2.5">
          {MAKEUP_STYLES.map((s) => (
            <Card key={s.id} id={s.id} />
          ))}
        </div>

        {/* 선택한 스타일 한 줄 설명 (카드 안엔 공간이 없어 그리드 아래에서 안내) */}
        <p className="mt-4 text-center text-[13px] text-white/75 leading-snug min-h-[1.2em]">
          {isEn ? selectedStyle.descEn : selectedStyle.descKo}
        </p>
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
