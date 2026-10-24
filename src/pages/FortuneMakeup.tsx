// 럭키 메이크업(옛 관상·사주 메이크업) — /lucky-makeup/ · /en/lucky-makeup/ (2026-10-21, 10/22 이동·개편)
// 10/22 운영자: 무료 도구 안이 맞나 · 9종 3×3 크게 · 1장/9장 가격 표시 · 9종 방법 콘텐츠.
// 10/24 운영자: 메이크업이 주인공·사주는 양념 · 9종 이름 원복(재물운…) · 가격은 장수로 · 색은 키스인스킨 브랜드.
//   → 무료 도구에서 빼 독립 페이지(무료 운 풀이는 입구, 본 상품은 메이크업). 9종 방법 = /lucky-makeup/{id}/.
// ────────────────────────────────────────────────────────────────────
// 흐름: 입력(셀카 · 생년월일, 하나만 있어도 됨) → 분석(기기 안) → 결과 카드 A2(무료)
//      → 처방 관상 메이크업을 내 얼굴에(무료권/크레딧) → 완성 카드 + 관상 포카 · 도감
// 공유 링크(?c=)로 들어온 친구는 사진 없는 카드 + "도감에 추가" + "나도 해보기".
// 사진·생년월일은 서버로 보내지 않는다(메이크업 생성 때 셀카만 생성 API 로 — 기존 AI 메이크업과 동일).
import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { pickImage, nativeSaveImage, isNativeApp } from '../lib/nativePicker'
import { trackEvent, trackToolComplete } from '../lib/analytics'
import { scanFortuneFace, faceAxes, type FaceScan, type FaceScanError, type AnimalId } from '../lib/fortune/face'
import { computeSaju, isValidBirth, pillarHanja, ELEMENTS, type BirthInput, type Element } from '../lib/fortune/saju'
import { readFortunes } from '../lib/fortune/reading'
import { FORTUNE_LOOKS, fortuneLookById, ELEMENT_ACCENT, type FortuneLookId, luckyLookImg } from '../lib/fortune/looks'
import { ANIMALS, SECRET_BADGE, badgeSrc } from '../lib/fortune/animals'
import { saveLast, loadLast, loadDex, addToDex, hasSecret, encodeShare, decodeShare, serialOf, type FortuneResult, type SharedCard } from '../lib/fortune/state'
import { renderResultCard, renderPhotocardFront, renderPhotocardBack, OBANG, type CardData } from '../lib/fortune/card'
import { generateFortuneMakeup, newJobId, keepPendingLook, takePendingLook, type GenError } from '../lib/fortune/generate'
import { getFreeStatus, type FreeStatus, type PayChoice } from '../lib/freeStatus'
import { dailyFortune } from '../lib/fortune/daily'
import { loadReading, requestReading, type PreciseReading, type ReadingError } from '../lib/fortune/readingApi'
import { compatOf, bumpCompatCount, COMPAT_TEXT, type Compat } from '../lib/fortune/compat'
import { unlockSecret } from '../lib/fortune/state'
import { savePendingSelfieFromSrc, takePendingSelfie, keepPendingSelfie, clearPendingSelfie } from '../lib/makeup/pendingSelfie'
import { supabase } from '../lib/supabase'
import { withRef } from '../lib/referral'
import { trackCheckoutReturn } from '../lib/purchaseTracking'
import { startPackCheckout } from '../lib/makeup/packCheckout'
import { loadLucky, saveLucky, type LuckyState } from '../lib/fortune/luckyStore'
import { LUCKY_PRICE } from '../lib/fortune/pricing'

type Phase = 'intro' | 'busy' | 'result' | 'shared'
// 운세 앱 영역(사주 명식·정밀 풀이·궁합) — 2026-10-24 화면에서 뺌. 4주 데이터 보고 다시 판단.
// (매일 운세는 10/25 운영자 승인으로 다시 켬 — 재방문 장치)
const SHOW_FORTUNE_EXTRAS = false
// 2027 신년운 페이지(/tools/2027-fortune/)가 열리면 true — 그때부터 12~1월에 입구 배너가 뜬다
const NEW_YEAR_OPEN = false
const ELEM_KO: Record<Element, string> = { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' }
const ELEM_EN: Record<Element, string> = { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' }
const lookImg = luckyLookImg

function analyze(scan: FaceScan | null, birth: BirthInput | null): FortuneResult {
  const saju = birth ? computeSaju(birth) : undefined
  const seed = JSON.stringify([birth, scan ? Object.values(scan.z).map((v) => Math.round(v * 10)) : null])
  return {
    v: 1, createdAt: Date.now(), birth: birth ?? undefined,
    z: scan?.z, axes: scan ? faceAxes(scan.z) : undefined, animals: scan?.animals,
    scores: readFortunes({ z: scan?.z, saju, seed }),
    dayStem: saju?.day.stem, lacking: saju?.lacking, counts: saju?.counts,
    serial: serialOf(seed),
  }
}

async function canvasToDataUrl(cv: HTMLCanvasElement) { return cv.toDataURL('image/jpeg', 0.92) }

async function saveOrShare(dataUrl: string, name: string, isEn: boolean) {
  if (isNativeApp()) { await nativeSaveImage(dataUrl); return }
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], name, { type: 'image/jpeg' })
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean }
    if (nav.canShare?.({ files: [file] })) { await nav.share({ files: [file], title: isEn ? 'My fortune face' : '나의 관상 카드' }); return }
  } catch { /* 공유 취소 등 → 다운로드로 */ }
  const a = document.createElement('a'); a.href = dataUrl; a.download = name; a.click()
}

export default function FortuneMakeup() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const base = isEn ? '/en/lucky-makeup/' : '/lucky-makeup/'
  const [phase, setPhase] = useState<Phase>('intro')
  const [photo, setPhoto] = useState<string | null>(null)
  const [birth, setBirth] = useState<{ y: string; m: string; d: string; h: string }>({ y: '', m: '', d: '', h: '' })
  const [err, setErr] = useState<string | null>(null)
  const [result, setResult] = useState<FortuneResult | null>(null)
  const [shared, setShared] = useState<SharedCard | null>(null)
  const [card, setCard] = useState<string | null>(null)
  const [pc, setPc] = useState<{ front: string; back: string } | null>(null)
  const [pcSide, setPcSide] = useState<'front' | 'back'>('front')
  const [look, setLook] = useState<FortuneLookId>('wealth')
  // 방법 페이지에서 "내 셀카에 입혀 보기"(?look=)로 온 사람 — 결과가 나와도 고른 룩을 유지한다
  const [preLook, setPreLook] = useState<FortuneLookId | null>(null)
  // $4.99 9장 결제 복귀(?nine=1)
  const [nineResume, setNineResume] = useState(false)
  const [gen, setGen] = useState<{ k: 'idle' } | { k: 'busy' } | { k: 'done'; image: string; tier: 'free' | 'credit'; balance?: number; freeLeft?: number } | { k: 'error'; e: GenError }>({ k: 'idle' })
  const [free, setFree] = useState<FreeStatus | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  // 도감·시크릿은 이 기기 저장소에서(입력 화면엔 안 그려지므로 서버 렌더와 어긋나지 않는다)
  const [dex, setDex] = useState<AnimalId[]>(() => (typeof window === 'undefined' ? [] : loadDex().map((e) => e.id)))
  const [secret, setSecret] = useState(() => typeof window !== 'undefined' && hasSecret())
  const [toast, setToast] = useState<string | null>(null)
  // 다시 온 사람 — 저장된 결과로 '오늘의 관상 메이크업 운'을 맨 위에 보여 준다
  const [saved, setSaved] = useState<FortuneResult | null>(null)
  // 신년운은 시즌 행사(12~1월)만 — 미리 렌더한 HTML 과 어긋나지 않게 마운트 뒤에 정한다
  const [newYear, setNewYear] = useState(false)
  const jobRef = useRef('')
  const ctaRef = useRef<HTMLDivElement>(null)

  const T = isEn ? EN : KO

  // ── 진입: 공유 링크 / 로그인 복귀 ──
  // 미리 렌더한(prerender) 페이지라 주소(?c= · ?resume=)는 브라우저에서만 읽을 수 있다 → 마운트 때 한 번 상태를 정한다.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mo = new Date().getMonth()
    if (NEW_YEAR_OPEN && (mo === 11 || mo === 0)) setNewYear(true)
    const q = new URLSearchParams(window.location.search)
    const pl = q.get('look')
    if (pl && FORTUNE_LOOKS.some((l) => l.id === pl)) setPreLook(pl as FortuneLookId)
    const sc = decodeShare(q.get('c'))
    if (sc) { setShared(sc); setPhase('shared'); trackEvent('fortune_shared_view', { animal: sc.animal ?? 'none' }); return }
    const last0 = loadLast()
    if (last0 && q.get('resume') !== '1') { setSaved(last0); trackEvent('fortune_daily_view', { from: 'intro' }) }
    if (q.get('nine') === '1') {
      // 9장 결제 복귀 — 결과는 저장본으로, 셀카·진행분은 NineBox 가 IndexedDB 에서 읽는다
      trackCheckoutReturn()
      const last = loadLast()
      if (last) { setResult(last); setPhase('result'); setNineResume(true); setTimeout(() => document.getElementById('lucky-nine')?.scrollIntoView({ behavior: 'smooth' }), 500) }
      return
    }
    if (q.get('resume') === '1') {
      const last = loadLast()
      const ph = takePendingSelfie()
      const lk = takePendingLook()
      if (last) {
        setResult(last); setPhase('result')
        if (ph) { setPhoto(ph); keepPendingSelfie(ph) }
        if (lk) setLook(lk)
        setTimeout(() => ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
      }
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // 로그인·무료권 상태(결과 화면에서)
  useEffect(() => {
    if (phase !== 'result') return
    let off = false
    supabase.auth.getSession().then(({ data }) => {
      if (off) return
      setLoggedIn(!!data.session)
      if (data.session) getFreeStatus().then((s) => { if (!off) setFree(s) })
    }).catch(() => setLoggedIn(false))
    return () => { off = true }
  }, [phase, gen.k])

  // 결과 카드(A2)·포카 그리기
  const cardData: CardData | null = useMemo(() => {
    if (!result) return null
    const applied = gen.k === 'done'
    return {
      isEn, photo: applied ? gen.image : photo ?? undefined, applied,
      animal: result.animals?.[0]?.id, animalPct: result.animals?.[0]?.pct, second: result.animals?.[1],
      top: result.scores.slice(0, 3).map((s) => ({ id: s.id, score: s.score })),
      counts: result.counts, lacking: result.lacking, dayStem: result.dayStem, serial: result.serial,
      look: applied ? look : result.scores[0]?.id,
    }
  }, [result, photo, gen, look, isEn])

  useEffect(() => {
    if (!cardData) return
    let off = false
    ;(async () => {
      const a2 = await renderResultCard(cardData)
      if (off) return
      setCard(await canvasToDataUrl(a2))
      const [f, b] = await Promise.all([renderPhotocardFront(cardData), renderPhotocardBack({ ...cardData, dex, secret })])
      if (!off) setPc({ front: await canvasToDataUrl(f), back: await canvasToDataUrl(b) })
    })().catch(() => { /* 카드 실패해도 결과 화면은 그대로 */ })
    return () => { off = true }
  }, [cardData, dex, secret])

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2600) }

  // ── 입력 ──
  const choosePhoto = async (mode: 'camera' | 'gallery') => {
    const p = pickImage(mode)
    const file = await p
    if (!file) return
    const url = URL.createObjectURL(file)
    // 화면 표시·생성·로그인 왕복용으로 축소본을 만들어 둔다(원본 비율 유지)
    const ok = await savePendingSelfieFromSrc(url)
    const small = ok ? takePendingSelfie() : null
    URL.revokeObjectURL(url)
    if (!small) { setErr(T.err['bad-file']); return }
    keepPendingSelfie(small)
    setPhoto(small); setErr(null)
    trackEvent('fortune_photo', { mode })
  }

  const birthInput = (): BirthInput | null => {
    if (!birth.y || !birth.m || !birth.d) return null
    const b: BirthInput = { year: +birth.y, month: +birth.m, day: +birth.d, hour: birth.h === '' ? undefined : +birth.h }
    return isValidBirth(b) ? b : null
  }

  const run = async () => {
    const b = birthInput()
    if (!photo && !b) { setErr(T.needOne); return }
    if ((birth.y || birth.m || birth.d) && !b) { setErr(T.badBirth); return }
    setErr(null); setPhase('busy')
    let scan: FaceScan | null = null
    if (photo) {
      const img = new Image(); img.src = photo
      try { await img.decode() } catch { /* noop */ }
      const r: FaceScan | FaceScanError = await scanFortuneFace(img)
      if (typeof r === 'string') {
        if (!b) { setErr(T.err[r]); setPhase('intro'); trackEvent('fortune_scan_error', { reason: r }); return }
        flash(T.err[r] + ' ' + T.birthOnly)
      } else scan = r
    }
    const res = analyze(scan, b)
    setResult(res); saveLast(res); setLook(preLook ?? res.scores[0].id)
    if (res.animals?.[0]) {
      const d = addToDex(res.animals[0].id, 'me')
      setDex(d.dex.map((e) => e.id)); if (d.secretUnlocked) { setSecret(true); flash(T.secretGot) }
    }
    setGen({ k: 'idle' }); jobRef.current = ''
    setPhase('result')
    window.scrollTo({ top: 0 })
    trackToolComplete('fortune-makeup', res.animals?.[0]?.id ?? res.scores[0].id)
    trackEvent('fortune_result', { animal: res.animals?.[0]?.id ?? 'none', top: res.scores[0].id, photo: !!scan, birth: !!b })
  }

  // ── 메이크업 생성 ──
  const generate = async (pay?: PayChoice) => {
    if (!photo) { await choosePhoto('gallery'); return }
    if (!loggedIn) {
      keepPendingLook(look); if (result) saveLast(result)
      trackEvent('fortune_login_gate', { look })
      window.location.href = '/auth?next=' + encodeURIComponent(base + '?resume=1')
      return
    }
    if (!jobRef.current) jobRef.current = newJobId()
    setGen({ k: 'busy' })
    trackEvent('fortune_generate', { look, pay: pay ?? 'auto' })
    const r = await generateFortuneMakeup({ photo, lookId: look, lacking: result?.lacking, jobId: jobRef.current, pay })
    if (r.ok) {
      jobRef.current = ''
      setGen({ k: 'done', image: r.image, tier: r.tier, balance: r.balance, freeLeft: r.freeLeft })
      trackEvent('fortune_generated', { look, tier: r.tier })
      setTimeout(() => document.getElementById('fortune-done')?.scrollIntoView({ behavior: 'smooth' }), 200)
    } else {
      if (r.error !== 'retry') jobRef.current = ''
      setGen({ k: 'error', e: r.error })
      if (r.error === 'login') setLoggedIn(false)
    }
  }

  const shareLink = async () => {
    if (!result) return
    const url = withRef(`${window.location.origin}${base}?c=${encodeShare(result)}`)  // 로그인 회원이면 초대 코드도
    const text = isEn ? 'My lucky makeup card — what animal face are you?' : '내 럭키 메이크업 카드 — 너는 무슨 상이야?'
    try {
      if (navigator.share) { await navigator.share({ title: 'kissinskin', text, url }); trackEvent('fortune_share', { via: 'native' }); return }
    } catch { return }
    try { await navigator.clipboard.writeText(url); flash(T.copied); trackEvent('fortune_share', { via: 'copy' }) } catch { /* noop */ }
  }

  const reset = () => { setPhase('intro'); setResult(null); setGen({ k: 'idle' }); setCard(null); setPc(null); clearPendingSelfie(); setPhoto(null); window.scrollTo({ top: 0 }) }

  // ════════════════════════════════════════════════════════════════════
  // 2026-10-24 개편 — 메이크업이 주인공, 사주는 양념(운영자 확정, 글로벌 서치 근거):
  //   · Fresh×Susan Miller·Bite Beauty: 운세는 '포장'(운 이름 + 한 줄 근거), 파는 건 메이크업 → 9종 그리드·생성이 맨 앞
  //   · Co-Star·포스텔러 = 운세 앱 시장 → 정밀 풀이·궁합·매일 운세·사주 명식은 화면에서 뺀다(SHOW_FORTUNE_EXTRAS, 코드는 유지)
  //   · 생년월일은 선택 — "지금 필요한 운" 한 줄 추천에만 쓴다 · 동물상 카드·포카는 무료 공유용으로 남긴다
  //   · 가격은 장수로만(첫 장 무료 → 5장 $2.99 → 9장 $4.99), 색은 키스인스킨 브랜드(네이비+핑크)
  const top3 = result ? result.scores.slice(0, 3).map((s) => fortuneLookById(s.id)) : []
  const cur = fortuneLookById(look)
  const eyebrow = 'text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark'
  return (
    <div className="font-display bg-background-light min-h-screen text-navy">
      <ToolsNav />
      <main className={`${phase === 'intro' ? 'max-w-6xl' : 'max-w-xl'} mx-auto px-4 sm:px-6 pb-20`}>
        {toast && <div role="status" className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-lg">{toast}</div>}

        {phase === 'intro' && (
          <section className="pt-10 md:pt-14">
            {newYear && (
              <a href={isEn ? '/en/tools/2027-fortune/' : '/tools/2027-fortune/'} onClick={() => trackEvent('lucky_newyear_banner', {})}
                className="mb-8 flex items-center gap-3 border border-primary/40 bg-white px-4 py-3 hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-primary">celebration</span>
                <span className="flex-1 text-sm font-bold">{T.newYear}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            )}

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
                  <a href="#start" onClick={() => trackEvent('lucky_hero_cta', { to: 'start' })} className="flex items-center justify-center gap-1 bg-navy py-3.5 text-sm font-bold text-white hover:bg-navy-mid transition-colors">{T.ctaStart}<span className="material-symbols-outlined text-base">arrow_forward</span></a>
                  <a href="#price" onClick={() => trackEvent('lucky_hero_cta', { to: 'price' })} className="flex items-center justify-center border border-slate-300 bg-white py-3.5 text-sm font-bold hover:border-navy transition-colors">{T.ctaPrice}</a>
                </div>
                <p className="mt-2 text-center text-[11px] text-slate-500">{T.noSub}</p>
              </div>
            </div>

            {/* 다시 온 사람 — 오늘의 운빨 메이크업(매일 바뀜)이 재방문 장치 */}
            {saved && (
              <div className="mt-8 max-w-xl">
                <DailyCard r={saved} isEn={isEn}
                  onOpen={() => { setResult(saved); setLook(saved.scores[0].id); setPhase('result'); window.scrollTo({ top: 0 }) }}
                  onTry={(id) => { setResult(saved); setLook(id); setPhase('result'); setTimeout(() => ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300) }} />
              </div>
            )}

            {/* 9종 — 3×3 크게, 한 화면에(Lensa·Epik: "나오는 결과"를 먼저). 누르면 방법 페이지.
                10/24: 운마다 헤어가 달라(JJ 헤어 믹스) 얼굴만 확대하지 않고 머리까지 보이게 */}
            <div id="looks" className="mt-12 scroll-mt-20">
              <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <h2 className="text-xl md:text-3xl font-extrabold">{T.gridTitle}</h2>
                <p className="text-xs font-semibold text-slate-500">{T.gridHint}</p>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 md:gap-4">
                {FORTUNE_LOOKS.map((l) => (
                  <a key={l.id} href={`${base}${l.id}/`} onClick={() => trackEvent('lucky_grid_open', { look: l.id })}
                    className="group block bg-white border border-slate-200 hover:border-navy transition-colors">
                    <span className="relative block aspect-[4/5] md:aspect-square overflow-hidden bg-cream">
                      <img src={lookImg(l.id)} alt={isEn ? `${l.nameEn} makeup` : l.nameKo} loading="lazy"
                        className="h-full w-full origin-[50%_30%] scale-[1.12] object-cover object-[50%_22%] transition-transform duration-500 group-hover:scale-[1.18]" />
                      <span className="absolute left-1.5 top-1.5 md:left-3 md:top-3 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full ring-2 ring-white" style={{ background: l.accent }} aria-hidden="true" />
                    </span>
                    <span className="block p-2 md:p-4">
                      <span className="block text-[13px] md:text-lg font-extrabold leading-tight">{isEn ? l.nameEn : l.fortuneKo}</span>
                      <span className="mt-1 hidden md:block text-sm text-slate-600 leading-snug">{isEn ? l.hookEn : l.hookKo}</span>
                    </span>
                  </a>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-slate-400">{T.gridNote}</p>
            </div>

            <PriceTable isEn={isEn} />

            {/* 이렇게 돼요 — 실제 순서라 번호를 쓴다 */}
            <ol className="mt-14 grid gap-px border border-slate-200 bg-slate-200 md:grid-cols-3">
              {T.how.map(([t, d], i) => (
                <li key={t} className="flex gap-3 bg-white p-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-extrabold text-white">{i + 1}</span>
                  <span className="min-w-0"><b className="block text-[15px]">{t}</b><span className="mt-0.5 block text-sm text-slate-600 leading-relaxed">{d}</span></span>
                </li>
              ))}
            </ol>

            {/* 입력 — 셀카가 주인공, 생년월일은 선택 */}
            <div id="start" className="mx-auto mt-14 max-w-xl scroll-mt-20 border border-slate-200 bg-white p-5 md:p-7">
              <p className={eyebrow}>{T.startKicker}</p>
              <h2 className="mt-1.5 text-2xl font-extrabold">{T.startTitle}</h2>
              {preLook && <p className="mt-3 bg-blush px-3 py-2 text-sm font-semibold">{T.preLook(isEn ? fortuneLookById(preLook).nameEn : fortuneLookById(preLook).nameKo)}</p>}

              <p className="mt-6 text-sm font-extrabold">{T.photoTitle} <span className="font-medium text-slate-500">{T.photoSub}</span></p>
              {photo ? (
                <div className="mt-3 flex items-center gap-3">
                  <img src={photo} alt="" className="h-20 w-20 object-cover border border-slate-200" />
                  <button type="button" onClick={() => { setPhoto(null); clearPendingSelfie() }} className="text-sm font-bold underline underline-offset-4">{T.change}</button>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => choosePhoto('camera')} className="flex items-center justify-center gap-1.5 bg-navy py-3 text-sm font-bold text-white hover:bg-navy-mid transition-colors"><span className="material-symbols-outlined text-base">photo_camera</span>{T.camera}</button>
                  <button type="button" onClick={() => choosePhoto('gallery')} className="flex items-center justify-center gap-1.5 border border-slate-300 bg-white py-3 text-sm font-bold hover:border-navy transition-colors"><span className="material-symbols-outlined text-base">image</span>{T.gallery}</button>
                </div>
              )}
              <p className="mt-2 text-xs text-slate-500">{T.photoTip}</p>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="text-sm font-extrabold">{T.birthTitle} <span className="ml-1 bg-cream px-1.5 py-0.5 text-[11px] font-bold text-slate-600">{T.optional}</span></p>
                <p className="mt-1 text-xs text-slate-500">{T.birthSub}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Select label={T.year} value={birth.y} onChange={(v) => setBirth({ ...birth, y: v })} options={Array.from({ length: 76 }, (_, i) => String(2015 - i))} />
                  <Select label={T.month} value={birth.m} onChange={(v) => setBirth({ ...birth, m: v })} options={Array.from({ length: 12 }, (_, i) => String(i + 1))} />
                  <Select label={T.day} value={birth.d} onChange={(v) => setBirth({ ...birth, d: v })} options={Array.from({ length: 31 }, (_, i) => String(i + 1))} />
                </div>
              </div>

              {err && <p className="mt-4 bg-primary/10 px-3 py-2 text-sm font-bold text-primary-dark">{err}</p>}
              <button type="button" onClick={run} className="mt-6 flex w-full items-center justify-center gap-1.5 bg-primary-dark py-4 text-base font-bold text-white hover:bg-primary transition-colors">{T.go}<span className="material-symbols-outlined text-lg">arrow_forward</span></button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">{T.privacy}<br />{T.fun}</p>
            </div>

            <div className="mx-auto max-w-xl"><IntroSeo isEn={isEn} /></div>
          </section>
        )}

        {phase === 'busy' && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary" aria-hidden="true" />
            <p className="text-lg font-extrabold">{T.reading}</p>
            <p className="text-sm text-slate-500">{T.readingSub}</p>
          </div>
        )}

        {phase === 'shared' && shared && <SharedView s={shared} isEn={isEn} base={base} dex={dex} onAdd={(id) => {
          const d = addToDex(id, 'friend'); setDex(d.dex.map((e) => e.id))
          if (d.secretUnlocked) { setSecret(true); flash(T.secretGot) } else flash(d.added ? T.added : T.already)
          trackEvent('fortune_dex_add', { animal: id, added: d.added })
        }} />}

        {phase === 'result' && result && (
          <section className="pt-8">
            {/* 1) 추천 한 줄 — 사주·관상은 "어떤 메이크업부터"를 고르는 데만 */}
            <p className={eyebrow}>{T.recKicker}</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight break-keep">{T.recTitle(isEn ? top3[0]?.nameEn ?? '' : top3[0]?.fortuneKo ?? '')}</h1>
            <p className="mt-2 text-sm text-slate-600">{T.recWhy(!!result.birth, !!result.animals?.[0])}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {top3.map((l, i) => (
                <button key={l.id} type="button" onClick={() => { setLook(l.id); setGen({ k: 'idle' }); jobRef.current = ''; trackEvent('lucky_pick', { look: l.id, from: 'rec' }) }}
                  className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold transition-colors ${l.id === look ? 'border-navy bg-navy text-white' : 'border-slate-300 bg-white hover:border-navy'}`}>
                  <span className="tabular-nums opacity-60">{i + 1}</span>{isEn ? l.nameEn : l.fortuneKo}
                </button>
              ))}
            </div>

            {/* 2) 메이크업 1장 — 주인공 */}
            <div ref={ctaRef} className="mt-6 bg-navy p-5 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-on-dark">{T.rxKicker}</p>
              <div className="mt-3 flex gap-4">
                <img src={gen.k === 'done' ? gen.image : lookImg(look)} alt="" className="h-36 w-24 shrink-0 object-cover object-[50%_22%]" />
                <div className="min-w-0">
                  <p className="text-xl font-extrabold leading-tight">{isEn ? `${cur.nameEn} makeup` : cur.nameKo}</p>
                  <p className="mt-1 text-[13px] leading-snug text-white/80">{isEn ? cur.hookEn : cur.hookKo}</p>
                  <p className="mt-1.5 text-xs text-white/60">{isEn ? cur.descEn : cur.descKo}</p>
                  {result.lacking && <p className="mt-1 text-xs font-semibold text-primary-on-dark">+ {isEn ? ELEMENT_ACCENT[result.lacking].en : ELEMENT_ACCENT[result.lacking].ko}</p>}
                  <a href={`${base}${look}/`} className="mt-2 inline-flex items-center gap-0.5 text-xs font-bold text-white underline underline-offset-4">{T.howLink}</a>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {FORTUNE_LOOKS.map((l) => (
                  <button key={l.id} type="button" disabled={gen.k === 'busy'} onClick={() => { setLook(l.id); setGen({ k: 'idle' }); jobRef.current = ''; trackEvent('lucky_pick', { look: l.id }) }}
                    className={`px-2.5 py-1 text-[11.5px] font-bold transition-colors ${l.id === look ? 'bg-white text-navy' : 'border border-white/25 text-white/80 hover:border-white/60'}`}>
                    {isEn ? l.nameEn : l.fortuneKo}
                  </button>
                ))}
              </div>
              <GenerateBox T={T} hasPhoto={!!photo} loggedIn={loggedIn} free={free} gen={gen}
                onGenerate={generate} onPhoto={() => choosePhoto('gallery')} look={look} />
              <p className="mt-3 text-[11px] text-white/50">{T.aiNote}</p>
            </div>

            {/* 3) 9장 전부 — $4.99 */}
            <NineBox isEn={isEn} base={base} photo={photo} lacking={result.lacking} order={result.scores.map((x) => x.id)}
              loggedIn={loggedIn} free={free} resume={nineResume} onPhoto={() => choosePhoto('gallery')}
              onLogin={() => { saveLast(result); window.location.assign('/auth?next=' + encodeURIComponent(base + '?resume=1')) }}
              onFree={() => getFreeStatus().then(setFree)} />

            {gen.k === 'done' && (
              <div id="fortune-done" className="mt-6 border border-slate-200 bg-white p-5">
                <p className="text-sm font-extrabold">{T.doneTitle}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <figure><img src={photo ?? ''} alt="" className="aspect-[3/4] w-full object-cover" /><figcaption className="mt-1 text-center text-[11px] font-bold text-slate-500">{T.before}</figcaption></figure>
                  <figure><img src={gen.image} alt="" className="aspect-[3/4] w-full object-cover" /><figcaption className="mt-1 text-center text-[11px] font-bold text-slate-500">{T.after}</figcaption></figure>
                </div>
                <p className="mt-3 text-center text-xs font-semibold text-slate-600">
                  {gen.tier === 'free' ? T.usedFree : T.usedCredit}
                  {typeof gen.balance === 'number' && ` · ${isEn ? `${gen.balance} looks left` : `${gen.balance}장 남음`}`}
                  {typeof gen.freeLeft === 'number' && ` · ${isEn ? `${gen.freeLeft} free pass left` : `무료권 ${gen.freeLeft}장 남음`}`}
                </p>
                <a href={`${base}${look}/`} className="mt-3 flex items-center justify-center gap-1 border border-slate-300 py-3 text-sm font-bold hover:border-navy transition-colors">{T.howAndShop}<span className="material-symbols-outlined text-base">arrow_forward</span></a>
              </div>
            )}

            {/* 오늘의 운빨 메이크업 — 매일 바뀌는 무료 한 장(재방문 장치) */}
            <div className="mt-10"><DailyCard r={result} isEn={isEn} onTry={(id) => { setLook(id); setGen({ k: 'idle' }); jobRef.current = ''; ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }} /></div>

            {/* 4) 공유용 무료 카드 — 동물상 카드 · 포카(바이럴 입구) */}
            <div className="mt-12 border-t border-slate-200 pt-10">
              <p className={eyebrow}>{T.shareKicker}</p>
              <h2 className="mt-1.5 text-2xl font-extrabold">{result.animals?.[0] ? T.animalTitle(isEn ? ANIMALS[result.animals[0].id].en : ANIMALS[result.animals[0].id].ko, result.animals[0].pct) : T.cardTitle}</h2>
              {result.animals?.[0] && <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{isEn ? ANIMALS[result.animals[0].id].descEn : ANIMALS[result.animals[0].id].descKo}</p>}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <figure className="min-w-0">
                  {card ? <img src={card} alt={T.cardAlt} className="w-full shadow-[0_12px_30px_rgba(7,9,83,.15)]" /> : <div className="aspect-[9/16] w-full animate-pulse bg-cream" />}
                  <button type="button" disabled={!card} onClick={() => { if (card) { saveOrShare(card, 'kissinskin-lucky-card.jpg', isEn); trackEvent('fortune_card_save', { kind: gen.k === 'done' ? 'applied' : 'result' }) } }} className="mt-2 w-full border border-slate-300 bg-white py-2.5 text-xs font-bold hover:border-navy transition-colors">{T.saveCard}</button>
                </figure>
                <figure className="min-w-0">
                  {pc ? (
                    <button type="button" onClick={() => setPcSide(pcSide === 'front' ? 'back' : 'front')} className="block w-full" aria-label={T.flip}>
                      <img src={pcSide === 'front' ? pc.front : pc.back} alt={T.pcTitle} className="w-full rounded-[14px] shadow-[0_12px_30px_rgba(7,9,83,.15)]" />
                    </button>
                  ) : <div className="aspect-[55/85] w-full animate-pulse rounded-[14px] bg-cream" />}
                  <button type="button" disabled={!pc} onClick={() => { if (pc) { saveOrShare(pcSide === 'front' ? pc.front : pc.back, `kissinskin-face-card-${pcSide}.jpg`, isEn); trackEvent('fortune_pc_save', { side: pcSide }) } }} className="mt-2 w-full border border-slate-300 bg-white py-2.5 text-xs font-bold hover:border-navy transition-colors">{T.savePc}</button>
                  <figcaption className="mt-1 text-center text-[11px] text-slate-400">{T.flip}</figcaption>
                </figure>
              </div>
              <button type="button" onClick={shareLink} className="mt-4 flex w-full items-center justify-center gap-1.5 bg-navy py-3.5 text-sm font-bold text-white hover:bg-navy-mid transition-colors"><span className="material-symbols-outlined text-base">share</span>{T.shareLink}</button>
              <p className="mt-2 text-center text-[11px] text-slate-400">{T.fun}</p>
            </div>

            {/* 운세 앱 영역 — 2026-10-24 화면에서 뺌(코드는 유지, 4주 데이터 보고 다시 판단) */}
            {SHOW_FORTUNE_EXTRAS && (
              <>
                {result.birth && <SajuBox birth={result.birth} counts={result.counts} lacking={result.lacking} isEn={isEn} T={T} />}
                <PreciseBox r={result} isEn={isEn} loggedIn={loggedIn} free={free}
                  onLogin={() => { saveLast(result); window.location.href = '/auth?next=' + encodeURIComponent(base + '?resume=1') }}
                  onPaid={() => getFreeStatus().then(setFree)} />
                <CompatBox me={result} myPhoto={photo} isEn={isEn} loggedIn={loggedIn} free={free}
                  onLogin={() => { saveLast(result); window.location.href = '/auth?next=' + encodeURIComponent(base + '?resume=1') }}
                  onDone={() => { getFreeStatus().then(setFree); if (bumpCompatCount() >= 3 && unlockSecret('compat')) { setSecret(true); flash(T.secretGot) } }} />
              </>
            )}

            {/* 5) 도감 — 친구 카드 모으기(공유 루프) */}
            <DexBox isEn={isEn} dex={dex} secret={secret} onShare={shareLink} />

            <button type="button" onClick={reset} className="mt-8 w-full border border-slate-300 bg-white py-3 text-sm font-bold hover:border-navy transition-colors">{T.again}</button>
          </section>
        )}
      </main>
      <ToolsFooter />
    </div>
  )
}

// 사주 명식 — 2026-10-24 화면에서 뺀 블록(SHOW_FORTUNE_EXTRAS). 다시 켤 때를 위해 그대로 둔다.
function SajuBox({ birth, counts, lacking, isEn, T }: { birth: BirthInput; counts?: Record<Element, number>; lacking?: Element; isEn: boolean; T: typeof KO }) {
  const s = computeSaju(birth)
  const cols = [[T.pHour, s.hour], [T.pDay, s.day], [T.pMonth, s.month], [T.pYear, s.year]] as const
  return (
    <div className="mt-8 border border-slate-200 bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">{T.sajuKicker}</p>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {cols.map(([label, p]) => (
          <div key={label} className="border border-slate-200 py-2">
            <p className="text-[10px] font-bold text-slate-500">{label}</p>
            <p className="mt-0.5 text-2xl" style={{ fontFamily: "'Song Myung', serif" }}>{p ? pillarHanja(p) : '—'}</p>
          </div>
        ))}
      </div>
      {counts && (
        <div className="mt-4 space-y-1.5">
          {ELEMENTS.map((e) => (
            <div key={e} className="flex items-center gap-2 text-xs font-bold">
              <span className="w-16 shrink-0">{isEn ? ELEM_EN[e] : ELEM_KO[e]}</span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${(counts[e] / 8) * 100}%`, background: OBANG[e] }} /></span>
              <span className="w-14 text-right">{counts[e]}{e === lacking ? (isEn ? ' · low' : ' · 부족') : ''}</span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-[13px] leading-relaxed">{T.sajuNote(isEn ? ELEM_EN[s.dayMaster] : ELEM_KO[s.dayMaster], isEn ? ELEM_EN[s.lacking] : ELEM_KO[s.lacking])}</p>
      <p className="mt-1 text-[11px] text-slate-400">{T.sajuLimit}</p>
    </div>
  )
}

// ── 가격표 — 2026-10-24: 크레딧 말 없이 장수로만(운영자가 "$2.99 = 1장?"으로 읽음) ──
// 벤치마크: Lensa(50/100/200장 — 장수와 가격을 한 줄로), Nebula 구독 함정 소송 → "구독·자동 결제 없음"을 같이.
function PriceTable({ isEn }: { isEn: boolean }) {
  const per = (usd: number, n: number) => (usd / n).toFixed(2)
  const rows = isEn
    ? [
        { n: '1 look', price: 'Free', sub: 'Your first look — sign-up pass', items: ['The one luck you need', 'On your own selfie', 'Before / after'], best: false },
        { n: `${LUCKY_PRICE.starter.credits} looks`, price: `$${LUCKY_PRICE.starter.usd}`, sub: `$${per(LUCKY_PRICE.starter.usd, LUCKY_PRICE.starter.credits)} per look`, items: ['Pick any lucks you like', 'Also works for other AI makeup', 'Use them any time'], best: false },
        { n: 'All 9 lucks', price: `$${LUCKY_PRICE.nine.usd}`, sub: `9 looks · $${per(LUCKY_PRICE.nine.usd, 9)} per look`, items: ['One selfie → all 9 at once', '3×3 board to save & post', 'Every how-to + product links'], best: true },
      ]
    : [
        { n: '1장', price: '무료', sub: '첫 장 — 가입 무료권', items: ['지금 필요한 운 하나', '내 셀카에 바로', '비포 · 애프터'], best: false },
        { n: `${LUCKY_PRICE.starter.credits}장`, price: `$${LUCKY_PRICE.starter.usd}`, sub: `장당 $${per(LUCKY_PRICE.starter.usd, LUCKY_PRICE.starter.credits)}`, items: ['원하는 운을 골라서', '다른 AI 메이크업에도 사용', '쓰고 싶을 때 언제든'], best: false },
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
          ? 'Your animal-face card and photocard are free. One-time payments only — no subscription, no auto-renewal. Need more? 15 looks for $6.99 on the top-up screen.'
          : '동물상 카드·포카는 무료예요. 한 번 결제로 끝 — 구독·자동 결제 없어요. 더 필요하면 충전 화면에 15장 $6.99도 있어요.'}
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

  // 다 모이면 3×3 모아보기 한 장으로
  useEffect(() => {
    if (!done || !selfie) return
    let off = false
    renderNineBoard(order.map((id) => images[id] ?? lookImg(id)), order, isEn).then((u) => { if (!off) setBoard(u) }).catch(() => { /* 그리드는 화면에 그대로 */ })
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, selfie, isEn, st])

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
          return (
            <figure key={id} className="relative overflow-hidden bg-cream">
              <img src={images[id] ?? lookImg(id)} alt="" className={`aspect-[3/4] w-full object-cover object-[50%_28%] ${images[id] ? '' : 'opacity-50'}`} />
              {busy === id && <span className="absolute inset-0 flex items-center justify-center bg-navy/50"><span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" /></span>}
              {images[id] && <span className="material-symbols-outlined absolute right-1 top-1 rounded-full bg-primary text-[14px] text-white">check</span>}
              <figcaption className="absolute inset-x-0 bottom-0 bg-navy/70 px-1 py-0.5 text-center text-[10.5px] font-bold text-white">{isEn ? l.nameEn : l.fortuneKo}</figcaption>
            </figure>
          )
        })}
      </div>
      <div className="mt-4 space-y-2">
        {msg && <p className="bg-primary/10 px-3 py-2 text-[13px] font-bold text-primary-dark">{msg}</p>}
        {busy ? <p className="py-3 text-center text-sm font-bold">{isEn ? `Making ${order.length - left.length + 1} / 9… (about 30s each — keep this page open)` : `${order.length - left.length + 1} / 9장 만드는 중… (장당 30초 안팎 · 이 화면을 열어 두세요)`}</p>
          : done ? (
            board ? <button type="button" onClick={() => { saveOrShare(board, 'kissinskin-lucky-9.jpg', isEn); trackEvent('lucky9_board_save', {}) }} className={`${btn} bg-navy text-white hover:bg-navy-mid`}>{isEn ? 'Save my 3×3 board' : '3×3 모아보기 저장'}</button> : null
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

// ── 작은 부품들 ──
function CompatBox({ me, myPhoto, isEn, loggedIn, free, onLogin, onDone }: {
  me: FortuneResult; myPhoto: string | null; isEn: boolean; loggedIn: boolean | null; free: FreeStatus | null; onLogin: () => void; onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [pPhoto, setPPhoto] = useState<string | null>(null)
  const [pb, setPb] = useState({ y: '', m: '', d: '' })
  const [partner, setPartner] = useState<FortuneResult | null>(null)
  const [c, setC] = useState<Compat | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [out, setOut] = useState<{ me?: string; them?: string }>({})
  const jobs = useRef<{ me: string; them: string }>({ me: '', them: '' })
  const pick = async (mode: 'camera' | 'gallery') => {
    const file = await pickImage(mode); if (!file) return
    const url = URL.createObjectURL(file)
    // 상대 사진은 이 컴포넌트 안에서만(세션 저장 X) — 내 셀카 보관 슬롯을 덮지 않게 직접 축소
    const img = new Image(); img.src = url
    try { await img.decode() } catch { URL.revokeObjectURL(url); setMsg(isEn ? 'That file couldn’t be opened.' : '사진을 열 수 없어요.'); return }
    const sc = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight))
    const cv = document.createElement('canvas'); cv.width = Math.round(img.naturalWidth * sc); cv.height = Math.round(img.naturalHeight * sc)
    cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url)
    setPPhoto(cv.toDataURL('image/jpeg', 0.85)); setMsg(null)
  }
  const read = async () => {
    const b: BirthInput | null = pb.y && pb.m && pb.d ? { year: +pb.y, month: +pb.m, day: +pb.d } : null
    if (b && !isValidBirth(b)) { setMsg(isEn ? 'Please check the birth date.' : '생년월일을 확인해 주세요.'); return }
    if (!pPhoto && !b) { setMsg(isEn ? 'Add their selfie or birth date.' : '상대의 셀카나 생년월일을 넣어 주세요.'); return }
    setBusy(true); setMsg(null)
    let scan: FaceScan | null = null
    if (pPhoto) { const img = new Image(); img.src = pPhoto; try { await img.decode() } catch { /* noop */ } const r = await scanFortuneFace(img); if (typeof r !== 'string') scan = r }
    const pr = analyze(scan, b); setPartner(pr); setC(compatOf(me, pr)); setBusy(false)
    trackEvent('fortune_compat', { type: compatOf(me, pr).type })
  }
  const makeCouple = async () => {
    if (!loggedIn) { onLogin(); return }
    if (!myPhoto || !pPhoto || !c) return
    setBusy(true); setMsg(null)
    const res = { ...out }
    for (const who of ['me', 'them'] as const) {
      if (res[who]) continue
      if (!jobs.current[who]) jobs.current[who] = newJobId()
      const r = await generateFortuneMakeup({ photo: who === 'me' ? myPhoto : pPhoto, lookId: c.look, lacking: who === 'me' ? me.lacking : partner?.lacking, jobId: jobs.current[who], pay: 'credit' })
      if (r.ok) { res[who] = r.image; jobs.current[who] = '' }
      else { setOut(res); setBusy(false); setMsg(r.error === 'topup' ? (isEn ? 'Not enough credits (2 needed).' : '크레딧이 부족해요(2개 필요).') : r.error === 'login' ? (isEn ? 'Please log in.' : '로그인이 필요해요.') : (isEn ? 'One image failed — tap again, no extra charge.' : '한 장이 실패했어요 — 다시 누르면 추가 차감 없이 이어서 만들어요.')); return }
    }
    setOut(res); setBusy(false); onDone(); trackEvent('fortune_compat_makeup', { look: c.look })
  }
  const credits = free?.balance ?? 0
  const sel = 'w-full rounded-xl border-2 border-[#1b1b1f] bg-white px-2 py-2 text-sm font-bold'
  if (!open) return (
    <button type="button" onClick={() => { setOpen(true); trackEvent('fortune_compat_open', {}) }} className="mt-8 w-full rounded-3xl border-[3px] border-[#1b1b1f] bg-[#ffe3ea] p-5 text-left shadow-[6px_6px_0_#1b1b1f]">
      <p className="text-[11px] font-black tracking-[0.2em] text-[#d6402f]">{isEn ? 'COMPATIBILITY' : '궁합'}</p>
      <p className="mt-1 text-xl font-black">💞 {isEn ? 'Check our face & saju match' : '친구·연인과 관상·사주 궁합 보기'}</p>
      <p className="mt-1 text-[13px]">{isEn ? 'Free score · couple lucky makeup (2 photos) for 2 credits' : '궁합 점수 무료 · 커플 럭키 메이크업 2장은 크레딧 2개'}</p>
    </button>
  )
  return (
    <div className="mt-8 rounded-3xl border-[3px] border-[#1b1b1f] bg-[#fff5f7] p-5">
      <p className="text-[11px] font-black tracking-[0.2em] text-[#d6402f]">{isEn ? 'COMPATIBILITY' : '궁합'}</p>
      {!c ? (
        <>
          <p className="mt-1 text-lg font-black">{isEn ? 'Their selfie or birth date' : '상대의 셀카 또는 생년월일'}</p>
          <div className="mt-3 flex items-center gap-2">
            {pPhoto ? <img src={pPhoto} alt="" className="h-16 w-16 rounded-xl border-2 border-[#1b1b1f] object-cover" /> : null}
            <button type="button" onClick={() => pick('gallery')} className="rounded-xl border-2 border-[#1b1b1f] bg-white px-4 py-2 text-sm font-black">🖼️ {pPhoto ? (isEn ? 'Change' : '바꾸기') : (isEn ? 'Their photo' : '상대 사진')}</button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <select value={pb.y} onChange={(e) => setPb({ ...pb, y: e.target.value })} className={sel}><option value="">{isEn ? 'Year' : '년'}</option>{Array.from({ length: 76 }, (_, i) => String(2015 - i)).map((v) => <option key={v}>{v}</option>)}</select>
            <select value={pb.m} onChange={(e) => setPb({ ...pb, m: e.target.value })} className={sel}><option value="">{isEn ? 'Month' : '월'}</option>{Array.from({ length: 12 }, (_, i) => String(i + 1)).map((v) => <option key={v}>{v}</option>)}</select>
            <select value={pb.d} onChange={(e) => setPb({ ...pb, d: e.target.value })} className={sel}><option value="">{isEn ? 'Day' : '일'}</option>{Array.from({ length: 31 }, (_, i) => String(i + 1)).map((v) => <option key={v}>{v}</option>)}</select>
          </div>
          <p className="mt-2 text-[11px] text-[#1b1b1f]/60">🔒 {isEn ? 'Use only photos you have permission to use. Their photo and birth date stay on this device.' : '상대의 동의를 받은 사진만 써 주세요. 상대의 사진·생년월일도 이 기기 밖으로 나가지 않아요.'}</p>
          {msg && <p className="mt-2 text-sm font-bold text-[#d6402f]">{msg}</p>}
          <button type="button" disabled={busy} onClick={read} className="mt-4 w-full rounded-2xl bg-[#1b1b1f] py-3.5 font-black text-[#f6eedc]">{busy ? '…' : (isEn ? 'See our match →' : '궁합 보기 →')}</button>
        </>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-center gap-3">
            <img src={badgeSrc(me.animals?.[0]?.id ?? 'fox')} alt="" className={`h-20 w-20 ${me.animals?.[0] ? '' : 'opacity-40 grayscale'}`} />
            <span className="text-3xl">💞</span>
            <img src={badgeSrc(partner?.animals?.[0]?.id ?? 'cat')} alt="" className={`h-20 w-20 ${partner?.animals?.[0] ? '' : 'opacity-40 grayscale'}`} />
          </div>
          <p className="mt-2 text-center text-5xl font-black text-[#d6402f]">{c.score}</p>
          <p className="text-center text-lg font-black">{COMPAT_TEXT[c.type].emoji} {isEn ? COMPAT_TEXT[c.type].en : COMPAT_TEXT[c.type].ko}</p>
          <p className="mt-1 text-center text-[13.5px]">{isEn ? COMPAT_TEXT[c.type].descEn : COMPAT_TEXT[c.type].descKo}</p>
          <ul className="mt-3 space-y-1 text-[13px]">{(isEn ? c.reasonsEn : c.reasonsKo).map((t) => <li key={t}>• {t}</li>)}</ul>
          <div className="mt-4 rounded-2xl bg-[#1b1b1f] p-4 text-[#f6eedc]">
            <p className="text-[11px] font-black tracking-[0.2em] text-[#f2b632]">{isEn ? 'COUPLE LUCKY MAKEUP' : '커플 럭키 메이크업'}</p>
            <p className="mt-1 font-black">{fortuneLookById(c.look).emoji} {isEn ? `${fortuneLookById(c.look).nameEn} makeup for both of you` : `둘이 함께 ${fortuneLookById(c.look).nameKo}`}</p>
            {out.me && out.them ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[out.me, out.them].map((src, i) => <button key={i} type="button" onClick={() => saveOrShare(src, `kissinskin-couple-${i + 1}.jpg`, isEn)}><img src={src} alt="" className="aspect-[3/4] w-full rounded-xl object-cover" /></button>)}
                <p className="col-span-2 text-center text-[11px] text-[#f6eedc]/60">{isEn ? 'Tap a photo to save' : '사진을 누르면 저장돼요'}</p>
              </div>
            ) : !myPhoto || !pPhoto ? (
              <p className="mt-2 text-[12.5px] text-[#f6eedc]/75">{isEn ? 'Both selfies are needed — add your selfie at the top and their photo above.' : '두 사람의 셀카가 모두 필요해요 — 위에서 내 셀카와 상대 사진을 넣어 주세요.'}</p>
            ) : loggedIn === false ? (
              <button type="button" onClick={onLogin} className="mt-3 w-full rounded-2xl bg-[#d6402f] py-3 font-black text-white">{isEn ? 'Log in to make it' : '로그인하고 만들기'}</button>
            ) : credits < 2 && free ? (
              <a href="/analysis/?topup=1" className="mt-3 block w-full rounded-2xl bg-[#f2b632] py-3 text-center font-black text-[#1b1b1f]">{isEn ? `Top up — 2 credits needed (you have ${credits})` : `크레딧 충전 — 2개 필요(보유 ${credits}개)`}</a>
            ) : (
              <button type="button" disabled={busy} onClick={makeCouple} className="mt-3 w-full rounded-2xl bg-[#d6402f] py-3 font-black text-white">{busy ? (isEn ? 'Making 2 images… (~1–2 min)' : '2장 만드는 중… (1~2분)') : (isEn ? 'Make both — 2 credits' : '두 사람 다 입혀 보기 — 크레딧 2개')}</button>
            )}
            {msg && <p className="mt-2 text-[12.5px] font-bold text-[#f2b632]">{msg}</p>}
          </div>
          <button type="button" onClick={() => { setC(null); setPartner(null); setOut({}) }} className="mt-3 w-full text-[12.5px] font-bold underline underline-offset-2">{isEn ? 'Try someone else' : '다른 사람과 보기'}</button>
        </>
      )}
    </div>
  )
}

function PreciseBox({ r, isEn, loggedIn, free, onLogin, onPaid }: {
  r: FortuneResult; isEn: boolean; loggedIn: boolean | null; free: FreeStatus | null; onLogin: () => void; onPaid: () => void
}) {
  const lang = isEn ? 'en' : 'ko'
  const [reading, setReading] = useState<PreciseReading | null>(() => (typeof window === 'undefined' ? null : loadReading(r, lang)))
  const [st, setSt] = useState<{ k: 'idle' } | { k: 'busy' } | { k: 'error'; e: ReadingError }>({ k: 'idle' })
  const job = useRef('')
  const ask = async (pay?: PayChoice) => {
    if (!loggedIn) { onLogin(); return }
    if (!job.current) job.current = newJobId()
    setSt({ k: 'busy' }); trackEvent('fortune_reading_request', { pay: pay ?? 'auto' })
    const res = await requestReading(r, lang, job.current, pay)
    if (res.ok) { job.current = ''; setReading(res.reading); setSt({ k: 'idle' }); onPaid(); trackEvent('fortune_reading_done', { tier: res.tier }) }
    else { if (res.error !== 'retry') job.current = ''; setSt({ k: 'error', e: res.error }) }
  }
  const toolLeft = free?.tool.left ?? 0, credits = free?.balance ?? 0
  const E: Record<ReadingError, string> = isEn
    ? { login: 'Please log in.', topup: 'Not enough credits — top up to continue.', free_used: 'Your free tool pass is used. You can use a credit.', choose: 'Choose a free pass or a credit.', unavailable: 'Please try again shortly.', retry: 'Something went wrong. Tap again — no extra charge.' }
    : { login: '로그인이 필요해요.', topup: '크레딧이 부족해요. 충전하면 바로 볼 수 있어요.', free_used: '무료 도구 무료권을 이미 썼어요. 크레딧으로 볼 수 있어요.', choose: '무료권과 크레딧 중 골라 주세요.', unavailable: '잠시 후 다시 시도해 주세요.', retry: '문제가 생겼어요. 다시 누르면 추가 차감 없이 다시 만들어요.' }
  const btn = 'w-full rounded-2xl py-3.5 text-[15px] font-black'
  return (
    <div className="mt-8 rounded-3xl border-[3px] border-[#1b1b1f] bg-white p-5">
      <p className="text-[11px] font-black tracking-[0.2em] text-[#d6402f]">{isEn ? 'FULL READING' : '정밀 풀이'}</p>
      <h2 className="text-2xl font-black">{isEn ? 'My full face & saju reading' : '나의 관상·사주 정밀 풀이'}</h2>
      {reading ? (
        <div className="mt-4 space-y-5 text-[14px] leading-relaxed">
          {reading.summary && <p className="rounded-2xl bg-[#fff7df] p-4 font-medium">{reading.summary}</p>}
          {!!reading.face?.length && (
            <div><p className="font-black">👁 {isEn ? 'Face palaces' : '관상 6궁'}</p>
              <ul className="mt-2 space-y-2">{reading.face.map((f) => <li key={f.palace}><b>{f.palace}</b> <span className="text-[12px] text-[#1b1b1f]/60">{f.area}</span><br />{f.reading}</li>)}</ul></div>
          )}
          {reading.elements && <div><p className="font-black">☯ {isEn ? 'Five elements' : '오행'}</p><p className="mt-1">{reading.elements}</p></div>}
          {!!reading.fortunes?.length && (
            <div><p className="font-black">✨ {isEn ? 'Your fortunes' : '나의 운'}</p>
              <ul className="mt-2 space-y-2">{reading.fortunes.map((f) => { const l = FORTUNE_LOOKS.find((x) => x.id === f.id); return (
                <li key={f.id} className="rounded-xl border-2 border-[#1b1b1f]/15 p-3"><b>{l ? `${l.emoji} ${isEn ? l.fortuneEn : l.fortuneKo}` : f.id}</b><br />{f.reading}<br /><span className="text-[13px] text-[#d6402f]">💄 {f.makeup}</span></li>) })}</ul></div>
          )}
          {!!reading.year2027?.length && (
            <div><p className="font-black">🎍 {isEn ? '2027 month by month' : '2027 정미년 월별 흐름'}</p>
              <ol className="mt-2 grid grid-cols-2 gap-1.5 text-[12.5px]">{reading.year2027.map((m) => <li key={m.month} className="rounded-lg bg-[#f6eedc] px-2.5 py-1.5"><b>{m.month}{isEn ? '' : '월'}</b> {m.theme}</li>)}</ol></div>
          )}
          {reading.makeupPlan && (
            <div><p className="font-black">💄 {isEn ? 'My makeup prescription' : '나만의 메이크업 처방'}</p>
              <ul className="mt-1 space-y-1 text-[13.5px]">{(['base', 'eyes', 'cheeks', 'lips', 'accent'] as const).filter((k) => reading.makeupPlan![k]).map((k) => (
                <li key={k}><b>{isEn ? { base: 'Base', eyes: 'Eyes', cheeks: 'Cheeks', lips: 'Lips', accent: 'Accent' }[k] : { base: '베이스', eyes: '눈', cheeks: '볼', lips: '입술', accent: '포인트' }[k]}</b> · {reading.makeupPlan![k]}</li>))}</ul></div>
          )}
          {!!reading.products?.length && <div><p className="font-black">🛍 {isEn ? 'What to look for' : '추천 제품 종류'}</p><p className="mt-1 text-[13px]">{reading.products.join(' · ')}</p></div>}
          <p className="text-[11px] text-[#1b1b1f]/55">{isEn ? 'Written by AI from your results, for fun.' : 'AI가 내 결과를 바탕으로 쓴 재미용 풀이예요.'}</p>
        </div>
      ) : (
        <>
          <ul className="mt-3 space-y-1 text-[13.5px]">
            {(isEn ? ['Six face palaces read one by one', 'Your five elements & how to balance them', 'Top fortunes + the one to boost', '2027 month-by-month flow', 'Your own makeup prescription & what to buy']
              : ['관상 6궁 하나하나 풀이', '오행 성향과 부족한 기운 채우는 법', 'TOP 운 + 보완할 운 풀이', '2027 정미년 12달 흐름', '내 얼굴·사주 맞춤 메이크업 처방과 추천 제품']).map((t) => <li key={t}>✓ {t}</li>)}
          </ul>
          <div className="relative mt-3 overflow-hidden rounded-2xl bg-[#fff7df] p-4 text-[13px] leading-relaxed">
            <p className="select-none blur-[3px]">{isEn ? 'Your forehead shows a calm, open energy and your career palace is bright — light at its centre makes…' : '이마가 시원해 관록궁이 밝게 열려 있어요. 이마 중앙에 은은한 광을 더하면 올해 인정받는 기운이…'}</p>
            <p className="mt-1 select-none blur-[3px]">{isEn ? 'In March your Resource stars rise, a good month to…' : '3월에는 인성이 들어와 배우고 준비하기 좋은 달이에요. 이때는…'}</p>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black">🔒 {isEn ? 'Unlock the full reading' : '전체 풀이 열기'}</span>
          </div>
          <div className="mt-3 space-y-2">
            {st.k === 'error' && <p className="rounded-xl bg-[#d6402f]/10 px-3 py-2 text-[13px] font-bold text-[#d6402f]">{E[st.e]}</p>}
            {st.k === 'busy' ? <p className="py-3 text-center text-sm font-bold">⏳ {isEn ? 'Writing your reading… (~15s)' : '풀이를 쓰는 중… (15초 안팎)'}</p>
              : loggedIn === false ? <button type="button" onClick={onLogin} className={`${btn} bg-[#1b1b1f] text-[#f6eedc]`}>{isEn ? 'Log in to unlock — 1st tool pass is free' : '로그인하고 열기 — 무료 도구 무료권으로 가능'}</button>
              : st.k === 'error' && st.e === 'topup' ? <a href="/analysis/?topup=1" className={`${btn} block bg-[#f2b632] text-center`}>{isEn ? 'Top up credits' : '크레딧 충전하기'}</a>
              : free && toolLeft > 0 && credits > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => ask('free')} className={`${btn} bg-[#d6402f] text-white`}>{isEn ? 'Use free pass' : '무료권으로'}</button>
                  <button type="button" onClick={() => ask('credit')} className={`${btn} bg-[#f2b632]`}>{isEn ? 'Use 1 credit' : '크레딧 1개로'}</button>
                </div>
              ) : <button type="button" onClick={() => ask(free ? (toolLeft > 0 ? 'free' : 'credit') : undefined)} className={`${btn} bg-[#1b1b1f] text-[#f6eedc]`}>
                  {free && toolLeft > 0 ? (isEn ? 'Unlock with free tool pass' : '무료 도구 무료권으로 열기') : (isEn ? 'Unlock with 1 credit' : '크레딧 1개로 열기')}
                </button>}
            {free && <p className="text-center text-[11px] text-[#1b1b1f]/55">{isEn ? `Free tool pass ${toolLeft} · Credits ${credits}` : `무료 도구 무료권 ${toolLeft}장 · 크레딧 ${credits}개`} · {isEn ? 'The tool pass is shared with Beauty DNA' : '무료 도구 무료권은 뷰티 DNA와 같이 써요'}</p>}
          </div>
        </>
      )}
    </div>
  )
}

// 오늘의 운빨 메이크업 — 2026-10-25 다시 켬. 숨긴 운세 영역 중 이것만은 "다시 오게 만드는 장치"라서
// (Co-Star 의 매일 운세 = 재방문 엔진, 우리 4주 재방문 1.2% → 2단계 기준 10%) 메이크업으로 이어지게 남긴다.
// 결과를 한 번 본 사람에게만(기기 저장본) — 입구 맨 위 · 결과 화면.
function DailyCard({ r, isEn, onOpen, onTry }: { r: FortuneResult; isEn: boolean; onOpen?: () => void; onTry: (id: FortuneLookId) => void }) {
  const d = dailyFortune(r)
  const l = fortuneLookById(d.look)
  return (
    <div className="border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">{isEn ? `Today's lucky makeup · ${d.dateKey}` : `오늘의 운빨 메이크업 · ${d.dateKey}`}</p>
        <span className="text-lg text-slate-400" style={{ fontFamily: "'Song Myung', serif" }} aria-hidden="true">{d.dayPillarHanja}日</span>
      </div>
      <p className="mt-2 text-xl font-extrabold leading-snug">
        {isEn ? d.themeEn : d.themeKo}{' '}
        <span className="whitespace-nowrap text-primary" aria-label={isEn ? `${d.stars} of 5` : `5점 중 ${d.stars}점`}>{'★'.repeat(d.stars)}<span className="text-slate-200">{'★'.repeat(5 - d.stars)}</span></span>
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{isEn ? d.tipEn : d.tipKo}</p>
      <div className="mt-4 flex items-center gap-3">
        <img src={luckyLookImg(l.id)} alt="" className="h-20 w-14 shrink-0 object-cover object-[50%_22%]" />
        <div className="min-w-0 text-[13px]">
          <p className="font-extrabold">{isEn ? `Today's look: ${l.nameEn}` : `오늘의 룩: ${l.nameKo}`}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-slate-600"><span className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: d.color.hex }} />{isEn ? `Lucky colour: ${d.color.en}` : `행운 색: ${d.color.ko}`}</p>
        </div>
      </div>
      <div className={`mt-4 grid gap-2 ${onOpen ? 'grid-cols-2' : ''}`}>
        <button type="button" onClick={() => { trackEvent('lucky_daily_try', { look: l.id, at: onOpen ? 'intro' : 'result' }); onTry(l.id) }}
          className="flex items-center justify-center gap-1 bg-navy py-3 text-sm font-bold text-white hover:bg-navy-mid transition-colors">{isEn ? 'Try today’s look' : '오늘의 룩 입혀 보기'}</button>
        {onOpen && <button type="button" onClick={onOpen} className="border border-slate-300 py-3 text-sm font-bold hover:border-navy transition-colors">{isEn ? 'My last result' : '지난 결과 보기'}</button>}
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">{isEn ? 'A new reading every day · free' : '매일 바뀌어요 · 무료'}</p>
    </div>
  )
}

function Select({ label, value, onChange, options, render, emptyLabel }: { label: string; value: string; onChange: (v: string) => void; options: string[]; render?: (v: string) => string; emptyLabel?: string }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold focus:border-navy focus:outline-none">
        <option value="">{emptyLabel ?? label}</option>
        {options.map((o) => <option key={o} value={o}>{render ? render(o) : o}</option>)}
      </select>
    </label>
  )
}

function GenerateBox({ T, hasPhoto, loggedIn, free, gen, onGenerate, onPhoto, look }: {
  T: typeof KO; hasPhoto: boolean; loggedIn: boolean | null; free: FreeStatus | null
  gen: { k: string; e?: GenError }; onGenerate: (p?: PayChoice) => void; onPhoto: () => void; look: FortuneLookId
}) {
  const btn = 'w-full py-3.5 text-[15px] font-bold transition-colors'
  if (gen.k === 'busy') return <p className="mt-4 bg-white/10 py-4 text-center text-sm font-bold">{T.generating}</p>
  if (!hasPhoto) return <button type="button" onClick={onPhoto} className={`${btn} mt-4 bg-white text-navy hover:bg-cream`}>{T.needPhotoForMakeup}</button>
  if (loggedIn === false) return (
    <div className="mt-4">
      <button type="button" onClick={() => onGenerate()} className={`${btn} bg-primary-dark text-white hover:bg-primary`}>{T.loginToTry}</button>
      <p className="mt-1.5 text-center text-[11px] text-white/60">{T.loginNote}</p>
    </div>
  )
  const freeLeft = free?.makeup.left ?? 0
  const credits = free?.balance ?? 0
  const err = gen.k === 'error' ? gen.e : undefined
  return (
    <div className="mt-4 space-y-2">
      {err && <p className="bg-primary/20 px-3 py-2 text-[13px] font-bold">{T.genErr[err]}</p>}
      {err === 'topup' ? (
        <a href={`/analysis/?topup=1`} onClick={() => keepPendingLook(look)} className={`${btn} block bg-white text-center text-navy hover:bg-cream`}>{T.topup}</a>
      ) : free && freeLeft > 0 && credits > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onGenerate('free')} className={`${btn} bg-primary-dark text-white hover:bg-primary`}>{T.useFree}</button>
          <button type="button" onClick={() => onGenerate('credit')} className={`${btn} bg-white text-navy hover:bg-cream`}>{T.useCredit}</button>
        </div>
      ) : (
        <button type="button" onClick={() => onGenerate(free ? (freeLeft > 0 ? 'free' : 'credit') : undefined)} className={`${btn} bg-primary-dark text-white hover:bg-primary`}>
          {free && freeLeft > 0 ? T.tryFree : T.tryCredit}
        </button>
      )}
      {free && <p className="text-center text-[11px] text-white/60">{T.counts(freeLeft, credits)}</p>}
    </div>
  )
}

function DexBox({ isEn, dex, secret, onShare }: { isEn: boolean; dex: AnimalId[]; secret: boolean; onShare: () => void }) {
  const ids: AnimalId[] = ['fox', 'cat', 'dog', 'rabbit', 'bear', 'deer', 'tiger', 'wolf', 'dino']
  return (
    <div className="mt-10 border border-slate-200 bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">{isEn ? 'Face dex' : '동물상 도감'}</p>
      <h2 className="mt-1 text-xl font-extrabold">{isEn ? `Collected ${dex.length} / 9` : `${dex.length} / 9 모음`}</h2>
      <p className="mt-1 text-xs text-slate-500">{isEn ? 'Friends who open your card add their animal here.' : '친구가 내 카드를 열면 친구의 상이 여기 모여요.'}</p>
      <div className="mt-4 grid grid-cols-5 gap-1.5 sm:grid-cols-9">
        {ids.map((id) => {
          const own = dex.includes(id)
          return (
            <div key={id} className="text-center">
              <img src={badgeSrc(id)} alt="" className={`mx-auto h-12 w-12 ${own ? '' : 'opacity-30 grayscale'}`} />
              <p className={`mt-0.5 text-[10px] font-bold ${own ? '' : 'text-slate-400'}`}>{isEn ? ANIMALS[id].en : ANIMALS[id].ko}</p>
            </div>
          )
        })}
        <div className="text-center">
          <img src={badgeSrc('secret-gumiho')} alt="" className={`mx-auto h-12 w-12 ${secret ? '' : 'opacity-25 grayscale blur-[1px]'}`} />
          <p className="mt-0.5 text-[10px] font-bold text-slate-400">{secret ? (isEn ? SECRET_BADGE.en : SECRET_BADGE.ko) : (isEn ? 'Secret' : '시크릿')}</p>
        </div>
      </div>
      <button type="button" onClick={onShare} className="mt-4 w-full border border-slate-300 py-3 text-sm font-bold hover:border-navy transition-colors">{isEn ? 'Send my card to friends' : '친구에게 내 카드 보내기'}</button>
    </div>
  )
}

function SharedView({ s, isEn, base, dex, onAdd }: { s: SharedCard; isEn: boolean; base: string; dex: AnimalId[]; onAdd: (id: AnimalId) => void }) {
  const a = s.animal ? ANIMALS[s.animal] : null
  const topLook = s.top[0] ? fortuneLookById(s.top[0].id) : null
  return (
    <section className="pt-10 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-dark">{isEn ? 'A friend sent you their lucky card' : '친구가 럭키 카드를 보냈어요'}</p>
      {a ? (
        <>
          <img src={badgeSrc(a.id)} alt="" className="mx-auto mt-4 h-36 w-36" />
          <h1 className="mt-2 text-4xl font-extrabold">{isEn ? a.en : a.ko} <span className="text-xl text-slate-500">{s.animalPct}%</span></h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">“{isEn ? a.quoteEn : a.quoteKo}”</p>
        </>
      ) : <h1 className="mt-4 text-3xl font-extrabold">{isEn ? 'Their lucky makeup' : '친구의 럭키 메이크업'}</h1>}
      {topLook && (
        <a href={`${base}${topLook.id}/`} className="mx-auto mt-6 flex max-w-sm items-center gap-3 border border-slate-200 bg-white p-3 text-left hover:border-navy transition-colors">
          <img src={lookImg(topLook.id)} alt="" className="h-20 w-16 shrink-0 object-cover object-[50%_25%]" />
          <span className="min-w-0">
            <span className="block text-[11px] font-bold text-primary-dark">{isEn ? 'Their pick' : '친구에게 추천된 메이크업'}</span>
            <span className="block font-extrabold">{isEn ? `${topLook.nameEn} makeup` : topLook.nameKo}</span>
            <span className="block text-xs text-slate-500">{isEn ? topLook.hookEn : topLook.hookKo}</span>
          </span>
        </a>
      )}
      {a && (
        <button type="button" onClick={() => onAdd(a.id)} disabled={dex.includes(a.id)} className="mt-5 border border-slate-300 bg-white px-6 py-3 text-sm font-bold disabled:opacity-50">
          {dex.includes(a.id) ? (isEn ? 'Already in my dex' : '이미 내 도감에 있어요') : (isEn ? `Add ${a.en} to my dex` : `내 도감에 ${a.ko} 추가`)}
        </button>
      )}
      <a href={base} className="mx-auto mt-3 flex max-w-sm items-center justify-center gap-1 bg-navy py-4 text-base font-bold text-white hover:bg-navy-mid transition-colors">{isEn ? 'Find my lucky makeup' : '내 럭키 메이크업 찾기'}<span className="material-symbols-outlined text-lg">arrow_forward</span></a>
      <p className="mt-3 text-[11px] text-slate-400">{isEn ? 'For fun. Photos never leave your device.' : '재미로 보는 결과예요. 사진은 기기 밖으로 나가지 않아요.'}</p>
    </section>
  )
}

function IntroSeo({ isEn }: { isEn: boolean }) {
  return (
    <div className="mt-14 space-y-4 border-t border-slate-200 pt-10 text-[15px] leading-relaxed text-slate-600">
      <h2 className="text-xl font-extrabold text-navy">{isEn ? 'What is lucky makeup?' : '럭키 메이크업이 뭐예요?'}</h2>
      {isEn ? (
        <>
          <p><strong className="text-navy">Makeup for the luck you want.</strong> Korean face reading (gwansang) links each part of the face to a kind of luck: the nose to wealth, the under-eye to love, the mid-forehead to career. Each of the 9 lucky looks brightens the matching spot.</p>
          <p><strong className="text-navy">Try it on your own face.</strong> Upload a selfie and AI applies the look to your photo. Every look has a free step-by-step how-to on a face chart, with product links for each step.</p>
          <p><strong className="text-navy">Not sure where to start?</strong> Add your birth date (optional) and we suggest the luck to start with, plus an accent colour from the five elements.</p>
        </>
      ) : (
        <>
          <p><strong className="text-navy">원하는 운에 맞춘 메이크업이에요.</strong> 관상에서는 얼굴 자리마다 보는 운이 있어요. 코는 재물, 눈 밑 애교살은 연애, 이마 가운데는 직업. 럭키 메이크업 9가지는 그 자리를 살려 그려요.</p>
          <p><strong className="text-navy">내 얼굴에 먼저 입혀 보세요.</strong> 셀카를 올리면 AI가 내 사진에 메이크업을 입혀요. 9가지 모두 페이스 차트로 보는 따라 하기 방법과 단계별 제품 링크가 무료로 열려 있어요.</p>
          <p><strong className="text-navy">뭘 고를지 모르겠다면</strong> 생년월일을 넣어 보세요(선택). 지금 필요한 운과 오행 포인트 색을 골라 드려요.</p>
        </>
      )}
    </div>
  )
}

// ── 문구 ──
const KO = {
  kicker: 'Lucky makeup · 럭키 메이크업',
  title1: '럭키 메이크업', title2: '셀카 한 장에 9가지 운',
  lead: '재물운 · 연애운 · 합격운 · 건강운… 관상에서 운을 보는 자리를 살려 그리는 메이크업 9가지. 내 셀카에 AI로 입혀 보고, 따라 하는 방법과 제품까지 한 번에.',
  priceStrip: [['1장', '무료'], ['5장', '$2.99'], ['9가지 운 전부', '$4.99']] as [string, string][],
  noSub: '한 번 결제 · 구독 없음',
  ctaStart: '내 셀카로 시작', ctaPrice: '가격 보기',
  newYear: '2027 정미년 신년운 메이크업이 열렸어요',
  gridTitle: '럭키 메이크업 9가지', gridHint: '누르면 따라 하는 방법과 제품 →',
  gridNote: '같은 모델에 AI로 입힌 예시예요. 내 셀카로 하면 내 얼굴로 나와요.',
  how: [
    ['셀카 올리기', '정면 셀카 한 장이면 돼요. 사진은 기기 밖으로 나가지 않아요.'],
    ['운 고르기', '원하는 운을 직접 고르거나, 생년월일을 넣으면 지금 필요한 운을 추천해요.'],
    ['내 얼굴에 메이크업', '1장 또는 9장 전부. 따라 하는 방법과 제품 링크도 같이.'],
  ] as [string, string][],
  startKicker: 'Start', startTitle: '셀카나 생년월일, 하나만 넣어도 돼요',
  preLook: (n: string) => `${n}을 골라 두었어요. 결과가 나오면 바로 입혀 볼 수 있어요.`,
  howLink: '따라 하는 방법 · 제품 보기 →',
  photoTitle: '셀카', photoSub: '정면 한 장', camera: '셀카 찍기', gallery: '사진 고르기', change: '다른 사진으로',
  photoTip: '정면 · 앞머리 넘기기 · 무표정 · 고른 조명이면 결과가 더 좋아요.',
  birthTitle: '생년월일', optional: '선택', birthSub: '넣으면 지금 필요한 운을 골라 드려요. 양력 기준.', year: '년', month: '월', day: '일', hour: '태어난 시', hourUnknown: '태어난 시 (몰라도 돼요)',
  birthTip: '양력 기준이에요.',
  go: '내 럭키 메이크업 추천 받기',
  privacy: '사진과 생년월일은 이 기기 밖으로 나가지 않아요.', fun: '관상·사주는 재미로 보는 전통이에요. 사람을 평가하지 않아요.',
  needOne: '셀카나 생년월일 중 하나는 넣어 주세요.', badBirth: '생년월일을 다시 확인해 주세요.', birthOnly: '생년월일로만 볼게요.',
  reading: '얼굴을 읽는 중…', readingSub: '어떤 메이크업부터 할지 고르고 있어요',
  recKicker: '추천', recTitle: (n: string) => `${n} 메이크업부터 해 보세요`,
  recWhy: (b: boolean, f: boolean): string => f && b ? '얼굴형과 생년월일로 고른 순서예요. 다른 운도 바로 바꿀 수 있어요.' : f ? '얼굴로 고른 순서예요. 다른 운도 바로 바꿀 수 있어요.' : '생년월일로 고른 순서예요. 다른 운도 바로 바꿀 수 있어요.',
  cardAlt: '나의 럭키 카드', saveCard: '카드 저장', shareLink: '친구에게 카드 보내기', copied: '링크를 복사했어요',
  rxKicker: '내 얼굴에 · 1장',
  aiNote: 'AI가 내 사진에 입혀 보는 시뮬레이션이에요. 실제 화장 결과와 다를 수 있어요.',
  generating: '메이크업을 입히는 중… (최대 1분)',
  needPhotoForMakeup: '셀카를 올리고 내 얼굴에 입혀 보기',
  loginToTry: '로그인하고 첫 장 무료로 입혀 보기', loginNote: '가입하면 첫 1장 무료. 그다음 5장 $2.99 · 9장 $4.99.',
  useFree: '무료권으로', useCredit: '보유 1장 쓰기', tryFree: '무료로 내 얼굴에 입혀 보기', tryCredit: '1장 써서 내 얼굴에 입혀 보기',
  counts: (f: number, c: number) => `무료권 ${f}장 · 보유 ${c}장`,
  topup: '충전하기 (5장 $2.99부터)',
  genErr: {
    login: '로그인이 필요해요.', topup: '남은 장수가 없어요. 충전하면 바로 이어서 만들 수 있어요.', free_used: '무료권을 이미 사용했어요. 보유한 장수로 만들 수 있어요.',
    choose: '무료권과 보유 장수 중 무엇을 쓸지 골라 주세요.', unavailable: '잠시 후 다시 시도해 주세요.', retry: '생성에 실패했어요. 다시 누르면 추가 차감 없이 다시 만들어요.',
  } as Record<GenError, string>,
  doneTitle: '나의 럭키 메이크업 완성', before: '비포', after: '애프터', usedFree: '무료권 1장 사용', usedCredit: '1장 사용',
  howAndShop: '이 메이크업 따라 하기 · 제품 보기',
  cardUpdated: '아래 카드와 포카에도 메이크업 사진이 들어갔어요.',
  shareKicker: '무료 · 공유', cardTitle: '나의 럭키 카드', animalTitle: (n: string, p: number) => `나는 ${n} ${p}%`,
  pcKicker: '포카', pcTitle: '나의 동물상 포토카드', flip: '누르면 뒷면', savePc: '포카 저장',
  animalKicker: '나의 동물상', fortunesKicker: '관상 + 사주', fortunesTitle: '나의 운 9가지',
  tryLook: (n: string) => `${n} 메이크업 입혀 보기 →`,
  sajuKicker: '나의 사주 · 오행', pHour: '시주', pDay: '일주', pMonth: '월주', pYear: '연주',
  sajuNote: (dm: string, lack: string) => `나를 나타내는 기운(일간)은 ${dm}. 가장 부족한 기운은 ${lack}. 메이크업 포인트 색으로 채워 드려요.`,
  sajuLimit: '간이 사주예요(양력·절기 평균 날짜).',
  again: '처음부터 다시', added: '도감에 추가했어요', already: '이미 도감에 있어요', secretGot: '시크릿 배지 「황금 구미호」 획득!',
  err: {
    'no-face': '얼굴을 찾지 못했어요. 더 밝은 정면 사진으로 해 주세요.', 'many-faces': '얼굴이 둘 이상 있어요. 혼자 나온 사진으로 해 주세요.',
    tilted: '고개가 돌아가 있어요. 정면 사진으로 다시 해 주세요.', 'load-failed': '측정 도구를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.',
    'bad-file': '사진을 열 수 없어요. JPG나 PNG로 해 주세요.',
  } as Record<FaceScanError | 'bad-file', string>,
}
const EN: typeof KO = {
  kicker: 'Lucky makeup · K-face reading',
  title1: 'Lucky Makeup', title2: '9 lucks, one selfie',
  lead: 'Wealth, love, exams, health… 9 makeup looks that light up the spots Korean face reading links to each kind of luck. Try them on your own selfie with AI, then get the how-to and products in one place.',
  priceStrip: [['1 look', 'Free'], ['5 looks', '$2.99'], ['All 9 lucks', '$4.99']],
  noSub: 'One-time payment · no subscription',
  ctaStart: 'Start with my selfie', ctaPrice: 'See pricing',
  newYear: 'The 2027 New Year lucky makeup is here',
  gridTitle: '9 lucky makeup looks', gridHint: 'Tap for the how-to and products →',
  gridNote: 'Examples applied with AI on one model. With your selfie, it’s your face.',
  how: [
    ['Add a selfie', 'One front-facing selfie. It never leaves your device.'],
    ['Pick a luck', 'Choose one yourself, or add your birth date and we’ll suggest one.'],
    ['Makeup on your face', 'One look or all 9 — with the how-to and product links.'],
  ],
  startKicker: 'Start', startTitle: 'A selfie or your birth date — either works',
  preLook: (n: string) => `${n} is picked — you can try it as soon as your result is ready.`,
  howLink: 'How-to & products →',
  photoTitle: 'Selfie', photoSub: 'front-facing', camera: 'Take a selfie', gallery: 'Choose a photo', change: 'Use another photo',
  photoTip: 'Front-facing, hair off the forehead, neutral expression, even light.',
  birthTitle: 'Birth date', optional: 'Optional', birthSub: 'Add it and we’ll suggest the luck you need now. Solar calendar.', year: 'Year', month: 'Month', day: 'Day', hour: 'Birth hour', hourUnknown: 'Birth hour (optional)',
  birthTip: 'Solar calendar.',
  go: 'Find my lucky makeup',
  privacy: 'Your photo and birth date never leave this device.', fun: 'Face reading is a tradition to enjoy for fun — it never judges anyone.',
  needOne: 'Add a selfie or your birth date.', badBirth: 'Please check your birth date.', birthOnly: 'We’ll use your birth date only.',
  reading: 'Reading your face…', readingSub: 'Picking which look to start with',
  recKicker: 'Your pick', recTitle: (n: string) => `Start with ${n} makeup`,
  recWhy: (b: boolean, f: boolean) => f && b ? 'Ordered from your face and birth date. Switch to any luck below.' : f ? 'Ordered from your face. Switch to any luck below.' : 'Ordered from your birth date. Switch to any luck below.',
  cardAlt: 'My lucky card', saveCard: 'Save card', shareLink: 'Send my card to friends', copied: 'Link copied',
  rxKicker: 'On your face · 1 look',
  aiNote: 'An AI simulation on your photo — real makeup may look different.',
  generating: 'Applying the makeup… (up to a minute)',
  needPhotoForMakeup: 'Add a selfie to try it on your face',
  loginToTry: 'Log in — your first look is free', loginNote: 'Sign up and your first look is free. Then 5 looks $2.99 · all 9 $4.99.',
  useFree: 'Use free pass', useCredit: 'Use 1 look', tryFree: 'Try it on my face — free', tryCredit: 'Try it on my face — 1 look',
  counts: (f: number, c: number) => `Free pass ${f} · ${c} looks left`,
  topup: 'Top up (5 looks from $2.99)',
  genErr: {
    login: 'Please log in.', topup: 'No looks left — top up to continue.', free_used: 'Your free pass is used. You can use a look you have.',
    choose: 'Choose a free pass or one of your looks.', unavailable: 'Please try again shortly.', retry: 'Generation failed. Tap again — no extra charge.',
  },
  doneTitle: 'Your lucky makeup', before: 'Before', after: 'After', usedFree: '1 free pass used', usedCredit: '1 look used',
  howAndShop: 'How to do this look · products',
  cardUpdated: 'Your card and photocard below now show the makeup photo.',
  shareKicker: 'Free · share', cardTitle: 'My lucky card', animalTitle: (n: string, p: number) => `I’m a ${n} face · ${p}%`,
  pcKicker: 'Photocard', pcTitle: 'My animal-face photocard', flip: 'Tap to flip', savePc: 'Save photocard',
  animalKicker: 'MY ANIMAL FACE', fortunesKicker: 'FACE READING + SAJU', fortunesTitle: 'My 9 fortunes',
  tryLook: (n: string) => `Try ${n} makeup →`,
  sajuKicker: 'MY SAJU · FIVE ELEMENTS', pHour: 'Hour', pDay: 'Day', pMonth: 'Month', pYear: 'Year',
  sajuNote: (dm: string, lack: string) => `Your Day Master element is ${dm}. Your weakest element is ${lack} — we add it back as a makeup accent.`,
  sajuLimit: 'A simplified reading (solar calendar, average seasonal dates).',
  again: 'Start over', added: 'Added to your dex', already: 'Already in your dex', secretGot: 'Secret badge “Golden Gumiho” unlocked!',
  err: {
    'no-face': 'We couldn’t find a face. Try a brighter, front-facing photo.', 'many-faces': 'More than one face — use a photo of just you.',
    tilted: 'Your head is turned. Face the camera and try again.', 'load-failed': 'The measuring tool didn’t load. Check your connection.',
    'bad-file': 'That file couldn’t be opened. Try a JPG or PNG.',
  },
}
