// Checkout API — supports both subscription and one-time product checkout
// POLAR_PRODUCT_ID env var determines which product to use (subscription or one-time)

// Checkout API — supports per-analysis (default) and subscription checkout
interface Env {
  POLAR_ACCESS_TOKEN: string
  POLAR_PRODUCT_ID?: string       // Subscription product ID (set in Cloudflare env)
}

// Per-analysis one-time product
const ONE_TIME_PRODUCT_ID = 'e38a68d7-9b32-4ec2-a616-2f62d7dbc41b'

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  if (!env.POLAR_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: 'Payment not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json().catch(() => ({})) as { redirect?: boolean; email?: string; type?: string }
    const useRedirect = !!body.redirect
    const origin = request.headers.get('Origin') || 'https://kissinskin.net'

    // type=subscription → use subscription product, otherwise one-time
    const productId = body.type === 'subscription'
      ? (env.POLAR_PRODUCT_ID || ONE_TIME_PRODUCT_ID)
      : ONE_TIME_PRODUCT_ID

    const checkoutBody: Record<string, unknown> = {
      products: [productId],
      allow_discount_codes: true,
    }

    // Pre-fill customer email if provided (for subscription linking)
    if (body.email) {
      checkoutBody.customer_email = body.email
    }

    if (useRedirect) {
      checkoutBody.success_url = `${origin}/?checkout_id={CHECKOUT_ID}`
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
