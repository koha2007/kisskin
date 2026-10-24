// 오늘의 운세 — /tools/today-fortune/ · /en/tools/today-fortune/ (2026-10-24 럭키 메이크업에서 분리)
// 운영자 10/24: "2026 메이크업 9종 · 럭키 메이크업 9종 · 오늘의 운세 — 결과가 다 다르게.
//   '셀카나 생년월일, 하나만 넣어도 돼요'는 오늘의 운세로. 무료로 간단하게 운세만, 결과 밑에 럭키 메이크업으로."
// ────────────────────────────────────────────────────────────────────
// 흐름: 입력(셀카 · 생년월일, 하나만 있어도 됨) → 분석(기기 안, 서버 X) → 오늘의 운세(매일 바뀜)
//      → 오늘의 럭키 메이크업 추천(→ /lucky-makeup/?look=) → 동물상 카드·포카(무료 공유) · 도감
// 공유 링크(?c=)로 들어온 친구는 사진 없는 카드 + "도감에 추가" + "나도 오늘의 운세 보기".
// 로그인·결제 없음. 사진·생년월일은 이 기기 밖으로 나가지 않는다.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { pickImage } from '../lib/nativePicker'
import { trackEvent, trackToolComplete } from '../lib/analytics'
import { scanFortuneFace, faceAxes, type FaceScan, type FaceScanError, type AnimalId } from '../lib/fortune/face'
import { computeSaju, isValidBirth, pillarHanja, ELEMENTS, type BirthInput, type Element } from '../lib/fortune/saju'
import { readFortunes } from '../lib/fortune/reading'
import { FORTUNE_LOOKS, fortuneLookById, luckyLookImg } from '../lib/fortune/looks'
import { ANIMALS, SECRET_BADGE, badgeSrc } from '../lib/fortune/animals'
import { saveLast, loadLast, loadDex, addToDex, hasSecret, encodeShare, decodeShare, serialOf, unlockSecret, type FortuneResult, type SharedCard } from '../lib/fortune/state'
import { renderResultCard, renderPhotocardFront, renderPhotocardBack, OBANG, type CardData } from '../lib/fortune/card'
import { generateFortuneMakeup, newJobId } from '../lib/fortune/generate'
import { getFreeStatus, type FreeStatus, type PayChoice } from '../lib/freeStatus'
import { dailyFortune } from '../lib/fortune/daily'
import { loadReading, requestReading, type PreciseReading, type ReadingError } from '../lib/fortune/readingApi'
import { compatOf, bumpCompatCount, COMPAT_TEXT, type Compat } from '../lib/fortune/compat'
import { savePendingSelfieFromSrc, takePendingSelfie, keepPendingSelfie, clearPendingSelfie } from '../lib/makeup/pendingSelfie'
import { supabase } from '../lib/supabase'
import { withRef } from '../lib/referral'
import { canvasToDataUrl, saveOrShare } from '../lib/fortune/share'

type Phase = 'intro' | 'busy' | 'result' | 'shared'
// 운세 앱 영역(사주 명식·정밀 풀이·궁합) — 2026-10-24 화면에서 뺌. 4주 데이터 보고 다시 판단(코드는 유지).
const SHOW_FORTUNE_EXTRAS = false
const ELEM_KO: Record<Element, string> = { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' }
const ELEM_EN: Record<Element, string> = { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' }
const lookImg = luckyLookImg

export default function TodayFortune() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const base = isEn ? '/en/tools/today-fortune/' : '/tools/today-fortune/'
  const lucky = isEn ? '/en/lucky-makeup/' : '/lucky-makeup/'
  const [phase, setPhase] = useState<Phase>('intro')
  const [photo, setPhoto] = useState<string | null>(null)
  const [birth, setBirth] = useState<{ y: string; m: string; d: string }>({ y: '', m: '', d: '' })
  const [err, setErr] = useState<string | null>(null)
  const [result, setResult] = useState<FortuneResult | null>(null)
  const [shared, setShared] = useState<SharedCard | null>(null)
  const [card, setCard] = useState<string | null>(null)
  const [pc, setPc] = useState<{ front: string; back: string } | null>(null)
  const [pcSide, setPcSide] = useState<'front' | 'back'>('front')
  // 숨긴 운세 영역(SHOW_FORTUNE_EXTRAS)용 — 켤 때만 쓴다
  const [free, setFree] = useState<FreeStatus | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  // 도감·시크릿은 이 기기 저장소에서(입력 화면엔 안 그려지므로 서버 렌더와 어긋나지 않는다)
  const [dex, setDex] = useState<AnimalId[]>(() => (typeof window === 'undefined' ? [] : loadDex().map((e) => e.id)))
  const [secret, setSecret] = useState(() => typeof window !== 'undefined' && hasSecret())
  const [toast, setToast] = useState<string | null>(null)
  // 다시 온 사람 — 저장된 결과로 오늘의 운세를 바로
  const [saved, setSaved] = useState<FortuneResult | null>(null)
  const T = isEn ? EN : KO

  // ── 진입: 공유 링크(?c=) — 미리 렌더한 페이지라 주소는 브라우저에서만 읽는다 ──
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const q = new URLSearchParams(window.location.search)
    const sc = decodeShare(q.get('c'))
    if (sc) { setShared(sc); setPhase('shared'); trackEvent('fortune_shared_view', { animal: sc.animal ?? 'none' }); return }
    const last = loadLast()
    if (last) setSaved(last)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!SHOW_FORTUNE_EXTRAS || phase !== 'result') return
    let off = false
    supabase.auth.getSession().then(({ data }) => {
      if (off) return
      setLoggedIn(!!data.session)
      if (data.session) getFreeStatus().then((s) => { if (!off) setFree(s) })
    }).catch(() => setLoggedIn(false))
    return () => { off = true }
  }, [phase])

  // 동물상 카드(A2)·포카 그리기 — 메이크업 사진 없이, 셀카(있으면) 그대로
  const cardData: CardData | null = useMemo(() => {
    if (!result) return null
    return {
      isEn, photo: photo ?? undefined, applied: false,
      animal: result.animals?.[0]?.id, animalPct: result.animals?.[0]?.pct, second: result.animals?.[1],
      top: result.scores.slice(0, 3).map((s) => ({ id: s.id, score: s.score })),
      counts: result.counts, lacking: result.lacking, dayStem: result.dayStem, serial: result.serial,
      look: dailyFortune(result).look,
    }
  }, [result, photo, isEn])

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
    const file = await pickImage(mode)
    if (!file) return
    const url = URL.createObjectURL(file)
    // 화면 표시용 축소본 — 세션에도 맡겨 두면 럭키 메이크업으로 넘어갔을 때 같은 셀카로 바로 만든다
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
    const b: BirthInput = { year: +birth.y, month: +birth.m, day: +birth.d }
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
    setResult(res); saveLast(res); setSaved(res)
    if (res.animals?.[0]) {
      const d = addToDex(res.animals[0].id, 'me')
      setDex(d.dex.map((e) => e.id)); if (d.secretUnlocked) { setSecret(true); flash(T.secretGot) }
    }
    setPhase('result')
    window.scrollTo({ top: 0 })
    trackToolComplete('today-fortune', res.animals?.[0]?.id ?? res.scores[0].id)
    trackEvent('fortune_result', { animal: res.animals?.[0]?.id ?? 'none', top: res.scores[0].id, photo: !!scan, birth: !!b })
  }

  const shareLink = async () => {
    if (!result) return
    const url = withRef(`${window.location.origin}${base}?c=${encodeShare(result)}`)  // 로그인 회원이면 초대 코드도
    const text = isEn ? 'My fortune card today — what animal face are you?' : '내 오늘의 운세 카드 — 너는 무슨 상이야?'
    try {
      if (navigator.share) { await navigator.share({ title: 'kissinskin', text, url }); trackEvent('fortune_share', { via: 'native' }); return }
    } catch { return }
    try { await navigator.clipboard.writeText(url); flash(T.copied); trackEvent('fortune_share', { via: 'copy' }) } catch { /* noop */ }
  }

  const reset = () => { setPhase('intro'); setResult(null); setCard(null); setPc(null); clearPendingSelfie(); setPhoto(null); window.scrollTo({ top: 0 }) }
  const openSaved = () => { if (!saved) return; setResult(saved); setPhase('result'); window.scrollTo({ top: 0 }); trackEvent('fortune_daily_view', { from: 'intro' }) }

  const eyebrow = 'text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark'
  const d = result ? dailyFortune(result) : null
  const todayLook = d ? fortuneLookById(d.look) : null
  return (
    <div className="font-display bg-background-light min-h-screen text-navy">
      <ToolsNav />
      <main className="max-w-xl mx-auto px-4 sm:px-6 pb-20">
        {toast && <div role="status" className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-lg">{toast}</div>}

        {phase === 'intro' && (
          <section className="pt-10 md:pt-14">
            <p className={eyebrow}>{T.kicker}</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] break-keep">{T.title1}<br /><span className="text-primary">{T.title2}</span></h1>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">{T.lead}</p>

            {saved && (
              <button type="button" onClick={openSaved} className="mt-6 flex w-full items-center gap-3 border border-primary/40 bg-white px-4 py-3 text-left hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-primary">wb_sunny</span>
                <span className="min-w-0 flex-1 text-sm font-bold">{T.savedOpen}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            )}

            {/* 입력 — 셀카나 생년월일, 하나만 있어도 된다 */}
            <div id="start" className="mt-8 scroll-mt-20 border border-slate-200 bg-white p-5 md:p-7">
              <p className="text-sm font-extrabold">{T.photoTitle} <span className="font-medium text-slate-500">{T.photoSub}</span></p>
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
                <p className="text-sm font-extrabold">{T.birthTitle} <span className="ml-1 bg-cream px-1.5 py-0.5 text-[11px] font-bold text-slate-600">{T.orLabel}</span></p>
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

            <IntroSeo isEn={isEn} lucky={lucky} />
          </section>
        )}

        {phase === 'busy' && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary" aria-hidden="true" />
            <p className="text-lg font-extrabold">{T.reading}</p>
            <p className="text-sm text-slate-500">{T.readingSub}</p>
          </div>
        )}

        {phase === 'shared' && shared && <SharedView s={shared} isEn={isEn} base={base} lucky={lucky} dex={dex} onAdd={(id) => {
          const r = addToDex(id, 'friend'); setDex(r.dex.map((e) => e.id))
          if (r.secretUnlocked) { setSecret(true); flash(T.secretGot) } else flash(r.added ? T.added : T.already)
          trackEvent('fortune_dex_add', { animal: id, added: r.added })
        }} />}

        {phase === 'result' && result && d && todayLook && (
          <section className="pt-8">
            {/* 1) 오늘의 운세 — 매일 바뀐다(같은 날·같은 사람이면 같은 결과) */}
            <div className="flex items-baseline justify-between gap-3">
              <p className={eyebrow}>{T.todayKicker(d.dateKey)}</p>
              <span className="text-lg text-slate-400" style={{ fontFamily: "'Song Myung', serif" }} aria-hidden="true">{d.dayPillarHanja}日</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight break-keep">{isEn ? d.themeEn : d.themeKo}</h1>
            <p className="mt-1 text-xl text-primary" aria-label={isEn ? `${d.stars} of 5` : `5점 중 ${d.stars}점`}>{'★'.repeat(d.stars)}<span className="text-slate-200">{'★'.repeat(5 - d.stars)}</span></p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{isEn ? d.tipEn : d.tipKo}</p>
            <dl className="mt-5 grid grid-cols-2 gap-px border border-slate-200 bg-slate-200 text-sm">
              <div className="bg-white p-3">
                <dt className="text-[11px] font-bold text-slate-500">{T.luckyColor}</dt>
                <dd className="mt-1 flex items-center gap-1.5 font-extrabold"><span className="inline-block h-4 w-4 rounded-full ring-1 ring-black/10" style={{ background: d.color.hex }} />{isEn ? d.color.en : d.color.ko}</dd>
              </div>
              <div className="bg-white p-3">
                <dt className="text-[11px] font-bold text-slate-500">{result.animals?.[0] ? T.myFace : T.myLuck}</dt>
                <dd className="mt-1 font-extrabold">{result.animals?.[0]
                  ? `${isEn ? ANIMALS[result.animals[0].id].en : ANIMALS[result.animals[0].id].ko} ${result.animals[0].pct}%`
                  : (isEn ? fortuneLookById(result.scores[0].id).nameEn : fortuneLookById(result.scores[0].id).fortuneKo)}</dd>
              </div>
            </dl>

            {/* 요즘 강한 운 3 — 간단히 */}
            <div className="mt-6">
              <p className="text-sm font-extrabold">{T.top3}</p>
              <ul className="mt-2 space-y-1.5">
                {result.scores.slice(0, 3).map((s) => {
                  const l = fortuneLookById(s.id)
                  return (
                    <li key={s.id} className="flex items-center gap-2 text-xs font-bold">
                      <span className="w-24 shrink-0 truncate">{isEn ? l.nameEn : l.fortuneKo}</span>
                      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${s.score}%`, background: l.accent }} /></span>
                      <span className="w-8 text-right tabular-nums">{s.score}</span>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-2 text-[11px] text-slate-400">{T.recWhy(!!result.birth, !!result.animals?.[0])}</p>
            </div>

            {/* 2) 결과 밑 → 럭키 메이크업으로(오늘의 룩을 골라 둔 채, 셀카도 이어서) */}
            <a href={`${lucky}?look=${todayLook.id}`} onClick={() => { if (photo) keepPendingSelfie(photo); trackEvent('fortune_to_lucky', { look: todayLook.id, photo: !!photo }) }}
              className="mt-8 block bg-navy p-5 text-white hover:bg-navy-mid transition-colors">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-on-dark">{T.luckyKicker}</p>
              <div className="mt-3 flex gap-4">
                <img src={lookImg(todayLook.id)} alt="" className="h-32 w-24 shrink-0 object-cover object-[50%_22%]" />
                <div className="min-w-0">
                  <p className="text-xl font-extrabold leading-tight">{isEn ? `${todayLook.nameEn} makeup` : todayLook.nameKo}</p>
                  <p className="mt-1 text-[13px] leading-snug text-white/80">{isEn ? todayLook.hookEn : todayLook.hookKo}</p>
                  <p className="mt-3 inline-flex items-center gap-1 bg-primary-dark px-3 py-2 text-sm font-bold">{photo ? T.luckyCtaPhoto : T.luckyCta}<span className="material-symbols-outlined text-base">arrow_forward</span></p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-white/60">{T.luckyNote}</p>
            </a>
            <a href={`${lucky}#looks`} className="mt-2 block text-center text-xs font-bold underline underline-offset-4">{T.luckyOther}</a>

            {/* 3) 공유용 무료 카드 — 동물상 카드 · 포카(바이럴 입구) */}
            <div className="mt-12 border-t border-slate-200 pt-10">
              <p className={eyebrow}>{T.shareKicker}</p>
              <h2 className="mt-1.5 text-2xl font-extrabold">{result.animals?.[0] ? T.animalTitle(isEn ? ANIMALS[result.animals[0].id].en : ANIMALS[result.animals[0].id].ko, result.animals[0].pct) : T.cardTitle}</h2>
              {result.animals?.[0] && <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{isEn ? ANIMALS[result.animals[0].id].descEn : ANIMALS[result.animals[0].id].descKo}</p>}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <figure className="min-w-0">
                  {card ? <img src={card} alt={T.cardAlt} className="w-full shadow-[0_12px_30px_rgba(7,9,83,.15)]" /> : <div className="aspect-[9/16] w-full animate-pulse bg-cream" />}
                  <button type="button" disabled={!card} onClick={() => { if (card) { saveOrShare(card, 'kissinskin-fortune-card.jpg', isEn); trackEvent('fortune_card_save', { kind: 'result' }) } }} className="mt-2 w-full border border-slate-300 bg-white py-2.5 text-xs font-bold hover:border-navy transition-colors">{T.saveCard}</button>
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
                  onLogin={() => { saveLast(result); window.location.href = '/auth?next=' + encodeURIComponent(base) }}
                  onPaid={() => getFreeStatus().then(setFree)} />
                <CompatBox me={result} myPhoto={photo} isEn={isEn} loggedIn={loggedIn} free={free}
                  onLogin={() => { saveLast(result); window.location.href = '/auth?next=' + encodeURIComponent(base) }}
                  onDone={() => { getFreeStatus().then(setFree); if (bumpCompatCount() >= 3 && unlockSecret('compat')) { setSecret(true); flash(T.secretGot) } }} />
              </>
            )}

            {/* 4) 도감 — 친구 카드 모으기(공유 루프) */}
            <DexBox isEn={isEn} dex={dex} secret={secret} onShare={shareLink} />

            <button type="button" onClick={reset} className="mt-8 w-full border border-slate-300 bg-white py-3 text-sm font-bold hover:border-navy transition-colors">{T.again}</button>
          </section>
        )}
      </main>
      <ToolsFooter />
    </div>
  )
}

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

function SharedView({ s, isEn, base, lucky, dex, onAdd }: { s: SharedCard; isEn: boolean; base: string; lucky: string; dex: AnimalId[]; onAdd: (id: AnimalId) => void }) {
  const a = s.animal ? ANIMALS[s.animal] : null
  const topLook = s.top[0] ? fortuneLookById(s.top[0].id) : null
  return (
    <section className="pt-10 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-dark">{isEn ? 'A friend sent you their fortune card' : '친구가 운세 카드를 보냈어요'}</p>
      {a ? (
        <>
          <img src={badgeSrc(a.id)} alt="" className="mx-auto mt-4 h-36 w-36" />
          <h1 className="mt-2 text-4xl font-extrabold">{isEn ? a.en : a.ko} <span className="text-xl text-slate-500">{s.animalPct}%</span></h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">“{isEn ? a.quoteEn : a.quoteKo}”</p>
        </>
      ) : <h1 className="mt-4 text-3xl font-extrabold">{isEn ? 'Their fortune card' : '친구의 운세 카드'}</h1>}
      {topLook && (
        <a href={`${lucky}${topLook.id}/`} className="mx-auto mt-6 flex max-w-sm items-center gap-3 border border-slate-200 bg-white p-3 text-left hover:border-navy transition-colors">
          <img src={lookImg(topLook.id)} alt="" className="h-20 w-16 shrink-0 object-cover object-[50%_25%]" />
          <span className="min-w-0">
            <span className="block text-[11px] font-bold text-primary-dark">{isEn ? 'Their lucky makeup' : '친구의 럭키 메이크업'}</span>
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
      <a href={base} className="mx-auto mt-3 flex max-w-sm items-center justify-center gap-1 bg-navy py-4 text-base font-bold text-white hover:bg-navy-mid transition-colors">{isEn ? 'See my fortune today — free' : '나도 오늘의 운세 보기 — 무료'}<span className="material-symbols-outlined text-lg">arrow_forward</span></a>
      <p className="mt-3 text-[11px] text-slate-400">{isEn ? 'For fun. Photos never leave your device.' : '재미로 보는 결과예요. 사진은 기기 밖으로 나가지 않아요.'}</p>
    </section>
  )
}

function IntroSeo({ isEn, lucky }: { isEn: boolean; lucky: string }) {
  return (
    <div className="mt-14 space-y-4 border-t border-slate-200 pt-10 text-[15px] leading-relaxed text-slate-600">
      <h2 className="text-xl font-extrabold text-navy">{isEn ? 'How does today’s fortune work?' : '오늘의 운세는 어떻게 보나요?'}</h2>
      {isEn ? (
        <>
          <p><strong className="text-navy">A selfie or your birth date — either works.</strong> With a birth date we compare today’s day pillar with your Day Master (saju). With a selfie we read your face in the browser and find your animal face. It changes every day.</p>
          <p><strong className="text-navy">Free, no log-in.</strong> You get today’s theme, a tip, your lucky colour and a shareable animal-face card. Your photo and birth date never leave this device.</p>
          <p><strong className="text-navy">Then wear your luck.</strong> Each day comes with a matching <a href={lucky} className="font-bold text-navy underline underline-offset-4">lucky makeup</a> — try it on your own selfie.</p>
        </>
      ) : (
        <>
          <p><strong className="text-navy">셀카나 생년월일, 하나만 있으면 돼요.</strong> 생년월일을 넣으면 오늘의 일진과 내 일간(사주)을 비교하고, 셀카를 넣으면 기기 안에서 관상을 읽어 동물상을 찾아요. 매일 바뀌어요.</p>
          <p><strong className="text-navy">무료 · 로그인 없이.</strong> 오늘의 운, 한 줄 조언, 행운 색, 친구에게 보낼 동물상 카드까지. 사진과 생년월일은 이 기기 밖으로 나가지 않아요.</p>
          <p><strong className="text-navy">운은 얼굴에 입히세요.</strong> 날마다 어울리는 <a href={lucky} className="font-bold text-navy underline underline-offset-4">럭키 메이크업</a>을 골라 드려요. 내 셀카에 바로 입혀 볼 수 있어요.</p>
        </>
      )}
    </div>
  )
}

// ── 문구 ──
const KO = {
  kicker: 'Today’s fortune · 오늘의 운세',
  title1: '오늘의 운세', title2: '셀카나 생년월일, 하나만 넣어도 돼요',
  lead: '무료 · 로그인 없이. 오늘의 운과 한 줄 조언, 행운 색, 오늘 어울리는 럭키 메이크업까지 알려 드려요.',
  savedOpen: '지난번 결과로 오늘의 운세 바로 보기',
  photoTitle: '셀카', photoSub: '정면 한 장', camera: '셀카 찍기', gallery: '사진 고르기', change: '다른 사진으로',
  photoTip: '정면 · 앞머리 넘기기 · 무표정 · 고른 조명이면 동물상이 더 정확해요.',
  birthTitle: '생년월일', orLabel: '또는', birthSub: '양력 기준. 셀카 없이 생년월일만 넣어도 돼요.', year: '년', month: '월', day: '일',
  go: '오늘의 운세 보기',
  privacy: '사진과 생년월일은 이 기기 밖으로 나가지 않아요.', fun: '관상·사주는 재미로 보는 전통이에요. 사람을 평가하지 않아요.',
  needOne: '셀카나 생년월일 중 하나는 넣어 주세요.', badBirth: '생년월일을 다시 확인해 주세요.', birthOnly: '생년월일로만 볼게요.',
  reading: '오늘의 운을 읽는 중…', readingSub: '얼굴과 오늘의 일진을 맞춰 보고 있어요',
  todayKicker: (k: string) => `오늘의 운세 · ${k}`,
  luckyColor: '오늘의 행운 색', myFace: '나의 동물상', myLuck: '요즘 가장 강한 운',
  top3: '요즘 강한 운 3',
  recWhy: (b: boolean, f: boolean): string => f && b ? '얼굴과 생년월일로 본 결과예요.' : f ? '얼굴로 본 결과예요. 생년월일을 넣으면 사주도 함께 봐요.' : '생년월일로 본 결과예요. 셀카를 넣으면 동물상도 나와요.',
  luckyKicker: '오늘의 럭키 메이크업', luckyCta: '내 얼굴에 입혀 보기', luckyCtaPhoto: '이 셀카로 입혀 보기',
  luckyNote: '럭키 메이크업 — 가입하면 1장 무료 · 5장 $2.99 · 9가지 운 전부 $4.99',
  luckyOther: '다른 운 메이크업 고르기 →',
  cardAlt: '나의 운세 카드', saveCard: '카드 저장', shareLink: '친구에게 카드 보내기', copied: '링크를 복사했어요',
  shareKicker: '무료 · 공유', cardTitle: '나의 운세 카드', animalTitle: (n: string, p: number) => `나는 ${n} ${p}%`,
  pcTitle: '나의 동물상 포토카드', flip: '누르면 뒷면', savePc: '포카 저장',
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
  kicker: 'Today’s fortune · K-face reading',
  title1: 'Today’s Fortune', title2: 'A selfie or your birth date — either works',
  lead: 'Free, no log-in. Today’s luck, a one-line tip, your lucky colour and the lucky makeup that suits today.',
  savedOpen: 'See today’s fortune from my last result',
  photoTitle: 'Selfie', photoSub: 'front-facing', camera: 'Take a selfie', gallery: 'Choose a photo', change: 'Use another photo',
  photoTip: 'Front-facing, hair off the forehead, neutral expression, even light.',
  birthTitle: 'Birth date', orLabel: 'or', birthSub: 'Solar calendar. A birth date alone is fine too.', year: 'Year', month: 'Month', day: 'Day',
  go: 'See today’s fortune',
  privacy: 'Your photo and birth date never leave this device.', fun: 'Face reading is a tradition to enjoy for fun — it never judges anyone.',
  needOne: 'Add a selfie or your birth date.', badBirth: 'Please check your birth date.', birthOnly: 'We’ll use your birth date only.',
  reading: 'Reading today’s luck…', readingSub: 'Matching your face with today’s day pillar',
  todayKicker: (k: string) => `Today’s fortune · ${k}`,
  luckyColor: 'Lucky colour', myFace: 'My animal face', myLuck: 'Strongest luck now',
  top3: 'Your top 3 lucks right now',
  recWhy: (b: boolean, f: boolean) => f && b ? 'From your face and birth date.' : f ? 'From your face. Add a birth date to include saju.' : 'From your birth date. Add a selfie to find your animal face.',
  luckyKicker: 'Today’s lucky makeup', luckyCta: 'Try it on my face', luckyCtaPhoto: 'Try it on this selfie',
  luckyNote: 'Lucky makeup — 1 look free with sign-up · 5 looks $2.99 · all 9 $4.99',
  luckyOther: 'Pick another luck →',
  cardAlt: 'My fortune card', saveCard: 'Save card', shareLink: 'Send my card to friends', copied: 'Link copied',
  shareKicker: 'Free · share', cardTitle: 'My fortune card', animalTitle: (n: string, p: number) => `I’m a ${n} face · ${p}%`,
  pcTitle: 'My animal-face photocard', flip: 'Tap to flip', savePc: 'Save photocard',
  sajuKicker: 'MY SAJU · FIVE ELEMENTS', pHour: 'Hour', pDay: 'Day', pMonth: 'Month', pYear: 'Year',
  sajuNote: (dm: string, lack: string) => `Your Day Master element is ${dm}. Your weakest element is ${lack} — we add it back as a makeup accent.`,
  sajuLimit: 'A simplified reading (solar calendar, average seasonal dates).',
  again: 'Start over', added: 'Added to your dex', already: 'Already in your dex', secretGot: 'Secret badge “Golden Gumiho” unlocked!',
  err: {
    'no-face': 'No face found. Try a brighter, front-facing photo.', 'many-faces': 'More than one face. Use a photo of just you.',
    tilted: 'Your head is turned. Try a front-facing photo.', 'load-failed': 'Couldn’t load the face tool. Check your connection.',
    'bad-file': 'We couldn’t open that photo. Please use a JPG or PNG.',
  },
}
