// Subscription status check API
// - Checks Polar for active subscription by customer email
// - Checks Supabase for monthly usage count
// - Returns: { active, tier, usage, limit, trialEndsAt }

interface Env {
  POLAR_ACCESS_TOKEN: string
  SUPABASE_SERVICE_ROLE_KEY: string
  VITE_SUPABASE_URL?: string
}

interface PolarSubscription {
  id: string
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid'
  current_period_start: string
  current_period_end: string
  started_at: string
  ended_at: string | null
  cancel_at_period_end: boolean
  product: {
    id: string
    name: string
    metadata?: Record<string, string>
  }
}

interface PolarListResponse {
  items: PolarSubscription[]
  pagination: { total_count: number }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  if (!env.POLAR_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: 'Payment not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { email } = (await request.json()) as { email: string }

    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    // 1. Check Polar for active subscriptions by customer email
    const subsRes = await fetch(
      `https://api.polar.sh/v1/subscriptions/?customer_email=${encodeURIComponent(email)}&active=true&limit=10`,
      {
        headers: { 'Authorization': `Bearer ${env.POLAR_ACCESS_TOKEN}` },
      },
    )

    if (!subsRes.ok) {
      const errText = await subsRes.text()
      console.error('[subscription-status] Polar API error:', subsRes.status, errText)
      return new Response(JSON.stringify({ error: 'Failed to check subscription' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    const subsData = (await subsRes.json()) as PolarListResponse

    // Find active or trialing subscription
    const activeSub = subsData.items.find(
      s => s.status === 'active' || s.status === 'trialing',
    )

    if (!activeSub) {
      return new Response(JSON.stringify({
        active: false,
        tier: null,
        usage: 0,
        limit: 0,
        trialEndsAt: null,
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Determine tier and limits from product metadata
    const metadata = activeSub.product.metadata || {}
    const tier = metadata.tier || 'pro'
    const monthlyLimit = parseInt(metadata.monthly_limit || '-1', 10)
    const trialLimit = parseInt(metadata.trial_limit || '5', 10)
    const isTrial = activeSub.status === 'trialing'
    const effectiveLimit = isTrial ? trialLimit : monthlyLimit

    // 3. Get current month usage from Supabase
    const supabaseUrl = env.VITE_SUPABASE_URL || 'https://vrcltmhhbgnsmdeoxlck.supabase.co'
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const usageRes = await fetch(
      `${supabaseUrl}/rest/v1/usage_tracking?email=eq.${encodeURIComponent(email)}&created_at=gte.${monthStart}&select=id`,
      {
        headers: {
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'count=exact',
        },
      },
    )

    let usage = 0
    if (usageRes.ok) {
      const countHeader = usageRes.headers.get('content-range')
      // Format: "0-N/total" or "*/total"
      if (countHeader) {
        const match = countHeader.match(/\/(\d+)/)
        if (match) usage = parseInt(match[1], 10)
      }
    }

    return new Response(JSON.stringify({
      active: true,
      status: activeSub.status,
      tier,
      usage,
      limit: effectiveLimit,
      trialEndsAt: isTrial ? activeSub.current_period_end : null,
      periodEnd: activeSub.current_period_end,
      cancelAtPeriodEnd: activeSub.cancel_at_period_end,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({
      error: `Server error: ${e instanceof Error ? e.message : String(e)}`,
    }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
