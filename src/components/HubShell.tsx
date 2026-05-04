import { useState, useMemo, type ReactNode } from 'react'
import { ToolsNav, ToolsFooter } from './ToolsLayout'

export type HubItem = {
  slug: string
  title: string
  summary: string
  date: string
  readMinutes: number
  category: string
  categoryLabel: string
  categoryColor: string
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
    <div className="font-display bg-white min-h-screen">
      <ToolsNav />

      <main>
        {/* Header — minimal, no decoration */}
        <section className="border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
              {eyebrow}
            </div>
            <h1 className="text-[26px] md:text-[40px] font-bold text-navy leading-[1.2] tracking-tight mb-3">
              {title}
            </h1>
            <p className="text-slate-600 text-[15px] md:text-lg leading-relaxed">
              {subtitle}
            </p>
            <div className="mt-5 text-xs text-slate-500">
              {totalLabel ?? `${items.length}편`}
            </div>
          </div>
        </section>

        {/* Filter — text-only sticky bar */}
        <section className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar py-3 -mx-1">
              <FilterTab
                active={active === 'all'}
                label="전체"
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

        {/* List */}
        <section className="py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-12 text-sm">
                이 카테고리에는 아직 글이 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {featured && (
                  <li>
                    <a
                      href={`${basePath}/${featured.slug}/`}
                      className="group block py-7 md:py-10 active:bg-slate-50"
                    >
                      <ItemMeta item={featured} />
                      <h2 className="text-[22px] md:text-[32px] font-bold text-navy leading-[1.25] mb-2.5 group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-slate-600 text-[15px] md:text-base leading-relaxed line-clamp-2">
                        {featured.summary}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                        읽기
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </span>
                    </a>
                  </li>
                )}
                {rest.map((item) => (
                  <li key={item.slug}>
                    <a
                      href={`${basePath}/${item.slug}/`}
                      className="group block py-5 md:py-7 active:bg-slate-50"
                    >
                      <ItemMeta item={item} />
                      <h3 className="text-[17px] md:text-xl font-semibold text-navy leading-[1.3] mb-1.5 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-[14px] md:text-base leading-relaxed line-clamp-2">
                        {item.summary}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* CTA — content visitors → AI tool. Closes the funnel that GA shows broken. */}
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
              kissinskin · AI tool
            </div>
            <h2 className="text-lg md:text-xl font-bold text-navy mb-2 tracking-tight">
              읽기만 하지 말고, 셀카로 직접 시뮬레이션해 보세요
            </h2>
            <p className="text-slate-600 text-sm mb-5">
              30초 안에 9가지 K-뷰티 메이크업이 본인 얼굴에 적용된 결과를 확인합니다.
            </p>
            <a
              href="/analysis"
              className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-navy-mid transition-colors"
            >
              AI 메이크업 시작
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </section>
      </main>

      <ToolsFooter />
    </div>
  )
}

function ItemMeta({ item }: { item: HubItem }) {
  return (
    <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: item.categoryColor }}
        />
        <span className="font-semibold text-slate-700">{item.categoryLabel}</span>
      </span>
      <span className="text-slate-300">·</span>
      <span>{formatDate(item.date)}</span>
      <span className="text-slate-300">·</span>
      <span>{item.readMinutes}분</span>
      {item.rightMeta && (
        <>
          <span className="text-slate-300">·</span>
          {item.rightMeta}
        </>
      )}
    </div>
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
