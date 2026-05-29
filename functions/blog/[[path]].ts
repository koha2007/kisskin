// The blog category was permanently removed. Every /blog/* path now 301-redirects:
//  - a few posts that have a real home on a tools/ or guides/ page go there,
//  - everything else (including the old /blog/ hub) goes to the site root.
// This Pages Function catches all /blog and /blog/* requests before static assets.

interface Ctx {
  request: Request
}

const REDIRECTS: Record<string, string> = {
  'personal-color-system-deep-dive': '/tools/personal-color/',
  'face-shape-celebrity-analysis': '/tools/face-shape/',
  'eyeliner-shape-eye-type': '/guides/',
}

function extractSlug(pathname: string): string | null {
  // Match /blog/<slug>/ or /blog/<slug>
  const m = pathname.match(/^\/blog\/([^/]+)\/?$/)
  return m ? m[1] : null
}

export async function onRequest(context: Ctx) {
  const url = new URL(context.request.url)
  const slug = extractSlug(url.pathname)
  const target = (slug && REDIRECTS[slug]) || '/'
  return Response.redirect(`${url.origin}${target}`, 301)
}
