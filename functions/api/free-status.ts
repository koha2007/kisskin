// ════════════════════════════════════════════════════════════════════
// 가입 무료권 남은 수 조회 (2026-10-21) — GET /api/free-status (Bearer 필수)
// ────────────────────────────────────────────────────────────────────
// 생성 "전에" 이번 생성이 무료권인지 크레딧인지 화면에 알려 주기 위한 읽기 전용 API.
// 판정 규칙·저장소는 makeup-edit / dna-portrait 와 같은 _freeUsage.ts.
// ════════════════════════════════════════════════════════════════════
import { FREE_LIMITS, getFreeUsed, verifyUser, type FreePool, type UsageStore } from './_freeUsage'

interface Env {
  MAKEUP_USAGE?: UsageStore
  SUPABASE_SERVICE_ROLE_KEY?: string
  VITE_SUPABASE_URL?: string
}

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

export async function onRequest({ request, env }: { request: Request; env: Env }) {
  const authHeader = request.headers.get('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'login_required' }, 401)
  const user = await verifyUser(env, authHeader.slice(7))
  if (!user) return json({ error: 'invalid_token' }, 401)
  if (!env.MAKEUP_USAGE) return json({ error: 'guard_unconfigured' }, 503)

  const out: Record<FreePool, { used: number; limit: number; left: number }> = {
    makeup: { used: 0, limit: FREE_LIMITS.makeup, left: 0 },
    dna: { used: 0, limit: FREE_LIMITS.dna, left: 0 },
  }
  for (const pool of Object.keys(out) as FreePool[]) {
    const used = Math.min(await getFreeUsed(env.MAKEUP_USAGE, pool, user), FREE_LIMITS[pool])
    out[pool] = { used, limit: FREE_LIMITS[pool], left: FREE_LIMITS[pool] - used }
  }
  return json(out)
}
