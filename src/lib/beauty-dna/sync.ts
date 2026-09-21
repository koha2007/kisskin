// 내 뷰티 기록 — localStorage ↔ Supabase 동기화 (SUBSCRIBER_GROWTH_PLAN P1).
//
// 무료 도구는 무로그인 원칙이라 결과는 늘 localStorage 에 먼저 쓰인다(types.ts).
// 로그인한 사람에 한해 그 값을 계정에도 얹어, 기기를 바꿔도 기록이 따라오게 한다.
//
// 병합 규칙 — **어느 쪽도 지우지 않는다.**
//   1) 한쪽에만 있는 항목은 그대로 합친다(합집합).
//   2) 양쪽에 있는데 다르면 `updatedAt` 이 최신인 쪽을 쓴다.
//   서버를 그냥 덮어쓰면 "폰에서 4개 다 했는데 오래된 노트북을 열었더니
//   기록이 사라졌다"가 된다. 그 사고를 막는 게 이 규칙의 전부다.
//
// 흐름: 로그인 → pull+merge → (localStorage 가 바뀌면) push. 로그아웃 시 구독 해제.
// 로컬 데이터는 로그아웃해도 지우지 않는다 — 무로그인 사용자와 같은 상태로 돌아갈 뿐이다.

import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { trackDnaSaved } from '../analytics'
import {
  readDna,
  DNA_EVENT,
  DNA_FIELDS,
  DNA_STORAGE_KEY,
  type BeautyDna,
  type DnaField,
} from './types'

/** DB 컬럼명 ↔ BeautyDna 필드명. DB 는 snake_case, 프런트는 camelCase. */
const COLUMN: Record<DnaField, string> = {
  personalColor: 'personal_color',
  faceShape: 'face_shape',
  perfume: 'perfume',
  mbti: 'mbti',
}

interface ProfileRow {
  personal_color: string | null
  face_shape: string | null
  perfume: string | null
  mbti: string | null
  dna_updated_at: string | null
}

function rowToDna(row: ProfileRow): BeautyDna {
  const out: Record<string, string> = {}
  for (const f of DNA_FIELDS) {
    const v = row[COLUMN[f] as keyof ProfileRow]
    if (typeof v === 'string' && v) out[f] = v
  }
  if (row.dna_updated_at) out.updatedAt = row.dna_updated_at
  // sanitize 는 readDna 쪽에만 있으므로, 여기서 들어온 값은 저장 시 한 번 더 걸러진다.
  return out as BeautyDna
}

function ts(d: BeautyDna): number {
  const t = d.updatedAt ? Date.parse(d.updatedAt) : NaN
  return Number.isFinite(t) ? t : 0
}

/** 합집합 + 충돌 시 최신 우선. 반환값이 local 과 같으면 쓸 필요가 없다. */
export function mergeDna(local: BeautyDna, remote: BeautyDna): BeautyDna {
  const localWins = ts(local) >= ts(remote)
  const out: BeautyDna = {}
  for (const f of DNA_FIELDS) {
    const a = local[f]
    const b = remote[f]
    // 한쪽만 있으면 그걸 쓴다. 둘 다 있고 다르면 최신 쪽.
    const picked = a && b ? (a === b ? a : localWins ? a : b) : a || b
    if (picked) (out as Record<string, string>)[f] = picked
  }
  const newest = Math.max(ts(local), ts(remote))
  if (newest > 0) out.updatedAt = new Date(newest).toISOString()
  return out
}

function sameDna(a: BeautyDna, b: BeautyDna): boolean {
  return DNA_FIELDS.every((f) => a[f] === b[f])
}

/** localStorage 에 직접 쓴다 — writeDnaField 는 한 필드씩이라 병합 결과엔 안 맞는다. */
function persistLocal(next: BeautyDna): void {
  try {
    window.localStorage.setItem(DNA_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(DNA_EVENT))
  } catch {
    /* quota / private mode — 서버엔 이미 올라갔으니 다음 방문에 다시 맞춰진다 */
  }
}

async function pull(userId: string): Promise<BeautyDna | null> {
  const { data, error } = await supabase
    .from('beauty_profile')
    .select('personal_color, face_shape, perfume, mbti, dna_updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return rowToDna(data as ProfileRow)
}

async function push(userId: string, dna: BeautyDna): Promise<void> {
  const row: Record<string, unknown> = { user_id: userId, updated_at: new Date().toISOString() }
  for (const f of DNA_FIELDS) row[COLUMN[f]] = dna[f] ?? null
  row.dna_updated_at = dna.updatedAt ?? null
  await supabase.from('beauty_profile').upsert(row, { onConflict: 'user_id' })
}

// useAuth 는 화면 여러 곳에서 동시에 쓰인다(홈·네비·마이페이지·하단탭…).
// 훅 인스턴스마다 동기화를 걸면 같은 사람에 대해 pull/push 가 5중으로 돈다.
// → 유저당 하나만 돌리고 참조 수만 센다. 마지막 구독자가 떠날 때 진짜로 멈춘다.
let active: { userId: string; refs: number; stop: () => void } | null = null

/**
 * 로그인한 사용자의 기록을 맞추고, 이후 변경을 계속 올린다.
 * 반환값은 구독 해제 함수 — 로그아웃/언마운트 시 호출한다(여러 번 불러도 안전).
 */
export function startDnaSync(user: User): () => void {
  if (active && active.userId === user.id) {
    active.refs++
  } else {
    active?.stop()
    active = { userId: user.id, refs: 1, stop: runSync(user) }
  }
  const mine = active
  let released = false
  return () => {
    if (released) return
    released = true
    mine.refs--
    if (mine.refs <= 0 && active === mine) {
      mine.stop()
      active = null
    }
  }
}

function runSync(user: User): () => void {
  let stopped = false
  let timer: ReturnType<typeof setTimeout> | undefined
  // 방금 우리가 쓴 값으로 DNA_EVENT 가 울릴 때 되-올리지 않기 위한 표식.
  let lastPushed = ''

  const pushNow = () => {
    const dna = readDna()
    const key = JSON.stringify(dna)
    if (stopped || key === lastPushed) return
    lastPushed = key
    void push(user.id, dna)
  }

  // 진단을 연속으로 끝내면 이벤트가 여러 번 울린다 → 마지막 것만 올린다.
  const onChange = () => {
    if (stopped) return
    clearTimeout(timer)
    timer = setTimeout(pushNow, 800)
  }

  void (async () => {
    const remote = await pull(user.id)
    if (stopped) return
    const local = readDna()
    const merged = mergeDna(local, remote ?? {})

    // 화면에 없던 기록이 서버에 있었다면 지금 채워 넣는다.
    if (!sameDna(merged, local)) persistLocal(merged)

    // 서버가 비어 있거나(첫 로그인) 로컬에만 있는 항목이 있으면 올린다.
    const hasAny = DNA_FIELDS.some((f) => merged[f])
    if (hasAny && (!remote || !sameDna(merged, remote))) {
      lastPushed = JSON.stringify(merged)
      await push(user.id, merged)
      // 서버에 없던 결과가 올라간 순간 = 저장이 실제로 일어난 순간.
      if (!remote) trackDnaSaved(DNA_FIELDS.filter((f) => merged[f]).length)
    } else {
      lastPushed = JSON.stringify(merged)
    }

    window.addEventListener(DNA_EVENT, onChange)
    window.addEventListener('storage', onChange) // 다른 탭에서 진단 완료
  })()

  return () => {
    stopped = true
    clearTimeout(timer)
    window.removeEventListener(DNA_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}
