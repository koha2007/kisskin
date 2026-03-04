interface Env {
  POLAR_ACCESS_TOKEN: string
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
    const body = await request.json().catch(() => ({})) as { mobile?: boolean }
    const isMobile = !!body.mobile
    const origin = request.headers.get('Origin') || 'https://kissinskin.net'

    const checkoutBody: Record<string, unknown> = {
      products: ['e38a68d7-9b32-4ec2-a616-2f62d7dbc41b'],
      allow_discount_codes: true,
    }

    if (isMobile) {
      // 모바일: 리다이렉트 방식 (discount 코드 정상 동작)
      checkoutBody.success_url = `${origin}/?checkout_id={CHECKOUT_ID}`
    } else {
      // PC: 임베디드 방식
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

    const data = await res.json() as { url: string }

    return new Response(JSON.stringify({ url: data.url }), {
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
