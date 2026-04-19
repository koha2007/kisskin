// Face Shape — 8-question self-diagnosis
// Uses ratio + feature questions from Korean beauty research (KISTI JAKO200431559977577)
// Scoring: each type accumulates points; highest = result

import type { FaceShapeCode } from './types'

export type FSAnswer = FaceShapeCode  // directly maps to type

export interface FSQuestion {
  id: number
  question: string
  description?: string
  options: { text: string; value: FaceShapeCode; emoji: string }[]
}

export const FS_QUESTIONS: FSQuestion[] = [
  {
    id: 1,
    question: '얼굴 세로 길이 : 가로 너비 비율은?',
    description: '거울 앞에서 헤어밴드로 머리를 넘기고 확인해 주세요.',
    options: [
      { text: '세로가 가로의 약 1.5배 (균형잡힘)', value: 'oval', emoji: '🥚' },
      { text: '세로와 가로가 거의 비슷 (1:1)', value: 'round', emoji: '🌕' },
      { text: '세로가 가로보다 훨씬 김 (1.7배 이상)', value: 'oblong', emoji: '🫒' },
    ],
  },
  {
    id: 2,
    question: '이마·광대·턱 중 어느 부분이 가장 넓은가요?',
    options: [
      { text: '이마 — 턱으로 갈수록 좁아짐', value: 'heart', emoji: '💖' },
      { text: '광대 — 이마와 턱보다 광대가 더 넓음', value: 'round', emoji: '🌕' },
      { text: '비슷함 — 이마·광대·턱 너비가 거의 같음', value: 'square', emoji: '🧊' },
    ],
  },
  {
    id: 3,
    question: '턱 끝 모양은?',
    options: [
      { text: '부드럽게 둥글거나 완만한 V', value: 'oval', emoji: '🥚' },
      { text: '각지고 단단함', value: 'square', emoji: '🧊' },
      { text: '뾰족함 — V라인', value: 'heart', emoji: '💖' },
    ],
  },
  {
    id: 4,
    question: '헤어라인(이마 윗부분) 모양은?',
    options: [
      { text: '부드러운 곡선', value: 'oval', emoji: '🥚' },
      { text: '직선에 가까움', value: 'square', emoji: '🧊' },
      { text: '둥글게 내려감', value: 'round', emoji: '🌕' },
      { text: 'M자 또는 V자처럼 넓음', value: 'heart', emoji: '💖' },
    ],
  },
  {
    id: 5,
    question: '볼(뺨) 상태는?',
    options: [
      { text: '볼살이 적당하고 균형있음', value: 'oval', emoji: '🥚' },
      { text: '볼살이 풍성해 동안 인상', value: 'round', emoji: '🌕' },
      { text: '볼살이 적어 뺨이 길어 보임', value: 'oblong', emoji: '🫒' },
    ],
  },
  {
    id: 6,
    question: '옆모습에서 턱선 각도는?',
    options: [
      { text: '완만한 곡선', value: 'oval', emoji: '🥚' },
      { text: '또렷한 90도 가까운 각', value: 'square', emoji: '🧊' },
      { text: '부드럽게 내려가다 뾰족해짐', value: 'heart', emoji: '💖' },
      { text: '턱 라인이 길게 떨어짐', value: 'oblong', emoji: '🫒' },
    ],
  },
  {
    id: 7,
    question: '정면에서 보는 첫인상은?',
    options: [
      { text: '균형잡히고 이목구비 또렷', value: 'oval', emoji: '🥚' },
      { text: '귀엽고 동안 · 포근함', value: 'round', emoji: '🌕' },
      { text: '샤프하고 카리스마', value: 'square', emoji: '🧊' },
      { text: '지적이고 성숙함', value: 'oblong', emoji: '🫒' },
      { text: '우아하고 사랑스러움', value: 'heart', emoji: '💖' },
    ],
  },
  {
    id: 8,
    question: '가장 자주 듣는 얼굴 관련 말은?',
    options: [
      { text: '"얼굴형이 예쁘다 / 비율이 좋다"', value: 'oval', emoji: '🥚' },
      { text: '"동안이다 / 귀엽다"', value: 'round', emoji: '🌕' },
      { text: '"얼굴이 작고 샤프하다"', value: 'square', emoji: '🧊' },
      { text: '"얼굴이 길다 / 성숙해 보인다"', value: 'oblong', emoji: '🫒' },
      { text: '"V라인이다 / 여성스럽다"', value: 'heart', emoji: '💖' },
    ],
  },
]

export function computeFaceShape(answers: FSAnswer[]): FaceShapeCode {
  const counts: Record<FaceShapeCode, number> = { oval: 0, round: 0, square: 0, oblong: 0, heart: 0 }
  for (const a of answers) counts[a]++
  let max: FaceShapeCode = 'oval'
  let maxCount = counts.oval
  for (const k of Object.keys(counts) as FaceShapeCode[]) {
    if (counts[k] > maxCount) { max = k; maxCount = counts[k] }
  }
  return max
}
