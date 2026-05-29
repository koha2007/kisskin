import { AFFILIATE_ENABLED, buildSearchLink } from '../lib/recommendations/types'
import { useI18n } from '../i18n/I18nContext'
import { trackAffiliateClick, type AffiliatePageType } from '../lib/affiliate/track'

interface Props {
  // Plain search phrase for Coupang (brand + product line). Required.
  coupangQuery: string
  // Clio storefront URL — pass null/undefined to hide the Clio button.
  clioLink?: string | null
  // GA4 affiliate_click attribution.
  pageType: AffiliatePageType
  pageSlug: string
  trackCategory: string
  className?: string
}

// Reusable Coupang + (optional) Clio buy buttons.
// Filled pills for a clear CTA — shared by review articles and guide pages.
export default function ProductBuyButtons({
  coupangQuery,
  clioLink,
  pageType,
  pageSlug,
  trackCategory,
  className = '',
}: Props) {
  const { t } = useI18n()
  if (!AFFILIATE_ENABLED) return null

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      <a
        href={buildSearchLink(coupangQuery)}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={() =>
          trackAffiliateClick({ merchant: 'coupang', category: trackCategory, pageType, pageSlug })
        }
        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-sm hover:shadow-md hover:brightness-105 transition-all"
      >
        🛒 {t('recProducts.findProducts')}
        <span className="material-symbols-outlined text-base">arrow_outward</span>
      </a>

      {clioLink && (
        <a
          href={clioLink}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={() =>
            trackAffiliateClick({ merchant: 'clubclio', category: trackCategory, pageType, pageSlug })
          }
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
        >
          🌹 {t('recProducts.findOnClio')}
          <span className="material-symbols-outlined text-base">arrow_outward</span>
        </a>
      )}
    </div>
  )
}
