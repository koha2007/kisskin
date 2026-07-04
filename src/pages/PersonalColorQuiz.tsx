import { useState, useEffect } from 'react'
import { PC_QUESTIONS, computeSeason, type PCAnswer } from '../lib/personal-color/questions'
import { PERSONAL_COLOR_TYPES, SEASON_ORDER } from '../lib/personal-color/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { QuizScreen, QuizRedirecting } from '../components/quiz/QuizScreen'
import { ToolHero, ToolWhySection, TypePreviewSection, TypePreviewCard } from '../components/tools/ToolLanding'
import { useI18n } from '../i18n/I18nContext'

// Back-compat re-exports (FaceShape pages import these names from this file)
export { ToolsNav as ToolNav, ToolsFooter as ToolFooter } from '../components/ToolsLayout'

type Phase = 'intro' | 'quiz' | 'redirecting'

export default function PersonalColorQuiz() {
  const { t, locale } = useI18n()
  const isEn = locale === 'en'
  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<PCAnswer[]>([])
  const [fading, setFading] = useState(false)
  const q = PC_QUESTIONS[idx]
  const basePath = isEn ? '/en/tools/personal-color' : '/tools/personal-color'

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
        <style>{quizStyles}</style>
        <ToolsNav />
        <main>

        <ToolHero
          badge={t('tools.pc.badge')}
          badgeIcon="palette"
          title={isEn ? "What's your personal color?" : '나의 퍼스널 컬러는?'}
          subtitle={isEn ? (
            <>6 questions to find your season — Spring Warm, Summer Cool, Autumn Warm, or Winter Cool.
              <strong className="text-primary"> Per-season color and makeup guidance</strong> grounded in the 4-season system.</>
          ) : (
            <>6문항으로 알아보는 봄 웜톤 / 여름 쿨톤 / 가을 웜톤 / 겨울 쿨톤.
              <strong className="text-primary"> 4계절 퍼스널 컬러 시스템</strong>에 기반해 나에게 어울리는 색과 메이크업을 추천해드립니다.</>
          )}
          startLabel={t('tools.common.startDiagnosis')}
          onStart={() => setPhase('quiz')}
          previewHref="#seasons-preview"
          previewLabel={t('tools.pc.previewCta')}
          chips={[
            { icon: 'schedule', label: t('tools.common.about2min') },
            { icon: 'lock', label: t('tools.common.freeNoLogin') },
            { icon: 'share', label: t('tools.common.shareable') },
          ]}
        />

        <ToolWhySection title={isEn ? 'What is personal color?' : '퍼스널 컬러란?'}>
              {isEn ? (
                <>
                  <p>Personal color is the family of colors that harmonizes with your natural body coloring — skin, hair, and eyes — and makes your face look its most alive. The four-season system (Spring, Summer, Autumn, Winter) systematized by American colorist Carole Jackson in "Color Me Beautiful" in the 1980s remains the most widely used framework worldwide. In Korea, a finer 16-type "tone-in-tone" classification is often layered on top.</p>
                  <p className="font-semibold text-navy-mid mt-6">Two axes do most of the work:</p>
                  <ul className="space-y-3 list-none pl-0">
                    <li className="flex items-start gap-3"><span className="shrink-0 px-2.5 py-0.5 bg-pink-100 text-primary-dark text-xs font-bold rounded-full">Warm · Cool</span><span><strong>Undertone</strong> — whether the bedrock color under your skin leans yellow (warm) or blue (cool).</span></li>
                    <li className="flex items-start gap-3"><span className="shrink-0 px-2.5 py-0.5 bg-pink-100 text-primary-dark text-xs font-bold rounded-full">Light · Deep</span><span><strong>Brightness</strong> — whether your overall coloring reads bright and clear (Spring / Summer) or deep and rich (Autumn / Winter).</span></li>
                  </ul>
                  <p className="mt-6">Together, these two axes pin you to <strong>one of four seasons</strong>. Each season has its own flattering wardrobe, makeup, and hair-color palettes — once you know yours, you make far fewer expensive shopping mistakes.</p>
                </>
              ) : (
                <>
                  <p>퍼스널 컬러(Personal Color)는 개인이 가진 고유의 신체 색(피부·모발·눈동자)과 조화를 이루어 얼굴을 가장 생기 있게 만들어주는 색 군을 말합니다. 1980년대 미국 컬러리스트 Carole Jackson이 "Color Me Beautiful"에서 체계화한 4계절 시스템(봄·여름·가을·겨울)이 전 세계에서 가장 널리 쓰이며, 한국에서는 여기에 세부 16타입(Tone in Tone) 분류가 추가되기도 합니다.</p>
                  <p className="font-semibold text-navy-mid mt-6">핵심은 2가지 축:</p>
                  <ul className="space-y-3 list-none pl-0">
                    <li className="flex items-start gap-3"><span className="shrink-0 px-2.5 py-0.5 bg-pink-100 text-primary-dark text-xs font-bold rounded-full">Warm · Cool</span><span><strong>언더톤</strong> — 피부 아래 깔린 바탕색이 노란 기운(웜)인지, 푸른 기운(쿨)인지.</span></li>
                    <li className="flex items-start gap-3"><span className="shrink-0 px-2.5 py-0.5 bg-pink-100 text-primary-dark text-xs font-bold rounded-full">Light · Deep</span><span><strong>명도</strong> — 밝고 화사한 톤(봄·여름)인지, 깊고 풍부한 톤(가을·겨울)인지.</span></li>
                  </ul>
                  <p className="mt-6">이 2가지 축의 조합으로 <strong>4가지 시즌</strong>이 결정됩니다. 각 시즌마다 어울리는 의상·메이크업·헤어 컬러가 다르며, 내 시즌을 알면 쇼핑·메이크업 실수가 크게 줄어듭니다.</p>
                </>
              )}
        </ToolWhySection>

        <TypePreviewSection
          id="seasons-preview"
          title={isEn ? 'Four personal-color seasons' : '4가지 퍼스널 컬러'}
          subtitle={isEn ? 'Tap a card to preview the traits and best colors of each season first.' : '카드를 눌러 시즌별 특징과 어울리는 색을 먼저 볼 수 있어요.'}
          startLabel={t('tools.common.startDiagnosis')}
          onStart={() => setPhase('quiz')}
        >
          {SEASON_ORDER.map(c => {
            const pt = PERSONAL_COLOR_TYPES[c]
            return (
              <TypePreviewCard
                key={c}
                href={`${basePath}/${pt.slug}/`}
                emoji={pt.emoji}
                name={isEn ? pt.enName : pt.koName}
                sub={isEn && pt.toneEn ? pt.toneEn : pt.tone}
                accent={pt.primaryColor}
              />
            )
          })}
        </TypePreviewSection>

        </main>
        <ToolsFooter />
      </div>
    )
  }

  if (phase === 'redirecting') {
    return <QuizRedirecting isEn={isEn} />
  }

  const questionText = isEn && q.questionEn ? q.questionEn : q.question
  const descriptionText = isEn && q.descriptionEn ? q.descriptionEn : q.description

  return (
    <QuizScreen
      toolLabel={isEn ? 'Personal Color' : '퍼스널 컬러'}
      step={idx + 1}
      total={PC_QUESTIONS.length}
      questionTag={`Q${q.id}`}
      question={questionText}
      description={descriptionText}
      variant="fullscreen"
      fading={fading}
      isEn={isEn}
      onBack={onBack}
      options={q.options.map((opt, i) => ({
        key: i,
        text: isEn && opt.textEn ? opt.textEn : opt.text,
        emoji: opt.emoji,
        onSelect: () => onSelect(opt.value),
      }))}
    />
  )
}

const quizStyles = `
  @keyframes pc-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pc-fadeout { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }
  .pc-q-fadein { animation: pc-fadein 0.35s ease-out both; }
  .pc-q-fadeout { animation: pc-fadeout 0.22s ease-in both; }
`
