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

// ── 결제 복귀 영수증(2026-11-09) ─────────────────────────────────────
// 예전엔 복귀 화면이 "잔액 > 0" 이면 결제 완료로 보고 잔액 전체를 "들어온 개수"처럼 보여 줬다.
//   → 남은 크레딧이 있던 사람은 웹훅이 오기도 전에 "완료"가 뜨고, 개수도 틀렸다.
// 이제 장부(credit_transactions)에서 "방금 들어온 충전 한 건"을 찾아 그 개수를 보여 준다.

const SEEN_KEY = 'kisskin_seen_charges'
const isReferral = (ref: string | null) => !!ref && ref.startsWith('referral:')

export interface ChargeReceipt {
  /** 결제로 들어온 크레딧 수(팩) */
  added: number
  /** 같은 결제로 함께 들어온 친구 초대 보너스 */
  bonus: number
  /** 지금 잔액 */
  balance: number
}

function seenCharges(): number[] {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') as number[] } catch { return [] }
}

/**
 * 결제 복귀 직후 호출 — 웹훅 충전이 장부에 찍힐 때까지 잠깐 기다린다.
 * 최근 15분 안의 충전 중 아직 보여 주지 않은 결제 1건을 찾는다(새로고침해도 같은 건을 두 번 "새로 충전"으로 세지 않게).
 * 못 찾으면 null(= 늦어지는 중).
 */
export async function waitForCharge(opts: { tries?: number; intervalMs?: number; isCancelled?: () => boolean } = {}): Promise<ChargeReceipt | null> {
  const tries = opts.tries ?? 15
  const since = Date.now() - 15 * 60 * 1000
  const seen = seenCharges()
  for (let i = 0; i < tries; i++) {
    if (opts.isCancelled?.()) return null
    const rows = await getCreditHistory(10)
    const fresh = rows.filter((r) => r.type === 'charge' && Date.parse(r.created_at) >= since && !seen.includes(r.id))
    const paid = fresh.find((r) => !isReferral(r.ref))
    if (paid) {
      const bonus = fresh.filter((r) => isReferral(r.ref)).reduce((s, r) => s + r.amount, 0)
      try { localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, ...fresh.map((r) => r.id)].slice(-30))) } catch { /* 없으면 그만 */ }
      const balance = await getCreditBalance().catch(() => paid.balance_after)
      return { added: paid.amount, bonus, balance }
    }
    await new Promise((r) => setTimeout(r, opts.intervalMs ?? 2000))
  }
  return null
}

/** 장부 한 줄 → 사람이 읽는 이름. 차감 ref 는 작업 id(UUID)라 어떤 룩인지는 알 수 없다 → "AI 메이크업 1장". */
export function creditTxLabel(tx: CreditTransaction, isKo: boolean): string {
  const ref = tx.ref || ''
  if (tx.type === 'charge') {
    if (isReferral(ref)) return isKo ? '친구 초대 보너스' : 'Friend invite bonus'
    return isKo ? `크레딧 충전 (${tx.amount}개)` : `Top-up (${tx.amount} credits)`
  }
  if (ref.startsWith('refund:')) return isKo ? '환불로 회수' : 'Refunded purchase'
  if (ref.startsWith('reading:')) return isKo ? '정밀 풀이' : 'In-depth reading'
  return isKo ? 'AI 메이크업 생성' : 'AI makeup look'
}
