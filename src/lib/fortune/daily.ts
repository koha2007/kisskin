// 오늘의 관상 메이크업 운 — 매일 무료(글만, 비용 0) (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 운영자 결정: 무료 이미지(2장)는 묶어 두고, 매일 볼 거리(글)로 재방문을 만든다
//   (Krea·Leonardo 의 "매일 채워지는 무료" · 점신의 매일 운세와 같은 습관 장치).
// 계산: 오늘의 일진(日辰) 천간 오행 ↔ 내 일간(日干) 관계(십성) → 오늘의 주제 운.
//   생년월일이 없으면(사진만) 동물상 + 오늘 오행으로 고른다. 같은 날·같은 사람이면 항상 같은 결과.
// ⚠ 재미로 보는 결과. 겁주는 말(사고·병·손재) 금지 — 모든 날은 "이렇게 하면 더 좋은 날"로.
import { computeSaju, stemElement, generatedBy, generates, controls, ELEMENTS, STEMS_HANJA, BRANCHES_HANJA, type Element } from './saju'
import type { FortuneLookId } from './looks'
import type { FortuneResult } from './state'

const controlledBy = (e: Element): Element => ELEMENTS[(ELEMENTS.indexOf(e) + 3) % 5]
type Rel = 'same' | 'output' | 'wealth' | 'power' | 'resource'

/** 십성 관계별 오늘의 주제 — 운 2개 중 하나를 날짜로 고른다 */
const REL: Record<Rel, { looks: FortuneLookId[]; ko: string; en: string; tipKo: string; tipEn: string }> = {
  same: { looks: ['popularity', 'reunion'], ko: '사람이 모이는 날', en: 'A day people gather around you',
    tipKo: '먼저 연락하면 반가운 답이 와요. 웃는 입꼬리가 오늘의 포인트.', tipEn: 'Reach out first — replies come back warm. Smiling lip corners are your point today.' },
  output: { looks: ['love', 'travel'], ko: '매력이 드러나는 날', en: 'A day your charm shows',
    tipKo: '하고 싶은 말을 꺼내기 좋은 날. 볼에 생기를 더해 보세요.', tipEn: 'A good day to say what you mean. Add a flush to your cheeks.' },
  wealth: { looks: ['wealth', 'marriage'], ko: '재물이 들어오는 날', en: 'A day money flows in',
    tipKo: '작은 기회도 잡아 두세요. 코끝에 빛을 더하면 재백궁이 살아나요.', tipEn: 'Grab small chances. Light on the nose tip wakes the wealth palace.' },
  power: { looks: ['career', 'exam'], ko: '인정받는 날', en: 'A day you get recognised',
    tipKo: '중요한 자리에 서기 좋은 날. 반듯한 눈썹이 신뢰를 더해요.', tipEn: 'A good day to step up. Neat brows add trust.' },
  resource: { looks: ['exam', 'health'], ko: '채우고 배우는 날', en: 'A day to learn and recharge',
    tipKo: '머리가 맑은 날 — 공부·준비에 좋아요. 맑은 미간과 혈색을 챙기세요.', tipEn: 'A clear-headed day for study and prep. Keep the brow-space clean and add healthy colour.' },
}

const ELEM_COLOR: Record<Element, { ko: string; en: string; hex: string }> = {
  wood: { ko: '올리브 그린', en: 'olive green', hex: '#5b7f3a' },
  fire: { ko: '코랄 레드', en: 'coral red', hex: '#e2553f' },
  earth: { ko: '테라코타', en: 'terracotta', hex: '#c8774a' },
  metal: { ko: '샴페인 골드', en: 'champagne gold', hex: '#d8b770' },
  water: { ko: '딥 네이비', en: 'deep navy', hex: '#1f3a6b' },
}

export interface DailyFortune {
  dateKey: string
  dayPillarHanja: string
  look: FortuneLookId
  themeKo: string; themeEn: string
  tipKo: string; tipEn: string
  color: { ko: string; en: string; hex: string }
  stars: number // 3~5 — 나쁜 날은 없다
}

function hash(s: string) {
  let h = 2166136261
  for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) }
  return h >>> 0
}

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function dailyFortune(r: FortuneResult, now = new Date()): DailyFortune {
  const today = computeSaju({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() })
  const todayEl = stemElement(today.day.stem)
  const key = todayKey(now)
  // 기준 오행: 일간(생년월일 있을 때) 또는 동물상에서 정한 오행(사진만)
  const ANIMAL_EL: Record<string, Element> = { fox: 'fire', cat: 'metal', dog: 'earth', rabbit: 'wood', bear: 'earth', deer: 'wood', tiger: 'wood', wolf: 'water', dino: 'fire' }
  const me: Element = r.dayStem != null ? stemElement(r.dayStem) : ANIMAL_EL[r.animals?.[0]?.id ?? 'fox']
  const rel: Rel = todayEl === me ? 'same' : todayEl === generates(me) ? 'output' : todayEl === controls(me) ? 'wealth'
    : todayEl === controlledBy(me) ? 'power' : 'resource'
  const h = hash(key + r.serial)
  const R = REL[rel]
  // 행운 색 = 오늘 일진을 생해 주는 오행(날마다 바뀜). 부족한 오행이 있으면 "재물·인정" 날엔 그쪽으로 채운다.
  const colorEl = r.lacking && (rel === 'wealth' || rel === 'power') ? r.lacking : generatedBy(todayEl)
  return {
    dateKey: key,
    dayPillarHanja: STEMS_HANJA[today.day.stem] + BRANCHES_HANJA[today.day.branch],
    look: R.looks[h % R.looks.length],
    themeKo: R.ko, themeEn: R.en, tipKo: R.tipKo, tipEn: R.tipEn,
    color: ELEM_COLOR[colorEl],
    stars: 3 + ((h >>> 11) % 3),
  }
}
