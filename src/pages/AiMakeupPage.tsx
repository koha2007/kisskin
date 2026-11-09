// 9가지 메이크업 — /makeup/ · /en/makeup/ (2026-11-02)
// ─────────────────────────────────────────────────────────────────
// 운영자: "9가지 메이크업도 럭키 메이크업처럼. 지금은 바로 생성 창으로 가서 5장을 고를 수가 없다."
// → 럭키 메이크업과 같은 화면: 3×3 고르기 → 사진 → [생성하기] → 결과. 같은 셀카로 룩만 바꿔 계속 만든다.
// 무료권 = makeup 풀 1장(럭키와 별개) · 5장·15장 = 크레딧 충전 후 이 페이지로 복귀 · 9장 = 9룩 컬렉션(/analysis/?collection=new).
// 11/2 운영자 "5가지는 어떻게 선택해?" → 1가지·5가지·9장 탭. 5가지 = FiveLooksBox(여러 개 골라 한 번에), 9장 = 9룩 컬렉션.
// 같은 작업 재시도는 같은 jobId(이중 차감 X). 생성 실패 뒤 다른 룩을 골라도 jobId 를 유지한다(이미 낸 1장을 다시 받지 않는다).
import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import ResultGrid from '../components/result-grid/ResultGrid'
import { ProductGridCard } from '../components/result-grid/ProductGridCard'
import AffiliateDisclosure from '../components/AffiliateDisclosure'
import ResultSaveEmail from '../components/makeup/ResultSaveEmail'
import { pickImage } from '../lib/nativePicker'
import { trackEvent } from '../lib/analytics'
import { supabase } from '../lib/supabase'
import { getFreeStatus, type FreeStatus, type PayChoice } from '../lib/freeStatus'
import { MAKEUP_STYLES, styleById, type MakeupStyleId } from '../lib/makeup/styles'
import { LOOK_HERO, lookThumb } from '../lib/makeup/lookImages'
import { lookProducts } from '../lib/makeup/lookProducts'
import { generateMakeupLook, newJobId, keepPendingStyle, takePendingStyle, type GenError } from '../lib/makeup/generateLook'
import { savePendingSelfieFromSrc, takePendingSelfie, keepPendingSelfie, clearPendingSelfie } from '../lib/makeup/pendingSelfie'
import { startPackCheckout, type CheckoutPack } from '../lib/makeup/packCheckout'
import { trackCheckoutReturn } from '../lib/purchaseTracking'
import ChargeReceiptToast from '../components/credits/ChargeReceiptToast'
import { useChargeReceipt } from '../hooks/useChargeReceipt'
import FiveLooksBox, { FIVE_COUNT, LookModeTabs, type LookMode } from '../components/makeup/FiveLooksBox'
import { disarmFive } from '../lib/makeup/fiveStore'
import LookCompare from '../components/makeup/LookCompare'

type Gen = { k: 'idle' } | { k: 'busy' } | { k: 'done'; image: string; tier: 'free' | 'credit'; balance?: number } | { k: 'error'; e: GenError }

const STARTER: CheckoutPack = { id: 'starter', credits: 5, value: 2.99 }
const PLUS: CheckoutPack = { id: 'plus', credits: 15, value: 6.99 }

const KO = {
  kicker: 'AI MAKEUP · 9가지 메이크업', title1: '9가지 메이크업', title2: '내 얼굴에 바로',
  lead: '계절 룩부터 K-pop 아이돌까지. 원하는 룩을 고르고 셀카를 넣으면 내 얼굴로 만들어 드려요. 같은 셀카로 룩만 바꿔 계속 만들 수 있어요.',
  strip: [['1장', '가입 무료'], ['5장', '$2.99'], ['9룩 전부', '$4.99']], pickCta: '룩 고르기', priceCta: '가격 보기', noSub: '한 번 결제 · 구독 없음',
  gridTitle: '몇 가지 만들까요?', gridHint: { one: '하나를 누르면 아래에서 바로 만들어요', five: (n: number) => `5가지를 눌러 고르세요 · ${n}/5`, nine: '9가지 전부 만들어요' }, fiveFull: '5가지를 모두 골랐어요. 바꾸려면 고른 룩을 다시 눌러 빼 주세요.', gridNote: '예시 사진은 AI 생성 모델에 같은 도구로 입힌 결과예요.',
  makeKicker: '내 얼굴로 만들기', how: '이 룩 하는 방법 보기 →', before: '내 사진', after: '결과',
  camera: '셀카 찍기', gallery: '사진 넣기', photoReady: '사진 준비 완료', change: '바꾸기', badFile: '사진을 읽지 못했어요. 다른 사진으로 시도해 주세요.', photoTip: '정면 · 앞머리 넘기기 · 무표정 · 고른 조명이면 더 잘 나와요.',
  make: '이 메이크업으로 생성하기', makeFree: '무료권으로 생성하기', makeCredit: '보유 1장으로 생성하기', useFree: '무료권으로 생성', useCredit: '보유 1장으로 생성', loginMake: '로그인하고 생성하기', loginNote: '가입하면 9가지 메이크업 1장 + 럭키 메이크업 1장 무료 · 카드 등록 없음',
  counts: (f: number, c: number) => `남은 무료권 ${f}장 · 보유 ${c}장`, generating: '메이크업을 만드는 중이에요… (최대 1분)', another: '다른 룩도 같은 셀카로 만들기', usedFree: '무료권 1장 사용', usedCredit: '보유 1장 사용', left: (n: number) => `보유 ${n}장 남음`,
  buy5: '5장 구매 · $2.99', pick5: '5가지 고르기 · $2.99', buy15: '15장 $6.99', nineTitle: '9룩을 한 번에', nineDesc: '같은 셀카로 9장 + 모아보기 1장. 다음 화면에서 셀카를 확인하고 결제해요. 2~3분이면 완성돼요.', nineBtn: '9룩 전부 받기 · $4.99',
  checkoutErr: '결제창을 열지 못했어요. 다시 눌러 주세요.', priceTitle: '가격', priceSub: '1장 = 내 셀카에 그 메이크업을 입힌 사진 한 장이에요.', tax: '결제창에서 세금이 더해질 수 있어요. 구독·자동 결제는 없어요.',
  plans: [
    { n: '1장', p: '무료', s: '가입 무료권 — 9가지 메이크업 1장', i: ['9가지 중 원하는 하나', '럭키 메이크업 무료 1장과 별개', '카드 등록 없음'] },
    { n: '5장', p: '$2.99', s: '장당 약 $0.60', i: ['원하는 룩을 골라서 5장', '같은 셀카로 룩만 바꿔 가며', '럭키 메이크업에도 사용 가능'] },
    { n: '9룩 전부', p: '$4.99', s: '장당 약 $0.55', i: ['셀카 한 장 → 9장 자동 생성', '모아보기 1장 포함', '가장 저렴한 묶음'] },
  ],
  shop: '이 룩 따라 하기', shopNote: '제품 종류로 검색하는 링크예요. 특정 제품을 추천하는 건 아니에요.', ai: 'AI가 만든 이미지예요. 사진은 처리 후 삭제해요.',
  genErr: { login: '로그인이 필요해요.', topup: '남은 장수가 없어요. 충전하면 바로 이어서 만들 수 있어요.', free_used: '메이크업 무료권은 이미 사용했어요. 보유 장수로 만들 수 있어요.', choose: '무료권과 보유 장수 중 무엇을 쓸지 골라 주세요.', unavailable: '서비스가 잠시 준비 중이에요. 잠시 후 다시 시도해 주세요.', retry: '생성에 실패했어요. 다시 눌러 주세요. 추가로 차감되지 않아요.' } as Record<GenError, string>,
}
const EN: typeof KO = {
  kicker: 'AI MAKEUP · 9 LOOKS', title1: '9 Makeup Looks', title2: 'on your own face',
  lead: 'From seasonal looks to K-pop idol. Pick a look, add a selfie and see it on your face. Keep the same selfie and switch looks as often as you like.',
  strip: [['1 look', 'Free'], ['5 looks', '$2.99'], ['All 9', '$4.99']], pickCta: 'Pick a look', priceCta: 'See pricing', noSub: 'One-time payment · no subscription',
  gridTitle: 'How many looks?', gridHint: { one: 'Tap one to make it below', five: (n: number) => `Tap 5 looks · ${n}/5`, nine: 'We’ll make all 9' }, fiveFull: 'You’ve picked 5. Tap a picked look to remove it first.', gridNote: 'Examples are this tool’s output on an AI-generated model.',
  makeKicker: 'Make it on my face', how: 'See how to do this look →', before: 'My photo', after: 'Result',
  camera: 'Take a selfie', gallery: 'Add a photo', photoReady: 'Photo ready', change: 'Change', badFile: 'Couldn’t read that photo. Please try another.', photoTip: 'Front-facing, hair off the forehead, neutral expression, even light.',
  make: 'Create this look', makeFree: 'Create with free pass', makeCredit: 'Create with 1 look', useFree: 'Use free pass', useCredit: 'Use 1 look', loginMake: 'Log in to create', loginNote: 'Sign up: 1 makeup look + 1 lucky look free · no card',
  counts: (f: number, c: number) => `Free pass ${f} · ${c} looks left`, generating: 'Creating your makeup… (up to 1 min)', another: 'Make another look with this selfie', usedFree: 'Used your free pass', usedCredit: 'Used 1 look', left: (n: number) => `${n} looks left`,
  buy5: 'Buy 5 looks · $2.99', pick5: 'Pick 5 looks · $2.99', buy15: '15 looks $6.99', nineTitle: 'All 9 at once', nineDesc: '9 looks from one selfie + 1 grid image. Confirm your selfie and pay on the next screen. Ready in 2–3 minutes.', nineBtn: 'Get all 9 · $4.99',
  checkoutErr: 'Couldn’t open checkout. Please try again.', priceTitle: 'Pricing', priceSub: 'One look = one photo of you in that makeup.', tax: 'Tax may be added at checkout. No subscription or auto-renewal.',
  plans: [
    { n: '1 look', p: 'Free', s: 'Sign-up free pass — 1 makeup look', i: ['Any one of the 9', 'Separate from your free lucky look', 'No card needed'] },
    { n: '5 looks', p: '$2.99', s: 'About $0.60 per look', i: ['Choose any 5 looks', 'Keep the same selfie', 'Also works for Lucky Makeup'] },
    { n: 'All 9', p: '$4.99', s: 'About $0.55 per look', i: ['One selfie → 9 looks automatically', 'Includes 1 grid image', 'Best-value bundle'] },
  ],
  shop: 'Get this look', shopNote: 'These links search by product type — not specific products we endorse.', ai: 'AI-generated image. Your photo is deleted after processing.',
  genErr: { login: 'Please log in.', topup: 'No looks left. Top up and carry on right here.', free_used: 'Your makeup free pass is already used. You can use your looks.', choose: 'Choose your free pass or your looks.', unavailable: 'Service is briefly unavailable. Please try again shortly.', retry: 'Generation failed. Tap again — you won’t be charged twice.' },
}

export default function AiMakeupPage() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const T = isEn ? EN : KO
  const base = isEn ? '/en/makeup/' : '/makeup/'
  const [look, setLook] = useState<MakeupStyleId>('autumn-berry')
  const [mode, setMode] = useState<LookMode>('one')
  const [picked, setPicked] = useState<MakeupStyleId[]>([])
  const [fiveLocked, setFiveLocked] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [preview, setPreview] = useState<MakeupStyleId>('autumn-berry')
  const [photo, setPhoto] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [gen, setGen] = useState<Gen>({ k: 'idle' })
  const [free, setFree] = useState<FreeStatus | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  // 결제 복귀(?paid=1) — 주소는 브라우저에서만 읽는다(미리 렌더한 페이지)
  const [paidBack, setPaidBack] = useState(false)
  const [paying, setPaying] = useState(false)
  const jobRef = useRef('')
  const makeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const q = new URLSearchParams(window.location.search)
    const pl = q.get('look')
    const valid = !!pl && MAKEUP_STYLES.some((s) => s.id === pl)
    if (valid) setLook(pl as MakeupStyleId)
    const qm = q.get('mode')
    if (qm === '5') setMode('five')
    if (qm === '9') setMode('nine')
    const returned = q.get('resume') === '1' || q.get('paid') === '1'
    if (returned || valid) {
      const ph = takePendingSelfie()
      const lk = takePendingStyle()
      if (ph) { setPhoto(ph); keepPendingSelfie(ph) }
      if (lk) setLook(lk)
      setTimeout(() => makeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400)
    }
    if (q.get('paid') === '1') { trackCheckoutReturn(); setPaidBack(true) }
  }, [])

  useEffect(() => {
    let off = false
    supabase.auth.getSession().then(({ data }) => {
      if (off) return
      setLoggedIn(!!data.session)
      if (data.session) getFreeStatus().then((s) => { if (!off) setFree(s) })
    }).catch(() => setLoggedIn(false))
    return () => { off = true }
  }, [gen.k])

  const refreshFree = useCallback(() => { void getFreeStatus().then((s) => { if (s) setFree(s) }) }, [])
  // 결제 복귀 — 장부에서 방금 들어온 충전을 찾아 "+N개 · 지금 M개 · 내역 보기"(웹훅이 몇 초 늦을 수 있다)
  const [charge, closeCharge] = useChargeReceipt(paidBack, refreshFree)
  const freeLeft = free?.makeup.left ?? 0
  const credits = free?.balance ?? 0
  const busy = gen.k === 'busy'
  const none = !!free && freeLeft === 0 && credits === 0
  const cur = styleById(look)
  const name = isEn ? cur.subEn : cur.nameKo

  const stash = () => { keepPendingStyle(look); if (photo) keepPendingSelfie(photo) }
  const generate = async (pay?: PayChoice) => {
    if (!photo) return
    if (!loggedIn) {
      stash()
      trackEvent('makeup_login_gate', { style: look })
      window.location.href = '/auth?next=' + encodeURIComponent(`${base}?resume=1`)
      return
    }
    if (!jobRef.current) jobRef.current = newJobId()
    setGen({ k: 'busy' })
    const r = await generateMakeupLook({ photo, styleId: look, jobId: jobRef.current, pay })
    if (r.ok) {
      jobRef.current = ''
      setGen({ k: 'done', image: r.image, tier: r.tier, balance: r.balance })
      trackEvent('makeup_generated', { style: look })
      trackEvent(r.tier === 'free' ? 'free_trial_used' : 'credit_used', { style: look })
    } else {
      // retry·unavailable 은 이미 차감됐을 수 있어 jobId 를 유지한다(같은 키 = 추가 차감 없음)
      if (r.error !== 'retry' && r.error !== 'unavailable') jobRef.current = ''
      setGen({ k: 'error', e: r.error })
      if (r.error === 'login') setLoggedIn(false)
    }
  }
  const choosePhoto = async (mode: 'camera' | 'gallery') => {
    const file = await pickImage(mode)
    if (!file) return
    const url = URL.createObjectURL(file)
    const ok = await savePendingSelfieFromSrc(url)
    const small = ok ? takePendingSelfie() : null
    URL.revokeObjectURL(url)
    if (!small) { setErr(T.badFile); return }
    keepPendingSelfie(small)
    setPhoto(small); setErr(null); setGen({ k: 'idle' })
    trackEvent('makeup_photo', { mode })
  }
  const scrollTo = (m: LookMode) => setTimeout(() => document.getElementById(m === 'one' ? 'make' : m === 'five' ? 'five' : 'nine')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  const changeMode = (m: LookMode, scrollId?: string) => {
    if (mode === 'one') setPreview(look)
    setMode(m); setNote(null)
    trackEvent('look_mode', { mode: m, store: 'makeup' })
    if (scrollId) setTimeout(() => document.getElementById(scrollId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  const pick = (id: MakeupStyleId) => {
    if (mode === 'nine') { scrollTo('nine'); return }
    if (mode === 'five') {
      if (fiveLocked) return
      if (picked.includes(id)) { setPicked(picked.filter((x) => x !== id)); setNote(null); return }
      if (picked.length >= FIVE_COUNT) { setNote(T.fiveFull); return }
      const next = [...picked, id]
      setPicked(next); setNote(null); setPreview(id)
      trackEvent('style_selected', { style: id, mode: 'five' })
      if (next.length === FIVE_COUNT) scrollTo('five')
      return
    }
    if (busy) return
    setLook(id); setGen({ k: 'idle' })
    trackEvent('style_selected', { style: id })
    setTimeout(() => makeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  const buy = async (pack: CheckoutPack) => {
    stash(); setPaying(true); setErr(null)
    await disarmFive('makeup')
    trackEvent('paywall_cta', { plan: pack.id, from: 'makeup_page' })
    const out = await startPackCheckout(pack, base)
    if (out === 'error') setErr(T.checkoutErr)
    if (out !== 'redirect') setPaying(false)
  }
  const goNine = () => {
    if (photo) keepPendingSelfie(photo)
    trackEvent('collection_entry', { from: 'makeup_page' })
    window.location.href = '/analysis/?collection=new'
  }

  const btn = 'flex w-full items-center justify-center gap-1.5 py-3.5 text-[15px] font-bold transition-colors disabled:opacity-60'
  const eyebrow = 'text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark'
  return (
    <div className="font-display bg-background-light min-h-screen text-navy">
      <ChargeReceiptToast st={charge} onClose={closeCharge} isEn={isEn} />
      <ToolsNav />
      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <section className="pt-10 md:pt-14">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div className="min-w-0">
              <p className={eyebrow}>{T.kicker}</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl break-keep">{T.title1}<br /><span className="text-primary-dark">{T.title2}</span></h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 md:text-lg break-keep">{T.lead}</p>
            </div>
            <div className="min-w-0 md:w-full md:max-w-sm md:justify-self-end">
              <ul className="grid grid-cols-3 divide-x divide-slate-200 border border-slate-200 bg-white text-center">
                {T.strip.map(([n, p], i) => (
                  <li key={n}><button type="button" onClick={() => changeMode((['one', 'five', 'nine'] as const)[i], 'looks')} className="block w-full px-2 py-3 hover:bg-cream"><span className="block text-[11px] font-semibold text-slate-500">{n}</span><span className="block text-lg font-extrabold tabular-nums">{p}</span></button></li>
                ))}
              </ul>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href="#looks" className="flex items-center justify-center bg-navy py-3.5 text-sm font-bold text-white">{T.pickCta}</a>
                <a href="#price" className="flex items-center justify-center border border-slate-300 bg-white py-3.5 text-sm font-bold">{T.priceCta}</a>
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-500">{T.noSub}</p>
            </div>
          </div>

          <div id="looks" className="mt-12 scroll-mt-20">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
              <h2 className="text-xl font-extrabold md:text-3xl"><span className="mr-2 tabular-nums text-primary-dark">1</span>{T.gridTitle}</h2>
            </div>
            <LookModeTabs mode={mode} isEn={isEn} onChange={(m) => changeMode(m)} nineLabel={{ ko: '9룩 전부', en: 'All 9' }} />
            <LookCompare isEn={isEn} active={mode === 'one' ? look : preview}
              looks={MAKEUP_STYLES.map((s) => ({ id: s.id, name: isEn ? s.subEn : s.nameKo, thumb: lookThumb(s.id), before: LOOK_HERO[s.id].before, after: LOOK_HERO[s.id].after }))}
              onSelect={(id) => { setPreview(id as MakeupStyleId); if (mode === 'one' && !busy) { setLook(id as MakeupStyleId); setGen({ k: 'idle' }) } trackEvent('look_compare', { store: 'makeup', look: id }) }} />
            <p className="mt-3 text-sm font-bold text-primary-dark" aria-live="polite">{note ?? (mode === 'one' ? T.gridHint.one : mode === 'five' ? T.gridHint.five(picked.length) : T.gridHint.nine)}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 md:gap-4" role={mode === 'one' ? 'radiogroup' : 'group'} aria-label={T.gridTitle}>
              {MAKEUP_STYLES.map((s) => {
                const order = picked.indexOf(s.id)
                const on = mode === 'nine' || (mode === 'five' ? order >= 0 : s.id === look)
                return (
                  <button key={s.id} type="button" role={mode === 'one' ? 'radio' : 'checkbox'} aria-checked={on} onClick={() => pick(s.id)} className={`block border-2 bg-white text-left transition-colors ${on ? 'border-primary' : 'border-transparent ring-1 ring-slate-200 hover:ring-navy'}`}>
                    <span className="relative block aspect-[4/5] overflow-hidden bg-cream md:aspect-square">
                      <img src={LOOK_HERO[s.id].after} alt={isEn ? `${s.subEn} makeup, AI-generated model` : `${s.nameKo}, AI 생성 모델`} loading="lazy" className="h-full w-full object-cover object-[50%_26%]" />
                      {mode === 'five' && order >= 0 ? <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[13px] font-extrabold text-navy md:right-3 md:top-3">{order + 1}</span>
                        : mode === 'five' ? <span className="absolute right-1.5 top-1.5 h-6 w-6 rounded-full border-2 border-white bg-navy/25 md:right-3 md:top-3" />
                        : on && <span className="material-symbols-outlined absolute right-1.5 top-1.5 rounded-full bg-primary p-0.5 text-[16px] text-navy md:right-3 md:top-3" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                    </span>
                    <span className="block p-2 md:p-4">
                      <span className={`block text-[13px] font-extrabold leading-tight md:text-lg break-keep ${on ? 'text-primary-dark' : ''}`}>{isEn ? s.subEn : s.nameKo}</span>
                      <span className="mt-1 hidden text-sm leading-snug text-slate-600 md:block break-keep">{isEn ? s.descEn : s.descKo}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-[11px] text-slate-500">{T.gridNote}</p>
          </div>

          <div ref={makeRef} id="make" className={`mx-auto mt-10 max-w-xl scroll-mt-20 bg-navy p-5 text-white md:p-7 ${mode === 'one' ? '' : 'hidden'}`}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-on-dark"><span className="mr-1.5 tabular-nums">2</span>{T.makeKicker}</p>
            {gen.k === 'done' && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <figure><img src={photo ?? ''} alt="" className="aspect-[3/4] w-full object-cover" /><figcaption className="mt-1 text-center text-[11px] font-bold text-white/70">{T.before}</figcaption></figure>
                <figure><img src={gen.image} alt={name} className="aspect-[3/4] w-full object-cover" /><figcaption className="mt-1 text-center text-[11px] font-bold">{T.after}</figcaption></figure>
              </div>
            )}
            <div className="mt-3 flex gap-4">
              {gen.k !== 'done' && <img src={photo && busy ? photo : LOOK_HERO[look].after} alt="" className={`h-36 w-24 shrink-0 object-cover object-[50%_26%] ${busy ? 'animate-pulse' : ''}`} />}
              <div className="min-w-0">
                <p className="text-xl font-extrabold leading-tight">{name}</p>
                <p className="mt-1 text-[13px] leading-snug text-white/80 break-keep">{isEn ? cur.descEn : cur.descKo}</p>
                <a href={`${isEn ? '/en' : ''}/looks/${look}/`} className="mt-2 inline-flex text-xs font-bold text-white underline underline-offset-4">{T.how}</a>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {err && <p className="bg-primary/20 px-3 py-2 text-[13px] font-bold">{err}</p>}
              {gen.k === 'error' && <p className="bg-primary/20 px-3 py-2 text-[13px] font-bold">{T.genErr[gen.e]}</p>}
              {busy ? (
                <p className="bg-white/10 py-4 text-center text-sm font-bold">{T.generating}</p>
              ) : gen.k === 'done' ? (
                <>
                  <ResultSaveEmail image={gen.image} name={name} desc={isEn ? cur.descEn : cur.descKo} fileName={`kissinskin-makeup-${look}.jpg`} tag={`makeup:${look}`} isEn={isEn} />
                  <a href="#looks" className="block pt-1 text-center text-sm font-bold underline underline-offset-4">{T.another}</a>
                  <p className="text-center text-[11px] text-white/60">{gen.tier === 'free' ? T.usedFree : T.usedCredit}{typeof gen.balance === 'number' && ` · ${T.left(gen.balance)}`}</p>
                </>
              ) : (
                <>
                  {photo ? (
                    <div className="flex items-center gap-3 bg-white/10 p-2 text-xs">
                      <img src={photo} alt="" className="h-12 w-12 object-cover" />
                      <span className="min-w-0 flex-1 font-bold">{T.photoReady}</span>
                      <button type="button" onClick={() => { setPhoto(null); clearPendingSelfie() }} className="font-bold underline underline-offset-4">{T.change}</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => void choosePhoto('camera')} className={`${btn} bg-white text-navy`}>{T.camera}</button>
                      <button type="button" onClick={() => void choosePhoto('gallery')} className={`${btn} border border-white/40 text-white`}>{T.gallery}</button>
                    </div>
                  )}
                  {loggedIn === false ? (
                    <>
                      <button type="button" disabled={!photo} onClick={() => void generate()} className={`${btn} bg-primary text-navy`}>{T.loginMake}</button>
                      <p className="text-center text-[11px] text-white/70 break-keep">{T.loginNote}</p>
                    </>
                  ) : none ? (
                    <button type="button" disabled={paying} onClick={() => void buy(STARTER)} className={`${btn} bg-primary text-navy`}>{T.buy5}</button>
                  ) : free && freeLeft > 0 && credits > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" disabled={!photo} onClick={() => void generate('free')} className={`${btn} bg-primary text-navy`}>{T.useFree}</button>
                      <button type="button" disabled={!photo} onClick={() => void generate('credit')} className={`${btn} bg-white text-navy`}>{T.useCredit}</button>
                    </div>
                  ) : (
                    <button type="button" disabled={!photo} onClick={() => void generate(free ? (freeLeft > 0 ? 'free' : 'credit') : undefined)} className={`${btn} bg-primary text-navy`}>{free ? (freeLeft > 0 ? T.makeFree : T.makeCredit) : T.make}</button>
                  )}
                  {free && <p className="text-center text-[11px] text-white/70">{T.counts(freeLeft, credits)}</p>}
                  {!photo && <p className="text-center text-[11px] text-white/60 break-keep">{T.photoTip}</p>}
                </>
              )}
            </div>
            <p className="mt-4 text-[11px] text-white/60">{T.ai}</p>
          </div>

          {mode === 'one' && gen.k === 'done' && (
            <div className="mx-auto mt-6 max-w-xl">
              <h3 className="mb-3 text-base font-extrabold">{T.shop}</h3>
              <ResultGrid>
                {lookProducts(look).map((p, i) => <ProductGridCard key={p.searchKeywords} item={p} accent="#c4177c" pageType="makeup" pageSlug={`makeup-${look}`} slot={i + 1} />)}
              </ResultGrid>
              <p className="mt-3 text-center text-[11px] text-slate-500">{T.shopNote}</p>
              <AffiliateDisclosure className="mt-1 text-center" />
            </div>
          )}

          {/* 만드는 중에 탭을 바꿔도 끊기지 않게 항상 올려 두고 숨기기만 한다 */}
          <div className={mode === 'five' ? '' : 'hidden'}>
            <FiveLooksBox storeKey="makeup" isEn={isEn} base={base} photo={photo} picked={picked} loggedIn={loggedIn} free={free}
              looks={MAKEUP_STYLES.map((s) => ({ id: s.id, name: isEn ? s.subEn : s.nameKo, desc: isEn ? s.descEn : s.descKo, img: LOOK_HERO[s.id].after, howHref: `${isEn ? '/en' : ''}/looks/${s.id}/` }))}
              generate={async (id, selfie, jobId) => { const r = await generateMakeupLook({ photo: selfie, styleId: id as MakeupStyleId, jobId, pay: 'credit' }); return r.ok ? { ok: true, image: r.image, balance: r.balance } : r }}
              onPhoto={(m) => void choosePhoto(m)} onClearPhoto={() => { setPhoto(null); clearPendingSelfie() }}
              onRestore={(ids, selfie, open) => { setPicked(ids as MakeupStyleId[]); if (open) { setPhoto(selfie); setMode('five') } }}
              onLocked={setFiveLocked} onReset={() => setPicked([])} onFree={refreshFree} onLoggedOut={() => setLoggedIn(false)} />
          </div>

          <div id="nine" className={`mx-auto mt-10 flex max-w-xl scroll-mt-20 flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white p-5 ${mode === 'nine' ? '' : 'hidden'}`}>
            <div className="min-w-0 flex-1 basis-56">
              <h2 className="text-xl font-extrabold">{T.nineTitle}</h2>
              <p className="mt-1 text-sm text-slate-600 break-keep">{T.nineDesc}</p>
            </div>
            <button type="button" onClick={goNine} className="w-full bg-navy px-5 py-3.5 text-sm font-bold text-white sm:w-auto">{T.nineBtn}</button>
          </div>

          <div id="price" className="mt-14 scroll-mt-20">
            <h2 className="text-xl font-extrabold md:text-3xl">{T.priceTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">{T.priceSub}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3 md:gap-5">
              {T.plans.map((r, i) => (
                <div key={r.n} className={`flex flex-col p-5 md:p-6 ${i === 2 ? 'bg-navy text-white' : 'border border-slate-200 bg-white'}`}>
                  <p className={`text-sm font-extrabold ${i === 2 ? 'text-primary-on-dark' : 'text-primary-dark'}`}>{r.n}</p>
                  <p className="mt-2 text-4xl font-extrabold leading-none tabular-nums">{r.p}</p>
                  <p className={`mt-2 text-xs font-semibold ${i === 2 ? 'text-white/70' : 'text-slate-500'}`}>{r.s}</p>
                  <ul className="mb-4 mt-4 space-y-1.5 text-sm">{r.i.map((t) => <li key={t} className="break-keep">· {t}</li>)}</ul>
                  <div className="mt-auto">
                    {i === 0 && <button type="button" onClick={() => changeMode('one', 'looks')} className="block w-full border border-navy py-3 text-center text-sm font-bold">{T.pickCta}</button>}
                    {i === 1 && <button type="button" onClick={() => changeMode('five', 'looks')} className="w-full bg-primary py-3 text-sm font-bold text-navy">{T.pick5}</button>}
                    {i === 2 && <button type="button" onClick={() => changeMode('nine', 'nine')} className="w-full bg-primary py-3 text-sm font-bold text-navy">{T.nineBtn}</button>}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 break-keep">
              {T.tax}{' '}
              <button type="button" disabled={paying} onClick={() => void buy(PLUS)} className="font-bold text-navy underline underline-offset-2">{T.buy15}</button>
            </p>
          </div>
        </section>
      </main>
      <ToolsFooter />
    </div>
  )
}
