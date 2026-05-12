export type AffiliatePageType = 'personal_color' | 'face_shape' | 'mbti' | 'perfume_type'

export interface AffiliateClickEvent {
  merchant: 'coupang' | 'clubclio'
  category: string
  pageType: AffiliatePageType
  pageSlug: string
}

export function trackAffiliateClick(event: AffiliateClickEvent): void {
  if (typeof window === 'undefined') return
  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag
  if (!gtag) return
  gtag('event', 'affiliate_click', {
    merchant: event.merchant,
    category: event.category,
    page_type: event.pageType,
    page_slug: event.pageSlug,
  })
}
