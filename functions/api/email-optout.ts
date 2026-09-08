// 주간 제품 다이제스트 메일의 수신거부 처리.
//
//   GET  /api/email-optout?e=<email>&t=<hmac>   → 사람이 링크를 클릭했을 때. HTML 확인 페이지 반환.
//   POST /api/email-optout?e=<email>&t=<hmac>   → RFC 8058 원클릭(메일 클라이언트가 자동 호출).
//
// 둘 다 하는 일은 같다: 서명(t) 검증 → public.email_optout 에 이메일 upsert.
// 발송기(announce-products.ts)가 매번 이 표를 빼고 보낸다.

import { verifyEmailSig } from './_digestMail'

interface Env {
  VITE_SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  EMAIL_OPTOUT_SECRET?: string
}

const page = (title: string, body: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="ko"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head>
<body style="margin:0;font:400 15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f4f2;color:#222;">
<div style="max-width:460px;margin:80px auto;background:#fff;border-radius:16px;padding:40px 32px;text-align:center;">
<div style="font:700 19px/1.3 sans-serif;margin-bottom:12px;">${title}</div>
<div style="color:#555;">${body}</div>
<div style="margin-top:24px;"><a href="https://kissinskin.net" style="color:#999;font-size:13px;">kissinskin.net</a></div>
</div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )

async function optOut(request: Request, env: Env): Promise<{ ok: boolean; msg: string; status: number }> {
  const supabaseUrl = env.VITE_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  const secret = env.EMAIL_OPTOUT_SECRET
  if (!supabaseUrl || !serviceRoleKey || !secret) {
    return { ok: false, msg: '서버 설정이 없어 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.', status: 500 }
  }

  const url = new URL(request.url)
  const email = (url.searchParams.get('e') || '').trim().toLowerCase()
  const t = url.searchParams.get('t') || ''

  if (!email || !(await verifyEmailSig(secret, email, t))) {
    return { ok: false, msg: '링크가 올바르지 않거나 만료되었습니다.', status: 400 }
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/email_optout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      // 이미 있으면 조용히 무시 (같은 링크를 두 번 눌러도 200)
      'Prefer': 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify({ email }),
  })

  if (!res.ok && res.status !== 409) {
    const detail = await res.text()
    console.error('[email-optout] supabase', res.status, detail.slice(0, 300))
    return { ok: false, msg: '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', status: 500 }
  }

  return { ok: true, msg: '앞으로 제품 소식 메일을 보내지 않습니다. 마음이 바뀌면 언제든 다시 신청할 수 있어요.', status: 200 }
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const r = await optOut(context.request, context.env)
  return page(r.ok ? '수신거부 완료' : '수신거부 실패', r.msg, r.status)
}

// 메일 클라이언트의 원클릭 수신거부(List-Unsubscribe-Post). 본문은 안 읽힌다.
export async function onRequestPost(context: { request: Request; env: Env }) {
  const r = await optOut(context.request, context.env)
  return new Response(r.ok ? 'unsubscribed' : r.msg, {
    status: r.status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
