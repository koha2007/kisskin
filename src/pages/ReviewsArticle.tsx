import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { REVIEW_POSTS, getReviewBySlug } from '../lib/reviews/posts'
import { getReviewCategoryMeta } from '../lib/reviews/types'

interface Props {
  slug: string
}

export default function ReviewsArticle({ slug }: Props) {
  const post = getReviewBySlug(slug)
  if (!post) {
    return (
      <div className="font-display bg-background-light min-h-screen">
        <ToolsNav />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-extrabold text-navy mb-4">리뷰를 찾을 수 없습니다</h1>
          <a
            href="/reviews/"
            className="bg-amber-500 text-white px-6 py-3 rounded-full font-bold inline-flex items-center gap-2"
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
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  const related = REVIEW_POSTS.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3)

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main>
        <section
          className="relative py-14 md:py-20 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${meta.color}15 0%, ${meta.color}30 100%)` }}
        >
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
            <a
              href="/reviews/"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-amber-600 text-sm font-medium mb-4"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              리뷰 홈
            </a>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: `${meta.color}25`, color: meta.color }}
              >
                <span>{meta.emoji}</span>
                {meta.koLabel}
              </span>
              <span className="text-xs text-slate-500">{formatDate(post.date)}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{post.readMinutes}분 읽기</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-bold text-amber-700">{post.products.length}개 제품 비교</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-navy leading-[1.25] tracking-tight mb-4">
              {post.title}
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">{post.summary}</p>
          </div>
        </section>

        <section className="py-10 md:py-14 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <article className="prose prose-slate max-w-none text-slate-700 leading-[1.85] text-[15px] md:text-base mb-10">
              <p>{post.intro}</p>
            </article>

            {/* Product List */}
            <div className="space-y-5">
              {post.products.map((product) => (
                <div
                  key={product.rank}
                  className="bg-white rounded-2xl border border-amber-100 hover:border-amber-300 transition-colors p-6 md:p-7"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-md"
                      style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` }}
                    >
                      {product.rank}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                        {product.brand}
                      </div>
                      <h3 className="text-lg md:text-xl font-extrabold text-navy leading-snug mb-1">
                        {product.name}
                      </h3>
                      <div className="text-sm font-bold" style={{ color: meta.color }}>
                        {product.price}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm md:text-base text-slate-700 leading-relaxed mb-4 pl-16">
                    <span className="font-semibold text-navy">하이라이트:</span> {product.highlight}
                  </p>

                  <div className="grid md:grid-cols-2 gap-3 pl-16">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                      <div className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">
                        ✓ 장점
                      </div>
                      <ul className="space-y-1">
                        {product.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">·</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {product.cons && product.cons.length > 0 && (
                      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                        <div className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">
                          ⚠ 단점
                        </div>
                        <ul className="space-y-1">
                          {product.cons.map((con, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">·</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Outro */}
            <article className="prose prose-slate max-w-none text-slate-700 leading-[1.85] text-[15px] md:text-base mt-10 space-y-5">
              {post.outro.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </article>

            {/* Tags */}
            <div className="mt-10 pt-8 border-t border-amber-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[0.7rem] uppercase tracking-widest font-bold text-slate-400">태그</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full text-slate-600 bg-amber-50/60 border border-amber-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* JSON-LD ItemList */}
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
          </div>
        </section>

        <section className="py-12 bg-gradient-to-br from-amber-50 to-pink-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-xl md:text-2xl font-extrabold text-navy mb-3 tracking-tight">
              내게 어울리는 룩, AI로 직접 시뮬레이션
            </h2>
            <p className="text-slate-600 text-sm mb-6">셀카 한 장으로 9가지 K-뷰티 룩을 30초 안에</p>
            <a
              href="/analysis"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3.5 rounded-full font-bold shadow-lg"
            >
              AI 메이크업 시작
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </section>

        {related.length > 0 && (
          <section className="py-12 md:py-16 bg-white border-t border-amber-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">
                {meta.koLabel} 카테고리 다른 리뷰
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {related.map((r) => (
                  <a
                    key={r.slug}
                    href={`/reviews/${r.slug}/`}
                    className="group block bg-white rounded-2xl overflow-hidden border border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-md transition-all"
                  >
                    <div
                      className="h-32 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${meta.color}20 0%, ${meta.color}05 100%)`,
                      }}
                    >
                      <span className="text-5xl">{meta.emoji}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-extrabold text-navy leading-snug group-hover:text-amber-600 transition-colors line-clamp-3">
                        {r.title}
                      </h3>
                      <div className="text-[0.6rem] text-slate-400 mt-2">{formatDate(r.date)}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <ToolsFooter />
    </div>
  )
}
