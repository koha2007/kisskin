// 관상·사주 메이크업 — 이 기기 저장(결과·도감) + 친구 공유 코드 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 개인정보: 생년월일·측정값·결과는 **이 기기(localStorage)에만** 둔다. 서버로 보내지 않는다.
//   셀카는 여기 저장하지 않는다(용량·민감도) — 로그인 왕복 때만 pendingSelfie(sessionStorage)가 잠깐 맡는다.
// 공유 코드(?c=)에는 얼굴·생년월일이 들어가지 않는다: 동물상·운 TOP3 점수·부족 오행·일간만.
import type { AnimalId } from './face'
import { ANIMAL_IDS } from './face'
import type { BirthInput, Element } from './saju'
import { ELEMENTS } from './saju'
import type { FortuneLookId } from './looks'
import type { FortuneScore } from './reading'
import type { MetricKey } from './face'

export interface FortuneResult {
  v: 1
  createdAt: number
  birth?: BirthInput
  z?: Record<MetricKey, number>
  axes?: { x: number; y: number }
  animals?: { id: AnimalId; pct: number }[]
  scores: FortuneScore[]
  /** 사주 요약 — 생년월일 있을 때 */
  dayStem?: number
  lacking?: Element
  counts?: Record<Element, number>
  /** 카드 일련번호(같은 결과면 같은 번호) */
  serial: string
}

const KEY_LAST = 'fortune:last'
const KEY_DEX = 'fortune:dex'
const KEY_SECRET = 'fortune:secret'

function read<T>(k: string): T | null {
  try { return JSON.parse(localStorage.getItem(k) || 'null') as T | null } catch { return null }
}
function write(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* 저장 불가 환경(시크릿 탭 등) — 화면은 그대로 동작 */ }
}

export const saveLast = (r: FortuneResult) => write(KEY_LAST, r)
export const loadLast = (): FortuneResult | null => {
  const r = read<FortuneResult>(KEY_LAST)
  return r && r.v === 1 ? r : null
}
export const clearFortuneData = () => {
  try { [KEY_LAST, KEY_DEX, KEY_SECRET].forEach((k) => localStorage.removeItem(k)) } catch { /* noop */ }
}

// ── 관상 도감(모은 동물상) ──
export interface DexEntry { id: AnimalId; from: 'me' | 'friend'; at: number }
export const loadDex = (): DexEntry[] => (read<DexEntry[]>(KEY_DEX) ?? []).filter((e) => ANIMAL_IDS.includes(e.id))
export function addToDex(id: AnimalId, from: DexEntry['from']): { dex: DexEntry[]; added: boolean; secretUnlocked: boolean } {
  const dex = loadDex()
  const added = !dex.some((e) => e.id === id)
  const next = added ? [...dex, { id, from, at: Date.now() }] : dex
  if (added) write(KEY_DEX, next)
  const complete = ANIMAL_IDS.every((a) => next.some((e) => e.id === a))
  const secretUnlocked = complete && !hasSecret()
  if (secretUnlocked) write(KEY_SECRET, { at: Date.now(), via: 'dex' })
  return { dex: next, added, secretUnlocked }
}
export const hasSecret = () => !!read<{ at: number }>(KEY_SECRET)

// ── 공유 코드: 동물(0~8)·TOP3 운(0~8)·점수·부족 오행(0~4, 없으면 5)·일간(0~9, 없으면 a) ──
const LOOK_ORDER: FortuneLookId[] = ['wealth', 'love', 'marriage', 'reunion', 'career', 'exam', 'health', 'popularity', 'travel']

export interface SharedCard {
  animal?: AnimalId
  animalPct?: number
  top: { id: FortuneLookId; score: number }[]
  lacking?: Element
  dayStem?: number
}

export function encodeShare(r: FortuneResult): string {
  const a = r.animals?.[0]
  const parts = [
    a ? String(ANIMAL_IDS.indexOf(a.id)) + String(Math.min(99, a.pct)).padStart(2, '0') : 'x00',
    r.scores.slice(0, 3).map((s) => String(LOOK_ORDER.indexOf(s.id)) + String(s.score).padStart(2, '0')).join(''),
    r.lacking ? String(ELEMENTS.indexOf(r.lacking)) : '5',
    r.dayStem != null ? String(r.dayStem) : 'a',
  ]
  return parts.join('-')
}

export function decodeShare(code: string | null): SharedCard | null {
  if (!code) return null
  const m = /^([0-8x])(\d{2})-((?:[0-8]\d{2}){1,3})-([0-5])-([0-9a])$/.exec(code.trim())
  if (!m) return null
  const top: SharedCard['top'] = []
  for (let i = 0; i < m[3].length; i += 3) {
    const id = LOOK_ORDER[Number(m[3][i])]
    const score = Number(m[3].slice(i + 1, i + 3))
    if (id && score >= 40 && score <= 99) top.push({ id, score })
  }
  return {
    animal: m[1] === 'x' ? undefined : ANIMAL_IDS[Number(m[1])],
    animalPct: m[1] === 'x' ? undefined : Number(m[2]),
    top,
    lacking: m[4] === '5' ? undefined : ELEMENTS[Number(m[4])],
    dayStem: m[5] === 'a' ? undefined : Number(m[5]),
  }
}

/** 같은 입력이면 같은 카드 번호(0001~9999) */
export function serialOf(seed: string): string {
  let h = 2166136261
  for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) }
  return String(((h >>> 0) % 9999) + 1).padStart(4, '0')
}
