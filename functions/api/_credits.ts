// ════════════════════════════════════════════════════════════════════
// 크레딧 — 서버 WRITE 헬퍼 (service role 전용) · FREE_PIVOT_PLAN P1-5 · 2단계
// ────────────────────────────────────────────────────────────────────
// 충전(+)·차감(-)은 반드시 여기로만. 클라이언트는 읽기만(src/lib/credits.ts).
// 잔액 변경은 Supabase RPC(charge_credits / deduct_credits)에 위임 →
//   "읽고-계산-쓰기" 경합(이중충전·이중차감)을 DB 안에서 원자적으로 차단.
//
// ⚠ 2단계 범위 = 구조 제공까지. 실제 호출 연결은 3단계:
//     • chargeCredits → polar-webhook.ts (order.created, 로그인 유저 user_id)
//     • deductCredits → makeup-edit.ts   (OpenAI 호출 직전, 성공 시에만 차감)
//   이 파일을 import 해서 호출하는 코드는 아직 없다(의도적).
//
// SQL 스키마: supabase/migrations/0001_user_credits.sql
// ════════════════════════════════════════════════════════════════════

export interface CreditsEnv {
  SUPABASE_SERVICE_ROLE_KEY?: string
  VITE_SUPABASE_URL?: string
}

/** service role 키 + URL 둘 다 있어야 크레딧 동작 가능. 없으면 fail-safe. */
export function creditsConfigured(env: CreditsEnv): boolean {
  return !!(env.SUPABASE_SERVICE_ROLE_KEY && env.VITE_SUPABASE_URL)
}

/** 설정 누락 시 throw → 호출부(deduct)는 catch 해서 fail-safe(차감 실패) 처리. */
function requireConfig(env: CreditsEnv): { url: string; key: string } {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('credits not configured (missing SUPABASE url/service key)')
  }
  return { url: env.VITE_SUPABASE_URL, key: env.SUPABASE_SERVICE_ROLE_KEY }
}

async function callRpc<T>(env: CreditsEnv, fn: string, params: Record<string, unknown>): Promise<T> {
  const { url, key } = requireConfig(env)
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`rpc ${fn} failed: ${res.status} ${text.slice(0, 200)}`)
  }
  return (text ? JSON.parse(text) : null) as T
}

/**
 * 잔액 조회(서버). service role → RLS 우회, user_credits 직접 조회.
 * 행 없음 → 0.
 */
export async function getBalance(env: CreditsEnv, userId: string): Promise<number> {
  const { url, key } = requireConfig(env)
  const res = await fetch(
    `${url}/rest/v1/user_credits?user_id=eq.${encodeURIComponent(userId)}&select=balance`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  )
  if (!res.ok) return 0
  const rows = (await res.json()) as Array<{ balance?: number }>
  return rows[0]?.balance ?? 0
}

/**
 * 충전(+). 결제 성공 시 호출(3단계: polar-webhook).
 * p_ref(예: Polar order id)로 멱등 — 웹훅 재시도에도 한 번만 충전.
 * @returns 충전 후 잔액
 */
export async function chargeCredits(
  env: CreditsEnv,
  userId: string,
  amount: number,
  ref?: string,
): Promise<number> {
  const balance = await callRpc<number>(env, 'charge_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_ref: ref ?? null,
  })
  return typeof balance === 'number' ? balance : 0
}

export interface DeductResult {
  success: boolean
  balance: number
  reason?: 'insufficient' | 'no_credits' | string
  /** 같은 ref 가 이미 차감돼 재차감 없이 통과한 경우(결제 토큰 재시도). */
  idempotent?: boolean
}

/**
 * 차감(-). 유료 생성 직전 호출(3단계: makeup-edit). fail-safe:
 *   잔액 부족이면 변경 없이 { success:false } → 호출부는 생성 자체를 막아야 함.
 *   ("차감 안 됨"보다 "생성 안 됨" 원칙은 호출부에서 success 를 검사해 구현.)
 */
export async function deductCredits(
  env: CreditsEnv,
  userId: string,
  amount: number,
  ref?: string,
): Promise<DeductResult> {
  try {
    const r = await callRpc<DeductResult>(env, 'deduct_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_ref: ref ?? null,
    })
    return {
      success: !!r?.success,
      balance: typeof r?.balance === 'number' ? r.balance : 0,
      reason: r?.reason,
      idempotent: !!r?.idempotent,
    }
  } catch (e) {
    // 모호하면 실패 처리(과금 후 생성 누락보다, 차감 실패로 생성 막는 게 안전).
    return { success: false, balance: 0, reason: e instanceof Error ? e.message : 'rpc_error' }
  }
}
