// Makeup MBTI — 8-question validated quiz
// Axis distribution: E/I×2, N/S×2, F/T×2, P/J×2  (총 8문항)
// 각 문항은 한 축만 측정하여 해석 혼란을 최소화합니다.

import type { MbtiCode } from './types'

export type Axis = 'EI' | 'NS' | 'FT' | 'PJ'

export interface QuizOption {
  text: string
  letter: 'E' | 'I' | 'N' | 'S' | 'F' | 'T' | 'P' | 'J'
  emoji?: string
}

export interface QuizQuestion {
  id: number
  axis: Axis
  question: string
  description?: string
  options: [QuizOption, QuizOption]
}

export const QUESTIONS: QuizQuestion[] = [
  // E/I — 표현 강도
  {
    id: 1,
    axis: 'EI',
    question: '새로 나온 강렬한 컬러 립스틱을 봤을 때 첫 반응은?',
    description: '예컨대 2026년 유행하는 "토마토 레드" 같은 색을 처음 만난 상황.',
    options: [
      { text: '일단 발라본다. 존재감 있는 메이크업이 좋다.', letter: 'E', emoji: '💋' },
      { text: '예쁘긴 한데 내 평소 톤이 더 편하다.', letter: 'I', emoji: '🤍' },
    ],
  },
  {
    id: 2,
    axis: 'EI',
    question: '평소와 다른 특별한 자리(모임·데이트·행사)의 메이크업은?',
    options: [
      { text: '평소보다 포인트를 확실히 더 준다.', letter: 'E', emoji: '🔥' },
      { text: '평소 스타일 그대로, 대신 피부 톤만 더 신경 쓴다.', letter: 'I', emoji: '🌸' },
    ],
  },

  // N/S — 영감 원천
  {
    id: 3,
    axis: 'NS',
    question: '화장품 매장에서 더 끌리는 제품은?',
    options: [
      { text: '처음 보는 한정판·신제품. 새로운 건 일단 궁금하다.', letter: 'N', emoji: '🧪' },
      { text: '후기 검증된 스테디셀러. 실패가 없는 게 중요하다.', letter: 'S', emoji: '📚' },
    ],
  },
  {
    id: 4,
    axis: 'NS',
    question: 'SNS에 새로운 메이크업 트렌드가 뜨면?',
    options: [
      { text: '일단 따라해본다. 재밌으니까 시도한다.', letter: 'N', emoji: '🚀' },
      { text: '관심은 있지만, 내 공식이 우선이다.', letter: 'S', emoji: '🎯' },
    ],
  },

  // F/T — 무드 방향
  {
    id: 5,
    axis: 'FT',
    question: '눈 화장을 마무리할 때 더 자연스러운 방식은?',
    options: [
      { text: '블러·스모키로 경계를 부드럽게 풀어준다.', letter: 'F', emoji: '🌫️' },
      { text: '또렷한 아이라인과 섀딩으로 구조를 잡아준다.', letter: 'T', emoji: '🖤' },
    ],
  },
  {
    id: 6,
    axis: 'FT',
    question: '"예쁘다"라고 느끼는 감각의 핵심은?',
    options: [
      { text: '전체 무드가 부드럽고 감성적으로 번질 때.', letter: 'F', emoji: '🌸' },
      { text: '라인과 포인트가 샤프하게 잘 잡혔을 때.', letter: 'T', emoji: '✒️' },
    ],
  },

  // P/J — 루틴 스타일
  {
    id: 7,
    axis: 'PJ',
    question: '아침 메이크업의 결정 방식은?',
    options: [
      { text: '그날 기분·날씨·옷에 따라 즉흥적으로 고른다.', letter: 'P', emoji: '🎲' },
      { text: '정해진 순서와 아이템을 거의 매일 일관되게 한다.', letter: 'J', emoji: '📋' },
    ],
  },
  {
    id: 8,
    axis: 'PJ',
    question: '당신의 "시그니처 룩"은?',
    options: [
      { text: '계속 바뀐다. 한 가지로 정의하기 어렵다.', letter: 'P', emoji: '🎨' },
      { text: '분명한 공식이 있고 자주 유지한다.', letter: 'J', emoji: '🔖' },
    ],
  },
]

/**
 * 답변 배열(각 문항에 선택된 letter)로부터 MBTI 코드를 계산합니다.
 * 동점 시 각 축의 기본값: E, S, F, J (즉 다수파 성향).
 */
export function computeMbti(answers: QuizOption['letter'][]): MbtiCode {
  const counts = { E: 0, I: 0, N: 0, S: 0, F: 0, T: 0, P: 0, J: 0 }
  for (const a of answers) counts[a]++

  const ei = counts.E >= counts.I ? 'E' : 'I'
  const ns = counts.N > counts.S ? 'N' : 'S'  // S 기본
  const ft = counts.F >= counts.T ? 'F' : 'T'
  const pj = counts.P > counts.J ? 'P' : 'J'  // J 기본

  return `${ei}${ns}${ft}${pj}` as MbtiCode
}

/**
 * 축별 선호 강도 (0..100) 반환. 결과 페이지 그래프용.
 */
export function computeAxisStrength(answers: QuizOption['letter'][]): {
  e: number; n: number; f: number; p: number
} {
  const counts = { E: 0, I: 0, N: 0, S: 0, F: 0, T: 0, P: 0, J: 0 }
  for (const a of answers) counts[a]++
  const pct = (a: number, b: number) => Math.round((a / (a + b || 1)) * 100)
  return {
    e: pct(counts.E, counts.I),
    n: pct(counts.N, counts.S),
    f: pct(counts.F, counts.T),
    p: pct(counts.P, counts.J),
  }
}
