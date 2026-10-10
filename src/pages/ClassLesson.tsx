import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import RegionToggle from '../components/RegionToggle'
import { CropImg, FaceChartMap, ShopLinks, ShopDisclosure, Swatches } from './LookHowTo'
import { CHART_CROP, AREA_LABEL, COMMON_SAFETY_KO, COMMON_SAFETY_EN } from '../lib/looks/howto'
import { CLASS_LESSONS, lessonBySlug, chartSrc } from '../lib/class/lessons'
import { CLASS_PARTS, CURRICULUM } from '../lib/class/curriculum'
import { MAKEUP_STYLES } from '../lib/makeup/styles'
import { LOOK_IMAGES } from '../lib/makeup/lookImages'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import { trackEvent } from '../lib/analytics'

// 메이크업 클래스 한 편 (/class/{slug}/) — 2026-10-10.
// 9룩 페이지(LookHowTo)와 같은 부품을 쓴다: 페이스 차트 맵 + 번호 단계(차트 확대) + 단계별 제품 찾기.
// 다른 점: 비포/애프터 사진 대신 페이스 차트가 왼쪽에 고정되고, 끝에 팁 · 흔한 실수 · 이 기술이 들어간 룩 · 다음 편.

const TOOL_LINK = {
  'face-shape': { href: '/tools/face-shape/', ko: '내 얼굴형 먼저 알아보기', en: 'Find my face shape first', icon: 'face' },
  'personal-color': { href: '/tools/personal-color/', ko: '내 퍼스널컬러 먼저 알아보기', en: 'Find my personal color first', icon: 'palette' },
} as const

export default function ClassLesson({ slug }: { slug: string }) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const prefix = isEn ? '/en' : ''
  const l = lessonBySlug(slug)!
  const part = CLASS_PARTS.find((p) => p.id === l.part)!
  const name = isEn ? l.titleEn : l.titleKo
  const chart = chartSrc(slug)
  const idx = CLASS_LESSONS.findIndex((x) => x.slug === slug)
  const prev = CLASS_LESSONS[idx - 1]
  const next = CLASS_LESSONS[idx + 1]
  const upcoming = !next ? CURRICULUM.find((c) => c.n === l.n + 1) : undefined
  const looks = MAKEUP_STYLES.filter((s) => l.looks?.includes(s.id))

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />
      <main>
        <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-6 md:pb-10">
          <nav className="text-xs text-slate-500 mb-4" aria-label="breadcrumb">
            <a href={`${prefix}/class/`} className="hover:text-navy underline-offset-2 hover:underline">
              {isEn ? 'Makeup class' : '메이크업 클래스'}
            </a>
            <span className="mx-1.5">/</span>
            <a href={`${prefix}/class/#${part.id}`} className="hover:text-navy underline-offset-2 hover:underline">{isEn ? part.en : part.ko}</a>
          </nav>
          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark mb-3">
            {isEn ? `Lesson ${l.n} of ${CURRICULUM.length}` : `클래스 ${l.n}편 / ${CURRICULUM.length}`}
            {l.kbeauty && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 tracking-normal normal-case">K-beauty</span>}
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-navy leading-tight break-keep">{name}</h1>
          <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">{isEn ? l.introEn : l.introKo}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-slate-700">⏱ {l.minutes}{isEn ? ' min' : '분'}</span>
            <span className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-slate-700">{isEn ? `Level: ${l.levelEn}` : `난이도: ${l.levelKo}`}</span>
            <span className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-slate-700">{l.steps.length}{isEn ? ' steps' : '단계'}</span>
          </div>
        </header>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 md:pb-20 grid md:grid-cols-[minmax(0,380px)_1fr] gap-8 md:gap-12 items-start">
          <div className="md:sticky md:top-20 w-full max-w-[380px] md:max-w-none mx-auto space-y-4">
            <FaceChartMap src={chart} steps={l.steps} isEn={isEn} />
            {l.tool && (
              <a href={`${prefix}${TOOL_LINK[l.tool].href}`}
                onClick={() => trackEvent('class_tool_click', { lesson: slug, tool: l.tool })}
                className="flex items-center justify-center gap-1.5 bg-navy px-6 py-3.5 text-sm font-bold text-white hover:bg-navy-mid transition-colors">
                <span className="material-symbols-outlined text-base">{TOOL_LINK[l.tool].icon}</span>
                {isEn ? TOOL_LINK[l.tool].en : TOOL_LINK[l.tool].ko}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            )}
          </div>

          <div className="space-y-5 md:space-y-6">
            {AFFILIATE_ENABLED && <RegionToggle pageType="class" />}
            <ShopDisclosure isEn={isEn} />
            <ol className="space-y-5 md:space-y-6">
              {l.steps.map((s, i) => (
                <li key={i} className="bg-white border border-slate-200 overflow-hidden">
                  <CropImg src={chart} crops={CHART_CROP} area={s.crop ?? s.area}
                    alt={isEn ? `${name} — ${AREA_LABEL[s.area].en} (AI-generated illustration)` : `${name} — ${AREA_LABEL[s.area].ko} (AI 생성 일러스트)`} />
                  <div className="p-5 md:p-6">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white text-xs tracking-normal">{i + 1}</span>
                      {isEn ? AREA_LABEL[s.area].en : AREA_LABEL[s.area].ko}
                    </p>
                    <h2 className="mt-2 text-lg md:text-xl font-extrabold text-navy leading-snug">{isEn ? s.titleEn : s.titleKo}</h2>
                    <p className="mt-2 text-sm md:text-[15px] text-slate-600 leading-relaxed">{isEn ? s.bodyEn : s.bodyKo}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Swatches colors={s.swatches} />
                      <span className="text-xs font-semibold text-slate-500">{isEn ? s.toolsEn : s.toolsKo}</span>
                    </div>
                    <ShopLinks step={s} look={slug} n={i + 1} isEn={isEn} pageType="class" />
                  </div>
                </li>
              ))}
            </ol>

            {/* 팁 · 흔한 실수 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 p-5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">
                  <span className="material-symbols-outlined text-base">lightbulb</span>{isEn ? 'Tips' : '팁'}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-4">
                  {(isEn ? l.tipsEn : l.tipsKo).map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
              <div className="bg-white border border-slate-200 p-5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">
                  <span className="material-symbols-outlined text-base">error</span>{isEn ? 'Common mistake' : '흔한 실수'}
                </p>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed">{isEn ? l.mistakeEn : l.mistakeKo}</p>
              </div>
            </div>

            <p className="flex gap-3 bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 leading-relaxed">
              <span className="material-symbols-outlined text-lg shrink-0">health_and_safety</span>
              <span>
                {(isEn ? l.safetyEn : l.safetyKo) && <>{isEn ? l.safetyEn : l.safetyKo} </>}
                {isEn ? COMMON_SAFETY_EN : COMMON_SAFETY_KO}
              </span>
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isEn
                ? 'The face chart is an AI-generated illustration showing where each step goes — not a photo of a real result.'
                : '페이스 차트는 어디에 바르는지 보여주는 AI 생성 일러스트예요. 실제 결과 사진이 아니에요.'}
            </p>
          </div>
        </section>

        {/* 이전 · 다음 편 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid sm:grid-cols-2 gap-3">
            {prev ? (
              <a href={`${prefix}/class/${prev.slug}/`} className="group block bg-white border border-slate-200 p-5 hover:border-navy transition-colors">
                <span className="text-xs font-semibold text-slate-500">← {isEn ? `Lesson ${prev.n}` : `${prev.n}편`}</span>
                <span className="mt-1 block font-extrabold text-navy">{isEn ? prev.titleEn : prev.titleKo}</span>
              </a>
            ) : <span className="hidden sm:block" />}
            {next ? (
              <a href={`${prefix}/class/${next.slug}/`} className="group block bg-navy text-white p-5 text-right hover:bg-navy-mid transition-colors">
                <span className="text-xs font-semibold text-white/70">{isEn ? `Next: lesson ${next.n}` : `다음 ${next.n}편`} →</span>
                <span className="mt-1 block font-extrabold">{isEn ? next.titleEn : next.titleKo}</span>
              </a>
            ) : upcoming ? (
              <div className="block bg-white/60 border border-dashed border-slate-300 p-5 text-right">
                <span className="text-xs font-semibold text-slate-500">{isEn ? `Next week · lesson ${upcoming.n}` : `다음 주 공개 · ${upcoming.n}편`}</span>
                <span className="mt-1 block font-extrabold text-slate-500">{isEn ? upcoming.titleEn : upcoming.titleKo}</span>
              </div>
            ) : null}
          </div>
        </section>

        {looks.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <h2 className="text-xl md:text-2xl font-extrabold text-navy mb-5">{isEn ? 'Looks that use this' : '이 기술이 들어간 룩'}</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
              {looks.map((s) => (
                <a key={s.id} href={`${prefix}/looks/${s.id}/`} className="group block">
                  <span className="block aspect-square overflow-hidden bg-cream">
                    <img src={LOOK_IMAGES[s.id].after} alt="" loading="lazy" decoding="async"
                      className="h-full w-full object-cover object-[50%_30%] transition-transform group-hover:scale-105" />
                  </span>
                  <span className="mt-1.5 block truncate text-xs font-bold text-navy">{isEn ? s.subEn : s.nameKo}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
      <ToolsFooter />
    </div>
  )
}
