// 2027 정미년(丁未) 신년 부적 카드 — 무료(생년월일만, 기기 안 계산, 비용 0) (2026-10-22)
// ────────────────────────────────────────────────────────────────────
// 기획: memory project_2026_10_21_new_year_2027_plan (운영자 10/22 "추천대로").
//   • 올해의 한 글자 = 내 일간 × 2027 천간 丁 의 십성(10가지)
//   • 신년 유형 5종 = 십성 10 → 5 묶음(비겁·식상·재성·관성·인성) — 일간 오행별로 정확히 1/5씩 나온다
//   • 띠 한 줄 = 내 띠(연지) × 未 (午未合 · 亥卯未 삼합 · 丑未沖 · 같은 띠)
//   • 오복 순위 = 재물·연애·직업·건강·인복 (reading.ts 사주 점수 + 2027 가산)
//   • 좋은 달 3 · 쉬어 가는 달 1 = 2027 월주(절기 평균) × 신강/신약
//   • 행운색 = 부족 오행 색(부족이 火 면 올해가 채워 준다 → 붉은 양 레드)
// ⚠ 재미용. 건강·사고·손재로 겁주지 않는다 — 조심 달도 "쉬어 가는 달"로만 쓴다.
// 같은 생년월일이면 항상 같은 카드(공유·재방문 때 바뀌면 신뢰가 깨진다).
import { computeSaju, monthPillarOf, stemElement, branchElement, generates, controls, ELEMENTS, type BirthInput, type Element, type Saju } from './saju'
import { readFortunes, sajuRatios } from './reading'
import type { FortuneLookId } from './looks'

export const NY_YEAR = 2027
/** 2027 = 丁未: 丁(천간 3, 음화) · 未(지지 7, 토) */
const NY_STEM = 3
const NY_BRANCH = 7

const controlledBy = (e: Element): Element => ELEMENTS[(ELEMENTS.indexOf(e) + 3) % 5]
export type Group = 'same' | 'output' | 'wealth' | 'power' | 'resource'
const GROUPS: Group[] = ['same', 'output', 'wealth', 'power', 'resource']

function groupOf(me: Element, other: Element): Group {
  if (other === me) return 'same'
  if (other === generates(me)) return 'output'
  if (other === controls(me)) return 'wealth'
  if (other === controlledBy(me)) return 'power'
  return 'resource'
}
/** 십성 0~9 = 비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인 */
export function tenGodOf(dayStem: number, otherStem: number): number {
  const g = GROUPS.indexOf(groupOf(stemElement(dayStem), stemElement(otherStem)))
  return g * 2 + (dayStem % 2 === otherStem % 2 ? 0 : 1)
}

// ── 오복 = 2027 유료 5장의 다섯 운(관상 메이크업 9종 안에서) ──
export const BLESSINGS: FortuneLookId[] = ['wealth', 'love', 'career', 'health', 'popularity']
export const BLESSING_TEXT: Record<string, { ko: string; en: string; hanja: string }> = {
  wealth: { ko: '재물복', en: 'Wealth', hanja: '財' },
  love: { ko: '연애복', en: 'Love', hanja: '緣' },
  career: { ko: '직업복', en: 'Career', hanja: '官' },
  health: { ko: '건강복', en: 'Vitality', hanja: '壽' },
  popularity: { ko: '인복', en: 'People', hanja: '人' },
}

// ── 올해의 한 글자(십성 10) ──
export const ONE_CHAR: { hanja: string; ko: string; en: string; lineKo: string; lineEn: string }[] = [
  { hanja: '友', ko: '벗 우', en: 'Allies', lineKo: '함께 가면 멀리 가는 해', lineEn: 'Go together, go far' },
  { hanja: '勇', ko: '날랠 용', en: 'Courage', lineKo: '먼저 뛰어드는 사람이 얻는 해', lineEn: 'The bold one wins this year' },
  { hanja: '樂', ko: '즐길 락', en: 'Joy', lineKo: '좋아하는 일이 일이 되는 해', lineEn: 'What you love becomes your work' },
  { hanja: '華', ko: '빛날 화', en: 'Bloom', lineKo: '나를 드러낼수록 빛나는 해', lineEn: 'The more you show, the more you shine' },
  { hanja: '機', ko: '기회 기', en: 'Chance', lineKo: '큰 기회가 오가는 해', lineEn: 'Big chances come and go — catch one' },
  { hanja: '積', ko: '쌓을 적', en: 'Build', lineKo: '차곡차곡 쌓여 돌아오는 해', lineEn: 'Step by step, it all adds up' },
  { hanja: '躍', ko: '뛸 약', en: 'Leap', lineKo: '한 단계 뛰어오르는 해', lineEn: 'A year to level up' },
  { hanja: '名', ko: '이름 명', en: 'Name', lineKo: '이름이 알려지는 해', lineEn: 'Your name gets known' },
  { hanja: '悟', ko: '깨달을 오', en: 'Insight', lineKo: '새로운 눈이 뜨이는 해', lineEn: 'Your eyes open to something new' },
  { hanja: '學', ko: '배울 학', en: 'Learn', lineKo: '배우고 채우는 만큼 크는 해', lineEn: 'You grow as much as you learn' },
]

// ── 신년 유형 5종 ──
export const YEAR_TYPES: Record<Group, {
  ko: string; en: string; emoji: string; blessing: FortuneLookId
  descKo: string; descEn: string
}> = {
  same: { ko: '동행의 해', en: 'Year of Allies', emoji: '🤝', blessing: 'popularity',
    descKo: '붉은 양이 내 편을 데려와요. 혼자보다 같이 할 때 운이 커지는 해 — 모임·팀·동업에 힘이 실려요.',
    descEn: 'The Red Goat brings your people. Luck grows when you team up — groups, crews and partnerships thrive.' },
  output: { ko: '매력 발산의 해', en: 'Year of Spotlight', emoji: '💕', blessing: 'love',
    descKo: '내 기운이 밖으로 흘러넘치는 해. 말·글·얼굴로 나를 보여 줄수록 사람이 끌려와요 — 연애운이 활짝.',
    descEn: 'Your energy overflows outward. The more you show yourself, the more people are drawn in — love blooms.' },
  wealth: { ko: '결실의 해', en: 'Year of Harvest', emoji: '💰', blessing: 'wealth',
    descKo: '올해의 불기운이 내 재물 자리에 들어와요. 해 온 일이 돈과 결과로 돌아오는 수확의 해.',
    descEn: 'This year’s fire lands in your wealth seat. What you’ve worked on comes back as money and results.' },
  power: { ko: '도약의 해', en: 'Year of Rise', emoji: '💼', blessing: 'career',
    descKo: '자리와 책임이 함께 오는 해. 맡은 만큼 인정받아요 — 승진·합격·새 직함에 좋은 기운.',
    descEn: 'Position and responsibility arrive together. You’re recognised for what you take on — promotions and new titles.' },
  resource: { ko: '채움의 해', en: 'Year of Recharge', emoji: '🌿', blessing: 'health',
    descKo: '올해는 나를 채워 주는 기운이 들어와요. 배우고 쉬고 몸을 돌볼수록 운이 단단해지는 해.',
    descEn: 'Energy that refills you flows in. The more you learn, rest and care for yourself, the stronger your luck.' },
}

// ── 띠 × 未 ──
const ZODIAC_LINE: { ko: string; en: string; bonus?: Partial<Record<FortuneLookId, number>> }[] = [
  { ko: '쥐띠 — 바쁘게 움직일수록 길이 보여요', en: 'Rat — the busier you move, the clearer the road' },
  { ko: '소띠 — 丑未 맞바람, 이사·이직·새 출발에 힘이 실려요', en: 'Ox — a head-wind year that powers moves and fresh starts', bonus: { career: 3 } },
  { ko: '호랑이띠 — 앞장서면 따르는 사람이 생겨요', en: 'Tiger — lead and people follow' },
  { ko: '토끼띠 — 亥卯未 삼합, 내 편이 늘어나는 해', en: 'Rabbit — a triple-harmony year, your circle grows', bonus: { popularity: 4 } },
  { ko: '용띠 — 큰 그림을 그리기 좋은 해', en: 'Dragon — a good year to draw the big picture' },
  { ko: '뱀띠 — 조용히 준비한 것이 빛을 봐요', en: 'Snake — what you quietly prepared sees the light' },
  { ko: '말띠 — 午未 육합, 양과 말이 손잡는 귀인의 해', en: 'Horse — the Goat holds your hand, helpers appear', bonus: { popularity: 4, love: 2 } },
  { ko: '양띠 — 내 띠의 해, 내가 주인공', en: 'Goat — your own year, you’re the main character', bonus: { love: 2, career: 2 } },
  { ko: '원숭이띠 — 재치가 기회를 불러와요', en: 'Monkey — your wit calls in chances' },
  { ko: '닭띠 — 꾸준함이 이름이 되는 해', en: 'Rooster — consistency becomes your name' },
  { ko: '개띠 — 믿음이 쌓이는 해', en: 'Dog — trust builds up this year' },
  { ko: '돼지띠 — 亥卯未 삼합, 복이 모여드는 해', en: 'Pig — a triple-harmony year, blessings gather', bonus: { wealth: 3, popularity: 2 } },
]

// ── 행운색 + 행운 메이크업 한 줄(부족 오행) ──
export const LUCKY: Record<Element, { ko: string; en: string; hex: string; makeupKo: string; makeupEn: string; prompt: string }> = {
  wood: { ko: '올리브 그린', en: 'Olive Green', hex: '#5b7f3a',
    makeupKo: '올리브 그린 아이라인 + 붉은 양 코랄 립', makeupEn: 'Olive-green liner + Red Goat coral lip',
    prompt: 'a fine olive-green accent along the outer upper lash line' },
  fire: { ko: '붉은 양 레드', en: 'Red Goat Red', hex: '#d6402f',
    makeupKo: '올해가 채워 주는 불기운 — 레드 립 하나로 완성', makeupEn: 'The year itself brings your fire — one red lip does it',
    prompt: 'a slightly deeper, auspicious red tone in the lips' },
  earth: { ko: '테라코타', en: 'Terracotta', hex: '#c8774a',
    makeupKo: '테라코타 섀도 + 붉은 양 브릭 립', makeupEn: 'Terracotta shadow + Red Goat brick lip',
    prompt: 'a warm terracotta wash in the eyeshadow' },
  metal: { ko: '샴페인 골드', en: 'Champagne Gold', hex: '#d8b770',
    makeupKo: '샴페인 골드 하이라이트 + 붉은 양 레드 립', makeupEn: 'Champagne-gold highlight + Red Goat red lip',
    prompt: 'a fine champagne-gold shimmer on the inner eye corners' },
  water: { ko: '딥 네이비', en: 'Deep Navy', hex: '#1f3a6b',
    makeupKo: '딥 네이비 라인 + 붉은 양 체리 립', makeupEn: 'Deep-navy liner + Red Goat cherry lip',
    prompt: 'a deep navy definition at the upper lash line' },
}

/** 오복 메이크업 지시문 뒤에 붙는 2027 신년 포인트(룩의 전체 인상은 그대로, 포인트만) */
export function newYearAccentPrompt(lacking?: Element): string {
  const base = 'Add a subtle 2027 Year of the Fire Goat lucky touch: a soft red-gold glow on the cheekbones'
  return lacking ? `${base} and ${LUCKY[lacking].prompt}.` : `${base}.`
}

// ── 달별 주제 ──
export const MONTH_THEME: Record<Group, { ko: string; en: string; restKo: string; restEn: string }> = {
  same: { ko: '사람 운', en: 'people luck', restKo: '혼자 다 하려 하지 말고 나눠 맡기기', restEn: 'Share the load instead of carrying it alone' },
  output: { ko: '표현·연애 운', en: 'charm & love luck', restKo: '말을 아끼고 마음을 정리하기', restEn: 'Say less, sort your feelings' },
  wealth: { ko: '재물 운', en: 'money luck', restKo: '큰 지출은 다음 달로 미루기', restEn: 'Push big purchases to next month' },
  power: { ko: '일·인정 운', en: 'career luck', restKo: '새 일보다 하던 일 마무리하기', restEn: 'Finish what you started before taking on more' },
  resource: { ko: '배움·회복 운', en: 'study & recharge luck', restKo: '잠과 컨디션부터 챙기기', restEn: 'Sleep and recharge first' },
}

export interface NyMonth { month: number; group: Group; score: number }

export interface NewYearCard {
  year: typeof NY_YEAR
  dayStem: number
  tenGod: number
  group: Group
  zodiac: number
  lacking: Element
  lucky: Element
  blessings: { id: FortuneLookId; score: number }[]
  months: NyMonth[]
  good: number[]
  rest: number
  serial: string
}

function hash(s: string) {
  let h = 2166136261
  for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) }
  return h >>> 0
}

function monthScores(s: Saju): NyMonth[] {
  const me = s.dayMaster
  const r = sajuRatios(s)
  // 신강(나·나를 돕는 기운이 많음)이면 재성·관성·식상 달이, 신약이면 인성·비겁 달이 좋다
  const strong = r.same + r.resource > 0.5
  const W: Record<Group, number> = strong
    ? { same: 0, output: 1.5, wealth: 2, power: 1.5, resource: 0 }
    : { same: 1.5, output: 0.5, wealth: 0.5, power: 0.5, resource: 2 }
  const out: NyMonth[] = []
  for (let m = 1; m <= 12; m++) {
    const p = monthPillarOf(NY_YEAR, m)
    const se = stemElement(p.stem), be = branchElement(p.branch)
    const group = groupOf(me, se)
    let score = W[group] + W[groupOf(me, be)] * 0.5
    if (se === s.lacking) score += 2
    if (be === s.lacking) score += 1.5
    score += (hash(`${s.day.stem}-${s.year.branch}-${m}`) % 100) / 1000 // 동점 깨기(같은 사람 = 같은 결과)
    out.push({ month: m, group, score })
  }
  return out
}

export function newYearCard(b: BirthInput): NewYearCard {
  const s = computeSaju(b)
  const tg = tenGodOf(s.day.stem, NY_STEM)
  const group = GROUPS[Math.floor(tg / 2)]
  const T = YEAR_TYPES[group]
  const zb = ZODIAC_LINE[s.year.branch].bonus ?? {}
  // 오복 점수: 사주 기본 점수 + 올해 유형의 복 +8 + 띠 가산 + 부족한 火 를 올해가 채우면 건강 +4
  const base = readFortunes({ saju: s, seed: JSON.stringify(['ny27', b]) })
  const blessings = BLESSINGS.map((id) => {
    let sc = base.find((f) => f.id === id)?.score ?? 70
    if (id === T.blessing) sc += 8
    sc += zb[id] ?? 0
    if (id === 'health' && s.lacking === 'fire') sc += 4
    return { id, score: Math.round(Math.max(52, Math.min(98, sc))) }
  }).sort((a, z) => z.score - a.score)
  // 올해 유형의 복은 언제나 1위(카드 제목과 순위가 어긋나지 않게)
  const mainIdx = blessings.findIndex((x) => x.id === T.blessing)
  if (mainIdx > 0) {
    const [main] = blessings.splice(mainIdx, 1)
    main.score = Math.max(main.score, blessings[0].score + 1)
    blessings.unshift({ ...main, score: Math.min(98, main.score) })
  }
  const months = monthScores(s)
  const ranked = [...months].sort((a, z) => z.score - a.score)
  const good = ranked.slice(0, 3).map((m) => m.month).sort((a, z) => a - z)
  const rest = ranked[ranked.length - 1].month
  return {
    year: NY_YEAR, dayStem: s.day.stem, tenGod: tg, group, zodiac: s.year.branch,
    lacking: s.lacking, lucky: s.lacking, blessings, months, good, rest,
    serial: String((hash(JSON.stringify(b) + 'ny27') % 9999) + 1).padStart(4, '0'),
  }
}

export const zodiacLine = (z: number, isEn: boolean) => (isEn ? ZODIAC_LINE[z].en : ZODIAC_LINE[z].ko)
/** 2027 = 丁未 와 내 띠 관계 */
export const isGoatHarmony = (z: number) => z === 6 || z === 3 || z === 11 || z === NY_BRANCH

// ── 공유 코드(?n=): 십성(0~9)·부족 오행(0~4)·띠(0~b)·좋은 달 3개(1~c) — 생년월일은 넣지 않는다 ──
export interface SharedNewYear { tenGod: number; lacking: Element; zodiac: number; good: number[] }
export function encodeNy(c: NewYearCard): string {
  return `${c.tenGod}${ELEMENTS.indexOf(c.lacking)}${c.zodiac.toString(12)}${c.good.map((m) => (m - 1).toString(12)).join('')}`
}
export function decodeNy(code: string | null): SharedNewYear | null {
  if (!code) return null
  const m = /^([0-9])([0-4])([0-9ab])([0-9ab]{3})$/.exec(code.trim())
  if (!m) return null
  return {
    tenGod: Number(m[1]), lacking: ELEMENTS[Number(m[2])], zodiac: parseInt(m[3], 12),
    good: [...m[4]].map((x) => parseInt(x, 12) + 1),
  }
}
export const groupOfTenGod = (tg: number): Group => GROUPS[Math.floor(tg / 2)]
