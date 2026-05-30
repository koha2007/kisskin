import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import { useI18n } from '../i18n/I18nContext'
import { useRegion } from '../hooks/useRegion'

// Unified affiliate disclosure block. Rendered once per page below the
// product CTAs. Text follows the region toggle: Korea names Coupang/Clio as
// affiliate links; Global notes Amazon/YesStyle are plain search (not affiliate).
export default function AffiliateDisclosure({ className = '' }: { className?: string }) {
  const { t } = useI18n()
  const [region] = useRegion()
  if (!AFFILIATE_ENABLED) return null

  return (
    <p
      className={`text-xs text-slate-400 leading-relaxed ${className}`}
      role="note"
    >
      {t(region === 'global' ? 'recProducts.disclosureGlobal' : 'recProducts.disclosure')}
    </p>
  )
}
