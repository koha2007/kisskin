// Dynamic OG meta tags for social media bots visiting /result/:id
// Regular users get the SPA fallback

interface Env {
  SUPABASE_SERVICE_ROLE_KEY: string
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
}

const BOT_UA = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Pinterest|Discordbot|WhatsApp|Line|Googlebot|Yeti|Bingbot|DaumOA|bot|crawl|spider|preview/i

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function onRequest(context: { request: Request; env: Env; next: () => Promise<Response> }) {
  const ua = context.request.headers.get('user-agent') || ''

  if (!BOT_UA.test(ua)) {
    // Serve the SPA fallback — context.next() returns 404.html (home page HTML).
    // We must rewrite the inlined Vike pageContext so the client router hydrates
    // to the result page instead of the home page.
    const spaRes = await context.next()
    const url = new URL(context.request.url)
    const id = url.pathname.split('/result/')[1]?.split('/')[0]?.split('?')[0] || ''
    const body = await spaRes.text()
    const patched = body.replace(
      /<script id="vike_pageContext" type="application\/json">[\s\S]*?<\/script>/,
      `<script id="vike_pageContext" type="application/json">${JSON.stringify({ pageId: '/pages/result/@id', routeParams: { id } })}</script>`,
    )
    const headers = new Headers(spaRes.headers)
    headers.set('Content-Type', 'text/html;charset=utf-8')
    headers.delete('Content-Length')
    return new Response(patched, {
      status: 200,
      headers,
    })
  }

  const url = new URL(context.request.url)
  const segments = url.pathname.split('/result/')
  const id = segments[1]?.split('/')[0]
  if (!id || id.length < 10) return serveFallbackOg(url.pathname)

  try {
    const supabaseUrl = context.env.VITE_SUPABASE_URL
    const key = context.env.VITE_SUPABASE_ANON_KEY
    if (!supabaseUrl || !key) {
      console.error('[result-og] Missing env: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
      return serveFallbackOg(url.pathname)
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/shared_results?id=eq.${encodeURIComponent(id)}&select=image_path,report,gender,styles`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } },
    )
    if (!res.ok) {
      console.error('[result-og] Supabase error:', res.status, await res.text().catch(() => ''))
      return serveFallbackOg(url.pathname)
    }

    const results = await res.json() as { image_path: string; report: unknown; gender: string; styles: string[] }[]
    if (!results.length) {
      console.error('[result-og] No result found for id:', id)
      return serveFallbackOg(url.pathname)
    }

    const data = results[0]
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/results/${data.image_path}`

    let report = data.report
    if (typeof report === 'string') {
      try {
        report = JSON.parse(report)
        // Handle double-stringified case
        if (typeof report === 'string') {
          try { report = JSON.parse(report) } catch { /* keep */ }
        }
      } catch { /* keep */ }
    }
    const a = (report as { analysis?: { skinType?: string; tone?: string; skinTypeDetail?: string; toneDetail?: string; advice?: string } })?.analysis
    const styles = data.styles || []

    // Detect if analysis is in Korean (check for Korean characters)
    const isKo = a ? /[가-힣]/.test(`${a.skinType}${a.tone}${a.advice || ''}`) : false

    const title = a
      ? escHtml(isKo
        ? `💄 AI 메이크업 분석: ${a.skinType} · ${a.tone} - kissinskin`
        : `💄 AI Makeup: ${a.skinType} · ${a.tone} - kissinskin`)
      : (isKo ? '💄 AI 메이크업 분석 결과 - kissinskin' : '💄 AI Makeup Analysis Result - kissinskin')
    const description = a
      ? escHtml(`${a.skinTypeDetail || ''} ${a.toneDetail || ''} ${a.advice || ''}`.trim().slice(0, 200))
      : escHtml(isKo
        ? `AI가 분석한 ${styles.length}가지 맞춤 K-뷰티 메이크업 룩과 제품 추천`
        : `AI-powered ${styles.length} personalized K-beauty makeup looks and product recommendations.`)
    const lang = isKo ? 'ko' : 'en'
    const ogLocale = isKo ? 'ko_KR' : 'en_US'
    const ogLocaleAlt = isKo ? 'en_US' : 'ko_KR'

    const html = `<!DOCTYPE html>
<html lang="${lang}" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<meta name="description" content="${description}"/>
<meta property="og:type" content="article"/>
<meta property="og:url" content="https://kissinskin.net/result/${escHtml(id)}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:image" content="${escHtml(imageUrl)}"/>
<meta property="og:image:secure_url" content="${escHtml(imageUrl)}"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1024"/>
<meta property="og:image:height" content="1024"/>
<meta property="og:image:alt" content="${title}"/>
<meta property="og:site_name" content="kissinskin"/>
<meta property="og:locale" content="${ogLocale}"/>
<meta property="og:locale:alternate" content="${ogLocaleAlt}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${escHtml(imageUrl)}"/>
<link rel="canonical" href="https://kissinskin.net/result/${escHtml(id)}"/>
<meta name="robots" content="index, follow, max-image-preview:large"/>
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>'),
  "image": imageUrl,
  "publisher": { "@type": "Organization", "name": "kissinskin", "logo": { "@type": "ImageObject", "url": "https://kissinskin.net/logo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": `https://kissinskin.net/result/${id}` }
})}</script>
</head>
<body>
<h1>${title}</h1>
<img src="${escHtml(imageUrl)}" alt="AI Makeup Analysis" width="512"/>
<p>${description}</p>
${styles.length > 0 ? `<ul>${styles.map(s => `<li>${escHtml(s)}</li>`).join('')}</ul>` : ''}
<p><a href="https://kissinskin.net/result/${escHtml(id)}">View full result on kissinskin</a></p>
</body>
</html>`

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html;charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e) {
    console.error('[result-og] Error:', e)
    return serveFallbackOg(url.pathname)
  }
}

/** Fallback OG HTML for bots when Supabase data is unavailable */
function serveFallbackOg(pathname: string) {
  const canonical = `https://kissinskin.net${pathname}`
  const html = `<!DOCTYPE html>
<html lang="ko" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="utf-8"/>
<title>💄 AI 메이크업 분석 결과 - kissinskin</title>
<meta name="description" content="AI가 분석한 맞춤 K-뷰티 메이크업 룩과 제품 추천 결과를 확인하세요."/>
<meta property="og:type" content="article"/>
<meta property="og:url" content="${escHtml(canonical)}"/>
<meta property="og:title" content="💄 AI 메이크업 분석 결과 - kissinskin"/>
<meta property="og:description" content="AI가 분석한 맞춤 K-뷰티 메이크업 룩과 제품 추천 결과를 확인하세요."/>
<meta property="og:image" content="https://kissinskin.net/og-image.png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:site_name" content="kissinskin"/>
<meta property="og:locale" content="ko_KR"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="💄 AI 메이크업 분석 결과 - kissinskin"/>
<meta name="twitter:description" content="AI가 분석한 맞춤 K-뷰티 메이크업 룩과 제품 추천 결과를 확인하세요."/>
<meta name="twitter:image" content="https://kissinskin.net/og-image.png"/>
<link rel="canonical" href="${escHtml(canonical)}"/>
</head>
<body>
<h1>AI 메이크업 분석 결과</h1>
<p><a href="${escHtml(canonical)}">kissinskin에서 결과 보기</a></p>
</body>
</html>`
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
