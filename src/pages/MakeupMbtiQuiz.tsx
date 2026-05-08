import { useState, useEffect, useMemo } from 'react'
import { QUESTIONS, computeMbti, type QuizOption } from '../lib/makeup-mbti/questions'
import { MAKEUP_MBTI_TYPES, MBTI_ORDER } from '../lib/makeup-mbti/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { useI18n } from '../i18n/I18nContext'

type Phase = 'intro' | 'quiz' | 'redirecting'

export default function MakeupMbtiQuiz() {
  const { t } = useI18n()
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<QuizOption['letter'][]>([])
  const [fading, setFading] = useState(false)

  const q = QUESTIONS[currentIdx]
  const progress = useMemo(() => ((currentIdx) / QUESTIONS.length) * 100, [currentIdx])

  useEffect(() => {
    if (phase === 'quiz') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [phase, currentIdx])

  const onSelect = (letter: QuizOption['letter']) => {
    setFading(true)
    setTimeout(() => {
      const next = [...answers, letter]
      setAnswers(next)
      if (next.length >= QUESTIONS.length) {
        const code = computeMbti(next)
        const slug = MAKEUP_MBTI_TYPES[code].slug
        setPhase('redirecting')
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('makeup-mbti-answers', JSON.stringify(next))
          window.location.href = `/tools/makeup-mbti/${slug}/`
        }
      } else {
        setCurrentIdx(currentIdx + 1)
        setFading(false)
      }
    }, 220)
  }

  const onBack = () => {
    if (currentIdx === 0) {
      setPhase('intro')
      setAnswers([])
      return
    }
    setAnswers(answers.slice(0, -1))
    setCurrentIdx(currentIdx - 1)
  }

  /* ---------- INTRO ---------- */
  if (phase === 'intro') {
    return (
      <div className="font-display bg-background-light min-h-screen">
        <style>{styles}</style>

        {/* Nav */}
        <ToolsNav />

        <main>
        {/* Hero */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-pink-200/40 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t('tools.mbti.badge')}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-navy mb-4">
              나의 메이크업 MBTI는?
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl mx-auto">
              8문항으로 알아보는 당신의 메이크업 성향.
              <strong className="text-primary"> 16가지 유형</strong> 중 당신에게 맞는 K-뷰티 스타일과 제품 공식을 추천해드립니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button
                onClick={() => setPhase('quiz')}
                className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-10 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/25"
              >
                {t('tools.common.startQuiz')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <a
                href="#types-preview"
                className="border border-pink-200 hover:border-primary/30 hover:bg-pink-50 px-10 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 text-slate-700"
              >
                <span className="material-symbols-outlined text-primary">grid_view</span>
                {t('tools.mbti.previewCta')}
              </a>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">schedule</span>
                {t('tools.common.about2min')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">lock</span>
                {t('tools.common.freeNoLogin')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">share</span>
                {t('tools.common.shareable')}
              </span>
            </div>
          </div>
        </section>

        {/* What is Makeup MBTI */}
        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy text-center mb-8 tracking-tight">
              메이크업 MBTI란?
            </h2>
            <div className="prose max-w-none text-slate-600 leading-relaxed space-y-4">
              <p>
                메이크업 MBTI는 마이어스-브릭스 성격유형 지표(MBTI) 4가지 축을 메이크업 선호도에 맞게 재해석한 테스트입니다.
                해외의 메이크업 아키타입 연구(Dear Peachie 8 archetype 시스템), 국내 여대생 314명 대상의 MBTI·뷰티 습관 실증 조사, 그리고 2024~2026년 K-뷰티 트렌드 분석을 종합하여
                4가지 축 × 16가지 유형으로 재구성했습니다.
              </p>
              <p className="font-semibold text-navy-mid mt-6">4가지 축:</p>
              <ul className="space-y-3 list-none pl-0">
                <li className="flex items-start gap-3">
                  <span className="shrink-0 px-2.5 py-0.5 bg-pink-100 text-primary-dark text-xs font-bold rounded-full">E · I</span>
                  <span><strong>표현(Expression)</strong> — 강렬한 포인트를 선호하는가(E), 은은한 내면 글로우를 선호하는가(I).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 px-2.5 py-0.5 bg-pink-100 text-primary-dark text-xs font-bold rounded-full">N · S</span>
                  <span><strong>영감(Source)</strong> — 새로운 실험·트렌드에서 영감을 얻는가(N), 검증된 내 공식을 신뢰하는가(S).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 px-2.5 py-0.5 bg-pink-100 text-primary-dark text-xs font-bold rounded-full">F · T</span>
                  <span><strong>무드(Feel)</strong> — 블러·소프트 무드를 선호하는가(F), 샤프한 라인·구조를 선호하는가(T).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 px-2.5 py-0.5 bg-pink-100 text-primary-dark text-xs font-bold rounded-full">P · J</span>
                  <span><strong>루틴(Routine)</strong> — 기분 따라 즉흥적으로 스타일링하는가(P), 공식화된 루틴을 유지하는가(J).</span>
                </li>
              </ul>
              <p className="mt-6">
                각 유형에 kissinskin의 9가지 여성 스타일 / 9가지 남성 스타일 중 가장 잘 맞는 조합을 매핑해,
                단순 진단을 넘어 <strong>실제로 시도해볼 수 있는 K-뷰티 룩</strong>을 제안해드립니다.
              </p>
            </div>
          </div>
        </section>

        {/* 16 Types Preview (for SEO internal linking) */}
        <section id="types-preview" className="py-14 bg-gradient-to-b from-background-light via-pink-50/30 to-background-light">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 text-primary-dark text-sm font-bold uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
                <span className="material-symbols-outlined text-base">grid_view</span>
                16가지 유형
              </span>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-navy mt-4">
                당신은 어느 유형인가요?
              </h2>
              <p className="text-slate-500 mt-2 max-w-lg mx-auto text-sm md:text-base">
                각 카드를 눌러 유형별 상세 설명·추천 메이크업을 먼저 볼 수 있어요.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {MBTI_ORDER.map(code => {
                const t = MAKEUP_MBTI_TYPES[code]
                return (
                  <a
                    key={code}
                    href={`/tools/makeup-mbti/${t.slug}/`}
                    className="group bg-white rounded-2xl p-4 md:p-5 border border-pink-100 hover:border-primary/40 hover:shadow-lg hover:shadow-pink-100/50 transition-all hover:-translate-y-0.5"
                  >
                    <div className="text-3xl md:text-4xl mb-2">{t.emoji}</div>
                    <div className="text-xs font-mono text-slate-400 tracking-wider mb-1">{t.code}</div>
                    <div className="text-sm md:text-base font-extrabold text-navy-mid group-hover:text-primary transition-colors leading-snug">
                      {t.koName}
                    </div>
                    <div className="text-[0.7rem] text-slate-400 mt-1">{t.enName}</div>
                  </a>
                )
              })}
            </div>

            <div className="text-center mt-10">
              <button
                onClick={() => setPhase('quiz')}
                className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary/25 inline-flex items-center gap-2"
              >
                {t('tools.common.startQuiz')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        </main>
        <ToolsFooter />
      </div>
    )
  }

  /* ---------- REDIRECTING ---------- */
  if (phase === 'redirecting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light gap-4">
        <style>{styles}</style>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 text-sm">{t('tools.common.analyzing')}</p>
      </div>
    )
  }

  /* ---------- QUIZ ---------- */
  return (
    <div className="font-display bg-background-light min-h-screen flex flex-col">
      <style>{styles}</style>

      {/* Progress */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-pink-50 text-slate-500 hover:text-primary transition-colors"
            aria-label={t('tools.common.previousQuestion')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-primary">Q {currentIdx + 1} / {QUESTIONS.length}</span>
              <span className="text-slate-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-pink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <main className="flex-1 flex items-center justify-center py-8 md:py-14">
        <div className={`max-w-2xl mx-auto px-4 sm:px-6 w-full ${fading ? 'mbti-q-fadeout' : 'mbti-q-fadein'}`}>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-primary-dark font-bold mb-4">
            Q{q.id}
          </p>
          <h2 className="text-xl md:text-3xl font-extrabold text-navy text-center leading-tight tracking-tight mb-3 md:mb-4">
            {q.question}
          </h2>
          {q.description && (
            <p className="text-center text-sm md:text-base text-slate-500 mb-8 md:mb-10 max-w-lg mx-auto leading-relaxed">
              {q.description}
            </p>
          )}

          <div className="flex flex-col gap-3 md:gap-4">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onSelect(opt.letter)}
                className="group bg-white border-2 border-pink-100 hover:border-primary hover:shadow-lg hover:shadow-pink-100/50 rounded-2xl p-5 md:p-6 text-left transition-all hover:-translate-y-0.5 flex items-center gap-4"
              >
                <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-pink-50 to-rose-50 group-hover:from-primary/10 group-hover:to-pink-500/10 flex items-center justify-center text-2xl md:text-3xl transition-colors">
                  {opt.emoji}
                </div>
                <p className="flex-1 text-sm md:text-lg font-semibold text-navy-mid group-hover:text-primary transition-colors leading-snug">
                  {opt.text}
                </p>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

const styles = `
  @keyframes mbti-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes mbti-fadeout { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }
  .mbti-q-fadein { animation: mbti-fadein 0.35s ease-out both; }
  .mbti-q-fadeout { animation: mbti-fadeout 0.22s ease-in both; }
`
