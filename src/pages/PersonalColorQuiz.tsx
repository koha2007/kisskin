import { useState, useEffect, useMemo } from 'react'
import { PC_QUESTIONS, computeSeason, type PCAnswer } from '../lib/personal-color/questions'
import { PERSONAL_COLOR_TYPES, SEASON_ORDER } from '../lib/personal-color/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { useI18n } from '../i18n/I18nContext'

// Back-compat re-exports (FaceShape pages import these names from this file)
export { ToolsNav as ToolNav, ToolsFooter as ToolFooter } from '../components/ToolsLayout'

type Phase = 'intro' | 'quiz' | 'redirecting'

export default function PersonalColorQuiz() {
  const { t } = useI18n()
  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<PCAnswer[]>([])
  const [fading, setFading] = useState(false)
  const q = PC_QUESTIONS[idx]
  const progress = useMemo(() => (idx / PC_QUESTIONS.length) * 100, [idx])

  useEffect(() => {
    if (phase === 'quiz') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase, idx])

  const onSelect = (v: PCAnswer) => {
    setFading(true)
    setTimeout(() => {
      const next = [...answers, v]
      setAnswers(next)
      if (next.length >= PC_QUESTIONS.length) {
        const season = computeSeason(next)
        const slug = PERSONAL_COLOR_TYPES[season].slug
        setPhase('redirecting')
        if (typeof window !== 'undefined') window.location.href = `/tools/personal-color/${slug}/`
      } else {
        setIdx(idx + 1)
        setFading(false)
      }
    }, 220)
  }

  const onBack = () => {
    if (idx === 0) { setPhase('intro'); setAnswers([]); return }
    setAnswers(answers.slice(0, -1))
    setIdx(idx - 1)
  }

  if (phase === 'intro') {
    return (
      <div className="font-display bg-background-light min-h-screen">
        <style>{quizStyles}</style>
        <ToolsNav />
        <main>

        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-200/40 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="material-symbols-outlined text-sm">palette</span>
              {t('tools.pc.badge')}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-navy mb-4">
              나의 퍼스널 컬러는?
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl mx-auto">
              10문항으로 알아보는 봄 웜톤 / 여름 쿨톤 / 가을 웜톤 / 겨울 쿨톤.
              <strong className="text-amber-600"> 4계절 퍼스널 컬러 시스템</strong>에 기반해 나에게 어울리는 색과 메이크업을 추천해드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button onClick={() => setPhase('quiz')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25">
                {t('tools.common.startDiagnosis')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <a href="#seasons-preview" className="border border-amber-200 hover:border-amber-400 hover:bg-amber-50 px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 text-slate-700">
                <span className="material-symbols-outlined text-amber-600">grid_view</span>
                {t('tools.pc.previewCta')}
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">schedule</span> {t('tools.common.about2min')}</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">lock</span> {t('tools.common.freeNoLogin')}</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">share</span> {t('tools.common.shareable')}</span>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy text-center mb-8 tracking-tight">퍼스널 컬러란?</h2>
            <div className="prose max-w-none text-slate-600 leading-relaxed space-y-4">
              <p>퍼스널 컬러(Personal Color)는 개인이 가진 고유의 신체 색(피부·모발·눈동자)과 조화를 이루어 얼굴을 가장 생기 있게 만들어주는 색 군을 말합니다. 1980년대 미국 컬러리스트 Carole Jackson이 "Color Me Beautiful"에서 체계화한 4계절 시스템(봄·여름·가을·겨울)이 전 세계에서 가장 널리 쓰이며, 한국에서는 여기에 세부 16타입(Tone in Tone) 분류가 추가되기도 합니다.</p>
              <p className="font-semibold text-navy-mid mt-6">핵심은 2가지 축:</p>
              <ul className="space-y-3 list-none pl-0">
                <li className="flex items-start gap-3"><span className="shrink-0 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Warm · Cool</span><span><strong>언더톤</strong> — 피부 아래 깔린 바탕색이 노란 기운(웜)인지, 푸른 기운(쿨)인지.</span></li>
                <li className="flex items-start gap-3"><span className="shrink-0 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Light · Deep</span><span><strong>명도</strong> — 밝고 화사한 톤(봄·여름)인지, 깊고 풍부한 톤(가을·겨울)인지.</span></li>
              </ul>
              <p className="mt-6">이 2가지 축의 조합으로 <strong>4가지 시즌</strong>이 결정됩니다. 각 시즌마다 어울리는 의상·메이크업·헤어 컬러가 다르며, 내 시즌을 알면 쇼핑·메이크업 실수가 크게 줄어듭니다.</p>
            </div>
          </div>
        </section>

        <section id="seasons-preview" className="py-14 bg-gradient-to-b from-background-light via-amber-50/20 to-background-light">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy mb-2 tracking-tight">4가지 퍼스널 컬러</h2>
              <p className="text-slate-500 text-sm">카드를 눌러 시즌별 특징과 어울리는 색을 먼저 볼 수 있어요.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {SEASON_ORDER.map(c => {
                const t = PERSONAL_COLOR_TYPES[c]
                return (
                  <a key={c} href={`/tools/personal-color/${t.slug}/`} className="group bg-white rounded-2xl p-5 border border-pink-100 hover:shadow-lg transition-all hover:-translate-y-0.5" style={{ borderColor: `${t.primaryColor}30` }}>
                    <div className="text-4xl mb-2">{t.emoji}</div>
                    <div className="text-xs font-mono tracking-wider mb-1" style={{ color: t.primaryColor }}>{t.tone}</div>
                    <div className="font-extrabold text-navy-mid group-hover:text-primary">{t.koName}</div>
                    <div className="text-[0.7rem] text-slate-400 mt-1">{t.enName}</div>
                  </a>
                )
              })}
            </div>
            <div className="text-center mt-10">
              <button onClick={() => setPhase('quiz')} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-amber-500/25 inline-flex items-center gap-2">
                {t('tools.common.startDiagnosis')}
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

  if (phase === 'redirecting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light gap-4">
        <style>{quizStyles}</style>
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 text-sm">{t('tools.common.analyzing')}</p>
      </div>
    )
  }

  return (
    <div className="font-display bg-background-light min-h-screen flex flex-col">
      <style>{quizStyles}</style>
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-amber-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-amber-50 text-slate-500 hover:text-amber-600" aria-label={t('tools.common.previousQuestion')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-amber-600">Q {idx + 1} / {PC_QUESTIONS.length}</span>
              <span className="text-slate-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center py-8 md:py-14">
        <div className={`max-w-2xl mx-auto px-4 sm:px-6 w-full ${fading ? 'pc-q-fadeout' : 'pc-q-fadein'}`}>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-amber-600 font-bold mb-4">Q{q.id}</p>
          <h2 className="text-xl md:text-3xl font-extrabold text-navy text-center leading-tight tracking-tight mb-3">{q.question}</h2>
          {q.description && <p className="text-center text-sm md:text-base text-slate-500 mb-8 max-w-lg mx-auto">{q.description}</p>}
          <div className="flex flex-col gap-3 md:gap-4">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => onSelect(opt.value)} className="group bg-white border-2 border-amber-100 hover:border-amber-500 hover:shadow-lg rounded-2xl p-5 md:p-6 text-left transition-all hover:-translate-y-0.5 flex items-center gap-4">
                <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 group-hover:from-amber-100 group-hover:to-orange-100 flex items-center justify-center text-2xl md:text-3xl">{opt.emoji}</div>
                <p className="flex-1 text-sm md:text-lg font-semibold text-navy-mid group-hover:text-amber-700">{opt.text}</p>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

const quizStyles = `
  @keyframes pc-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pc-fadeout { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }
  .pc-q-fadein { animation: pc-fadein 0.35s ease-out both; }
  .pc-q-fadeout { animation: pc-fadeout 0.22s ease-in both; }
`
