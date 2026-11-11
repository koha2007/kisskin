interface Env {
  VITE_SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  const supabaseUrl = env.VITE_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server configuration missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Verify the caller's identity via Supabase Auth token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized: missing auth token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const accessToken = authHeader.replace('Bearer ', '')
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': serviceRoleKey,
      },
    })

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized: invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const authenticatedUser = (await userRes.json()) as { id: string }

    const { userId } = (await request.json()) as { userId?: string }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Ensure the caller can only delete their own account
    if (authenticatedUser.id !== userId) {
      return new Response(JSON.stringify({ error: 'Forbidden: cannot delete another user' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 갤러리 이미지는 계정 삭제의 cascade 로 지워지지 않는 저장소에 있다 → 먼저 지운다.
    // 조회·삭제가 실패하면 계정도 지우지 않는다(행이 사라지면 이미지를 찾을 길이 없어 공개 사진이 남는다).
    const galleryRes = await fetch(`${supabaseUrl}/rest/v1/gallery_post?user_id=eq.${userId}&select=image_bucket,image_path`, {
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey },
    })
    if (galleryRes.ok) {
      for (const g of (await galleryRes.json()) as { image_bucket: string; image_path: string }[]) {
        const del = await fetch(`${supabaseUrl}/storage/v1/object/${g.image_bucket}/${g.image_path}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey },
        })
        if (!del.ok && del.status !== 404) {
          console.error('[delete-account] gallery image', del.status)
          return new Response(JSON.stringify({ error: 'Failed to delete gallery images' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
      }
    } else {
      console.error('[delete-account] gallery list', galleryRes.status)
      return new Response(JSON.stringify({ error: 'Failed to delete gallery images' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // Delete user via Supabase Admin API
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[delete-account] Supabase error:', res.status, text)
      return new Response(JSON.stringify({ error: 'Failed to delete account' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
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
