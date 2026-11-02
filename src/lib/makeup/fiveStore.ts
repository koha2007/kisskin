// 5가지 골라 만들기 — 진행 상태를 이 기기(IndexedDB)에만 보관 (2026-11-02)
// ────────────────────────────────────────────────────────────────────
// 9룩 컬렉션(collectionStore)·럭키 9장(luckyStore)과 같은 이유: 결제하러 나갔다 오거나 창을 닫아도
// 고른 룩·셀카·완성본·차감 멱등 키(jobId)가 살아 있어야 한다. 서버로는 보내지 않는다.
export type FiveKey = 'makeup' | 'lucky'

export interface FiveItem { jobId: string; image?: string }
export interface FiveRun {
  selfie: string
  ids: string[]
  items: Record<string, FiveItem | undefined>
  /** 5장 결제를 나간 시각 — 복귀(?paid=1) 때 자동으로 이어 만들지 판단한다. 다른 결제와 섞이지 않게 한 번 쓰면 지운다 */
  armedAt?: number
}

const DB = 'kisskin-five'
const STORE = 'state'

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

export async function loadFive(key: FiveKey): Promise<FiveRun | null> {
  try { return (await run<FiveRun | undefined>('readonly', (s) => s.get(key))) ?? null } catch { return null }
}
export async function saveFive(key: FiveKey, state: FiveRun): Promise<void> {
  try { await run('readwrite', (s) => s.put(state, key)) } catch { /* 메모리 상태로 계속 */ }
}
export async function clearFive(key: FiveKey): Promise<void> {
  try { await run('readwrite', (s) => s.delete(key)) } catch { /* 없으면 그만 */ }
}
/** 다른 결제(1장 화면의 충전 등)로 나갈 때 — 그 복귀가 예전 5장 작업을 자동 시작하지 않게 한다 */
export async function disarmFive(key: FiveKey): Promise<void> {
  const cur = await loadFive(key)
  if (cur?.armedAt) await saveFive(key, { ...cur, armedAt: undefined })
}
