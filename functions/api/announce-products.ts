// 주간 제품 다이제스트 발송기.
//
// .github/workflows/weekly-digest.yml 이 매주 일요일 호출한다. 워크플로가
// 지난 7일치 제품을 src/lib/products/items.ts(.en.ts)에서 뽑아 본문에 실어
// POST 하면, 이 함수가 회원(Supabase auth.users) 전원에게 메일을 보낸다.
//
//   POST /api/announce-products
//   Authorization: Bearer <ANNOUNCE_TOKEN>
//   { "products": [DigestItem...], "productsEn": [DigestItem...], "dryRun": false }
//
// dryRun=true 면 발송 없이 수신자 목록/수만 돌려준다 — 첫 발송 전 눈으로 확인용.
//
// 제외: 운영자·테스트 계정(아래 상수) + DIGEST_EXCLUDE_EMAILS(env, 콤마) +
//       public.email_optout(수신거부) + 이메일 미인증 계정.
//
// 필요한 Cloudflare 환경변수(대시보드 → Settings → Environment variables):
//   ANNOUNCE_TOKEN          이 엔드포인트 호출용 공유 토큰 (GitHub Actions 시크릿과 동일값)
//   EMAIL_OPTOUT_SECRET     수신거부 링크 HMAC 서명 키
//   RESEND_API_KEY          (이미 있음) send-report.ts 와 공용
//   SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_URL   (이미 있음) delete-account.ts 와 공용

import { SITE, optoutUrl, renderDigest, type DigestItem } from './_digestMail'

interface Env {
  VITE_SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  RESEND_API_KEY?: string
  ANNOUNCE_TOKEN?: string
  EMAIL_OPTOUT_SECRET?: string
  DIGEST_EXCLUDE_EMAILS?: string
}

// 운영자·테스트 계정. 회원 대시보드에서 확인한 것들 — 새로 생기면 여기에 추가하거나
// Cloudflare 의 DIGEST_EXCLUDE_EMAILS 에 콤마로 넣는다.
const HARD_EXCLUDE = new Set(
  [
    'koha2007@naver.com',
    'koha3d77@gmail.com',
    'sigeomyong0306@gmail.com', // 표시이름 "시험용"
    'audit-signup-29551@gmail.com',
    'dangni81@naver.com',
    'dsngni81@naver.com',
  ].map((e) => e.toLowerCase()),
)

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

interface AuthUser {
  email?: string
  email_confirmed_at?: string | null
  user_metadata?: Record<string, unknown> | null
}

async function listAllUsers(supabaseUrl: string, key: string): Promise<AuthUser[]> {
  const out: AuthUser[] = []
  const perPage = 200
  for (let page = 1; page <= 50; page++) {
    const res = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      { headers: { Authorization: `Bearer ${key}`, apikey: key } },
    )
    if (!res.ok) throw new Error(`admin/users ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const body = (await res.json()) as { users?: AuthUser[] }
    const batch = body.users ?? []
    out.push(...batch)
    if (batch.length < perPage) break
  }
  return out
}

async function fetchOptouts(supabaseUrl: string, key: string): Promise<Set<string>> {
  const res = await fetch(`${supabaseUrl}/rest/v1/email_optout?select=email`, {
    headers: { Authorization: `Bearer ${key}`, apikey: key },
  })
  if (!res.ok) throw new Error(`email_optout ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const rows = (await res.json()) as { email: string }[]
  return new Set(rows.map((r) => r.email.toLowerCase()))
}

function localeOf(u: AuthUser): 'ko' | 'en' {
  const loc = String(u.user_metadata?.locale ?? u.user_metadata?.lang ?? '').toLowerCase()
  if (loc.startsWith('ko')) return 'ko'
  if (loc.startsWith('en')) return 'en'
  return 'ko' // 기본: 주 사용자층이 한국
}

function normItems(raw: unknown, enFeed: boolean): DigestItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((r): DigestItem | null => {
      const o = r as Record<string, unknown>
      const slug = typeof o.slug === 'string' ? o.slug : ''
      if (!slug) return null
      return {
        slug,
        brand: String(o.brand ?? ''),
        name: String(o.name ?? ''),
        summary: String(o.summary ?? ''),
        image: typeof o.image === 'string' ? o.image : undefined,
        category: typeof o.category === 'string' ? o.category : undefined,
        url:
          typeof o.url === 'string'
            ? o.url
            : `${SITE}${enFeed ? '/en' : ''}/products/${slug}/`,
      }
    })
    .filter((x): x is DigestItem => x !== null)
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context
  const { VITE_SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: srk } = env

  if (!supabaseUrl || !srk || !env.RESEND_API_KEY || !env.ANNOUNCE_TOKEN || !env.EMAIL_OPTOUT_SECRET) {
    return json({ error: 'Server configuration missing' }, 500)
  }

  const auth = request.headers.get('Authorization') || ''
  if (auth !== `Bearer ${env.ANNOUNCE_TOKEN}`) {
    return json({ error: 'Unauthorized' }, 401)
  }

  let body: { products?: unknown; productsEn?: unknown; dryRun?: boolean }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const itemsKo = normItems(body.products, false)
  const itemsEn = normItems(body.productsEn, true)
  if (itemsKo.length === 0 && itemsEn.length === 0) {
    return json({ skipped: true, reason: 'no products in payload' })
  }
  const dryRun = body.dryRun === true

  // ── 수신자 확정 ────────────────────────────────────────────────
  let users: AuthUser[]
  let optouts: Set<string>
  try {
    ;[users, optouts] = await Promise.all([
      listAllUsers(supabaseUrl, srk),
      fetchOptouts(supabaseUrl, srk),
    ])
  } catch (e) {
    return json({ error: `Supabase error: ${e instanceof Error ? e.message : String(e)}` }, 502)
  }

  const envExclude = new Set(
    (env.DIGEST_EXCLUDE_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  )

  const seen = new Set<string>()
  const recipients: { email: string; lang: 'ko' | 'en' }[] = []
  for (const u of users) {
    const email = (u.email || '').trim().toLowerCase()
    if (!email || !u.email_confirmed_at) continue
    if (HARD_EXCLUDE.has(email) || envExclude.has(email) || optouts.has(email)) continue
    if (seen.has(email)) continue
    seen.add(email)
    recipients.push({ email, lang: localeOf(u) })
  }

  const byLang = {
    ko: recipients.filter((r) => r.lang === 'ko').length,
    en: recipients.filter((r) => r.lang === 'en').length,
  }
  const previewKo = renderDigest('ko', itemsKo.length ? itemsKo : itemsEn, `${SITE}/api/email-optout`)

  if (dryRun) {
    return json({
      dryRun: true,
      recipients: recipients.length,
      byLang,
      subject: previewKo.subject,
      productsKo: itemsKo.length,
      productsEn: itemsEn.length,
      emails: recipients.map((r) => r.email),
    })
  }

  // ── 발송 ──────────────────────────────────────────────────────
  // 수신자마다 수신거부 링크가 달라 개별 발송한다(Resend /emails). 규모가
  // 작아(수십 통) 배치가 필요 없고, 한 주소가 실패해도 나머지는 나간다.
  // 동시 5개로 제한해 Resend rate limit 을 건드리지 않는다.
  const FROM = 'kissinskin <report@kissinskin.net>'

  async function sendOne({ email, lang }: { email: string; lang: 'ko' | 'en' }): Promise<string | null> {
    const feed = lang === 'en' ? (itemsEn.length ? itemsEn : itemsKo) : (itemsKo.length ? itemsKo : itemsEn)
    const unsub = await optoutUrl(env.EMAIL_OPTOUT_SECRET!, email)
    const { subject, html } = renderDigest(lang, feed, unsub)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject,
        html,
        headers: {
          'List-Unsubscribe': `<${unsub}>, <mailto:report@kissinskin.net?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    })
    if (res.ok) return null
    return `${email}: ${res.status} ${(await res.text()).slice(0, 120)}`
  }

  let sent = 0
  const errors: string[] = []
  const CONCURRENCY = 5
  for (let i = 0; i < recipients.length; i += CONCURRENCY) {
    const results = await Promise.all(recipients.slice(i, i + CONCURRENCY).map(sendOne))
    for (const err of results) {
      if (err) errors.push(err)
      else sent++
    }
  }

  const failed = recipients.length - sent
  return json(
    { sent, failed, recipients: recipients.length, byLang, errors: errors.slice(0, 10) },
    failed && !sent ? 502 : 200,
  )
}
