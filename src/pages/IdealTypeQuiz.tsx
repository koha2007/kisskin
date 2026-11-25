// AI 이상형 테스트 — 퀴즈 (2026-11-25, docs/IDEAL_TYPE_PLAN.md)
// 0번(이상형 성별)은 히어로 안에서 바로 받고, 1~10번은 QuizScreen. 끝나면 유형 페이지로
// ?g=(m|f|a)&a=(답 10자리) 를 실어 보낸다 — 유형 페이지는 검색용 고정 페이지이자 내 결과 화면.
import { useEffect, useState } from 'react'
import { trackEvent, trackToolComplete } from '../lib/analytics'
import { IQ_QUESTIONS, computeIdealType, encodeAnswers } from '../lib/ideal-type/questions'
import { IDEAL_ORDER, IDEAL_TYPES, idealImage } from '../lib/ideal-type/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { QuizScreen, QuizRedirecting, type QuizOptionView } from '../components/quiz/QuizScreen'
import { ToolHero, ToolWhySection, TypePreviewSection, TypePreviewCard } from '../components/tools/ToolLanding'
import { useI18n } from '../i18n/I18nContext'

type Phase = 'intro' | 'quiz' | 'redirecting'
type GenderPick = 'm' | 'f' | 'a'

export default function IdealTypeQuiz() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const basePath = isEn ? '/en/tools/ideal-type' : '/tools/ideal-type'
  const [phase, setPhase] = useState<Phase>('intro')
  const [gender, setGender] = useState<GenderPick>('f')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [fading, setFading] = useState(false)

  useEffect(() => { if (phase === 'quiz') window.scrollTo({ top: 0, behavior: 'smooth' }) }, [phase, idx])

  const start = (g: GenderPick) => {
    setGender(g); setAnswers([]); setIdx(0); setPhase('quiz')
    trackEvent('ideal_quiz_start', { gender: g })
  }

  const onSelect = (a: number) => {
    setFading(true)
    setTimeout(() => {
      const next = [...answers, a]
      setAnswers(next)
      if (next.length >= IQ_QUESTIONS.length) {
        const code = computeIdealType(next)
        setPhase('redirecting')
        trackToolComplete('ideal-type', code)
        trackEvent('ideal_quiz_complete', { result_slug: code, gender })
        window.location.href = `${basePath}/${code}/?g=${gender}&a=${encodeAnswers(next)}`
      } else { setIdx(idx + 1); setFading(false) }
    }, 220)
  }

  const onBack = () => {
    if (idx === 0) { setPhase('intro'); setAnswers([]); return }
    setAnswers(answers.slice(0, -1)); setIdx(idx - 1)
  }

  if (phase === 'redirecting') return <QuizRedirecting isEn={isEn} />

  if (phase === 'quiz') {
    const q = IQ_QUESTIONS[idx]
    const options: QuizOptionView[] = q.options.map((op, i) => ({ key: i, text: isEn ? op.en : op.ko, emoji: op.emoji, onSelect: () => onSelect(i) }))
    return (
      <QuizScreen toolLabel={isEn ? 'Ideal Type' : '이상형 테스트'} step={idx + 1} total={IQ_QUESTIONS.length} questionTag={`Q${q.id}`}
        question={isEn ? q.en : q.ko} variant="fullscreen" fading={fading} isEn={isEn} onBack={onBack} options={options} />
    )
  }

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />
      <main>
        <ToolHero
          badge={isEn ? 'AI Ideal Type Test' : 'AI 이상형 테스트'}
          badgeIcon="favorite"
          title={isEn ? 'What does your ideal type look like?' : '내 이상형은 어떤 얼굴, 어떤 옷?'}
          subtitle={isEn ? (
            <>10 quick questions reveal your ideal type among 8 — Golden Retriever, Black Cat, Fox and more — as an <strong className="text-primary-dark">art-poster card</strong> with their face, style and your date makeup.</>
          ) : (
            <>10문항으로 알아보는 동물상 8가지 이상형. 얼굴 인상·패션·데이트 장소를 <strong className="text-primary-dark">미술 포스터 카드</strong> 한 장으로, 그날 내 메이크업까지.</>
          )}
          startLabel={isEn ? 'Start the test' : '테스트 시작'}
          onStart={() => start('f')}
          previewHref="#types-preview"
          previewLabel={isEn ? 'See the 8 types first' : '8가지 유형 먼저 보기'}
          heroImages={[idealImage('golden-retriever', 'm'), idealImage('black-cat', 'f'), idealImage('fox', 'm'), idealImage('bunny', 'f')]}
          heroImagesNote={isEn ? 'AI-generated illustrations' : 'AI로 그린 일러스트'}
          stats={[
            { value: '10', label: isEn ? 'questions' : '문항' },
            { value: '8', label: isEn ? 'types' : '유형' },
            { value: isEn ? '~1 min' : '약 1분', label: isEn ? 'to finish' : '소요' },
            { value: isEn ? 'Free' : '무료', label: isEn ? 'no sign-up' : '가입 불필요' },
          ]}
          firstQuestion={{
            tag: 'Q0',
            text: isEn ? 'Your ideal type is…' : '내 이상형은?',
            options: [
              { key: 'm', label: isEn ? 'A man' : '남자', emoji: '🙋‍♂️', onSelect: () => start('m') },
              { key: 'f', label: isEn ? 'A woman' : '여자', emoji: '🙋‍♀️', onSelect: () => start('f') },
              { key: 'a', label: isEn ? 'Either — show me both' : '상관없음 — 둘 다 보기', emoji: '💞', onSelect: () => start('a') },
            ],
          }}
        />

        <ToolWhySection title={isEn ? 'Why animal types?' : '왜 동물상일까요?'}>
          {isEn ? (
            <>
              <p>&quot;Golden retriever boyfriend&quot; and &quot;black cat girlfriend&quot; became shorthand for a whole personality on TikTok — and in Korea, people have described faces as puppy, cat or fox types for years. It is the same language in both places, which is why we used it.</p>
              <p>Each answer gives a point to two of the eight types, and every type appears exactly once per question, so no type is favored. Your first-date pick also decides the scene of your card.</p>
              <p>All people in the cards are <strong>AI-generated illustrations</strong>, not real people or celebrities.</p>
            </>
          ) : (
            <>
              <p>강아지상·고양이상·여우상처럼 얼굴을 동물로 부르는 말은 한국에서 오래 쓰였고, 해외에서도 &quot;골든 리트리버 남친&quot;·&quot;블랙 캣 여친&quot;이 틱톡 유행어가 됐어요. 한국과 해외가 같은 말을 쓰는 몇 안 되는 유형이라 이 기준을 골랐습니다.</p>
              <p>보기 하나를 고를 때마다 두 유형에 1점씩 들어가고, 모든 문항에 8유형이 한 번씩 나와서 어느 유형도 유리하지 않아요. 첫 데이트 장소 답은 카드 속 장면이 됩니다.</p>
              <p>카드 속 인물은 모두 <strong>AI로 그린 일러스트</strong>예요. 실제 사람이나 연예인이 아닙니다.</p>
            </>
          )}
        </ToolWhySection>

        <TypePreviewSection id="types-preview" title={isEn ? 'The 8 ideal types' : '8가지 이상형'}
          subtitle={isEn ? 'Tap a card to see each type\'s face, style and date makeup.' : '카드를 눌러 유형별 얼굴·패션·데이트 메이크업을 먼저 볼 수 있어요.'}
          columnsClass="columns-2 md:columns-4" startLabel={isEn ? 'Start the test' : '테스트 시작'} onStart={() => start('f')}>
          {IDEAL_ORDER.map((c, i) => {
            const t = IDEAL_TYPES[c]
            return <TypePreviewCard key={c} href={`${basePath}/${c}/`} emoji={t.emoji} name={isEn ? t.en : t.ko} sub={isEn ? t.ko : t.en} accent={t.color} image={idealImage(c, i % 2 ? 'f' : 'm')} aspectClass="aspect-[4/5]" />
          })}
        </TypePreviewSection>
      </main>
      <ToolsFooter />
    </div>
  )
}
