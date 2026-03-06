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
    const body = await request.json().catch(() => ({})) as { redirect?: boolean }
    const useRedirect = !!body.redirect
    const origin = request.headers.get('Origin') || 'https://kisskin.net'

    const checkoutBody: Record<string, unknown> = {
      products: ['e38a68d7-9b32-4ec2-a616-2f62d7dbc41b'],
      allow_discount_codes: true,
    }

    if (useRedirect) {
      // 임베디드 불가 시 리다이렉트 fallback
      checkoutBody.success_url = `${origin}/?checkout_id={CHECKOUT_ID}`
    } else {
      // 임베디드 모드 (success_url 없어야 success 이벤트 정상 발생)
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
