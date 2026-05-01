import { useState, useMemo } from 'react'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { BLOG_POSTS, getFeaturedPost } from '../lib/blog/posts'
import { BLOG_CATEGORIES, type BlogCategory, getBlogCategoryMeta } from '../lib/blog/types'

export default function BlogHub() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>('all')

  const featured = useMemo(() => getFeaturedPost(), [])
  const filtered = useMemo(() => {
    const items =
      activeCategory === 'all'
        ? BLOG_POSTS
        : BLOG_POSTS.filter((p) => p.category === activeCategory)
    return items.filter((p) => !p.featured || activeCategory !== 'all')
  }, [activeCategory])

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    counts.set('all', BLOG_POSTS.length)
    BLOG_CATEGORIES.forEach((c) => {
      counts.set(c.code, BLOG_POSTS.filter((p) => p.category === c.code).length)
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
        {/* Hero */}
        <section className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-pink-200/30 to-transparent rounded-full blur-3xl translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-widest bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-purple-200 mb-4">
                <span className="material-symbols-outlined text-base">menu_book</span>
                kissinskin Blog
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-navy mb-4 leading-[1.15]">
                뷰티의 호기심을 풀어주는<br className="md:hidden" /> 데이터 기반 인사이트
              </h1>
              <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                K-뷰티 · 글로벌 화장품 · 메이크업 사이언스 · 데이터 분석. 뷰티 산업의 진짜 이야기를 깊이 있게 풀어 드립니다.
              </p>
            </div>
          </div>
        </section>

        {/* Featured */}
        {featured && activeCategory === 'all' && (
          <section className="py-8 md:py-10 -mt-8 md:-mt-12 relative z-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <a
                href={`/blog/${featured.slug}/`}
                className="group block rounded-3xl overflow-hidden bg-white p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 border border-purple-100"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-md">
                      <span>{getBlogCategoryMeta(featured.category).emoji}</span>
                      <span>FEATURED · {getBlogCategoryMeta(featured.category).koLabel}</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-extrabold mb-4 leading-[1.2] text-navy group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
                      {featured.summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs md:text-sm text-slate-500">
                      <span>{formatDate(featured.date)}</span>
                      <span>·</span>
                      <span>{featured.readMinutes}분 읽기</span>
                      <span className="ml-auto inline-flex items-center gap-1 font-bold text-primary group-hover:gap-2 transition-all">
                        읽어보기
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="sticky top-16 z-30 bg-background-light/80 backdrop-blur-md border-b border-purple-100 py-3 mt-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              <CategoryChip
                active={activeCategory === 'all'}
                label="전체"
                emoji="📚"
                count={categoryCounts.get('all') || 0}
                onClick={() => setActiveCategory('all')}
                color="#a855f7"
              />
              {BLOG_CATEGORIES.map((cat) => (
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

        {/* Posts Grid */}
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-12">이 카테고리에는 아직 글이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {filtered.map((post) => {
                  const meta = getBlogCategoryMeta(post.category)
                  return (
                    <a
                      key={post.slug}
                      href={`/blog/${post.slug}/`}
                      className="group block bg-white rounded-2xl overflow-hidden border border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                      {/* Visual top */}
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
                      </div>

                      {/* Content */}
                      <div className="p-5 md:p-6">
                        <h3 className="text-base md:text-lg font-extrabold text-navy mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-3">
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

        {/* Categories block */}
        <section className="py-12 bg-white border-t border-purple-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">
              카테고리별로 읽기
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BLOG_CATEGORIES.map((cat) => (
                <button
                  key={cat.code}
                  onClick={() => {
                    setActiveCategory(cat.code)
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="group p-5 rounded-2xl border bg-white hover:shadow-lg transition-all text-left"
                  style={{ borderColor: `${cat.color}30` }}
                >
                  <div className="text-3xl mb-2">{cat.emoji}</div>
                  <div className="text-sm font-extrabold text-navy mb-0.5">{cat.koLabel}</div>
                  <div className="text-[0.7rem] text-slate-400">
                    글 {categoryCounts.get(cat.code) || 0}개
                  </div>
                </button>
              ))}
            </div>
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
        borderColor: active ? color : '#e9d5ff',
      }}
    >
      <span>{emoji}</span>
      {label}
      <span className="text-[0.65rem] opacity-70">{count}</span>
    </button>
  )
}
