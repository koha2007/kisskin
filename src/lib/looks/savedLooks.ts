// 저장한 룩 방법 — 회원 user_metadata.saved_looks 에 id 배열로 둔다.
// 왜 테이블이 아니라 메타데이터인가(2026-10-02): 9개 중 몇 개를 고르는 작은 목록이라
// 새 테이블·GRANT·마이그레이션(운영자 SQL)이 필요 없다. 기기를 넘어 따라오는 건 같다.
import { useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../../hooks/useAuth'
import { MAKEUP_STYLES, type MakeupStyleId } from '../makeup/styles'

const VALID = new Set<string>(MAKEUP_STYLES.map((s) => s.id))

function readSaved(meta: Record<string, unknown> | undefined): MakeupStyleId[] {
  const raw = meta?.saved_looks
  return Array.isArray(raw) ? (raw.filter((v) => typeof v === 'string' && VALID.has(v)) as MakeupStyleId[]) : []
}

export function useSavedLooks() {
  const { user } = useAuth()
  // 서버(user_metadata) 값이 기본, 방금 누른 결과는 덮어쓰기로 즉시 반영한다(effect 로 복사하지 않는다).
  const [override, setOverride] = useState<{ uid: string; list: MakeupStyleId[] } | null>(null)
  const [busy, setBusy] = useState(false)
  const saved = override && user && override.uid === user.id ? override.list : readSaved(user?.user_metadata)

  /** 저장/해제를 뒤집고, 뒤집은 뒤 저장 상태를 돌려준다. */
  const toggle = async (id: MakeupStyleId): Promise<boolean> => {
    if (!user) return false
    const nextList = saved.includes(id) ? saved.filter((v) => v !== id) : [...saved, id]
    setBusy(true)
    setOverride({ uid: user.id, list: nextList })
    const { error } = await supabase.auth.updateUser({ data: { saved_looks: nextList } })
    setBusy(false)
    if (error) {
      setOverride({ uid: user.id, list: saved })
      return saved.includes(id)
    }
    return nextList.includes(id)
  }

  return { saved, toggle, busy }
}
