import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import { useI18n } from '../i18n/I18nContext'

// Unified affiliate disclosure block. Rendered once per page below the
// product CTAs. Only shows when affiliate links are actually live.
export default function AffiliateDisclosure({ className = '' }: { className?: string }) {
  const { t } = useI18n()
  if (!AFFILIATE_ENABLED) return null

  return (
    <p
      className={`text-xs text-slate-400 leading-relaxed ${className}`}
      role="note"
    >
      {t('recProducts.disclosure')}
    </p>
  )
}
