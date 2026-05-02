// 410 Gone for blog posts that were intentionally removed,
// and 301 redirects for posts that moved to a tools/ or guides/ page.
// Anything else falls through to the SPA / prerendered HTML.

interface Ctx {
  request: Request
  next: () => Promise<Response>
}

const REDIRECTS: Record<string, string> = {
  'personal-color-system-deep-dive': '/tools/personal-color/',
  'face-shape-celebrity-analysis': '/tools/face-shape/',
  'eyeliner-shape-eye-type': '/guides/',
}

const GONE = new Set<string>([
  // Add any other slugs that should return 410 Gone here.
])

function extractSlug(pathname: string): string | null {
  // Match /blog/<slug>/ or /blog/<slug>
  const m = pathname.match(/^\/blog\/([^/]+)\/?$/)
  return m ? m[1] : null
}

export async function onRequest(context: Ctx) {
  const url = new URL(context.request.url)
  const slug = extractSlug(url.pathname)
  if (!slug) {
    return context.next()
  }

  if (slug in REDIRECTS) {
    const target = REDIRECTS[slug]
    return Response.redirect(`${url.origin}${target}`, 301)
  }

  if (GONE.has(slug)) {
    return new Response(
      `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>410 Gone</title><h1>This post is no longer available.</h1><p><a href="/blog/">Back to the blog</a></p>`,
      { status: 410, headers: { 'content-type': 'text/html; charset=utf-8' } },
    )
  }

  return context.next()
}
