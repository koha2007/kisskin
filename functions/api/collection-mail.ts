// 9룩 컬렉션 10장을 **본인 메일로** 보내기 (2026-10-12)
// 10/29: 럭키 메이크업 9장도 같은 경로(kind: 'lucky' → 제목·본문·링크만 럭키용)
// ────────────────────────────────────────────────────────────────────
// 왜: 안드로이드 크롬 공유 창엔 "기기에 저장"이 없는 폰이 많고, 인스타·카톡 인앱 브라우저는
// 다운로드를 무시하기도 한다. 돈 내고 받은 10장을 못 챙기면 곧 환불 요청이다 → 어떤 환경에서든
// 나중에라도 확실히 받는 안전장치.
//
// 🔒 받는 주소는 클라이언트가 정하지 않는다 — 로그인 토큰으로 확인한 **계정 이메일로만** 보낸다.
//    (아무 주소로 아무 이미지를 보내게 하면 도메인이 임의 발송 창구가 된다.) 하루 3회 제한,
//    JPEG data URL 만, 장당 2MB·최대 10장. 셀카 원본은 클라이언트가 애초에 보내지 않는다.
interface UsageStore {
  get(key: string): Promise<string | null>
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>
}
interface Env {
  RESEND_API_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  VITE_SUPABASE_URL?: string
  MAKEUP_USAGE?: UsageStore
}

const MAX_IMAGES = 10
const MAX_BYTES = 2 * 1024 * 1024
const DAILY_LIMIT = 3

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })

async function verifyUser(env: Env, token: string): Promise<{ id: string; email: string } | null> {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null
  try {
    const res = await fetch(`${env.VITE_SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY },
    })
    if (!res.ok) return null
    const u = (await res.json()) as { id?: string; email?: string }
    return u.id && u.email ? { id: u.id, email: u.email } : null
  } catch {
    return null
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.RESEND_API_KEY) return json({ error: 'not_configured' }, 500)
  const auth = request.headers.get('Authorization') || ''
  if (!auth.startsWith('Bearer ')) return json({ error: 'login_required' }, 401)
  const user = await verifyUser(env, auth.slice(7))
  if (!user) return json({ error: 'invalid_token' }, 401)

  let body: { images?: { name?: string; dataUrl?: string }[]; lang?: string; kind?: string }
  try { body = await request.json() } catch { return json({ error: 'bad_json' }, 400) }
  const images = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES) : []
  if (!images.length) return json({ error: 'no_images' }, 400)

  const attachments: { filename: string; content: string; content_type: string }[] = []
  for (const [i, img] of images.entries()) {
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(img.dataUrl || '')
    if (!m || (m[1].length * 3) / 4 > MAX_BYTES) return json({ error: 'bad_image' }, 400)
    const safe = (img.name || '').replace(/[^a-z0-9._-]/gi, '').slice(0, 60) || `look-${i + 1}.jpg`
    attachments.push({ filename: safe.endsWith('.jpg') ? safe : `${safe}.jpg`, content: m[1], content_type: 'image/jpeg' })
  }

  // 하루 3회 — KV 없으면 제한 없이 보내되(본인 주소 한정이라 피해 범위가 작다) 기록만 건너뛴다
  const day = new Date().toISOString().slice(0, 10)
  const key = `cm:user:${user.id}:${day}`
  if (env.MAKEUP_USAGE) {
    const used = parseInt((await env.MAKEUP_USAGE.get(key)) || '0', 10) || 0
    if (used >= DAILY_LIMIT) return json({ error: 'daily_limit' }, 429)
    try { await env.MAKEUP_USAGE.put(key, String(used + 1), { expirationTtl: 60 * 60 * 48 }) } catch { /* 기록 실패해도 발송 */ }
  }

  const isEn = body.lang === 'en'
  const lucky = body.kind === 'lucky'
  const title = lucky ? (isEn ? 'Your 9 lucky looks' : '나의 럭키 메이크업 9') : (isEn ? 'Your 9-look collection' : '나의 9룩 컬렉션')
  const subject = lucky ? `🍀 ${title} — kissinskin` : (isEn ? '💄 Your 9 looks — kissinskin' : '💄 나의 9룩 컬렉션 — kissinskin')
  const howtoPath = lucky ? 'lucky-makeup' : 'looks'
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5efe3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5efe3;"><tr><td align="center" style="padding:32px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;"><tr><td style="padding:32px 28px;text-align:center;">
<h1 style="margin:0;font-size:22px;color:#070953;">${title}</h1>
<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#475569;">${isEn
    ? `${attachments.length} images are attached — the grid image plus each look. Save them from this email any time.`
    : `첨부파일 ${attachments.length}장 — 모아보기와 룩별 낱장이에요. 언제든 이 메일에서 저장하세요.`}</p>
<p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">${isEn ? 'AI-generated makeup on your own selfie.' : '내 셀카로 만든 AI 메이크업이에요.'}</p>
<p style="margin:24px 0 0;"><a href="https://kissinskin.net${isEn ? '/en' : ''}/${howtoPath}/?utm_source=email&utm_medium=${lucky ? 'lucky9' : 'collection'}" style="color:#c9304a;font-weight:700;font-size:14px;">${isEn ? 'How to do each look yourself →' : '룩별 직접 하는 법 보기 →'}</a></p>
</td></tr></table>
<p style="font-size:12px;color:#94a3b8;margin:16px 0 0;">&copy; 2026 kissinskin · <a href="https://kissinskin.net" style="color:#232a52;">kissinskin.net</a></p>
</td></tr></table></body></html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'kissinskin <report@kissinskin.net>',
      to: [user.email],
      subject,
      html,
      attachments,
      tags: [{ name: 'kind', value: lucky ? 'lucky9' : 'collection' }],
    }),
  })
  if (!res.ok) return json({ error: 'send_failed', detail: (await res.text()).slice(0, 200) }, 502)
  return json({ ok: true, to: user.email.replace(/^(.{3}).*(@.*)$/, '$1***$2') })
}
