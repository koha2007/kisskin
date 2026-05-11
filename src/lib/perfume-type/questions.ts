// Perfume Type — 5-question diagnosis with weighted scoring
// Each option contributes weighted points to multiple types (not a 1:1 mapping like face-shape)
// Highest cumulative score = result. Tie-break: Q4 (analytical) > Q5 > Q3 > Q2 > Q1.

import type { PerfumeTypeCode } from './types'

export type PTWeights = Partial<Record<PerfumeTypeCode, number>>

export interface PTOption {
  text: string
  textEn?: string
  emoji: string
  weights: PTWeights
}

export interface PTQuestion {
  id: number
  question: string
  questionEn?: string
  description?: string
  descriptionEn?: string
  options: PTOption[]
}

export const PT_QUESTIONS: PTQuestion[] = [
  {
    id: 1,
    question: '가장 끌리는 계절 풍경은?',
    description: '눈을 감고 떠올렸을 때 가장 마음이 평온해지는 장면을 고르세요.',
    options: [
      { text: '봄 정원 — 꽃이 핀 산책로', emoji: '🌸', weights: { floral: 3, fresh: 1 } },
      { text: '여름 해변 — 모래·바다 냄새', emoji: '☀️', weights: { fresh: 3, citrus: 2 } },
      { text: '가을 숲 — 낙엽과 흙', emoji: '🍂', weights: { woody: 3, amber: 1 } },
      { text: '겨울 벽난로 — 따뜻한 불빛', emoji: '❄️', weights: { amber: 3, gourmand: 2 } },
    ],
  },
  {
    id: 2,
    question: '카페에서 늘 주문하는 메뉴는?',
    description: '오랫동안 손이 가는 시그니처 메뉴를 고르세요.',
    options: [
      { text: '아이스 레몬에이드 / 자몽주스', emoji: '🍋', weights: { citrus: 3, fresh: 1 } },
      { text: '따뜻한 라떼 / 카페모카', emoji: '☕', weights: { gourmand: 2, woody: 1 } },
      { text: '바닐라 쿠키 / 카라멜 디저트', emoji: '🍪', weights: { gourmand: 3, amber: 1 } },
      { text: '우롱차 / 녹차', emoji: '🍵', weights: { woody: 2, fresh: 1 } },
    ],
  },
  {
    id: 3,
    question: '옷장에서 가장 많이 보이는 색은?',
    description: '본인의 옷 80%를 차지하는 베이스 컬러를 고르세요.',
    options: [
      { text: '화이트·베이지·아이보리', emoji: '🤍', weights: { fresh: 3, floral: 1 } },
      { text: '블랙·차콜·그레이', emoji: '🖤', weights: { woody: 2, amber: 2 } },
      { text: '브라운·카멜·올리브', emoji: '🤎', weights: { woody: 3, amber: 1 } },
      { text: '핑크·로즈·레드', emoji: '🌹', weights: { floral: 2, gourmand: 2 } },
    ],
  },
  {
    id: 4,
    question: '사람들에게 어떤 인상을 주고 싶은가요?',
    description: '향수 한 줄로 "이런 사람"이라는 인상을 만든다면 어느 쪽이 가장 가까운가요?',
    options: [
      { text: '신뢰감 있고 차분한', emoji: '💼', weights: { woody: 3, fresh: 1 } },
      { text: '신비롭고 깊이 있는', emoji: '✨', weights: { amber: 3, woody: 1 } },
      { text: '자연스럽고 깔끔한', emoji: '🌿', weights: { fresh: 2, citrus: 2 } },
      { text: '시선을 끌고 사랑스러운', emoji: '💋', weights: { amber: 2, gourmand: 2, floral: 1 } },
    ],
  },
  {
    id: 5,
    question: '향이 머무는 시간은 어느 정도가 좋나요?',
    description: '본인의 라이프스타일과 가장 잘 맞는 지속력을 고르세요.',
    options: [
      { text: '가볍게 (2~3시간) — 자주 덧뿌리는 게 더 좋음', emoji: '💨', weights: { citrus: 3, fresh: 2 } },
      { text: '적당히 (4~6시간) — 데일리에 딱 맞게', emoji: '🌬️', weights: { floral: 2, gourmand: 1 } },
      { text: '오래 (8시간+) — 한 번 뿌리면 하루 종일', emoji: '🌊', weights: { woody: 2, amber: 3 } },
    ],
  },
]

export function computePerfumeType(answers: PTOption[]): PerfumeTypeCode {
  const scores: Record<PerfumeTypeCode, number> = {
    floral: 0, citrus: 0, woody: 0, amber: 0, fresh: 0, gourmand: 0,
  }
  for (const a of answers) {
    for (const [code, points] of Object.entries(a.weights)) {
      scores[code as PerfumeTypeCode] += points ?? 0
    }
  }

  let max: PerfumeTypeCode = 'floral'
  let maxScore = scores.floral
  for (const k of Object.keys(scores) as PerfumeTypeCode[]) {
    if (scores[k] > maxScore) { max = k; maxScore = scores[k] }
  }
  return max
}
