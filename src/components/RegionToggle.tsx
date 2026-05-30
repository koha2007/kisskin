import { useI18n } from '../i18n/I18nContext'
import { useRegion, type Region } from '../hooks/useRegion'
import { trackRegionToggle } from '../lib/affiliate/track'
import type { AffiliatePageType } from '../lib/affiliate/track'

interface Props {
  pageType?: AffiliatePageType
  className?: string
}

// Small pill toggle letting readers pick where they'll buy. Switches the product
// CTAs between Korea merchants (Coupang + Clio) and global ones (Amazon + YesStyle).
// State lives in the shared useRegion store, so every CTA + the disclosure update
// together. Rendered just above the product-recommendation block.
export default function RegionToggle({ pageType, className = '' }: Props) {
  const { t, locale } = useI18n()
  const [region, setRegion] = useRegion()

  const select = (r: Region) => {
    if (r === region) return
    setRegion(r)
    trackRegionToggle({ region: r, pageType, locale })
  }

  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all [touch-action:manipulation] min-h-[44px]'
  const on = 'bg-navy text-white shadow-sm'
  const off = 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600 hover:border-slate-300'

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <span className="text-[0.7rem] uppercase tracking-wider font-bold text-slate-400">
        {t('region.label')}
      </span>
      <div
        className="inline-flex gap-1.5 rounded-full bg-slate-50 border border-slate-200 p-1"
        role="group"
        aria-label={t('region.label')}
      >
        <button
          type="button"
          onClick={() => select('korea')}
          aria-pressed={region === 'korea'}
          className={`${base} ${region === 'korea' ? on : off}`}
        >
          {t('region.toggleKorea')}
        </button>
        <button
          type="button"
          onClick={() => select('global')}
          aria-pressed={region === 'global'}
          className={`${base} ${region === 'global' ? on : off}`}
        >
          {t('region.toggleGlobal')}
        </button>
      </div>
    </div>
  )
}
