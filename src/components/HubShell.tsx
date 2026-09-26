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
  /** Category emoji — powers the moodboard card header when there's no image. */
  categoryEmoji: string
  /** Optional hero image (photo-led cards). Absent → gradient + emoji fallback. */
  image?: string
  /** 이미지 alt. 없으면 title. 제품처럼 그림이 실물이 아닌 곳은 그 사실을 적어 넘긴다. */
  imageAlt?: string
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

// 한 번에 보여줄 카드 수. 100건이 넘어가면서 "끝까지 스크롤" 말고는 예전 글에
// 닿을 길이 없었다(2026-09-19). 초기 노출을 잘라 페이지를 짧게 만들고, 대신
// 검색·월 필터로 바로 점프하게 한다.
const PAGE_SIZE = 24

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2026-09-14' → '2026-09' */
const monthKey = (iso: string) => iso.slice(0, 7)

function monthLabel(key: string, isEn: boolean) {
  const [y, m] = key.split('-')
  const mi = Number(m) - 1
  return isEn ? `${EN_MONTHS[mi] ?? m} ${y}` : `${y}년 ${Number(m)}월`
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
  return `linear-gradient(150deg, ${color}, color-mix(in srgb, ${color} 55%, #232a52))`
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
  const [query, setQuery] = useState('')
  const [month, setMonth] = useState('all')
  const [limit, setLimit] = useState(PAGE_SIZE)

  const counts = useMemo(() => {
    const c = new Map<string, number>()
    c.set('all', items.length)
    categories.forEach((cat) => {
      c.set(cat.code, items.filter((i) => i.category === cat.code).length)
    })
    return c
  }, [items, categories])

  // 최신 달부터. 목록이 길어질수록 "언제 글인지"가 가장 쓸 만한 좌표다.
  const months = useMemo(() => {
    const set = new Set(items.map((i) => monthKey(i.date)).filter(Boolean))
    return [...set].sort().reverse()
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = items.filter(
      (i) =>
        (active === 'all' || i.category === active) &&
        (month === 'all' || monthKey(i.date) === month) &&
        (!q || i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q)),
    )
    return [...list].sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [items, active, month, query])

  // 조건이 바뀌면 다시 첫 페이지부터 — 안 그러면 좁혀놓고도 예전 limit 이 남는다.
  // (effect 가 아니라 핸들러에서 같이 바꾼다: effect 안의 setState 는 렌더를 한 번 더 부른다)
  const changeActive = (v: string) => { setActive(v); setLimit(PAGE_SIZE) }
  const changeMonth = (v: string) => { setMonth(v); setLimit(PAGE_SIZE) }
  const changeQuery = (v: string) => { setQuery(v); setLimit(PAGE_SIZE) }

  const narrowed = active !== 'all' || month !== 'all' || query.trim() !== ''
  const featured = showFeatured && !narrowed ? filtered[0] : null
  const rest = featured ? filtered.slice(1) : filtered
  const hiddenCount = Math.max(0, rest.length - limit)

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main>
        {/* Header */}
        <section className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-dark mb-3">
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

        {/* Filter — sticky bar. 스크롤을 얼마나 내렸든 여기서 바로 좁힐 수 있다. */}
        <section className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar pt-3 -mx-1">
              <FilterTab
                active={active === 'all'}
                label={isEn ? 'All' : '전체'}
                count={counts.get('all') || 0}
                onClick={() => changeActive('all')}
              />
              {categories.map((cat) => (
                <FilterTab
                  key={cat.code}
                  active={active === cat.code}
                  label={cat.label}
                  count={counts.get(cat.code) || 0}
                  onClick={() => changeActive(cat.code)}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 py-3">
              <label className="relative flex-1 min-w-0">
                <span className="sr-only">{isEn ? 'Search' : '검색'}</span>
                <span
                  className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400"
                  aria-hidden="true"
                >
                  search
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => changeQuery(e.target.value)}
                  placeholder={isEn ? 'Search by keyword' : '키워드로 검색'}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:bg-white focus:outline-none"
                />
              </label>
              <select
                value={month}
                onChange={(e) => changeMonth(e.target.value)}
                aria-label={isEn ? 'Filter by month' : '월별 보기'}
                className="shrink-0 rounded-md border border-slate-200 bg-slate-50 py-2 pl-2.5 pr-7 text-sm font-medium text-navy focus:border-navy focus:bg-white focus:outline-none"
              >
                <option value="all">{isEn ? 'All dates' : '전체 기간'}</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m, isEn)}
                  </option>
                ))}
              </select>
              {narrowed && (
                <button
                  type="button"
                  onClick={() => {
                    changeActive('all')
                    setMonth('all')
                    setQuery('')
                  }}
                  className="shrink-0 px-2.5 py-2 text-xs font-semibold text-slate-500 underline hover:text-navy"
                >
                  {isEn ? 'Reset' : '초기화'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Masonry grid */}
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-12 text-sm">
                {isEn ? 'Nothing matches these filters.' : '조건에 맞는 글이 없습니다.'}
              </p>
            ) : (
              <>
                {narrowed && (
                  <p className="mb-5 text-sm text-slate-500">
                    {isEn ? `${filtered.length} results` : `${filtered.length}건`}
                  </p>
                )}
                {featured && (
                  <FeaturedCard item={featured} href={`${basePath}/${featured.slug}/`} isEn={isEn} />
                )}
                {/* 카드는 전부 DOM 에 남기고 넘치는 분량만 숨긴다. 이 허브가 개별 글로
                    가는 유일한 내부링크라, 조건부 렌더로 빼면 크롤러에겐 링크가 사라진 셈이
                    된다(2026-07-23 미색인 90개 사태와 같은 함정). */}
                <div className="columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-4 [column-fill:_balance]">
                  {rest.map((item, i) => (
                    <MasonryCard
                      key={item.slug}
                      item={item}
                      href={`${basePath}/${item.slug}/`}
                      isEn={isEn}
                      collapsed={i >= limit}
                    />
                  ))}
                </div>
                {hiddenCount > 0 && (
                  <div className="mt-8 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLimit((l) => l + PAGE_SIZE)}
                      className="inline-flex items-center gap-1.5 border-2 border-navy bg-white px-7 py-3 text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white"
                    >
                      <span className="material-symbols-outlined text-base">expand_more</span>
                      {isEn ? 'Show more' : '더 보기'}
                      <span className="opacity-60">
                        {rest.length - hiddenCount} / {rest.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLimit(rest.length)}
                      className="text-xs font-semibold text-slate-500 underline hover:text-navy"
                    >
                      {isEn ? `Show all ${rest.length}` : `${rest.length}건 전부 펼치기`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA — content visitors → AI tool. Closes the funnel that GA shows broken. */}
        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-dark mb-3">
              kissinskin · AI tool
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy mb-2 tracking-tight">
              {isEn ? 'Don’t just read — try it on your own selfie' : '읽기만 하지 말고, 셀카로 직접 시뮬레이션해 보세요'}
            </h2>
            <p className="text-slate-600 text-sm md:text-base mb-6 max-w-xl mx-auto">
              {isEn
                ? 'Pick from 9 K-beauty looks and see it on your own face. First one is free.'
                : '9가지 K-뷰티 룩 중에 골라 내 얼굴에 적용된 결과를 확인하세요. 첫 1회는 무료입니다.'}
            </p>
            <a
              href={isEn ? '/en/' : '/analysis/'}
              className="inline-flex items-center gap-2 bg-primary-dark hover:brightness-90 text-white px-7 py-3.5 text-sm md:text-base font-bold transition-colors"
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

function MasonryCard({
  item,
  href,
  isEn,
  collapsed = false,
}: {
  item: HubItem
  href: string
  isEn: boolean
  /** true = 화면에서만 감춘다(마크업엔 그대로 남아 링크가 유지된다). */
  collapsed?: boolean
}) {
  return (
    <a
      href={href}
      hidden={collapsed}
      /* Tailwind 의 .block 이 UA 의 [hidden]{display:none} 를 이기므로 인라인으로 못박는다. */
      style={collapsed ? { display: 'none' } : undefined}
      className="group mb-4 block break-inside-avoid overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-navy"
    >
      <div
        className={`relative ${slugAspect(item.slug)} flex items-center justify-center`}
        style={{ background: headerGradient(item.categoryColor) }}
      >
        {item.image ? (
          <img src={item.image} alt={item.imageAlt ?? item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22), transparent 60%)' }} />
            <span
              className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/25 text-3xl md:text-4xl shadow-md select-none"
              aria-hidden="true"
            >
              {item.categoryEmoji}
            </span>
          </>
        )}
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
      className="group mb-6 grid md:grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-navy"
    >
      <div
        className="relative min-h-[200px] md:min-h-[300px] flex items-center justify-center"
        style={{ background: headerGradient(item.categoryColor) }}
      >
        {item.image ? (
          <img src={item.image} alt={item.imageAlt ?? item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.24), transparent 58%)' }} />
            <span
              className="relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 text-5xl md:text-6xl shadow-lg select-none"
              aria-hidden="true"
            >
              {item.categoryEmoji}
            </span>
          </>
        )}
        <CategoryChip item={item} size="md" />
      </div>
      <div className="p-6 md:p-9 flex flex-col justify-center">
        <h2 className="font-serif text-2xl md:text-[2rem] font-semibold leading-[1.2] text-navy mb-3 group-hover:text-primary transition-colors">
          {item.title}
        </h2>
        <p className="text-slate-600 text-[15px] leading-relaxed line-clamp-3 mb-4">{item.summary}</p>
        <MetaRow item={item} isEn={isEn} />
        <span className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-primary-dark group-hover:gap-2 transition-all">
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
