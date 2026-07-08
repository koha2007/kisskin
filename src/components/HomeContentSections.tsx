import { useMemo } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { PRODUCT_ITEMS } from '../lib/products/items'
import { PRODUCT_ITEMS_EN } from '../lib/products/items.en'
import { NEWS_ITEMS } from '../lib/news/items'
import { NEWS_ITEMS_EN } from '../lib/news/items.en'
import { getCategoryMeta } from '../lib/news/types'

function byDateDesc<T extends { date: string }>(a: T, b: T) {
  return a.date < b.date ? 1 : -1
}
function gradient(color: string) {
  return `linear-gradient(150deg, ${color}, color-mix(in srgb, ${color} 55%, #070953))`
}
function fmt(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// Homepage exposure for the two daily feeds — photo-led "메이크업 제품" + text "뉴스".
export default function HomeContentSections() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const base = isEn ? '/en' : ''

  const products = useMemo(
    () => [...(isEn ? PRODUCT_ITEMS_EN : PRODUCT_ITEMS)].sort(byDateDesc).slice(0, 4),
    [isEn],
  )
  const news = useMemo(
    () => [...(isEn ? NEWS_ITEMS_EN : NEWS_ITEMS)].sort(byDateDesc).slice(0, 4),
    [isEn],
  )

  return (
    <section className="py-16 md:py-24 bg-cream" aria-labelledby="home-feeds-title">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Makeup Products — photo-led */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              kissinskin · {isEn ? 'Makeup Products' : '메이크업 제품'}
            </div>
            <h2 id="home-feeds-title" className="font-serif text-[24px] md:text-[34px] font-semibold text-navy tracking-tight">
              {isEn ? 'New makeup, picked daily' : '매일 새로 나온 메이크업 제품'}
            </h2>
          </div>
          <a href={`${base}/products/`} className="shrink-0 inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all">
            {isEn ? 'See all' : '전체 보기'}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => {
            const meta = getCategoryMeta(p.category)
            return (
              <a
                key={p.slug}
                href={`${base}/products/${p.slug}/`}
                className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/5] flex items-center justify-center" style={{ background: gradient(meta.color) }}>
                  {p.image ? (
                    <img src={p.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22), transparent 60%)' }} />
                      <span className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/25 text-3xl shadow-md select-none" aria-hidden="true">{meta.emoji}</span>
                    </>
                  )}
                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-navy backdrop-blur-sm">
                    <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                    {isEn ? meta.enLabel : meta.koLabel}
                  </span>
                </div>
                <div className="p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-primary truncate">{p.brand}</div>
                  <h3 className="text-[13px] font-semibold leading-snug text-navy line-clamp-2 group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                </div>
              </a>
            )
          })}
        </div>

        {/* News — text */}
        <div className="flex items-end justify-between gap-4 mt-16 mb-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              kissinskin · {isEn ? 'News' : '뉴스'}
            </div>
            <h2 className="font-serif text-[24px] md:text-[34px] font-semibold text-navy tracking-tight">
              {isEn ? 'K-beauty & global trends' : 'K-뷰티·글로벌 트렌드 뉴스'}
            </h2>
          </div>
          <a href={`${base}/news/`} className="shrink-0 inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all">
            {isEn ? 'See all' : '전체 보기'}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </a>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {news.map((n) => {
            const meta = getCategoryMeta(n.category)
            return (
              <a
                key={n.slug}
                href={`${base}/news/${n.slug}/`}
                className="group flex gap-3 items-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span
                  className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: gradient(meta.color) }}
                  aria-hidden="true"
                >
                  {meta.emoji}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-[11px]">
                    <span className="font-bold" style={{ color: meta.color }}>{isEn ? meta.enLabel : meta.koLabel}</span>
                    <span className="text-slate-400">{fmt(n.date)}</span>
                  </div>
                  <h3 className="text-[14px] font-semibold leading-snug text-navy line-clamp-2 group-hover:text-primary transition-colors">
                    {n.title}
                  </h3>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
