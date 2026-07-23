import { useState, useEffect } from 'react'
import { QUESTIONS, computeMbti, type QuizOption } from '../lib/makeup-mbti/questions'
import { MAKEUP_MBTI_TYPES, MBTI_ORDER } from '../lib/makeup-mbti/types'
import { MAKEUP_MBTI_EN } from '../lib/makeup-mbti/types.en'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { QuizScreen, QuizRedirecting } from '../components/quiz/QuizScreen'
import { mbtiGroupColor, LOOK_NAME_KO } from '../lib/makeup-mbti/groupColors'
import { MBTI_MOOD } from '../lib/makeup-mbti/moodImages'
import { ToolHero, ToolWhySection, TypePreviewSection, TypePreviewCard } from '../components/tools/ToolLanding'
import { useI18n } from '../i18n/I18nContext'
import ToolFaq, { MBTI_FAQ_BASE, MBTI_FAQ_BASE_EN } from '../components/ToolFaq'

type Phase = 'intro' | 'quiz' | 'redirecting'

// 추천 룩 이름을 카드에 적는다. 유형이 달라도 추천 룩은 겹칠 수 있으므로
// (Natural Glow 하나를 ENFJ·ISTJ·ISTP 가 함께 쓴다) 적어 두지 않으면 실수처럼 보인다.
function lookLabel(name: string, isEn: boolean): string | undefined {
  if (!name) return undefined
  return isEn ? name : LOOK_NAME_KO[name] ?? name
}

export default function MakeupMbtiQuiz() {
  const { t, locale } = useI18n()
  const isEn = locale === 'en'
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<QuizOption['letter'][]>([])
  const [fading, setFading] = useState(false)
  const basePath = isEn ? '/en/tools/makeup-mbti' : '/tools/makeup-mbti'

  const q = QUESTIONS[currentIdx]

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
          window.location.href = `${basePath}/${slug}/`
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
        {/* Nav */}
        <ToolsNav />

        <main>
        <ToolHero
          badge={t('tools.mbti.badge')}
          badgeIcon="quiz"
          title={isEn ? "What's your Makeup MBTI?" : '나의 메이크업 MBTI는?'}
          subtitle={isEn ? (
            <>An 8-question quiz reads your makeup personality.
              <strong className="text-primary"> 16 types</strong> — we recommend the K-beauty style and product formula that fits yours.</>
          ) : (
            <>8문항으로 알아보는 당신의 메이크업 성향.
              <strong className="text-primary"> 16가지 유형</strong> 중 당신에게 맞는 K-뷰티 스타일과 제품 공식을 추천해드립니다.</>
          )}
          startLabel={t('tools.common.startQuiz')}
          onStart={() => setPhase('quiz')}
          previewHref="#types-preview"
          previewLabel={t('tools.mbti.previewCta')}
          stats={[
            { value: '8', label: isEn ? 'questions' : '문항' },
            { value: '16', label: isEn ? 'types' : '유형' },
            { value: isEn ? '~2 min' : '약 2분', label: isEn ? 'to finish' : '소요' },
            { value: isEn ? 'Free' : '무료', label: isEn ? 'no sign-up' : '가입 불필요' },
          ]}
          /* 1번 문항을 히어로 안에서 바로 받는다 — "시작" 버튼 단계가 사라진다.
             보기를 누르면 곧바로 2번 문항으로 넘어간다. */
          firstQuestion={{
            tag: 'Q1',
            text: isEn && QUESTIONS[0].questionEn ? QUESTIONS[0].questionEn : QUESTIONS[0].question,
            options: QUESTIONS[0].options.map((opt, i) => ({
              key: i,
              label: isEn && opt.textEn ? opt.textEn : opt.text,
              emoji: opt.emoji,
              onSelect: () => { setPhase('quiz'); onSelect(opt.letter) },
            })),
          }}
        />

        {/* What is Makeup MBTI */}
        <ToolWhySection title={isEn ? 'What is Makeup MBTI?' : '메이크업 MBTI란?'}>
              {isEn ? (
                <>
                  <p>
                    Makeup MBTI reinterprets the four classic Myers-Briggs axes through the lens of makeup preference.
                    It draws from international makeup-archetype research (Dear Peachie&apos;s 8-archetype system), a Korean
                    study of MBTI vs. beauty habits across 314 female university students, and 2024–2026 K-beauty trend
                    analysis, reorganized into 4 axes × 16 types.
                  </p>
                  <p className="font-semibold text-navy-mid mt-6">The four axes:</p>
                  <ul className="space-y-3 list-none pl-0">
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 px-2.5 py-0.5 bg-primary/10 text-primary-dark text-xs font-bold rounded-full">E · I</span>
                      <span><strong>Expression</strong> — bold, high-impact accents (E) vs. a subtle, private glow (I).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 px-2.5 py-0.5 bg-primary/10 text-primary-dark text-xs font-bold rounded-full">N · S</span>
                      <span><strong>Source</strong> — drawn to new experiments and trends (N) vs. a verified personal formula (S).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 px-2.5 py-0.5 bg-primary/10 text-primary-dark text-xs font-bold rounded-full">F · T</span>
                      <span><strong>Feel</strong> — blurred, soft, mood-driven (F) vs. sharp lines and structure (T).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 px-2.5 py-0.5 bg-primary/10 text-primary-dark text-xs font-bold rounded-full">P · J</span>
                      <span><strong>Routine</strong> — improvise by mood (P) vs. a consistent, formulaic ritual (J).</span>
                    </li>
                  </ul>
                  <p className="mt-6">
                    Each type is mapped to one of kissinskin&apos;s 6 women&apos;s and 6 men&apos;s styles, so instead of a plain diagnosis
                    you get <strong>a K-beauty look you can actually try on</strong>.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    메이크업 MBTI는 마이어스-브릭스 성격유형 지표(MBTI) 4가지 축을 메이크업 선호도에 맞게 재해석한 테스트입니다.
                    해외의 메이크업 아키타입 연구(Dear Peachie 8 archetype 시스템), 국내 여대생 314명 대상의 MBTI·뷰티 습관 실증 조사, 그리고 2024~2026년 K-뷰티 트렌드 분석을 종합하여
                    4가지 축 × 16가지 유형으로 재구성했습니다.
                  </p>
                  <p className="font-semibold text-navy-mid mt-6">4가지 축:</p>
                  <ul className="space-y-3 list-none pl-0">
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 px-2.5 py-0.5 bg-primary/10 text-primary-dark text-xs font-bold rounded-full">E · I</span>
                      <span><strong>표현(Expression)</strong> — 강렬한 포인트를 선호하는가(E), 은은한 내면 글로우를 선호하는가(I).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 px-2.5 py-0.5 bg-primary/10 text-primary-dark text-xs font-bold rounded-full">N · S</span>
                      <span><strong>영감(Source)</strong> — 새로운 실험·트렌드에서 영감을 얻는가(N), 검증된 내 공식을 신뢰하는가(S).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 px-2.5 py-0.5 bg-primary/10 text-primary-dark text-xs font-bold rounded-full">F · T</span>
                      <span><strong>무드(Feel)</strong> — 블러·소프트 무드를 선호하는가(F), 샤프한 라인·구조를 선호하는가(T).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 px-2.5 py-0.5 bg-primary/10 text-primary-dark text-xs font-bold rounded-full">P · J</span>
                      <span><strong>루틴(Routine)</strong> — 기분 따라 즉흥적으로 스타일링하는가(P), 공식화된 루틴을 유지하는가(J).</span>
                    </li>
                  </ul>
                  <p className="mt-6">
                    각 유형에 kissinskin의 6가지 여성 스타일 / 6가지 남성 스타일 중 가장 잘 맞는 조합을 매핑해,
                    단순 진단을 넘어 <strong>실제로 시도해볼 수 있는 K-뷰티 룩</strong>을 제안해드립니다.
                  </p>
                </>
              )}
        </ToolWhySection>

        {/* 16 Types Preview (SEO internal linking) */}
        <TypePreviewSection
          id="types-preview"
          title={isEn ? 'Which type are you?' : '당신은 어느 유형인가요?'}
          subtitle={isEn ? 'Tap any card to preview the persona and recommended makeup first.' : '각 카드를 눌러 유형별 상세 설명·추천 메이크업을 먼저 볼 수 있어요.'}
          startLabel={t('tools.common.startQuiz')}
          onStart={() => setPhase('quiz')}
        >
          {MBTI_ORDER.map(code => {
            const mt = MAKEUP_MBTI_TYPES[code]
            const en = MAKEUP_MBTI_EN[code]
            return (
              <TypePreviewCard
                key={code}
                href={`${basePath}/${mt.slug}/`}
                emoji={mt.emoji}
                name={isEn ? en.enPersona : mt.koName}
                sub={mt.code}
                accent={mbtiGroupColor(code)}
                image={MBTI_MOOD[code].image}
                note={lookLabel(mt.recommended.women.primary, isEn)}
              />
            )
          })}
        </TypePreviewSection>

        {/* FAQ 는 여기(랜딩)에만 둔다 — 유형 페이지 16장에 복제하면 페이지 간
            문장 중복률이 67% 까지 올라가 구글이 대부분을 색인에서 뺐다.
            겸사겸사 `mbti makeup`(평균 9.2위)로 노출이 가장 많은 이 페이지가 두터워진다. */}
        <ToolFaq
          title={isEn ? 'Makeup MBTI FAQ' : '메이크업 MBTI 자주 묻는 질문'}
          items={isEn ? MBTI_FAQ_BASE_EN : MBTI_FAQ_BASE}
        />

        </main>
        <ToolsFooter />
      </div>
    )
  }

  /* ---------- REDIRECTING ---------- */
  if (phase === 'redirecting') {
    return <QuizRedirecting isEn={isEn} />
  }

  /* ---------- QUIZ ---------- */
  const questionText = isEn && q.questionEn ? q.questionEn : q.question
  const descriptionText = isEn && q.descriptionEn ? q.descriptionEn : q.description

  return (
    <QuizScreen
      toolLabel={isEn ? 'Makeup MBTI' : '메이크업 MBTI'}
      step={currentIdx + 1}
      total={QUESTIONS.length}
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
        onSelect: () => onSelect(opt.letter),
      }))}
    />
  )
}
