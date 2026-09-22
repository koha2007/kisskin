// 이메일 구독 신청 + 확인 (더블 옵트인) + **결과 메일**.
//
//   POST /api/subscribe            { email, locale?, source?, result? }
//        result 없음 → 확인 메일(기존)
//        result 있음 → **방금 나온 진단 결과**를 담은 메일. 미확인 주소면 같은 메일 안에
//                      구독 확인 버튼이 함께 들어간다(메일 두 통을 보내지 않는다).
//   GET  /api/subscribe?e=&t=      확인 링크 클릭 → 구독 확정(HTML 페이지)
//
// 왜 결과 메일인가(2026-09-22): 진단 결과 화면의 이메일 수집률은 완료자의 35~45% 인데,
// 그 수치는 거의 전부 **"결과를 보내드릴게요"** 라는 교환 조건에서 나온다. 사람은 레터를
// 받으려고 주소를 주지 않고, 방금 나온 자기 결과를 남기려고 준다. 우리는 그 기능이 없어서
// 폼 문구를 "이 결과에 이어지는 주간 소식" 까지로 낮춰 두고 있었다.
//
// ⚠ 첨부파일은 받지 않는다. 결과 카드 PNG 를 클라이언트에서 만들어 올리면 "우리 도메인으로
//   임의의 바이트를 임의의 주소에 보내는 창구" 가 된다(도메인 평판이 걸린 문제다).
//   메일에는 우리가 가진 공개 이미지 경로와 **검증한 텍스트만** 싣고, 카드 저장은
//   결과 페이지 버튼으로 보낸다.
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

import { SITE, optoutUrl, signScoped, verifyScoped, withUtm } from './_digestMail'

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
    // 결과 메일
    resultSubject: (n: string) => `${n} — 진단 결과를 보내드려요`,
    resultPreheader: '방금 나온 결과를 한 통으로 정리했어요. 언제든 다시 열어볼 수 있습니다.',
    resultCta: '결과 페이지 열기',
    resultCtaSub: '결과 카드 이미지 저장·공유도 이 페이지에서 할 수 있어요.',
    resultLetterTitle: '주간 레터도 받아보시겠어요?',
    resultLetterBody:
      '아래 버튼을 한 번 누르면 매주 화요일 아침, 지난 한 주의 K-뷰티 신제품과 뉴스를 한 통으로 정리해 보내드립니다. 누르기 전에는 아무것도 보내지 않습니다.',
    unsub: '수신거부',
    aiNote: '메일 속 이미지는 AI 로 생성한 것입니다.',
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
    // Result email
    resultSubject: (n: string) => `${n} — here is your result`,
    resultPreheader: 'Your result in one email. Open it again any time.',
    resultCta: 'Open my result',
    resultCtaSub: 'Save or share the result card from that page.',
    resultLetterTitle: 'Want the weekly letter too?',
    resultLetterBody:
      'Tap once below and every Tuesday morning we will send you one email with the past week in K-beauty. We send nothing until you tap it.',
    unsub: 'Unsubscribe',
    aiNote: 'The image in this email was generated with AI.',
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

// ── 결과 페이로드 ──────────────────────────────────────────────────
// 클라이언트가 보내는 값이므로 **전부 못 믿는다**. 길이·개수·형식을 여기서 깎고,
// 링크는 우리 도메인 안쪽만, 이미지는 우리 정적 경로만 통과시킨다.
// (이 메일은 우리 도메인에서 나가므로, 검증을 느슨하게 하면 피싱 메일 발송기가 된다.)
export interface ResultMailInput {
  tool: string
  code: string
  label: string
  name: string
  tagline: string
  emoji: string
  path: string
  image?: string
  facts?: string[]
  swatches?: { label: string; hex: string }[]
  bars?: { left: string; right: string; value: number }[]
}

const clamp = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
const HEX_RE = /^#[0-9a-f]{6}$/i
const SLUG_RE = /^[a-z0-9-]{1,24}$/
/** 우리 사이트 안쪽 경로만. `//evil.com` 같은 스킴 상대 URL 을 막는다. */
const PATH_RE = /^\/(en\/)?tools\/[a-z0-9/-]{1,80}\/$/
const IMG_RE = /^\/[a-z0-9/_-]{1,80}\.(webp|png|jpg|jpeg)$/i

export function sanitizeResult(raw: unknown): ResultMailInput | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const tool = clamp(r.tool, 24).toLowerCase()
  const code = clamp(r.code, 24).toLowerCase()
  const name = clamp(r.name, 60)
  const path = clamp(r.path, 120)
  if (!SLUG_RE.test(tool) || !code || !name || !PATH_RE.test(path)) return null

  const facts = Array.isArray(r.facts)
    ? r.facts.slice(0, 5).map((f) => clamp(f, 120)).filter(Boolean)
    : []
  const swatches = Array.isArray(r.swatches)
    ? r.swatches
        .slice(0, 8)
        .map((x) => (x && typeof x === 'object' ? (x as Record<string, unknown>) : {}))
        .filter((x) => HEX_RE.test(String(x.hex ?? '')))
        .map((x) => ({ label: clamp(x.label, 20), hex: String(x.hex).toLowerCase() }))
    : []
  const bars = Array.isArray(r.bars)
    ? r.bars
        .slice(0, 4)
        .map((x) => (x && typeof x === 'object' ? (x as Record<string, unknown>) : {}))
        .map((x) => ({
          left: clamp(x.left, 20),
          right: clamp(x.right, 20),
          value: Math.max(0, Math.min(100, Math.round(Number(x.value) || 0))),
        }))
        .filter((x) => x.left && x.right)
    : []

  const image = clamp(r.image, 120)
  return {
    tool,
    code,
    label: clamp(r.label, 24),
    name,
    tagline: clamp(r.tagline, 160),
    emoji: clamp(r.emoji, 8),
    path,
    image: IMG_RE.test(image) ? image : undefined,
    facts,
    swatches,
    bars,
  }
}

// 결과 메일. 조판은 확인 메일·다이제스트와 같은 흰 카드 — 같은 발신인으로 읽히게.
// `confirmHref` 가 있으면(=아직 미확인 주소) 결과 아래에 구독 확인 버튼을 함께 싣는다.
export function resultMail(
  lang: Lang,
  r: ResultMailInput,
  confirmHref: string | null,
  unsubHref: string | null,
): { subject: string; html: string } {
  const t = COPY[lang]
  const F = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif`
  const url = withUtm(`${SITE}${r.path}`, 'result_mail', r.tool)
  const title = `${r.emoji ? `${esc(r.emoji)} ` : ''}${esc(r.name)}`

  const swWidth = r.swatches!.length ? Math.floor(100 / r.swatches!.length) : 0
  const evidence = r.swatches!.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding-bottom:22px;"><tr>${r.swatches!
        .map(
          (sw) =>
            // 폭을 고정하지 않으면 칸이 라벨 글자 수를 따라가 색면이 들쭉날쭉해진다.
            `<td align="center" width="${swWidth}%" style="padding:0 4px;"><div style="height:56px;background:${sw.hex};border-radius:8px;"></div>` +
            `<div style="font:600 11px/1.4 ${F};color:#888;padding-top:6px;">${esc(sw.label)}</div></td>`,
        )
        .join('')}</tr></table>`
    : r.bars!.length
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding-bottom:22px;">${r.bars!
          .map(
            (b) =>
              `<tr><td style="padding-bottom:10px;">` +
              `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>` +
              `<td style="font:600 11px/1.4 ${F};color:#888;">${esc(b.left)}</td>` +
              `<td align="right" style="font:600 11px/1.4 ${F};color:#888;">${esc(b.right)}</td></tr></table>` +
              `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;background:#eceaf0;border-radius:3px;"><tr>` +
              `<td width="${b.value}%" style="height:6px;background:#232a52;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>` +
              `<td style="font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>`,
          )
          .join('')}</table>`
      : r.facts!.length
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding-bottom:22px;">${r.facts!
            .map(
              (f, i) =>
                `<tr><td width="28" valign="top" style="font:700 12px/1.7 ${F};color:#c2185b;">0${i + 1}</td>` +
                `<td style="font:400 14px/1.7 ${F};color:#444;">${esc(f)}</td></tr>`,
            )
            .join('')}</table>`
        : ''

  // 무드컷은 4:5 다. 폭을 카드 전체로 주면 600px 을 먹어 정작 눌러야 할 버튼이 한참
  // 밀린다(메일에서 이건 그대로 전환 손실이다). 320px = 400px 높이로 묶는다.
  const photo = r.image
    ? `<tr><td style="padding-bottom:22px;"><img src="${SITE}${esc(r.image)}" width="320" alt="${esc(r.name)}" style="width:100%;max-width:320px;border-radius:12px;display:block;"/></td></tr>`
    : ''

  const letterBlock = confirmHref
    ? `<tr><td style="border-top:1px solid #eee;padding-top:22px;">
        <div style="font:700 15px/1.45 ${F};color:#111;padding-bottom:8px;">${esc(t.resultLetterTitle)}</div>
        <div style="font:400 13px/1.65 ${F};color:#666;padding-bottom:16px;">${esc(t.resultLetterBody)}</div>
        <a href="${esc(confirmHref)}" style="display:inline-block;font:700 14px/1 ${F};color:#fff;background:#111;text-decoration:none;padding:13px 24px;border-radius:10px;">${esc(t.button)}</a>
      </td></tr>`
    : ''

  // 🚨 무드컷 중 얼굴형·MBTI 는 AI 로 생성한 인물 사진이다. 사이트에는 고지를 달아 두었으므로
  // 같은 이미지를 메일로 내보낼 때도 달아야 한다(EU AI Act, 2026-08-02 시행).
  const aiNote = r.image
    ? `<div style="font:400 11px/1.6 ${F};color:#bbb;padding-top:10px;">${esc(t.aiNote)}</div>`
    : ''

  const foot = unsubHref
    ? `<div style="font:400 12px/1.6 ${F};color:#aaa;padding-top:18px;">kissinskin.net · <a href="${esc(unsubHref)}" style="color:#aaa;">${esc(t.unsub)}</a></div>`
    : `<div style="font:400 12px/1.6 ${F};color:#aaa;padding-top:18px;">kissinskin.net</div>`

  return {
    subject: t.resultSubject(r.name),
    html: `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f4f2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(t.resultPreheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f2;padding:32px 16px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:536px;background:#fff;border-radius:16px;padding:36px 28px;">
    <tr><td style="font:700 11px/1.4 ${F};color:#c2185b;letter-spacing:.12em;padding-bottom:8px;">${esc(r.label)}</td></tr>
    <tr><td style="font:700 26px/1.3 ${F};color:#111;padding-bottom:8px;">${title}</td></tr>
    <tr><td style="font:400 15px/1.65 ${F};color:#555;padding-bottom:22px;">${esc(r.tagline)}</td></tr>
    ${photo}
    <tr><td>${evidence}</td></tr>
    <tr><td style="padding-bottom:${confirmHref ? '24px' : '4px'};">
      <a href="${esc(url)}" style="display:inline-block;font:700 15px/1 ${F};color:#fff;background:#c2185b;text-decoration:none;padding:15px 28px;border-radius:10px;">${esc(t.resultCta)}</a>
      <div style="font:400 12px/1.6 ${F};color:#999;padding-top:10px;">${esc(t.resultCtaSub)}</div>
    </td></tr>
    ${letterBlock}
    <tr><td>${aiNote}</td></tr>
  </table>
  ${foot}
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

  let body: { email?: unknown; locale?: unknown; source?: unknown; result?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: 'bad_request' }, 400)
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const lang = langOf(body.locale)
  const source = String(body.source ?? '').slice(0, 60) || null
  const result = sanitizeResult(body.result)

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ error: 'invalid_email' }, 400)
  }
  // 결과를 보내달라고 했는데 페이로드가 검증을 통과하지 못했다면, 조용히 확인 메일로
  // 떨어뜨리지 않는다 — 화면은 "결과를 보내드릴게요" 라고 말했으므로 그건 거짓이 된다.
  if (body.result !== undefined && !result) return json({ error: 'bad_result' }, 400)

  try {
    const existing = await findRow(env, email)
    const confirmed = !!existing?.confirmed_at

    // 이미 확정된 사람에게 또 확인 메일을 보내지 않는다. 화면에는 "이미 구독 중" 으로 답한다.
    // 단 **결과 메일은 보낸다** — 지난주에 구독한 사람이 오늘 새 진단을 했다면 그건
    // 마케팅 메일이 아니라 본인이 방금 요청한 1회성 메일이다.
    if (confirmed && !result) return json({ status: 'already' })

    // 쿨다운. `confirm_sent_at` 은 이제 "이 주소로 우리가 마지막으로 보낸 시각" 으로 읽는다
    // (확인 메일이든 결과 메일이든). 같은 주소로 연달아 눌러도 한 통만 나간다.
    if (existing?.confirm_sent_at) {
      const age = Date.now() - new Date(existing.confirm_sent_at).getTime()
      // 방금 보냈다 — 또 보내지 않고 "메일함을 보라" 고만 답한다.
      if (age >= 0 && age < RESEND_COOLDOWN_MS) return json({ status: 'recent' })
    }

    const now = new Date().toISOString()
    // 확정된 주소의 locale/source 는 덮어쓰지 않는다 — 구독을 만든 화면이 무엇이었는지가
    // 유일한 출처 근거인데, 결과 메일 한 번에 지워지면 안 된다.
    const patch = confirmed
      ? { confirm_sent_at: now }
      : { locale: lang, source, confirm_sent_at: now }
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
    const { subject, html } = result
      ? resultMail(
          lang,
          result,
          // 미확인 주소에만 구독 확인 버튼을 함께 싣는다(메일 두 통을 보내지 않는다).
          confirmed ? null : href,
          confirmed ? await optoutUrl(env.EMAIL_OPTOUT_SECRET, email) : null,
        )
      : confirmMail(lang, href)

    const mail = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject,
        html,
        // 태그로 갈라야 "어느 진단이 구독자를 만드는가" 를 Resend 쪽에서도 볼 수 있다.
        tags: result
          ? [
              { name: 'campaign', value: 'result_mail' },
              { name: 'lang', value: lang },
              { name: 'tool', value: result.tool },
            ]
          : [{ name: 'campaign', value: 'subscribe_confirm' }, { name: 'lang', value: lang }],
      }),
    })
    if (!mail.ok) {
      console.error('[subscribe] resend', mail.status, (await mail.text()).slice(0, 200))
      return json({ error: 'mail_failed' }, 502)
    }

    // pending = 확인 버튼을 눌러야 구독 성립 / sent = 이미 구독 중인 사람에게 결과만 보냄.
    return json({ status: confirmed ? 'sent' : 'pending' })
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
