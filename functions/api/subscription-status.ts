// Subscription status check API
// - Primary: reads from Supabase (synced via Polar webhook)
// - Fallback: calls Polar API directly (for backfill gap)
// - Checks Supabase for monthly usage count
// - Returns: { active, tier, usage, limit, trialEndsAt }

interface Env {
  POLAR_ACCESS_TOKEN: string
  SUPABASE_SERVICE_ROLE_KEY: string
  VITE_SUPABASE_URL?: string
}

interface SubscriptionRow {
  polar_subscription_id: string
  email: string
  status: string
  tier: string
  monthly_limit: number
  trial_limit: number
  current_period_end: string | null
  cancel_at_period_end: boolean
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

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
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

    const supabaseUrl = env.VITE_SUPABASE_URL
    if (!supabaseUrl) {
      return new Response(JSON.stringify({ error: 'Supabase URL not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    // 1. Check Supabase for active subscription (synced via webhook)
    let activeSub = await getSubFromSupabase(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY, email)

    // 2. Fallback: if not found in Supabase, check Polar API directly
    if (!activeSub && env.POLAR_ACCESS_TOKEN) {
      activeSub = await getSubFromPolar(env.POLAR_ACCESS_TOKEN, email)
    }

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

    // 3. Get current month usage from Supabase
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
      if (countHeader) {
        const match = countHeader.match(/\/(\d+)/)
        if (match) usage = parseInt(match[1], 10)
      }
    }

    return new Response(JSON.stringify({
      active: true,
      status: activeSub.status,
      tier: activeSub.tier,
      usage,
      limit: activeSub.effectiveLimit,
      trialEndsAt: activeSub.status === 'trialing' ? activeSub.periodEnd : null,
      periodEnd: activeSub.periodEnd,
      cancelAtPeriodEnd: activeSub.cancelAtPeriodEnd,
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

// ── Supabase lookup ──────────────────────────────────────────────

interface SubResult {
  status: string
  tier: string
  effectiveLimit: number
  periodEnd: string | null
  cancelAtPeriodEnd: boolean
}

async function getSubFromSupabase(
  supabaseUrl: string,
  serviceKey: string,
  email: string,
): Promise<SubResult | null> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?email=eq.${encodeURIComponent(email)}&status=in.(active,trialing)&order=updated_at.desc&limit=1`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    },
  )

  if (!res.ok) return null

  const rows = (await res.json()) as SubscriptionRow[]
  if (rows.length === 0) return null

  const row = rows[0]
  const isTrial = row.status === 'trialing'

  return {
    status: row.status,
    tier: row.tier,
    effectiveLimit: isTrial ? row.trial_limit : row.monthly_limit,
    periodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
  }
}

// ── Polar API fallback ───────────────────────────────────────────

async function getSubFromPolar(
  accessToken: string,
  email: string,
): Promise<SubResult | null> {
  try {
    const res = await fetch(
      `https://api.polar.sh/v1/subscriptions/?customer_email=${encodeURIComponent(email)}&active=true&limit=10`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } },
    )

    if (!res.ok) return null

    const data = (await res.json()) as PolarListResponse
    const activeSub = data.items.find(
      s => s.status === 'active' || s.status === 'trialing',
    )

    if (!activeSub) return null

    const metadata = activeSub.product.metadata || {}
    const tier = metadata.tier || 'pro'
    const monthlyLimit = parseInt(metadata.monthly_limit || '-1', 10)
    const trialLimit = parseInt(metadata.trial_limit || '5', 10)
    const isTrial = activeSub.status === 'trialing'

    return {
      status: activeSub.status,
      tier,
      effectiveLimit: isTrial ? trialLimit : monthlyLimit,
      periodEnd: activeSub.current_period_end,
      cancelAtPeriodEnd: activeSub.cancel_at_period_end,
    }
  } catch {
    return null
  }
}
