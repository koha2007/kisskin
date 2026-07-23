import { useState, useEffect } from 'react'
import { PT_QUESTIONS, computePerfumeType, type PTOption } from '../lib/perfume-type/questions'
import { PERFUME_TYPES, PERFUME_TYPE_ORDER } from '../lib/perfume-type/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { QuizScreen, QuizRedirecting, type QuizOptionView } from '../components/quiz/QuizScreen'
import { ToolHero, ToolWhySection, TypePreviewSection, TypePreviewCard } from '../components/tools/ToolLanding'
import { PERFUME_MOOD } from '../lib/perfume-type/moodImages'
import { useI18n } from '../i18n/I18nContext'

// 2-B color/mood grid gradients, keyed by question id, in option order.
// Q1 = 계절 무드(봄정원/여름해변/가을숲/겨울벽난로), Q3 = 옷장 색(화이트/블랙/브라운/핑크).
const GRID_GRADIENTS: Record<number, string[]> = {
  1: [
    'linear-gradient(150deg,#ffb6c1,#ff9a76)', // 봄 정원
    'linear-gradient(150deg,#7fd8e8,#f3e2a0)', // 여름 해변
    'linear-gradient(150deg,#c0723b,#6e4a2a)', // 가을 숲
    'linear-gradient(150deg,#2b2d6b,#e8924a)', // 겨울 벽난로
  ],
  3: [
    'linear-gradient(150deg,#f5f0e6,#d8cdbb)', // 화이트·베이지·아이보리
    'linear-gradient(150deg,#3a3a42,#6b6b75)', // 블랙·차콜·그레이
    'linear-gradient(150deg,#9c7144,#6e6b3f)', // 브라운·카멜·올리브
    'linear-gradient(150deg,#ec6f95,#c02a4a)', // 핑크·로즈·레드
  ],
}

type Phase = 'intro' | 'quiz' | 'redirecting'

export default function PerfumeTypeQuiz() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<PTOption[]>([])
  const [fading, setFading] = useState(false)
  const q = PT_QUESTIONS[idx]
  const basePath = isEn ? '/en/tools/perfume-type' : '/tools/perfume-type'

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

        <ToolHero
          badge={isEn ? 'Perfume Type Quiz' : '향수 타입 진단'}
          badgeIcon="local_florist"
          title={isEn ? 'Which perfume type suits you?' : '나에게 어울리는 향수 타입은?'}
          subtitle={isEn ? (
            <>A 5-question quiz reveals your type across 6 fragrance families — Floral, Citrus, Woody, Amber, Fresh, and Gourmand.
              <strong className="text-primary"> Matched perfume picks</strong> come with a makeup, occasion, and season guide.</>
          ) : (
            <>5문항으로 알아보는 플로럴·시트러스·우디·앰버·프레시·구르망 6가지 향수 타입.
              <strong className="text-primary"> 한국 시장 추천 향수</strong>와 어울리는 메이크업·상황·계절 가이드를 함께 제공합니다.</>
          )}
          startLabel={isEn ? 'Start the quiz' : '진단 시작'}
          onStart={() => setPhase('quiz')}
          previewHref="#types-preview"
          previewLabel={isEn ? 'See the 6 types first' : '6가지 타입 먼저 보기'}
          stats={[
            { value: '5', label: isEn ? 'questions' : '문항' },
            { value: '6', label: isEn ? 'scent types' : '향 타입' },
            { value: isEn ? '~1 min' : '약 1분', label: isEn ? 'to finish' : '소요' },
            { value: isEn ? 'Free' : '무료', label: isEn ? 'no sign-up' : '가입 불필요' },
          ]}
          /* 1번 문항을 히어로 안에서 바로 받는다 — "시작" 버튼 단계가 사라진다.
             보기를 누르면 곧바로 2번 문항으로 넘어간다. */
          firstQuestion={{
            tag: 'Q1',
            text: isEn && PT_QUESTIONS[0].questionEn ? PT_QUESTIONS[0].questionEn : PT_QUESTIONS[0].question,
            options: PT_QUESTIONS[0].options.map((opt, i) => ({
              key: i,
              label: isEn && opt.textEn ? opt.textEn : opt.text,
              emoji: opt.emoji,
              onSelect: () => { setPhase('quiz'); onSelect(opt) },
            })),
          }}
        />

        <ToolWhySection title={isEn ? 'Why does your perfume type matter?' : '향수 타입 진단이 왜 중요한가요?'}>
              {isEn ? (
                <>
                  <p>The same person can make a completely different first impression depending on which fragrance family they wear. Citrus reads as clean and tidy; amber reads as mysterious. In other words, <strong>perfume is a tool for deciding how you want to be seen</strong>.</p>
                  <p>This quiz analyzes your preferences and lifestyle against the six standard families of the global fragrance industry (<strong>Floral · Citrus · Woody · Amber · Fresh · Gourmand</strong>) to find the one that suits you best. (Note: since 2018 the industry has been shifting the term &quot;Oriental&quot; to &quot;Amber.&quot;)</p>
                  <p>Each result page includes <strong>recommended fragrance categories</strong>, the makeup, occasions, and seasons that pair well, and tips to avoid the mistakes beginners make most often.</p>
                </>
              ) : (
                <>
                  <p>향수는 같은 사람이라도 &quot;어떤 계열을 입느냐&quot;에 따라 첫인상이 완전히 달라집니다. 시트러스를 입으면 깔끔한 사람으로 보이고, 앰버를 입으면 신비로운 사람으로 보이죠. 즉, <strong>향수는 &quot;내가 어떤 사람으로 보이고 싶은지&quot;를 결정하는 도구</strong>입니다.</p>
                  <p>이 진단은 글로벌 향수 산업의 6대 표준 분류 (<strong>Floral · Citrus · Woody · Amber · Fresh · Gourmand</strong>) 기준으로 본인의 선호와 라이프스타일을 분석해 가장 어울리는 향수 계열을 찾아드립니다. (참고: 2018년 이후 글로벌 향수 업계는 &quot;Oriental&quot; 용어를 &quot;Amber&quot;로 변경하는 추세입니다.)</p>
                  <p>각 결과 페이지에는 <strong>한국 시장에서 인지도 높은 추천 향수 카테고리</strong>, 어울리는 메이크업·상황·계절, 그리고 향수 입문자가 자주 하는 실수를 피하는 팁이 포함되어 있습니다.</p>
                </>
              )}
        </ToolWhySection>

        <TypePreviewSection
          id="types-preview"
          title={isEn ? 'The 6 perfume types' : '6가지 향수 타입'}
          subtitle={isEn ? 'Tap a card to preview each type and its recommended scents.' : '카드를 눌러 타입별 특징과 추천 향수를 먼저 볼 수 있어요.'}
          columnsClass="columns-2 md:columns-3"
          startLabel={isEn ? 'Start the quiz' : '진단 시작'}
          onStart={() => setPhase('quiz')}
        >
          {PERFUME_TYPE_ORDER.map(c => {
            const pt = PERFUME_TYPES[c]
            return (
              <TypePreviewCard
                key={c}
                href={`${basePath}/${pt.slug}/`}
                emoji={pt.emoji}
                name={isEn ? pt.enName : pt.koName}
                sub={isEn ? pt.koName : pt.enName}
                accent={pt.primaryColor}
                image={PERFUME_MOOD[c].image}
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

  // Q1(계절 무드)·Q3(옷장 색)은 2-B 색 그리드, 나머지는 2-A 풀스크린.
  const gridGradients = GRID_GRADIENTS[q.id]
  const isGrid = !!gridGradients
  const options: QuizOptionView[] = q.options.map((opt, i) => ({
    key: i,
    text: isEn && opt.textEn ? opt.textEn : opt.text,
    emoji: opt.emoji,
    gradient: gridGradients?.[i],
    onSelect: () => onSelect(opt),
  }))

  return (
    <QuizScreen
      toolLabel={isEn ? 'Perfume Type' : '향수 타입'}
      step={idx + 1}
      total={PT_QUESTIONS.length}
      questionTag={`Q${q.id}`}
      question={questionText}
      description={descriptionText}
      variant={isGrid ? 'grid' : 'fullscreen'}
      fading={fading}
      isEn={isEn}
      onBack={onBack}
      options={options}
    />
  )
}

const ptStyles = `
  @keyframes pt-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pt-fadeout { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }
  .pt-q-fadein { animation: pt-fadein 0.35s ease-out both; }
  .pt-q-fadeout { animation: pt-fadeout 0.22s ease-in both; }
`
