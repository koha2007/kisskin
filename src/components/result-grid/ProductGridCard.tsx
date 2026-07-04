// Affiliate product card sized for the masonry grid.
// Region-aware (재설계 지시 §3 + 운영자 ①): Korea → Coupang (+ Clio dual-button
// when the category maps to a Clio link), Global → Amazon + YesStyle. Reuses the
// shared link builders + click tracking so affiliate revenue keeps working.

import type { ProductRec } from '../../lib/recommendations/types'
import {
  AFFILIATE_ENABLED,
  buildSearchLink,
  buildAmazonLink,
  buildYesStyleLink,
} from '../../lib/recommendations/types'
import { useRegion } from '../../hooks/useRegion'
import { useI18n } from '../../i18n/I18nContext'
import { AFFILIATE_CONFIG } from '../../config/affiliate'
import { getClioCategoryByIcon, getClioLinkByIcon } from '../../lib/affiliate/categoryMapping'
import { trackAffiliateClick, type AffiliatePageType } from '../../lib/affiliate/track'
import { GridCard } from './ResultGrid'

// Calm, compact buttons — outline chips instead of a loud full-bleed fill
// (재설계 지시 §4). `border` here sets width only; color comes per-variant.
const btn = 'flex items-center justify-center gap-1.5 w-full text-[12px] font-bold rounded-full py-2 border transition-colors'

export function ProductGridCard({
  item,
  accent = '#eb4763',
  pageType,
  pageSlug,
}: {
  item: ProductRec
  accent?: string
  pageType: AffiliatePageType
  pageSlug: string
}) {
  const [region] = useRegion()
  const { t, locale } = useI18n()
  const isEn = locale === 'en'
  const isGlobal = region === 'global'

  const category = isEn && item.categoryEn ? item.categoryEn : item.category
  const title = isEn && item.titleEn ? item.titleEn : item.title
  const globalQuery = item.categoryEn || item.titleEn || item.title

  const coupangLink = item.affiliateUrl || buildSearchLink(item.searchKeywords)
  const showClio =
    AFFILIATE_CONFIG.clio.enabled && AFFILIATE_CONFIG.clio.shouldShow(item.brandExamples)
  const clioCategory = showClio ? getClioCategoryByIcon(item.icon) : null
  const clioLink = showClio ? getClioLinkByIcon(item.icon) : null

  return (
    <GridCard className="p-4" accent={accent}>
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {item.icon}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-[0.6rem] uppercase tracking-wider font-bold text-slate-400">{category}</div>
          <div className="text-[13px] font-bold text-navy leading-snug truncate">{title}</div>
        </div>
      </div>

      {item.brandExamples.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.brandExamples.map((b) => (
            <span key={b} className="px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200">
              {b}
            </span>
          ))}
        </div>
      )}

      {!AFFILIATE_ENABLED ? (
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
          <span className="material-symbols-outlined text-sm">schedule</span>
          {t('recProducts.comingSoon')}
        </div>
      ) : isGlobal ? (
        <div className="flex flex-col gap-2">
          <a
            href={buildAmazonLink(globalQuery)}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className={`${btn} bg-white`}
            style={{ color: accent, borderColor: `${accent}59` }}
          >
            🛒 {t('region.amazonButton')}
          </a>
          <a
            href={buildYesStyleLink(globalQuery)}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className={`${btn} border border-amber-300 bg-white text-amber-600`}
          >
            ⭐ {t('region.yesstyleButton')}
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <a
            href={coupangLink}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => trackAffiliateClick({ merchant: 'coupang', category: item.icon, pageType, pageSlug })}
            className={`${btn} bg-white`}
            style={{ color: accent, borderColor: `${accent}59` }}
          >
            🛒 {t('recProducts.findProducts')}
          </a>
          {showClio && clioLink && (
            <a
              href={clioLink}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => trackAffiliateClick({ merchant: 'clubclio', category: clioCategory ?? 'main', pageType, pageSlug })}
              className={`${btn} border border-rose-300 bg-white text-rose-500`}
            >
              🌹 {t('recProducts.findOnClio')}
            </a>
          )}
        </div>
      )}
    </GridCard>
  )
}
