import ArticleShell, { type RelatedItem } from '../components/ArticleShell'
import { renderBody } from '../components/ArticleBlocks'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import ProductBuyButtons from '../components/ProductBuyButtons'
import AffiliateDisclosure from '../components/AffiliateDisclosure'
import { REVIEW_POSTS, getReviewBySlug } from '../lib/reviews/posts'
import { getReviewCategoryMeta } from '../lib/reviews/types'
import { clioBrandMatch } from '../config/affiliate'
import { getClioLinkByReviewCategory } from '../lib/affiliate/categoryMapping'

interface Props {
  slug: string
}

// Build a clean Coupang search phrase from a review product's brand + name.
// Strips parenthetical country tags ("Rom&nd (한국)" → "Rom&nd") and keeps only
// the product line before any em/en-dash or colon separator.
function reviewQuery(brand: string, name: string): string {
  const cleanBrand = brand.replace(/\s*\(.*?\)\s*/g, ' ').trim()
  const cleanName = name.split(/[—–:]/)[0].replace(/[“”"'‘’]/g, '').trim()
  return `${cleanBrand} ${cleanName}`.replace(/\s+/g, ' ').trim()
}

export default function ReviewsArticle({ slug }: Props) {
  const post = getReviewBySlug(slug)
  if (!post) {
    return (
      <div className="font-display bg-white min-h-screen">
        <ToolsNav />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">리뷰를 찾을 수 없습니다</h1>
          <a
            href="/reviews/"
            className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full font-semibold"
          >
            리뷰 홈으로
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </main>
        <ToolsFooter />
      </div>
    )
  }

  const meta = getReviewCategoryMeta(post.category)
  const related: RelatedItem[] = REVIEW_POSTS.filter(
    (p) => p.category === post.category && p.slug !== post.slug,
  )
    .slice(0, 3)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      date: r.date,
      categoryLabel: meta.koLabel,
      categoryColor: meta.color,
    }))

  return (
    <ArticleShell
      hubLabel="리뷰 홈"
      hubPath="/reviews/"
      categoryLabel={meta.koLabel}
      categoryColor={meta.color}
      date={post.date}
      readMinutes={post.readMinutes}
      title={post.title}
      summary={post.summary}
      metaExtra={<span>{post.products.length}개 제품 비교</span>}
      tags={post.tags}
      related={related}
      relatedLabel={`${meta.koLabel} 카테고리 다른 리뷰`}
      relatedBasePath="/reviews"
    >
      <article className="prose prose-slate max-w-none text-slate-700 leading-[1.8] mb-10">
        <p className="text-[17px] md:text-[19px] text-slate-800 font-medium">{post.intro}</p>
      </article>

      <ol className="space-y-8 list-none p-0">
        {post.products.map((product) => (
          <li
            key={product.rank}
            className="border-t border-slate-200 pt-7"
          >
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                #{product.rank}
              </span>
              <span className="text-xs text-slate-500">{product.brand}</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-navy leading-snug mb-2">
              {product.name}
            </h3>
            <div className="text-sm text-slate-600 mb-4">
              <span className="font-semibold text-navy">{product.price}</span>
              <span className="text-slate-300 mx-2">·</span>
              <span>{product.highlight}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                  장점
                </div>
                <ul className="space-y-1 text-slate-700">
                  {product.pros.map((pro, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-slate-400 shrink-0">·</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {product.cons && product.cons.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                    단점
                  </div>
                  <ul className="space-y-1 text-slate-700">
                    {product.cons.map((con, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-slate-400 shrink-0">·</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <ProductBuyButtons
              className="mt-5"
              coupangQuery={reviewQuery(product.brand, product.name)}
              clioLink={clioBrandMatch(product.brand) ? getClioLinkByReviewCategory(post.category) : null}
              pageType="review"
              pageSlug={post.slug}
              trackCategory={post.category}
            />
          </li>
        ))}
      </ol>

      <AffiliateDisclosure className="mt-8" />

      <article className="prose prose-slate max-w-none text-slate-700 leading-[1.8] text-[16px] md:text-[17px] mt-12 space-y-6 border-t border-slate-200 pt-10">
        {renderBody(post.outro)}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: post.title,
            description: post.summary,
            numberOfItems: post.products.length,
            itemListElement: post.products.map((p) => ({
              '@type': 'ListItem',
              position: p.rank,
              item: {
                '@type': 'Product',
                name: p.name,
                brand: { '@type': 'Brand', name: p.brand },
                description: p.highlight,
              },
            })),
          }),
        }}
      />
    </ArticleShell>
  )
}
