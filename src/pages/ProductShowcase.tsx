import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import ProductBuyButtons from '../components/ProductBuyButtons'
import AffiliateDisclosure from '../components/AffiliateDisclosure'
import RegionToggle from '../components/RegionToggle'
import { PRODUCT_ITEMS, getProductBySlug } from '../lib/products/items'
import { PRODUCT_ITEMS_EN, getProductBySlugEn } from '../lib/products/items.en'
import { getCategoryMeta } from '../lib/products/types'
import { CLIO_CATEGORY_LINKS, clioBrandMatch } from '../config/affiliate'
import { useI18n } from '../i18n/I18nContext'
import { pickRelated } from '../lib/seo/pickRelated'

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
  // 같은 카테고리 앞 4개만 뽑으면 그 4개만 계속 링크를 받는다(뉴스·가이드와 같은 문제).
  // 현재 글 위치에서 한 칸씩 밀어 원형으로 뽑아 모든 제품 글이 인바운드를 갖게 한다.
  const related = pickRelated(items, item, 4)

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

        {/* Hero — image, or design gradient fallback.
            ⚠️ 이 이미지는 **제품 사진이 아니다.** scripts/gen-products.mjs 의 프롬프트가
            'Show only the person — no product packaging, no tubes, no bottles.' 로
            제품을 명시적으로 배제한 AI 연출컷이다(효과를 보여주는 그림).

            2026-08-15 에 높이를 줄였다. 네이버에서 **제품명으로** 검색해 들어온 사람이
            390×844 모바일 첫 화면의 454px(54%)을 이 그림에 쓰고 있었는데, 정작 그들이
            찾던 제품은 그림에 없다. Clarity 실측 결과 제품 페이지 체류가 1·2·3·5·10·12·
            17·20초에 클릭 전부 0 이었다(tamburins 5세션·nars 4세션 등, 62세션 중 41이
            네이버). "내가 찾던 그거 맞나?"에 첫 화면이 답을 못 하면 그냥 나간다.

            ⚠️ max-h 로 높이를 조이면 aspect-ratio 가 폭을 함께 줄인다 → mx-auto 가 없으면
            왼쪽으로 쏠리고 오른쪽에 빈 칸이 남는다(sm: 에만 있던 것을 상시로 올렸다). */}
        <div
          className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm aspect-[4/5] max-h-[38vh] mx-auto sm:max-h-none sm:aspect-[3/4] sm:max-w-md flex items-center justify-center"
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
          {/* 연출컷임을 밝힌다. 이 그림에는 제품이 없는데(프롬프트가 용기·튜브·병을
              배제한다) 제품 상세의 최상단에 크게 놓이면 제품 사진으로 읽힌다.
              밝히지 않으면 방문자에게 사실이 아닌 인상을 주는 것이고, 그건 이 리포가
              가짜 평점(4.8/150)을 걷어낼 때 세운 기준과 같은 종류의 문제다. */}
          {item.image && (
            <span className="absolute right-3 bottom-3 rounded-full bg-navy/55 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
              {isEn ? 'Illustrative image — not the product' : '이미지는 연출컷 · 실제 제품 아님'}
            </span>
          )}
        </div>

        {/* Brand + name */}
        <div className="mt-6">
          <div className="text-[13px] font-bold uppercase tracking-[0.15em] text-primary">{item.brand}</div>
          <h1 className="mt-1.5 font-serif text-[26px] md:text-[34px] font-semibold leading-tight text-navy tracking-tight">
            {item.name}
          </h1>
          {/* 영문 제품명 병기 — 한글 페이지에만.
              왜: 이 제품들은 실재하는 상품이고 해외에서는 영문명으로 검색된다.
              그런데 한글 상세에는 영문명이 단 한 번도 등장하지 않아("Dr.G Red Blemish
              Clear Soothing Cream" 0회) 영어 검색어와 맞물릴 지점이 아예 없었다.
              globalQuery 는 이미 갖고 있는 실제 영문 브랜드+제품명이다 — 지어내는 정보가
              아니라 있는 데이터를 드러내는 것. EN 페이지는 본문이 이미 영문이라 생략. */}
          {!isEn && item.globalQuery && (
            <p className="mt-1 text-[13px] font-medium text-slate-400 tracking-tight">{item.globalQuery}</p>
          )}
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

        {/* Buy — region-aware affiliate buttons.
            2026-08-15 에 본문 맨 뒤에서 여기로 올렸다. 실측(390×844)에서 구매 링크가
            페이지의 **53.5%** 지점(2026px)에 있었는데, 이 페이지 방문자의 체류는
            1~20초다. 아무도 도달하지 못하는 자리에 있었고 실제로 어필리에이트 클릭이
            0 이었다. 제품명으로 검색해 온 사람에게 "어디서 사나"는 상세 설명보다
            먼저 나와야 하는 정보다 — 상세는 이미 살 마음이 있는 사람이 읽는다.
            (같은 종류의 실수를 face-shape 결과에서도 했다 — 743bd48.) */}
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-navy">{isEn ? 'Where to buy' : '구매하기'}</h2>
            <RegionToggle pageType="product" />
          </div>
          {/* clioLink: item.clio 는 "색조 카테고리라 클리오에 해당 매대가 있다"까지만
              뜻한다(gen-products.mjs 가 카테고리로만 정한다). 실제로 버튼을 붙일지는
              브랜드가 결정한다 — 안 그러면 나스·디올 페이지에 클럽클리오 매대 링크가
              붙는다. 자세한 이유는 config/affiliate.ts clioBrandMatchAny 주석. */}
          <ProductBuyButtons
            coupangQuery={item.coupangQuery}
            coupangAffiliateUrl={item.affiliateUrl}
            globalQuery={item.globalQuery}
            clioLink={
              item.clio && clioBrandMatch(item.brand)
                ? CLIO_CATEGORY_LINKS[item.clioCategory]
                : null
            }
            pageType="product"
            pageSlug={item.slug}
            trackCategory={item.category}
          />
          <AffiliateDisclosure className="mt-4" />
        </section>

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
          // 이 페이지는 "실재하는 상품에 대한 글" 이다 → 글(Article)과 상품(Product)을
          // 따로 선언하고 about 으로 잇는다. 예전엔 상품을 about: Thing(이름뿐) 으로만
          // 흘려서, 검색엔진이 이 페이지를 제품 페이지로 이해할 근거가 없었다.
          //
          // ⚠️ offers(가격·재고)·aggregateRating(평점)·review 는 **넣지 않는다.**
          //    우리는 그 데이터를 갖고 있지 않다. 지어내면 구조화 데이터 정책 위반이고
          //    (2026-07-12 에 가짜 평점 4.8/150 을 이미 한 번 걷어냈다), 리치 결과가
          //    걸려도 거짓 정보가 SERP 에 뜬다. 있는 것만 — 이름·브랜드·이미지·설명·분류.
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Product',
                '@id': `${siteBase}/${item.slug}/#product`,
                name: `${item.brand} ${item.name}`,
                // 한글 페이지엔 실제 영문 제품명을, 영문 페이지엔 별칭 없이.
                ...(!isEn && item.globalQuery ? { alternateName: item.globalQuery } : {}),
                brand: { '@type': 'Brand', name: item.brand },
                category: categoryLabel,
                description: item.summary,
                // ⚠️ image 를 **일부러 뺐다**(2026-08-15). 우리가 가진 그림은 제품 사진이
                // 아니라 AI 연출컷이다 — gen-products.mjs 프롬프트가 'no product
                // packaging, no tubes, no bottles' 로 제품을 명시적으로 배제한다.
                // 그걸 Product.image 로 넘기면 "이게 그 제품의 사진"이라고 구글에
                // 말하는 것이고, 위 주석이 가격·평점에 세운 기준("있는 것만", 지어내면
                // 정책 위반)에 그대로 걸린다. 가짜 평점 4.8/150 을 걷어낸 것과 같은 종류다.
                // ⭐ 실제 제품 사진을 확보하면 그때 다시 넣을 것.
                // Article.image 는 그대로 둔다 — 그건 이 **글의 삽화**가 맞다.
                url: `${siteBase}/${item.slug}/`,
              },
              {
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
                about: { '@id': `${siteBase}/${item.slug}/#product` },
                mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteBase}/${item.slug}/` },
              },
            ],
          }),
        }}
      />

      <ToolsFooter />
    </div>
  )
}
