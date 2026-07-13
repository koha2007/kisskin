import { trackEvent } from '../analytics'
import { isMerchantMonetized } from '../../config/affiliate'

const isMonetized = (merchant: string): boolean => isMerchantMonetized(merchant)

export type AffiliatePageType =
  | 'personal_color'
  | 'face_shape'
  | 'mbti'
  | 'perfume_type'
  | 'review'
  | 'guide'
  | 'news'
  | 'makeup'
  | 'product'

// amazon/yesstyle 은 아직 어필리에이트가 아니라 일반 검색 링크다(수익 0). 그래도 클릭은
// 재는데, 이 숫자가 없으면 "해외에서 실제로 사려는 사람이 있는가"를 알 길이 없고
// Amazon 신청 시점을 감으로 정하게 된다 — Amazon 은 **신청 시점부터** 180일 안에 적격 판매
// 3건을 못 채우면 계정을 닫는다. 즉 클릭 수요를 먼저 확인하고 신청해야 한다.
export type AffiliateMerchant = 'coupang' | 'clubclio' | 'amazon' | 'yesstyle'

export interface AffiliateClickEvent {
  merchant: AffiliateMerchant
  category: string
  pageType: AffiliatePageType
  pageSlug: string
}

/** 머천트로 구매 지역을 판정 — GA4 에서 국내/해외 구매 의도를 바로 쪼개 보기 위함. */
function regionOf(merchant: AffiliateMerchant): 'korea' | 'global' {
  return merchant === 'amazon' || merchant === 'yesstyle' ? 'global' : 'korea'
}

export function trackAffiliateClick(event: AffiliateClickEvent): void {
  // routed through the central wrapper → SSR + internal/family traffic guard (P0-6)
  trackEvent('affiliate_click', {
    merchant: event.merchant,
    category: event.category,
    page_type: event.pageType,
    page_slug: event.pageSlug,
    region: regionOf(event.merchant),
    // 어필리에이트 미승인 머천트는 클릭이 나가도 수익이 0이다. GA4 에서 "클릭은 있는데
    // 수익이 없는" 구간을 구분해 볼 수 있어야 승인 우선순위를 판단할 수 있다.
    monetized: isMonetized(event.merchant),
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
