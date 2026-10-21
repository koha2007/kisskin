// ════════════════════════════════════════════════════════════════════
// 친구 초대 (2026-10-21) — /api/referral (Bearer 필수)
// ────────────────────────────────────────────────────────────────────
//   GET  → { code, joined, paid, rewarded, cap, bonus }  내 초대 코드(없으면 만든다) + 현황
//   POST { code } → { ok, reason? }  초대 링크(?ref=)로 들어온 사람을 초대한 사람에게 묶는다
// 보상(친구 첫 결제 시 양쪽 +2)은 polar-webhook 이 reward_referral 로 준다. 규칙은 0009 마이그레이션.
// 0009 실행 전이면(RPC 없음) 503 — 화면은 초대 카드를 숨긴다.
// ════════════════════════════════════════════════════════════════════
import { ledgerHashes, verifyUser } from './_freeUsage'

interface Env {
  SUPABASE_SERVICE_ROLE_KEY?: string
  VITE_SUPABASE_URL?: string
}

/** 친구 첫 결제 때 양쪽에 주는 크레딧 · 초대한 사람이 받는 최대 인원 */
export const REFERRAL_BONUS = 2
export const REFERRAL_CAP = 10

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

async function rpc<T>(env: Env, fn: string, params: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    const text = await res.text()
    if (!res.ok) {
      console.error(`[referral] rpc ${fn} ${res.status} ${text.slice(0, 200)}`)
      return null
    }
    return (text ? JSON.parse(text) : null) as T
  } catch {
    return null
  }
}

export async function onRequest({ request, env }: { request: Request; env: Env }) {
  const authHeader = request.headers.get('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'login_required' }, 401)
  const user = await verifyUser(env, authHeader.slice(7))
  if (!user) return json({ error: 'invalid_token' }, 401)

  if (request.method === 'GET') {
    const code = await rpc<string>(env, 'get_or_create_referral_code', { p_user_id: user.id })
    if (!code) return json({ error: 'unavailable' }, 503)
    const stats = await rpc<{ joined: number; paid: number; rewarded: number }>(env, 'referral_stats', { p_user_id: user.id })
    return json({ code, ...(stats ?? { joined: 0, paid: 0, rewarded: 0 }), cap: REFERRAL_CAP, bonus: REFERRAL_BONUS })
  }

  if (request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as { code?: unknown }
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
    if (!/^[A-Z0-9]{8}$/.test(code)) return json({ ok: false, reason: 'invalid_code' })
    const r = await rpc<{ success?: boolean; reason?: string }>(env, 'claim_referral', {
      p_referee: user.id, p_hashes: await ledgerHashes(user), p_code: code,
    })
    if (!r) return json({ error: 'unavailable' }, 503)
    return json({ ok: !!r.success, reason: r.reason })
  }

  return json({ error: 'method_not_allowed' }, 405)
}
