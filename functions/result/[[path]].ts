// Dynamic OG meta tags for social media bots visiting /result/:id
// Regular users get the SPA fallback

interface Env {
  SUPABASE_SERVICE_ROLE_KEY: string
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
}

const BOT_UA = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Pinterest|Discordbot|WhatsApp|Line|Googlebot|bot|crawl|spider|preview/i

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function onRequest(context: { request: Request; env: Env; next: () => Promise<Response> }) {
  const ua = context.request.headers.get('user-agent') || ''

  if (!BOT_UA.test(ua)) {
    // Serve the SPA fallback — context.next() returns 404 with SPA HTML body
    const spaRes = await context.next()
    return new Response(spaRes.body, {
      status: 200,
      headers: spaRes.headers,
    })
  }

  const url = new URL(context.request.url)
  const segments = url.pathname.split('/result/')
  const id = segments[1]?.split('/')[0]
  if (!id || id.length < 10) return context.next()

  try {
    const supabaseUrl = context.env.VITE_SUPABASE_URL || 'https://vrcltmhhbgnsmdeoxlck.supabase.co'
    const key = context.env.VITE_SUPABASE_ANON_KEY || context.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) return context.next()

    const res = await fetch(
      `${supabaseUrl}/rest/v1/shared_results?id=eq.${encodeURIComponent(id)}&select=image_path,report,gender,styles`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } },
    )
    if (!res.ok) return context.next()

    const results = await res.json() as { image_path: string; report: unknown; gender: string; styles: string[] }[]
    if (!results.length) return context.next()

    const data = results[0]
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/results/${data.image_path}`

    let report = data.report
    if (typeof report === 'string') {
      try { report = JSON.parse(report) } catch { /* keep */ }
    }
    const a = (report as { analysis?: { skinType?: string; tone?: string; skinTypeDetail?: string; toneDetail?: string; advice?: string } })?.analysis
    const styles = data.styles || []

    const title = a
      ? escHtml(`AI Makeup: ${a.skinType} · ${a.tone} - kissinskin`)
      : 'AI Makeup Analysis Result - kissinskin'
    const description = a
      ? escHtml(`${a.skinTypeDetail || ''} ${a.toneDetail || ''} ${a.advice || ''}`.trim().slice(0, 200))
      : escHtml(`AI-powered ${styles.length} personalized K-beauty makeup looks and product recommendations.`)

    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<meta name="description" content="${description}"/>
<meta property="og:type" content="article"/>
<meta property="og:url" content="https://kissinskin.net/result/${escHtml(id)}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:image" content="${escHtml(imageUrl)}"/>
<meta property="og:image:width" content="1024"/>
<meta property="og:image:height" content="1024"/>
<meta property="og:site_name" content="kissinskin"/>
<meta property="og:locale" content="en_US"/>
<meta property="og:locale:alternate" content="ko_KR"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${escHtml(imageUrl)}"/>
<link rel="canonical" href="https://kissinskin.net/result/${escHtml(id)}"/>
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
    return context.next()
  }
}
