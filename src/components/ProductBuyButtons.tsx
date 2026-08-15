import { AFFILIATE_ENABLED, buildSearchLink, buildAmazonLink, buildYesStyleLink } from '../lib/recommendations/types'
import { useI18n } from '../i18n/I18nContext'
import { useRegion } from '../hooks/useRegion'
import { trackAffiliateClick, type AffiliatePageType } from '../lib/affiliate/track'

interface Props {
  // Plain search phrase for Coupang (brand + product line). Required.
  coupangQuery: string
  // 쿠팡 파트너스 단축링크(link.coupang.com/a/xxxxxx). 있으면 검색 URL 대신 이걸 쓴다.
  // 왜 필요한가: 공개 URL 의 lptag attribution 이 막히면(2026-05-12 RET9999 전례)
  // 수수료를 살릴 길은 단축링크뿐인데, 그동안 제품 상세에는 이 배선이 아예 없어
  // `ProductPost.affiliateUrl` 이 타입에만 존재하는 죽은 필드였다(2026-08-15 확인).
  // 도구 결과 카드(ProductGridCard·RecommendedProducts)는 이미 같은 우선순위를 쓴다.
  coupangAffiliateUrl?: string | null
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
  coupangAffiliateUrl,
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
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm font-bold text-white transition-colors"
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
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors"
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
        href={coupangAffiliateUrl || buildSearchLink(coupangQuery)}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={() =>
          trackAffiliateClick({ merchant: 'coupang', category: trackCategory, pageType, pageSlug })
        }
        className="inline-flex items-center gap-1.5 rounded-md bg-primary hover:bg-primary-dark px-4 py-2 text-sm font-bold text-white transition-colors"
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
          className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-white px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
        >
          🌹 {t('recProducts.findOnClio')}
          <span className="material-symbols-outlined text-base">arrow_outward</span>
        </a>
      )}
    </div>
  )
}
