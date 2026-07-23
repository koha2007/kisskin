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
  /** 결과 벤토에서 이 제품 카드가 앉은 슬롯 번호(0-based).
   *  제품 카드를 유형 코드 해시로 페이지마다 다른 자리에 앉히기 때문에(배너
   *  블라인드니스 회피), "몇 번째 자리가 실제로 눌리는가"를 재지 않으면 분산이
   *  효과가 있었는지 알 수 없다. 순수 랜덤 대신 결정적 분산을 택한 이유가 이것이다. */
  slot?: number
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
    slot: event.slot,
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
