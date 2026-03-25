// Track analysis usage per user
// Called after successful analysis to increment monthly count

interface Env {
  SUPABASE_SERVICE_ROLE_KEY: string
  VITE_SUPABASE_URL?: string
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

    const supabaseUrl = env.VITE_SUPABASE_URL || 'https://vrcltmhhbgnsmdeoxlck.supabase.co'

    // Insert usage record
    const res = await fetch(`${supabaseUrl}/rest/v1/usage_tracking`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        email,
        action: 'analysis',
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[track-usage] Supabase error:', res.status, errText)
      // Don't fail the user experience - just log
      return new Response(JSON.stringify({ tracked: false, error: errText }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ tracked: true }), {
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
