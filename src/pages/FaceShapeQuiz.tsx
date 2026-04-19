import { useState, useEffect, useMemo } from 'react'
import { FS_QUESTIONS, computeFaceShape, type FSAnswer } from '../lib/face-shape/questions'
import { FACE_SHAPE_TYPES, FACE_SHAPE_ORDER } from '../lib/face-shape/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { useI18n } from '../i18n/I18nContext'

type Phase = 'intro' | 'quiz' | 'redirecting'

export default function FaceShapeQuiz() {
  const { t } = useI18n()
  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<FSAnswer[]>([])
  const [fading, setFading] = useState(false)
  const q = FS_QUESTIONS[idx]
  const progress = useMemo(() => (idx / FS_QUESTIONS.length) * 100, [idx])

  useEffect(() => {
    if (phase === 'quiz') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase, idx])

  const onSelect = (v: FSAnswer) => {
    setFading(true)
    setTimeout(() => {
      const next = [...answers, v]
      setAnswers(next)
      if (next.length >= FS_QUESTIONS.length) {
        const shape = computeFaceShape(next)
        const slug = FACE_SHAPE_TYPES[shape].slug
        setPhase('redirecting')
        if (typeof window !== 'undefined') window.location.href = `/tools/face-shape/${slug}/`
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
        <style>{fsStyles}</style>
        <ToolsNav />
        <main>

        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-200/30 to-transparent rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="material-symbols-outlined text-sm">face</span>
              {t('tools.fs.badge')}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-navy mb-4">
              나의 얼굴형은?
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl mx-auto">
              8문항으로 알아보는 계란형·둥근형·각진형·긴형·하트형.
              <strong className="text-emerald-600"> 얼굴형별 맞춤 컨투어링</strong>과 메이크업·헤어·안경 가이드를 함께 제공합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button onClick={() => setPhase('quiz')} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25">
                {t('tools.common.startDiagnosis')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <a href="#shapes-preview" className="border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 text-slate-700">
                <span className="material-symbols-outlined text-emerald-600">grid_view</span>
                {t('tools.fs.previewCta')}
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">schedule</span> {t('tools.common.about2min')}</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">lock</span> {t('tools.common.freeNoLogin')}</span>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy text-center mb-8 tracking-tight">얼굴형 진단이 왜 중요한가요?</h2>
            <div className="prose max-w-none text-slate-600 leading-relaxed space-y-4">
              <p>얼굴형은 메이크업 컨투어링의 시작점입니다. 같은 메이크업 기법이라도 얼굴형에 따라 전혀 다른 결과를 만듭니다. 예를 들어 둥근형과 긴형에게 컨투어링은 정반대 방향으로 적용되어야 합니다 — 둥근형은 세로 입체감을, 긴형은 가로 입체감을 추가해야 합니다.</p>
              <p>한국 미용학 연구(KISTI, 20대 여성 얼굴 유형 분류)에 따르면 대부분의 얼굴은 <strong>계란형 · 둥근형 · 각진형 · 긴형 · 하트형</strong> 5가지 기본 유형에 속하며, 이 기본 유형 기준으로 컨투어·블러쉬·헤어스타일·안경 선택의 가이드라인이 존재합니다.</p>
              <p>이 진단은 외형적 특징 8가지를 종합해 가장 가까운 기본 유형을 찾아드립니다. 성형 권유나 콤플렉스 자극이 아닌, <strong>"내 얼굴형의 강점을 살리는 법"</strong>을 안내하는 것이 목적입니다.</p>
            </div>
          </div>
        </section>

        <section id="shapes-preview" className="py-14 bg-gradient-to-b from-background-light via-emerald-50/20 to-background-light">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy mb-2 tracking-tight">5가지 얼굴형</h2>
              <p className="text-slate-500 text-sm">카드를 눌러 얼굴형별 특징과 맞춤 컨투어를 먼저 볼 수 있어요.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {FACE_SHAPE_ORDER.map(c => {
                const t = FACE_SHAPE_TYPES[c]
                return (
                  <a key={c} href={`/tools/face-shape/${t.slug}/`} className="group bg-white rounded-2xl p-5 border hover:shadow-lg transition-all hover:-translate-y-0.5" style={{ borderColor: `${t.primaryColor}30` }}>
                    <div className="text-4xl mb-2">{t.emoji}</div>
                    <div className="font-extrabold text-navy-mid group-hover:text-emerald-600">{t.koName}</div>
                    <div className="text-[0.7rem] text-slate-400 mt-1">{t.enName}</div>
                  </a>
                )
              })}
            </div>
            <div className="text-center mt-10">
              <button onClick={() => setPhase('quiz')} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-emerald-500/25 inline-flex items-center gap-2">
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
        <style>{fsStyles}</style>
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 text-sm">{t('tools.common.analyzing')}</p>
      </div>
    )
  }

  return (
    <div className="font-display bg-background-light min-h-screen flex flex-col">
      <style>{fsStyles}</style>
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-emerald-50 text-slate-500 hover:text-emerald-600" aria-label={t('tools.common.previousQuestion')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-emerald-600">Q {idx + 1} / {FS_QUESTIONS.length}</span>
              <span className="text-slate-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center py-8 md:py-14">
        <div className={`max-w-2xl mx-auto px-4 sm:px-6 w-full ${fading ? 'fs-q-fadeout' : 'fs-q-fadein'}`}>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-emerald-600 font-bold mb-4">Q{q.id}</p>
          <h2 className="text-xl md:text-3xl font-extrabold text-navy text-center leading-tight tracking-tight mb-3">{q.question}</h2>
          {q.description && <p className="text-center text-sm md:text-base text-slate-500 mb-8 max-w-lg mx-auto">{q.description}</p>}
          <div className="flex flex-col gap-3 md:gap-4">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => onSelect(opt.value)} className="group bg-white border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-lg rounded-2xl p-5 md:p-6 text-left transition-all hover:-translate-y-0.5 flex items-center gap-4">
                <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 group-hover:from-emerald-100 group-hover:to-teal-100 flex items-center justify-center text-2xl md:text-3xl">{opt.emoji}</div>
                <p className="flex-1 text-sm md:text-lg font-semibold text-navy-mid group-hover:text-emerald-700">{opt.text}</p>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

const fsStyles = `
  @keyframes fs-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fs-fadeout { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }
  .fs-q-fadein { animation: fs-fadein 0.35s ease-out both; }
  .fs-q-fadeout { animation: fs-fadeout 0.22s ease-in both; }
`
