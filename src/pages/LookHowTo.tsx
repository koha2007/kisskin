import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../hooks/useAuth'
import { useBeautyDna } from '../hooks/useBeautyDna'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import BeforeAfterSlider from '../components/makeup/BeforeAfterSlider'
import { MAKEUP_STYLES, type MakeupStyleId } from '../lib/makeup/styles'
import { LOOK_IMAGES } from '../lib/makeup/lookImages'
import { LOOK_HOWTO, AREA_CROP, AREA_LABEL, SEASON_SHADES, type HowToArea } from '../lib/looks/howto'
import { PERSONAL_COLOR_TYPES } from '../lib/personal-color/types'
import { useSavedLooks } from '../lib/looks/savedLooks'
import { trackEvent } from '../lib/analytics'

// 룩별 메이크업 방법 페이지 (/looks/{id}/).
// 방법은 전부 공개 — 검색엔진과 틱톡에서 온 사람이 같은 내용을 본다(클로킹 없음).
// 로그인 벽은 "내 것으로 만들기" 세 가지에만: 내 셀카에 입히기(기존 /analysis/ 로그인) ·
// 내 퍼스널컬러 맞춤 색 · 이 룩 저장.

/** 같은 구도의 룩 사진에서 한 부위를 확대해 보여준다(새 이미지 파일 없이). */
export function CropImg({ src, area, alt }: { src: string; area: HowToArea; alt: string }) {
  const c = AREA_CROP[area]
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
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-navy leading-tight">
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

          <ol className="space-y-5 md:space-y-6">
            {how.steps.map((s, i) => (
              <li key={i} className="bg-white border border-slate-200 overflow-hidden">
                <CropImg
                  src={img.after}
                  area={s.area}
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
                </div>
              </li>
            ))}

            {(isEn ? how.safetyEn : how.safetyKo) && (
              <li className="list-none flex gap-3 bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 leading-relaxed">
                <span className="material-symbols-outlined text-lg shrink-0">info</span>
                <span>{isEn ? how.safetyEn : how.safetyKo}</span>
              </li>
            )}
          </ol>
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
