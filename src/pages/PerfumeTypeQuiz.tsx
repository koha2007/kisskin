import { useState, useEffect, useMemo } from 'react'
import { PT_QUESTIONS, computePerfumeType, type PTOption } from '../lib/perfume-type/questions'
import { PERFUME_TYPES, PERFUME_TYPE_ORDER } from '../lib/perfume-type/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'

type Phase = 'intro' | 'quiz' | 'redirecting'

export default function PerfumeTypeQuiz() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<PTOption[]>([])
  const [fading, setFading] = useState(false)
  const q = PT_QUESTIONS[idx]
  const progress = useMemo(() => (idx / PT_QUESTIONS.length) * 100, [idx])
  const basePath = '/tools/perfume-type'

  useEffect(() => {
    if (phase === 'quiz') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase, idx])

  const onSelect = (opt: PTOption) => {
    setFading(true)
    setTimeout(() => {
      const next = [...answers, opt]
      setAnswers(next)
      if (next.length >= PT_QUESTIONS.length) {
        const type = computePerfumeType(next)
        const slug = PERFUME_TYPES[type].slug
        setPhase('redirecting')
        if (typeof window !== 'undefined') window.location.href = `${basePath}/${slug}/`
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
        <style>{ptStyles}</style>
        <ToolsNav />
        <main>

        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-rose-200/40 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-200/30 to-transparent rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="material-symbols-outlined text-sm">local_florist</span>
              향수 타입 진단
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-navy mb-4">
              나에게 어울리는 향수 타입은?
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl mx-auto">
              5문항으로 알아보는 플로럴·시트러스·우디·앰버·프레시·구르망 6가지 향수 타입.
              <strong className="text-rose-600"> 한국 시장 추천 향수</strong>와 어울리는 메이크업·상황·계절 가이드를 함께 제공합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button onClick={() => setPhase('quiz')} className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-rose-500/25">
                진단 시작
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <a href="#types-preview" className="border border-rose-200 hover:border-rose-400 hover:bg-rose-50 px-10 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 text-slate-700">
                <span className="material-symbols-outlined text-rose-600">grid_view</span>
                6가지 타입 먼저 보기
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">schedule</span> 약 1분</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">lock</span> 무료 · 회원가입 불필요</span>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy text-center mb-8 tracking-tight">
              향수 타입 진단이 왜 중요한가요?
            </h2>
            <div className="prose max-w-none text-slate-600 leading-relaxed space-y-4">
              <p>향수는 같은 사람이라도 "어떤 계열을 입느냐"에 따라 첫인상이 완전히 달라집니다. 시트러스를 입으면 깔끔한 사람으로 보이고, 앰버를 입으면 신비로운 사람으로 보이죠. 즉, <strong>향수는 "내가 어떤 사람으로 보이고 싶은지"를 결정하는 도구</strong>입니다.</p>
              <p>이 진단은 글로벌 향수 산업의 6대 표준 분류 (<strong>Floral · Citrus · Woody · Amber · Fresh · Gourmand</strong>) 기준으로 본인의 선호와 라이프스타일을 분석해 가장 어울리는 향수 계열을 찾아드립니다. (참고: 2018년 이후 글로벌 향수 업계는 "Oriental" 용어를 "Amber"로 변경하는 추세입니다.)</p>
              <p>각 결과 페이지에는 <strong>한국 시장에서 인지도 높은 추천 향수 카테고리</strong>, 어울리는 메이크업·상황·계절, 그리고 향수 입문자가 자주 하는 실수를 피하는 팁이 포함되어 있습니다.</p>
            </div>
          </div>
        </section>

        <section id="types-preview" className="py-14 bg-gradient-to-b from-background-light via-rose-50/20 to-background-light">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy mb-2 tracking-tight">6가지 향수 타입</h2>
              <p className="text-slate-500 text-sm">카드를 눌러 타입별 특징과 추천 향수를 먼저 볼 수 있어요.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PERFUME_TYPE_ORDER.map(c => {
                const pt = PERFUME_TYPES[c]
                return (
                  <a key={c} href={`${basePath}/${pt.slug}/`} className="group bg-white rounded-2xl p-5 border hover:shadow-lg transition-all hover:-translate-y-0.5" style={{ borderColor: `${pt.primaryColor}30` }}>
                    <div className="text-4xl mb-2">{pt.emoji}</div>
                    <div className="font-extrabold text-navy-mid group-hover:text-rose-600">{pt.koName}</div>
                    <div className="text-[0.7rem] text-slate-400 mt-1">{pt.enName}</div>
                  </a>
                )
              })}
            </div>
            <div className="text-center mt-10">
              <button onClick={() => setPhase('quiz')} className="bg-gradient-to-r from-rose-500 to-amber-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-rose-500/25 inline-flex items-center gap-2">
                진단 시작
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
        <style>{ptStyles}</style>
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 text-sm">분석 중...</p>
      </div>
    )
  }

  return (
    <div className="font-display bg-background-light min-h-screen flex flex-col">
      <style>{ptStyles}</style>
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-rose-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-rose-50 text-slate-500 hover:text-rose-600" aria-label="이전 질문">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-rose-600">Q {idx + 1} / {PT_QUESTIONS.length}</span>
              <span className="text-slate-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center py-8 md:py-14">
        <div className={`max-w-2xl mx-auto px-4 sm:px-6 w-full ${fading ? 'pt-q-fadeout' : 'pt-q-fadein'}`}>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-rose-600 font-bold mb-4">Q{q.id}</p>
          <h2 className="text-xl md:text-3xl font-extrabold text-navy text-center leading-tight tracking-tight mb-3">{q.question}</h2>
          {q.description && <p className="text-center text-sm md:text-base text-slate-500 mb-8 max-w-lg mx-auto">{q.description}</p>}
          <div className="flex flex-col gap-3 md:gap-4">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => onSelect(opt)} className="group bg-white border-2 border-rose-100 hover:border-rose-500 hover:shadow-lg rounded-2xl p-5 md:p-6 text-left transition-all hover:-translate-y-0.5 flex items-center gap-4">
                <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-rose-50 to-amber-50 group-hover:from-rose-100 group-hover:to-amber-100 flex items-center justify-center text-2xl md:text-3xl">{opt.emoji}</div>
                <p className="flex-1 text-sm md:text-lg font-semibold text-navy-mid group-hover:text-rose-700">{opt.text}</p>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

const ptStyles = `
  @keyframes pt-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pt-fadeout { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }
  .pt-q-fadein { animation: pt-fadein 0.35s ease-out both; }
  .pt-q-fadeout { animation: pt-fadeout 0.22s ease-in both; }
`
