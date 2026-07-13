import { AFFILIATE_ENABLED, buildSearchLink, buildAmazonLink, buildYesStyleLink } from '../lib/recommendations/types'
import { useI18n } from '../i18n/I18nContext'
import { useRegion } from '../hooks/useRegion'
import { trackAffiliateClick, type AffiliatePageType } from '../lib/affiliate/track'

interface Props {
  // Plain search phrase for Coupang (brand + product line). Required.
  coupangQuery: string
  // Clio storefront URL — pass null/undefined to hide the Clio button.
  clioLink?: string | null
  // English brand + product phrase for Amazon/YesStyle search (region: global).
  // Falls back to coupangQuery when absent.
  globalQuery?: string
  // GA4 affiliate_click attribution.
  pageType: AffiliatePageType
  pageSlug: string
  trackCategory: string
  className?: string
}

// Reusable buy buttons that follow the reader's region toggle:
//   korea  → Coupang + (optional) Clio affiliate pills
//   global → Amazon + YesStyle plain-search pills
// Shared by review articles and guide pages.
export default function ProductBuyButtons({
  coupangQuery,
  clioLink,
  globalQuery,
  pageType,
  pageSlug,
  trackCategory,
  className = '',
}: Props) {
  const { t } = useI18n()
  const [region] = useRegion()
  if (!AFFILIATE_ENABLED) return null

  if (region === 'global') {
    const q = globalQuery || coupangQuery
    return (
      <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
        <a
          href={buildAmazonLink(q)}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          onClick={() =>
            trackAffiliateClick({ merchant: 'amazon', category: trackCategory, pageType, pageSlug })
          }
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm hover:shadow-md hover:brightness-105 transition-all"
        >
          🛒 {t('region.amazonButton')}
          <span className="material-symbols-outlined text-base">arrow_outward</span>
        </a>
        <a
          href={buildYesStyleLink(q)}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          onClick={() =>
            trackAffiliateClick({ merchant: 'yesstyle', category: trackCategory, pageType, pageSlug })
          }
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors"
        >
          ⭐ {t('region.yesstyleButton')}
          <span className="material-symbols-outlined text-base">arrow_outward</span>
        </a>
      </div>
    )
  }

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
