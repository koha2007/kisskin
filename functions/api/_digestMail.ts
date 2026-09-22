// 주간 제품 다이제스트 메일 — 공유 헬퍼.
// announce-products.ts(발송)와 email-optout.ts(수신거부 링크 검증)가 함께 쓴다.
// `_` 프리픽스라 라우트로 노출되지 않는다.

export const SITE = 'https://kissinskin.net'

// ── 수신거부 링크 서명 ──────────────────────────────────────────────
// 링크는 GET /api/email-optout?e=<email>&t=<hmac> 형태다. t 는 이메일을
// EMAIL_OPTOUT_SECRET 으로 HMAC-SHA256 한 hex. 서명이 없으면 아무나 남의
// 주소를 수신거부 처리할 수 있으므로 필수다.

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function signEmail(secret: string, email: string): Promise<string> {
  const key = await hmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(email.toLowerCase()))
  return toHex(sig)
}

export async function verifyEmailSig(secret: string, email: string, hex: string): Promise<boolean> {
  if (!hex || !/^[0-9a-f]{64}$/i.test(hex)) return false
  const expected = await signEmail(secret, email)
  // 길이가 같으므로 상수시간 비교
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ hex.charCodeAt(i)
  return diff === 0
}

export async function optoutUrl(secret: string, email: string): Promise<string> {
  const t = await signEmail(secret, email)
  return `${SITE}/api/email-optout?e=${encodeURIComponent(email)}&t=${t}`
}

// ── 용도별 서명 (구독 확인 링크) ────────────────────────────────────
// 위 signEmail 은 "수신거부" 전용이다. 구독 확인 링크에 같은 서명을 쓰면 한쪽에서 샌
// 토큰으로 다른 쪽을 실행할 수 있으므로, 용도 문자열을 붙여 서로 다른 값이 나오게 한다.

export async function signScoped(secret: string, scope: string, email: string): Promise<string> {
  const key = await hmacKey(secret)
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${scope}:${email.toLowerCase()}`),
  )
  return toHex(sig)
}

export async function verifyScoped(
  secret: string,
  scope: string,
  email: string,
  hex: string,
): Promise<boolean> {
  if (!hex || !/^[0-9a-f]{64}$/i.test(hex)) return false
  const expected = await signScoped(secret, scope, email)
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ hex.charCodeAt(i)
  return diff === 0
}

// ── 링크 추적 (UTM) ────────────────────────────────────────────────
// 2026-09-21: 다이제스트가 사이트로 사람을 얼마나 데려오는지 **우리 쪽에서** 재는 장치.
// Resend 대시보드의 열람/클릭은 Resend 안에만 남고 GA4 와 이어지지 않는다. UTM 을
// 붙여야 "메일에서 온 세션이 몇이고 그중 몇이 가입했는가"를 한 화면에서 볼 수 있다.
//
// utm_content 에 카드별 식별자를 넣어 **어느 카드가 눌리는지**까지 가른다.
export function withUtm(url: string, campaign: string, content: string): string {
  const q = `utm_source=email&utm_medium=digest&utm_campaign=${encodeURIComponent(campaign)}&utm_content=${encodeURIComponent(content)}`
  return url + (url.includes('?') ? '&' : '?') + q
}

/** 발송 1회를 식별하는 캠페인 id. 회차별 비교의 기준이라 발송기가 한 번만 만들어 넘긴다. */
export function campaignId(d = new Date()): string {
  return `digest_${d.toISOString().slice(0, 10).replace(/-/g, '')}`
}

// ── 메일 본문 ──────────────────────────────────────────────────────

export interface DigestItem {
  slug: string
  brand: string
  name: string
  summary: string
  image?: string
  category?: string
  url: string
}

const COPY = {
  ko: {
    // 제목은 실린 내용에 맞춘다 — 제품만이던 시절의 "N선" 을 뉴스만 실린 주에 쓰면 거짓말이 된다.
    subject: (p: number, n: number) =>
      p && n ? `이번 주 K-뷰티 — 신제품 ${p}건 · 뉴스 ${n}건`
      : p ? `이번 주 새로 나온 K-뷰티 ${p}선`
      : `이번 주 K-뷰티 뉴스 ${n}건`,
    preheader: '지난 한 주 키스인스킨에 올라온 신제품과 뉴스를 한눈에.',
    heading: '이번 주의 K-뷰티',
    intro: '지난 한 주 동안 키스인스킨에 새로 올라온 제품과 뉴스예요.',
    productsTitle: '신제품',
    newsTitle: '뉴스',
    cta: '자세히 보기',
    unsub: '이런 메일을 그만 받고 싶으시면 ',
    unsubLink: '수신거부',
    signoff: 'kissinskin — 셀카 한 장으로 AI K-뷰티 메이크업·퍼스널컬러 진단',
  },
  en: {
    subject: (p: number, n: number) =>
      p && n ? `This week in K-beauty — ${p} new, ${n} in the news`
      : p ? `${p} new K-beauty picks this week`
      : `${n} K-beauty stories this week`,
    preheader: 'The newest products and stories added to kissinskin this past week.',
    heading: 'This week in K-beauty',
    intro: 'Here is what was newly added to kissinskin over the past week.',
    productsTitle: 'New arrivals',
    newsTitle: 'News',
    cta: 'View details',
    unsub: 'To stop receiving these emails, ',
    unsubLink: 'unsubscribe here',
    signoff: 'kissinskin — AI K-beauty makeup & personal color analysis from one selfie',
  },
} as const

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const ADDRESS = '코하(koha) · 대표 김용헌 · 사업자등록번호 108-16-82025 · 경기도 남양주시 해밀예당1로'

/** 제품은 "브랜드 제품명", 뉴스는 brand 가 비어 있어 제목만 쓴다. */
const headline = (it: DigestItem) => `${it.brand} ${it.name}`.trim()

export interface DigestSections {
  products: DigestItem[]
  news: DigestItem[]
}

export function renderDigest(
  lang: 'ko' | 'en',
  sections: DigestSections,
  unsubHref: string,
  campaign: string = campaignId(),
): { subject: string; html: string } {
  const t = COPY[lang]
  const subject = t.subject(sections.products.length, sections.news.length)

  const renderCards = (items: DigestItem[], kind: 'product' | 'news') =>
    items
      .map((it, i) => {
        const head = headline(it)
        // 카드마다 다른 utm_content → 어느 줄이 실제로 눌리는지 보인다.
        const link = withUtm(it.url, campaign, `${kind}${i + 1}_${it.slug}`)
        const img = it.image
          ? `<tr><td style="padding:0 0 12px;"><a href="${esc(link)}"><img src="${SITE}${esc(it.image)}" width="536" alt="${esc(head)}" style="width:100%;max-width:536px;border-radius:12px;display:block;"/></a></td></tr>`
          : ''
        return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        ${img}
        <tr><td style="font:600 17px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;padding-bottom:4px;">
          ${esc(head)}
        </td></tr>
        <tr><td style="font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#555;padding-bottom:12px;">
          ${esc(it.summary)}
        </td></tr>
        <tr><td>
          <a href="${esc(link)}" style="display:inline-block;font:600 13px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#fff;background:#111;text-decoration:none;padding:10px 18px;border-radius:8px;">
            ${t.cta} →
          </a>
        </td></tr>
      </table>`
      })
      .join('')

  // 섹션 제목은 양쪽 다 있을 때만 — 한쪽만 실린 주엔 군더더기다.
  const both = sections.products.length > 0 && sections.news.length > 0
  const sectionTitle = (label: string) =>
    both
      ? `<tr><td style="font:700 12px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#c2410c;padding:0 0 14px;">${esc(label)}</td></tr>`
      : ''

  const block = (label: string, items: DigestItem[], kind: 'product' | 'news') =>
    items.length ? `${sectionTitle(label)}<tr><td>${renderCards(items, kind)}</td></tr>` : ''

  const body = `${block(t.productsTitle, sections.products, 'product')}${block(t.newsTitle, sections.news, 'news')}`

  const html = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(subject)}</title></head>
<body style="margin:0;background:#f5f4f2;">
  <span style="display:none!important;opacity:0;color:#f5f4f2;">${esc(t.preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f2;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;padding:32px;">
        <tr><td style="font:700 22px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;padding-bottom:8px;">
          ${t.heading}
        </td></tr>
        <tr><td style="font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#555;padding-bottom:28px;">
          ${t.intro}
        </td></tr>
        ${body}
        <tr><td style="border-top:1px solid #eee;padding-top:20px;font:400 12px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#999;">
          ${t.signoff}<br/>
          <a href="${esc(withUtm(SITE + '/', campaign, 'footer'))}" style="color:#999;">kissinskin.net</a>
          ${ADDRESS ? `<br/>${esc(ADDRESS)}` : ''}
          <br/><br/>
          ${t.unsub}<a href="${esc(unsubHref)}" style="color:#999;text-decoration:underline;">${t.unsubLink}</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  return { subject, html }
}
