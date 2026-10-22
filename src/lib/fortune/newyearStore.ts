// 2027 오복 메이크업 5장 — 진행 상태를 이 기기(IndexedDB)에만 보관 (2026-10-22)
// ────────────────────────────────────────────────────────────────────
// 9룩 컬렉션(src/lib/makeup/collectionStore.ts)과 같은 이유: 5장은 크레딧 5개짜리라
// 충전하러 나갔다 오거나 창을 닫아도 셀카·완성본·차감 멱등 키(jobId)가 살아 있어야 한다.
// 생년월일도 여기(기기 안)에만 둔다 — 서버로 보내지 않는다.
import type { BirthInput } from './saju'
import type { FortuneLookId } from './looks'

export interface NyItem { jobId: string; image?: string }
export interface NyState {
  birth: BirthInput
  selfie?: string
  items: Partial<Record<FortuneLookId, NyItem>>
  updatedAt: number
}

const DB = 'kisskin-newyear'
const STORE = 'state'
const KEY = 'current'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE) }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE))
      req.onsuccess = () => resolve(req.result as T)
      req.onerror = () => reject(req.error)
    })
  } finally {
    db.close()
  }
}

export async function loadNy(): Promise<NyState | null> {
  try { return (await run<NyState | undefined>('readonly', (s) => s.get(KEY))) ?? null } catch { return null }
}
export async function saveNy(state: NyState): Promise<void> {
  try { await run('readwrite', (s) => s.put({ ...state, updatedAt: Date.now() }, KEY)) } catch { /* 메모리 상태로 계속 */ }
}
export async function clearNy(): Promise<void> {
  try { await run('readwrite', (s) => s.delete(KEY)) } catch { /* 없으면 그만 */ }
}
