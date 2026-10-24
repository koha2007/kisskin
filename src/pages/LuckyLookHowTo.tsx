// 럭키 메이크업 9종 — 룩별 메이크업 방법 /lucky-makeup/{id}/ · /en/lucky-makeup/{id}/ (2026-10-22, 10/24 개편)
// ────────────────────────────────────────────────────────────────────
// 9룩 방법 페이지(LookHowTo)와 같은 원칙: 방법은 전부 공개(검색·SNS 유입이 입구에서 떠나지 않게),
// "내 얼굴에 입혀 보기"만 /lucky-makeup/ 생성 흐름으로 보낸다(?look= 로 룩을 미리 고른 채).
// 10/24 운영자: 따라 하기 = /looks/ 9룩 방식 그대로(같은 여자 페이스 차트 + 번호 핀) + 제품 구매 링크,
//   디자인·색은 키스인스킨(브랜드 네이비+핑크)과 통일. 운세는 "관상 포인트" 한 칸으로만(포장 역할).
import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import RegionToggle from '../components/RegionToggle'
import { CropImg, FaceChartMap, ShopLinks, ShopDisclosure, Swatches } from './LookHowTo'
import { FORTUNE_LOOKS, fortuneLookById, type FortuneLookId, luckyLookImg } from '../lib/fortune/looks'
import { LUCKY_HOWTO, LUCKY_CROP, LUCKY_CHARTS } from '../lib/fortune/howto'
import { AREA_LABEL, CHART_CROP, COMMON_SAFETY_KO, COMMON_SAFETY_EN } from '../lib/looks/howto'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import { LUCKY_PRICE } from '../lib/fortune/pricing'
import { trackEvent } from '../lib/analytics'

const lookImg = luckyLookImg
const chartImg = (id: FortuneLookId) => `/fortune/charts/${id}.webp`

export default function LuckyLookHowTo({ id }: { id: FortuneLookId }) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const hub = isEn ? '/en/lucky-makeup/' : '/lucky-makeup/'
  const l = fortuneLookById(id)
  const h = LUCKY_HOWTO[id]
  const tryHref = `${hub}?look=${id}#make`
  const name = isEn ? `${l.nameEn} makeup` : l.nameKo
  const hasChart = LUCKY_CHARTS.includes(id)

  return (
    <div className="font-display bg-background-light min-h-screen text-navy">
      <ToolsNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <nav className="pt-5 text-xs font-semibold text-slate-500" aria-label="breadcrumb">
          <a href={hub} className="hover:text-navy underline-offset-4 hover:underline">{isEn ? 'Lucky Makeup' : '럭키 메이크업'}</a>
          <span className="mx-1.5">›</span>{name}
        </nav>

        {/* ── 히어로: 예시 사진 + 이름 + 내 셀카로 ── */}
        <section className="mt-5 grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center">
          <figure className="relative overflow-hidden bg-cream border border-slate-200">
            <img src={lookImg(id)} alt={isEn ? `${name} example (AI model)` : `${name} 예시 (AI 모델)`} className="aspect-[4/5] w-full origin-[50%_40%] scale-[1.25] object-cover object-[50%_30%]" />
            <span className="absolute left-3 top-3 bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-600">{isEn ? 'AI example' : 'AI 예시'}</span>
          </figure>
          <div className="min-w-0">
            <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark">
              {isEn ? `Lucky makeup · ${l.fortuneEn}` : `럭키 메이크업 · ${l.fortuneKo}`}
            </p>
            <h1 className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight break-keep">{name}</h1>
            <p className="mt-3 text-base md:text-lg text-slate-600 leading-relaxed">{isEn ? l.hookEn : l.hookKo}</p>
            <dl className="mt-5 grid grid-cols-3 border border-slate-200 bg-white text-center divide-x divide-slate-200">
              {[
                [isEn ? 'Time' : '시간', isEn ? `${h.minutes} min` : `${h.minutes}분`],
                [isEn ? 'Level' : '난이도', isEn ? h.levelEn : h.levelKo],
                [isEn ? 'Steps' : '단계', String(h.steps.length)],
              ].map(([k, v]) => (
                <div key={k} className="py-2.5">
                  <dt className="text-[11px] font-semibold text-slate-500">{k}</dt>
                  <dd className="text-base font-extrabold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-slate-600"><b className="text-navy">{isEn ? 'Best for ' : '이럴 때 '}</b>{isEn ? h.whenEn : h.whenKo}</p>
            <a href={tryHref} onClick={() => trackEvent('lucky_howto_try', { look: id, at: 'hero' })}
              className="mt-5 flex items-center justify-center gap-1.5 bg-navy px-6 py-3.5 text-sm font-bold text-white hover:bg-navy-mid transition-colors">
              {isEn ? 'Try this look on my selfie' : '이 메이크업 내 셀카에 입혀 보기'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
            <p className="mt-2 text-center text-xs font-semibold text-slate-500">{isEn ? LUCKY_PRICE.lineEn : LUCKY_PRICE.lineKo}</p>
          </div>
        </section>

        {/* ── 관상 포인트 — 운세는 이 한 칸(왜 이 자리를 칠하는지) ── */}
        <section className="mt-10 border-l-4 border-primary bg-white px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">{isEn ? 'Why this spot · Korean face reading' : '왜 이 자리일까 · 관상 포인트'}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{isEn ? h.whyEn : h.whyKo}</p>
          <p className="mt-2 text-[11px] text-slate-400">{isEn ? 'Face reading is a tradition to enjoy for fun. Makeup changes how you look, not your fate.' : '관상은 재미로 즐기는 전통이에요. 메이크업은 인상을 바꿀 뿐, 운을 보장하지 않아요.'}</p>
        </section>

        {/* ── 따라 하기 — 9룩과 같은 페이스 차트 + 번호 핀 + 단계별 제품 찾기 ── */}
        <section className="mt-10">
          <h2 className="text-xl md:text-2xl font-extrabold">{isEn ? `How to do it · ${h.steps.length} steps` : `따라 하기 · ${h.steps.length}단계`}</h2>
          <div className="mt-5 space-y-5 md:space-y-6">
            {hasChart && <FaceChartMap src={chartImg(id)} steps={h.steps} isEn={isEn} />}
            {AFFILIATE_ENABLED && <RegionToggle pageType="looks" />}
            <ShopDisclosure isEn={isEn} />
            <ol className="space-y-5">
              {h.steps.map((s, i) => (
                <li key={i} className="grid bg-white border border-slate-200 overflow-hidden md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center">
                  {hasChart
                    ? <CropImg src={chartImg(id)} crops={CHART_CROP} area={s.crop ?? s.area} alt={isEn ? `${name} — ${AREA_LABEL[s.area].en} (AI-generated illustration)` : `${name} — ${AREA_LABEL[s.area].ko} (AI 생성 일러스트)`} />
                    : <CropImg src={lookImg(id)} crops={LUCKY_CROP} area={s.crop ?? s.area} alt={isEn ? `${name} — ${AREA_LABEL[s.area].en} close-up (AI model)` : `${name} — ${AREA_LABEL[s.area].ko} 확대 (AI 모델)`} />}
                  <div className="min-w-0 p-5 md:p-6">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white text-xs tracking-normal">{i + 1}</span>
                      {isEn ? AREA_LABEL[s.area].en : AREA_LABEL[s.area].ko}
                    </p>
                    <h3 className="mt-2 text-lg font-extrabold leading-snug">{isEn ? s.titleEn : s.titleKo}</h3>
                    <p className="mt-2 text-sm md:text-[15px] text-slate-600 leading-relaxed">{isEn ? s.bodyEn : s.bodyKo}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Swatches colors={s.swatches} />
                      <span className="text-xs font-semibold text-slate-500">{isEn ? s.toolsEn : s.toolsKo}</span>
                    </div>
                    <ShopLinks step={s} look={`lucky-${id}`} n={i + 1} isEn={isEn} />
                  </div>
                </li>
              ))}
            </ol>
            <p className="flex gap-3 bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 leading-relaxed">
              <span className="material-symbols-outlined text-lg shrink-0">health_and_safety</span>
              <span>{isEn ? COMMON_SAFETY_EN : COMMON_SAFETY_KO}</span>
            </p>
          </div>
        </section>

        {/* ── 내 얼굴에 — 사기 전에 어울리는지 먼저 ── */}
        <section className="mt-10 bg-navy px-5 py-6 md:px-8 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-on-dark">{isEn ? 'On your own face' : '내 얼굴에 먼저'}</p>
          <p className="mt-1.5 text-xl font-extrabold leading-snug">{isEn ? `See ${name} on your selfie before you buy anything` : `제품 사기 전에 ${name}이 나한테 어울리는지 먼저 보세요`}</p>
          <a href={tryHref} onClick={() => trackEvent('lucky_howto_try', { look: id, at: 'bottom' })}
            className="mt-4 inline-flex items-center justify-center gap-1.5 bg-primary-dark px-6 py-3.5 text-sm font-bold text-white hover:bg-primary transition-colors">
            {isEn ? 'Try it on my selfie' : '내 셀카에 입혀 보기'}<span className="material-symbols-outlined text-base">arrow_forward</span>
          </a>
          <p className="mt-2 text-xs text-white/70">{isEn ? LUCKY_PRICE.lineEn : LUCKY_PRICE.lineKo}</p>
        </section>

        {/* ── 다른 운 ── */}
        <section className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-xl md:text-2xl font-extrabold">{isEn ? 'The other lucky looks' : '다른 운 메이크업'}</h2>
          <div className="mt-5 grid grid-cols-3 gap-2 md:gap-4">
            {FORTUNE_LOOKS.map((o) => (
              <a key={o.id} href={`${hub}${o.id}/`} aria-current={o.id === id ? 'page' : undefined}
                className={`block bg-white border transition-colors ${o.id === id ? 'border-primary' : 'border-slate-200 hover:border-navy'}`}>
                <span className="block aspect-square overflow-hidden bg-cream"><img src={lookImg(o.id)} alt="" loading="lazy" className="h-full w-full origin-[50%_42%] scale-[1.5] object-cover object-[50%_30%]" /></span>
                <span className="block px-2 py-2 text-center text-xs md:text-sm font-extrabold leading-tight">{isEn ? o.nameEn : o.fortuneKo}</span>
              </a>
            ))}
          </div>
        </section>

        <p className="mt-8 text-[11px] leading-relaxed text-slate-400">
          {isEn ? 'Example photos and face charts are AI visualisations of the look, not photos of these exact steps.' : '예시 사진과 페이스 차트는 룩을 AI로 시각화한 것으로, 위 단계를 그대로 칠한 실제 결과가 아니에요.'}
        </p>
      </main>
      <ToolsFooter />
    </div>
  )
}
