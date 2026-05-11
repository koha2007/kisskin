import type { ProductRec } from '../lib/recommendations/types'
import { AFFILIATE_ENABLED, buildSearchLink } from '../lib/recommendations/types'
import { useI18n } from '../i18n/I18nContext'

interface Props {
  items: ProductRec[]
  accentColor?: string
  accentGradient?: string
  headingEmoji?: string
  subtitle?: string
}

export default function RecommendedProducts({
  items,
  accentColor = '#eb4763',
  accentGradient = 'from-primary to-pink-500',
  headingEmoji = '🛍️',
  subtitle,
}: Props) {
  const { t, locale } = useI18n()
  const isEn = locale === 'en'
  if (!items.length) return null

  return (
    <section className="py-12 md:py-16 bg-white" aria-label={t('recProducts.aria')}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-3 flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-600">
            <span>{headingEmoji}</span>
            {t('recProducts.badge')}
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-navy tracking-tight">
            {t('recProducts.heading')}
          </h2>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">{subtitle || t('recProducts.defaultSubtitle')}</p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {items.map((item, i) => (
            <article
              key={i}
              className="relative bg-white rounded-2xl border p-5 md:p-6 hover:shadow-lg transition-shadow"
              style={{ borderColor: `${accentColor}25` }}
            >
              {/* Category chip */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                    style={{ background: accentColor }}
                  >
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400">
                      {isEn && item.categoryEn ? item.categoryEn : item.category}
                    </div>
                    <h3 className="text-base md:text-lg font-extrabold text-navy-mid leading-tight">
                      {isEn && item.titleEn ? item.titleEn : item.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Why for type */}
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {isEn && item.whyForTypeEn ? item.whyForTypeEn : item.whyForType}
              </p>

              {/* Features checklist */}
              <div className="mb-4">
                <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-2">
                  {t('recProducts.featuresLabel')}
                </div>
                <ul className="flex flex-col gap-1.5">
                  {(isEn && item.featuresEn ? item.featuresEn : item.features).map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-slate-600">
                      <span
                        className="material-symbols-outlined text-base mt-0.5 shrink-0"
                        style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brand examples */}
              <div className="mb-4">
                <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-2">
                  {t('recProducts.brandsLabel')}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.brandExamples.map((b, bi) => (
                    <span
                      key={bi}
                      className="px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-full text-[0.7rem] font-medium text-slate-600"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA — safe Google Shopping search for now; affiliate-ready structure */}
              {AFFILIATE_ENABLED ? (
                <a
                  href={item.affiliateUrl || buildSearchLink(item.searchKeywords)}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r ${accentGradient} bg-clip-text text-transparent group-hover:gap-2 transition-all`}
                >
                  {t('recProducts.findProducts')}
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ color: accentColor }}
                  >
                    arrow_outward
                  </span>
                </a>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {t('recProducts.comingSoon')}
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Disclosure — only when affiliate enabled */}
        {AFFILIATE_ENABLED && (
          <p className="mt-8 text-center text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('recProducts.disclosure')}
          </p>
        )}
      </div>
    </section>
  )
}
