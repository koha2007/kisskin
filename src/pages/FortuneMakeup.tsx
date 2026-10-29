// 럭키 메이크업 — /lucky-makeup/ · /en/lucky-makeup/ (2026-10-21, 10/22 이동·개편, 10/24 운세와 분리)
// 10/22 운영자: 무료 도구 안이 맞나 · 9종 3×3 크게 · 1장/9장 가격 표시 · 9종 방법 콘텐츠.
// 10/24 운영자: 메이크업이 주인공·사주는 양념 · 9종 이름 원복(재물운…) · 가격은 장수로 · 색은 키스인스킨 브랜드.
// 10/24 운영자(2차): "2026 메이크업 9종 · 럭키 메이크업 9종 · 오늘의 운세 — 결과가 다 다르게."
//   → 운세 입력·동물상 카드·도감은 /tools/today-fortune/(TodayFortune.tsx)로 분리.
//   → 여기는 '셀카 한 장, 아홉 명의 나'처럼 9가지 운 중 원하는 걸 골라 → 사진 찍거나 넣으면 바로 생성.
//     결과 화면에서 무료/유료를 나누지 않는다(가입 무료권 = 럭키 1장, 따로 lucky 풀 · 그다음 5장 $2.99 · 9장 $4.99).
//   → 10/24(3차) 운영자 "9종이랑 똑같이": 사진을 넣어도 바로 만들지 않고 [생성하기] 버튼을 누를 때 만든다.
//     무료권·보유 장수가 둘 다 있으면 버튼 두 개 — MakeupStyleSelect 와 같은 규칙.
// 사진은 생성 때만 생성 API 로(기존 AI 메이크업과 동일). 옛 공유 링크(?c=)는 오늘의 운세로 넘긴다.
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { pickImage } from '../lib/nativePicker'
import { trackEvent } from '../lib/analytics'
import type { Element } from '../lib/fortune/saju'
import { FORTUNE_LOOKS, fortuneLookById, ELEMENT_ACCENT, type FortuneLookId, luckyLookImg } from '../lib/fortune/looks'
import { loadLast } from '../lib/fortune/state'
import { generateFortuneMakeup, newJobId, keepPendingLook, takePendingLook, type GenError } from '../lib/fortune/generate'
import { getFreeStatus, type FreeStatus, type PayChoice } from '../lib/freeStatus'
import { savePendingSelfieFromSrc, takePendingSelfie, keepPendingSelfie, clearPendingSelfie } from '../lib/makeup/pendingSelfie'
import { supabase } from '../lib/supabase'
import { trackCheckoutReturn } from '../lib/purchaseTracking'
import { startPackCheckout } from '../lib/makeup/packCheckout'
import { loadLucky, saveLucky, type LuckyState } from '../lib/fortune/luckyStore'
import { LUCKY_PRICE } from '../lib/fortune/pricing'
import { buildMakeupComposite } from '../lib/makeup/composite'
import { dataUrlToFile, saveAllImages, saveOneImage, mailImages } from '../lib/makeup/collectionSave'
import ResultSaveEmail from '../components/makeup/ResultSaveEmail'
import LongPressSaveViewer from '../components/makeup/LongPressSaveViewer'

const lookImg = luckyLookImg
type Gen = { k: 'idle' } | { k: 'busy' } | { k: 'done'; image: string; tier: 'free' | 'credit'; balance?: number; freeLeft?: number } | { k: 'error'; e: GenError }

export default function FortuneMakeup() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const base = isEn ? '/en/lucky-makeup/' : '/lucky-makeup/'
  const fortuneHref = isEn ? '/en/tools/today-fortune/' : '/tools/today-fortune/'
  const [look, setLook] = useState<FortuneLookId>('wealth')
  const [photo, setPhoto] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [gen, setGen] = useState<Gen>({ k: 'idle' })
  const [free, setFree] = useState<FreeStatus | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  // 오늘의 운세에서 생년월일을 넣었던 사람이면 부족한 오행을 포인트 색으로(없으면 룩 그대로)
  const [lacking, setLacking] = useState<Element | undefined>(undefined)
  const [nineResume, setNineResume] = useState(false)
  const jobRef = useRef('')
  const makeRef = useRef<HTMLDivElement>(null)
  const T = isEn ? EN : KO

  // ── 진입: ?look=(방법 페이지·오늘의 운세에서) · ?resume=1(로그인 복귀) · ?nine=1(9장 결제 복귀) · ?c=(옛 공유 링크) ──
  // 미리 렌더한 페이지라 주소는 브라우저에서만 읽는다 → 마운트 때 한 번 상태를 정한다.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const q = new URLSearchParams(window.location.search)
    if (q.get('c')) { window.location.replace(fortuneHref + window.location.search); return }
    const last = loadLast()
    if (last?.lacking) setLacking(last.lacking)
    const pl = q.get('look')
    const valid = !!pl && FORTUNE_LOOKS.some((l) => l.id === pl)
    if (valid) setLook(pl as FortuneLookId)
    const scrollToMake = () => setTimeout(() => makeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400)
    if (q.get('nine') === '1') {
      // 9장 결제 복귀 — 셀카·진행분은 NineBox 가 IndexedDB 에서 읽는다
      trackCheckoutReturn(); setNineResume(true)
      setTimeout(() => document.getElementById('lucky-nine')?.scrollIntoView({ behavior: 'smooth' }), 500)
      return
    }
    if (q.get('resume') === '1' || valid) {
      // 로그인 왕복 · 오늘의 운세에서 셀카를 넣고 온 사람 — 고른 운과 셀카를 이어서
      const ph = takePendingSelfie()
      const lk = takePendingLook()
      if (ph) { setPhoto(ph); keepPendingSelfie(ph) }
      if (lk) setLook(lk)
      scrollToMake()
    }
  }, [fortuneHref])

  // 로그인·무료권 상태 — 처음 한 번 + 생성할 때마다(남은 수 갱신)
  useEffect(() => {
    let off = false
    supabase.auth.getSession().then(({ data }) => {
      if (off) return
      setLoggedIn(!!data.session)
      if (data.session) getFreeStatus().then((s) => { if (!off) setFree(s) })
    }).catch(() => setLoggedIn(false))
    return () => { off = true }
  }, [gen.k])

  const freeLeft = free?.lucky.left ?? 0
  const credits = free?.balance ?? 0
  // ── 생성 — [생성하기]를 누를 때(9종과 같음). pay = 누른 버튼(무료권/보유 장수). 같은 작업 재시도는 같은 jobId(이중 차감 X) ──
  const generate = async (pay?: PayChoice) => {
    const ph = photo
    if (!ph) return
    if (!loggedIn) {
      keepPendingLook(look); keepPendingSelfie(ph)
      trackEvent('fortune_login_gate', { look })
      window.location.href = '/auth?next=' + encodeURIComponent(base + '?resume=1')
      return
    }
    if (!jobRef.current) jobRef.current = newJobId()
    setGen({ k: 'busy' })
    trackEvent('fortune_generate', { look, pay: pay ?? 'auto' })
    const r = await generateFortuneMakeup({ photo: ph, lookId: look, lacking, jobId: jobRef.current, pay })
    if (r.ok) {
      jobRef.current = ''
      setGen({ k: 'done', image: r.image, tier: r.tier, balance: r.balance, freeLeft: r.freeLeft })
      trackEvent('fortune_generated', { look, tier: r.tier })
    } else {
      if (r.error !== 'retry') jobRef.current = ''
      setGen({ k: 'error', e: r.error })
      if (r.error === 'login') setLoggedIn(false)
    }
  }

  const choosePhoto = async (mode: 'camera' | 'gallery') => {
    const file = await pickImage(mode)
    if (!file) return
    const url = URL.createObjectURL(file)
    // 화면 표시·생성·로그인 왕복용 축소본(원본 비율 유지)
    const ok = await savePendingSelfieFromSrc(url)
    const small = ok ? takePendingSelfie() : null
    URL.revokeObjectURL(url)
    if (!small) { setErr(T.badFile); return }
    keepPendingSelfie(small)
    setPhoto(small); setErr(null); setGen({ k: 'idle' }); jobRef.current = ''
    trackEvent('fortune_photo', { mode })
  }

  const pick = (id: FortuneLookId) => {
    if (gen.k === 'busy') return
    setLook(id); setGen({ k: 'idle' }); jobRef.current = ''
    trackEvent('lucky_pick', { look: id })
    setTimeout(() => makeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  const cur = fortuneLookById(look)
  const eyebrow = 'text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark'
  const btn = 'flex w-full items-center justify-center gap-1.5 py-3.5 text-[15px] font-bold transition-colors disabled:opacity-60'
  const busy = gen.k === 'busy'
  const none = !!free && freeLeft === 0 && credits === 0
  return (
    <div className="font-display bg-background-light min-h-screen text-navy">
      <ToolsNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <section className="pt-10 md:pt-14">
          {/* 히어로 — 이름 = 럭키 메이크업(운영자 10/22 확정). 가격 한 줄을 첫 화면에 */}
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
            <div className="min-w-0">
              <p className={eyebrow}>{T.kicker}</p>
              <h1 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.08] break-keep">{T.title1}<br /><span className="text-primary">{T.title2}</span></h1>
              <p className="mt-4 max-w-lg text-base md:text-lg text-slate-600 leading-relaxed">{T.lead}</p>
            </div>
            <div className="min-w-0 md:justify-self-end md:w-full md:max-w-sm">
              <ul className="grid grid-cols-3 border border-slate-200 bg-white text-center divide-x divide-slate-200">
                {T.priceStrip.map(([n, p]) => (
                  <li key={n} className="px-2 py-3">
                    <span className="block text-[11px] font-semibold text-slate-500">{n}</span>
                    <span className="block text-lg font-extrabold tabular-nums">{p}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href="#looks" onClick={() => trackEvent('lucky_hero_cta', { to: 'looks' })} className="flex items-center justify-center gap-1 bg-navy py-3.5 text-sm font-bold text-white hover:bg-navy-mid transition-colors">{T.ctaStart}<span className="material-symbols-outlined text-base">arrow_downward</span></a>
                <a href="#price" onClick={() => trackEvent('lucky_hero_cta', { to: 'price' })} className="flex items-center justify-center border border-slate-300 bg-white py-3.5 text-sm font-bold hover:border-navy transition-colors">{T.ctaPrice}</a>
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-500">{T.noSub}</p>
            </div>
          </div>

          {/* 1) 9가지 운 고르기 — 3×3 크게('셀카 한 장, 아홉 명의 나'와 같은 고르기). 누르면 아래에서 바로 만든다 */}
          <div id="looks" className="mt-12 scroll-mt-20">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
              <h2 className="text-xl md:text-3xl font-extrabold"><span className="mr-2 text-primary tabular-nums">1</span>{T.gridTitle}</h2>
              <p className="text-xs font-semibold text-slate-500">{T.gridHint}</p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 md:gap-4" role="radiogroup" aria-label={T.gridTitle}>
              {FORTUNE_LOOKS.map((l) => {
                const on = l.id === look
                return (
                  <button key={l.id} type="button" role="radio" aria-checked={on} onClick={() => pick(l.id)}
                    className={`group block text-left bg-white border-2 transition-colors ${on ? 'border-primary' : 'border-transparent ring-1 ring-slate-200 hover:ring-navy'}`}>
                    <span className="relative block aspect-[4/5] md:aspect-square overflow-hidden bg-cream">
                      <img src={lookImg(l.id)} alt={isEn ? `${l.nameEn} makeup` : l.nameKo} loading="lazy"
                        className="h-full w-full origin-[50%_30%] scale-[1.12] object-cover object-[50%_22%] transition-transform duration-500 group-hover:scale-[1.18]" />
                      <span className="absolute left-1.5 top-1.5 md:left-3 md:top-3 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full ring-2 ring-white" style={{ background: l.accent }} aria-hidden="true" />
                      {on && <span className="material-symbols-outlined absolute right-1.5 top-1.5 md:right-3 md:top-3 rounded-full bg-primary p-0.5 text-[16px] md:text-[20px] text-white" aria-hidden="true">check</span>}
                    </span>
                    <span className="block p-2 md:p-4">
                      <span className={`block text-[13px] md:text-lg font-extrabold leading-tight ${on ? 'text-primary-dark' : ''}`}>{isEn ? l.nameEn : l.fortuneKo}</span>
                      <span className="mt-1 hidden md:block text-sm text-slate-600 leading-snug">{isEn ? l.hookEn : l.hookKo}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-[11px] text-slate-400">{T.gridNote}</p>
            {/* 메이크업 방법 무료 안내 — 운영자 10/24 "메이크업 방법도 무료로 소개해 드립니다" */}
            <a href="#howto" onClick={() => trackEvent('lucky_howto_banner', {})}
              className="mt-4 flex items-center gap-3 border border-primary/40 bg-blush px-4 py-3 hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-primary-dark">menu_book</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm md:text-base font-extrabold">{T.howtoFree}</span>
                <span className="block text-xs text-slate-600">{T.howtoFreeSub}</span>
              </span>
              <span className="material-symbols-outlined text-base">arrow_downward</span>
            </a>
          </div>

          {/* 2) 고른 운 → 사진 찍거나 넣으면 바로 생성. 결과도 여기(무료/유료로 나누지 않는다) */}
          <div ref={makeRef} id="make" className="mx-auto mt-10 max-w-xl scroll-mt-20 bg-navy p-5 md:p-7 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-on-dark"><span className="mr-1.5 tabular-nums">2</span>{T.makeKicker}</p>
            {gen.k === 'done' ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <figure><img src={photo ?? ''} alt="" className="aspect-[3/4] w-full object-cover" /><figcaption className="mt-1 text-center text-[11px] font-bold text-white/70">{T.before}</figcaption></figure>
                <figure><img src={gen.image} alt={isEn ? `${cur.nameEn} makeup on my selfie` : `내 셀카에 ${cur.nameKo}`} className="aspect-[3/4] w-full object-cover" /><figcaption className="mt-1 text-center text-[11px] font-bold text-white/70">{T.after}</figcaption></figure>
              </div>
            ) : null}
            <div className="mt-3 flex gap-4">
              {gen.k !== 'done' && <img src={photo && busy ? photo : lookImg(look)} alt="" className={`h-36 w-24 shrink-0 object-cover object-[50%_22%] ${busy ? 'animate-pulse' : ''}`} />}
              <div className="min-w-0">
                <p className="text-xl font-extrabold leading-tight">{isEn ? `${cur.nameEn} makeup` : cur.nameKo}</p>
                <p className="mt-1 text-[13px] leading-snug text-white/80">{isEn ? cur.hookEn : cur.hookKo}</p>
                <p className="mt-1.5 text-xs text-white/60">{isEn ? cur.descEn : cur.descKo}</p>
                {lacking && <p className="mt-1 text-xs font-semibold text-primary-on-dark">+ {isEn ? ELEMENT_ACCENT[lacking].en : ELEMENT_ACCENT[lacking].ko}</p>}
                <a href={`${base}${look}/`} className="mt-2 inline-flex items-center gap-0.5 text-xs font-bold text-white underline underline-offset-4">{T.howLink}</a>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {err && <p className="bg-primary/20 px-3 py-2 text-[13px] font-bold">{err}</p>}
              {gen.k === 'error' && <p className="bg-primary/20 px-3 py-2 text-[13px] font-bold">{T.genErr[gen.e]}</p>}
              {busy ? (
                <p className="bg-white/10 py-4 text-center text-sm font-bold">{T.generating}</p>
              ) : gen.k === 'error' && gen.e === 'topup' ? (
                <a href="/analysis/?topup=1" onClick={() => keepPendingLook(look)} className={`${btn} bg-white text-navy hover:bg-cream`}>{T.topup}</a>
              ) : gen.k === 'done' ? (
                <>
                  {/* 이미지 저장 · 메일로 받기 — 9종 결과(MakeupResult)와 같은 합성 이미지·같은 경로 */}
                  <ResultSaveEmail image={gen.image} name={isEn ? `${cur.nameEn} makeup` : cur.nameKo} desc={isEn ? cur.hookEn : cur.hookKo}
                    fileName={`kissinskin-lucky-${look}.jpg`} tag={`lucky:${look}`} isEn={isEn} />
                  <a href={`${base}${look}/`} className={`${btn} bg-white text-navy hover:bg-cream`}>{T.howAndShop}<span className="material-symbols-outlined text-base">arrow_forward</span></a>
                  <a href="#looks" className="block pt-1 text-center text-xs font-bold text-white/80 underline underline-offset-4">{T.another}</a>
                </>
              ) : (
                <>
                  {/* 셀카 — 넣기만 하고, 만들기는 아래 버튼으로 */}
                  {photo ? (
                    <div className="flex items-center gap-3 bg-white/10 p-2 text-xs">
                      <img src={photo} alt="" className="h-12 w-12 object-cover" />
                      <span className="min-w-0 flex-1 font-bold">{T.photoReady}</span>
                      <button type="button" onClick={() => { setPhoto(null); clearPendingSelfie() }} className="font-bold underline underline-offset-4">{T.change}</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => void choosePhoto('camera')} className={`${btn} bg-white text-navy hover:bg-cream`}><span className="material-symbols-outlined text-base">photo_camera</span>{T.camera}</button>
                      <button type="button" onClick={() => void choosePhoto('gallery')} className={`${btn} border border-white/40 text-white hover:border-white`}><span className="material-symbols-outlined text-base">image</span>{T.gallery}</button>
                    </div>
                  )}
                  {/* 생성하기 — 9종(MakeupStyleSelect)과 같은 규칙: 둘 다 있으면 두 버튼, 하나면 그것, 없으면 충전 */}
                  {loggedIn === false ? (
                    <>
                      <button type="button" disabled={!photo} onClick={() => void generate()} className={`${btn} bg-primary-dark text-white hover:bg-primary`}>{T.loginMake}</button>
                      <p className="text-center text-[11px] text-white/70">{T.loginNote}</p>
                    </>
                  ) : none ? (
                    <a href="/analysis/?topup=1" onClick={() => keepPendingLook(look)} className={`${btn} bg-white text-navy hover:bg-cream`}>{T.topup}</a>
                  ) : free && freeLeft > 0 && credits > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" disabled={!photo} onClick={() => void generate('free')} className={`${btn} bg-primary-dark text-white hover:bg-primary`}>{T.useFree}</button>
                      <button type="button" disabled={!photo} onClick={() => void generate('credit')} className={`${btn} bg-primary-dark text-white hover:bg-primary`}>{T.useCredit}</button>
                    </div>
                  ) : (
                    <button type="button" disabled={!photo} onClick={() => void generate(free ? (freeLeft > 0 ? 'free' : 'credit') : undefined)} className={`${btn} bg-primary-dark text-white hover:bg-primary`}>
                      {free ? (freeLeft > 0 ? T.makeFree : T.makeCredit) : T.make}<span className="material-symbols-outlined text-base">auto_awesome</span>
                    </button>
                  )}
                  {free && <p className="text-center text-[11px] text-white/70">{T.counts(freeLeft, credits)}</p>}
                  {!photo && <p className="text-center text-[11px] text-white/50">{T.photoTip}</p>}
                </>
              )}
              {gen.k === 'done' && (
                <p className="text-center text-[11px] text-white/60">
                  {gen.tier === 'free' ? T.usedFree : T.usedCredit}
                  {typeof gen.balance === 'number' && ` · ${isEn ? `${gen.balance} looks left` : `보유 ${gen.balance}장 남음`}`}
                </p>
              )}
            </div>
            <p className="mt-4 text-[11px] text-white/50">{T.aiNote}</p>
          </div>

          {/* 3) 9장 전부 — $4.99 */}
          <div className="mx-auto max-w-xl">
            <NineBox isEn={isEn} base={base} photo={photo} lacking={lacking} order={FORTUNE_LOOKS.map((l) => l.id)}
              loggedIn={loggedIn} free={free} resume={nineResume} onPhoto={() => void choosePhoto('gallery')}
              onLogin={() => { if (photo) keepPendingSelfie(photo); window.location.assign('/auth?next=' + encodeURIComponent(base + '?resume=1')) }}
              onFree={() => getFreeStatus().then(setFree)} />
          </div>

          <PriceTable isEn={isEn} />

          {/* 오늘의 운세 — 따로 있는 무료 결과(운세). 어떤 운이 필요할지 모르겠는 사람의 입구 */}
          <a href={fortuneHref} onClick={() => trackEvent('lucky_to_fortune', {})}
            className="mx-auto mt-14 flex max-w-xl items-center gap-4 border border-slate-200 bg-white p-5 hover:border-navy transition-colors">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blush text-2xl" style={{ fontFamily: "'Song Myung', serif" }} aria-hidden="true">運</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">{T.fortuneKicker}</span>
              <span className="mt-0.5 block text-lg font-extrabold">{T.fortuneTitle}</span>
              <span className="mt-0.5 block text-sm text-slate-600">{T.fortuneDesc}</span>
            </span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>

          <div className="mx-auto max-w-xl"><IntroSeo isEn={isEn} base={base} fortuneHref={fortuneHref} /></div>
        </section>
      </main>
      <ToolsFooter />
    </div>
  )
}

// ── 가격표 — 2026-10-24: 크레딧 말 없이 장수로만(운영자가 "$2.99 = 1장?"으로 읽음) ──
// 벤치마크: Lensa(50/100/200장 — 장수와 가격을 한 줄로), Nebula 구독 함정 소송 → "구독·자동 결제 없음"을 같이.
function PriceTable({ isEn }: { isEn: boolean }) {
  const per = (usd: number, n: number) => (usd / n).toFixed(2)
  const rows = isEn
    ? [
        { n: '1 look', price: 'Free', sub: 'Sign-up free pass — 1 lucky look', items: ['Any one of the 9 lucks', 'On your own selfie', 'Before / after'], best: false },
        { n: `${LUCKY_PRICE.starter.credits} looks`, price: `$${LUCKY_PRICE.starter.usd}`, sub: `$${per(LUCKY_PRICE.starter.usd, LUCKY_PRICE.starter.credits)} per look`, items: ['Pick any lucks you like', 'Also works for the 2026 makeup looks', 'Use them any time'], best: false },
        { n: 'All 9 lucks', price: `$${LUCKY_PRICE.nine.usd}`, sub: `9 looks · $${per(LUCKY_PRICE.nine.usd, 9)} per look`, items: ['One selfie → all 9 at once', '3×3 board to save & post', 'Every how-to + product links'], best: true },
      ]
    : [
        { n: '1장', price: '무료', sub: '가입 무료권 — 럭키 메이크업 1장', items: ['9가지 운 중 원하는 하나', '내 셀카에 바로', '비포 · 애프터'], best: false },
        { n: `${LUCKY_PRICE.starter.credits}장`, price: `$${LUCKY_PRICE.starter.usd}`, sub: `장당 $${per(LUCKY_PRICE.starter.usd, LUCKY_PRICE.starter.credits)}`, items: ['원하는 운을 골라서', '2026 메이크업 9룩에도 사용', '쓰고 싶을 때 언제든'], best: false },
        { n: '9가지 운 전부', price: `$${LUCKY_PRICE.nine.usd}`, sub: `9장 · 장당 $${per(LUCKY_PRICE.nine.usd, 9)}`, items: ['셀카 한 장 → 9장 한 번에', '3×3 모아보기 저장·공유', '9가지 방법 + 제품 링크'], best: true },
      ]
  return (
    <div id="price" className="mt-14 scroll-mt-20">
      <h2 className="text-xl md:text-3xl font-extrabold">{isEn ? 'Pricing' : '가격'}</h2>
      <p className="mt-2 text-sm text-slate-600">{isEn ? 'One look = one photo of you in that makeup.' : '1장 = 내 셀카에 그 메이크업을 입힌 사진 한 장이에요.'}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3 md:gap-5">
        {rows.map((r) => (
          <div key={r.n} className={`relative flex flex-col p-5 md:p-6 ${r.best ? 'bg-navy text-white' : 'border border-slate-200 bg-white'}`}>
            {r.best && <span className="absolute right-4 top-4 bg-primary px-2 py-0.5 text-[10px] font-bold text-white">{isEn ? 'BEST VALUE' : '추천'}</span>}
            <p className={`text-sm font-extrabold ${r.best ? 'text-primary-on-dark' : 'text-primary-dark'}`}>{r.n}</p>
            <p className="mt-2 text-4xl font-extrabold leading-none tabular-nums">{r.price}</p>
            <p className={`mt-2 text-xs font-semibold ${r.best ? 'text-white/70' : 'text-slate-500'}`}>{r.sub}</p>
            <ul className={`mt-4 space-y-1.5 text-sm ${r.best ? 'text-white/90' : 'text-slate-700'}`}>
              {r.items.map((t) => <li key={t} className="flex gap-1.5"><span className={`material-symbols-outlined text-base ${r.best ? 'text-primary-on-dark' : 'text-primary'}`}>check</span>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        {isEn
          ? 'Today’s fortune is free. One-time payments only — no subscription, no auto-renewal. Need more? 15 looks for $6.99 on the top-up screen.'
          : '오늘의 운세는 무료예요. 한 번 결제로 끝 — 구독·자동 결제 없어요. 더 필요하면 충전 화면에 15장 $6.99도 있어요.'}
      </p>
    </div>
  )
}

// ── 9장 전부 — 셀카 한 장으로 9가지 운. 진행·셀카는 기기(IndexedDB)에만, 결제 복귀 후 이어 만든다 ──
const NINE_PACK = { id: 'collection' as const, credits: LUCKY_PRICE.nine.credits, value: LUCKY_PRICE.nine.usd }

function NineBox({ isEn, base, photo, lacking, order, loggedIn, free, resume, onPhoto, onLogin, onFree }: {
  isEn: boolean; base: string; photo: string | null; lacking?: Element; order: FortuneLookId[]
  loggedIn: boolean | null; free: FreeStatus | null; resume: boolean
  onPhoto: () => void; onLogin: () => void; onFree: () => void
}) {
  const [st, setSt] = useState<LuckyState | null>(null)
  const [busy, setBusy] = useState<FortuneLookId | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [board, setBoard] = useState<string | null>(null)
  // 저장·메일 = 모아보기 1 + 낱장 9(9룩 컬렉션과 같은 10장 · 낱장은 단일 결과 저장과 같은 합성 디자인)
  const [singles, setSingles] = useState<string[] | null>(null)
  const [files, setFiles] = useState<File[] | null>(null)
  const [viewer, setViewer] = useState(false)
  const [mail, setMail] = useState<'idle' | 'sending' | 'sent' | 'error' | 'limit'>('idle')
  const [mailTo, setMailTo] = useState('')
  const autoRef = useRef(false)
  const credits = free?.balance ?? 0

  useEffect(() => { let off = false; loadLucky().then((v) => { if (!off) setSt(v) }); return () => { off = true } }, [])

  // 화면의 셀카가 저장본과 다르면(새 셀카) 진행분은 새로 시작한다. 결제 복귀처럼 화면 셀카가 없으면 저장본을 쓴다.
  const selfie = photo ?? st?.selfie ?? null
  const items = st && selfie && st.selfie === selfie ? st.items : {}
  const images: Partial<Record<FortuneLookId, string>> = {}
  for (const id of order) { const im = items[id]?.image; if (im) images[id] = im }
  const left = order.filter((id) => !images[id])
  const done = left.length === 0

  const E: Record<GenError, string> = isEn ? EN.genErr : KO.genErr
  const make = async () => {
    if (!selfie) { onPhoto(); return }
    if (!loggedIn) { onLogin(); return }
    setMsg(null)
    let cur: LuckyState = st && st.selfie === selfie ? st : { selfie, lacking, items: {}, updatedAt: Date.now() }
    trackEvent('lucky9_generate', { n: left.length })
    for (const id of order) {
      if (cur.items[id]?.image) continue
      const jobId = cur.items[id]?.jobId || newJobId()
      cur = { ...cur, items: { ...cur.items, [id]: { jobId } } }
      setSt(cur); await saveLucky(cur)
      setBusy(id)
      const r = await generateFortuneMakeup({ photo: selfie, lookId: id, lacking: cur.lacking, styleTag: 'lucky9', jobId, pay: 'credit' })
      if (!r.ok) {
        setBusy(null); setMsg(E[r.error])
        if (r.error !== 'retry') { cur = { ...cur, items: { ...cur.items, [id]: undefined } }; setSt(cur); await saveLucky(cur) }
        onFree(); return
      }
      cur = { ...cur, items: { ...cur.items, [id]: { jobId, image: r.image } } }
      setSt(cur); await saveLucky(cur)
      trackEvent('lucky9_generated', { look: id })
    }
    setBusy(null); onFree()
    trackEvent('lucky9_all_done', {})
  }

  const pay = async () => {
    if (!selfie) { onPhoto(); return }
    if (!loggedIn) { onLogin(); return }
    setPaying(true)
    // 결제하러 나가기 전에 셀카를 기기에 맡긴다(복귀하면 여기서 이어 만든다)
    const keep: LuckyState = st && st.selfie === selfie ? st : { selfie, lacking, items: {}, updatedAt: Date.now() }
    setSt(keep); await saveLucky(keep)
    trackEvent('lucky9_checkout', { have: credits })
    const out = await startPackCheckout(NINE_PACK, base)
    if (out === 'error') { setPaying(false); setMsg(isEn ? 'Couldn’t open checkout. Please try again.' : '결제창을 열지 못했어요. 다시 눌러 주세요.') }
    if (out === 'external') setPaying(false)
  }

  // 결제 복귀 — 웹훅 충전이 몇 초 늦을 수 있어 잔액이 들어올 때까지 3초마다 다시 읽고, 들어오면 자동 시작
  useEffect(() => {
    if (!resume || autoRef.current || !st || !loggedIn || done) return
    if (free && credits >= left.length) { autoRef.current = true; void make(); return }
    const t = setTimeout(onFree, 3000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume, st, loggedIn, free, done])

  // 다 모이면 3×3 모아보기 한 장 + 저장·메일용 낱장 9장을 미리 만들어 둔다(공유는 탭 직후 바로 불러야 함)
  useEffect(() => {
    if (!done || !selfie) return
    let off = false
    setBoard(null); setSingles(null); setFiles(null); setMail('idle')
    ;(async () => {
      const u = await renderNineBoard(order.map((id) => images[id] ?? lookImg(id)), order, isEn)
      if (off) return
      setBoard(u)
      const branded: string[] = []
      for (const id of order) {
        const l = fortuneLookById(id)
        const c = await buildMakeupComposite({ afterSrc: images[id]!, styleName: isEn ? `${l.nameEn} makeup` : l.nameKo, styleDesc: isEn ? l.hookEn : l.hookKo })
        branded.push(c.toDataURL('image/jpeg', 0.92))
      }
      if (off) return
      setSingles(branded)
      setFiles([dataUrlToFile(u, 'kissinskin-my-9-lucky-looks.jpg'), ...order.map((id, i) => dataUrlToFile(branded[i], `kissinskin-lucky-${i + 1}-${id}.jpg`))])
    })().catch(() => setMsg(isEn ? 'Could not build the save images. Refresh and try again.' : '저장 이미지를 만들지 못했어요. 새로고침 후 다시 시도해 주세요.'))
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, selfie, isEn, st])

  const saveAll = async () => {
    if (!files || !board || !singles) return
    const method = await saveAllImages(files, [board, ...singles], isEn ? 'My 9 lucky looks' : '나의 럭키 메이크업 9')
    if (method === 'cancel') return
    if (method === 'viewer') setViewer(true)
    trackEvent('lucky9_save', { method: method === 'viewer' ? 'longpress' : method })
  }
  const sendMail = async () => {
    if (!board || !singles) return
    setMail('sending')
    const r = await mailImages([
      { name: 'kissinskin-my-9-lucky-looks.jpg', dataUrl: board },
      ...order.map((id, i) => ({ name: `kissinskin-lucky-${i + 1}-${id}.jpg`, dataUrl: singles[i] })),
    ], isEn ? 'en' : 'ko', 'lucky')
    if (r.k === 'login') { setMail('idle'); onLogin(); return }
    if (r.k !== 'sent') { setMail(r.k); return }
    setMailTo(r.to); setMail('sent')
    trackEvent('lucky9_save', { method: 'email' })
  }

  const btn = 'w-full py-3.5 text-[15px] font-bold transition-colors'
  const waiting = resume && !!st && !done && !autoRef.current
  return (
    <div id="lucky-nine" className="mt-6 scroll-mt-20 border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">{isEn ? 'All 9 lucks' : '9가지 운 전부'}</p>
          <h2 className="mt-1 text-xl font-extrabold">{isEn ? 'All 9 looks on my face at once' : '내 얼굴로 9장 한 번에'}</h2>
        </div>
        <p className="shrink-0 bg-navy px-3 py-2 text-center text-white"><span className="block text-xl font-extrabold leading-none tabular-nums">${LUCKY_PRICE.nine.usd}</span><span className="text-[10px] font-semibold">{isEn ? '9 looks' : '9장'}</span></p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {order.map((id) => {
          const l = fortuneLookById(id)
          const k = order.indexOf(id)
          const tile = (
            <>
              <img src={images[id] ?? lookImg(id)} alt="" className={`aspect-[3/4] w-full object-cover object-[50%_28%] ${images[id] ? '' : 'opacity-50'}`} />
              {busy === id && <span className="absolute inset-0 flex items-center justify-center bg-navy/50"><span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" /></span>}
              {images[id] && <span className="material-symbols-outlined absolute right-1 top-1 rounded-full bg-primary text-[14px] text-white">{files ? 'download' : 'check'}</span>}
              <span className="absolute inset-x-0 bottom-0 bg-navy/70 px-1 py-0.5 text-center text-[10.5px] font-bold text-white">{isEn ? l.nameEn : l.fortuneKo}</span>
            </>
          )
          // 다 만들면 낱장을 눌러 한 장씩 저장(9룩 컬렉션과 같다)
          return files ? (
            <button key={id} type="button" onClick={() => { saveOneImage(files[k + 1]); trackEvent('lucky9_save', { method: 'one', look: id }) }}
              aria-label={(isEn ? 'Save ' : '저장 ') + (isEn ? l.nameEn : l.fortuneKo)} className="relative block overflow-hidden bg-cream">{tile}</button>
          ) : <figure key={id} className="relative overflow-hidden bg-cream">{tile}</figure>
        })}
      </div>
      <div className="mt-4 space-y-2">
        {msg && <p className="bg-primary/10 px-3 py-2 text-[13px] font-bold text-primary-dark">{msg}</p>}
        {busy ? <p className="py-3 text-center text-sm font-bold">{isEn ? `Making ${order.length - left.length + 1} / 9… (about 30s each — keep this page open)` : `${order.length - left.length + 1} / 9장 만드는 중… (장당 30초 안팎 · 이 화면을 열어 두세요)`}</p>
          : done ? (
            <>
              {board && <img src={board} alt={isEn ? 'My 9 lucky looks in one image' : '나의 럭키 메이크업 9 모아보기'} className="w-full border border-slate-200" />}
              <button type="button" onClick={() => void saveAll()} disabled={!files} className={`${btn} bg-navy text-white hover:bg-navy-mid disabled:opacity-60`}>
                {files ? (isEn ? 'Save all 10 images' : '10장 모두 저장') : (isEn ? 'Preparing images…' : '저장 이미지 준비 중…')}
              </button>
              <button type="button" onClick={() => void sendMail()} disabled={!singles || mail === 'sending' || mail === 'sent'}
                className={`${btn} flex items-center justify-center gap-1.5 border border-slate-300 bg-white hover:border-navy disabled:opacity-60`}>
                <span className="material-symbols-outlined text-base">mail</span>
                {mail === 'sending' ? (isEn ? 'Sending…' : '보내는 중…')
                  : mail === 'sent' ? (isEn ? `Sent to ${mailTo}` : `${mailTo} 로 보냈어요`)
                  : (isEn ? 'Email all 10 to me' : '내 메일로 10장 받기')}
              </button>
              {mail === 'error' && <p className="text-center text-xs font-bold text-primary-dark">{isEn ? 'Could not send. Please try again.' : '보내지 못했어요. 다시 시도해 주세요.'}</p>}
              {mail === 'limit' && <p className="text-center text-xs font-bold text-primary-dark">{isEn ? 'You can email this up to 3 times a day.' : '메일 받기는 하루 3번까지예요.'}</p>}
              <p className="text-center text-[11px] text-slate-500">{isEn ? '3×3 board + each look · sent only to your account email (check spam). Tap a look above to save just that one.' : '모아보기 + 낱장 9장 · 로그인한 계정 메일로만 보내요(안 보이면 스팸함). 위 사진을 누르면 한 장씩 저장돼요.'}</p>
            </>
          )
          : !selfie ? <button type="button" onClick={onPhoto} className={`${btn} bg-navy text-white hover:bg-navy-mid`}>{isEn ? 'Add a selfie to make all 9' : '셀카 올리고 9장 만들기'}</button>
          : loggedIn === false ? <button type="button" onClick={onLogin} className={`${btn} bg-navy text-white hover:bg-navy-mid`}>{isEn ? `Log in to make all 9 — $${LUCKY_PRICE.nine.usd}` : `로그인하고 9장 만들기 — $${LUCKY_PRICE.nine.usd}`}</button>
          : free && credits >= left.length ? <button type="button" onClick={() => void make()} className={`${btn} bg-primary-dark text-white hover:bg-primary`}>{isEn ? `Make ${left.length === 9 ? 'all 9' : `the last ${left.length}`} — uses ${left.length} of your looks` : `보유 ${left.length}장으로 ${left.length === 9 ? '9장 전부' : `남은 ${left.length}장`} 만들기`}</button>
          : <button type="button" disabled={paying || waiting} onClick={() => void pay()} className={`${btn} bg-primary-dark text-white hover:bg-primary disabled:opacity-60`}>
              {waiting ? (isEn ? 'Checking your payment…' : '결제 확인 중…') : paying ? '…' : (isEn ? `Make all 9 — $${LUCKY_PRICE.nine.usd}` : `$${LUCKY_PRICE.nine.usd}로 9장 전부 만들기`)}
            </button>}
        <p className="text-center text-[11px] text-slate-500">
          {isEn ? 'One-time payment · no subscription · ' : '한 번 결제 · 구독 없음 · '}
          {free ? (isEn ? `You have ${credits} looks` : `보유 ${credits}장`) : (isEn ? `$${(LUCKY_PRICE.nine.usd / 9).toFixed(2)} per look` : `장당 $${(LUCKY_PRICE.nine.usd / 9).toFixed(2)}`)}
        </p>
      </div>
      {viewer && board && <LongPressSaveViewer images={[board, ...(singles ?? [])]} isEn={isEn} onClose={() => setViewer(false)} />}
    </div>
  )
}

async function renderNineBoard(srcs: string[], ids: FortuneLookId[], isEn: boolean): Promise<string> {
  const W = 360, H = 480, G = 12, P = 36, TOP = 150
  const cv = document.createElement('canvas')
  cv.width = P * 2 + W * 3 + G * 2; cv.height = TOP + H * 3 + G * 2 + 90
  const ctx = cv.getContext('2d')!
  const SANS = '"Pretendard", "Apple SD Gothic Neo", sans-serif'
  ctx.fillStyle = '#f8f6f6'; ctx.fillRect(0, 0, cv.width, cv.height)
  ctx.fillStyle = '#070953'; ctx.font = `900 64px ${SANS}`; ctx.textAlign = 'center'
  ctx.fillText(isEn ? 'MY 9 LUCKY LOOKS' : '나의 럭키 메이크업 9', cv.width / 2, 96)
  const imgs = await Promise.all(srcs.map((src) => new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src })))
  imgs.forEach((im, k) => {
    const x = P + (k % 3) * (W + G), y = TOP + Math.floor(k / 3) * (H + G)
    // object-cover — 얼굴 쪽(위 28%)에 맞춰 자른다
    const sr = im.width / im.height, dr = W / H
    let sw = im.width, sh = im.height, sx = 0, sy = 0
    if (sr > dr) { sw = im.height * dr; sx = (im.width - sw) / 2 } else { sh = im.width / dr; sy = (im.height - sh) * 0.28 }
    ctx.drawImage(im, sx, sy, sw, sh, x, y, W, H)
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x, y + H - 52, W, 52)
    const l = fortuneLookById(ids[k])
    ctx.fillStyle = '#fff'; ctx.font = `800 28px ${SANS}`
    ctx.fillText(isEn ? l.nameEn : l.fortuneKo, x + W / 2, y + H - 16)
    ctx.strokeStyle = '#070953'; ctx.lineWidth = 4; ctx.strokeRect(x, y, W, H)
  })
  ctx.fillStyle = '#070953'; ctx.font = `700 30px ${SANS}`
  ctx.fillText(isEn ? 'kissinskin.net/en/lucky-makeup · AI simulation' : 'kissinskin.net/lucky-makeup · AI 시뮬레이션', cv.width / 2, cv.height - 34)
  return cv.toDataURL('image/jpeg', 0.9)
}
// ── 설명 + 9가지 방법 링크(검색·내부 링크용 — 항상 그린다) ──
function IntroSeo({ isEn, base, fortuneHref }: { isEn: boolean; base: string; fortuneHref: string }) {
  return (
    <div className="mt-14 space-y-4 border-t border-slate-200 pt-10 text-[15px] leading-relaxed text-slate-600">
      <h2 className="text-xl font-extrabold text-navy">{isEn ? 'What is lucky makeup?' : '럭키 메이크업이 뭐예요?'}</h2>
      {isEn ? (
        <>
          <p><strong className="text-navy">Makeup for the luck you want.</strong> Korean face reading (gwansang) links each part of the face to a kind of luck: the nose to wealth, the under-eye to love, the mid-forehead to career. Each of the 9 lucky looks brightens the matching spot.</p>
          <p><strong className="text-navy">Pick one, add a selfie — done.</strong> Choose a luck, take or upload a selfie and AI applies that look to your photo. Every look also has a free step-by-step how-to on a face chart, with product links for each step.</p>
          <p><strong className="text-navy">Not sure which luck you need today?</strong> Check <a href={fortuneHref} className="font-bold text-navy underline underline-offset-4">today’s fortune</a> — free, from your birth date — and it suggests today’s look.</p>
        </>
      ) : (
        <>
          <p><strong className="text-navy">원하는 운에 맞춘 메이크업이에요.</strong> 관상에서는 얼굴 자리마다 보는 운이 있어요. 코는 재물, 눈 밑 애교살은 연애, 이마 가운데는 직업. 럭키 메이크업 9가지는 그 자리를 살려 그려요.</p>
          <p><strong className="text-navy">고르고, 셀카 넣으면 끝.</strong> 원하는 운을 고르고 셀카를 찍거나 넣으면 AI가 내 사진에 그 메이크업을 입혀요. 9가지 모두 페이스 차트로 보는 따라 하기 방법과 단계별 제품 링크가 무료로 열려 있어요.</p>
          <p><strong className="text-navy">오늘 어떤 운이 필요한지 모르겠다면</strong> 무료 <a href={fortuneHref} className="font-bold text-navy underline underline-offset-4">오늘의 운세</a>를 먼저 보세요. 생년월일로 오늘 어울리는 럭키 메이크업을 알려 드려요.</p>
        </>
      )}
      <h3 id="howto" className="scroll-mt-20 pt-2 text-base font-extrabold text-navy">{isEn ? 'How to do each look — free' : '9가지 따라 하는 방법 — 무료'}</h3>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
        {FORTUNE_LOOKS.map((l) => (
          <li key={l.id}><a href={`${base}${l.id}/`} className="font-semibold text-navy underline-offset-4 hover:underline">{isEn ? `${l.nameEn} makeup` : l.nameKo}</a></li>
        ))}
      </ul>
    </div>
  )
}

// ── 문구 ──
const KO = {
  kicker: 'Lucky makeup · 럭키 메이크업',
  title1: '럭키 메이크업', title2: '원하는 운을 내 얼굴에',
  lead: '재물운 · 연애운 · 합격운 · 건강운… 관상에서 운을 보는 자리를 살려 그리는 메이크업 9가지. 원하는 운 하나를 고르고 셀카를 찍거나 넣으면, 내 얼굴로 바로 만들어 드려요.',
  priceStrip: [['1장', '가입 무료'], ['5장', '$2.99'], ['9가지 운 전부', '$4.99']] as [string, string][],
  noSub: '한 번 결제 · 구독 없음',
  ctaStart: '운 고르기', ctaPrice: '가격 보기',
  gridTitle: '원하는 운을 고르세요', gridHint: '하나를 누르면 아래에서 바로 만들어요',
  gridNote: '같은 모델에 AI로 입힌 예시예요. 내 셀카로 하면 내 얼굴로 나와요.',
  howtoFree: '메이크업 방법도 무료로 소개해 드립니다', howtoFreeSub: '9가지 모두 페이스 차트로 보는 단계별 방법 + 단계별 제품 링크',
  makeKicker: '셀카 넣고 생성하기',
  howLink: '따라 하는 방법 · 제품 보기 →',
  camera: '셀카 찍기', gallery: '사진 고르기', change: '다른 사진으로', photoReady: '셀카 준비됐어요',
  make: '이 메이크업으로 생성하기', makeFree: '무료권으로 생성하기', makeCredit: '보유 1장으로 생성하기',
  useFree: '무료권으로 생성', useCredit: '보유 1장으로 생성', loginMake: '로그인하고 생성하기',
  counts: (f: number, c: number) => `남은 무료권 ${f}장 · 보유 ${c}장`,
  photoTip: '정면 · 앞머리 넘기기 · 무표정 · 고른 조명이면 더 잘 나와요.',
  badFile: '사진을 열 수 없어요. JPG나 PNG로 해 주세요.',
  loginNote: '생성하려면 로그인 필수 · 가입하면 럭키 메이크업 1장 무료',
  generating: '메이크업을 입히는 중… (최대 1분 · 이 화면을 열어 두세요)',
  topup: '충전하기 (5장 $2.99부터)',
  genErr: {
    login: '로그인이 필요해요.', topup: '남은 장수가 없어요. 충전하면 바로 이어서 만들 수 있어요.', free_used: '럭키 무료권은 이미 사용했어요. 보유한 장수로 만들 수 있어요.',
    choose: '무료권과 보유 장수 중 무엇을 쓸지 골라 주세요.', unavailable: '잠시 후 다시 시도해 주세요.', retry: '생성에 실패했어요. 다시 누르면 추가 차감 없이 다시 만들어요.',
  } as Record<GenError, string>,
  before: '비포', after: '애프터', usedFree: '무료권 1장 사용', usedCredit: '1장 사용',
  howAndShop: '이 메이크업 따라 하기 · 제품 보기', another: '다른 운도 만들어 보기',
  aiNote: 'AI가 내 사진에 입혀 보는 시뮬레이션이에요. 실제 화장 결과와 다를 수 있어요.',
  fortuneKicker: '무료 · 오늘의 운세', fortuneTitle: '오늘은 어떤 운이 필요할까?', fortuneDesc: '생년월일과 태어난 시로 오늘의 운세·오늘의 색·강한 운을 무료로 봐요.',
}
const EN: typeof KO = {
  kicker: 'Lucky makeup · K-face reading',
  title1: 'Lucky Makeup', title2: 'The luck you want, on your face',
  lead: 'Wealth, love, exams, health… 9 makeup looks that light up the spots Korean face reading links to each kind of luck. Pick one, take or add a selfie, and we make it on your own face.',
  priceStrip: [['1 look', 'Free'], ['5 looks', '$2.99'], ['All 9 lucks', '$4.99']],
  noSub: 'One-time payment · no subscription',
  ctaStart: 'Pick a luck', ctaPrice: 'See pricing',
  gridTitle: 'Pick the luck you want', gridHint: 'Tap one — make it right below',
  gridNote: 'Examples applied with AI on one model. With your selfie, it’s your face.',
  howtoFree: 'We also show you how to do each look — free', howtoFreeSub: 'Step-by-step face-chart how-tos for all 9, with product links for every step',
  makeKicker: 'Add a selfie & create',
  howLink: 'How-to & products →',
  camera: 'Take a selfie', gallery: 'Choose a photo', change: 'Use another photo', photoReady: 'Selfie ready',
  make: 'Create this look', makeFree: 'Create with free pass', makeCredit: 'Create with 1 look',
  useFree: 'Use free pass', useCredit: 'Use 1 look', loginMake: 'Log in to create',
  counts: (f: number, c: number) => `Free pass ${f} · ${c} looks left`,
  photoTip: 'Front-facing, hair off the forehead, neutral expression, even light.',
  badFile: 'We couldn’t open that photo. Please use a JPG or PNG.',
  loginNote: 'Log in to create · sign up and 1 lucky look is free',
  generating: 'Applying the makeup… (up to a minute — keep this page open)',
  topup: 'Top up (5 looks from $2.99)',
  genErr: {
    login: 'Please log in.', topup: 'No looks left. Top up and carry on right here.', free_used: 'Your lucky free pass is already used. You can use your looks.',
    choose: 'Choose your free pass or your looks.', unavailable: 'Please try again in a moment.', retry: 'That didn’t work. Tap again — you won’t be charged twice.',
  },
  before: 'Before', after: 'After', usedFree: '1 free pass used', usedCredit: '1 look used',
  howAndShop: 'How to do this look · products', another: 'Try another luck',
  aiNote: 'An AI simulation on your photo — real makeup may look different.',
  fortuneKicker: 'Free · Today’s fortune', fortuneTitle: 'Which luck do you need today?', fortuneDesc: 'From your birth date and hour — today’s fortune, colour and strongest lucks, free.',
}
