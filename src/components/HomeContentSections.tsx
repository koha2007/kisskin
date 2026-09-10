import { useMemo } from 'react'
import { useI18n } from '../i18n/I18nContext'
import SectionHeader from './home/SectionHeader'
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

const SEE_ALL_BTN =
  'inline-flex items-center gap-2 border border-navy/25 hover:border-navy text-navy px-8 py-3.5 font-bold text-sm transition-colors'

// Homepage exposure for the two daily feeds — both photo-led ("메이크업 제품" + "뉴스"),
// sharing the same 4-up card grid; news cards fall back to gradient + emoji when no mood image.
// 2026-09-10: 두 헤더를 다른 섹션들과 같은 공통 SectionHeader(가운데·동일 크기·색)로 통일.
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
    <>
      {/* ── 메이크업 제품 (매일 자동 발행) ── */}
      <section className="py-16 md:py-24 bg-cream" aria-labelledby="feed-products-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            titleId="feed-products-title"
            eyebrow={isEn ? 'Updated daily' : '매일 업데이트'}
            title={isEn ? 'New makeup products, daily' : '매일 새로 나오는 메이크업 제품'}
            subtitle={isEn ? 'Fresh drops and restocks, photo first.' : '신상·재입고 소식을 사진 위주로 모았어요.'}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {products.map((p) => {
              const meta = getCategoryMeta(p.category)
              return (
                <a
                  key={p.slug}
                  href={`${base}/products/${p.slug}/`}
                  className="group block overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-navy"
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
          <div className="text-center mt-10 md:mt-12">
            <a href={`${base}/products/`} className={SEE_ALL_BTN}>
              {isEn ? 'See all products' : '메이크업 제품 전체 보기'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── K-뷰티 글로벌 트렌드 뉴스 (매일 자동 발행) ── */}
      <section className="py-16 md:py-24 bg-cream border-t border-slate-200/70" aria-labelledby="feed-news-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            titleId="feed-news-title"
            eyebrow={isEn ? 'Updated daily' : '매일 업데이트'}
            title={isEn ? 'Global K-beauty trend news' : 'K-뷰티 글로벌 트렌드 뉴스'}
            subtitle={isEn ? 'Compiled from public industry sources.' : '공개 산업 자료를 매일 정리해요.'}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {news.map((n) => {
              const meta = getCategoryMeta(n.category)
              return (
                <a
                  key={n.slug}
                  href={`${base}/news/${n.slug}/`}
                  className="group block overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-navy"
                >
                  <div className="relative aspect-[4/5] flex items-center justify-center" style={{ background: gradient(meta.color) }}>
                    {n.image ? (
                      <img src={n.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
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
                    <div className="text-[11px] font-bold uppercase tracking-wide text-primary truncate">{fmt(n.date)}</div>
                    <h3 className="text-[13px] font-semibold leading-snug text-navy line-clamp-2 group-hover:text-primary transition-colors">
                      {n.title}
                    </h3>
                  </div>
                </a>
              )
            })}
          </div>
          <div className="text-center mt-10 md:mt-12">
            <a href={`${base}/news/`} className={SEE_ALL_BTN}>
              {isEn ? 'See all news' : '뉴스 전체 보기'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
