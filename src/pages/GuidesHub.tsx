import { useState, useMemo } from 'react'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { GUIDE_POSTS, getFeaturedGuide } from '../lib/guides/posts'
import { GUIDE_CATEGORIES, type GuideCategory, getGuideCategoryMeta } from '../lib/guides/types'

type Difficulty = 'easy' | 'medium' | 'pro'

function getDifficulty(readMinutes: number): Difficulty {
  if (readMinutes <= 4) return 'easy'
  if (readMinutes <= 7) return 'medium'
  return 'pro'
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '입문',
  medium: '중급',
  pro: '심화',
}

function DifficultyDots({ level }: { level: Difficulty }) {
  const filled = level === 'easy' ? 1 : level === 'medium' ? 2 : 3
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`난이도 ${DIFFICULTY_LABEL[level]}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i < filled ? '#0f766e' : '#d1d5db' }}
        />
      ))}
    </span>
  )
}

export default function GuidesHub() {
  const [activeCategory, setActiveCategory] = useState<GuideCategory | 'all'>('all')

  const featured = useMemo(() => getFeaturedGuide(), [])
  const filtered = useMemo(() => {
    const items =
      activeCategory === 'all'
        ? GUIDE_POSTS
        : GUIDE_POSTS.filter((p) => p.category === activeCategory)
    return items.filter((p) => !p.featured || activeCategory !== 'all')
  }, [activeCategory])

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    counts.set('all', GUIDE_POSTS.length)
    GUIDE_CATEGORIES.forEach((c) => {
      counts.set(c.code, GUIDE_POSTS.filter((p) => p.category === c.code).length)
    })
    return counts
  }, [])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="font-display bg-[#fdfcf8] min-h-screen">
      <ToolsNav />

      <main>
        {/* Hero — Healthline-inspired editorial header, cream + serif accent */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-emerald-700 mb-4">
              <span className="material-symbols-outlined text-base">menu_book</span>
              <span>The Guides Library</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">{GUIDE_POSTS.length} how-tos</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-navy leading-[1.1] mb-4 max-w-3xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              메이크업, 단계별로<br className="md:hidden" /> 정확하게.
            </h1>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl">
              립스틱 지속력부터 안경 메이크업까지 — 글로벌 아티스트가 매일 쓰는 기술을, 따라할 수 있는 단계로 정리했습니다.
            </p>
            {/* Difficulty legend */}
            <div className="mt-7 inline-flex items-center gap-5 text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700">난이도</span>
              <span className="flex items-center gap-1.5"><DifficultyDots level="easy" /> 입문</span>
              <span className="flex items-center gap-1.5"><DifficultyDots level="medium" /> 중급</span>
              <span className="flex items-center gap-1.5"><DifficultyDots level="pro" /> 심화</span>
            </div>
          </div>
        </section>

        {/* Featured — Editor's pick row */}
        {featured && activeCategory === 'all' && (
          <section className="py-10 md:py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-emerald-700 mb-3">Editor's Pick</div>
              <a
                href={`/guides/${featured.slug}/`}
                className="group block bg-white rounded-2xl border border-slate-200 hover:border-emerald-600 hover:shadow-lg transition-all p-7 md:p-10"
              >
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                  <div
                    className="w-full md:w-48 h-32 md:h-40 rounded-xl flex items-center justify-center text-6xl shrink-0"
                    style={{ background: `${getGuideCategoryMeta(featured.category).color}15`, border: `1px solid ${getGuideCategoryMeta(featured.category).color}30` }}
                  >
                    {getGuideCategoryMeta(featured.category).emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 text-xs">
                      <span className="font-bold uppercase tracking-widest" style={{ color: getGuideCategoryMeta(featured.category).color }}>
                        {getGuideCategoryMeta(featured.category).koLabel}
                      </span>
                      <span className="text-slate-300">·</span>
                      <DifficultyDots level={getDifficulty(featured.readMinutes)} />
                      <span className="text-slate-500">{DIFFICULTY_LABEL[getDifficulty(featured.readMinutes)]}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{featured.readMinutes}분</span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-extrabold mb-3 leading-snug text-navy group-hover:text-emerald-700 transition-colors" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                      {featured.title}
                    </h2>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
                      {featured.summary}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 group-hover:gap-2 transition-all">
                      가이드 읽기
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </section>
        )}

        {/* Filter — categories as text pills, library catalog feel */}
        <section className="sticky top-16 z-30 bg-[#fdfcf8]/95 backdrop-blur-md border-y border-slate-200 py-3">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              <CategoryPill
                active={activeCategory === 'all'}
                label="전체"
                count={categoryCounts.get('all') || 0}
                onClick={() => setActiveCategory('all')}
              />
              {GUIDE_CATEGORIES.map((cat) => (
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

        {/* Posts list — Healthline-inspired list-row layout (not card grid) */}
        <section className="py-10 md:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-12">이 카테고리에는 아직 가이드가 없습니다.</p>
            ) : (
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {filtered.map((post) => {
                  const meta = getGuideCategoryMeta(post.category)
                  const difficulty = getDifficulty(post.readMinutes)
                  return (
                    <a
                      key={post.slug}
                      href={`/guides/${post.slug}/`}
                      className="group flex items-start gap-5 md:gap-7 py-6 md:py-7 hover:bg-white transition-colors -mx-4 md:-mx-6 px-4 md:px-6 rounded-lg"
                    >
                      <div
                        className="w-14 h-14 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-2xl md:text-4xl shrink-0"
                        style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}25` }}
                      >
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-1.5 text-[0.7rem] md:text-xs">
                          <span className="font-bold uppercase tracking-widest" style={{ color: meta.color }}>
                            {meta.koLabel}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1.5 text-slate-500">
                            <DifficultyDots level={difficulty} />
                            {DIFFICULTY_LABEL[difficulty]}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500">{post.readMinutes}분</span>
                          <span className="text-slate-300 hidden md:inline">·</span>
                          <span className="text-slate-400 hidden md:inline">{formatDate(post.date)}</span>
                        </div>
                        <h3 className="text-base md:text-xl font-extrabold text-navy mb-1.5 leading-snug group-hover:text-emerald-700 transition-colors" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                          {post.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                          {post.summary}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all hidden md:block self-center">
                        arrow_forward
                      </span>
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
          : 'bg-white text-slate-700 border-slate-300 hover:border-navy hover:text-navy'
      }`}
    >
      {label}
      <span className={`text-[0.65rem] ${active ? 'opacity-70' : 'text-slate-400'}`}>{count}</span>
    </button>
  )
}
