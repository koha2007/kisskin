import { useState, useMemo } from 'react'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { NEWS_ITEMS, getFeaturedNews } from '../lib/news/items'
import { NEWS_CATEGORIES, type NewsCategory, getCategoryMeta } from '../lib/news/types'

function relativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return formatAbsoluteDate(iso)
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  return formatAbsoluteDate(iso)
}

function formatAbsoluteDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function NewsHub() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'all'>('all')

  const featured = useMemo(() => getFeaturedNews(), [])
  const filtered = useMemo(() => {
    const filteredItems =
      activeCategory === 'all'
        ? NEWS_ITEMS
        : NEWS_ITEMS.filter((n) => n.category === activeCategory)
    const items = filteredItems.filter((n) => !n.featured || activeCategory !== 'all')
    return [...items].sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [activeCategory])

  const sideRail = useMemo(() => filtered.slice(0, 5), [filtered])
  const mainGrid = useMemo(() => filtered.slice(5), [filtered])

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    counts.set('all', NEWS_ITEMS.length)
    NEWS_CATEGORIES.forEach((c) => {
      counts.set(c.code, NEWS_ITEMS.filter((n) => n.category === c.code).length)
    })
    return counts
  }, [])

  return (
    <div className="font-display bg-white min-h-screen">
      <ToolsNav />

      <main>
        {/* Newsroom masthead */}
        <section className="border-b-2 border-navy bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 md:py-10">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-[0.3em] text-rose-600 mb-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  Live · Beauty Newsroom
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-navy leading-[1.05]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                  kissinskin News
                </h1>
                <p className="text-slate-600 text-sm md:text-base mt-2 max-w-2xl">
                  K-뷰티 · 글로벌 화장품 산업의 트렌드, 신제품, 시장 데이터를 매주 업데이트합니다.
                </p>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </div>
            </div>
          </div>
        </section>

        {/* Featured + Latest sidebar — TechCrunch hero+rail layout */}
        {featured && activeCategory === 'all' && (
          <section className="py-8 md:py-10 border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-3 gap-7 lg:gap-10">
                {/* Lead story */}
                <a
                  href={`/news/${featured.slug}/`}
                  className="lg:col-span-2 group block"
                >
                  <div
                    className="aspect-[16/9] md:aspect-[2/1] rounded-lg flex items-center justify-center text-7xl md:text-9xl mb-5 overflow-hidden relative"
                    style={{ background: `linear-gradient(135deg, ${getCategoryMeta(featured.category).color}25, ${getCategoryMeta(featured.category).color}05)` }}
                  >
                    {getCategoryMeta(featured.category).emoji}
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-rose-600 text-white px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Top Story
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2 text-[0.7rem]">
                    <span className="font-bold uppercase tracking-widest" style={{ color: getCategoryMeta(featured.category).color }}>
                      {getCategoryMeta(featured.category).koLabel}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-mono">{relativeDate(featured.date)}</span>
                  </div>
                  <h2 className="text-xl md:text-3xl lg:text-4xl font-extrabold mb-3 leading-tight text-navy group-hover:text-rose-700 transition-colors" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                    {featured.title}
                  </h2>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed line-clamp-3">
                    {featured.summary}
                  </p>
                </a>

                {/* Latest rail */}
                <aside className="lg:border-l lg:border-slate-200 lg:pl-7">
                  <div className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-slate-500 mb-4 pb-2 border-b border-slate-200">
                    Latest
                  </div>
                  <ul className="divide-y divide-slate-200">
                    {sideRail.map((item) => {
                      const meta = getCategoryMeta(item.category)
                      return (
                        <li key={item.slug}>
                          <a href={`/news/${item.slug}/`} className="group block py-3.5">
                            <div className="flex items-center gap-2 mb-1 text-[0.65rem]">
                              <span className="font-bold uppercase tracking-widest" style={{ color: meta.color }}>{meta.koLabel}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-500 font-mono">{relativeDate(item.date)}</span>
                            </div>
                            <h3 className="text-sm md:text-base font-bold text-navy leading-snug group-hover:text-rose-700 transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </aside>
              </div>
            </div>
          </section>
        )}

        {/* Category filter */}
        <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              <CategoryTab
                active={activeCategory === 'all'}
                label="전체"
                count={categoryCounts.get('all') || 0}
                onClick={() => setActiveCategory('all')}
              />
              {NEWS_CATEGORIES.map((cat) => (
                <CategoryTab
                  key={cat.code}
                  active={activeCategory === cat.code}
                  label={cat.koLabel}
                  count={categoryCounts.get(cat.code) || 0}
                  onClick={() => setActiveCategory(cat.code)}
                  color={cat.color}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Main feed */}
        <section className="py-10 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {(activeCategory === 'all' ? mainGrid : filtered).length === 0 ? (
              <p className="text-center text-slate-500 py-12">이 카테고리에는 아직 기사가 없습니다.</p>
            ) : (
              <>
                <div className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-slate-500 mb-5 pb-2 border-b border-slate-200">
                  {activeCategory === 'all' ? 'More Stories' : getCategoryMeta(activeCategory).koLabel + ' News'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-9">
                  {(activeCategory === 'all' ? mainGrid : filtered).map((item) => {
                    const meta = getCategoryMeta(item.category)
                    return (
                      <a
                        key={item.slug}
                        href={`/news/${item.slug}/`}
                        className="group block border-l-4 pl-4 py-1 hover:-translate-y-0.5 transition-transform"
                        style={{ borderColor: meta.color }}
                      >
                        <div className="flex items-center gap-2 mb-2 text-[0.65rem]">
                          <span className="font-bold uppercase tracking-widest" style={{ color: meta.color }}>{meta.koLabel}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500 font-mono">{relativeDate(item.date)}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500">{item.readMinutes}분</span>
                        </div>
                        <h3 className="text-base md:text-lg font-extrabold text-navy mb-2 leading-snug group-hover:text-rose-700 transition-colors line-clamp-3" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                          {item.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                          {item.summary}
                        </p>
                      </a>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Newsletter signup band */}
        <section className="py-12 bg-navy text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-rose-300 mb-3">Stay updated</div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              매주 K-뷰티 트렌드를 가장 먼저
            </h2>
            <p className="text-slate-300 text-sm md:text-base mb-6 max-w-xl mx-auto">
              주요 신제품, 시장 데이터, 글로벌 트렌드를 한 페이지로 정리해 매주 화요일 발송합니다.
            </p>
            <a href="/blog/" className="inline-flex items-center gap-2 bg-white text-navy px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-100 transition-all">
              인사이트 더 읽기
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </section>
      </main>

      <ToolsFooter />
    </div>
  )
}

function CategoryTab({
  active,
  label,
  count,
  onClick,
  color,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 border-b-2 ${
        active
          ? 'text-navy border-navy'
          : 'text-slate-500 border-transparent hover:text-navy'
      }`}
      style={active && color ? { borderColor: color, color } : undefined}
    >
      {label}
      <span className="text-[0.65rem] opacity-70 font-mono">{count}</span>
    </button>
  )
}
