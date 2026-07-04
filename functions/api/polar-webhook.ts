// Polar Webhook endpoint — receives Polar events and syncs to Supabase
// Events: subscription.created/updated/active/canceled/revoked, order.created/refunded
//
// 크레딧 충전(P1-5 4단계): order.created 가 크레딧 팩 상품이면, checkout 에서 실어보낸
//   metadata.user_id 로 chargeCredits(ref=order.id) 호출. charge_credits RPC 가 ref 멱등
//   처리 → 웹훅 재시도에도 한 번만 충전. 기존 orders 기록·구독 로직은 그대로 둔다.
import { creditsForProduct } from './_packs'
import { chargeCredits } from './_credits'

interface Env {
  POLAR_WEBHOOK_SECRET: string
  SUPABASE_SERVICE_ROLE_KEY: string
  VITE_SUPABASE_URL?: string
}

// Standard Webhooks (svix) signature verification
async function verifySignature(
  secret: string,
  webhookId: string,
  timestamp: string,
  body: string,
  signatures: string,
): Promise<boolean> {
  // Reject events older than 5 minutes (replay protection)
  const ts = parseInt(timestamp, 10)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - ts) > 300) return false

  // Polar SDK uses the secret as raw UTF-8 bytes for HMAC key
  // (internally: base64(utf8(secret)) → passed to standardwebhooks which base64-decodes it back)
  const secretBytes = new TextEncoder().encode(secret)

  const key = await crypto.subtle.importKey(
    'raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const payload = new TextEncoder().encode(`${webhookId}.${timestamp}.${body}`)
  const sig = await crypto.subtle.sign('HMAC', key, payload)
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)))

  // signatures header: "v1,<base64> v1,<base64> ..."
  return signatures.split(' ').some(s => s.replace('v1,', '') === expected)
}

// Supabase REST helper
async function supabaseRequest(
  supabaseUrl: string,
  serviceKey: string,
  path: string,
  method: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<Response> {
  const headers: Record<string, string> = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    ...extraHeaders,
  }
  const options: RequestInit = { method, headers }
  if (body) options.body = JSON.stringify(body)
  return fetch(`${supabaseUrl}/rest/v1/${path}`, options)
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  if (!env.POLAR_WEBHOOK_SECRET || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = env.VITE_SUPABASE_URL
  if (!supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Supabase URL not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // 1. Read raw body for signature verification
    const rawBody = await request.text()
    const webhookId = request.headers.get('webhook-id') || ''
    const timestamp = request.headers.get('webhook-timestamp') || ''
    const signatures = request.headers.get('webhook-signature') || ''

    if (!webhookId || !timestamp || !signatures) {
      return new Response(JSON.stringify({ error: 'Missing webhook headers' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Verify signature
    const valid = await verifySignature(env.POLAR_WEBHOOK_SECRET, webhookId, timestamp, rawBody, signatures)
    if (!valid) {
      console.error('[polar-webhook] Invalid signature')
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Parse event
    let event: { type: string; data: Record<string, unknown> }
    try {
      event = JSON.parse(rawBody)
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`[polar-webhook] Event: ${event.type}, ID: ${webhookId}`)

    // 4. Atomic idempotency: insert first (unique constraint on event_id), skip if duplicate
    const d = event.data
    const type = event.type

    const insertRes = await supabaseRequest(
      supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY,
      'webhook_events', 'POST',
      { event_id: webhookId, event_type: type },
      { 'Prefer': 'return=minimal' },
    )

    if (!insertRes.ok) {
      const errText = await insertRes.text()
      // 409 Conflict or 23505 unique_violation = duplicate event
      if (insertRes.status === 409 || errText.includes('23505') || errText.includes('duplicate')) {
        console.log(`[polar-webhook] Duplicate event ${webhookId}, skipping`)
        return new Response(JSON.stringify({ received: true, duplicate: true }), {
          headers: { 'Content-Type': 'application/json' },
        })
      }
      console.error(`[polar-webhook] Failed to record event: ${insertRes.status} ${errText}`)
      return new Response(JSON.stringify({ error: 'Failed to record event' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    // 5. Process event (only runs if insert succeeded — no duplicate)
    if (type.startsWith('subscription.')) {
      await handleSubscriptionEvent(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY, type, d)
    } else if (type.startsWith('order.')) {
      await handleOrderEvent(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY, type, d)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(`[polar-webhook] Error: ${e instanceof Error ? e.message : String(e)}`)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}

// ── Subscription events ──────────────────────────────────────────

async function handleSubscriptionEvent(
  supabaseUrl: string,
  serviceKey: string,
  type: string,
  data: Record<string, unknown>,
) {
  const sub = data as {
    id: string
    status: string
    customer_id?: string
    customer?: { email?: string }
    customer_email?: string
    product?: { id?: string; name?: string; metadata?: Record<string, string> }
    current_period_start?: string
    current_period_end?: string
    started_at?: string
    ended_at?: string
    cancel_at_period_end?: boolean
  }

  const email = sub.customer?.email || sub.customer_email || ''
  if (!email) {
    console.warn('[polar-webhook] Subscription event missing email, skipping')
    return
  }

  const metadata = sub.product?.metadata || {}
  const tier = metadata.tier || 'pro'
  const monthlyLimit = parseInt(metadata.monthly_limit || '-1', 10)
  const trialLimit = parseInt(metadata.trial_limit || '5', 10)

  const status = type === 'subscription.revoked' ? 'revoked'
    : type === 'subscription.canceled' ? 'canceled'
    : sub.status || 'active'

  const row = {
    polar_subscription_id: sub.id,
    polar_customer_id: sub.customer_id || null,
    email,
    status,
    tier,
    product_id: sub.product?.id || null,
    product_name: sub.product?.name || null,
    monthly_limit: monthlyLimit,
    trial_limit: trialLimit,
    current_period_start: sub.current_period_start || null,
    current_period_end: sub.current_period_end || null,
    cancel_at_period_end: sub.cancel_at_period_end || false,
    started_at: sub.started_at || null,
    ended_at: sub.ended_at || null,
    updated_at: new Date().toISOString(),
  }

  // Upsert by polar_subscription_id
  const res = await supabaseRequest(
    supabaseUrl, serviceKey,
    'subscriptions?on_conflict=polar_subscription_id', 'POST',
    row,
    { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
  )

  if (!res.ok) {
    const errText = await res.text()
    console.error(`[polar-webhook] Subscription upsert failed: ${res.status} ${errText}`)
  } else {
    console.log(`[polar-webhook] Subscription ${sub.id} → ${status} (${email})`)
  }
}

// ── Order events ─────────────────────────────────────────────────

async function handleOrderEvent(
  supabaseUrl: string,
  serviceKey: string,
  type: string,
  data: Record<string, unknown>,
) {
  const order = data as {
    id: string
    checkout_id?: string
    customer_email?: string
    customer?: { email?: string }
    product_id?: string
    product?: { id?: string }
    metadata?: Record<string, unknown>
    amount?: number
    currency?: string
    status?: string
  }

  const email = order.customer?.email || order.customer_email || ''
  if (!email) {
    console.warn('[polar-webhook] Order event missing email, skipping')
    return
  }

  if (type === 'order.created') {
    const productId = order.product_id || order.product?.id || null
    const row = {
      polar_order_id: order.id,
      polar_checkout_id: order.checkout_id || null,
      email,
      product_id: productId,
      amount: order.amount || 0,
      currency: order.currency || 'usd',
      status: 'succeeded',
    }

    const res = await supabaseRequest(
      supabaseUrl, serviceKey,
      'orders?on_conflict=polar_order_id', 'POST',
      row,
      { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[polar-webhook] Order insert failed: ${res.status} ${errText}`)
    } else {
      console.log(`[polar-webhook] Order ${order.id} created (${email})`)
    }

    // ── 크레딧 충전 (P1-5 4단계) — 크레딧 팩 주문만. 기존 분석/구독 주문은 건너뜀 ──
    // orders 기록 성공 여부와 독립적으로 시도(충전이 본질). chargeCredits 는 ref=order.id
    // 멱등이라 웹훅 재시도에도 1회만. 실패해도 throw 하지 않음(웹훅 200 유지).
    const credits = creditsForProduct(productId)
    if (credits != null) {
      const userId = typeof order.metadata?.user_id === 'string' ? order.metadata.user_id : ''
      if (!userId) {
        // metadata.user_id 없음 = 비로그인/구버전 checkout. 충전 불가 → 경고만(돈은 받았으니 수동 처리 대상).
        console.warn(`[polar-webhook] Credit order ${order.id} missing metadata.user_id — skipping charge (${email})`)
      } else {
        try {
          const balance = await chargeCredits(
            { SUPABASE_SERVICE_ROLE_KEY: serviceKey, VITE_SUPABASE_URL: supabaseUrl },
            userId, credits, order.id,
          )
          console.log(`[polar-webhook] Charged ${credits} credits → ${userId} (order ${order.id}), balance=${balance}`)
        } catch (e) {
          console.error(`[polar-webhook] chargeCredits failed for order ${order.id}: ${e instanceof Error ? e.message : String(e)}`)
        }
      }
    }
  } else if (type === 'order.refunded') {
    const res = await supabaseRequest(
      supabaseUrl, serviceKey,
      `orders?polar_order_id=eq.${encodeURIComponent(order.id)}`, 'PATCH',
      { status: 'refunded', updated_at: new Date().toISOString() },
      { 'Prefer': 'return=minimal' },
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[polar-webhook] Order refund update failed: ${res.status} ${errText}`)
    } else {
      console.log(`[polar-webhook] Order ${order.id} refunded`)
    }
  }
}
