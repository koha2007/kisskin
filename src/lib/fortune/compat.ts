// 궁합 — 두 사람의 관상·사주 → 궁합 점수·유형·커플 룩 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 무료: 점수·유형·문장(기기 안 계산). 유료(2크레딧): 커플 관상 메이크업 2장(/api/makeup-edit × 2).
// 근거:
//   사주 — 두 일간 오행의 생극(상생=서로 키움, 비화=같은 기운, 상극=끌림·자극) + 상대가 내 부족 오행을 채우는지(보완)
//   관상 — 눈매 축(X)이 다를수록 끌림, 이목구비 축(Y)이 비슷할수록 편안함
// ⚠ 재미용. "안 맞는다·헤어진다" 같은 말 금지 — 모든 궁합은 "이런 매력이 있는 궁합"으로.
import { generates, controls, stemElement, type Element } from './saju'
import type { FortuneResult } from './state'
import type { FortuneLookId } from './looks'

export type CompatType = 'mutual' | 'friends' | 'spark' | 'complement'

export interface Compat {
  score: number
  type: CompatType
  look: FortuneLookId
  reasonsKo: string[]
  reasonsEn: string[]
}

export const COMPAT_TEXT: Record<CompatType, { ko: string; en: string; descKo: string; descEn: string; emoji: string }> = {
  mutual: { emoji: '🌱', ko: '서로를 키워 주는 상생 궁합', en: 'A mutual-growth match',
    descKo: '한 사람이 다른 사람의 기운을 북돋아 주는 사이. 함께 있을수록 둘 다 잘 풀려요.', descEn: 'One lifts the other’s energy — you both do better together.' },
  friends: { emoji: '🤝', ko: '친구 같은 편안한 궁합', en: 'A best-friends match',
    descKo: '같은 결의 기운이라 말하지 않아도 통해요. 오래 볼수록 편한 사이.', descEn: 'Same wavelength — you get each other without words.' },
  spark: { emoji: '⚡', ko: '끌림이 강한 밀당 궁합', en: 'A magnetic, push-and-pull match',
    descKo: '서로 다른 기운이 부딪히며 강하게 끌려요. 설렘이 오래가는 사이.', descEn: 'Different energies collide and attract — the spark lasts.' },
  complement: { emoji: '🧩', ko: '빈 곳을 채우는 보완 궁합', en: 'A perfect-fit match',
    descKo: '서로에게 부족한 기운을 채워 줘요. 둘이 함께일 때 완성되는 사이.', descEn: 'You fill in each other’s missing element — complete together.' },
}
const LOOK_FOR: Record<CompatType, FortuneLookId> = { mutual: 'love', friends: 'popularity', spark: 'reunion', complement: 'marriage' }

function hash(s: string) {
  let h = 2166136261
  for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) }
  return h >>> 0
}

export function compatOf(a: FortuneResult, b: FortuneResult): Compat {
  const pts: Record<CompatType, number> = { mutual: 0, friends: 0, spark: 0, complement: 0 }
  const rk: string[] = [], re: string[] = []
  const ea = a.dayStem != null ? stemElement(a.dayStem) : undefined
  const eb = b.dayStem != null ? stemElement(b.dayStem) : undefined
  const KO: Record<Element, string> = { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' }
  if (ea && eb) {
    if (generates(ea) === eb || generates(eb) === ea) { pts.mutual += 14; rk.push(`일간 ${KO[ea]}·${KO[eb]} — 서로를 생(生)하는 상생`); re.push('Your Day Masters feed each other') }
    else if (ea === eb) { pts.friends += 12; rk.push(`일간이 둘 다 ${KO[ea]} — 같은 기운`); re.push('Same Day Master element') }
    else if (controls(ea) === eb || controls(eb) === ea) { pts.spark += 13; rk.push(`일간 ${KO[ea]}·${KO[eb]} — 부딪히며 끌리는 상극`); re.push('Your Day Masters spark off each other') }
  }
  if (a.lacking && b.counts && b.counts[a.lacking] >= 2) { pts.complement += 9; rk.push(`상대가 내게 부족한 ${KO[a.lacking]}의 기운을 채워 줘요`); re.push('They carry the element you lack') }
  if (b.lacking && a.counts && a.counts[b.lacking] >= 2) { pts.complement += 9; rk.push(`내가 상대에게 부족한 ${KO[b.lacking]}의 기운을 채워 줘요`); re.push('You carry the element they lack') }
  if (a.axes && b.axes) {
    const dx = Math.abs(a.axes.x - b.axes.x), dy = Math.abs(a.axes.y - b.axes.y)
    if (dx > 0.6) { pts.spark += 8; rk.push('눈매가 서로 달라 첫눈에 끌리는 관상'); re.push('Contrasting eyes — instant attraction') }
    if (dy < 0.8) { pts.friends += 6; pts.mutual += 3; rk.push('이목구비 결이 비슷해 편안한 관상'); re.push('Similar features — easy comfort') }
  }
  const type = (Object.keys(pts) as CompatType[]).sort((x, y) => pts[y] - pts[x])[0]
  const total = Object.values(pts).reduce((x, y) => x + y, 0)
  const seed = a.serial + ':' + b.serial
  // 2,000쌍 실측: 66+total 이면 중앙값 94·최저 78 → 다 90점대라 의미가 없었다. 중앙값 80 안팎으로.
  const score = Math.max(62, Math.min(97, 60 + Math.round(total * 0.8) + (hash(seed) % 7)))
  if (!rk.length) { rk.push('두 사람의 기운이 고르게 어울려요'); re.push('Your energies blend evenly') }
  return { score, type: total ? type : 'friends', look: LOOK_FOR[total ? type : 'friends'], reasonsKo: rk, reasonsEn: re }
}

// 궁합 메이크업 횟수(시크릿 배지 조건: 3회) — 이 기기
const KEY = 'fortune:compatCount'
export function bumpCompatCount(): number {
  try { const n = (Number(localStorage.getItem(KEY)) || 0) + 1; localStorage.setItem(KEY, String(n)); return n } catch { return 0 }
}
