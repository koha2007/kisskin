// 가입 무료권(11/27부터 0장 — 가입 무료 크레딧 2개로 바뀜) 남은 수 + 크레딧 잔액 + 무료 크레딧 기한 — 생성 "전" 선택·안내용.
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
  /** 11/27 가입 무료 크레딧(30일) — 남은 수·기한. 없으면 null */
  bonus: { remaining: number; granted: number; expiresAt: string } | null
}

/** opts.balance=false — 크레딧 잔액이 필요 없는 곳(홈 무료권 띠)은 조회를 건너뛴다 (2026-11-26) */
export async function getFreeStatus(opts: { balance?: boolean } = {}): Promise<FreeStatus | null> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) return null
  try {
    const [res, balance] = await Promise.all([
      fetch('/api/free-status', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
      opts.balance === false ? Promise.resolve(0) : getCreditBalance().catch(() => 0),
    ])
    if (!res.ok) return null
    const d = (await res.json()) as Partial<FreeStatus> & { balance?: number | null }
    if (!d.makeup || !d.tool) return null
    const none = { used: 0, limit: 0, left: 0 }
    // 11/27: 서버가 무료 크레딧을 지급한 "뒤" 잰 잔액이 정본(동시에 읽은 클라 잔액은 지급 전일 수 있음)
    const bal = opts.balance === false ? 0 : typeof d.balance === 'number' ? Math.max(d.balance, balance) : balance
    return { makeup: d.makeup, lucky: d.lucky ?? none, tool: d.tool, balance: bal, bonus: d.bonus ?? null }
  } catch {
    return null
  }
}
