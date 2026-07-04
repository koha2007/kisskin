// Centralized GA4 event wrapper for the free-pivot funnel (P0-6 측정 / FINAL §6).
//
// Single choke point for every custom event so the rules live in one place:
//   - SSR guard (no window)
//   - internal/family traffic exclusion (shared flag with pages/+config.ts kill
//     switch and AnalysisApp's gtagEvent — dashboards must show only real visitors)
//
// The five funnel events:
//   style_selected · free_trial_used · credit_purchased · card_saved · affiliate_click
// card_saved + affiliate_click have live triggers today; the other three are wired
// from the P1 makeup pipeline / credit system once those land.

import { isInternalTraffic } from './internalTraffic'

type Params = Record<string, unknown>

/** Fire a GA4 event unless this is SSR or internal/family traffic. */
export function trackEvent(name: string, params?: Params): void {
  if (typeof window === 'undefined') return
  if (isInternalTraffic()) return
  ;(window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', name, params)
}

/** User picked a makeup style from the 5-style menu (P1 makeup UI). */
export function trackStyleSelected(style: string, extra?: Params): void {
  trackEvent('style_selected', { style, ...extra })
}

/** User consumed their one free makeup render (P1 free-once guard). */
export function trackFreeTrialUsed(extra?: Params): void {
  trackEvent('free_trial_used', extra)
}

/** User purchased a credit pack (P1 credits). */
export function trackCreditPurchased(pack: string, value: number, extra?: Params): void {
  trackEvent('credit_purchased', { pack, value, currency: 'USD', ...extra })
}

/** User saved an identity-card PNG (P0-2). */
export function trackCardSaved(params: Params): void {
  trackEvent('card_saved', params)
}
