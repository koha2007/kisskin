import { useState, useMemo, type ReactNode } from 'react'
import { ToolsNav, ToolsFooter } from './ToolsLayout'
import { useI18n } from '../i18n/I18nContext'

export type HubItem = {
  slug: string
  title: string
  summary: string
  date: string
  readMinutes: number
  category: string
  categoryLabel: string
  categoryColor: string
  /** Category emoji — powers the moodboard card header (posts carry no image). */
  categoryEmoji: string
  rightMeta?: ReactNode
}

export type HubCategory = {
  code: string
  label: string
}

type Props = {
  eyebrow: string
  title: string
  subtitle: string
  basePath: string
  items: HubItem[]
  categories: HubCategory[]
  totalLabel?: string
  showFeatured?: boolean
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// Deterministic per-slug height so the masonry reads as bricks rather than a
// uniform grid — no images, so the header aspect creates the Pinterest rhythm.
const HEADER_ASPECTS = ['aspect-[4/3]', 'aspect-[1/1]', 'aspect-[5/6]', 'aspect-[4/5]']
function slugAspect(slug: string) {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
  return HEADER_ASPECTS[Math.abs(h) % HEADER_ASPECTS.length]
}

// Category-color gradient header (color → toward navy) — the single accent point.
function headerGradient(color: string) {
  return `linear-gradient(150deg, ${color}, color-mix(in srgb, ${color} 55%, #070953))`
}

export default function HubShell({
  eyebrow,
  title,
  subtitle,
  basePath,
  items,
  categories,
  totalLabel,
  showFeatured = true,
}: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const [active, setActive] = useState<string>('all')

  const counts = useMemo(() => {
    const c = new Map<string, number>()
    c.set('all', items.length)
    categories.forEach((cat) => {
      c.set(cat.code, items.filter((i) => i.category === cat.code).length)
    })
    return c
  }, [items, categories])

  const filtered = useMemo(() => {
    const list = active === 'all' ? items : items.filter((i) => i.category === active)
    return [...list].sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [items, active])

  const featured = showFeatured && active === 'all' ? filtered[0] : null
  const rest = featured ? filtered.slice(1) : filtered

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main>
        {/* Header */}
        <section className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                {eyebrow}
              </div>
              <h1 className="font-serif text-[28px] md:text-[44px] font-semibold text-navy leading-[1.15] tracking-tight mb-3">
                {title}
              </h1>
              <p className="text-slate-600 text-[15px] md:text-lg leading-relaxed">
                {subtitle}
              </p>
              <div className="mt-5 text-xs text-slate-500">
                {totalLabel ?? `${items.length}편`}
              </div>
            </div>
          </div>
        </section>

        {/* Filter — sticky bar */}
        <section className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar py-3 -mx-1">
              <FilterTab
                active={active === 'all'}
                label={isEn ? 'All' : '전체'}
                count={counts.get('all') || 0}
                onClick={() => setActive('all')}
              />
              {categories.map((cat) => (
                <FilterTab
                  key={cat.code}
                  active={active === cat.code}
                  label={cat.label}
                  count={counts.get(cat.code) || 0}
                  onClick={() => setActive(cat.code)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Masonry grid */}
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-12 text-sm">
                {isEn ? 'No articles in this category yet.' : '이 카테고리에는 아직 글이 없습니다.'}
              </p>
            ) : (
              <>
                {featured && (
                  <FeaturedCard item={featured} href={`${basePath}/${featured.slug}/`} isEn={isEn} />
                )}
                <div className="columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-4 [column-fill:_balance]">
                  {rest.map((item) => (
                    <MasonryCard key={item.slug} item={item} href={`${basePath}/${item.slug}/`} isEn={isEn} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA — content visitors → AI tool. Closes the funnel that GA shows broken. */}
        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              kissinskin · AI tool
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy mb-2 tracking-tight">
              {isEn ? 'Don’t just read — try it on your own selfie' : '읽기만 하지 말고, 셀카로 직접 시뮬레이션해 보세요'}
            </h2>
            <p className="text-slate-600 text-sm md:text-base mb-6 max-w-xl mx-auto">
              {isEn
                ? 'See five K-beauty makeup looks rendered on your face in about 30 seconds.'
                : '30초 안에 5가지 K-뷰티 메이크업이 본인 얼굴에 적용된 결과를 확인합니다.'}
            </p>
            <a
              href={isEn ? '/en/' : '/analysis/'}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-pink-500 text-white px-7 py-3.5 rounded-full text-sm md:text-base font-bold shadow-xl shadow-primary/25 hover:from-primary/90 hover:to-pink-500/90 transition-all"
            >
              {isEn ? 'Start AI Makeup' : 'AI 메이크업 시작'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </section>
      </main>

      <ToolsFooter />
    </div>
  )
}

function MetaRow({ item, isEn }: { item: HubItem; isEn: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-slate-400">
      <span>{formatDate(item.date)}</span>
      <span className="text-slate-300">·</span>
      <span>{isEn ? `${item.readMinutes} min` : `${item.readMinutes}분`}</span>
      {item.rightMeta && (
        <>
          <span className="text-slate-300">·</span>
          {item.rightMeta}
        </>
      )}
    </div>
  )
}

function CategoryChip({ item, size = 'sm' }: { item: HubItem; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`absolute ${size === 'md' ? 'left-4 top-4 px-3 py-1 text-xs' : 'left-3 top-3 px-2.5 py-1 text-[11px]'} inline-flex items-center gap-1.5 rounded-full bg-white/90 font-bold text-navy backdrop-blur-sm shadow-sm`}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: item.categoryColor }} />
      {item.categoryLabel}
    </span>
  )
}

function MasonryCard({ item, href, isEn }: { item: HubItem; href: string; isEn: boolean }) {
  return (
    <a
      href={href}
      className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-slate-300"
    >
      <div
        className={`relative ${slugAspect(item.slug)} flex items-center justify-center`}
        style={{ background: headerGradient(item.categoryColor) }}
      >
        <span className="text-5xl md:text-6xl drop-shadow-lg select-none" aria-hidden="true">
          {item.categoryEmoji}
        </span>
        <CategoryChip item={item} />
      </div>
      <div className="p-4">
        <h3 className="font-serif text-[17px] md:text-lg font-semibold leading-snug text-navy mb-1.5 line-clamp-3 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-3 mb-3">{item.summary}</p>
        <MetaRow item={item} isEn={isEn} />
      </div>
    </a>
  )
}

function FeaturedCard({ item, href, isEn }: { item: HubItem; href: string; isEn: boolean }) {
  return (
    <a
      href={href}
      className="group mb-6 grid md:grid-cols-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:border-slate-300"
    >
      <div
        className="relative min-h-[200px] md:min-h-[300px] flex items-center justify-center"
        style={{ background: headerGradient(item.categoryColor) }}
      >
        <span className="text-7xl md:text-8xl drop-shadow-lg select-none" aria-hidden="true">
          {item.categoryEmoji}
        </span>
        <CategoryChip item={item} size="md" />
      </div>
      <div className="p-6 md:p-9 flex flex-col justify-center">
        <h2 className="font-serif text-2xl md:text-[2rem] font-semibold leading-[1.2] text-navy mb-3 group-hover:text-primary transition-colors">
          {item.title}
        </h2>
        <p className="text-slate-600 text-[15px] leading-relaxed line-clamp-3 mb-4">{item.summary}</p>
        <MetaRow item={item} isEn={isEn} />
        <span className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-primary group-hover:gap-2 transition-all">
          {isEn ? 'Read' : '읽기'}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </span>
      </div>
    </a>
  )
}

function FilterTab({
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
      className={`shrink-0 px-3 py-1.5 text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 rounded-md ${
        active
          ? 'bg-navy text-white'
          : 'text-slate-600 hover:text-navy hover:bg-slate-100'
      }`}
    >
      {label}
      <span className={`text-[10px] ${active ? 'opacity-70' : 'text-slate-400'}`}>
        {count}
      </span>
    </button>
  )
}
