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
    const list = items.filter((p) => !p.featured || activeCategory !== 'all')
    return [...list].sort((a, b) => (a.date < b.date ? 1 : -1))
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  return (
    <div className="font-display bg-[#faf8f4] min-h-screen">
      <ToolsNav />

      <main>
        {/* Hero — Stripe Press inspired: minimal, big serif, generous whitespace */}
        <section className="bg-[#faf8f4]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-[0.7rem] font-mono uppercase tracking-[0.3em] text-purple-700 mb-6">
              kissinskin · Insights
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-navy leading-[0.95] mb-7" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              뷰티의 진짜 이야기.
            </h1>
            <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-2xl">
              K-뷰티의 시장 데이터, 메디코스메틱 성분의 과학, 100년 화장품의 역사까지 — 단순한 트렌드 너머의 깊이.
            </p>
            <div className="mt-8 flex items-center gap-5 text-sm text-slate-500">
              <span className="font-mono">{BLOG_POSTS.length} essays</span>
              <span className="text-slate-300">·</span>
              <span>매주 업데이트</span>
            </div>
          </div>
        </section>

        {/* Featured — magazine-cover style spread */}
        {featured && activeCategory === 'all' && (
          <section className="bg-white border-y border-slate-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
              <div className="text-[0.7rem] font-mono uppercase tracking-[0.3em] text-purple-700 mb-5">
                Featured Reading · {getBlogCategoryMeta(featured.category).koLabel}
              </div>
              <a href={`/blog/${featured.slug}/`} className="group block">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.05] text-navy group-hover:text-purple-800 transition-colors max-w-3xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                  {featured.title}
                </h2>
                <p className="text-slate-700 text-lg md:text-xl leading-relaxed mb-7 max-w-2xl">
                  {featured.summary}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500 pt-5 border-t border-slate-200">
                  <span className="font-mono">{formatDate(featured.date)}</span>
                  <span className="text-slate-300">·</span>
                  <span>{featured.readMinutes}분 읽기</span>
                  <span className="ml-auto inline-flex items-center gap-1 font-bold text-navy group-hover:text-purple-800 group-hover:gap-2 transition-all">
                    Read essay <span className="material-symbols-outlined">arrow_forward</span>
                  </span>
                </div>
              </a>
            </div>
          </section>
        )}

        {/* Category filter — minimal text-only links */}
        <section className="sticky top-16 z-30 bg-[#faf8f4]/95 backdrop-blur-md border-b border-slate-300 py-3.5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-1 text-xs md:text-sm">
              <CategoryLink
                active={activeCategory === 'all'}
                label="All"
                count={categoryCounts.get('all') || 0}
                onClick={() => setActiveCategory('all')}
              />
              {BLOG_CATEGORIES.map((cat) => (
                <CategoryLink
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

        {/* Posts — Linear blog inspired list, type-driven, no decorative emoji blocks */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-12">이 카테고리에는 아직 글이 없습니다.</p>
            ) : (
              <ul className="divide-y divide-slate-300">
                {filtered.map((post) => {
                  const meta = getBlogCategoryMeta(post.category)
                  return (
                    <li key={post.slug}>
                      <a
                        href={`/blog/${post.slug}/`}
                        className="group block py-7 md:py-9 -mx-4 md:-mx-6 px-4 md:px-6 hover:bg-white rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3 text-[0.7rem] md:text-xs">
                          <span className="font-bold uppercase tracking-[0.2em]" style={{ color: meta.color }}>
                            {meta.koLabel}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500 font-mono">{formatDate(post.date)}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500">{post.readMinutes} min read</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-navy mb-3 leading-tight group-hover:text-purple-800 transition-colors max-w-3xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                          {post.title}
                        </h3>
                        <p className="text-slate-600 text-base md:text-lg leading-relaxed line-clamp-2 max-w-3xl">
                          {post.summary}
                        </p>
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        {/* Closing band — Stripe Press style attribution-feel */}
        <section className="py-14 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-[0.7rem] font-mono uppercase tracking-[0.3em] text-purple-700 mb-3">Editor's note</div>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' }}>
              "메이크업은 표면이지만, 그 뒤에는 100년의 산업, 수억 명의 소비자, 끊임없이 진화하는 과학이 있다. 그 깊이를 한 편의 글로 풀어 드립니다."
            </p>
          </div>
        </section>
      </main>

      <ToolsFooter />
    </div>
  )
}

function CategoryLink({
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
      className={`shrink-0 px-3 py-1.5 font-semibold transition-all flex items-center gap-1.5 ${
        active
          ? 'text-navy border-b-2 border-navy'
          : 'text-slate-500 border-b-2 border-transparent hover:text-navy'
      }`}
    >
      {label}
      <span className="text-[0.65rem] opacity-60 font-mono">{count}</span>
    </button>
  )
}
