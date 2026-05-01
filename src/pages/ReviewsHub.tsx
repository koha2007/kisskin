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
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main>
        <section className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-widest bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-amber-200 mb-4">
                <span className="material-symbols-outlined text-base">trophy</span>
                kissinskin Reviews
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-navy mb-4 leading-[1.15]">
                글로벌 베스트셀러 화장품<br className="md:hidden" /> 비교 리뷰
              </h1>
              <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Sephora, Olive Young, 아마존 데이터를 통합한 글로벌 화장품 비교. 카테고리별 톱 10과 가성비 픽까지.
              </p>
            </div>
          </div>
        </section>

        {featured && activeCategory === 'all' && (
          <section className="py-8 md:py-10 -mt-8 md:-mt-12 relative z-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <a
                href={`/reviews/${featured.slug}/`}
                className="group block rounded-3xl overflow-hidden bg-white p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 border border-amber-100"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-md">
                      <span>{getReviewCategoryMeta(featured.category).emoji}</span>
                      <span>FEATURED · {getReviewCategoryMeta(featured.category).koLabel}</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-extrabold mb-4 leading-[1.2] text-navy group-hover:text-amber-600 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
                      {featured.summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs md:text-sm text-slate-500">
                      <span>{formatDate(featured.date)}</span>
                      <span>·</span>
                      <span>{featured.readMinutes}분 읽기</span>
                      <span className="ml-auto inline-flex items-center gap-1 font-bold text-amber-600 group-hover:gap-2 transition-all">
                        리뷰 보기
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </section>
        )}

        <section className="sticky top-16 z-30 bg-background-light/80 backdrop-blur-md border-b border-amber-100 py-3 mt-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              <CategoryChip
                active={activeCategory === 'all'}
                label="전체"
                emoji="🏆"
                count={categoryCounts.get('all') || 0}
                onClick={() => setActiveCategory('all')}
                color="#f59e0b"
              />
              {REVIEW_CATEGORIES.map((cat) => (
                <CategoryChip
                  key={cat.code}
                  active={activeCategory === cat.code}
                  label={cat.koLabel}
                  emoji={cat.emoji}
                  count={categoryCounts.get(cat.code) || 0}
                  onClick={() => setActiveCategory(cat.code)}
                  color={cat.color}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-12">이 카테고리에는 아직 리뷰가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {filtered.map((post) => {
                  const meta = getReviewCategoryMeta(post.category)
                  return (
                    <a
                      key={post.slug}
                      href={`/reviews/${post.slug}/`}
                      className="group block bg-white rounded-2xl overflow-hidden border border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                      <div
                        className="h-40 md:h-48 flex items-center justify-center relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${meta.color}25 0%, ${meta.color}05 100%)`,
                        }}
                      >
                        <div className="text-7xl md:text-8xl opacity-90 group-hover:scale-110 transition-transform duration-500">
                          {meta.emoji}
                        </div>
                        <div className="absolute top-3 left-3">
                          <span
                            className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest px-2 py-1 rounded-full backdrop-blur-sm"
                            style={{ background: `${meta.color}30`, color: meta.color }}
                          >
                            {meta.koLabel}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="text-[0.65rem] font-bold px-2 py-1 rounded-full bg-white/80 text-amber-700">
                            {post.products.length}개 비교
                          </span>
                        </div>
                      </div>
                      <div className="p-5 md:p-6">
                        <h3 className="text-base md:text-lg font-extrabold text-navy mb-2 leading-snug group-hover:text-amber-600 transition-colors line-clamp-3">
                          {post.title}
                        </h3>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed line-clamp-3 mb-3">
                          {post.summary}
                        </p>
                        <div className="flex items-center justify-between text-[0.7rem] text-slate-400">
                          <span>{formatDate(post.date)}</span>
                          <span>{post.readMinutes}분 읽기</span>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <ToolsFooter />
    </div>
  )
}

function CategoryChip({
  active,
  label,
  emoji,
  count,
  onClick,
  color,
}: {
  active: boolean
  label: string
  emoji: string
  count: number
  onClick: () => void
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-3.5 py-2 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 border-2"
      style={{
        background: active ? color : 'white',
        color: active ? 'white' : '#475569',
        borderColor: active ? color : '#fde68a',
      }}
    >
      <span>{emoji}</span>
      {label}
      <span className="text-[0.65rem] opacity-70">{count}</span>
    </button>
  )
}
