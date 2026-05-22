// Internal / family-traffic exclusion for GA4 + Clarity.
//
// Goal: dashboards must reflect only real external visitors. The family runs the
// site through free (100%-discount) codes and the operator browses constantly,
// which otherwise shows up as fake purchases and inflated revenue.
//
// Two entry points share the localStorage flag written here:
//   1. pages/+config.ts `loadAnalytics()` — read at page load. If the flag (or
//      ?internal=1) is present it sets the GA4 kill switch and skips loading GA4
//      and Clarity entirely, so even the automatic page_view never fires.
//   2. This module — flips the same flag live when a known family email logs in,
//      so their first session also stops sending hits without a reload.

const GA_ID = 'G-JJ7G39W5T3'
const INTERNAL_KEY = 'kisskin_internal'

// Family accounts (also the operator). Lower-cased; compared case-insensitively.
const FAMILY_EMAILS = new Set([
  'koha2007@naver.com',
  'koha3d77@gmail.com',
  'dangni81@naver.com',
  'shj01205@naver.com',
])

let cached: boolean | null = null

export function isInternalEmail(email?: string | null): boolean {
  return !!email && FAMILY_EMAILS.has(email.trim().toLowerCase())
}

/** True if this device has been tagged as internal (family/operator). */
export function isInternalTraffic(): boolean {
  if (typeof window === 'undefined') return false
  if (cached !== null) return cached
  try {
    cached = window.localStorage.getItem(INTERNAL_KEY) === '1'
  } catch {
    cached = false
  }
  return cached
}

/**
 * Google's official per-property opt-out. Once set, gtag.js drops every hit for
 * this measurement ID (including auto page_view), regardless of how it loaded.
 */
function disableAnalytics() {
  if (typeof window === 'undefined') return
  ;(window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true
}

/** Persist the internal flag for this device and stop GA4 hits immediately. */
export function markInternal() {
  if (typeof window === 'undefined') return
  cached = true
  try {
    window.localStorage.setItem(INTERNAL_KEY, '1')
  } catch {
    /* private mode / quota — the in-memory cache still gates this session */
  }
  disableAnalytics()
}

/** Tag the device as internal when an authenticated email is a family account. */
export function markInternalIfFamily(email?: string | null) {
  if (isInternalEmail(email)) markInternal()
}
