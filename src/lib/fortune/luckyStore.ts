// 럭키 메이크업 9장 — 진행 상태를 이 기기(IndexedDB)에만 보관 (2026-10-22)
// ────────────────────────────────────────────────────────────────────
// 신년 오복(newyearStore)·9룩 컬렉션(collectionStore)과 같은 이유: 9장은 $4.99 결제를 나갔다 오거나
// 창을 닫아도 셀카·완성본·차감 멱등 키(jobId)가 살아 있어야 한다. 서버로는 보내지 않는다.
import type { Element } from './saju'
import type { FortuneLookId } from './looks'

export interface LuckyItem { jobId: string; image?: string }
export interface LuckyState {
  selfie: string
  lacking?: Element
  items: Partial<Record<FortuneLookId, LuckyItem>>
  updatedAt: number
}

const DB = 'kisskin-lucky'
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

export async function loadLucky(): Promise<LuckyState | null> {
  try { return (await run<LuckyState | undefined>('readonly', (s) => s.get(KEY))) ?? null } catch { return null }
}
export async function saveLucky(state: LuckyState): Promise<void> {
  try { await run('readwrite', (s) => s.put({ ...state, updatedAt: Date.now() }, KEY)) } catch { /* 메모리 상태로 계속 */ }
}
export async function clearLucky(): Promise<void> {
  try { await run('readwrite', (s) => s.delete(KEY)) } catch { /* 없으면 그만 */ }
}
