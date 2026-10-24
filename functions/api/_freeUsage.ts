// ════════════════════════════════════════════════════════════════════
// 가입 무료권 — 서버 공용 헬퍼 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 정책: 가입 회원 1인당 무료권 2장, 풀이 따로 1장씩.
//   • makeup — 2026 AI 메이크업 9룩 중 1룩 1장  (makeup-edit.ts, 9룩 컬렉션은 해당 없음)
//   • lucky  — 럭키 메이크업 9가지 운 중 1개 1장 (makeup-edit.ts body.pool='lucky', 9장 묶음은 해당 없음)
//   • tool   — 옛 무료 도구 풀(뷰티 DNA·정밀 사주 풀이). 2026-10-24 운영자: "무료는 메이크업 1 + 럭키 1, 총 2장"
//              → 0장(크레딧만). 장부·KV 옛 기록 호환을 위해 풀 이름은 남겨 둔다.
// 무료권·크레딧 사이 우선순위 없음 — 사용자가 생성할 때 고른다(body.pay). 우리는 쓴 수·남은 수만 센다.
//
// 저장소(2026-10-21 장부 이전):
//   • 정본 = Supabase `free_pass_ledger`(0008 마이그레이션). 생성 "전"에 원자적으로 잡고(claim),
//     실패하면 풀고(release), 성공하면 그대로 둔다. 동시 두 번 눌러도 무료는 한 번.
//   • 옛 기록 = KV(MAKEUP_USAGE) `mu:`·`mu:dna:` 키 — 읽기만 한다(옛 사용분도 계속 인정).
//     0008 이 아직 실행 전이면(RPC 없음) 예전처럼 KV 에 기록하는 방식으로 자동 후퇴.
//   • 같은 사람 판정 = user_id 또는 이메일·소셜 로그인 고유번호의 SHA-256 해시가 하나라도 겹치면.
//     → 로그아웃·재로그인, 탈퇴 후 같은 이메일/구글 계정 재가입에도 소진 유지(방침 15항 고지).
// ════════════════════════════════════════════════════════════════════

export interface UsageStore {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

export type FreePool = 'makeup' | 'lucky' | 'tool'

/** 풀별 무료 장수. 합계 2장(가입 무료권 2개 = 메이크업 1 + 럭키 1). */
export const FREE_LIMITS: Record<FreePool, number> = { makeup: 1, lucky: 1, tool: 0 }

/** KV 옛 키 접두사 — tool 풀의 옛 기록은 뷰티 DNA 시절의 mu:dna:, lucky 는 0010 실행 전 후퇴용 */
const KV_PREFIX: Record<FreePool, string> = { makeup: 'mu:', lucky: 'mu:lucky:', tool: 'mu:dna:' }

export interface FreeEnv {
  MAKEUP_USAGE?: UsageStore
  VITE_SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

export interface AuthUser {
  id: string
  email: string | null
  /** 소셜 로그인 고유번호 — 'google:12345' 형태. 탈퇴 후 재가입해도 같은 값 */
  providerIds: string[]
}

/** Supabase 토큰 → { id, email, providerIds } 검증. 실패 시 null. */
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
    const u = (await res.json()) as {
      id?: string
      email?: string
      identities?: Array<{ provider?: string; id?: string; identity_data?: { sub?: string; provider_id?: string } }>
    }
    if (!u.id) return null
    const providerIds: string[] = []
    for (const idt of u.identities ?? []) {
      // 'email' 로그인의 sub 는 Supabase user_id 그 자체라 재가입 시 바뀐다 → 제외(이메일 해시가 담당)
      if (!idt.provider || idt.provider === 'email' || idt.provider === 'phone') continue
      const pid = idt.identity_data?.provider_id || idt.identity_data?.sub || idt.id
      if (pid && pid !== u.id) providerIds.push(`${idt.provider}:${pid}`)
    }
    return { id: u.id, email: u.email ? u.email.trim().toLowerCase() : null, providerIds }
  } catch {
    return null
  }
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** 장부의 신원 해시 — 이메일은 원문 대신 해시로만(개인정보 평문 X) */
export async function ledgerHashes(user: AuthUser): Promise<string[]> {
  const out: string[] = []
  if (user.email) out.push('e:' + (await sha256Hex(user.email)))
  for (const pid of user.providerIds) out.push('p:' + (await sha256Hex(pid)))
  return out
}

async function kvKeys(pool: FreePool, user: AuthUser): Promise<string[]> {
  const keys = [KV_PREFIX[pool] + 'user:' + user.id]
  if (user.email) keys.push(KV_PREFIX[pool] + 'email:' + (await sha256Hex(user.email)))
  for (const pid of user.providerIds) keys.push(KV_PREFIX[pool] + 'idp:' + (await sha256Hex(pid)))
  return keys
}

async function kvUsed(env: FreeEnv, pool: FreePool, user: AuthUser): Promise<number> {
  if (!env.MAKEUP_USAGE) return 0
  const store = env.MAKEUP_USAGE
  const vals = await Promise.all((await kvKeys(pool, user)).map((k) => store.get(k).catch(() => null)))
  return Math.max(0, ...vals.map((v) => parseInt(v || '0', 10) || 0))
}

type RpcResult<T> = { ok: true; data: T } | { ok: false; missing: boolean }

/** 장부 RPC. 0008 미실행(함수 없음)이면 missing=true → KV 로 후퇴. */
async function rpc<T>(env: FreeEnv, fn: string, params: Record<string, unknown>): Promise<RpcResult<T>> {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return { ok: false, missing: true }
  try {
    const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    const text = await res.text()
    // 23514 = 풀 이름 check 위반 — 0010(lucky 풀) 실행 전이면 KV 로 후퇴
    if (!res.ok) return { ok: false, missing: res.status === 404 || text.includes('PGRST202') || text.includes('23514') }
    return { ok: true, data: (text ? JSON.parse(text) : null) as T }
  } catch {
    return { ok: false, missing: false }
  }
}

/** 지금까지 쓴 무료 장수 = 장부 사용 수와 옛 KV 기록 중 큰 값. */
export async function getFreeUsed(env: FreeEnv, pool: FreePool, user: AuthUser): Promise<number> {
  const [legacy, ledger] = await Promise.all([
    kvUsed(env, pool, user),
    rpc<number>(env, 'free_pass_used', { p_user_id: user.id, p_hashes: await ledgerHashes(user), p_pool: pool }),
  ])
  return Math.max(legacy, ledger.ok && typeof ledger.data === 'number' ? ledger.data : 0)
}

export type FreeClaim =
  | { ok: true; used: number; commit: () => Promise<void>; release: () => Promise<void> }
  | { ok: false; reason: 'used' | 'error' }

/**
 * 무료권 1장 잡기 — 생성 "전"에 부른다.
 *   성공 → 생성 성공 시 commit(), 실패 시 release() 를 부를 것.
 *   'used' → 이미 다 씀(409) / 'error' → 판정 불가, 무료로 내주지 않는다(503).
 */
export async function claimFreePass(
  env: FreeEnv, pool: FreePool, user: AuthUser, usedFor: string, ref: string,
): Promise<FreeClaim> {
  const limit = FREE_LIMITS[pool]
  const legacy = await kvUsed(env, pool, user)
  if (legacy >= limit) return { ok: false, reason: 'used' }

  const r = await rpc<{ success?: boolean; used?: number; reason?: string }>(env, 'claim_free_pass', {
    p_user_id: user.id, p_hashes: await ledgerHashes(user), p_pool: pool,
    p_limit: limit, p_used_for: usedFor, p_ref: ref,
  })
  if (r.ok) {
    if (!r.data?.success) return { ok: false, reason: r.data?.reason === 'used' ? 'used' : 'error' }
    return {
      ok: true,
      used: r.data.used ?? legacy + 1,
      commit: async () => { /* 장부에 이미 기록됨 */ },
      release: async () => { await rpc(env, 'release_free_pass', { p_user_id: user.id, p_ref: ref }) },
    }
  }
  if (!r.missing || !env.MAKEUP_USAGE) return { ok: false, reason: 'error' }

  // 0008 실행 전 — 예전 방식(KV, 성공 시에만 기록)
  const store = env.MAKEUP_USAGE
  return {
    ok: true,
    used: legacy + 1,
    commit: async () => {
      await Promise.all((await kvKeys(pool, user)).map((k) => store.put(k, String(legacy + 1)).catch(() => {})))
    },
    release: async () => { /* KV 는 성공 시에만 기록하므로 되돌릴 것 없음 */ },
  }
}

export type PayChoice = 'free' | 'credit'

/**
 * 사용자가 고른 결제수단(pay) → 이번 생성의 tier. 우선순위 없음(운영자 2026-10-21).
 *   • 'credit' → 크레딧 차감
 *   • 'free'   → 무료권. 이미 다 썼으면 'free_pass_used' (크레딧으로 몰래 바꾸지 않는다)
 *   • 미지정   → (배포 전에 열어 둔 옛 탭 등) 고를 게 하나뿐이면 그것, 무료권·크레딧 둘 다 있으면
 *               'pay_required' — 사이트가 대신 고르지 않는다. hasCredits 는 그때만 조회(잔액 > 0).
 */
export async function resolveTier(
  pay: unknown,
  used: number,
  limit: number,
  hasCredits: () => Promise<boolean>,
): Promise<PayChoice | 'free_pass_used' | 'pay_required'> {
  if (pay === 'credit') return 'credit'
  if (pay === 'free') return used < limit ? 'free' : 'free_pass_used'
  if (used >= limit) return 'credit'
  return (await hasCredits()) ? 'pay_required' : 'free'
}
