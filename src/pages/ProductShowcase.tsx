import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import ProductBuyButtons from '../components/ProductBuyButtons'
import AffiliateDisclosure from '../components/AffiliateDisclosure'
import RegionToggle from '../components/RegionToggle'
import { PRODUCT_ITEMS, getProductBySlug } from '../lib/products/items'
import { PRODUCT_ITEMS_EN, getProductBySlugEn } from '../lib/products/items.en'
import { getCategoryMeta } from '../lib/products/types'
import { CLIO_CATEGORY_LINKS } from '../config/affiliate'
import { useI18n } from '../i18n/I18nContext'

interface Props {
  slug: string
}

// Photo-led product showcase — leads with a visual (AI mood image, or a design
// gradient card as fallback), then brand/name, a few highlights, and the buy
// buttons that follow the reader's region toggle. Deliberately light on prose.
export default function ProductShowcase({ slug }: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const items = isEn ? PRODUCT_ITEMS_EN : PRODUCT_ITEMS
  const item = isEn ? getProductBySlugEn(slug) : getProductBySlug(slug)
  const hubPath = isEn ? '/en/products/' : '/products/'
  const hubBase = isEn ? '/en/products' : '/products'
  const siteBase = isEn ? 'https://kissinskin.net/en/products' : 'https://kissinskin.net/products'

  if (!item) {
    return (
      <div className="font-display bg-white min-h-screen">
        <ToolsNav />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">
            {isEn ? 'Product not found' : '제품을 찾을 수 없습니다'}
          </h1>
          <a
            href={hubPath}
            className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-semibold"
          >
            {isEn ? 'Back to products' : '메이크업 제품 홈으로'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </main>
        <ToolsFooter />
      </div>
    )
  }

  const meta = getCategoryMeta(item.category)
  const categoryLabel = isEn ? meta.enLabel : meta.koLabel
  const gradient = `linear-gradient(150deg, ${meta.color}, color-mix(in srgb, ${meta.color} 55%, #070953))`
  const related = items.filter((p) => p.category === item.category && p.slug !== item.slug).slice(0, 4)

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="mb-5 text-[13px] text-slate-500">
          <a href={hubPath} className="hover:text-primary font-medium">
            {isEn ? 'Makeup Products' : '메이크업 제품'}
          </a>
          <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-slate-400">{categoryLabel}</span>
        </nav>

        {/* Hero — image, or design gradient fallback */}
        <div
          className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm aspect-[4/5] sm:aspect-[16/10] flex items-center justify-center"
          style={{ background: gradient }}
        >
          {item.image ? (
            <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.28), transparent 55%)' }}
              />
              <span className="pointer-events-none absolute -bottom-3 right-4 font-serif font-bold uppercase tracking-tight text-white/10 text-6xl sm:text-8xl leading-none select-none">
                {item.brand}
              </span>
              <div className="relative flex flex-col items-center gap-4 px-6 text-center">
                <span
                  className="flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 text-5xl md:text-6xl shadow-lg select-none"
                  aria-hidden="true"
                >
                  {meta.emoji}
                </span>
                <span className="text-white/85 text-[13px] font-bold uppercase tracking-[0.15em]">{categoryLabel}</span>
              </div>
            </>
          )}
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-navy backdrop-blur-sm shadow-sm">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
            {categoryLabel}
          </span>
        </div>

        {/* Brand + name */}
        <div className="mt-6">
          <div className="text-[13px] font-bold uppercase tracking-[0.15em] text-primary">{item.brand}</div>
          <h1 className="mt-1.5 font-serif text-[26px] md:text-[34px] font-semibold leading-tight text-navy tracking-tight">
            {item.name}
          </h1>
          <p className="mt-3 text-slate-600 text-[15px] md:text-[17px] leading-relaxed">{item.summary}</p>
        </div>

        {/* Highlights — short, visual chips */}
        {item.highlights.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {item.highlights.map((h) => (
              <li
                key={h}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy shadow-sm"
              >
                <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Details — longer, concrete feature sentences */}
        {item.details && item.details.length > 0 && (
          <section className="mt-7">
            <h2 className="text-sm font-bold tracking-[0.12em] text-slate-500 uppercase mb-3">
              {isEn ? 'Details' : '제품 특징'}
            </h2>
            <ul className="space-y-2.5">
              {item.details.map((d) => (
                <li key={d} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
                  <span
                    className="material-symbols-outlined text-[19px] text-primary shrink-0 mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Buy — region-aware affiliate buttons */}
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-navy">{isEn ? 'Where to buy' : '구매하기'}</h2>
            <RegionToggle pageType="product" />
          </div>
          <ProductBuyButtons
            coupangQuery={item.coupangQuery}
            globalQuery={item.globalQuery}
            clioLink={item.clio ? CLIO_CATEGORY_LINKS[item.clioCategory] : null}
            pageType="product"
            pageSlug={item.slug}
            trackCategory={item.category}
          />
          <AffiliateDisclosure className="mt-4" />
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-bold tracking-[0.12em] text-slate-500 uppercase mb-4">
              {isEn ? `More ${categoryLabel}` : `${categoryLabel} 제품 더 보기`}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map((r) => {
                const rMeta = getCategoryMeta(r.category)
                return (
                  <a
                    key={r.slug}
                    href={`${hubBase}/${r.slug}/`}
                    className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div
                      className="relative aspect-[4/5] flex items-center justify-center"
                      style={{ background: `linear-gradient(150deg, ${rMeta.color}, color-mix(in srgb, ${rMeta.color} 55%, #070953))` }}
                    >
                      {r.image ? (
                        <img src={r.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22), transparent 60%)' }} />
                          <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/25 text-3xl shadow-md select-none" aria-hidden="true">{rMeta.emoji}</span>
                        </>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-primary truncate">{r.brand}</div>
                      <h3 className="text-[13px] font-semibold leading-snug text-navy line-clamp-2 group-hover:text-primary transition-colors">
                        {r.name}
                      </h3>
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        )}

        <div className="mt-10">
          <a href={hubPath} className="inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-primary">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            {isEn ? 'All makeup products' : '메이크업 제품 전체 보기'}
          </a>
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `${item.brand} ${item.name}`,
            brand: { '@type': 'Brand', name: item.brand },
            description: item.summary,
            category: categoryLabel,
            ...(item.image ? { image: `https://kissinskin.net${item.image}` } : {}),
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteBase}/${item.slug}/` },
          }),
        }}
      />

      <ToolsFooter />
    </div>
  )
}
