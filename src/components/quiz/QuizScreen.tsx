// Shared full-screen quiz shell for the 4 free tools.
// Two layouts: 'fullscreen' (stacked option rows) and 'grid' (2×2 color/mood cards).
//
// 2026-07-23 — 랜딩(ToolLanding 의 firstQuestion 카드)과 같은 언어로 통일.
//   그 전까지 이 화면만 navy→accent 풀스크린 그라데이션에 흰 글자였다. 랜딩에서 1번
//   문항(크림 카드 + 흰 보기 행)을 누르는 순간 2번 문항이 보라 그라데이션으로 바뀌어,
//   같은 흐름 안에서 화면이 다른 앱으로 튀는 것처럼 보였다. 랜딩 → 퀴즈 → 결과 3단계 중
//   앞뒤가 크림인데 가운데만 어두웠던 것이다.
//   → 카드·보기 행·테두리를 랜딩과 1:1 로 맞춘다. 도구별 accent 는 아이브로우와
//     진행 바에만 남겨 각 도구의 정체성은 유지한다.
//
// IMPORTANT: this is shell-only — question content, option counts and scoring stay in each page.

const PRIMARY = '#d8503c'

export interface QuizOptionView {
  key: string | number
  text: string
  emoji?: string
  /** CSS gradient/color for the 'grid' variant card background */
  gradient?: string
  onSelect: () => void
}

interface QuizScreenProps {
  toolLabel: string
  step: number // 1-based current question number
  total: number
  question: string
  description?: string
  questionTag?: string // e.g. "Q1"
  variant?: 'fullscreen' | 'grid'
  options: QuizOptionView[]
  onBack: () => void
  fading?: boolean
  /** type/tool accent hex; defaults to brand primary */
  accent?: string
  isEn?: boolean
}

export function QuizScreen({
  toolLabel,
  step,
  total,
  question,
  description,
  questionTag,
  variant = 'fullscreen',
  options,
  onBack,
  fading = false,
  accent = PRIMARY,
  isEn = false,
}: QuizScreenProps) {
  const half = total >= 4 && step === Math.ceil(total / 2)

  return (
    <div className="min-h-[100dvh] flex flex-col font-display bg-background-light text-navy">
      <style>{quizScreenStyles}</style>

      {/* Top: back + progress */}
      <div className="px-5 pt-5 flex items-center gap-3 max-w-xl w-full mx-auto">
        <button
          onClick={onBack}
          aria-label={isEn ? 'Previous question' : '이전 질문'}
          className="shrink-0 w-9 h-9 flex items-center justify-center border border-navy/20 bg-white text-navy hover:border-navy active:scale-90 transition"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <div className="t-eyebrow flex items-center justify-between text-slate-500 mb-2">
            <span>{toolLabel}</span>
            <span className="tabular-nums">{isEn ? `Question ${step} / ${total}` : `질문 ${step} / ${total}`}</span>
          </div>
          <div className="flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 flex-1 transition-all duration-500"
                style={{ background: i < step ? accent : 'rgba(35, 42, 82, 0.14)' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Center: question card — 랜딩의 1번 문항 카드와 같은 조판 */}
      {/* 상단 정렬 — 세로 가운데로 두면 문항 길이에 따라 카드가 위아래로 튄다.
          8문항을 연속으로 넘기는 화면이라 위치가 고정돼야 눈이 따라가기 쉽다. */}
      <main
        className={`flex-1 flex flex-col px-5 pt-8 pb-10 md:pt-12 max-w-xl w-full mx-auto ${fading ? 'quiz-fadeout' : 'quiz-fadein'}`}
      >
        <div className="border border-navy/20 bg-cream p-5 text-left md:p-7">
          {questionTag && (
            <p className="t-eyebrow mb-2" style={{ color: accent }}>{questionTag}</p>
          )}
          <h2 className="t-h2 text-navy">{question}</h2>
          {description && <p className="t-caption mt-2 text-slate-600">{description}</p>}

          <div className={variant === 'grid' ? 'mt-5 grid grid-cols-2 gap-3' : 'mt-5 flex flex-col gap-2.5'}>
            {variant === 'grid'
              ? options.map((o) => (
                  <button
                    key={o.key}
                    onClick={o.onSelect}
                    /* 색 자체가 보기 내용이라 카드는 컬러 면을 유지한다. 다만 테두리는
                       크림 배경에 맞춰 navy 계열로 바꾼다. */
                    className="quiz-card relative aspect-[4/5] p-4 flex flex-col justify-end text-left overflow-hidden border border-navy/20 active:scale-[0.97] transition-transform"
                    style={{ background: o.gradient ?? '#ffffff' }}
                  >
                    <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 to-transparent" />
                    {o.emoji && <span className="relative text-3xl mb-2 drop-shadow-lg">{o.emoji}</span>}
                    <span className="relative t-caption font-bold text-white drop-shadow-lg">{o.text}</span>
                  </button>
                ))
              : options.map((o) => (
                  <button
                    key={o.key}
                    onClick={o.onSelect}
                    className="flex w-full items-center gap-3 border border-slate-300 bg-white px-4 py-3.5 text-left transition-colors hover:border-navy active:scale-[0.99]"
                  >
                    {o.emoji && <span className="shrink-0 text-xl">{o.emoji}</span>}
                    <span className="t-body flex-1 font-semibold text-navy">{o.text}</span>
                    <span className="material-symbols-outlined shrink-0 text-slate-400">arrow_forward</span>
                  </button>
                ))}
          </div>
        </div>

        {half && (
          <p className="t-label mt-4 text-center text-slate-500">
            {isEn ? 'Halfway there ✨' : '✨ 벌써 절반이에요!'}
          </p>
        )}
      </main>
    </div>
  )
}

export function QuizRedirecting({ isEn = false, accent = PRIMARY }: { isEn?: boolean; accent?: string }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-5 font-display bg-background-light">
      <div
        className="w-12 h-12 border-[3px] rounded-full animate-spin"
        style={{ borderColor: 'rgba(35, 42, 82, 0.16)', borderTopColor: accent }}
      />
      <p className="t-caption text-slate-600">{isEn ? 'Analyzing…' : '분석 중…'}</p>
    </div>
  )
}

const quizScreenStyles = `
  @keyframes quiz-fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes quiz-fadeout { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-12px); } }
  .quiz-fadein { animation: quiz-fadein 0.35s ease-out both; }
  .quiz-fadeout { animation: quiz-fadeout 0.22s ease-in both; }
`
