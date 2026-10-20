import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import SectionHeader from './home/SectionHeader'
import { CLASS_LESSONS, chartSrc } from '../lib/class/lessons'
import { CURRICULUM } from '../lib/class/curriculum'
import { trackEvent } from '../lib/analytics'
// 피드 전체(본문 포함) 대신 최신 4건 카드 필드만 — scripts/gen-home-cards.mjs 가 빌드마다 만든다(2026-10-10).
import CARDS from '../lib/home/latestCards.json'
import { getCategoryMeta, type NewsCategory } from '../lib/news/types'

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

type Tab = 'class' | 'products' | 'news'

// 홈 "둘러보기" — 클래스 · 메이크업 제품 · 뉴스를 탭 한 칸에 (2026-10-18 대개편).
// 이전엔 섹션 3개(PC 약 2,600px)였다. 홈 스크롤 45% 지점 도달이 10% 안팎이라 아래 섹션은 거의
// 읽히지 않았다 → Photoroom 식으로 탭 하나에 묶었다.
// ⚠ 세 패널 모두 항상 DOM 에 렌더하고 hidden 으로만 가린다(`{tab === x && …}` 금지) —
//   크롤러가 세 피드 링크를 모두 따라가야 한다(feedback_no_conditional_render_for_seo_content).
export default function HomeContentSections() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const base = isEn ? '/en' : ''
  const [tab, setTab] = useState<Tab>('class')

  const products = useMemo(
    () => [...(isEn ? CARDS.products.en : CARDS.products.ko)].sort(byDateDesc).slice(0, 4),
    [isEn],
  )
  const news = useMemo(
    () => [...(isEn ? CARDS.news.en : CARDS.news.ko)].sort(byDateDesc).slice(0, 4),
    [isEn],
  )
  const lessons = CLASS_LESSONS.slice(-4)
  const next = CURRICULUM.find((c) => !CLASS_LESSONS.some((l) => l.slug === c.slug))

  const TABS: { id: Tab; label: string }[] = [
    { id: 'class', label: isEn ? 'Free class' : '무료 클래스' },
    { id: 'products', label: isEn ? 'New products' : '신제품' },
    { id: 'news', label: isEn ? 'K-beauty news' : 'K-뷰티 뉴스' },
  ]

  const card = 'group block overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-navy'

  return (
    <section id="explore" className="py-16 md:py-24 bg-cream scroll-mt-16" aria-labelledby="explore-title">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          titleId="explore-title"
          eyebrow={isEn ? 'Updated every week' : '매주 새로 올라와요'}
          title={isEn ? 'Learn, shop, catch up' : '배우고, 고르고, 알아 두기'}
          subtitle={isEn
            ? `A ${CURRICULUM.length}-lesson makeup class, new K-beauty products and global trend news.`
            : `메이크업 클래스 ${CURRICULUM.length}편 · 새로 나온 제품 · 글로벌 K-뷰티 뉴스.`}
          className="!mb-8 md:!mb-10"
        />
        <div role="tablist" aria-label={isEn ? 'Browse' : '둘러보기'} className="mx-auto mb-8 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1 ring-1 ring-slate-200">
          {TABS.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`explore-tab-${x.id}`}
              aria-selected={tab === x.id}
              aria-controls={`explore-panel-${x.id}`}
              onClick={() => { setTab(x.id); trackEvent('home_explore_tab', { tab: x.id }) }}
              className={`shrink-0 rounded-full px-4 md:px-6 py-2 text-sm font-bold transition-colors ${tab === x.id ? 'bg-navy text-white' : 'text-slate-600 hover:text-navy'}`}
            >
              {x.label}
            </button>
          ))}
        </div>

        {/* 클래스 */}
        <div role="tabpanel" id="explore-panel-class" aria-labelledby="explore-tab-class" hidden={tab !== 'class'}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {lessons.map((l) => (
              <a key={l.slug} href={`${base}/class/${l.slug}/`} className={card}>
                <span className="relative block aspect-[4/5] overflow-hidden bg-cream">
                  <img src={chartSrc(l.slug)} alt={isEn ? `${l.titleEn} — face chart` : `${l.titleKo} 페이스 차트`} loading="lazy" decoding="async"
                    className="absolute left-1/2 top-[-27%] w-[140%] max-w-none -translate-x-1/2 transition-transform duration-500 group-hover:scale-[1.04]" />
                  <span className="absolute left-2 top-2 inline-flex h-6 items-center justify-center rounded-full bg-navy px-2 text-[11px] font-extrabold text-white">{isEn ? `Lesson ${l.n}` : `${l.n}편`}</span>
                  {l.video && <span className="absolute right-2 top-2 inline-flex h-6 items-center gap-0.5 rounded-full bg-white/90 px-2 text-[11px] font-extrabold text-navy"><span className="material-symbols-outlined text-[14px]">play_arrow</span>{isEn ? 'Video' : '영상'}</span>}
                </span>
                <span className="block p-3">
                  <span className="block text-[13px] md:text-sm font-bold text-navy leading-snug break-keep">{isEn ? l.titleEn : l.titleKo}</span>
                  <span className="mt-1 block text-xs text-slate-500">{l.minutes}{isEn ? ' min' : '분'} · {l.steps.length}{isEn ? ' steps' : '단계'} →</span>
                </span>
              </a>
            ))}
            {next && (
              <a href={`${base}/class/`} className="col-span-2 lg:col-span-1 flex flex-col justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white/60 p-5 text-center hover:border-navy transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">{isEn ? `Coming next · lesson ${next.n}` : `다음 공개 · ${next.n}편`}</span>
                <span className="text-base font-extrabold text-navy break-keep">{isEn ? next.titleEn : next.titleKo}</span>
                <span className="text-xs text-slate-500">{isEn ? 'Get it in your inbox — subscribe above' : '메일로 받아 보려면 위에서 구독하세요'}</span>
              </a>
            )}
          </div>
          <div className="text-center mt-8">
            <a href={`${base}/class/`} className={SEE_ALL_BTN}>
              {isEn ? `All ${CURRICULUM.length} lessons` : `클래스 ${CURRICULUM.length}편 전체 보기`}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* 메이크업 제품 */}
        <div role="tabpanel" id="explore-panel-products" aria-labelledby="explore-tab-products" hidden={tab !== 'products'}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {products.map((p) => {
              const meta = getCategoryMeta(p.category as NewsCategory)
              return (
                <a key={p.slug} href={`${base}/products/${p.slug}/`} className={card}>
                  <div className="relative aspect-[4/5] flex items-center justify-center" style={{ background: gradient(meta.color) }}>
                    {p.image ? (
                      <img src={p.image} alt={isEn ? `${p.name} — illustrative image` : `${p.name} 연출컷`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/15 ring-1 ring-white/25 text-3xl select-none" aria-hidden="true">{meta.emoji}</span>
                    )}
                    <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-navy">
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                      {isEn ? meta.enLabel : meta.koLabel}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-primary-dark truncate">{p.brand}</div>
                    <h3 className="text-[13px] font-semibold leading-snug text-navy line-clamp-2 group-hover:text-primary-dark transition-colors">{p.name}</h3>
                  </div>
                </a>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <a href={`${base}/products/`} className={SEE_ALL_BTN}>
              {isEn ? 'See all products' : '메이크업 제품 전체 보기'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* 뉴스 */}
        <div role="tabpanel" id="explore-panel-news" aria-labelledby="explore-tab-news" hidden={tab !== 'news'}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {news.map((n) => {
              const meta = getCategoryMeta(n.category as NewsCategory)
              return (
                <a key={n.slug} href={`${base}/news/${n.slug}/`} className={card}>
                  <div className="relative aspect-[4/5] flex items-center justify-center" style={{ background: gradient(meta.color) }}>
                    {n.image ? (
                      <img src={n.image} alt={n.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/15 ring-1 ring-white/25 text-3xl select-none" aria-hidden="true">{meta.emoji}</span>
                    )}
                    <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-navy">
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                      {isEn ? meta.enLabel : meta.koLabel}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-primary-dark truncate">{fmt(n.date)}</div>
                    <h3 className="text-[13px] font-semibold leading-snug text-navy line-clamp-2 group-hover:text-primary-dark transition-colors">{n.title}</h3>
                  </div>
                </a>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <a href={`${base}/news/`} className={SEE_ALL_BTN}>
              {isEn ? 'See all news' : '뉴스 전체 보기'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
