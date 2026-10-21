// 가입 무료권(메이크업 1장 + 무료 도구 1장) 남은 수 + 크레딧 잔액 — 생성 "전" 선택·안내용.
// 판정 권위는 서버(/api/free-status → functions/api/_freeUsage.ts). 실패 시 null(안내만 생략).
import { supabase } from './supabase'
import { getCreditBalance } from './credits'

/** 사용자가 고르는 결제수단 — 무료권/크레딧 사이 우선순위 없음 */
export type PayChoice = 'free' | 'credit'

export interface FreePoolStatus { used: number; limit: number; left: number }
export interface FreeStatus {
  makeup: FreePoolStatus
  /** 무료 도구 1장 — 뷰티 DNA 모델 또는 정밀 사주 풀이 중 택1 */
  tool: FreePoolStatus
  balance: number
}

export async function getFreeStatus(): Promise<FreeStatus | null> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) return null
  try {
    const [res, balance] = await Promise.all([
      fetch('/api/free-status', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
      getCreditBalance().catch(() => 0),
    ])
    if (!res.ok) return null
    const d = (await res.json()) as Partial<FreeStatus>
    if (!d.makeup || !d.tool) return null
    return { makeup: d.makeup, tool: d.tool, balance }
  } catch {
    return null
  }
}
