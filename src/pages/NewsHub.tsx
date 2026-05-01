import { useState, useMemo } from 'react'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { NEWS_ITEMS, getFeaturedNews } from '../lib/news/items'
import { NEWS_CATEGORIES, type NewsCategory, getCategoryMeta } from '../lib/news/types'

export default function NewsHub() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'all'>('all')

  const featured = useMemo(() => getFeaturedNews(), [])
  const filtered = useMemo(() => {
    const filteredItems =
      activeCategory === 'all'
        ? NEWS_ITEMS
        : NEWS_ITEMS.filter((n) => n.category === activeCategory)
    return filteredItems.filter((n) => !n.featured || activeCategory !== 'all')
  }, [activeCategory])

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    counts.set('all', NEWS_ITEMS.length)
    NEWS_CATEGORIES.forEach((c) => {
      counts.set(c.code, NEWS_ITEMS.filter((n) => n.category === c.code).length)
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
        <section className="relative py-12 md:py-16 overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-pink-200/40 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-primary-dark text-xs font-bold uppercase tracking-widest bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-pink-200 mb-4">
                <span className="material-symbols-outlined text-base">campaign</span>
                kissinskin News
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-navy mb-3 leading-[1.15]">
                K-뷰티 · 글로벌 화장품<br className="md:hidden" /> 트렌드 뉴스
              </h1>
              <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
                매주 업데이트되는 화장품·메이크업·스킨케어 산업 인사이트. 카테고리별로 필요한 정보만 골라 보세요.
              </p>
            </div>
          </div>
        </section>

        {/* Featured */}
        {featured && activeCategory === 'all' && (
          <section className="py-8 md:py-10 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <a
                href={`/news/${featured.slug}/`}
                className="group block rounded-3xl overflow-hidden bg-gradient-to-br from-navy via-navy-mid to-purple-900 text-white p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 relative"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    <span>{getCategoryMeta(featured.category).emoji}</span>
                    <span>FEATURED · {getCategoryMeta(featured.category).koLabel}</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-extrabold mb-4 leading-[1.2] group-hover:text-pink-100 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-6 max-w-3xl">
                    {featured.summary}
                  </p>
                  <div className="flex items-center gap-4 text-xs md:text-sm text-slate-300">
                    <span>{formatDate(featured.date)}</span>
                    <span>·</span>
                    <span>{featured.readMinutes}분 읽기</span>
                    <span className="ml-auto inline-flex items-center gap-1 font-bold text-white group-hover:gap-2 transition-all">
                      자세히 보기
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="sticky top-16 z-30 bg-background-light/80 backdrop-blur-md border-b border-pink-100 py-3">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              <CategoryChip
                active={activeCategory === 'all'}
                label="전체"
                emoji="📰"
                count={categoryCounts.get('all') || 0}
                onClick={() => setActiveCategory('all')}
                color="#eb4763"
              />
              {NEWS_CATEGORIES.map((cat) => (
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

        {/* News Grid */}
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-12">이 카테고리에는 아직 기사가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {filtered.map((item) => {
                  const meta = getCategoryMeta(item.category)
                  return (
                    <a
                      key={item.slug}
                      href={`/news/${item.slug}/`}
                      className="group block bg-white rounded-2xl p-5 md:p-6 border border-pink-100 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                          style={{ background: `${meta.color}15`, color: meta.color }}
                        >
                          <span>{meta.emoji}</span>
                          {meta.koLabel}
                        </span>
                        <span className="text-[0.65rem] text-slate-400">{formatDate(item.date)}</span>
                      </div>
                      <h3 className="text-base md:text-lg font-extrabold text-navy mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-3">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed line-clamp-3 mb-3">
                        {item.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.7rem] text-slate-400">{item.readMinutes}분 읽기</span>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all text-base">
                          arrow_forward
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Sidebar-like Categories Block (mobile-friendly) */}
        <section className="py-12 bg-white border-t border-pink-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">
              카테고리별 뉴스 둘러보기
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {NEWS_CATEGORIES.map((cat) => (
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
                    기사 {categoryCounts.get(cat.code) || 0}개
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
        borderColor: active ? color : '#fce7f3',
      }}
    >
      <span>{emoji}</span>
      {label}
      <span className="text-[0.65rem] opacity-70">{count}</span>
    </button>
  )
}
