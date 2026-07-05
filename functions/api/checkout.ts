// Checkout API — supports both subscription and one-time product checkout
// POLAR_PRODUCT_ID env var determines which product to use (subscription or one-time)

// Checkout API — supports per-analysis (default), subscription, and credit-pack checkout
import { CREDIT_PACKS, isPackId } from './_packs'

interface Env {
  POLAR_ACCESS_TOKEN: string
  POLAR_PRODUCT_ID?: string       // Subscription product ID (set in Cloudflare env)
  // ── 크레딧 팩(P1-5 4단계, 방안 A) — checkout metadata 에 user_id 주입용 ──
  SUPABASE_SERVICE_ROLE_KEY?: string
  VITE_SUPABASE_URL?: string
}

// Per-analysis one-time product
const ONE_TIME_PRODUCT_ID = 'e38a68d7-9b32-4ec2-a616-2f62d7dbc41b'

const errJson = (msg: string, status: number, extra?: Record<string, unknown>) =>
  new Response(JSON.stringify({ error: msg, ...extra }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/** Supabase 토큰 → user_id 검증(makeup-edit.ts 와 동일 패턴, auth 무변경). */
async function verifyUserId(env: Env, token: string): Promise<string | null> {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null
  try {
    const res = await fetch(`${env.VITE_SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY },
    })
    if (!res.ok) return null
    const u = (await res.json()) as { id?: string }
    return u.id || null
  } catch {
    return null
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  if (!env.POLAR_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: 'Payment not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json().catch(() => ({})) as { redirect?: boolean; email?: string; type?: string; pack?: string }
    const useRedirect = !!body.redirect
    const origin = request.headers.get('Origin') || 'https://kissinskin.net'

    const checkoutBody: Record<string, unknown> = {
      allow_discount_codes: true,
    }

    if (body.pack !== undefined) {
      // ── 크레딧 팩 결제 (P1-5 4단계, 방안 A: metadata 에 user_id) ──
      // 로그인 토큰 검증 → user_id 를 checkout metadata 에 실어 보낸다. Polar 가
      // 이 metadata 를 결과 order 로 전파 → 웹훅이 user_id 로 크레딧을 충전한다.
      if (!isPackId(body.pack)) return errJson('invalid_pack', 400)

      const authHeader = request.headers.get('Authorization') || ''
      if (!authHeader.startsWith('Bearer ')) {
        return errJson('login_required', 401, { message: '로그인 후 충전할 수 있어요.' })
      }
      const userId = await verifyUserId(env, authHeader.slice(7))
      if (!userId) {
        return errJson('invalid_token', 401, { message: '로그인이 만료됐어요. 다시 로그인해 주세요.' })
      }

      const pack = CREDIT_PACKS[body.pack]
      checkoutBody.products = [pack.id]
      checkoutBody.metadata = {
        user_id: userId,
        pack: body.pack,
        credits: String(pack.credits), // Polar metadata 값은 문자열 — 웹훅은 product ID 로 크레딧 결정(이건 참고용)
      }
    } else {
      // ── 기존 흐름 유지: type=subscription → 구독, 그 외 → $2.99 분석 one-time ──
      const productId = body.type === 'subscription'
        ? (env.POLAR_PRODUCT_ID || ONE_TIME_PRODUCT_ID)
        : ONE_TIME_PRODUCT_ID
      checkoutBody.products = [productId]
    }

    // Customer 연결은 "반복 결제(구독)"에만 건다.
    // customer_email 을 넘기면 Polar 가 그 이메일의 기존 고객을 인식하고, 호스티드
    // 결제창에 그 고객의 "저장된 결제수단(카드)"을 띄운다. 일회성 결제(크레딧 팩·$2.99
    // 분석)에는 이게 바람직하지 않아 customer 를 연결하지 않는다(매번 새로 입력).
    //   · 크레딧 충전: 충전은 metadata.user_id 로 처리 → email 불필요.
    //   · 웹훅/verify/GA: 구매자가 결제창에 입력한 이메일을 그대로 받으므로 무영향.
    //   · 구독: 반복 청구에 저장 카드가 필요하므로 연결 유지.
    if (body.email && body.type === 'subscription') {
      checkoutBody.customer_email = body.email
    }

    if (useRedirect) {
      // Return to /analysis/ — that page hosts the checkout-return handler that
      // verifies the payment, resumes the analysis, and fires the GA4 purchase.
      // (The bare homepage has no such handler, so returning to `/` silently drops
      // the conversion.) Trailing slash matches the prerendered canonical route.
      checkoutBody.success_url = `${origin}/analysis/?checkout_id={CHECKOUT_ID}`
    } else {
      checkoutBody.embed_origin = origin
    }

    const res = await fetch('https://api.polar.sh/v1/checkouts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(checkoutBody),
    })

    if (!res.ok) {
      const errText = await res.text()
      return new Response(JSON.stringify({ error: `Polar API error: ${errText}` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await res.json() as { id: string; url: string; client_secret?: string }

    return new Response(JSON.stringify({ id: data.id, url: data.url }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({
      error: `Server error: ${e instanceof Error ? e.message : String(e)}`,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
