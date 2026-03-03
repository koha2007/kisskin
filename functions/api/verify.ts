interface Env {
  POLAR_ACCESS_TOKEN: string
}

interface VerifyRequest {
  checkoutId: string
}

interface CheckoutResponse {
  id: string
  status: 'open' | 'expired' | 'confirmed' | 'succeeded' | 'failed'
  amount: number
  total_amount: number
  currency: string
  customer_email: string | null
  product_id: string | null
  created_at: string
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
    const { checkoutId } = (await request.json()) as VerifyRequest

    if (!checkoutId) {
      return new Response(JSON.stringify({ error: 'Missing checkoutId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch(`https://sandbox-api.polar.sh/v1/checkouts/${checkoutId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      },
    })

    if (!res.ok) {
      const errText = await res.text()
      return new Response(JSON.stringify({ error: `Polar API error: ${errText}` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const checkout = await res.json() as CheckoutResponse

    return new Response(JSON.stringify({
      id: checkout.id,
      status: checkout.status,
      amount: checkout.total_amount,
      currency: checkout.currency,
      customerEmail: checkout.customer_email,
      productId: checkout.product_id,
      createdAt: checkout.created_at,
    }), {
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
