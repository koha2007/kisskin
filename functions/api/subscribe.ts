// 이메일 구독 신청 + 확인 (더블 옵트인).
//
//   POST /api/subscribe            { email, locale?, source? }  → 확인 메일 발송
//   GET  /api/subscribe?e=&t=      확인 링크 클릭 → 구독 확정(HTML 페이지)
//
// 왜 이게 필요했나(2026-09-22): 주간 다이제스트 수신자는 여태 **회원 전원**이었다.
// 메일을 받으려면 가입을 해야 했는데, 유입의 대부분은 무료 도구 결과 페이지에서 끝난다.
// 그 사이를 메우는 낮은 문턱이 이 엔드포인트다 — 이메일만, 가입 없이.
//
// 더블 옵트인인 이유는 supabase/migrations/0007_email_subscriber.sql 주석 참고
// (남의 주소 등록 차단 · 도메인 평판 · 동의 증빙).
//
// 환경변수는 전부 이미 있는 것들이다 — 새로 넣을 것 없음:
//   VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / RESEND_API_KEY / EMAIL_OPTOUT_SECRET

import { SITE, signScoped, verifyScoped } from './_digestMail'

interface Env {
  VITE_SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  RESEND_API_KEY?: string
  EMAIL_OPTOUT_SECRET?: string
}

const SCOPE = 'subscribe'
const FROM = 'kissinskin <report@kissinskin.net>'
/** 같은 주소로 확인 메일을 다시 보내기까지의 최소 간격. 메일폭탄 방지. */
const RESEND_COOLDOWN_MS = 10 * 60 * 1000

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

// 지나치게 관대하지도, 정규식으로 RFC 를 흉내내지도 않는다. 오타는 확인 메일이 걸러낸다.
const EMAIL_RE = /^[^\s@,;:<>"'()[\]\\]+@[^\s@.]+(\.[^\s@.]+)+$/

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ── 문구 ────────────────────────────────────────────────────────────
const COPY = {
  ko: {
    subject: '구독 확인 한 번만 눌러주세요 — kissinskin',
    preheader: '아래 버튼을 눌러야 주간 K-뷰티 레터가 시작됩니다.',
    heading: '거의 다 됐어요',
    body: '아래 버튼을 누르면 매주 화요일 아침, 지난 한 주의 K-뷰티 신제품과 뉴스를 한 통으로 정리해 보내드립니다.',
    button: '구독 확인하기',
    ignore: '직접 신청하지 않으셨다면 이 메일은 무시하셔도 됩니다. 버튼을 누르기 전에는 아무 메일도 보내지 않습니다.',
    doneTitle: '구독이 시작됐습니다',
    doneBody: '매주 화요일 아침에 찾아뵐게요. 언제든 메일 맨 아래에서 수신거부할 수 있습니다.',
    failTitle: '확인하지 못했습니다',
    failBody: '링크가 올바르지 않거나 만료되었습니다. 사이트에서 다시 신청해 주세요.',
    backHome: '키스인스킨으로 돌아가기',
  },
  en: {
    subject: 'One click to confirm — kissinskin',
    preheader: 'Tap the button below to start your weekly K-beauty letter.',
    heading: 'Almost there',
    body: 'Tap the button below and every Tuesday morning we will send you one email with the past week in K-beauty — new products and news.',
    button: 'Confirm subscription',
    ignore: 'If you did not sign up, you can ignore this email. We send nothing until you tap the button.',
    doneTitle: "You're subscribed",
    doneBody: 'See you on Tuesday mornings. You can unsubscribe from the bottom of any email.',
    failTitle: "We couldn't confirm that",
    failBody: 'The link is invalid or has expired. Please sign up again on the site.',
    backHome: 'Back to kissinskin',
  },
} as const

type Lang = keyof typeof COPY

function langOf(v: unknown): Lang {
  return String(v ?? '').toLowerCase().startsWith('en') ? 'en' : 'ko'
}

// 확인 메일. 다이제스트와 같은 조판(흰 카드 + 검정 버튼)이라 같은 발신인으로 읽힌다.
// 수신거부 링크는 넣지 않는다 — 아직 구독이 성립하지 않았으므로 거부할 대상이 없다
// (버튼을 안 누르면 그걸로 끝이고, 그 뒤로 아무것도 보내지 않는다).
function confirmMail(lang: Lang, href: string): { subject: string; html: string } {
  const t = COPY[lang]
  const F = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif`
  return {
    subject: t.subject,
    html: `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f4f2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(t.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f2;padding:32px 16px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:536px;background:#fff;border-radius:16px;padding:36px 28px;">
    <tr><td style="font:700 22px/1.35 ${F};color:#111;padding-bottom:12px;">${esc(t.heading)}</td></tr>
    <tr><td style="font:400 15px/1.65 ${F};color:#555;padding-bottom:24px;">${esc(t.body)}</td></tr>
    <tr><td style="padding-bottom:24px;">
      <a href="${esc(href)}" style="display:inline-block;font:700 15px/1 ${F};color:#fff;background:#111;text-decoration:none;padding:15px 28px;border-radius:10px;">${esc(t.button)}</a>
    </td></tr>
    <tr><td style="font:400 12px/1.6 ${F};color:#999;border-top:1px solid #eee;padding-top:18px;">${esc(t.ignore)}</td></tr>
  </table>
  <div style="font:400 12px/1.6 ${F};color:#aaa;padding-top:18px;">kissinskin.net</div>
</td></tr></table></body></html>`,
  }
}

const page = (lang: Lang, title: string, body: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="robots" content="noindex"/>
<title>${esc(title)}</title></head>
<body style="margin:0;font:400 15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f4f2;color:#222;">
<div style="max-width:460px;margin:80px auto;background:#fff;border-radius:16px;padding:40px 32px;text-align:center;">
<div style="font:700 19px/1.3 sans-serif;margin-bottom:12px;">${esc(title)}</div>
<div style="color:#555;">${esc(body)}</div>
<div style="margin-top:24px;"><a href="${SITE}${lang === 'en' ? '/en/' : '/'}" style="color:#999;font-size:13px;">${esc(COPY[lang].backHome)}</a></div>
</div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  )

// ── Supabase (service_role) ────────────────────────────────────────
interface Row {
  email: string
  locale: string
  confirmed_at: string | null
  confirm_sent_at: string | null
}

function sb(env: Env) {
  const url = env.VITE_SUPABASE_URL!
  const key = env.SUPABASE_SERVICE_ROLE_KEY!
  return (path: string, init: RequestInit = {}) =>
    fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string> | undefined),
      },
    })
}

async function findRow(env: Env, email: string): Promise<Row | null> {
  const res = await sb(env)(
    `email_subscriber?email=eq.${encodeURIComponent(email)}&select=email,locale,confirmed_at,confirm_sent_at`,
  )
  if (!res.ok) throw new Error(`select ${res.status}: ${(await res.text()).slice(0, 160)}`)
  const rows = (await res.json()) as Row[]
  return rows[0] ?? null
}

// ── POST: 신청 ─────────────────────────────────────────────────────
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.RESEND_API_KEY || !env.EMAIL_OPTOUT_SECRET) {
    return json({ error: 'not_configured' }, 500)
  }

  let body: { email?: unknown; locale?: unknown; source?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: 'bad_request' }, 400)
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const lang = langOf(body.locale)
  const source = String(body.source ?? '').slice(0, 60) || null

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ error: 'invalid_email' }, 400)
  }

  try {
    const existing = await findRow(env, email)

    // 이미 확정된 사람에게 또 확인 메일을 보내지 않는다. 화면에는 "이미 구독 중" 으로 답한다.
    if (existing?.confirmed_at) return json({ status: 'already' })

    // 같은 주소로 연달아 신청해도 확인 메일은 쿨다운 안에 한 통만 나간다.
    if (existing?.confirm_sent_at) {
      const age = Date.now() - new Date(existing.confirm_sent_at).getTime()
      if (age >= 0 && age < RESEND_COOLDOWN_MS) return json({ status: 'pending' })
    }

    const now = new Date().toISOString()
    const patch = { locale: lang, source, confirm_sent_at: now }
    const res = existing
      ? await sb(env)(`email_subscriber?email=eq.${encodeURIComponent(email)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(patch),
        })
      : await sb(env)('email_subscriber', {
          method: 'POST',
          // 동시에 두 번 눌러 충돌해도 조용히 넘긴다.
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({ email, created_at: now, ...patch }),
        })
    if (!res.ok && res.status !== 409) {
      console.error('[subscribe] supabase', res.status, (await res.text()).slice(0, 200))
      return json({ error: 'server_error' }, 500)
    }

    const t = await signScoped(env.EMAIL_OPTOUT_SECRET, SCOPE, email)
    const href = `${SITE}/api/subscribe?e=${encodeURIComponent(email)}&t=${t}`
    const { subject, html } = confirmMail(lang, href)

    const mail = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject,
        html,
        tags: [{ name: 'campaign', value: 'subscribe_confirm' }, { name: 'lang', value: lang }],
      }),
    })
    if (!mail.ok) {
      console.error('[subscribe] resend', mail.status, (await mail.text()).slice(0, 200))
      return json({ error: 'mail_failed' }, 502)
    }

    return json({ status: 'pending' })
  } catch (e) {
    console.error('[subscribe]', e instanceof Error ? e.message : String(e))
    return json({ error: 'server_error' }, 500)
  }
}

// ── GET: 확인 링크 ──────────────────────────────────────────────────
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context
  const url = new URL(request.url)
  const email = (url.searchParams.get('e') || '').trim().toLowerCase()
  const t = url.searchParams.get('t') || ''
  // 실패 페이지의 언어는 아직 모르니 한국어 기본. 성공 시엔 저장된 locale 을 쓴다.
  let lang: Lang = 'ko'

  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.EMAIL_OPTOUT_SECRET) {
    return page(lang, COPY.ko.failTitle, COPY.ko.failBody, 500)
  }
  if (!email || !(await verifyScoped(env.EMAIL_OPTOUT_SECRET, SCOPE, email, t))) {
    return page(lang, COPY.ko.failTitle, COPY.ko.failBody, 400)
  }

  try {
    const existing = await findRow(env, email)
    // 행이 없어도 서명이 맞으면 본인이다 — 확정 상태로 새로 만든다(표를 비운 뒤에도 링크가 산다).
    lang = langOf(existing?.locale)
    const now = new Date().toISOString()

    const res = existing
      ? await sb(env)(`email_subscriber?email=eq.${encodeURIComponent(email)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ confirmed_at: existing.confirmed_at ?? now }),
        })
      : await sb(env)('email_subscriber', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({ email, locale: lang, confirmed_at: now, created_at: now }),
        })
    if (!res.ok && res.status !== 409) throw new Error(`confirm ${res.status}`)

    // 예전에 수신거부했던 주소가 다시 구독하는 경우. 이 행을 안 지우면 발송기가
    // 매번 빼버려서 확인을 눌러도 영영 안 간다.
    const un = await sb(env)(`email_optout?email=eq.${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    })
    if (!un.ok) console.error('[subscribe] optout delete', un.status)

    return page(lang, COPY[lang].doneTitle, COPY[lang].doneBody)
  } catch (e) {
    console.error('[subscribe/confirm]', e instanceof Error ? e.message : String(e))
    return page(lang, COPY[lang].failTitle, COPY[lang].failBody, 500)
  }
}
