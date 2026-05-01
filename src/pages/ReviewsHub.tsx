import { useState, useMemo } from 'react'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { REVIEW_POSTS, getFeaturedReview } from '../lib/reviews/posts'
import { REVIEW_CATEGORIES, type ReviewCategory, getReviewCategoryMeta } from '../lib/reviews/types'

export default function ReviewsHub() {
  const [activeCategory, setActiveCategory] = useState<ReviewCategory | 'all'>('all')

  const featured = useMemo(() => getFeaturedReview(), [])
  const filtered = useMemo(() => {
    const items =
      activeCategory === 'all'
        ? REVIEW_POSTS
        : REVIEW_POSTS.filter((p) => p.category === activeCategory)
    return items.filter((p) => !p.featured || activeCategory !== 'all')
  }, [activeCategory])

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    counts.set('all', REVIEW_POSTS.length)
    REVIEW_CATEGORIES.forEach((c) => {
      counts.set(c.code, REVIEW_POSTS.filter((p) => p.category === c.code).length)
    })
    return counts
  }, [])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="font-display bg-white min-h-screen">
      <ToolsNav />

      <main>
        {/* Hero — Wirecutter inspired: white, serif, authoritative */}
        <section className="border-b-2 border-navy bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-amber-700 mb-5">
              <span className="w-8 h-px bg-amber-700" />
              kissinskin Reviews
              <span className="w-8 h-px bg-amber-700" />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy leading-[1.05] mb-5 max-w-3xl mx-auto" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              직접 비교한 글로벌<br className="md:hidden" /> 베스트 화장품
            </h1>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Sephora · Olive Young · Amazon 데이터를 통합한 카테고리별 톱 픽. 가성비·럭셔리·비건까지, 진짜 살 만한 제품만 골랐습니다.
            </p>
            <div className="mt-7 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-amber-600">verified</span>
                {REVIEW_POSTS.length}개 비교 리뷰
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-amber-600">workspace_premium</span>
                글로벌 데이터 기반
              </span>
            </div>
          </div>
        </section>

        {/* Featured — TOP PICK editorial spread */}
        {featured && activeCategory === 'all' && (
          <section className="py-12 md:py-16 bg-amber-50/30 border-b border-amber-100">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] rounded">
                  <span className="material-symbols-outlined text-sm">workspace_premium</span>
                  Top Pick
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-amber-700">
                  {getReviewCategoryMeta(featured.category).koLabel}
                </span>
                <span className="text-slate-400 text-xs ml-auto">{formatDate(featured.date)}</span>
              </div>
              <a
                href={`/reviews/${featured.slug}/`}
                className="group block bg-white rounded-none border-y-2 border-navy hover:bg-amber-50/50 transition-all py-8 md:py-12"
              >
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-5 leading-[1.1] text-navy group-hover:text-amber-700 transition-colors max-w-4xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                  {featured.title}
                </h2>
                <p className="text-slate-700 text-base md:text-lg leading-relaxed mb-6 max-w-3xl">
                  {featured.summary}
                </p>
                {featured.products.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm border-t border-slate-200 pt-5">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">우리의 1위 픽</span>
                    <span className="font-bold text-navy">{featured.products[0].brand}</span>
                    <span className="text-slate-700">{featured.products[0].name}</span>
                    <span className="text-amber-700 font-mono font-bold">{featured.products[0].price}</span>
                    <span className="ml-auto inline-flex items-center gap-1 font-bold text-navy group-hover:text-amber-700 group-hover:gap-2 transition-all">
                      전체 리뷰 읽기 <span className="material-symbols-outlined">arrow_forward</span>
                    </span>
                  </div>
                )}
              </a>
            </div>
          </section>
        )}

        {/* Category filter */}
        <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              <CategoryPill
                active={activeCategory === 'all'}
                label="전체 리뷰"
                count={categoryCounts.get('all') || 0}
                onClick={() => setActiveCategory('all')}
              />
              {REVIEW_CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat.code}
                  active={activeCategory === cat.code}
                  label={cat.koLabel}
                  count={categoryCounts.get(cat.code) || 0}
                  onClick={() => setActiveCategory(cat.code)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Reviews — Strategist-inspired editorial cards w/ top pick preview */}
        <section className="py-10 md:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-12">이 카테고리에는 아직 리뷰가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {filtered.map((post) => {
                  const meta = getReviewCategoryMeta(post.category)
                  const top = post.products[0]
                  return (
                    <a
                      key={post.slug}
                      href={`/reviews/${post.slug}/`}
                      className="group block"
                    >
                      <div className="flex items-center gap-2 mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em]">
                        <span style={{ color: meta.color }}>{meta.koLabel}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">{post.products.length}개 비교</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">{post.readMinutes}분</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-3 leading-tight group-hover:text-amber-700 transition-colors" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                        {post.title}
                      </h3>
                      <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4 line-clamp-3">
                        {post.summary}
                      </p>
                      {top && (
                        <div className="border-l-2 border-amber-500 bg-amber-50/40 px-4 py-3 group-hover:bg-amber-50 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-amber-700">우리의 1위</span>
                          </div>
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-navy truncate">{top.brand} · {top.name}</div>
                              <div className="text-xs text-slate-600 truncate">{top.highlight}</div>
                            </div>
                            <span className="text-sm font-mono font-bold text-amber-700 shrink-0">{top.price}</span>
                          </div>
                        </div>
                      )}
                      <div className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-navy group-hover:text-amber-700 group-hover:gap-2 transition-all">
                        리뷰 읽기 <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Trust band — affiliate-style disclosure feel like NYT/Wirecutter */}
        <section className="py-10 bg-slate-50 border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs md:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
              kissinskin Reviews는 광고비를 받지 않습니다. 글로벌 베스트셀러 데이터, 사용자 리뷰, 성분 분석을 종합해 추천 제품을 선정합니다.
            </p>
          </div>
        </section>
      </main>

      <ToolsFooter />
    </div>
  )
}

function CategoryPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 border ${
        active
          ? 'bg-navy text-white border-navy'
          : 'bg-white text-slate-700 border-slate-300 hover:border-amber-500 hover:text-amber-700'
      }`}
    >
      {label}
      <span className={`text-[0.65rem] ${active ? 'opacity-70' : 'text-slate-400'}`}>{count}</span>
    </button>
  )
}
