// Simple in-memory rate limiter for API endpoints
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Clean up stale entries periodically (every 100 requests)
let requestCounter = 0
function cleanupRateLimitMap() {
  requestCounter++
  if (requestCounter % 100 === 0) {
    const now = Date.now()
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key)
    }
  }
}

// Rate limit config per endpoint pattern
const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  '/api/analyze': { maxRequests: 10, windowMs: 60_000 },       // 10 per minute
  '/api/send-report': { maxRequests: 5, windowMs: 60_000 },    // 5 per minute
  '/api/checkout': { maxRequests: 10, windowMs: 60_000 },      // 10 per minute
  '/api/delete-account': { maxRequests: 3, windowMs: 300_000 }, // 3 per 5 minutes
  '/api/refund': { maxRequests: 5, windowMs: 300_000 },        // 5 per 5 minutes
}

function checkRateLimit(ip: string, pathname: string): boolean {
  const config = RATE_LIMITS[pathname]
  if (!config) return true // no limit for this endpoint

  const key = `${ip}:${pathname}`
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs })
    return true
  }

  entry.count++
  return entry.count <= config.maxRequests
}

export async function onRequest(context: { request: Request; next: () => Promise<Response> }) {
  const url = new URL(context.request.url)

  // kisskin.pages.dev → kissinskin.net redirect (exclude API routes)
  if (url.hostname === 'kisskin.pages.dev' && !url.pathname.startsWith('/api/')) {
    url.hostname = 'kissinskin.net'
    return Response.redirect(url.toString(), 301)
  }

  // Rate limiting for API endpoints
  if (url.pathname.startsWith('/api/')) {
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown'
    cleanupRateLimitMap()

    if (!checkRateLimit(ip, url.pathname)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      })
    }
  }

  const response = await context.next()

  // Clone response to get mutable headers (context.next() may return immutable headers)
  const newResponse = new Response(response.body, response)
  newResponse.headers.set('X-Content-Type-Options', 'nosniff')
  newResponse.headers.set('X-Frame-Options', 'DENY')
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  newResponse.headers.set('Permissions-Policy', 'camera=(self), microphone=()')
  newResponse.headers.set('X-XSS-Protection', '1; mode=block')

  return newResponse
}
