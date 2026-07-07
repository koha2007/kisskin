import { trackEvent } from '../analytics'

export type AffiliatePageType =
  | 'personal_color'
  | 'face_shape'
  | 'mbti'
  | 'perfume_type'
  | 'review'
  | 'guide'
  | 'news'
  | 'makeup'

export interface AffiliateClickEvent {
  merchant: 'coupang' | 'clubclio'
  category: string
  pageType: AffiliatePageType
  pageSlug: string
}

export function trackAffiliateClick(event: AffiliateClickEvent): void {
  // routed through the central wrapper → SSR + internal/family traffic guard (P0-6)
  trackEvent('affiliate_click', {
    merchant: event.merchant,
    category: event.category,
    page_type: event.pageType,
    page_slug: event.pageSlug,
  })
}

// Fired when a reader switches the Korea/Global buying-region toggle, so we can
// measure how many visitors want global links vs. the page-default region.
export function trackRegionToggle(event: {
  region: 'korea' | 'global'
  pageType?: AffiliatePageType
  locale?: string
}): void {
  trackEvent('region_toggle_click', {
    region: event.region,
    page_type: event.pageType,
    locale: event.locale,
  })
}
