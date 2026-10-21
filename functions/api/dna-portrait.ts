// ════════════════════════════════════════════════════════════════════
// "나만의 메이크업 찾았다" — 모델 얼굴 생성 Worker (P1)
// ────────────────────────────────────────────────────────────────────
// makeup-edit.ts 와 같은 뼈대:
//   로그인 필수 → 계정당 무료 1회(셀카 메이크업과 **별도 카운터** mu:dna:) →
//   소진 시 크레딧 1회 차감(ref=jobId 멱등) → gpt-image-2 /v1/images/edits.
//
// 셀카가 아니라 우리가 만든 민낯 모델(public/dna/base-<faceShape>.webp)에 메이크업만
// 올린다. 프롬프트는 클라이언트가 4종 결과로 조립해 보낸다(makeup-edit 와 동일 방식).
//
// 비용 가드(fail-closed): MAKEUP_USAGE(KV) 없으면 503, 크레딧 미설정 시 유료요청 503.
// 설정: gpt-image-2, medium, size 1024x1536 (베이스가 3:4 세로).
// ════════════════════════════════════════════════════════════════════
import { creditsConfigured, deductCredits, getBalance } from './_credits'
import { FREE_LIMITS, getFreeUsed, resolveTier, setFreeUsed, verifyUser, type UsageStore } from './_freeUsage'
interface Env {
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
  CF_AIG_TOKEN?: string
  MAKEUP_USAGE?: UsageStore
  SUPABASE_SERVICE_ROLE_KEY?: string
  VITE_SUPABASE_URL?: string
  /** Cloudflare Pages 기본 정적 asset 바인딩 (있으면 자체 fetch 대신 사용) */
  ASSETS?: { fetch: (input: string | Request) => Promise<Response> }
}

// 가입 무료권 2장 중 무료 도구 1장(_freeUsage.ts)
const FREE_LIMIT = FREE_LIMITS.dna
const SHAPES = ['oval', 'round', 'square', 'oblong', 'heart']

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })

interface Body {
  prompt?: string
  baseShape?: string
  jobId?: string
  /** 사용자가 고른 결제수단 — 'free'(가입 무료권) | 'credit'. 미지정=예전 클라이언트 호환 */
  pay?: 'free' | 'credit'
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.OPENAI_API_KEY && !env.CF_AIG_TOKEN) return json({ error: 'not_configured' }, 500)

  let body: Body
  try { body = (await request.json()) as Body } catch { return json({ error: 'bad_json' }, 400) }
  const prompt = (body.prompt || '').trim()
  const baseShape = (body.baseShape || '').trim()
  if (!prompt || !SHAPES.includes(baseShape)) return json({ error: 'missing_fields' }, 400)

  // ── 로그인 필수 ──
  const authHeader = request.headers.get('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'login_required', message: '로그인하면 내 메이크업 모델을 무료 1회 만들 수 있어요.' }, 401)
  }
  const user = await verifyUser(env, authHeader.slice(7))
  if (!user) return json({ error: 'invalid_token', message: '로그인이 만료됐어요. 다시 로그인해 주세요.' }, 401)

  // ── 비용 가드 ──
  if (!env.MAKEUP_USAGE) return json({ error: 'guard_unconfigured', message: '사용량 저장소가 설정되지 않았습니다.' }, 503)

  // 셀카 메이크업(mu:user:)과 **별도** 무료 풀
  const userId = user.id
  const used = await getFreeUsed(env.MAKEUP_USAGE, 'dna', user)
  // 무료권/크레딧은 사용자가 고른다(body.pay) — 우선순위 없음. 9룩 컬렉션은 항상 크레딧.
  const picked = await resolveTier(body.pay, used, FREE_LIMIT, async () =>
    creditsConfigured(env) && (await getBalance(env, user.id).catch(() => 0)) > 0)
  if (picked === 'free_pass_used') {
    return json({ error: 'free_pass_used', message: '무료권을 이미 사용했어요. 크레딧으로 만들 수 있어요.', freeLeft: 0 }, 409)
  }
  if (picked === 'pay_required') {
    return json({ error: 'pay_required', message: '새로고침 후 무료권과 크레딧 중 무엇을 쓸지 골라 주세요.' }, 409)
  }
  const tier: 'free' | 'credit' = picked
  let creditBalance = 0

  if (tier === 'credit') {
    if (!creditsConfigured(env)) return json({ error: 'credits_unconfigured', message: '크레딧 서비스가 아직 준비 중이에요.' }, 503)
    const jobId = (body.jobId || '').slice(0, 100)
    const ref = jobId || `${userId}:dna:${crypto.randomUUID()}`
    const deduct = await deductCredits(env, userId, 1, ref)
    if (!deduct.success) {
      if (deduct.reason === 'insufficient' || deduct.reason === 'no_credits') {
        return json({ error: 'insufficient_credits', message: '크레딧이 부족해요. 충전 후 다시 시도해 주세요.', balance: deduct.balance }, 402)
      }
      return json({ error: 'credit_error', message: '크레딧 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.' }, 503)
    }
    creditBalance = deduct.balance
  }

  // ── 베이스 민낯 모델 로드 (사이트 자체 asset) ──
  let baseBlob: Blob
  try {
    const baseUrl = new URL(`/dna/base-${baseShape}.webp`, request.url).toString()
    const baseRes = env.ASSETS ? await env.ASSETS.fetch(baseUrl) : await fetch(baseUrl)
    if (!baseRes.ok) return json({ error: 'base_unavailable', message: '베이스 이미지를 준비 중이에요.' }, 503)
    baseBlob = await baseRes.blob()
  } catch {
    return json({ error: 'base_unavailable', message: '베이스 이미지를 불러오지 못했어요.', retryable: true }, 503)
  }

  // ── gpt-image-2 images/edits ──
  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const fd = new FormData()
  fd.append('model', 'gpt-image-2')
  fd.append('image', baseBlob, 'base.webp')
  fd.append('prompt', prompt)
  fd.append('size', '1024x1536')
  fd.append('quality', 'medium')
  fd.append('n', '1')

  let url: string
  const headers: Record<string, string> = {}
  if (base && env.CF_AIG_TOKEN) {
    url = `${base}/v1/images/edits`
    headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}`
  } else if (base) {
    url = `${base}/v1/images/edits`
    headers['Authorization'] = `Bearer ${env.OPENAI_API_KEY}`
  } else {
    url = 'https://api.openai.com/v1/images/edits'
    headers['Authorization'] = `Bearer ${env.OPENAI_API_KEY}`
  }

  let res: Response
  try {
    res = await fetch(url, { method: 'POST', headers, body: fd })
  } catch (e) {
    return json({ error: 'upstream_fetch', message: e instanceof Error ? e.message : String(e), retryable: true }, 502)
  }
  const text = await res.text()
  if (!res.ok) return json({ error: 'openai', status: res.status, detail: text.slice(0, 300), retryable: true }, 502)

  let b64: string | undefined
  try { b64 = JSON.parse(text)?.data?.[0]?.b64_json } catch { return json({ error: 'bad_openai_json', retryable: true }, 502) }
  if (!b64) return json({ error: 'no_image', retryable: true }, 502)

  const image_out = `data:image/png;base64,${b64}`

  if (tier === 'free') {
    await setFreeUsed(env.MAKEUP_USAGE, 'dna', user, used + 1)
    return json({ image: image_out, tier: 'free', used: used + 1, free: FREE_LIMIT, freeLeft: Math.max(0, FREE_LIMIT - used - 1) })
  }
  return json({ image: image_out, tier: 'credit', balance: creditBalance, freeLeft: Math.max(0, FREE_LIMIT - used) })
}
