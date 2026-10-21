// 사주(四柱) 간이 계산 — 관상·사주 메이크업 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 양력 생년월일(+선택: 태어난 시) → 연·월·일(·시) 기둥 → 오행 분포.
// 전부 기기 안에서 계산한다(서버 전송·저장 없음, 비용 0).
//
// ⚠ 정직하게(화면 고지와 같은 내용):
//   • 월 경계(절기)는 해마다 하루 정도 움직이는데 여기선 평균 날짜 표를 쓴다 →
//     절기 당일·전날 태어난 사람은 월주가 한 칸 다를 수 있다.
//   • 연 경계 = 입춘(2/4 무렵). 1/1 이 아니다.
//   • 음력 입력·야자시·진태양시 보정은 하지 않는다(1차 범위 밖).
// 기준점: 2000-01-01 = 戊午일(육십갑자 54), 1984 = 甲子년.

export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water'
export const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water']

export const STEMS_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
export const STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
export const BRANCHES_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']
export const BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
export const BRANCH_ANIMAL_KO = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지']
export const BRANCH_ANIMAL_EN = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']

/** 천간 오행: 갑을=목, 병정=화, 무기=토, 경신=금, 임계=수 */
const STEM_ELEMENT: Element[] = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water']
/** 지지 오행(본기): 자=수 축=토 인=목 묘=목 진=토 사=화 오=화 미=토 신=금 유=금 술=토 해=수 */
const BRANCH_ELEMENT: Element[] = ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water']

export interface Pillar {
  stem: number   // 0~9
  branch: number // 0~11
}

export const pillarIndex = (p: Pillar): number => {
  for (let i = 0; i < 60; i++) if (i % 10 === p.stem && i % 12 === p.branch) return i
  return 0
}
const fromIndex = (i: number): Pillar => {
  const n = ((i % 60) + 60) % 60
  return { stem: n % 10, branch: n % 12 }
}
export const pillarKo = (p: Pillar) => STEMS_KO[p.stem] + BRANCHES_KO[p.branch]
export const pillarHanja = (p: Pillar) => STEMS_HANJA[p.stem] + BRANCHES_HANJA[p.branch]

/**
 * 절기(월 경계) 평균 날짜 — [월(1~12), 일, 이 날부터 시작하는 월지].
 * 소한(1/6)=축, 입춘(2/4)=인, 경칩(3/6)=묘, 청명(4/5)=진, 입하(5/6)=사, 망종(6/6)=오,
 * 소서(7/7)=미, 입추(8/8)=신, 백로(9/8)=유, 한로(10/8)=술, 입동(11/7)=해, 대설(12/7)=자
 */
const TERMS: Array<[number, number, number]> = [
  [1, 6, 1], [2, 4, 2], [3, 6, 3], [4, 5, 4], [5, 6, 5], [6, 6, 6],
  [7, 7, 7], [8, 8, 8], [9, 8, 9], [10, 8, 10], [11, 7, 11], [12, 7, 0],
]

const DAY_MS = 86_400_000
const daysFrom2000 = (y: number, m: number, d: number) =>
  Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2000, 0, 1)) / DAY_MS)

export interface BirthInput {
  year: number
  month: number // 1~12
  day: number
  /** 0~23. 모르면 생략 → 시주 없이 세 기둥 */
  hour?: number
}

export interface Saju {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar | null
  /** 일간(나 자신) 오행 */
  dayMaster: Element
  /** 기둥별 천간·지지 오행 개수(시주 있으면 8글자, 없으면 6글자) */
  counts: Record<Element, number>
  /** 가장 적은 오행(보완할 기운) — 동점이면 일간을 생(生)하는 쪽 우선 */
  lacking: Element
  /** 가장 많은 오행 */
  strongest: Element
  /** 띠(연지) */
  zodiac: number
}

export function isValidBirth(b: BirthInput): boolean {
  if (!Number.isInteger(b.year) || b.year < 1900 || b.year > 2100) return false
  if (!Number.isInteger(b.month) || b.month < 1 || b.month > 12) return false
  const dim = new Date(Date.UTC(b.year, b.month, 0)).getUTCDate()
  if (!Number.isInteger(b.day) || b.day < 1 || b.day > dim) return false
  if (b.hour != null && (!Number.isInteger(b.hour) || b.hour < 0 || b.hour > 23)) return false
  return true
}

/** 해당 날짜의 월지(절기 기준) */
function monthBranch(m: number, d: number): number {
  let branch = 0 // 1/1~소한 전 = 자월(전년 대설부터)
  for (const [tm, td, br] of TERMS) {
    if (m > tm || (m === tm && d >= td)) branch = br
  }
  return branch
}

/** 생(生) 관계: 목→화→토→금→수→목. 나를 생하는 오행 */
export const generatedBy = (e: Element): Element => ELEMENTS[(ELEMENTS.indexOf(e) + 4) % 5]
/** 내가 생하는 오행 */
export const generates = (e: Element): Element => ELEMENTS[(ELEMENTS.indexOf(e) + 1) % 5]
/** 내가 극(剋)하는 오행: 목→토, 토→수, 수→화, 화→금, 금→목 */
export const controls = (e: Element): Element => ELEMENTS[(ELEMENTS.indexOf(e) + 2) % 5]

export function computeSaju(b: BirthInput): Saju {
  // 연주: 입춘 전이면 전년
  const beforeIpchun = b.month < 2 || (b.month === 2 && b.day < 4)
  const sajuYear = beforeIpchun ? b.year - 1 : b.year
  const year = fromIndex(sajuYear - 1984)

  // 월주: 월지는 절기, 월간은 연간에서(갑기→병인, 을경→무인, 병신→경인, 정임→임인, 무계→갑인)
  const mb = monthBranch(b.month, b.day)
  const inStem = ((year.stem % 5) * 2 + 2) % 10 // 인월의 천간
  const offset = (mb - 2 + 12) % 12             // 인월부터 몇 번째 달
  const month: Pillar = { stem: (inStem + offset) % 10, branch: mb }

  // 일주: 2000-01-01 = 戊午(54). 23시 이후 출생은 다음 날 일주(조자시 기준)
  let dayShift = 0
  if (b.hour != null && b.hour >= 23) dayShift = 1
  const day = fromIndex(54 + daysFrom2000(b.year, b.month, b.day) + dayShift)

  // 시주: 자시 23~01, 축시 01~03 … 시간(時干)은 일간에서(갑기→갑자 …)
  let hour: Pillar | null = null
  if (b.hour != null) {
    const hb = Math.floor(((b.hour + 1) % 24) / 2)
    hour = { stem: ((day.stem % 5) * 2 + hb) % 10, branch: hb }
  }

  const counts: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  for (const p of [year, month, day, ...(hour ? [hour] : [])]) {
    counts[STEM_ELEMENT[p.stem]]++
    counts[BRANCH_ELEMENT[p.branch]]++
  }
  const dayMaster = STEM_ELEMENT[day.stem]
  const min = Math.min(...ELEMENTS.map((e) => counts[e]))
  const lackingAll = ELEMENTS.filter((e) => counts[e] === min)
  const lacking = lackingAll.includes(generatedBy(dayMaster)) ? generatedBy(dayMaster) : lackingAll[0]
  const max = Math.max(...ELEMENTS.map((e) => counts[e]))
  const strongest = ELEMENTS.find((e) => counts[e] === max)!

  return { year, month, day, hour, dayMaster, counts, lacking, strongest, zodiac: year.branch }
}

export const stemElement = (stem: number): Element => STEM_ELEMENT[stem]
export const branchElement = (branch: number): Element => BRANCH_ELEMENT[branch]

/** 특정 양력 연·월(15일 기준)의 월주 — 신년 12달 운 메이크업용 */
export function monthPillarOf(year: number, month: number): Pillar {
  return computeSaju({ year, month, day: 15 }).month
}
