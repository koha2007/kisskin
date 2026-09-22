// 주간 다이제스트 발송기 (제품 + 뉴스).
//
// .github/workflows/weekly-digest.yml 이 매주 일요일 호출한다. 워크플로가
// 지난 7일치 제품·뉴스를 src/lib/{products,news}/items.ts(.en.ts)에서 뽑아
// 본문에 실어 POST 하면, 이 함수가 아래 두 명단에 메일을 보낸다.
//
//   ① 회원 (Supabase auth.users, 이메일 인증 완료)
//   ② 이메일 구독자 (public.email_subscriber 중 confirmed_at 이 채워진 사람) — 2026-09-22 추가.
//      가입까지 가지 않는 대다수를 담는 낮은 문턱이다. functions/api/subscribe.ts 가 기록한다.
//   두 명단은 이메일로 합집합 처리한다(회원이면서 구독 신청도 한 경우 한 통만).
//
// 2026-09-19: 발행이 주 1회(뉴스 1 + 제품 1)로 내려가면서 제품만으론 메일이
// 얇아져 뉴스 섹션을 같이 싣는다. 라우트는 kind 로 갈린다(/products/ vs /news/).
//
//   POST /api/announce-products
//   Authorization: Bearer <ANNOUNCE_TOKEN>
//   { "products": [...], "productsEn": [...], "news": [...], "newsEn": [...], "dryRun": false }
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

import { SITE, optoutUrl, renderDigest, campaignId, type DigestItem, type DigestSections } from './_digestMail'

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

/**
 * 확인을 마친 이메일 구독자. 표가 아직 없으면(마이그레이션 0007 미실행) 빈 배열을 돌려주고
 * 발송은 회원 대상으로 그대로 진행한다 — 구독 기능 때문에 주간 발송 전체가 멎으면 안 된다.
 */
async function fetchSubscribers(
  supabaseUrl: string,
  key: string,
): Promise<{ email: string; locale: string }[]> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/email_subscriber?confirmed_at=not.is.null&select=email,locale`,
    { headers: { Authorization: `Bearer ${key}`, apikey: key } },
  )
  if (!res.ok) {
    console.error('[announce] email_subscriber', res.status, (await res.text()).slice(0, 200))
    return []
  }
  return (await res.json()) as { email: string; locale: string }[]
}

function localeOf(u: AuthUser): 'ko' | 'en' {
  const loc = String(u.user_metadata?.locale ?? u.user_metadata?.lang ?? '').toLowerCase()
  if (loc.startsWith('ko')) return 'ko'
  if (loc.startsWith('en')) return 'en'
  return 'ko' // 기본: 주 사용자층이 한국
}

function normItems(raw: unknown, enFeed: boolean, kind: 'products' | 'news' = 'products'): DigestItem[] {
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
            : `${SITE}${enFeed ? '/en' : ''}/${kind}/${slug}/`,
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

  let body: {
    products?: unknown
    productsEn?: unknown
    news?: unknown
    newsEn?: unknown
    dryRun?: boolean
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  // 언어별 2개 섹션(제품·뉴스). 한 언어의 섹션이 통째로 비면 다른 언어 것으로 대체한다
  // (번역이 아직 안 붙은 주에도 빈 메일이 나가지 않게).
  const koSections = { products: normItems(body.products, false), news: normItems(body.news, false, 'news') }
  const enSections = { products: normItems(body.productsEn, true), news: normItems(body.newsEn, true, 'news') }
  const count = (s: DigestSections) => s.products.length + s.news.length
  if (count(koSections) === 0 && count(enSections) === 0) {
    return json({ skipped: true, reason: 'no products or news in payload' })
  }
  const sectionsFor = (lang: 'ko' | 'en'): DigestSections => {
    const [own, other] = lang === 'en' ? [enSections, koSections] : [koSections, enSections]
    return {
      products: own.products.length ? own.products : other.products,
      news: own.news.length ? own.news : other.news,
    }
  }
  const dryRun = body.dryRun === true
  // 발송 1회를 식별하는 id — 회차별 열람·유입 비교의 기준. 한 번만 만들어 전원에게 같은 값을 쓴다
  // (발송이 자정을 걸쳐도 한 회차가 둘로 쪼개지지 않게).
  const campaign = campaignId()

  // ── 수신자 확정 ────────────────────────────────────────────────
  let users: AuthUser[]
  let optouts: Set<string>
  let subscribers: { email: string; locale: string }[]
  try {
    ;[users, optouts, subscribers] = await Promise.all([
      listAllUsers(supabaseUrl, srk),
      fetchOptouts(supabaseUrl, srk),
      fetchSubscribers(supabaseUrl, srk),
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
  const recipients: { email: string; lang: 'ko' | 'en'; kind: 'member' | 'subscriber' }[] = []
  const add = (email: string, lang: 'ko' | 'en', kind: 'member' | 'subscriber') => {
    if (!email) return
    if (HARD_EXCLUDE.has(email) || envExclude.has(email) || optouts.has(email)) return
    if (seen.has(email)) return
    seen.add(email)
    recipients.push({ email, lang, kind })
  }

  // 회원이 먼저다 — 같은 주소가 양쪽에 있으면 회원 쪽 언어 설정을 따른다.
  for (const u of users) {
    const email = (u.email || '').trim().toLowerCase()
    if (!u.email_confirmed_at) continue
    add(email, localeOf(u), 'member')
  }
  for (const sub of subscribers) {
    const lang = String(sub.locale || '').toLowerCase().startsWith('en') ? 'en' : 'ko'
    add((sub.email || '').trim().toLowerCase(), lang, 'subscriber')
  }

  const byLang = {
    ko: recipients.filter((r) => r.lang === 'ko').length,
    en: recipients.filter((r) => r.lang === 'en').length,
  }
  // 구독 입구가 실제로 사람을 데려오는지 회차마다 로그로 남는다.
  const byKind = {
    member: recipients.filter((r) => r.kind === 'member').length,
    subscriber: recipients.filter((r) => r.kind === 'subscriber').length,
  }
  const previewKo = renderDigest('ko', sectionsFor('ko'), `${SITE}/api/email-optout`, campaign)

  if (dryRun) {
    return json({
      dryRun: true,
      campaign,
      recipients: recipients.length,
      byLang,
      byKind,
      subject: previewKo.subject,
      productsKo: koSections.products.length,
      productsEn: enSections.products.length,
      newsKo: koSections.news.length,
      newsEn: enSections.news.length,
      emails: recipients.map((r) => r.email),
    })
  }

  // ── 발송 ──────────────────────────────────────────────────────
  // 수신자마다 수신거부 링크가 달라 개별 발송한다(Resend /emails). 규모가
  // 작아(수십 통) 배치가 필요 없고, 한 주소가 실패해도 나머지는 나간다.
  //
  // 2026-09-21: Resend 한도는 "초당 10건"이다. 예전엔 5개씩 병렬로 던지되
  // 웨이브 사이 대기가 없어 초당 20건 넘게 나갔고, 9/14·9/20 발송에서 수신자
  // 절반이 429 로 떨어져 나갔다(재시도도 없었다). 이제 웨이브마다 최소
  // WAVE_MS 를 채우고, 429 는 백오프로 재시도한다.
  const FROM = 'kissinskin <report@kissinskin.net>'

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  async function sendOne({ email, lang }: { email: string; lang: 'ko' | 'en' }): Promise<string | null> {
    const unsub = await optoutUrl(env.EMAIL_OPTOUT_SECRET!, email)
    const { subject, html } = renderDigest(lang, sectionsFor(lang), unsub, campaign)
    let last = ''
    // 429 는 서버가 "잠깐 뒤 다시"라고 말한 것이므로 버리지 않고 재시도한다.
    for (let attempt = 0; attempt < RETRIES; attempt++) {
      if (attempt) await sleep(RETRY_MS * 2 ** (attempt - 1))
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
          // Resend 대시보드에서 회차·언어별로 열람률/클릭률을 갈라 보기 위한 태그.
          // (열람·클릭 추적 자체는 Resend 도메인 설정에서 켜야 한다 — 코드로는 못 켠다.)
          tags: [
            { name: 'campaign', value: campaign },
            { name: 'lang', value: lang },
          ],
          headers: {
            'List-Unsubscribe': `<${unsub}>, <mailto:report@kissinskin.net?subject=unsubscribe>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      })
      if (res.ok) return null
      last = `${email}: ${res.status} ${(await res.text()).slice(0, 120)}`
      // 429(한도)와 5xx(일시 장애)만 재시도한다. 400/422 는 다시 보내도 같다.
      if (res.status !== 429 && res.status < 500) break
    }
    return last
  }

  let sent = 0
  const errors: string[] = []
  const CONCURRENCY = 4
  const WAVE_MS = 600 // 4건 / 0.6초 ≈ 초당 6.7건 — 한도(초당 10건) 아래
  const RETRIES = 4
  const RETRY_MS = 1000
  for (let i = 0; i < recipients.length; i += CONCURRENCY) {
    const started = Date.now()
    const results = await Promise.all(recipients.slice(i, i + CONCURRENCY).map(sendOne))
    for (const err of results) {
      if (err) errors.push(err)
      else sent++
    }
    const rest = WAVE_MS - (Date.now() - started)
    if (i + CONCURRENCY < recipients.length && rest > 0) await sleep(rest)
  }

  const failed = recipients.length - sent
  return json(
    { campaign, sent, failed, recipients: recipients.length, byLang, byKind, errors: errors.slice(0, 10) },
    failed && !sent ? 502 : 200,
  )
}
