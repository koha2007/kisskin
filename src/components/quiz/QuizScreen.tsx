// Shared full-screen quiz shell for the 4 free tools.
// Two layouts: 'fullscreen' (gradient + glass option chips) and 'grid' (2×2 color/mood cards).
// Visual language matches the result IdentityCard gradient (navy → type color).
// IMPORTANT: this is shell-only — question content, option counts and scoring stay in each page.

const NAVY = '#070953'
const PRIMARY = '#eb4763'

export function quizBg(accent: string = PRIMARY) {
  return { background: `linear-gradient(160deg, ${NAVY} 0%, #1a1268 42%, ${accent} 125%)` }
}

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
    <div className="min-h-[100dvh] flex flex-col font-display text-white" style={quizBg(accent)}>
      <style>{quizScreenStyles}</style>

      {/* Top: back + progress dots */}
      <div className="px-5 pt-5 flex items-center gap-3 max-w-xl w-full mx-auto">
        <button
          onClick={onBack}
          aria-label={isEn ? 'Previous question' : '이전 질문'}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 transition"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-bold text-white/70 mb-2">
            <span className="uppercase tracking-wider">{toolLabel}</span>
            <span>{isEn ? `Question ${step} / ${total}` : `질문 ${step} / ${total}`}</span>
          </div>
          <div className="flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all duration-500"
                style={{ background: i < step ? '#ffffff' : 'rgba(255,255,255,0.22)' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Center: question + options */}
      <main
        className={`flex-1 flex flex-col justify-center px-5 pb-10 max-w-xl w-full mx-auto ${fading ? 'quiz-fadeout' : 'quiz-fadein'}`}
      >
        <div className="mb-8">
          {questionTag && (
            <p className="text-xs font-bold tracking-[0.25em] text-white/55 mb-3 uppercase">{questionTag}</p>
          )}
          <h2 className="text-2xl md:text-3xl font-extrabold leading-snug tracking-tight">{question}</h2>
          {description && <p className="text-sm md:text-base text-white/70 mt-3 leading-relaxed">{description}</p>}
          {half && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 rounded-full px-3 py-1">
              {isEn ? 'Halfway there! ✨' : '✨ 벌써 절반이에요!'}
            </p>
          )}
        </div>

        {variant === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {options.map((o) => (
              <button
                key={o.key}
                onClick={o.onSelect}
                className="quiz-card relative rounded-2xl aspect-[4/5] p-4 flex flex-col justify-end text-left overflow-hidden border border-white/20 active:scale-[0.97] transition-transform"
                style={{ background: o.gradient ?? 'rgba(255,255,255,0.12)' }}
              >
                {/* bottom scrim keeps white text readable even on light gradients */}
                <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent" />
                {o.emoji && <span className="relative text-3xl mb-2 drop-shadow-lg">{o.emoji}</span>}
                <span className="relative text-white font-bold text-sm leading-snug drop-shadow-lg">{o.text}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {options.map((o, i) => (
              <button
                key={o.key}
                onClick={o.onSelect}
                className={`w-full text-left rounded-2xl px-5 py-4 flex items-center gap-3 active:scale-[0.98] transition-all ${
                  i === 0
                    ? 'bg-white text-navy shadow-xl shadow-black/20'
                    : 'bg-white/12 text-white border border-white/25 backdrop-blur-md hover:bg-white/20'
                }`}
              >
                {o.emoji && <span className="text-2xl shrink-0">{o.emoji}</span>}
                <span className="flex-1 font-semibold text-[15px] md:text-base leading-snug">{o.text}</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export function QuizRedirecting({ isEn = false, accent = PRIMARY }: { isEn?: boolean; accent?: string }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-5 font-display text-white" style={quizBg(accent)}>
      <div className="w-12 h-12 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
      <p className="text-sm text-white/80">{isEn ? 'Analyzing…' : '분석 중…'}</p>
    </div>
  )
}

const quizScreenStyles = `
  @keyframes quiz-fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes quiz-fadeout { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-12px); } }
  .quiz-fadein { animation: quiz-fadein 0.35s ease-out both; }
  .quiz-fadeout { animation: quiz-fadeout 0.22s ease-in both; }
`
