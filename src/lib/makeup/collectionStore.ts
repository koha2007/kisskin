// 9룩 컬렉션 — 진행 상태를 이 기기(IndexedDB)에만 보관 (2026-10-12)
// ────────────────────────────────────────────────────────────────────
// 왜 필요한가: 컬렉션은 ① 결제하러 Polar 로 나갔다 오고 ② 9장 생성에 2~3분 걸린다.
// 그 사이 페이지가 바뀌거나 창을 닫아도 같은 셀카·이미 만든 룩·차감 멱등 키(jobId)가
// 살아 있어야 이어서 만들 수 있다. sessionStorage(5MB 안팎)는 결과 9장을 담기엔 작다.
//
// ⚠ 셀카와 결과는 서버에 올리지 않는다(셀카 유출 차단 원칙). 이 기기 밖으로 나가지 않는다.
// 새 컬렉션을 시작하거나 "지우기"를 누르면 덮어쓴다. IndexedDB 가 막힌 환경(일부 인앱
// 브라우저 프라이빗 모드)에서는 저장이 실패해도 메모리 상태로 끝까지 진행된다.
import type { MakeupStyleId } from './styles'

export interface CollectionItem {
  /** 차감 멱등 키 — 같은 룩 재시도는 같은 jobId(이중 차감 없음) */
  jobId: string
  /** 완성된 결과 data URL. 없으면 아직 미완성 */
  image?: string
  /** 차감은 됐는데 생성이 실패한 상태(서버 502) — 같은 jobId 재시도는 추가 차감 없음 */
  charged?: boolean
}

export interface CollectionState {
  /** 생성 입력 셀카(원본 비율 유지로 축소한 PNG data URL) — 9룩 전부 이 한 장으로 만든다 */
  selfie: string
  items: Partial<Record<MakeupStyleId, CollectionItem>>
  createdAt: number
}

const DB = 'kisskin-collection'
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

export async function loadCollection(): Promise<CollectionState | null> {
  try { return (await run<CollectionState | undefined>('readonly', (s) => s.get(KEY))) ?? null } catch { return null }
}

export async function saveCollection(state: CollectionState): Promise<void> {
  try { await run('readwrite', (s) => s.put(state, KEY)) } catch { /* 메모리 상태로 계속 진행 */ }
}

export async function clearCollection(): Promise<void> {
  try { await run('readwrite', (s) => s.delete(KEY)) } catch { /* 없으면 그만 */ }
}
