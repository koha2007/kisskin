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
    subject: (n: number) => `이번 주 새로 나온 K-뷰티 ${n}선`,
    preheader: '지난 한 주 키스인스킨에 올라온 신제품을 한눈에.',
    heading: '이번 주의 신제품',
    intro: '지난 한 주 동안 키스인스킨에 새로 소개된 메이크업·스킨케어 제품이에요.',
    cta: '자세히 보기',
    unsub: '이런 메일을 그만 받고 싶으시면 ',
    unsubLink: '수신거부',
    signoff: 'kissinskin — 셀카 한 장으로 AI K-뷰티 메이크업·퍼스널컬러 진단',
  },
  en: {
    subject: (n: number) => `${n} new K-beauty picks this week`,
    preheader: 'The newest products added to kissinskin this past week.',
    heading: "This week's new arrivals",
    intro: 'Here are the makeup and skincare products newly featured on kissinskin over the past week.',
    cta: 'View details',
    unsub: 'To stop receiving these emails, ',
    unsubLink: 'unsubscribe here',
    signoff: 'kissinskin — AI K-beauty makeup & personal color analysis from one selfie',
  },
} as const

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ⚠️ 회사 주소를 아직 안 넣었다. 마케팅 메일은 발신자 실제 우편주소 표기가
// CAN-SPAM 상 의무다. 첫 정식 발송 전에 아래 ADDRESS 를 채울 것.
const ADDRESS = '' // 예: 'kissinskin · 서울특별시 ○○구 ○○로 00, 0층'

export function renderDigest(
  lang: 'ko' | 'en',
  items: DigestItem[],
  unsubHref: string,
): { subject: string; html: string } {
  const t = COPY[lang]
  const subject = t.subject(items.length)

  const cards = items
    .map((it) => {
      const img = it.image
        ? `<tr><td style="padding:0 0 12px;"><a href="${esc(it.url)}"><img src="${SITE}${esc(it.image)}" width="536" alt="${esc(it.brand)} ${esc(it.name)}" style="width:100%;max-width:536px;border-radius:12px;display:block;"/></a></td></tr>`
        : ''
      return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        ${img}
        <tr><td style="font:600 17px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;padding-bottom:4px;">
          ${esc(it.brand)} ${esc(it.name)}
        </td></tr>
        <tr><td style="font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#555;padding-bottom:12px;">
          ${esc(it.summary)}
        </td></tr>
        <tr><td>
          <a href="${esc(it.url)}" style="display:inline-block;font:600 13px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#fff;background:#111;text-decoration:none;padding:10px 18px;border-radius:8px;">
            ${t.cta} →
          </a>
        </td></tr>
      </table>`
    })
    .join('')

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
        <tr><td>${cards}</td></tr>
        <tr><td style="border-top:1px solid #eee;padding-top:20px;font:400 12px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#999;">
          ${t.signoff}<br/>
          <a href="${SITE}" style="color:#999;">kissinskin.net</a>
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
