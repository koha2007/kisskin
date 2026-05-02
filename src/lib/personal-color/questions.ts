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
  questionEn?: string
  description?: string
  descriptionEn?: string
  options: [
    { text: string; textEn?: string; value: PCAnswer; emoji: string },
    { text: string; textEn?: string; value: PCAnswer; emoji: string }
  ]
}

export const PC_QUESTIONS: PCQuestion[] = [
  {
    id: 1,
    axis: 'WC',
    question: '손목 안쪽 혈관 색깔은?',
    questionEn: 'What color are the veins on the inside of your wrist?',
    description: '밝은 자연광 아래에서 확인해 주세요.',
    descriptionEn: 'Check in bright natural light.',
    options: [
      { text: '초록색·올리브색에 가깝다', textEn: 'Closer to green or olive', value: 'W', emoji: '🌿' },
      { text: '파란색·보라색에 가깝다', textEn: 'Closer to blue or purple', value: 'C', emoji: '💙' },
    ],
  },
  {
    id: 2,
    axis: 'WC',
    question: '햇빛에 오래 노출되면?',
    questionEn: 'After long sun exposure, your skin…',
    options: [
      { text: '잘 타서 갈색·구릿빛이 된다', textEn: 'Tans easily, turning brown or copper', value: 'W', emoji: '☀️' },
      { text: '빨갛게 달아오르고 쉽게 타지 않는다', textEn: 'Goes red and burns rather than tans', value: 'C', emoji: '🔴' },
    ],
  },
  {
    id: 3,
    axis: 'WC',
    question: '은(실버) vs 금(골드) 액세서리 중 얼굴에 대면?',
    questionEn: 'Hold silver and gold accessories up to your face — which wins?',
    options: [
      { text: '골드가 얼굴을 화사하고 건강하게 만든다', textEn: 'Gold makes the face look bright and healthy', value: 'W', emoji: '✨' },
      { text: '실버가 얼굴을 깔끔하고 또렷하게 만든다', textEn: 'Silver makes the face look clean and defined', value: 'C', emoji: '🥈' },
    ],
  },
  {
    id: 4,
    axis: 'WC',
    question: '흰 옷을 입을 때 더 편한 쪽은?',
    questionEn: 'Which white tee feels more comfortable on you?',
    options: [
      { text: '아이보리·크림 같은 따뜻한 화이트', textEn: 'Warm whites like ivory or cream', value: 'W', emoji: '🤍' },
      { text: '순백·퓨어 화이트가 더 깔끔하다', textEn: 'Pure, crisp white reads cleaner', value: 'C', emoji: '🕊️' },
    ],
  },
  {
    id: 5,
    axis: 'WC',
    question: '자연 모발 색은?',
    questionEn: 'Your natural hair color is closer to…',
    options: [
      { text: '짙은 갈색·오렌지 기운의 브라운', textEn: 'Deep brown / brown with an orange undertone', value: 'W', emoji: '🌰' },
      { text: '블루 블랙·애쉬 기운의 검정', textEn: 'Blue-black or ash-tinted black', value: 'C', emoji: '🖤' },
    ],
  },
  {
    id: 6,
    axis: 'WC',
    question: '입술 자연 색은?',
    questionEn: 'Your natural lip color leans…',
    options: [
      { text: '오렌지·살몬·살색에 가깝다', textEn: 'Orange / salmon / nude', value: 'W', emoji: '🍑' },
      { text: '핑크·장미·보랏빛이 섞여 있다', textEn: 'Pink / rose / has a purple undertone', value: 'C', emoji: '🌹' },
    ],
  },
  // Light/Deep
  {
    id: 7,
    axis: 'LD',
    question: '피부 전체 밝기는?',
    questionEn: 'Overall skin brightness?',
    options: [
      { text: '밝고 투명한 편, 기미·잡티가 비교적 적음', textEn: 'Bright and translucent; relatively few dark spots', value: 'L', emoji: '🌸' },
      { text: '중간~어두운 편, 깊이가 있는 피부', textEn: 'Medium to deep; skin has visible depth', value: 'D', emoji: '🍂' },
    ],
  },
  {
    id: 8,
    axis: 'LD',
    question: '검정 티셔츠 vs 파스텔 상의, 어느 쪽이 더 예뻐 보인다?',
    questionEn: 'Black tee vs pastel top — which looks better on you?',
    options: [
      { text: '파스텔·밝은 색이 얼굴을 살린다', textEn: 'Pastels and brights bring the face up', value: 'L', emoji: '💗' },
      { text: '블랙·와인·딥 컬러가 얼굴을 또렷하게 만든다', textEn: 'Black, wine, and deep colors sharpen the face', value: 'D', emoji: '🍷' },
    ],
  },
  {
    id: 9,
    axis: 'LD',
    question: '눈동자·모발·피부의 전체 대비는?',
    questionEn: 'Overall contrast between your eyes, hair, and skin?',
    options: [
      { text: '부드럽고 유사한 톤 — 조화로움', textEn: 'Soft and similar — harmonious', value: 'L', emoji: '🌷' },
      { text: '강한 대비 — 확실히 차이가 있음', textEn: 'High contrast — clearly different tones', value: 'D', emoji: '🎴' },
    ],
  },
  {
    id: 10,
    axis: 'LD',
    question: '첫인상을 물으면?',
    questionEn: 'When people describe their first impression of you, they say…',
    options: [
      { text: '밝고 생기 있다 · 어려 보인다', textEn: 'Bright, lively, looks young', value: 'L', emoji: '🌼' },
      { text: '차분하고 성숙하다 · 카리스마 있다', textEn: 'Calm, mature, has charisma', value: 'D', emoji: '👑' },
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
