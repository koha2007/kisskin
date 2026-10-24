// 가입 무료권(2026 메이크업 1장 + 럭키 메이크업 1장) 남은 수 + 크레딧 잔액 — 생성 "전" 선택·안내용.
// 판정 권위는 서버(/api/free-status → functions/api/_freeUsage.ts). 실패 시 null(안내만 생략).
import { supabase } from './supabase'
import { getCreditBalance } from './credits'

/** 사용자가 고르는 결제수단 — 무료권/크레딧 사이 우선순위 없음 */
export type PayChoice = 'free' | 'credit'

export interface FreePoolStatus { used: number; limit: number; left: number }
export interface FreeStatus {
  makeup: FreePoolStatus
  /** 럭키 메이크업 9가지 운 중 1장 (2026-10-24) */
  lucky: FreePoolStatus
  /** 옛 무료 도구 풀(뷰티 DNA·정밀 풀이) — 10/24부터 0장, 크레딧만 */
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
    const none = { used: 0, limit: 0, left: 0 }
    return { makeup: d.makeup, lucky: d.lucky ?? none, tool: d.tool, balance }
  } catch {
    return null
  }
}
