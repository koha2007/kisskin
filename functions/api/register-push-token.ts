// 앱(Expo)에서 발급한 푸시 토큰을 KV 에 저장한다.
// 나중에 발송기(별도 스크립트/Actions)가 이 KV 를 순회하며 Expo Push API 로 알림을 쏜다.
//
// 저장 형태: key = `token:<ExponentPushToken>`  value = JSON { platform, lang, updatedAt }
// 같은 토큰이 다시 오면 덮어쓰기(멱등) → 언어/플랫폼/최종접속 갱신.

interface Env {
  PUSH_TOKENS: KVNamespace
}

interface RegisterBody {
  token?: string
  platform?: string
  lang?: string
}

// Expo 푸시 토큰만 허용 — "ExponentPushToken[...]" 또는 "ExpoPushToken[...]"
function isExpoToken(t: unknown): t is string {
  return (
    typeof t === 'string' &&
    (t.startsWith('ExponentPushToken[') || t.startsWith('ExpoPushToken[')) &&
    t.endsWith(']') &&
    t.length < 200
  )
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  if (!env.PUSH_TOKENS) {
    // KV 바인딩 미설정 — 앱 쪽은 실패를 조용히 무시하므로 500 이어도 UX 영향 없음
    return json({ error: 'Push storage not configured' }, 500)
  }

  let body: RegisterBody
  try {
    body = (await request.json()) as RegisterBody
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  if (!isExpoToken(body.token)) {
    return json({ error: 'Invalid push token' }, 400)
  }

  const platform = body.platform === 'ios' || body.platform === 'android' ? body.platform : 'unknown'
  const lang = body.lang === 'ko' ? 'ko' : 'en'

  try {
    await env.PUSH_TOKENS.put(
      `token:${body.token}`,
      JSON.stringify({ platform, lang, updatedAt: new Date().toISOString() })
    )
    return json({ registered: true })
  } catch (e) {
    return json({ error: `Storage error: ${e instanceof Error ? e.message : String(e)}` }, 500)
  }
}
