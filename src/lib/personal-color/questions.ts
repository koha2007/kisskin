// Personal Color — 10-question self-diagnosis
// Validated against namu.wiki 퍼스널컬러 기준, Carole Jackson 4-season framework.
// 축: WarmCool (6문항) + LightDeep (4문항)
//   Warm/Cool 판정 → 봄·가을 vs 여름·겨울
//   Light/Deep 판정 → 봄·여름 (Light) vs 가을·겨울 (Deep)

import type { SeasonCode } from './types'

export type PCAnswer = 'W' | 'C' | 'L' | 'D'

export interface PCQuestion {
  id: number
  axis: 'WC' | 'LD'
  question: string
  description?: string
  options: [
    { text: string; value: PCAnswer; emoji: string },
    { text: string; value: PCAnswer; emoji: string }
  ]
}

export const PC_QUESTIONS: PCQuestion[] = [
  {
    id: 1,
    axis: 'WC',
    question: '손목 안쪽 혈관 색깔은?',
    description: '밝은 자연광 아래에서 확인해 주세요.',
    options: [
      { text: '초록색·올리브색에 가깝다', value: 'W', emoji: '🌿' },
      { text: '파란색·보라색에 가깝다', value: 'C', emoji: '💙' },
    ],
  },
  {
    id: 2,
    axis: 'WC',
    question: '햇빛에 오래 노출되면?',
    options: [
      { text: '잘 타서 갈색·구릿빛이 된다', value: 'W', emoji: '☀️' },
      { text: '빨갛게 달아오르고 쉽게 타지 않는다', value: 'C', emoji: '🔴' },
    ],
  },
  {
    id: 3,
    axis: 'WC',
    question: '은(실버) vs 금(골드) 액세서리 중 얼굴에 대면?',
    options: [
      { text: '골드가 얼굴을 화사하고 건강하게 만든다', value: 'W', emoji: '✨' },
      { text: '실버가 얼굴을 깔끔하고 또렷하게 만든다', value: 'C', emoji: '🥈' },
    ],
  },
  {
    id: 4,
    axis: 'WC',
    question: '흰 옷을 입을 때 더 편한 쪽은?',
    options: [
      { text: '아이보리·크림 같은 따뜻한 화이트', value: 'W', emoji: '🤍' },
      { text: '순백·퓨어 화이트가 더 깔끔하다', value: 'C', emoji: '🕊️' },
    ],
  },
  {
    id: 5,
    axis: 'WC',
    question: '자연 모발 색은?',
    options: [
      { text: '짙은 갈색·오렌지 기운의 브라운', value: 'W', emoji: '🌰' },
      { text: '블루 블랙·애쉬 기운의 검정', value: 'C', emoji: '🖤' },
    ],
  },
  {
    id: 6,
    axis: 'WC',
    question: '입술 자연 색은?',
    options: [
      { text: '오렌지·살몬·살색에 가깝다', value: 'W', emoji: '🍑' },
      { text: '핑크·장미·보랏빛이 섞여 있다', value: 'C', emoji: '🌹' },
    ],
  },
  // Light/Deep
  {
    id: 7,
    axis: 'LD',
    question: '피부 전체 밝기는?',
    options: [
      { text: '밝고 투명한 편, 기미·잡티가 비교적 적음', value: 'L', emoji: '🌸' },
      { text: '중간~어두운 편, 깊이가 있는 피부', value: 'D', emoji: '🍂' },
    ],
  },
  {
    id: 8,
    axis: 'LD',
    question: '검정 티셔츠 vs 파스텔 상의, 어느 쪽이 더 예뻐 보인다?',
    options: [
      { text: '파스텔·밝은 색이 얼굴을 살린다', value: 'L', emoji: '💗' },
      { text: '블랙·와인·딥 컬러가 얼굴을 또렷하게 만든다', value: 'D', emoji: '🍷' },
    ],
  },
  {
    id: 9,
    axis: 'LD',
    question: '눈동자·모발·피부의 전체 대비는?',
    options: [
      { text: '부드럽고 유사한 톤 — 조화로움', value: 'L', emoji: '🌷' },
      { text: '강한 대비 — 확실히 차이가 있음', value: 'D', emoji: '🎴' },
    ],
  },
  {
    id: 10,
    axis: 'LD',
    question: '첫인상을 물으면?',
    options: [
      { text: '밝고 생기 있다 · 어려 보인다', value: 'L', emoji: '🌼' },
      { text: '차분하고 성숙하다 · 카리스마 있다', value: 'D', emoji: '👑' },
    ],
  },
]

export function computeSeason(answers: PCAnswer[]): SeasonCode {
  const c = { W: 0, C: 0, L: 0, D: 0 }
  for (const a of answers) c[a]++
  const warm = c.W >= c.C
  const light = c.L >= c.D
  if (warm && light) return 'spring'
  if (!warm && light) return 'summer'
  if (warm && !light) return 'autumn'
  return 'winter'
}

export function computeStrength(answers: PCAnswer[]) {
  const c = { W: 0, C: 0, L: 0, D: 0 }
  for (const a of answers) c[a]++
  const wc = c.W + c.C || 1
  const ld = c.L + c.D || 1
  return {
    warm: Math.round((c.W / wc) * 100),
    light: Math.round((c.L / ld) * 100),
  }
}
