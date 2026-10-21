// 관상·사주 메이크업 — /tools/fortune-makeup/ · /en/tools/fortune-makeup/ (2026-10-21)
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
import { computeSaju, isValidBirth, pillarHanja, ELEMENTS, BRANCHES_KO, type BirthInput, type Element } from '../lib/fortune/saju'
import { readFortunes } from '../lib/fortune/reading'
import { FORTUNE_LOOKS, fortuneLookById, ELEMENT_ACCENT, type FortuneLookId } from '../lib/fortune/looks'
import { ANIMALS, SECRET_BADGE, badgeSrc, whyAnimal } from '../lib/fortune/animals'
import { saveLast, loadLast, loadDex, addToDex, hasSecret, encodeShare, decodeShare, serialOf, type FortuneResult, type SharedCard } from '../lib/fortune/state'
import { renderResultCard, renderPhotocardFront, renderPhotocardBack, OBANG, type CardData } from '../lib/fortune/card'
import { generateFortuneMakeup, newJobId, keepPendingLook, takePendingLook, type GenError } from '../lib/fortune/generate'
import { getFreeStatus, type FreeStatus, type PayChoice } from '../lib/freeStatus'
import { dailyFortune } from '../lib/fortune/daily'
import { loadReading, requestReading, type PreciseReading, type ReadingError } from '../lib/fortune/readingApi'
import { savePendingSelfieFromSrc, takePendingSelfie, keepPendingSelfie, clearPendingSelfie } from '../lib/makeup/pendingSelfie'
import { supabase } from '../lib/supabase'

type Phase = 'intro' | 'busy' | 'result' | 'shared'
const ELEM_KO: Record<Element, string> = { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' }
const ELEM_EN: Record<Element, string> = { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' }
const lookImg = (id: FortuneLookId) => `/fortune/looks/${id}-after.webp`

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
  const base = isEn ? '/en/tools/fortune-makeup/' : '/tools/fortune-makeup/'
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
  const [gen, setGen] = useState<{ k: 'idle' } | { k: 'busy' } | { k: 'done'; image: string; tier: 'free' | 'credit'; balance?: number; freeLeft?: number } | { k: 'error'; e: GenError }>({ k: 'idle' })
  const [free, setFree] = useState<FreeStatus | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  // 도감·시크릿은 이 기기 저장소에서(입력 화면엔 안 그려지므로 서버 렌더와 어긋나지 않는다)
  const [dex, setDex] = useState<AnimalId[]>(() => (typeof window === 'undefined' ? [] : loadDex().map((e) => e.id)))
  const [secret, setSecret] = useState(() => typeof window !== 'undefined' && hasSecret())
  const [toast, setToast] = useState<string | null>(null)
  // 다시 온 사람 — 저장된 결과로 '오늘의 관상 메이크업 운'을 맨 위에 보여 준다
  const [saved, setSaved] = useState<FortuneResult | null>(null)
  const jobRef = useRef('')
  const ctaRef = useRef<HTMLDivElement>(null)

  const T = isEn ? EN : KO

  // ── 진입: 공유 링크 / 로그인 복귀 ──
  // 미리 렌더한(prerender) 페이지라 주소(?c= · ?resume=)는 브라우저에서만 읽을 수 있다 → 마운트 때 한 번 상태를 정한다.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const q = new URLSearchParams(window.location.search)
    const sc = decodeShare(q.get('c'))
    if (sc) { setShared(sc); setPhase('shared'); trackEvent('fortune_shared_view', { animal: sc.animal ?? 'none' }); return }
    const last0 = loadLast()
    if (last0 && q.get('resume') !== '1') { setSaved(last0); trackEvent('fortune_daily_view', { from: 'intro' }) }
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
    setResult(res); saveLast(res); setLook(res.scores[0].id)
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
    const url = `${window.location.origin}${base}?c=${encodeShare(result)}`
    const text = isEn ? 'My face-reading fortune card — what animal face are you?' : '내 관상 카드 — 너는 무슨 상이야?'
    try {
      if (navigator.share) { await navigator.share({ title: 'kissinskin', text, url }); trackEvent('fortune_share', { via: 'native' }); return }
    } catch { return }
    try { await navigator.clipboard.writeText(url); flash(T.copied); trackEvent('fortune_share', { via: 'copy' }) } catch { /* noop */ }
  }

  const reset = () => { setPhase('intro'); setResult(null); setGen({ k: 'idle' }); setCard(null); setPc(null); clearPendingSelfie(); setPhoto(null); window.scrollTo({ top: 0 }) }

  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="font-display bg-[#f6eedc] min-h-screen text-[#1b1b1f]">
      <ToolsNav />
      <main className="max-w-xl mx-auto px-4 pb-20">
        {toast && <div role="status" className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-[#1b1b1f] px-5 py-2.5 text-sm font-bold text-[#f6eedc] shadow-lg">{toast}</div>}

        {phase === 'intro' && (
          <section className="pt-8">
            {saved && <DailyCard r={saved} isEn={isEn} onOpen={() => { setResult(saved); setLook(saved.scores[0].id); setPhase('result'); window.scrollTo({ top: 0 }) }} onTry={(id) => { setResult(saved); setLook(id); setPhase('result'); setTimeout(() => ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300) }} />}
            <p className="text-[11px] font-black tracking-[0.25em] text-[#d6402f]">{T.kicker}</p>
            <h1 className="mt-2 text-[40px] leading-[1.05] font-black tracking-tight">{T.title1}<br /><span className="text-[#d6402f]">{T.title2}</span></h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#1b1b1f]/80">{T.lead}</p>

            {/* 관상 메이크업 9종 미리보기 띠 */}
            <div className="mt-5 -mx-4 overflow-x-auto px-4 pb-1">
              <div className="flex gap-2 w-max">
                {FORTUNE_LOOKS.map((l) => (
                  <figure key={l.id} className="w-[92px] shrink-0">
                    <div className="aspect-[2/3] overflow-hidden rounded-xl border-2 border-[#1b1b1f]">
                      <img src={lookImg(l.id)} alt={isEn ? `${l.fortuneEn} face-reading makeup` : `${l.nameKo}`} loading="lazy" className="h-full w-full object-cover object-[50%_22%]" />
                    </div>
                    <figcaption className="mt-1 text-center text-[11px] font-bold">{l.emoji} {isEn ? l.fortuneEn : l.fortuneKo}</figcaption>
                  </figure>
                ))}
              </div>
            </div>

            {/* 입력 카드 */}
            <div className="mt-6 rounded-3xl border-[3px] border-[#1b1b1f] bg-white p-5 shadow-[6px_6px_0_#1b1b1f]">
              <p className="text-sm font-black">① {T.photoTitle} <span className="font-medium text-[#1b1b1f]/60">{T.photoSub}</span></p>
              {photo ? (
                <div className="mt-3 flex items-center gap-3">
                  <img src={photo} alt="" className="h-20 w-20 rounded-2xl object-cover border-2 border-[#1b1b1f]" />
                  <button type="button" onClick={() => { setPhoto(null); clearPendingSelfie() }} className="text-sm font-bold underline underline-offset-2">{T.change}</button>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => choosePhoto('camera')} className="rounded-2xl border-2 border-[#1b1b1f] bg-[#f2b632] py-3 text-sm font-black">📷 {T.camera}</button>
                  <button type="button" onClick={() => choosePhoto('gallery')} className="rounded-2xl border-2 border-[#1b1b1f] bg-white py-3 text-sm font-black">🖼️ {T.gallery}</button>
                </div>
              )}
              <p className="mt-2 text-[11px] text-[#1b1b1f]/60">{T.photoTip}</p>

              <p className="mt-5 text-sm font-black">② {T.birthTitle} <span className="font-medium text-[#1b1b1f]/60">{T.birthSub}</span></p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Select label={T.year} value={birth.y} onChange={(v) => setBirth({ ...birth, y: v })} options={Array.from({ length: 76 }, (_, i) => String(2015 - i))} />
                <Select label={T.month} value={birth.m} onChange={(v) => setBirth({ ...birth, m: v })} options={Array.from({ length: 12 }, (_, i) => String(i + 1))} />
                <Select label={T.day} value={birth.d} onChange={(v) => setBirth({ ...birth, d: v })} options={Array.from({ length: 31 }, (_, i) => String(i + 1))} />
              </div>
              <div className="mt-2">
                <Select label={T.hour} value={birth.h} onChange={(v) => setBirth({ ...birth, h: v })}
                  options={Array.from({ length: 12 }, (_, i) => String(i === 0 ? 0 : i * 2 - 1))}
                  render={(v) => { const b = Math.floor(((+v + 1) % 24) / 2); return isEn ? `${BRANCHES_KO[b]} hour (${String((b * 2 + 23) % 24).padStart(2, '0')}–${String((b * 2 + 1) % 24).padStart(2, '0')})` : `${BRANCHES_KO[b]}시 (${String((b * 2 + 23) % 24).padStart(2, '0')}~${String((b * 2 + 1) % 24).padStart(2, '0')}시)` }}
                  emptyLabel={T.hourUnknown} />
              </div>
              <p className="mt-2 text-[11px] text-[#1b1b1f]/60">{T.birthTip}</p>

              {err && <p className="mt-4 rounded-xl bg-[#d6402f]/10 px-3 py-2 text-sm font-bold text-[#d6402f]">{err}</p>}
              <button type="button" onClick={run} className="mt-5 w-full rounded-2xl bg-[#1b1b1f] py-4 text-base font-black text-[#f6eedc] shadow-[4px_4px_0_#d6402f]">{T.go}</button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-[#1b1b1f]/60">🔒 {T.privacy}<br />{T.fun}</p>
            </div>

            <IntroSeo isEn={isEn} />
          </section>
        )}

        {phase === 'busy' && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <img src={badgeSrc('fox')} alt="" className="h-24 w-24 animate-spin [animation-duration:2.4s]" />
            <p className="text-lg font-black">{T.reading}</p>
            <p className="text-sm text-[#1b1b1f]/60">{T.readingSub}</p>
          </div>
        )}

        {phase === 'shared' && shared && <SharedView s={shared} isEn={isEn} base={base} dex={dex} onAdd={(id) => {
          const d = addToDex(id, 'friend'); setDex(d.dex.map((e) => e.id))
          if (d.secretUnlocked) { setSecret(true); flash(T.secretGot) } else flash(d.added ? T.added : T.already)
          trackEvent('fortune_dex_add', { animal: id, added: d.added })
        }} />}

        {phase === 'result' && result && (
          <section className="pt-6">
            {/* 결과 카드 */}
            <div className="mx-auto w-full max-w-[360px]">
              {card ? <img src={card} alt={T.cardAlt} className="w-full rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,.18)]" />
                : <div className="aspect-[9/16] w-full animate-pulse rounded-2xl bg-[#efe4cc]" />}
            </div>
            <div className="mx-auto mt-3 grid max-w-[360px] grid-cols-2 gap-2">
              <button type="button" disabled={!card} onClick={() => { if (card) { saveOrShare(card, 'kissinskin-fortune-card.jpg', isEn); trackEvent('fortune_card_save', { kind: gen.k === 'done' ? 'applied' : 'result' }) } }} className="rounded-2xl border-2 border-[#1b1b1f] bg-[#f2b632] py-3 text-sm font-black">⬇️ {T.saveCard}</button>
              <button type="button" onClick={shareLink} className="rounded-2xl border-2 border-[#1b1b1f] bg-white py-3 text-sm font-black">🔗 {T.shareLink}</button>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#1b1b1f]/55">{T.fun}</p>

            <div className="mt-6"><DailyCard r={result} isEn={isEn} onTry={(id) => { setLook(id); setGen({ k: 'idle' }); jobRef.current = ''; ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }} /></div>

            {/* 처방 → 메이크업 생성 */}
            <div ref={ctaRef} className="mt-7 rounded-3xl border-[3px] border-[#1b1b1f] bg-[#1b1b1f] p-5 text-[#f6eedc]">
              <p className="text-[11px] font-black tracking-[0.2em] text-[#f2b632]">{T.rxKicker}</p>
              <div className="mt-3 flex gap-4">
                <img src={gen.k === 'done' ? gen.image : lookImg(look)} alt="" className="h-36 w-24 shrink-0 rounded-xl object-cover object-[50%_22%] border-2 border-[#f6eedc]" />
                <div className="min-w-0">
                  <p className="text-xl font-black leading-tight">{fortuneLookById(look).emoji} {isEn ? `${fortuneLookById(look).fortuneEn} face-reading makeup` : fortuneLookById(look).nameKo}</p>
                  <p className="mt-1 text-[13px] leading-snug text-[#f6eedc]/85">{isEn ? fortuneLookById(look).descEn : fortuneLookById(look).descKo}</p>
                  <p className="mt-1.5 text-[11px] text-[#f6eedc]/60">{isEn ? fortuneLookById(look).palaceEn : fortuneLookById(look).palaceKo}</p>
                  {result.lacking && <p className="mt-1 text-[11px] font-bold text-[#f2b632]">+ {isEn ? ELEMENT_ACCENT[result.lacking].en : ELEMENT_ACCENT[result.lacking].ko}</p>}
                </div>
              </div>
              <GenerateBox T={T} hasPhoto={!!photo} loggedIn={loggedIn} free={free} gen={gen}
                onGenerate={generate} onPhoto={() => choosePhoto('gallery')} look={look} />
              <p className="mt-3 text-[11px] text-[#f6eedc]/55">{T.aiNote}</p>
            </div>

            {gen.k === 'done' && (
              <div id="fortune-done" className="mt-6 rounded-3xl border-[3px] border-[#1b1b1f] bg-white p-5">
                <p className="text-sm font-black">✨ {T.doneTitle}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <figure><img src={photo ?? ''} alt="" className="aspect-[3/4] w-full rounded-xl object-cover" /><figcaption className="mt-1 text-center text-[11px] font-bold">{T.before}</figcaption></figure>
                  <figure><img src={gen.image} alt="" className="aspect-[3/4] w-full rounded-xl object-cover" /><figcaption className="mt-1 text-center text-[11px] font-bold">{T.after}</figcaption></figure>
                </div>
                <p className="mt-3 text-center text-[12px] font-bold text-[#1b1b1f]/70">
                  {gen.tier === 'free' ? T.usedFree : T.usedCredit}
                  {typeof gen.balance === 'number' && ` · ${isEn ? `${gen.balance} credits left` : `크레딧 ${gen.balance}개 남음`}`}
                  {typeof gen.freeLeft === 'number' && ` · ${isEn ? `${gen.freeLeft} free pass left` : `무료권 ${gen.freeLeft}장 남음`}`}
                </p>
                <p className="mt-1 text-center text-[11px] text-[#1b1b1f]/55">{T.cardUpdated}</p>
              </div>
            )}

            {/* 관상 포카 */}
            {pc && (
              <div className="mt-8 text-center">
                <p className="text-[11px] font-black tracking-[0.2em] text-[#d6402f]">{T.pcKicker}</p>
                <h2 className="mt-1 text-2xl font-black">{T.pcTitle}</h2>
                <button type="button" onClick={() => setPcSide(pcSide === 'front' ? 'back' : 'front')} className="mx-auto mt-4 block w-[260px] [perspective:1200px]" aria-label={T.flip}>
                  <img src={pcSide === 'front' ? pc.front : pc.back} alt={T.pcTitle} className="w-full rounded-[18px] shadow-[0_18px_40px_rgba(0,0,0,.2)]" />
                </button>
                <p className="mt-2 text-[11px] text-[#1b1b1f]/55">{T.flip}</p>
                <button type="button" onClick={() => { saveOrShare(pcSide === 'front' ? pc.front : pc.back, `kissinskin-face-card-${pcSide}.jpg`, isEn); trackEvent('fortune_pc_save', { side: pcSide }) }} className="mt-3 rounded-2xl border-2 border-[#1b1b1f] bg-white px-6 py-2.5 text-sm font-black">⬇️ {T.savePc}</button>
              </div>
            )}

            {/* 동물상 */}
            {result.animals?.[0] && (
              <div className="mt-8 rounded-3xl border-[3px] border-[#1b1b1f] bg-white p-5">
                <div className="flex items-center gap-4">
                  <img src={badgeSrc(result.animals[0].id)} alt="" className="h-24 w-24 shrink-0" />
                  <div>
                    <p className="text-[11px] font-black tracking-[0.2em] text-[#d6402f]">{T.animalKicker}</p>
                    <h2 className="text-3xl font-black">{isEn ? ANIMALS[result.animals[0].id].en : ANIMALS[result.animals[0].id].ko} <span className="text-lg">{result.animals[0].pct}%</span></h2>
                    {result.axes && <p className="text-[12px] font-bold text-[#1b1b1f]/60">{whyAnimal(result.axes.x, result.axes.y, isEn)}</p>}
                  </div>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed">{isEn ? ANIMALS[result.animals[0].id].descEn : ANIMALS[result.animals[0].id].descKo}</p>
                <p className="mt-2 text-[12px] text-[#1b1b1f]/60">🎨 {isEn ? ANIMALS[result.animals[0].id].symbolEn : ANIMALS[result.animals[0].id].symbolKo}</p>
                <div className="mt-4 space-y-1.5">
                  {result.animals.slice(0, 3).map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-[12px] font-bold">
                      <span className="w-20 shrink-0">{isEn ? ANIMALS[a.id].en : ANIMALS[a.id].ko}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#1b1b1f]/10"><span className="block h-full rounded-full" style={{ width: `${a.pct}%`, background: ANIMALS[a.id].color }} /></span>
                      <span className="w-9 text-right">{a.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 운 9가지 */}
            <div className="mt-8">
              <p className="text-[11px] font-black tracking-[0.2em] text-[#d6402f]">{T.fortunesKicker}</p>
              <h2 className="text-2xl font-black">{T.fortunesTitle}</h2>
              <div className="mt-4 space-y-3">
                {result.scores.map((s, i) => {
                  const l = fortuneLookById(s.id)
                  return (
                    <div key={s.id} className={`rounded-2xl border-2 border-[#1b1b1f] p-4 ${i < 3 ? 'bg-[#fff7df]' : 'bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{l.emoji}</span>
                        <span className="flex-1 font-black">{isEn ? l.fortuneEn : l.fortuneKo}{i < 3 && <span className="ml-1.5 rounded-full bg-[#d6402f] px-2 py-0.5 text-[10px] text-white">TOP {i + 1}</span>}</span>
                        <span className="text-xl font-black">{s.score}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1b1b1f]/10"><div className="h-full rounded-full" style={{ width: `${s.score}%`, background: i === 0 ? '#d6402f' : l.accent }} /></div>
                      {(s.faceKo || s.sajuKo) && (
                        <ul className="mt-2 space-y-0.5 text-[12.5px] leading-snug text-[#1b1b1f]/80">
                          {s.faceKo && <li>👁 {isEn ? s.faceEn : s.faceKo}</li>}
                          {s.sajuKo && <li>☯ {isEn ? s.sajuEn : s.sajuKo}</li>}
                        </ul>
                      )}
                      <button type="button" onClick={() => { setLook(s.id); setGen({ k: 'idle' }); jobRef.current = ''; ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}
                        className="mt-2 text-[12px] font-black text-[#d6402f] underline underline-offset-2">{T.tryLook(isEn ? l.fortuneEn : l.fortuneKo)}</button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 사주 */}
            {result.birth && result.counts && (
              <div className="mt-8 rounded-3xl border-[3px] border-[#1b1b1f] bg-white p-5">
                <p className="text-[11px] font-black tracking-[0.2em] text-[#d6402f]">{T.sajuKicker}</p>
                {(() => {
                  const s = computeSaju(result.birth!)
                  const cols = [[T.pHour, s.hour], [T.pDay, s.day], [T.pMonth, s.month], [T.pYear, s.year]] as const
                  return (
                    <>
                      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                        {cols.map(([label, p]) => (
                          <div key={label} className="rounded-xl border-2 border-[#1b1b1f] py-2">
                            <p className="text-[10px] font-bold text-[#1b1b1f]/60">{label}</p>
                            <p className="mt-0.5 text-2xl" style={{ fontFamily: "'Song Myung', serif" }}>{p ? pillarHanja(p) : '—'}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 space-y-1.5">
                        {ELEMENTS.map((e) => (
                          <div key={e} className="flex items-center gap-2 text-[12px] font-bold">
                            <span className="w-16 shrink-0">{isEn ? ELEM_EN[e] : ELEM_KO[e]}</span>
                            <span className="h-3 flex-1 overflow-hidden rounded-full bg-[#1b1b1f]/10"><span className="block h-full rounded-full border border-[#1b1b1f]/30" style={{ width: `${(result.counts![e] / 8) * 100}%`, background: OBANG[e] }} /></span>
                            <span className="w-14 text-right">{result.counts![e]}{e === result.lacking ? (isEn ? ' · low' : ' · 부족') : ''}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-[13px] leading-relaxed">{T.sajuNote(isEn ? ELEM_EN[s.dayMaster] : ELEM_KO[s.dayMaster], isEn ? ELEM_EN[s.lacking] : ELEM_KO[s.lacking])}</p>
                      <p className="mt-1 text-[11px] text-[#1b1b1f]/55">{T.sajuLimit}</p>
                    </>
                  )
                })()}
              </div>
            )}

            {/* 정밀 풀이 — 무료 도구 무료권 또는 1크레딧 */}
            <PreciseBox r={result} isEn={isEn} loggedIn={loggedIn} free={free}
              onLogin={() => { saveLast(result); window.location.href = '/auth?next=' + encodeURIComponent(base + '?resume=1') }}
              onPaid={() => getFreeStatus().then(setFree)} />

            {/* 도감 */}
            <DexBox isEn={isEn} dex={dex} secret={secret} onShare={shareLink} />

            <button type="button" onClick={reset} className="mt-8 w-full rounded-2xl border-2 border-[#1b1b1f] bg-white py-3 text-sm font-black">↺ {T.again}</button>
          </section>
        )}
      </main>
      <ToolsFooter />
    </div>
  )
}

// ── 작은 부품들 ──
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

function DailyCard({ r, isEn, onOpen, onTry }: { r: FortuneResult; isEn: boolean; onOpen?: () => void; onTry: (id: FortuneLookId) => void }) {
  const d = dailyFortune(r)
  const l = fortuneLookById(d.look)
  return (
    <div className="mb-6 rounded-3xl border-[3px] border-[#1b1b1f] bg-[#fff7df] p-5 shadow-[6px_6px_0_#1b1b1f]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black tracking-[0.2em] text-[#d6402f]">{isEn ? `TODAY · ${d.dateKey}` : `오늘의 관상 메이크업 운 · ${d.dateKey}`}</p>
        <span className="text-xl" style={{ fontFamily: "'Song Myung', serif" }}>{d.dayPillarHanja}日</span>
      </div>
      <p className="mt-2 text-xl font-black">{isEn ? d.themeEn : d.themeKo} <span className="text-[#f2b632]">{'★'.repeat(d.stars)}<span className="text-[#1b1b1f]/15">{'★'.repeat(5 - d.stars)}</span></span></p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed">{isEn ? d.tipEn : d.tipKo}</p>
      <div className="mt-3 flex items-center gap-3">
        <img src={`/fortune/looks/${l.id}-after.webp`} alt="" className="h-20 w-14 shrink-0 rounded-lg border-2 border-[#1b1b1f] object-cover object-[50%_22%]" />
        <div className="min-w-0 text-[12.5px]">
          <p className="font-black">{isEn ? `Today's look: ${l.fortuneEn} makeup` : `오늘의 룩: ${l.nameKo}`}</p>
          <p className="mt-0.5 flex items-center gap-1.5 font-bold"><span className="inline-block h-3.5 w-3.5 rounded-full border border-[#1b1b1f]" style={{ background: d.color.hex }} />{isEn ? `Lucky colour: ${d.color.en}` : `행운 색: ${d.color.ko}`}</p>
          <button type="button" onClick={() => onTry(l.id)} className="mt-1 font-black text-[#d6402f] underline underline-offset-2">{isEn ? 'Try it on my face →' : '내 얼굴에 입혀 보기 →'}</button>
        </div>
      </div>
      {onOpen && <button type="button" onClick={onOpen} className="mt-4 w-full rounded-2xl bg-[#1b1b1f] py-3 text-sm font-black text-[#f6eedc]">{isEn ? 'Open my result & card' : '내 결과·카드 다시 보기'}</button>}
      <p className="mt-2 text-center text-[11px] text-[#1b1b1f]/55">{isEn ? 'A new reading every day — free.' : '매일 바뀌어요 · 무료'}</p>
    </div>
  )
}

function Select({ label, value, onChange, options, render, emptyLabel }: { label: string; value: string; onChange: (v: string) => void; options: string[]; render?: (v: string) => string; emptyLabel?: string }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border-2 border-[#1b1b1f] bg-white px-3 py-2.5 text-sm font-bold">
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
  const btn = 'w-full rounded-2xl py-3.5 text-[15px] font-black'
  if (gen.k === 'busy') return <p className="mt-4 rounded-2xl bg-[#f6eedc]/10 py-4 text-center text-sm font-bold">⏳ {T.generating}</p>
  if (!hasPhoto) return <button type="button" onClick={onPhoto} className={`${btn} mt-4 bg-[#f2b632] text-[#1b1b1f]`}>📷 {T.needPhotoForMakeup}</button>
  if (loggedIn === false) return (
    <div className="mt-4">
      <button type="button" onClick={() => onGenerate()} className={`${btn} bg-[#d6402f] text-white`}>{T.loginToTry}</button>
      <p className="mt-1.5 text-center text-[11px] text-[#f6eedc]/60">{T.loginNote}</p>
    </div>
  )
  const freeLeft = free?.makeup.left ?? 0
  const credits = free?.balance ?? 0
  const err = gen.k === 'error' ? gen.e : undefined
  return (
    <div className="mt-4 space-y-2">
      {err && <p className="rounded-xl bg-[#d6402f]/20 px-3 py-2 text-[13px] font-bold">{T.genErr[err]}</p>}
      {err === 'topup' ? (
        <a href={`/analysis/?topup=1`} onClick={() => keepPendingLook(look)} className={`${btn} block bg-[#f2b632] text-center text-[#1b1b1f]`}>{T.topup}</a>
      ) : free && freeLeft > 0 && credits > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onGenerate('free')} className={`${btn} bg-[#d6402f] text-white`}>{T.useFree}</button>
          <button type="button" onClick={() => onGenerate('credit')} className={`${btn} bg-[#f2b632] text-[#1b1b1f]`}>{T.useCredit}</button>
        </div>
      ) : (
        <button type="button" onClick={() => onGenerate(free ? (freeLeft > 0 ? 'free' : 'credit') : undefined)} className={`${btn} bg-[#d6402f] text-white`}>
          {free && freeLeft > 0 ? T.tryFree : T.tryCredit}
        </button>
      )}
      {free && <p className="text-center text-[11px] text-[#f6eedc]/60">{T.counts(freeLeft, credits)}</p>}
    </div>
  )
}

function DexBox({ isEn, dex, secret, onShare }: { isEn: boolean; dex: AnimalId[]; secret: boolean; onShare: () => void }) {
  const ids: AnimalId[] = ['fox', 'cat', 'dog', 'rabbit', 'bear', 'deer', 'tiger', 'wolf', 'dino']
  return (
    <div className="mt-8 rounded-3xl border-[3px] border-[#1b1b1f] bg-[#fffaf0] p-5">
      <p className="text-[11px] font-black tracking-[0.2em] text-[#d6402f]">{isEn ? 'FACE DEX' : '관상 도감'}</p>
      <h2 className="text-2xl font-black">{isEn ? `Collected ${dex.length} / 9` : `${dex.length} / 9 모음`}</h2>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {ids.map((id) => {
          const own = dex.includes(id)
          return (
            <div key={id} className={`rounded-2xl border-2 p-2 text-center ${own ? 'border-[#1b1b1f] bg-white' : 'border-[#c9c2b4]'}`}>
              <img src={badgeSrc(id)} alt="" className={`mx-auto h-14 w-14 ${own ? '' : 'opacity-40 grayscale'}`} />
              <p className={`mt-1 text-[11px] font-bold ${own ? '' : 'text-[#9a948a]'}`}>{isEn ? ANIMALS[id].en : ANIMALS[id].ko}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-[#c9a227] bg-[#1b1b1f] p-3 text-[#f6eedc]">
        <img src={badgeSrc('secret-gumiho')} alt="" className={`h-14 w-14 ${secret ? '' : 'opacity-30 grayscale blur-[1px]'}`} />
        <div>
          <p className="text-[13px] font-black">{secret ? (isEn ? SECRET_BADGE.en : SECRET_BADGE.ko) : (isEn ? 'SECRET · ???' : '시크릿 · ???')}</p>
          <p className="text-[11px] text-[#f6eedc]/70">{secret ? (isEn ? SECRET_BADGE.descEn : SECRET_BADGE.descKo) : (isEn ? 'Complete all 9 to unlock the legend.' : '9종을 모두 모으면 전설의 배지가 열려요.')}</p>
        </div>
      </div>
      <button type="button" onClick={onShare} className="mt-3 w-full rounded-2xl bg-[#f2b632] py-3 text-sm font-black text-[#1b1b1f]">{isEn ? 'Send my card to friends → collect theirs' : '친구에게 내 카드 보내고 친구 상 모으기'}</button>
    </div>
  )
}

function SharedView({ s, isEn, base, dex, onAdd }: { s: SharedCard; isEn: boolean; base: string; dex: AnimalId[]; onAdd: (id: AnimalId) => void }) {
  const a = s.animal ? ANIMALS[s.animal] : null
  return (
    <section className="pt-8 text-center">
      <p className="text-[11px] font-black tracking-[0.25em] text-[#d6402f]">{isEn ? 'A FRIEND SENT YOU THEIR FACE CARD' : '친구가 관상 카드를 보냈어요'}</p>
      {a ? (
        <>
          <img src={badgeSrc(a.id)} alt="" className="mx-auto mt-4 h-40 w-40" />
          <h1 className="mt-2 text-4xl font-black">{isEn ? a.en : a.ko} <span className="text-xl">{s.animalPct}%</span></h1>
          <p className="mt-2 text-sm font-bold text-[#d6402f]">"{isEn ? a.quoteEn : a.quoteKo}"</p>
        </>
      ) : <h1 className="mt-4 text-3xl font-black">{isEn ? 'Their fortune' : '친구의 운'}</h1>}
      <div className="mx-auto mt-5 max-w-sm space-y-2 text-left">
        {s.top.map((t, i) => {
          const l = fortuneLookById(t.id)
          return (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl border-2 border-[#1b1b1f] bg-white px-4 py-3">
              <span className="text-lg">{l.emoji}</span><span className="flex-1 font-black">{isEn ? l.fortuneEn : l.fortuneKo}{i === 0 && ' 👑'}</span><span className="font-black">{t.score}</span>
            </div>
          )
        })}
      </div>
      {a && (
        <button type="button" onClick={() => onAdd(a.id)} disabled={dex.includes(a.id)} className="mt-5 rounded-2xl border-2 border-[#1b1b1f] bg-white px-6 py-3 text-sm font-black disabled:opacity-50">
          {dex.includes(a.id) ? (isEn ? '✓ Already in my dex' : '✓ 이미 내 도감에 있어요') : (isEn ? `+ Add ${a.en} to my dex` : `+ 내 도감에 ${a.ko} 추가`)}
        </button>
      )}
      <a href={base} className="mt-3 block rounded-2xl bg-[#1b1b1f] py-4 text-base font-black text-[#f6eedc] shadow-[4px_4px_0_#d6402f]">{isEn ? 'What’s my animal face? Try it free →' : '나는 무슨 상일까? 무료로 해보기 →'}</a>
      <p className="mt-3 text-[11px] text-[#1b1b1f]/55">{isEn ? 'For fun. Photos never leave your device.' : '재미로 보는 결과예요. 사진은 기기 밖으로 나가지 않아요.'}</p>
    </section>
  )
}

function IntroSeo({ isEn }: { isEn: boolean }) {
  return (
    <div className="mt-10 space-y-4 text-[14px] leading-relaxed text-[#1b1b1f]/85">
      <h2 className="text-xl font-black text-[#1b1b1f]">{isEn ? 'How it works' : '어떻게 보나요?'}</h2>
      {isEn ? (
        <>
          <p><strong>Face reading (gwansang)</strong> — We map 478 points on your face in your browser and read the "12 palaces" of Korean face reading: the nose for wealth, the under-eye for love, the forehead for career, and more. Your animal face comes from two axes: eye shape (soft ↔ sharp) and features (delicate ↔ bold).</p>
          <p><strong>Five elements (saju)</strong> — From your birth date we build your year, month and day pillars and count Wood, Fire, Earth, Metal and Water. The missing element becomes your accent colour.</p>
          <p><strong>Face-reading makeup</strong> — Each of the 9 fortunes has its own makeup that lights up the matching palace. Try your prescription on your own selfie with AI.</p>
        </>
      ) : (
        <>
          <p><strong>관상</strong> — 브라우저 안에서 얼굴의 478개 점을 찾아 관상 12궁을 읽어요. 코는 재물(재백궁), 눈 밑 애교살은 연애(남녀궁), 이마는 직업(관록궁)… 동물상은 <strong>눈매(순함 ↔ 날카로움)</strong>와 <strong>이목구비(섬세 ↔ 굵직)</strong> 두 축으로 정해요.</p>
          <p><strong>사주</strong> — 생년월일로 연·월·일주(태어난 시를 알면 시주까지)를 세우고 목·화·토·금·수 오행을 세요. 부족한 기운은 메이크업 포인트 색이 돼요.</p>
          <p><strong>관상 메이크업</strong> — 운 9가지마다 해당 궁을 살리는 메이크업이 있어요. 나의 처방을 AI로 내 셀카에 바로 입혀 볼 수 있어요.</p>
        </>
      )}
    </div>
  )
}

// ── 문구 ──
const KO = {
  kicker: 'KISSINSKIN · 관상 × 사주 × 메이크업',
  title1: '얼굴에 운을', title2: '그리다',
  lead: '셀카로 관상을, 생년월일로 사주를 읽고 — 나에게 필요한 운을 올리는 관상 메이크업을 처방해 드려요. 둘 중 하나만 넣어도 돼요.',
  photoTitle: '셀카', photoSub: '(관상 · 동물상)', camera: '셀카 찍기', gallery: '사진 고르기', change: '다른 사진으로',
  photoTip: '정면 · 앞머리 넘기기 · 무표정 · 고른 조명이면 더 정확해요.',
  birthTitle: '생년월일', birthSub: '(사주 · 오행)', year: '년', month: '월', day: '일', hour: '태어난 시', hourUnknown: '태어난 시 (몰라도 돼요)',
  birthTip: '양력 기준이에요. 절기 경계 날짜는 한 칸 다를 수 있어요.',
  go: '내 관상·사주 보기 →',
  privacy: '사진과 생년월일은 이 기기 밖으로 나가지 않아요.', fun: '재미로 보는 결과예요. 사람을 평가하지 않아요.',
  needOne: '셀카나 생년월일 중 하나는 넣어 주세요.', badBirth: '생년월일을 다시 확인해 주세요.', birthOnly: '생년월일로만 볼게요.',
  reading: '관상을 읽는 중…', readingSub: '얼굴 478개 점 · 오행 계산',
  cardAlt: '나의 관상 결과 카드', saveCard: '카드 저장', shareLink: '친구에게 보내기', copied: '링크를 복사했어요',
  rxKicker: '나의 처방 · 관상 메이크업',
  aiNote: 'AI가 내 사진에 입혀 보는 시뮬레이션이에요. 실제 화장 결과와 다를 수 있어요.',
  generating: '메이크업을 입히는 중… (최대 1분)',
  needPhotoForMakeup: '셀카를 올리고 내 얼굴에 입혀 보기',
  loginToTry: '로그인하고 내 얼굴에 입혀 보기', loginNote: '가입하면 무료권 2장 — 메이크업 1장을 무료로 입혀 볼 수 있어요.',
  useFree: '무료권으로', useCredit: '크레딧 1개로', tryFree: '무료권으로 내 얼굴에 입혀 보기', tryCredit: '크레딧 1개로 내 얼굴에 입혀 보기',
  counts: (f: number, c: number) => `남은 무료권 ${f}장 · 크레딧 ${c}개`,
  topup: '크레딧 충전하기',
  genErr: {
    login: '로그인이 필요해요.', topup: '크레딧이 부족해요. 충전하면 바로 이어서 만들 수 있어요.', free_used: '무료권을 이미 사용했어요. 크레딧으로 만들 수 있어요.',
    choose: '무료권과 크레딧 중 무엇을 쓸지 골라 주세요.', unavailable: '잠시 후 다시 시도해 주세요.', retry: '생성에 실패했어요. 다시 누르면 추가 차감 없이 다시 만들어요.',
  } as Record<GenError, string>,
  doneTitle: '나의 관상 메이크업 완성', before: '비포', after: '애프터', usedFree: '무료권 1장 사용', usedCredit: '크레딧 1개 사용',
  cardUpdated: '위 결과 카드와 아래 포카에도 메이크업 사진이 들어갔어요.',
  pcKicker: '굿즈 · 관상 포카', pcTitle: '나의 관상 포토카드', flip: '카드를 누르면 뒷면(관상 도감)이 보여요', savePc: '이 면 저장',
  animalKicker: '나의 동물상', fortunesKicker: '관상 + 사주', fortunesTitle: '나의 운 9가지',
  tryLook: (n: string) => `${n} 메이크업 입혀 보기 →`,
  sajuKicker: '나의 사주 · 오행', pHour: '시주', pDay: '일주', pMonth: '월주', pYear: '연주',
  sajuNote: (dm: string, lack: string) => `나를 나타내는 기운(일간)은 ${dm}. 가장 부족한 기운은 ${lack} — 메이크업 포인트 색으로 채워 드려요.`,
  sajuLimit: '간이 사주예요(양력·절기 평균 날짜). 정밀 풀이는 곧 열려요.',
  again: '처음부터 다시', added: '도감에 추가했어요!', already: '이미 도감에 있어요', secretGot: '🎉 시크릿 배지 「황금 구미호」 획득!',
  err: {
    'no-face': '얼굴을 찾지 못했어요. 더 밝은 정면 사진으로 해 주세요.', 'many-faces': '얼굴이 둘 이상 있어요. 혼자 나온 사진으로 해 주세요.',
    tilted: '고개가 돌아가 있어요. 정면 사진으로 다시 해 주세요.', 'load-failed': '측정 도구를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.',
    'bad-file': '사진을 열 수 없어요. JPG나 PNG로 해 주세요.',
  } as Record<FaceScanError | 'bad-file', string>,
}
const EN: typeof KO = {
  kicker: 'KISSINSKIN · FACE READING × FIVE ELEMENTS × MAKEUP',
  title1: 'Paint your fortune', title2: 'on your face',
  lead: 'We read your face from a selfie and your five elements from your birth date — then prescribe the face-reading makeup that boosts the luck you need. Either one is enough.',
  photoTitle: 'Selfie', photoSub: '(face reading · animal face)', camera: 'Take a selfie', gallery: 'Choose a photo', change: 'Use another photo',
  photoTip: 'Front-facing, hair off the forehead, neutral expression, even light.',
  birthTitle: 'Birth date', birthSub: '(saju · five elements)', year: 'Year', month: 'Month', day: 'Day', hour: 'Birth hour', hourUnknown: 'Birth hour (optional)',
  birthTip: 'Solar calendar. Dates right on a seasonal boundary may shift by one pillar.',
  go: 'Read my face & fortune →',
  privacy: 'Your photo and birth date never leave this device.', fun: 'Just for fun — it never judges anyone.',
  needOne: 'Add a selfie or your birth date.', badBirth: 'Please check your birth date.', birthOnly: 'We’ll read your birth date only.',
  reading: 'Reading your face…', readingSub: '478 face points · five elements',
  cardAlt: 'My face-reading result card', saveCard: 'Save card', shareLink: 'Send to friends', copied: 'Link copied',
  rxKicker: 'MY PRESCRIPTION · FACE-READING MAKEUP',
  aiNote: 'An AI simulation on your photo — real makeup may look different.',
  generating: 'Applying the makeup… (up to a minute)',
  needPhotoForMakeup: 'Add a selfie to try it on your face',
  loginToTry: 'Log in to try it on your face', loginNote: 'Sign up for 2 free passes — one makeup try is free.',
  useFree: 'Use free pass', useCredit: 'Use 1 credit', tryFree: 'Try it on my face — free pass', tryCredit: 'Try it on my face — 1 credit',
  counts: (f: number, c: number) => `Free pass ${f} · Credits ${c} left`,
  topup: 'Top up credits',
  genErr: {
    login: 'Please log in.', topup: 'Not enough credits — top up to continue.', free_used: 'Your free pass is used. You can use a credit.',
    choose: 'Choose a free pass or a credit.', unavailable: 'Please try again shortly.', retry: 'Generation failed. Tap again — no extra charge.',
  },
  doneTitle: 'Your face-reading makeup', before: 'Before', after: 'After', usedFree: '1 free pass used', usedCredit: '1 credit used',
  cardUpdated: 'Your result card and photocard now show the makeup photo.',
  pcKicker: 'COLLECTIBLE · FACE CARD', pcTitle: 'My face-reading photocard', flip: 'Tap the card to see the back (Face Dex)', savePc: 'Save this side',
  animalKicker: 'MY ANIMAL FACE', fortunesKicker: 'FACE READING + SAJU', fortunesTitle: 'My 9 fortunes',
  tryLook: (n: string) => `Try ${n} makeup →`,
  sajuKicker: 'MY SAJU · FIVE ELEMENTS', pHour: 'Hour', pDay: 'Day', pMonth: 'Month', pYear: 'Year',
  sajuNote: (dm: string, lack: string) => `Your Day Master element is ${dm}. Your weakest element is ${lack} — we add it back as a makeup accent.`,
  sajuLimit: 'A simplified reading (solar calendar, average seasonal dates). A full reading is coming soon.',
  again: 'Start over', added: 'Added to your dex!', already: 'Already in your dex', secretGot: '🎉 Secret badge “Golden Gumiho” unlocked!',
  err: {
    'no-face': 'We couldn’t find a face. Try a brighter, front-facing photo.', 'many-faces': 'More than one face — use a photo of just you.',
    tilted: 'Your head is turned. Face the camera and try again.', 'load-failed': 'The measuring tool didn’t load. Check your connection.',
    'bad-file': 'That file couldn’t be opened. Try a JPG or PNG.',
  },
}
