// AI 이상형 테스트 — 질문 10개 (+ 0번 성별). docs/IDEAL_TYPE_PLAN.md 3-3절(11/25 Q6·Q9 짝 조정본).
// 보기 4개 × 보기마다 2유형에 1점. 문항마다 8유형이 한 번씩 나와 점수가 치우치지 않는다.
// 동점이면 Q3(첫눈에 보는 곳) 답 → 그래도 같으면 IDEAL_ORDER 순.
import { IDEAL_ORDER, type IdealPlace, type IdealTypeCode } from './types'

export interface IQOption { ko: string; en: string; emoji: string; types: [IdealTypeCode, IdealTypeCode]; place?: IdealPlace }
export interface IQQuestion { id: number; ko: string; en: string; options: IQOption[]; badgeKo: string; badgeEn: string }

const o = (ko: string, en: string, emoji: string, a: IdealTypeCode, b: IdealTypeCode, place?: IdealPlace): IQOption => ({ ko, en, emoji, types: [a, b], place })

export const IQ_QUESTIONS: IQQuestion[] = [
  { id: 1, ko: '첫 데이트 장소는?', en: 'Where is your first date?', badgeKo: '데이트', badgeEn: 'Date', options: [
    o('한강 피크닉', 'Riverside picnic', '🧺', 'golden-retriever', 'teddy-bear', 'picnic'),
    o('조용한 LP 카페', 'A quiet vinyl café', '🎧', 'black-cat', 'wolf', 'lpbar'),
    o('전시회', 'An art gallery', '🖼️', 'deer', 'fox', 'exhibition'),
    o('놀이공원', 'An amusement park', '🎡', 'bunny', 'dino', 'amusement'),
  ] },
  { id: 2, ko: '그 사람 옷장 색은?', en: 'What colors fill their closet?', badgeKo: '옷장', badgeEn: 'Closet', options: [
    o('크림·베이지', 'Cream & beige', '🤍', 'teddy-bear', 'deer'),
    o('블랙·차콜', 'Black & charcoal', '🖤', 'black-cat', 'wolf'),
    o('파스텔', 'Pastels', '🩷', 'bunny', 'golden-retriever'),
    o('포인트 컬러 하나', 'One bold accent color', '🧡', 'fox', 'dino'),
  ] },
  { id: 3, ko: '첫눈에 보는 곳은?', en: 'What do you notice first?', badgeKo: '첫눈에', badgeEn: 'First look', options: [
    o('눈웃음', 'A smiling eye', '😊', 'golden-retriever', 'bunny'),
    o('눈빛', 'An intense gaze', '👀', 'black-cat', 'fox'),
    o('어깨·손', 'Shoulders & hands', '🤝', 'wolf', 'dino'),
    o('분위기·목소리', 'Vibe & voice', '🎙️', 'teddy-bear', 'deer'),
  ] },
  { id: 4, ko: '함께 보내는 주말은?', en: 'Your weekend together?', badgeKo: '주말', badgeEn: 'Weekend', options: [
    o('운동·캠핑', 'Sports & camping', '⛺', 'dino', 'wolf'),
    o('카페에서 책', 'Books at a café', '📖', 'deer', 'black-cat'),
    o('맛집 탐방', 'Food hunting', '🍜', 'teddy-bear', 'golden-retriever'),
    o('쇼핑·전시', 'Shopping & shows', '🛍️', 'fox', 'bunny'),
  ] },
  { id: 5, ko: '그 사람에게서 나는 향은?', en: 'What do they smell like?', badgeKo: '향', badgeEn: 'Scent', options: [
    o('비누·코튼', 'Soap & cotton', '🫧', 'golden-retriever', 'bunny'),
    o('우디·머스크', 'Woods & musk', '🪵', 'wolf', 'black-cat'),
    o('시트러스', 'Citrus', '🍋', 'dino', 'fox'),
    o('플로럴·티', 'Florals & tea', '🍵', 'deer', 'teddy-bear'),
  ] },
  { id: 6, ko: '둘이 찍은 사진 분위기는?', en: 'The mood of your photos together?', badgeKo: '사진', badgeEn: 'Photos', options: [
    o('필름 카메라', 'Film camera', '📷', 'teddy-bear', 'golden-retriever'),
    o('흑백', 'Black & white', '🎞️', 'black-cat', 'fox'),
    o('햇살', 'Sunlight', '🌤️', 'bunny', 'deer'),
    o('도시 야경', 'City lights at night', '🌃', 'wolf', 'dino'),
  ] },
  { id: 7, ko: '연락 스타일은?', en: 'How do they text?', badgeKo: '연락', badgeEn: 'Texting', options: [
    o('하루 종일 수다', 'All-day chatter', '💬', 'golden-retriever', 'bunny'),
    o('짧고 굵게', 'Short and sweet', '✉️', 'black-cat', 'wolf'),
    o('"잘 자"는 꼭', 'Always a goodnight', '🌙', 'teddy-bear', 'deer'),
    o('갑자기 전화', 'Surprise calls', '📞', 'dino', 'fox'),
  ] },
  { id: 8, ko: '다퉜을 때는?', en: 'After an argument?', badgeKo: '화해', badgeEn: 'Making up', options: [
    o('먼저 사과', 'Apologizes first', '🙏', 'golden-retriever', 'teddy-bear'),
    o('시간 두고 대화', 'Talks it out later', '⏳', 'black-cat', 'deer'),
    o('바로 풀자', 'Fixes it right away', '⚡', 'dino', 'wolf'),
    o('애교로 풀기', 'Charms their way back', '🥺', 'bunny', 'fox'),
  ] },
  { id: 9, ko: '받고 싶은 선물은?', en: 'The gift you want from them?', badgeKo: '선물', badgeEn: 'Gift', options: [
    o('손편지', 'A handwritten letter', '💌', 'deer', 'bunny'),
    o('실용템', 'Something practical', '🎒', 'dino', 'wolf'),
    o('깜짝 이벤트', 'A surprise', '🎉', 'golden-retriever', 'fox'),
    o('취향 저격 소품', 'A thing that is so me', '🕯️', 'black-cat', 'teddy-bear'),
  ] },
  { id: 10, ko: '함께 가는 여행은?', en: 'How do you travel together?', badgeKo: '여행', badgeEn: 'Travel', options: [
    o('계획 없이 떠나기', 'Just go, no plan', '🚗', 'dino', 'golden-retriever'),
    o('완벽한 계획', 'A perfect itinerary', '🗺️', 'fox', 'black-cat'),
    o('호캉스', 'A cozy hotel stay', '🏨', 'teddy-bear', 'bunny'),
    o('각자 시간도 존중', 'Time apart, too', '🧭', 'wolf', 'deer'),
  ] },
]

/** answers[i] = i번 문항에서 고른 보기 번호(0~3). */
export function computeIdealType(answers: number[]): IdealTypeCode {
  const score = Object.fromEntries(IDEAL_ORDER.map((c) => [c, 0])) as Record<IdealTypeCode, number>
  answers.forEach((a, i) => { const opt = IQ_QUESTIONS[i]?.options[a]; if (opt) for (const t of opt.types) score[t]++ })
  const max = Math.max(...Object.values(score))
  const tied = IDEAL_ORDER.filter((c) => score[c] === max)
  if (tied.length === 1) return tied[0]
  const q3 = IQ_QUESTIONS[2].options[answers[2]]?.types ?? []
  return tied.find((c) => q3.includes(c)) ?? tied[0]
}

export function placeOf(answers: number[]): IdealPlace {
  return IQ_QUESTIONS[0].options[answers[0]]?.place ?? 'picnic'
}

/** 결과 주소에 싣는 답 — 숫자 10자리(예: 0123012301). 결과 페이지가 배지·AI 한 줄에 쓴다. */
export const encodeAnswers = (a: number[]) => a.map((n) => String(n)).join('')
export function decodeAnswers(s: string | null | undefined): number[] | null {
  if (!s || !/^[0-3]{10}$/.test(s)) return null
  return s.split('').map(Number)
}
