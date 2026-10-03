import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../hooks/useAuth'
import { useBeautyDna } from '../hooks/useBeautyDna'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import BeforeAfterSlider from '../components/makeup/BeforeAfterSlider'
import { MAKEUP_STYLES, type MakeupStyleId } from '../lib/makeup/styles'
import { LOOK_IMAGES } from '../lib/makeup/lookImages'
import { LOOK_HOWTO, STEP_CROP, type CropKey, AREA_LABEL, SEASON_SHADES, CHART_LOOKS, CHART_ZONE, COMMON_SAFETY_KO, COMMON_SAFETY_EN, type HowToArea, type HowToStep } from '../lib/looks/howto'
import { PERSONAL_COLOR_TYPES } from '../lib/personal-color/types'
import { useSavedLooks } from '../lib/looks/savedLooks'
import { trackEvent } from '../lib/analytics'
import { useRegion } from '../hooks/useRegion'
import { AFFILIATE_ENABLED, buildSearchLink, buildAmazonLink, buildYesStyleLink } from '../lib/recommendations/types'
import { trackAffiliateClick } from '../lib/affiliate/track'
import RegionToggle from '../components/RegionToggle'

// 룩별 메이크업 방법 페이지 (/looks/{id}/).
// 방법은 전부 공개 — 검색엔진과 틱톡에서 온 사람이 같은 내용을 본다(클로킹 없음).
// 로그인 벽은 "내 것으로 만들기" 세 가지에만: 내 셀카에 입히기(기존 /analysis/ 로그인) ·
// 내 퍼스널컬러 맞춤 색 · 이 룩 저장.

/** 같은 구도의 룩 사진에서 한 부위를 확대해 보여준다(새 이미지 파일 없이). */
export function CropImg({ src, area, alt }: { src: string; area: CropKey; alt: string }) {
  const c = STEP_CROP[area]
  // 원본 1024×1536 → 크롭 박스의 실제 가로세로비
  const ratio = (c.w * 1024) / (c.h * 1536)
  return (
    <span className="relative block w-full overflow-hidden bg-cream" style={{ aspectRatio: String(ratio) }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute max-w-none"
        style={{ width: `${100 / c.w}%`, left: `${(-c.x / c.w) * 100}%`, top: `${(-c.y / c.h) * 100}%` }}
      />
    </span>
  )
}

/**
 * 메이크업 맵 — 아티스트 페이스 차트 위에 단계 번호 핀.
 * 벤치마킹(2026-10-02): 페이스 차트(NYX·Makeup by Mario 공식 차트)처럼 "어디에"를 그림 한 장으로.
 * 차트 1024×1536 중 y 300~1160 만 보여준다(얼굴). 핀 좌표는 CHART_ZONE.
 */
function FaceChartMap({ id, steps, isEn }: { id: MakeupStyleId; steps: HowToStep[]; isEn: boolean }) {
  const Y0 = 300, Y1 = 1160
  const pins = new Map<HowToArea, number[]>()
  steps.forEach((s, i) => pins.set(s.area, [...(pins.get(s.area) ?? []), i + 1]))
  return (
    <figure className="bg-white border border-slate-200 p-4 md:p-6">
      <figcaption className="flex items-baseline justify-between gap-3 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-dark">{isEn ? 'Makeup map' : '메이크업 맵'}</span>
        <span className="text-xs text-slate-500">{isEn ? 'Numbers = steps below · AI-generated illustration' : '번호 = 아래 단계 · AI 생성 일러스트'}</span>
      </figcaption>
      <div className="relative w-full overflow-hidden bg-cream" style={{ aspectRatio: `1024 / ${Y1 - Y0}` }}>
        <img
          src={`/looks/charts/${id}.webp`}
          alt={isEn ? 'Face chart illustration of this look' : '이 룩의 페이스 차트 일러스트'}
          loading="lazy"
          decoding="async"
          className="absolute left-0 w-full max-w-none"
          style={{ top: `${(-Y0 / (Y1 - Y0)) * 100}%` }}
        />
        {[...pins.entries()].map(([area, nums]) => {
          const z = CHART_ZONE[area]
          const left = (z.px / 1024) * 100
          const top = ((z.py - Y0) / (Y1 - Y0)) * 100
          return (
            <span key={area}>
              <span
                className="absolute rounded-[50%] border-2 border-dashed border-primary/70"
                style={{
                  left: `${((z.cx - z.rx) / 1024) * 100}%`, top: `${((z.cy - z.ry - Y0) / (Y1 - Y0)) * 100}%`,
                  width: `${((z.rx * 2) / 1024) * 100}%`, height: `${((z.ry * 2) / (Y1 - Y0)) * 100}%`,
                }}
                aria-hidden="true"
              />
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-navy px-2 h-7 min-w-7 text-xs font-extrabold text-white shadow"
                style={{ left: `${Math.min(left, 92)}%`, top: `${Math.max(top, 4)}%` }}
              >
                {nums.join('·')}
              </span>
            </span>
          )
        })}
      </div>
    </figure>
  )
}

/**
 * 이 단계 제품 찾기 — 지역별 검색 링크(쿠팡 / YesStyle·Amazon). 2026-10-02.
 * 정책: 제휴 링크는 rel="sponsored" + 페이지 안 경제적 이해관계 고지(ShopDisclosure) 필수
 * (공정위 추천·보증 심사지침, 쿠팡 파트너스 고지 문구, FTC). 특정 브랜드를 "추천"하지 않고
 * 단계에 맞는 **제품 종류 검색**으로 보낸다 — 효능·순위 주장이 생기지 않는다.
 */
function ShopLinks({ step, look, n, isEn }: { step: HowToStep; look: MakeupStyleId; n: number; isEn: boolean }) {
  const [region] = useRegion()
  if (!AFFILIATE_ENABLED) return null
  const cls = 'inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-navy hover:border-navy transition-colors'
  const slug = `${look}-${n}`
  if (region === 'global') {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={buildYesStyleLink(step.shopEn)} target="_blank" rel="noopener noreferrer nofollow sponsored" className={cls}
          onClick={() => trackAffiliateClick({ merchant: 'yesstyle', category: step.area, pageType: 'looks', pageSlug: slug })}>
          <span className="material-symbols-outlined text-sm">shopping_bag</span>{isEn ? 'Find on YesStyle' : 'YesStyle에서 찾기'}
        </a>
        <a href={buildAmazonLink(step.shopEn)} target="_blank" rel="noopener noreferrer nofollow sponsored" className={cls}
          onClick={() => trackAffiliateClick({ merchant: 'amazon', category: step.area, pageType: 'looks', pageSlug: slug })}>
          <span className="material-symbols-outlined text-sm">shopping_bag</span>{isEn ? 'Find on Amazon' : 'Amazon에서 찾기'}
        </a>
      </div>
    )
  }
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <a href={buildSearchLink(step.searchKeywords)} target="_blank" rel="noopener noreferrer nofollow sponsored" className={cls}
        onClick={() => trackAffiliateClick({ merchant: 'coupang', category: step.area, pageType: 'looks', pageSlug: slug })}>
        <span className="material-symbols-outlined text-sm">shopping_bag</span>
        {isEn ? `Find "${step.searchKeywords}" on Coupang` : `쿠팡에서 "${step.searchKeywords}" 찾기`}
      </a>
    </div>
  )
}

/**
 * 제휴 고지 — 링크가 처음 나오기 전에, 눈에 보이게. 이 페이지에 실제로 있는 링크만 정확히 적는다
 * (결과 페이지용 문구는 클리오·"유형별 추천"을 말해 여기엔 맞지 않음). 쿠팡 파트너스 필수 문구 포함.
 * Amazon·YesStyle 은 아직 제휴 미승인 = 일반 검색(config/affiliate.ts) — 승인되면 문구도 바꿀 것.
 */
function ShopDisclosure({ isEn }: { isEn: boolean }) {
  if (!AFFILIATE_ENABLED) return null
  return (
    <p className="flex gap-2 text-[11px] leading-relaxed text-slate-500 bg-white/60 border border-slate-200 px-3 py-2">
      <span className="material-symbols-outlined text-sm shrink-0">info</span>
      <span>
        {isEn
          ? 'Coupang links on this page are affiliate links (Coupang Partners) — we may earn a commission at no extra cost to you. YesStyle and Amazon links are plain searches. Each link searches for a product type, not a specific brand we endorse.'
          : '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다. 수수료는 제품 가격에 영향을 주지 않아요. 링크는 특정 브랜드 추천이 아니라 단계에 맞는 제품 종류 검색이에요.'}
      </span>
    </p>
  )
}

function Swatches({ colors }: { colors: string[] }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      {colors.map((c) => (
        <span key={c} className="h-5 w-5 rounded-full ring-1 ring-black/10" style={{ background: c }} />
      ))}
    </span>
  )
}

export default function LookHowTo({ id }: { id: MakeupStyleId }) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const prefix = isEn ? '/en' : ''
  const style = MAKEUP_STYLES.find((s) => s.id === id)!
  const how = LOOK_HOWTO[id]
  const img = LOOK_IMAGES[id]
  const name = isEn ? style.subEn : style.nameKo

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />
      <main>
        {/* 헤더 */}
        <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-6 md:pb-10">
          <nav className="text-xs text-slate-500 mb-4" aria-label="breadcrumb">
            <a href={`${prefix}/looks/`} className="hover:text-navy underline-offset-2 hover:underline">
              {isEn ? 'Makeup how-to' : '메이크업 방법'}
            </a>
            <span className="mx-1.5">/</span>
            <span>{name}</span>
          </nav>
          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark mb-3">
            {isEn ? 'Step-by-step makeup' : '단계별 메이크업'}
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-navy leading-tight break-keep">
            {isEn ? `How to do ${style.subEn.replace(/ MAKEUP$/i, '').toLowerCase()} makeup` : `${style.nameKo.replace(/ 메이크업$/, '')} 메이크업 하는 법`}
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
            {isEn ? how.introEn : how.introKo}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-slate-700">
              ⏱ {how.minutes}{isEn ? ' min' : '분'}
            </span>
            <span className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-slate-700">
              {isEn ? `Level: ${how.levelEn}` : `난이도: ${how.levelKo}`}
            </span>
            <span className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-slate-700">
              {how.steps.length}{isEn ? ' steps' : '단계'}
            </span>
          </div>
        </header>

        {/* 본문: PC = 좌 비포/애프터 고정 + 우 단계 / 모바일 = 위아래 */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 md:pb-20 grid md:grid-cols-[minmax(0,380px)_1fr] gap-8 md:gap-12 items-start">
          <div className="md:sticky md:top-20 w-full max-w-[340px] md:max-w-none mx-auto">
            <BeforeAfterSlider beforeSrc={img.before} afterSrc={img.after} isEn={isEn} />
            <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
              {isEn
                ? 'AI-generated model. The after shot is a visualization made by the kissinskin tool — not a photo of these steps applied by hand. Real results vary.'
                : 'AI 생성 모델이에요. 애프터는 키스인스킨 도구가 만든 시각화로, 이 방법대로 손으로 칠한 실제 사진이 아니에요. 실제 결과는 다를 수 있어요.'}
            </p>
            <a
              href={`/analysis/?style=${id}`}
              onClick={() => trackEvent('look_howto_tryon', { look: id, slot: 'sticky' })}
              className="mt-4 flex items-center justify-center gap-1.5 bg-navy px-6 py-3.5 text-sm font-bold text-white hover:bg-navy-mid transition-colors"
            >
              {isEn ? 'Try this look on my selfie' : '이 룩 내 셀카에 입혀보기'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>

          <div className="space-y-5 md:space-y-6">
          {CHART_LOOKS.includes(id) && <FaceChartMap id={id} steps={how.steps} isEn={isEn} />}
          {AFFILIATE_ENABLED && <RegionToggle pageType="looks" />}
          <ShopDisclosure isEn={isEn} />
          <ol className="space-y-5 md:space-y-6">
            {how.steps.map((s, i) => (
              <li key={i} className="bg-white border border-slate-200 overflow-hidden">
                <CropImg
                  src={img.after}
                  area={s.crop ?? s.area}
                  alt={isEn ? `${name} — ${AREA_LABEL[s.area].en} close-up (AI-generated model)` : `${name} — ${AREA_LABEL[s.area].ko} 확대 (AI 생성 모델)`}
                />
                <div className="p-5 md:p-6">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white text-xs tracking-normal">{i + 1}</span>
                    {isEn ? AREA_LABEL[s.area].en : AREA_LABEL[s.area].ko}
                  </p>
                  <h2 className="mt-2 text-lg md:text-xl font-extrabold text-navy leading-snug">
                    {isEn ? s.titleEn : s.titleKo}
                  </h2>
                  <p className="mt-2 text-sm md:text-[15px] text-slate-600 leading-relaxed">
                    {isEn ? s.bodyEn : s.bodyKo}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Swatches colors={s.swatches} />
                    <span className="text-xs font-semibold text-slate-500">{isEn ? s.toolsEn : s.toolsKo}</span>
                  </div>
                  <ShopLinks step={s} look={id} n={i + 1} isEn={isEn} />
                </div>
              </li>
            ))}

            {/* 안전 안내 — 룩별(염색·눈가 펄) + 모든 룩 공통(패치테스트·이상 시 중단) */}
            <li className="list-none flex gap-3 bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 leading-relaxed">
              <span className="material-symbols-outlined text-lg shrink-0">health_and_safety</span>
              <span>
                {(isEn ? how.safetyEn : how.safetyKo) && <>{isEn ? how.safetyEn : how.safetyKo} </>}
                {isEn ? COMMON_SAFETY_EN : COMMON_SAFETY_KO}
              </span>
            </li>
          </ol>
          </div>
        </section>

        <MemberPerks id={id} />
        <OtherLooks current={id} />
      </main>
      <ToolsFooter />
    </div>
  )
}

/** 가입 후 열리는 세 가지 — "보는 것"에서 "내 것으로 만드는 것"으로. */
function MemberPerks({ id }: { id: MakeupStyleId }) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const prefix = isEn ? '/en' : ''
  const { user, loading } = useAuth()
  const { dna } = useBeautyDna()
  const { saved, toggle, busy } = useSavedLooks()
  const [justSaved, setJustSaved] = useState(false)
  const how = LOOK_HOWTO[id]
  const next = encodeURIComponent(`${prefix}/looks/${id}/`)
  const loginHref = `${prefix}/auth/?next=${next}`
  const season = dna.personalColor
  const shade = season ? SEASON_SHADES[season][how.keyShade] : null
  const isSaved = saved.includes(id)

  return (
    <section className="bg-navy text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-on-dark mb-3">
          {isEn ? 'Free account' : '무료 회원'}
        </p>
        <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
          {isEn ? 'Make this look yours' : '이 룩을 내 것으로'}
        </h2>
        <p className="mt-3 text-white/70 text-sm md:text-base max-w-2xl">
          {isEn
            ? 'The steps are free for everyone. With a free account you can see it on your own face, in your own colors — and keep it.'
            : '방법은 누구나 볼 수 있어요. 무료 계정이면 내 얼굴에, 내 색으로 보고 — 저장까지 할 수 있어요.'}
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {/* 1. 내 셀카에 입히기 */}
          <a
            href={`/analysis/?style=${id}`}
            onClick={() => trackEvent('look_howto_tryon', { look: id, slot: 'perks' })}
            className="group flex flex-col bg-white/5 border border-white/15 p-5 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl text-primary-on-dark">photo_camera</span>
            <h3 className="mt-3 font-bold text-base">{isEn ? 'See it on my selfie' : '내 셀카에 입혀보기'}</h3>
            <p className="mt-1.5 text-sm text-white/65 leading-relaxed flex-1">
              {isEn ? 'Upload one selfie and get this exact look in about a minute. First one free.' : '셀카 한 장이면 1분 안에 이 룩이 내 얼굴에. 첫 1회 무료.'}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold">
              {isEn ? 'Try it' : '해보기'}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </span>
          </a>

          {/* 2. 내 퍼스널컬러 맞춤 색 — 로그인해야 열림 */}
          <div className="flex flex-col bg-white/5 border border-white/15 p-5">
            <span className="material-symbols-outlined text-2xl text-primary-on-dark">palette</span>
            <h3 className="mt-3 font-bold text-base">{isEn ? 'My shades for this look' : '내 퍼스널컬러로 고른 색'}</h3>
            {loading ? (
              <div className="flex-1" />
            ) : !user ? (
              <>
                <div className="mt-3 flex-1 relative">
                  <div className="flex gap-1.5 blur-[3px] opacity-60" aria-hidden="true">
                    {['#e09a80', '#c48a8c', '#b8402c', '#c8102e'].map((c) => (
                      <span key={c} className="h-7 w-7 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-white/65 leading-relaxed">
                    {isEn ? 'Log in to see which shade of this look suits your season.' : '로그인하면 이 룩의 어떤 색이 내 계절에 맞는지 알려드려요.'}
                  </p>
                </div>
                <a href={loginHref} onClick={() => trackEvent('look_howto_gate', { look: id, perk: 'shade' })}
                  className="mt-4 inline-flex w-fit items-center gap-1.5 bg-white text-navy px-4 py-2.5 text-sm font-bold">
                  <span className="material-symbols-outlined text-base">lock</span>
                  {isEn ? 'Free account' : '무료 계정으로 보기'}
                </a>
              </>
            ) : shade && season ? (
              <div className="mt-3 flex-1">
                <p className="text-xs font-bold text-white/60">
                  {isEn ? PERSONAL_COLOR_TYPES[season].enName : PERSONAL_COLOR_TYPES[season].koName}
                </p>
                <div className="mt-2 flex gap-1.5">
                  {shade.hex.map((c) => <span key={c} className="h-7 w-7 rounded-full ring-1 ring-white/30" style={{ background: c }} />)}
                </div>
                <p className="mt-2 text-sm font-bold">{isEn ? shade.en : shade.ko}</p>
              </div>
            ) : (
              <>
                <p className="mt-1.5 text-sm text-white/65 leading-relaxed flex-1">
                  {isEn ? 'Take the 1-minute personal color quiz first — then your shade shows up here.' : '1분 퍼스널컬러 진단을 먼저 하면 여기에 내 색이 떠요.'}
                </p>
                <a href={`${prefix}/tools/personal-color/`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold">
                  {isEn ? 'Find my season' : '내 계절 찾기'}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </a>
              </>
            )}
          </div>

          {/* 3. 저장 */}
          <div className="flex flex-col bg-white/5 border border-white/15 p-5">
            <span className="material-symbols-outlined text-2xl text-primary-on-dark">bookmark</span>
            <h3 className="mt-3 font-bold text-base">{isEn ? 'Save this look' : '이 룩 저장하기'}</h3>
            <p className="mt-1.5 text-sm text-white/65 leading-relaxed flex-1">
              {isEn ? 'Keep the steps in My Page so they follow you to any device.' : '방법을 마이페이지에 남겨 두면 어느 기기에서든 다시 볼 수 있어요.'}
            </p>
            {!user && !loading ? (
              <a href={loginHref} onClick={() => trackEvent('look_howto_gate', { look: id, perk: 'save' })}
                className="mt-4 inline-flex w-fit items-center gap-1.5 bg-white text-navy px-4 py-2.5 text-sm font-bold">
                <span className="material-symbols-outlined text-base">lock</span>
                {isEn ? 'Free account' : '무료 계정으로 저장'}
              </a>
            ) : user ? (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  const nowSaved = await toggle(id)
                  setJustSaved(nowSaved)
                  trackEvent(nowSaved ? 'look_saved' : 'look_unsaved', { look: id })
                }}
                className={`mt-4 inline-flex w-fit items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-colors ${isSaved ? 'bg-primary text-white' : 'bg-white text-navy'}`}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                {isSaved ? (isEn ? (justSaved ? 'Saved' : 'Saved — tap to remove') : (justSaved ? '저장됨' : '저장됨 · 누르면 해제')) : (isEn ? 'Save' : '저장')}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function OtherLooks({ current }: { current: MakeupStyleId }) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const prefix = isEn ? '/en' : ''
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      <h2 className="text-xl md:text-2xl font-extrabold text-navy mb-6">{isEn ? 'More looks' : '다른 룩 방법'}</h2>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
        {MAKEUP_STYLES.filter((s) => s.id !== current).map((s) => (
          <a key={s.id} href={`${prefix}/looks/${s.id}/`} className="group block">
            <span className="block aspect-square overflow-hidden bg-cream">
              <img src={LOOK_IMAGES[s.id].after} alt="" loading="lazy" decoding="async"
                className="h-full w-full object-cover object-[50%_30%] transition-transform group-hover:scale-105" />
            </span>
            <span className="mt-1.5 block truncate text-[11px] md:text-xs font-bold text-navy">{isEn ? s.subEn : s.nameKo}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
