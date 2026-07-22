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
  const gradient = `linear-gradient(150deg, ${meta.color}, color-mix(in srgb, ${meta.color} 55%, #232a52))`
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
          className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm aspect-[4/5] sm:aspect-[3/4] sm:max-w-md sm:mx-auto flex items-center justify-center"
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

        {/* 누구에게 맞나 / 사용법 / 장단점 — 2026-07-14 신설.
            제품 상세가 726자뿐이라 구글이 색인을 안 붙였고(“크롤링됨 – 색인 안 됨”),
            Commission Factory 도 같은 이유로 반려했다. 항목 구성은 CF 가 공개한
            “좋은 제휴 리뷰란?” 가이드를 따랐다. 필드가 없는 구 제품은 통째로 렌더되지 않는다. */}
        {item.whoFor && (
          <section className="mt-7">
            <h2 className="text-sm font-bold tracking-[0.12em] text-slate-500 uppercase mb-3">
              {isEn ? 'Who it suits' : '누구에게 맞나'}
            </h2>
            <p className="text-[15px] leading-relaxed text-slate-700">{item.whoFor}</p>
          </section>
        )}

        {item.colorFit && (
          <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-sm font-bold tracking-[0.12em] text-slate-500 uppercase mb-2">
              {isEn ? 'Personal color fit' : '어울리는 퍼스널 컬러'}
            </h2>
            <p className="text-[15px] leading-relaxed text-slate-700">{item.colorFit}</p>
            <a
              href={isEn ? '/en/tools/personal-color/' : '/tools/personal-color/'}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-primary"
            >
              {isEn ? 'Not sure which you are? Find out free' : '내 퍼스널 컬러가 뭔지 모른다면 — 무료 진단'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </section>
        )}

        {item.howTo && item.howTo.length > 0 && (
          <section className="mt-7">
            <h2 className="text-sm font-bold tracking-[0.12em] text-slate-500 uppercase mb-3">
              {isEn ? 'How to use it' : '사용법'}
            </h2>
            <ol className="space-y-2.5">
              {item.howTo.map((h, i) => (
                <li key={h} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
                  <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-navy text-white text-[11px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {((item.pros && item.pros.length > 0) || (item.cons && item.cons.length > 0)) && (
          <section className="mt-7 grid gap-4 sm:grid-cols-2">
            {item.pros && item.pros.length > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-5">
                <h2 className="text-sm font-bold text-emerald-800 mb-3">
                  {isEn ? 'What works' : '좋은 점'}
                </h2>
                <ul className="space-y-2">
                  {item.pros.map((p) => (
                    <li key={p} className="text-[14px] leading-relaxed text-slate-700">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.cons && item.cons.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-5">
                <h2 className="text-sm font-bold text-amber-800 mb-3">
                  {isEn ? 'What to know first' : '알아둘 점'}
                </h2>
                <ul className="space-y-2">
                  {item.cons.map((c) => (
                    <li key={c} className="text-[14px] leading-relaxed text-slate-700">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
                      style={{ background: `linear-gradient(150deg, ${rMeta.color}, color-mix(in srgb, ${rMeta.color} 55%, #232a52))` }}
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

      {/* Product 스키마가 아니라 Article 이다 — 의도적이다.
          우리는 이 제품을 **팔지 않는다**(쿠팡·클리오로 보낼 뿐). schema.org/Product 는 리치결과를
          받으려면 offers / review / aggregateRating 중 하나가 필수인데, 셋 다 우리가 정직하게
          채울 수 없다(가격 모름, 우리가 매긴 평점 없음). 실제로 서치콘솔이 이 페이지들을
          "'offers', 'review' 또는 'aggregateRating'을 지정해야 합니다" 오류 7건으로 잡았다.
          ⚠ 평점을 지어내서 채우지 말 것 — 과거에 가짜 평점(4.8/150)을 넣었다가 구글 정책 위반으로
          걷어낸 전과가 있다. 이 페이지의 실체는 "제품을 소개하는 글"이므로 Article 이 정직하고 유효하다. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${item.brand} ${item.name}`,
            description: item.summary,
            articleSection: categoryLabel,
            inLanguage: isEn ? 'en' : 'ko',
            datePublished: item.date,
            dateModified: item.date,
            ...(item.image ? { image: `https://kissinskin.net${item.image}` } : {}),
            author: { '@type': 'Organization', name: 'kissinskin', url: 'https://kissinskin.net/' },
            publisher: {
              '@type': 'Organization',
              name: 'kissinskin',
              logo: { '@type': 'ImageObject', url: 'https://kissinskin.net/logo-sm.webp' },
            },
            about: { '@type': 'Thing', name: `${item.brand} ${item.name}` },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteBase}/${item.slug}/` },
          }),
        }}
      />

      <ToolsFooter />
    </div>
  )
}
