// ════════════════════════════════════════════════════════════════════
// 크레딧 — 클라이언트 READ 전용 (FREE_PIVOT_PLAN P1-5 · 2단계)
// ────────────────────────────────────────────────────────────────────
// 여기서는 "읽기"만 한다. 충전(+)·차감(-)은 서버(service role)만 →
//   functions/api/_credits.ts. 클라이언트에서 잔액 쓰기는 RLS 로 막혀 있다
//   (정책 미부여 = 누구나 무한충전 차단).
//
// RLS: 유저는 자기 잔액/이력만 SELECT 가능. 미로그인 → 0 / 빈 배열.
// SQL 스키마: supabase/migrations/0001_user_credits.sql
// ════════════════════════════════════════════════════════════════════
import { supabase } from './supabase'

export type CreditTxType = 'charge' | 'deduct'

export interface CreditTransaction {
  id: number
  type: CreditTxType
  amount: number
  balance_after: number
  ref: string | null
  created_at: string
}

/**
 * 로그인 유저의 현재 크레딧 잔액.
 * 미로그인·행 없음·오류 → 0 (fail-safe: 잔액을 부풀리지 않음).
 */
export async function getCreditBalance(): Promise<number> {
  const { data, error } = await supabase.rpc('get_credit_balance')
  if (error) {
    console.warn('[credits] balance fetch failed:', error.message)
    return 0
  }
  return typeof data === 'number' ? data : 0
}

/**
 * 로그인 유저의 크레딧 거래 이력(최신순). RLS 로 본인 것만 반환.
 * 오류 → 빈 배열.
 */
export async function getCreditHistory(limit = 50): Promise<CreditTransaction[]> {
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('id, type, amount, balance_after, ref, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.warn('[credits] history fetch failed:', error.message)
    return []
  }
  return (data ?? []) as CreditTransaction[]
}
