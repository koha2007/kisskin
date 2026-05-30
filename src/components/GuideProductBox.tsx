import { useI18n, pick } from '../i18n/I18nContext'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import ProductBuyButtons from './ProductBuyButtons'
import AffiliateDisclosure from './AffiliateDisclosure'
import RegionToggle from './RegionToggle'
import { GUIDE_CATEGORY_PRODUCTS } from '../lib/guides/products'
import { CLIO_CATEGORY_LINKS } from '../config/affiliate'
import type { GuideCategory } from '../lib/guides/types'

interface Props {
  category: GuideCategory
  slug: string
  accentColor?: string
}

// Recommended-product box rendered at the foot of every guide article.
// Picks products from the guide's category — no per-guide curation needed.
// Localized: KO copy on /guides/*, EN copy on /en/guides/* (the Coupang search
// query stays Korean because Coupang is a Korea-market store).
export default function GuideProductBox({ category, slug, accentColor = '#eb4763' }: Props) {
  const { locale } = useI18n()
  const recs = GUIDE_CATEGORY_PRODUCTS[category]
  if (!AFFILIATE_ENABLED || !recs || recs.length === 0) return null
  const isEn = locale === 'en'

  return (
    <section
      className="mt-12 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 md:p-7"
      aria-label={isEn ? 'Recommended products' : '추천 제품'}
    >
      <div className="mb-5 flex items-center gap-2">
        <span className="text-lg">📦</span>
        <h2 className="text-base md:text-lg font-extrabold text-navy tracking-tight">
          {isEn ? 'Products that pair with this guide' : '이 가이드와 어울리는 추천 제품'}
        </h2>
      </div>

      <RegionToggle pageType="guide" className="mb-5" />

      <div className="grid gap-3 sm:grid-cols-2">
        {recs.map((rec) => (
          <article
            key={rec.label}
            className="flex flex-col rounded-xl border bg-white p-4 md:p-5"
            style={{ borderColor: `${accentColor}25` }}
          >
            <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-1">
              {isEn ? 'Category' : '추천 카테고리'}
            </div>
            <h3 className="text-base font-extrabold text-navy-mid leading-tight mb-1.5">
              {pick(locale, rec.label, rec.labelEn)}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              {pick(locale, rec.desc, rec.descEn)}
            </p>

            <div className="mb-4">
              <div className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                {isEn ? 'Reference brands' : '추천 브랜드'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pick(locale, rec.brands, rec.brandsEn).map((b) => (
                  <span
                    key={b}
                    className="px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-full text-[0.7rem] font-medium text-slate-600"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <ProductBuyButtons
              className="mt-auto"
              coupangQuery={rec.coupangQuery}
              clioLink={rec.clio ? CLIO_CATEGORY_LINKS[rec.clioCategory] : null}
              globalQuery={`${rec.brandsEn[0]} ${rec.labelEn}`}
              pageType="guide"
              pageSlug={slug}
              trackCategory={category}
            />
          </article>
        ))}
      </div>

      <AffiliateDisclosure className="mt-6" />
    </section>
  )
}
