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

/**
 * 무료 도구 결과 → AI 메이크업으로 넘어가는 지점의 클릭.
 *
 * 결과 페이지마다 이 다리가 여러 위치에 있으므로 **어느 자리가 실제로 먹히는지**
 * 를 `creative_slot` 으로만 가른다. 이벤트 이름·promotion_id·promotion_name 은
 * 옛 ToolUpsellCTA 시절과 똑같이 유지할 것 — 바꾸면 5월~6월 데이터와 이어 볼 수
 * 없다(원래 주의사항은 BentoGrid.tsx BentoBanner 주석에 있었고, 히어로 CTA 가
 * 생기면서 두 곳이 같은 규칙을 써야 해 이리로 끌어올렸다).
 *
 * @param slot 'hero_primary' | 'bento_banner' 등 페이지 내 위치.
 */
export function trackToolPromotion(tool: string, slug: string | undefined, slot: string): void {
  trackEvent('select_promotion', {
    promotion_id: `tool_cta_${tool}`,
    promotion_name: `${tool} result → AI analysis`,
    creative_slot: slot,
    items: slug ? [{ item_id: slug, item_name: `${tool}:${slug}` }] : undefined,
  })
}
