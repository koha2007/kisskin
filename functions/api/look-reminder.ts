// "나머지 8룩 알림" — 신청/취소 + 다음 날 1통 발송 (2026-10-29)
// ────────────────────────────────────────────────────────────────────
// 왜: 무료 1룩 만든 21명 중 다음 날 재방문 0명(10/28). 결제 안내 메일은 광고성 정보라
//   주간 레터 동의로는 못 보낸다 → 결과 화면에서 따로 체크한 사람에게만, 평생 한 통.
//   표 설계·규칙은 supabase/migrations/0011_look_reminder.sql.
//
//   POST /api/look-reminder   Authorization: Bearer <Supabase 사용자 토큰>
//        { on: boolean, locale?: 'ko'|'en', style?: MakeupStyleId }
//        on=true  → 신청(이미 한 통 받았으면 그대로 둔다) · on=false → 미발송 신청 삭제
//        🔒 받는 주소는 클라이언트가 정하지 않는다 — 토큰으로 확인한 계정 이메일만.
//
//   POST /api/look-reminder   Authorization: Bearer <ANNOUNCE_TOKEN>   { send: true, dryRun?: boolean }
//        .github/workflows/look-reminder.yml 이 매시간 호출. 때가 된 신청을 보내거나 건너뛴다
//        (그사이 크레딧 구매 → 'purchased', 수신거부 → 'optout').
//
// 환경변수는 전부 이미 있는 것들: VITE_SUPABASE_URL · SUPABASE_SERVICE_ROLE_KEY · RESEND_API_KEY ·
//   EMAIL_OPTOUT_SECRET · ANNOUNCE_TOKEN(주간 다이제스트와 공용)

import { SITE, ADDRESS, optoutUrl, withUtm } from './_digestMail'
import { MAKEUP_STYLES, type MakeupStyleId } from '../../src/lib/makeup/styles'
import { lookImage } from '../../src/lib/makeup/lookImages'
import { LOOK_REMINDER_CONSENT, LOOK_REMINDER_DELAY_HOURS } from '../../src/lib/makeup/lookReminder'

interface Env {
  VITE_SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  RESEND_API_KEY?: string
  EMAIL_OPTOUT_SECRET?: string
  ANNOUNCE_TOKEN?: string
}

interface Row {
  user_id: string
  email: string
  locale: 'ko' | 'en'
  style_id: string | null
  created_at: string
}

const FROM = 'kissinskin <report@kissinskin.net>'
const CAMPAIGN = 'look_reminder'
/** 한 번 호출에 처리할 최대 건수 — 매시간 돌므로 밀려도 다음 회차가 이어 받는다. */
const BATCH = 40

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function verifyUser(env: Env, token: string): Promise<{ id: string; email: string } | null> {
  try {
    const res = await fetch(`${env.VITE_SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY! },
    })
    if (!res.ok) return null
    const u = (await res.json()) as { id?: string; email?: string }
    return u.id && u.email ? { id: u.id, email: u.email } : null
  } catch {
    return null
  }
}

function db(env: Env) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY!
  const base = `${env.VITE_SUPABASE_URL}/rest/v1`
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
  return { base, headers }
}

// ── 신청/취소 ──────────────────────────────────────────────────────
async function toggle(env: Env, token: string, body: { on?: boolean; locale?: string; style?: string }) {
  const user = await verifyUser(env, token)
  if (!user) return json({ error: 'login_required' }, 401)
  const { base, headers } = db(env)

  if (!body.on) {
    const res = await fetch(`${base}/look_reminder?user_id=eq.${user.id}&sent_at=is.null`, { method: 'DELETE', headers })
    return res.ok ? json({ ok: true, on: false }) : json({ error: 'db_error' }, 500)
  }

  const locale = body.locale === 'en' ? 'en' : 'ko'
  const style = MAKEUP_STYLES.some((s) => s.id === body.style) ? body.style : null
  const now = Date.now()
  // 이미 행이 있으면(발송됐든 아니든) 건드리지 않는다 — 평생 한 통, 체크를 껐다 켜도 발송 시각이 밀리지 않게.
  const res = await fetch(`${base}/look_reminder?on_conflict=user_id`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify({
      user_id: user.id,
      email: user.email,
      locale,
      style_id: style,
      consent_text: LOOK_REMINDER_CONSENT[locale],
      created_at: new Date(now).toISOString(),
      send_after: new Date(now + LOOK_REMINDER_DELAY_HOURS * 3600_000).toISOString(),
    }),
  })
  return res.ok ? json({ ok: true, on: true }) : json({ error: 'db_error' }, 500)
}

// ── 메일 본문 ──────────────────────────────────────────────────────
function render(row: Row, unsub: string): { subject: string; html: string } {
  const ko = row.locale === 'ko'
  const rest = MAKEUP_STYLES.filter((s) => s.id !== row.style_id).slice(0, 8)
  const cta = withUtm(`${SITE}/analysis/?collection=new`, CAMPAIGN, 'cta')
  // 한국 정보통신망법: 광고성 메일 제목 앞 "(광고)".
  const subject = ko ? '(광고) 나머지 8룩, 내 얼굴로 볼 차례예요' : 'Your other 8 looks are waiting'
  const font = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif`
  const cells = rest
    .map((s) => {
      const img = lookImage(s.id as MakeupStyleId)?.after
      return `<td width="25%" style="padding:3px;vertical-align:top;">
        <a href="${esc(cta)}" style="text-decoration:none;color:#111;">
          <img src="${esc(SITE + (img ?? ''))}" width="128" alt="" style="display:block;width:100%;height:auto;border-radius:8px;"/>
          <div style="font:700 10px/1.3 ${font};padding-top:4px;">${esc(ko ? s.nameKo : s.subEn)}</div>
        </a></td>`
    })
  const grid = [cells.slice(0, 4), cells.slice(4, 8)].map((r) => `<tr>${r.join('')}</tr>`).join('')

  const html = `<!doctype html>
<html lang="${row.locale}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(subject)}</title></head>
<body style="margin:0;background:#f5f4f2;">
  <span style="display:none!important;opacity:0;color:#f5f4f2;">${ko ? '어제 1룩을 만드셨죠. 같은 셀카로 나머지 8룩을 한 번에 볼 수 있어요.' : 'You made 1 look yesterday. See the other 8 on your face in one go.'}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f2;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;padding:32px;">
        <tr><td style="font:800 12px/1 ${font};letter-spacing:.14em;color:#eb4763;padding-bottom:10px;">${ko ? '9룩 중 1룩 완성' : '1 OF 9 DONE'}</td></tr>
        <tr><td style="font:700 22px/1.3 ${font};color:#111;padding-bottom:8px;">${ko ? '나머지 8룩도 내 얼굴로 볼까요?' : 'Now see the other 8 on your face.'}</td></tr>
        <tr><td style="font:400 14px/1.6 ${font};color:#555;padding-bottom:20px;">${ko
          ? '어제 만든 1룩 다음은 이 8가지예요. 셀카를 한 번 올리면 9룩을 한꺼번에 만들고, 모아보기 이미지 1장도 같이 드려요.'
          : 'These are the 8 you haven’t tried yet. Upload one selfie and we make all 9 at once, plus a grid image to post.'}</td></tr>
        <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${grid}</table></td></tr>
        <tr><td align="center" style="padding:24px 0 6px;">
          <a href="${esc(cta)}" style="display:inline-block;background:#eb4763;color:#fff;font:700 15px/1 ${font};padding:15px 28px;border-radius:999px;text-decoration:none;">${ko ? '9룩 전부 만들기 · $4.99' : 'Get all 9 looks · $4.99'}</a>
        </td></tr>
        <tr><td align="center" style="font:400 12px/1.6 ${font};color:#888;padding-bottom:24px;">${ko ? '1회 결제 · 구독 아님 · 14일 이내 환불 요청 가능' : 'One-time payment · not a subscription · refund requests within 14 days'}</td></tr>
        <tr><td style="border-top:1px solid #eee;padding-top:20px;font:400 12px/1.6 ${font};color:#999;">
          <a href="${esc(withUtm(SITE + '/', CAMPAIGN, 'footer'))}" style="color:#999;">kissinskin.net</a>
          ${ko ? `<br/>${esc(ADDRESS)}` : ''}
          <br/>${ko ? '문의' : 'Contact'}: <a href="mailto:support@kissinskin.net" style="color:#999;">support@kissinskin.net</a>
          <br/>${ko
            ? 'AI 메이크업 결과 화면에서 "나머지 8룩 알림 받기"에 동의하신 분께 한 번만 보내는 광고성 정보입니다. 이 알림은 다시 보내지 않습니다.'
            : 'You asked for this one-time reminder on your AI makeup result. We won’t send it again.'}
          <br/>${ko ? '메일 속 이미지는 AI 로 만든 예시입니다.' : 'Images are AI-generated examples.'}
          <br/><br/>${ko ? '앞으로 kissinskin 메일을 받지 않으려면 ' : 'To stop all kissinskin emails, '}<a href="${esc(unsub)}" style="color:#999;text-decoration:underline;">${ko ? '수신거부' : 'unsubscribe'}</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
  return { subject, html }
}

// ── 발송 ──────────────────────────────────────────────────────────
async function purchasedSince(env: Env, row: Row): Promise<boolean> {
  const { base, headers } = db(env)
  const res = await fetch(
    `${base}/credit_transactions?user_id=eq.${row.user_id}&type=eq.charge&created_at=gt.${encodeURIComponent(row.created_at)}` +
      `&or=(ref.is.null,ref.not.like.referral:*)&select=id&limit=1`,
    { headers },
  )
  if (!res.ok) throw new Error(`credit_transactions ${res.status}`)
  return ((await res.json()) as unknown[]).length > 0
}

async function optedOut(env: Env, email: string): Promise<boolean> {
  const { base, headers } = db(env)
  const res = await fetch(`${base}/email_optout?email=eq.${encodeURIComponent(email.toLowerCase())}&select=email&limit=1`, { headers })
  if (!res.ok) throw new Error(`email_optout ${res.status}`)
  return ((await res.json()) as unknown[]).length > 0
}

async function mark(env: Env, userId: string, skipped: string | null) {
  const { base, headers } = db(env)
  await fetch(`${base}/look_reminder?user_id=eq.${userId}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ sent_at: new Date().toISOString(), skipped }),
  })
}

async function sendDue(env: Env, dryRun: boolean) {
  const { base, headers } = db(env)
  const res = await fetch(
    `${base}/look_reminder?sent_at=is.null&send_after=lte.${encodeURIComponent(new Date().toISOString())}` +
      `&select=user_id,email,locale,style_id,created_at&order=send_after.asc&limit=${BATCH}`,
    { headers },
  )
  // 0011 SQL 실행 전(표 없음 = PostgREST 404)엔 조용히 0건 — 매시간 워크플로가 빨갛게 쌓이지 않게.
  if (res.status === 404) return json({ due: 0, note: 'table_missing' })
  if (!res.ok) return json({ error: `look_reminder ${res.status}` }, 500)
  const rows = (await res.json()) as Row[]
  const out = { due: rows.length, sent: 0, purchased: 0, optout: 0, failed: 0, dryRun }

  for (const row of rows) {
    if (await purchasedSince(env, row)) { out.purchased++; if (!dryRun) await mark(env, row.user_id, 'purchased'); continue }
    if (await optedOut(env, row.email)) { out.optout++; if (!dryRun) await mark(env, row.user_id, 'optout'); continue }
    if (dryRun) { out.sent++; continue }

    const unsub = await optoutUrl(env.EMAIL_OPTOUT_SECRET!, row.email)
    const { subject, html } = render(row, unsub)
    const mail = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [row.email],
        subject,
        html,
        tags: [{ name: 'campaign', value: CAMPAIGN }, { name: 'lang', value: row.locale }],
        headers: {
          'List-Unsubscribe': `<${unsub}>, <mailto:report@kissinskin.net?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    })
    // 실패는 표시하지 않고 남겨 둔다 → 다음 시간 회차가 다시 시도.
    if (mail.ok) { out.sent++; await mark(env, row.user_id, null) } else out.failed++
  }
  return json(out)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'not_configured' }, 503)
  const auth = request.headers.get('Authorization') || ''
  if (!auth.startsWith('Bearer ')) return json({ error: 'login_required' }, 401)
  const body = (await request.json().catch(() => ({}))) as { on?: boolean; locale?: string; style?: string; send?: boolean; dryRun?: boolean }

  if (body.send) {
    if (!env.ANNOUNCE_TOKEN || auth !== `Bearer ${env.ANNOUNCE_TOKEN}`) return json({ error: 'forbidden' }, 403)
    if (!env.RESEND_API_KEY || !env.EMAIL_OPTOUT_SECRET) return json({ error: 'not_configured' }, 503)
    return sendDue(env, !!body.dryRun)
  }
  return toggle(env, auth.slice(7), body)
}
