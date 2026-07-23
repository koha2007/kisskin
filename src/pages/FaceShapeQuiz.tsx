import { useState, useEffect } from 'react'
import { FS_QUESTIONS, computeFaceShape, type FSAnswer } from '../lib/face-shape/questions'
import { FACE_SHAPE_TYPES, FACE_SHAPE_ORDER } from '../lib/face-shape/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { QuizScreen, QuizRedirecting } from '../components/quiz/QuizScreen'
import { ToolHero, ToolWhySection, TypePreviewSection, TypePreviewCard } from '../components/tools/ToolLanding'
import { FACE_SHAPE_MOOD } from '../lib/face-shape/moodImages'
import { useI18n } from '../i18n/I18nContext'
import ToolFaq, { FACE_SHAPE_FAQ_BASE, FACE_SHAPE_FAQ_BASE_EN } from '../components/ToolFaq'

type Phase = 'intro' | 'quiz' | 'redirecting'

export default function FaceShapeQuiz() {
  const { t, locale } = useI18n()
  const isEn = locale === 'en'
  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<FSAnswer[]>([])
  const [fading, setFading] = useState(false)
  const q = FS_QUESTIONS[idx]
  const basePath = isEn ? '/en/tools/face-shape' : '/tools/face-shape'

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
        <style>{fsStyles}</style>
        <ToolsNav />
        <main>

        <ToolHero
          badge={t('tools.fs.badge')}
          badgeIcon="face"
          title={isEn ? "What's your face shape?" : '나의 얼굴형은?'}
          subtitle={isEn ? (
            <>6 questions to identify oval, round, square, oblong, or heart.
              <strong className="text-primary"> Per-shape contouring</strong>, makeup, hair, and eyewear guidance included.</>
          ) : (
            <>6문항으로 알아보는 계란형·둥근형·각진형·긴형·하트형.
              <strong className="text-primary"> 얼굴형별 맞춤 컨투어링</strong>과 메이크업·헤어·안경 가이드를 함께 제공합니다.</>
          )}
          startLabel={t('tools.common.startDiagnosis')}
          onStart={() => setPhase('quiz')}
          previewHref="#shapes-preview"
          previewLabel={t('tools.fs.previewCta')}
          stats={[
            { value: '6', label: isEn ? 'questions' : '문항' },
            { value: '5', label: isEn ? 'shapes' : '얼굴형' },
            { value: isEn ? '~1 min' : '약 1분', label: isEn ? 'to finish' : '소요' },
            { value: isEn ? 'Free' : '무료', label: isEn ? 'no sign-up' : '가입 불필요' },
          ]}
          /* 1번 문항을 히어로 안에서 바로 받는다 — "시작" 버튼 단계가 사라진다.
             보기를 누르면 곧바로 2번 문항으로 넘어간다. */
          firstQuestion={{
            tag: 'Q1',
            text: isEn && FS_QUESTIONS[0].questionEn ? FS_QUESTIONS[0].questionEn : FS_QUESTIONS[0].question,
            options: FS_QUESTIONS[0].options.map((opt, i) => ({
              key: i,
              label: isEn && opt.textEn ? opt.textEn : opt.text,
              emoji: opt.emoji,
              onSelect: () => { setPhase('quiz'); onSelect(opt.value) },
            })),
          }}
        />

        <ToolWhySection title={isEn ? 'Why does face shape matter?' : '얼굴형 진단이 왜 중요한가요?'}>
          {isEn ? (
            <>
              <p>Face shape is where contouring starts. The same technique creates completely different results depending on the underlying shape. A round face and a long face, for example, need contouring applied in opposite directions — round faces need vertical lift, while oblong faces need horizontal weight.</p>
              <p>Korean cosmetology research (KISTI, classification of facial types among women in their twenties) finds that most faces fall into one of <strong>five base types — oval, round, square, oblong, and heart</strong> — and each has its own guidelines for contour, blush, hair, and eyewear.</p>
              <p>This quiz reads six external features and matches you to the closest base type. The goal is not to flag what to "fix" — it is to help you <strong>play to the strengths of your shape</strong>.</p>
            </>
          ) : (
            <>
              <p>얼굴형은 메이크업 컨투어링의 시작점입니다. 같은 메이크업 기법이라도 얼굴형에 따라 전혀 다른 결과를 만듭니다. 예를 들어 둥근형과 긴형에게 컨투어링은 정반대 방향으로 적용되어야 합니다 — 둥근형은 세로 입체감을, 긴형은 가로 입체감을 추가해야 합니다.</p>
              <p>한국 미용학 연구(KISTI, 20대 여성 얼굴 유형 분류)에 따르면 대부분의 얼굴은 <strong>계란형 · 둥근형 · 각진형 · 긴형 · 하트형</strong> 5가지 기본 유형에 속하며, 이 기본 유형 기준으로 컨투어·블러쉬·헤어스타일·안경 선택의 가이드라인이 존재합니다.</p>
              <p>이 진단은 외형적 특징 6가지를 종합해 가장 가까운 기본 유형을 찾아드립니다. 성형 권유나 콤플렉스 자극이 아닌, <strong>"내 얼굴형의 강점을 살리는 법"</strong>을 안내하는 것이 목적입니다.</p>
            </>
          )}
        </ToolWhySection>

        <TypePreviewSection
          id="shapes-preview"
          title={isEn ? 'Five face shapes' : '5가지 얼굴형'}
          subtitle={isEn ? 'Tap a card to preview the features and tailored contour for each shape.' : '카드를 눌러 얼굴형별 특징과 맞춤 컨투어를 먼저 볼 수 있어요.'}
          columnsClass="columns-2 md:columns-5"
          startLabel={t('tools.common.startDiagnosis')}
          onStart={() => setPhase('quiz')}
        >
          {FACE_SHAPE_ORDER.map(c => {
            const ft = FACE_SHAPE_TYPES[c]
            return (
              <TypePreviewCard
                key={c}
                href={`${basePath}/${ft.slug}/`}
                emoji={ft.emoji}
                name={isEn ? ft.enName : ft.koName}
                sub={isEn ? ft.koName : ft.enName}
                accent={ft.primaryColor}
                image={FACE_SHAPE_MOOD[c].image}
              />
            )
          })}
        </TypePreviewSection>

        {/* FAQ 는 랜딩에만 — 유형 페이지 복제가 색인 누락을 만들고 있었다 */}
        <ToolFaq
          title={isEn ? 'Face shape FAQ' : '얼굴형 진단 자주 묻는 질문'}
          items={isEn ? FACE_SHAPE_FAQ_BASE_EN : FACE_SHAPE_FAQ_BASE}
        />

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
      toolLabel={isEn ? 'Face Shape' : '얼굴형'}
      step={idx + 1}
      total={FS_QUESTIONS.length}
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

const fsStyles = `
  @keyframes fs-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fs-fadeout { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }
  .fs-q-fadein { animation: fs-fadein 0.35s ease-out both; }
  .fs-q-fadeout { animation: fs-fadeout 0.22s ease-in both; }
`
