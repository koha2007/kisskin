// ════════════════════════════════════════════════════════════════════
// 가입 무료권 — 서버 공용 헬퍼 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 정책: 가입 회원 1인당 무료권 2장, 풀이 따로 1장씩.
//   • makeup — AI 메이크업 9룩 중 1룩 생성 1장  (makeup-edit.ts, 9룩 컬렉션은 해당 없음)
//   • dna    — 무료 도구(뷰티 DNA) 모델 생성 1장 (dna-portrait.ts)
// 무료권·크레딧 사이 우선순위 없음 — 사용자가 생성할 때 고른다(body.pay). 우리는 쓴 수·남은 수만 센다.
//
// 기억 방식: KV(MAKEUP_USAGE)에 user_id 키 + 이메일 해시 키 둘 다 기록.
//   • 로그아웃·재로그인 → user_id 가 같으니 그대로 소진 상태.
//   • 탈퇴 후 같은 이메일로 재가입 → user_id 는 새로 나오지만 이메일 키로 소진 상태 유지.
//   키 이름(mu:user:, mu:dna:user:)은 기존 기록과 호환되게 그대로 둔다.
// ════════════════════════════════════════════════════════════════════

export interface UsageStore {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

export type FreePool = 'makeup' | 'dna'

/** 풀별 무료 장수. 합계 2장(가입 무료권 2개). */
export const FREE_LIMITS: Record<FreePool, number> = { makeup: 1, dna: 1 }

const PREFIX: Record<FreePool, string> = { makeup: 'mu:', dna: 'mu:dna:' }

export interface AuthUser { id: string; email: string | null }

/** Supabase 토큰 → { id, email } 검증. 실패 시 null. */
export async function verifyUser(
  env: { VITE_SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string },
  token: string,
): Promise<AuthUser | null> {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null
  try {
    const res = await fetch(`${env.VITE_SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY },
    })
    if (!res.ok) return null
    const u = (await res.json()) as { id?: string; email?: string }
    if (!u.id) return null
    return { id: u.id, email: u.email ? u.email.trim().toLowerCase() : null }
  } catch {
    return null
  }
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function keysFor(pool: FreePool, user: AuthUser): Promise<string[]> {
  const keys = [PREFIX[pool] + 'user:' + user.id]
  // 이메일은 원문 대신 해시로만 저장(KV 에 개인정보 평문 X).
  if (user.email) keys.push(PREFIX[pool] + 'email:' + (await sha256Hex(user.email)))
  return keys
}

/** 지금까지 쓴 무료 장수 = user_id 키·이메일 키 중 큰 값. */
export async function getFreeUsed(store: UsageStore, pool: FreePool, user: AuthUser): Promise<number> {
  const keys = await keysFor(pool, user)
  const vals = await Promise.all(keys.map((k) => store.get(k).catch(() => null)))
  return Math.max(0, ...vals.map((v) => parseInt(v || '0', 10) || 0))
}

/** 생성 성공 후 호출 — 두 키 모두에 used 를 기록. */
export async function setFreeUsed(store: UsageStore, pool: FreePool, user: AuthUser, used: number): Promise<void> {
  const keys = await keysFor(pool, user)
  await Promise.all(keys.map((k) => store.put(k, String(used)).catch(() => { /* 기록 실패해도 결과는 반환 */ })))
}

export type PayChoice = 'free' | 'credit'

/**
 * 사용자가 고른 결제수단(pay) → 이번 생성의 tier. 우선순위 없음(운영자 2026-10-21).
 *   • 'credit' → 크레딧 차감
 *   • 'free'   → 무료권. 이미 다 썼으면 'free_pass_used' (크레딧으로 몰래 바꾸지 않는다)
 *   • 미지정   → 예전 클라이언트(앱·캐시된 페이지) 호환: 무료권 남았으면 무료, 아니면 크레딧
 */
export function resolveTier(pay: unknown, used: number, limit: number): PayChoice | 'free_pass_used' {
  if (pay === 'credit') return 'credit'
  if (pay === 'free') return used < limit ? 'free' : 'free_pass_used'
  return used < limit ? 'free' : 'credit'
}
