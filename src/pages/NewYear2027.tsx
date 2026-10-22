// 2027 신년 관상 메이크업 — /tools/2027-fortune/ · /en/tools/2027-fortune/ (2026-10-22)
// ────────────────────────────────────────────────────────────────────
// 운영자 10/22 결정(추천대로): ① 유료 = 오복 메이크업 5장(크레딧 5) ② 별도 페이지 ③ 1~2월 복주머니 팩.
// 흐름: 생년월일 → 무료 신년 부적 카드(기기 안 계산, 비용 0) → 저장·친구에게 보내기
//      → 오복 메이크업 5장(셀카 + 무료권/크레딧) → 5장 다 모으면 시크릿 '황금 구미호' + 오복 모아보기.
// 생년월일·셀카·결과는 이 기기 밖으로 나가지 않는다(생성 때 셀카만 생성 API 로 — 기존 AI 메이크업과 동일).
import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { pickImage, nativeSaveImage, isNativeApp } from '../lib/nativePicker'
import { trackEvent, trackToolComplete } from '../lib/analytics'
import { isValidBirth, type BirthInput } from '../lib/fortune/saju'
import { newYearCard, newYearAccentPrompt, encodeNy, decodeNy, groupOfTenGod, ONE_CHAR, YEAR_TYPES, BLESSING_TEXT, LUCKY, MONTH_THEME, zodiacLine, type NewYearCard } from '../lib/fortune/newyear'
import { renderNewYearCard, renderBlessingsBoard, GOAT_BADGE } from '../lib/fortune/newyearCard'
import { loadNy, saveNy, type NyState } from '../lib/fortune/newyearStore'
import { fortuneLookById, type FortuneLookId } from '../lib/fortune/looks'
import { loadLast, unlockSecret, hasSecret } from '../lib/fortune/state'
import { badgeSrc, SECRET_BADGE } from '../lib/fortune/animals'
import { generateFortuneMakeup, newJobId, type GenError } from '../lib/fortune/generate'
import { getFreeStatus, type FreeStatus, type PayChoice } from '../lib/freeStatus'
import { savePendingSelfieFromSrc, takePendingSelfie } from '../lib/makeup/pendingSelfie'
import { supabase } from '../lib/supabase'
import { withRef } from '../lib/referral'

type Phase = 'intro' | 'result' | 'shared'
const lookImg = (id: FortuneLookId) => `/fortune/looks/${id}-after.webp`
const RED = '#d6402f', INK = '#1b1b1f', CREAM = '#f6eedc'

async function saveOrShare(dataUrl: string, name: string, isEn: boolean) {
  if (isNativeApp()) { await nativeSaveImage(dataUrl); return }
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], name, { type: 'image/jpeg' })
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean }
    if (nav.canShare?.({ files: [file] })) { await nav.share({ files: [file], title: isEn ? 'My 2027 talisman' : '나의 2027 신년 부적' }); return }
  } catch { /* 공유 취소 등 → 다운로드로 */ }
  const a = document.createElement('a'); a.href = dataUrl; a.download = name; a.click()
}

export default function NewYear2027() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const base = isEn ? '/en/tools/2027-fortune/' : '/tools/2027-fortune/'
  const fortuneBase = isEn ? '/en/tools/fortune-makeup/' : '/tools/fortune-makeup/'
  const T = isEn ? EN : KO
  const [phase, setPhase] = useState<Phase>('intro')
  const [birth, setBirth] = useState({ y: '', m: '', d: '' })
  const [err, setErr] = useState<string | null>(null)
  const [st, setSt] = useState<NyState | null>(null)
  const [shared, setShared] = useState<ReturnType<typeof decodeNy>>(null)
  const [cardUrl, setCardUrl] = useState<string | null>(null)
  const [boardUrl, setBoardUrl] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2600) }

  const card: NewYearCard | null = useMemo(() => (st ? newYearCard(st.birth) : null), [st])

  // ── 진입: 공유 링크(?n=) / 저장된 결과 / 관상 페이지에서 넣은 생년월일 미리 채우기 ──
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const q = new URLSearchParams(window.location.search)
    const sc = decodeNy(q.get('n'))
    if (sc) { setShared(sc); setPhase('shared'); trackEvent('ny27_shared_view', { group: groupOfTenGod(sc.tenGod) }); return }
    let off = false
    loadNy().then((s) => {
      if (off) return
      if (s && isValidBirth(s.birth)) { setSt(s); setPhase('result'); trackEvent('ny27_return', { made: Object.values(s.items).filter((i) => i?.image).length }) }
      else {
        const lb = loadLast()?.birth
        if (lb) setBirth({ y: String(lb.year), m: String(lb.month), d: String(lb.day) })
      }
    })
    return () => { off = true }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // 카드 그리기
  useEffect(() => {
    if (!card) return
    let off = false
    renderNewYearCard(card, isEn).then((cv) => { if (!off) setCardUrl(cv.toDataURL('image/jpeg', 0.92)) }).catch(() => { /* 카드 실패해도 화면은 그대로 */ })
    return () => { off = true }
  }, [card, isEn])

  const images = useMemo(() => {
    const o: Partial<Record<FortuneLookId, string>> = {}
    for (const [k, v] of Object.entries(st?.items ?? {})) if (v?.image) o[k as FortuneLookId] = v.image
    return o
  }, [st])
  const madeCount = Object.keys(images).length

  useEffect(() => {
    if (!card || madeCount === 0) return
    let off = false
    renderBlessingsBoard(card, images, isEn).then((cv) => { if (!off) setBoardUrl(cv.toDataURL('image/jpeg', 0.9)) }).catch(() => {})
    return () => { off = true }
  }, [card, images, madeCount, isEn])

  const run = async () => {
    if (!birth.y || !birth.m || !birth.d) { setErr(T.needBirth); return }
    const b: BirthInput = { year: +birth.y, month: +birth.m, day: +birth.d }
    if (!isValidBirth(b)) { setErr(T.badBirth); return }
    setErr(null)
    const prev = await loadNy()
    // 같은 생년월일이면 이미 만든 오복 사진·셀카를 이어 쓴다
    const same = prev && prev.birth.year === b.year && prev.birth.month === b.month && prev.birth.day === b.day
    const next: NyState = same ? prev! : { birth: b, items: {}, updatedAt: Date.now() }
    await saveNy(next); setSt(next); setPhase('result'); window.scrollTo({ top: 0 })
    const c = newYearCard(b)
    trackToolComplete('2027-fortune', c.group)
    trackEvent('ny27_result', { group: c.group, char: ONE_CHAR[c.tenGod].hanja })
  }

  const shareLink = async () => {
    if (!card) return
    const url = withRef(`${window.location.origin}${base}?n=${encodeNy(card)}`)
    const text = isEn ? `My word for 2027 is ${ONE_CHAR[card.tenGod].hanja} — what’s yours?` : `내 2027 한 글자는 ${ONE_CHAR[card.tenGod].hanja} — 너는?`
    try {
      if (navigator.share) { await navigator.share({ title: 'kissinskin', text, url }); trackEvent('ny27_share', { via: 'native' }); return }
    } catch { return }
    try { await navigator.clipboard.writeText(url); flash(T.copied); trackEvent('ny27_share', { via: 'copy' }) } catch { /* noop */ }
  }

  const update = async (fn: (s: NyState) => NyState) => {
    setSt((cur) => {
      if (!cur) return cur
      const n = fn(cur); void saveNy(n); return n
    })
  }

  return (
    <div className="font-display min-h-screen text-[#1b1b1f]" style={{ background: CREAM }}>
      <ToolsNav />
      <main className="max-w-xl mx-auto px-4 pb-20">
        {toast && <div role="status" className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-[#1b1b1f] px-5 py-2.5 text-sm font-bold text-[#f6eedc] shadow-lg">{toast}</div>}

        {phase === 'intro' && (
          <section className="pt-8">
            <div className="relative overflow-hidden rounded-3xl border-[3px] border-[#1b1b1f] p-6 text-[#f6eedc] shadow-[6px_6px_0_#1b1b1f]" style={{ background: RED }}>
              <img src={GOAT_BADGE} alt={isEn ? 'Red Goat badge for 2027' : '2027 붉은 양 배지'} className="absolute -right-6 -top-4 h-36 w-36 rotate-12" />
              <p className="text-[11px] font-black tracking-[0.25em] text-[#f2b632]">{T.kicker}</p>
              <h1 className="mt-2 max-w-[78%] text-[38px] leading-[1.05] font-black tracking-tight">{T.title1}<br /><span className="text-[#f2b632]">{T.title2}</span></h1>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#f6eedc]/90">{T.lead}</p>
            </div>

            <div className="mt-6 rounded-3xl border-[3px] border-[#1b1b1f] bg-white p-5 shadow-[6px_6px_0_#1b1b1f]">
              <p className="text-sm font-black">{T.birthTitle} <span className="font-medium text-[#1b1b1f]/60">{T.birthSub}</span></p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Sel label={T.year} value={birth.y} onChange={(v) => setBirth({ ...birth, y: v })} options={Array.from({ length: 76 }, (_, i) => String(2015 - i))} />
                <Sel label={T.month} value={birth.m} onChange={(v) => setBirth({ ...birth, m: v })} options={Array.from({ length: 12 }, (_, i) => String(i + 1))} />
                <Sel label={T.day} value={birth.d} onChange={(v) => setBirth({ ...birth, d: v })} options={Array.from({ length: 31 }, (_, i) => String(i + 1))} />
              </div>
              <p className="mt-2 text-[11px] text-[#1b1b1f]/60">{T.birthTip}</p>
              {err && <p className="mt-4 rounded-xl bg-[#d6402f]/10 px-3 py-2 text-sm font-bold text-[#d6402f]">{err}</p>}
              <button type="button" onClick={run} className="mt-5 w-full rounded-2xl bg-[#1b1b1f] py-4 text-base font-black text-[#f6eedc] shadow-[4px_4px_0_#d6402f]">{T.go}</button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-[#1b1b1f]/60">🔒 {T.privacy}<br />{T.fun}</p>
            </div>

            <div className="mt-6 grid grid-cols-5 gap-1.5">
              {(['wealth', 'love', 'career', 'health', 'popularity'] as FortuneLookId[]).map((id) => (
                <figure key={id}>
                  <img src={lookImg(id)} alt={isEn ? `${BLESSING_TEXT[id].en} makeup` : `${BLESSING_TEXT[id].ko} 메이크업`} loading="lazy" className="aspect-[2/3] w-full rounded-xl border-2 border-[#1b1b1f] object-cover object-[50%_22%]" />
                  <figcaption className="mt-1 text-center text-[11px] font-black"><span style={{ fontFamily: "'Song Myung', serif" }}>{BLESSING_TEXT[id].hanja}</span> {isEn ? BLESSING_TEXT[id].en : BLESSING_TEXT[id].ko}</figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-2 text-center text-[12px] font-bold text-[#1b1b1f]/70">{T.fiveTeaser}</p>

            <IntroSeo isEn={isEn} />
          </section>
        )}

        {phase === 'shared' && shared && <SharedNy s={shared} isEn={isEn} base={base} />}

        {phase === 'result' && card && st && (
          <section className="pt-6">
            <div className="mx-auto w-full max-w-[360px]">
              {cardUrl ? <img src={cardUrl} alt={T.cardAlt} className="w-full rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,.18)]" />
                : <div className="aspect-[9/16] w-full animate-pulse rounded-2xl bg-[#efe4cc]" />}
            </div>
            <div className="mx-auto mt-3 grid max-w-[360px] grid-cols-2 gap-2">
              <button type="button" disabled={!cardUrl} onClick={() => { if (cardUrl) { saveOrShare(cardUrl, 'kissinskin-2027-talisman.jpg', isEn); trackEvent('ny27_card_save', {}) } }} className="rounded-2xl border-2 border-[#1b1b1f] bg-[#f2b632] py-3 text-sm font-black">⬇️ {T.saveCard}</button>
              <button type="button" onClick={shareLink} className="rounded-2xl border-2 border-[#1b1b1f] bg-white py-3 text-sm font-black">🔗 {T.shareLink}</button>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#1b1b1f]/55">{T.fun}</p>

            {/* 풀이 */}
            <div className="mt-7 rounded-3xl border-[3px] border-[#1b1b1f] bg-white p-5">
              <p className="text-[11px] font-black tracking-[0.2em] text-[#d6402f]">{T.typeKicker}</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-[72px] leading-none text-[#d6402f]" style={{ fontFamily: "'Song Myung', serif" }}>{ONE_CHAR[card.tenGod].hanja}</span>
                <div>
                  <p className="text-[13px] font-bold text-[#1b1b1f]/60">{isEn ? ONE_CHAR[card.tenGod].en : ONE_CHAR[card.tenGod].ko}</p>
                  <h2 className="text-2xl font-black">{YEAR_TYPES[card.group].emoji} {isEn ? YEAR_TYPES[card.group].en : YEAR_TYPES[card.group].ko}</h2>
                  <p className="text-[13px] font-bold">{isEn ? ONE_CHAR[card.tenGod].lineEn : ONE_CHAR[card.tenGod].lineKo}</p>
                </div>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed">{isEn ? YEAR_TYPES[card.group].descEn : YEAR_TYPES[card.group].descKo}</p>
              <p className="mt-2 text-[13px] font-bold text-[#1b1b1f]/70">🐐 {zodiacLine(card.zodiac, isEn)}</p>

              <div className="mt-5 space-y-1.5">
                {card.blessings.map((b, i) => (
                  <div key={b.id} className="flex items-center gap-2 text-[13px] font-black">
                    <span className="w-6 text-center text-lg" style={{ fontFamily: "'Song Myung', serif" }}>{BLESSING_TEXT[b.id].hanja}</span>
                    <span className="w-16 shrink-0">{isEn ? BLESSING_TEXT[b.id].en : BLESSING_TEXT[b.id].ko}</span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#1b1b1f]/10"><span className="block h-full rounded-full" style={{ width: `${b.score}%`, background: i === 0 ? RED : fortuneLookById(b.id).accent }} /></span>
                    <span className="w-8 text-right">{b.score}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f6eedc] p-3">
                <span className="h-10 w-10 shrink-0 rounded-full border-2 border-[#1b1b1f]" style={{ background: LUCKY[card.lucky].hex }} />
                <div className="text-[13px]">
                  <p className="font-black">{isEn ? `Lucky colour · ${LUCKY[card.lucky].en}` : `행운색 · ${LUCKY[card.lucky].ko}`}</p>
                  <p>💄 {isEn ? LUCKY[card.lucky].makeupEn : LUCKY[card.lucky].makeupKo}</p>
                </div>
              </div>

              <p className="mt-5 text-sm font-black">{T.monthsTitle}</p>
              <ol className="mt-2 grid grid-cols-4 gap-1.5 text-center text-[12px]">
                {card.months.map((m) => {
                  const good = card.good.includes(m.month), rest = card.rest === m.month
                  return (
                    <li key={m.month} className={`rounded-lg border-2 px-1 py-1.5 ${good ? 'border-[#1b1b1f] bg-[#f2b632]' : rest ? 'border-dashed border-[#d6402f]' : 'border-transparent bg-[#f6eedc]'}`}>
                      <b>{m.month}{isEn ? '' : '월'}</b>{good && ' ★'}<br />
                      <span className="text-[10.5px] leading-tight">{rest ? (isEn ? 'slow down' : '쉬어 가기') : (isEn ? MONTH_THEME[m.group].en : MONTH_THEME[m.group].ko)}</span>
                    </li>
                  )
                })}
              </ol>
              <p className="mt-2 text-[12.5px] leading-relaxed">💡 {T.restTip(card.rest)} {isEn ? MONTH_THEME[card.months[card.rest - 1].group].restEn : MONTH_THEME[card.months[card.rest - 1].group].restKo}</p>
              <a href={fortuneBase} onClick={() => trackEvent('ny27_to_precise', {})} className="mt-4 block rounded-2xl border-2 border-[#1b1b1f] bg-[#fff7df] px-4 py-3 text-[13px] font-black">📜 {T.preciseLink}</a>
            </div>

            <FiveBlessings card={card} st={st} isEn={isEn} base={base} images={images} boardUrl={boardUrl} update={update}
              onAllDone={() => { if (unlockSecret('newyear')) flash(T.secretGot) }} />

            <a href={fortuneBase} className="mt-6 block rounded-3xl border-[3px] border-[#1b1b1f] bg-[#ffe3ea] p-5 shadow-[6px_6px_0_#1b1b1f]">
              <p className="text-[11px] font-black tracking-[0.2em] text-[#d6402f]">{T.compatKicker}</p>
              <p className="mt-1 text-lg font-black">💞 {T.compatTitle}</p>
              <p className="mt-1 text-[13px]">{T.compatSub}</p>
            </a>

            <button type="button" onClick={() => { setPhase('intro'); setCardUrl(null); setBoardUrl(null); setBirth({ y: String(st.birth.year), m: String(st.birth.month), d: String(st.birth.day) }); window.scrollTo({ top: 0 }) }} className="mt-8 w-full rounded-2xl border-2 border-[#1b1b1f] bg-white py-3 text-sm font-black">↺ {T.again}</button>
          </section>
        )}
      </main>
      <ToolsFooter />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// 오복 메이크업 5장 — 무료권/크레딧, 5장 한 번에 = 크레딧 5개
// ════════════════════════════════════════════════════════════════════
function FiveBlessings({ card, st, isEn, base, images, boardUrl, update, onAllDone }: {
  card: NewYearCard; st: NyState; isEn: boolean; base: string
  images: Partial<Record<FortuneLookId, string>>; boardUrl: string | null
  update: (fn: (s: NyState) => NyState) => Promise<void>; onAllDone: () => void
}) {
  const T = isEn ? EN : KO
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [free, setFree] = useState<FreeStatus | null>(null)
  const [busy, setBusy] = useState<FortuneLookId | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [secret, setSecret] = useState(() => typeof window !== 'undefined' && hasSecret())
  const stop = useRef(false)
  const order = card.blessings.map((b) => b.id)
  const left = order.filter((id) => !images[id])
  const credits = free?.balance ?? 0
  const freeLeft = free?.makeup.left ?? 0

  useEffect(() => {
    let off = false
    supabase.auth.getSession().then(({ data }) => {
      if (off) return
      setLoggedIn(!!data.session)
      if (data.session) getFreeStatus().then((s) => { if (!off) setFree(s) })
    }).catch(() => setLoggedIn(false))
    return () => { off = true }
  }, [])

  const pickSelfie = async () => {
    const file = await pickImage('gallery'); if (!file) return
    const url = URL.createObjectURL(file)
    const ok = await savePendingSelfieFromSrc(url); URL.revokeObjectURL(url)
    const small = ok ? takePendingSelfie() : null
    if (!small) { setMsg(T.badFile); return }
    await update((s) => ({ ...s, selfie: small }))
    setMsg(null); trackEvent('ny27_selfie', {})
  }

  const login = () => { trackEvent('ny27_login_gate', {}); window.location.assign('/auth?next=' + encodeURIComponent(base)) }

  const E: Record<GenError, string> = T.genErr
  const make = async (ids: FortuneLookId[], pay: PayChoice) => {
    if (!st.selfie) { await pickSelfie(); return }
    if (!loggedIn) { login(); return }
    stop.current = false; setMsg(null)
    trackEvent('ny27_generate', { n: ids.length, pay })
    let cur = st
    for (const id of ids) {
      if (stop.current) break
      if (cur.items[id]?.image) continue
      const jobId = cur.items[id]?.jobId || newJobId()
      cur = { ...cur, items: { ...cur.items, [id]: { jobId } } }
      await update(() => cur)
      setBusy(id)
      const r = await generateFortuneMakeup({ photo: cur.selfie!, lookId: id, extra: newYearAccentPrompt(card.lacking), styleTag: 'ny27', jobId, pay })
      if (!r.ok) {
        setBusy(null); setMsg(E[r.error])
        if (r.error !== 'retry') { cur = { ...cur, items: { ...cur.items, [id]: undefined } }; await update(() => cur) }
        getFreeStatus().then(setFree)
        return
      }
      cur = { ...cur, items: { ...cur.items, [id]: { jobId, image: r.image } } }
      await update(() => cur)
      trackEvent('ny27_generated', { look: id, tier: r.tier })
    }
    setBusy(null)
    getFreeStatus().then(setFree)
    if (order.every((id) => cur.items[id]?.image)) { onAllDone(); setSecret(true); trackEvent('ny27_all_five', {}) }
  }

  const btn = 'w-full rounded-2xl py-3.5 text-[15px] font-black'
  return (
    <div id="ny27-five" className="mt-8 rounded-3xl border-[3px] border-[#1b1b1f] p-5 text-[#f6eedc]" style={{ background: INK }}>
      <p className="text-[11px] font-black tracking-[0.2em] text-[#f2b632]">{T.fiveKicker}</p>
      <h2 className="mt-1 text-2xl font-black">{T.fiveTitle}</h2>
      <p className="mt-1 text-[13px] text-[#f6eedc]/80">{T.fiveSub}</p>

      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {order.map((id, i) => (
          <figure key={id} className="relative">
            <img src={images[id] ?? lookImg(id)} alt="" className={`aspect-[2/3] w-full rounded-xl border-2 object-cover object-[50%_22%] ${images[id] ? 'border-[#f2b632]' : 'border-[#f6eedc]/30 opacity-60'}`} />
            {busy === id && <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-lg">⏳</span>}
            {images[id] && <span className="absolute right-1 top-1 rounded-full bg-[#f2b632] px-1.5 text-[10px] font-black text-[#1b1b1f]">✓</span>}
            <figcaption className="mt-1 text-center text-[10.5px] font-black">{i === 0 && '👑'}<span style={{ fontFamily: "'Song Myung', serif" }}>{BLESSING_TEXT[id].hanja}</span> {isEn ? BLESSING_TEXT[id].en : BLESSING_TEXT[id].ko}</figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-2 text-[11.5px] text-[#f6eedc]/65">+ {isEn ? `2027 Red Goat touch · ${LUCKY[card.lucky].en} accent` : `2027 붉은 양 포인트 · ${LUCKY[card.lucky].ko} 포인트`}</p>

      <div className="mt-4 space-y-2">
        {msg && <p className="rounded-xl bg-[#d6402f]/25 px-3 py-2 text-[13px] font-bold">{msg}</p>}
        {busy ? <p className="py-3 text-center text-sm font-bold">⏳ {T.making(isEn ? BLESSING_TEXT[busy].en : BLESSING_TEXT[busy].ko, 5 - left.length + 1)}</p>
          : left.length === 0 ? null
          : !st.selfie ? <button type="button" onClick={pickSelfie} className={`${btn} bg-[#f2b632] text-[#1b1b1f]`}>📷 {T.addSelfie}</button>
          : loggedIn === false ? <button type="button" onClick={login} className={`${btn} bg-[#d6402f] text-white`}>{T.loginToMake}</button>
          : (
            <>
              {free && credits < left.length ? (
                <a href="/analysis/?topup=1" onClick={() => trackEvent('ny27_topup', { need: left.length, have: credits })} className={`${btn} block bg-[#f2b632] text-center text-[#1b1b1f]`}>{T.topupFor(left.length, credits)}</a>
              ) : (
                <button type="button" onClick={() => make(left, 'credit')} className={`${btn} bg-[#d6402f] text-white`}>{T.makeAll(left.length)}</button>
              )}
              {free && freeLeft > 0 && (
                <button type="button" onClick={() => make([left[0]], 'free')} className={`${btn} border-2 border-[#f6eedc]/40 text-[#f6eedc]`}>{T.tryFreeOne(isEn ? BLESSING_TEXT[left[0]].en : BLESSING_TEXT[left[0]].ko)}</button>
              )}
              {free && <p className="text-center text-[11px] text-[#f6eedc]/60">{T.counts(freeLeft, credits)}</p>}
            </>
          )}
        {st.selfie && !busy && left.length > 0 && <button type="button" onClick={pickSelfie} className="w-full text-center text-[12px] font-bold text-[#f6eedc]/70 underline underline-offset-2">{T.changeSelfie}</button>}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-[#c9a227] p-3">
        <img src={badgeSrc('secret-gumiho')} alt="" className={`h-14 w-14 ${secret ? '' : 'opacity-30 grayscale blur-[1px]'}`} />
        <div>
          <p className="text-[13px] font-black">{secret ? (isEn ? SECRET_BADGE.en : SECRET_BADGE.ko) : (isEn ? 'SECRET · ???' : '시크릿 · ???')}</p>
          <p className="text-[11px] text-[#f6eedc]/70">{T.secretHint(Object.keys(images).length)}</p>
        </div>
      </div>

      {boardUrl && (
        <div className="mt-5">
          <img src={boardUrl} alt={T.boardAlt} className="w-full rounded-2xl" />
          <button type="button" onClick={() => { saveOrShare(boardUrl, 'kissinskin-2027-five-blessings.jpg', isEn); trackEvent('ny27_board_save', { n: Object.keys(images).length }) }} className="mt-2 w-full rounded-2xl bg-[#f2b632] py-3 text-sm font-black text-[#1b1b1f]">⬇️ {T.saveBoard}</button>
        </div>
      )}
      <p className="mt-3 text-[11px] text-[#f6eedc]/55">{T.aiNote}</p>
    </div>
  )
}

function SharedNy({ s, isEn, base }: { s: NonNullable<ReturnType<typeof decodeNy>>; isEn: boolean; base: string }) {
  const ch = ONE_CHAR[s.tenGod], ty = YEAR_TYPES[groupOfTenGod(s.tenGod)]
  return (
    <section className="pt-8 text-center">
      <p className="text-[11px] font-black tracking-[0.25em] text-[#d6402f]">{isEn ? 'A FRIEND SENT YOU THEIR 2027 TALISMAN' : '친구가 2027 신년 부적을 보냈어요'}</p>
      <div className="mx-auto mt-4 max-w-sm rounded-3xl border-[3px] border-[#1b1b1f] bg-[#f5d548] p-6 shadow-[6px_6px_0_#1b1b1f]">
        <img src={GOAT_BADGE} alt="" className="mx-auto h-24 w-24" />
        <p className="text-[120px] leading-none text-[#d6402f]" style={{ fontFamily: "'Song Myung', serif" }}>{ch.hanja}</p>
        <p className="mt-1 text-lg font-black">{isEn ? ch.en : ch.ko} · {ty.emoji} {isEn ? ty.en : ty.ko}</p>
        <p className="mt-1 text-[13px] font-bold">{isEn ? ch.lineEn : ch.lineKo}</p>
        <p className="mt-2 text-[12px]">{isEn ? `Best months ${s.good.join(' · ')}` : `좋은 달 ${s.good.join('·')}월`} · {isEn ? LUCKY[s.lacking].en : LUCKY[s.lacking].ko}</p>
      </div>
      <a href={base} className="mt-5 block rounded-2xl bg-[#1b1b1f] py-4 text-base font-black text-[#f6eedc] shadow-[4px_4px_0_#d6402f]">{isEn ? 'What’s my word for 2027? Free →' : '내 2027 한 글자는? 무료로 보기 →'}</a>
      <p className="mt-3 text-[11px] text-[#1b1b1f]/55">{isEn ? 'For fun. Your birth date never leaves your device.' : '재미로 보는 결과예요. 생년월일은 기기 밖으로 나가지 않아요.'}</p>
    </section>
  )
}

function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border-2 border-[#1b1b1f] bg-white px-3 py-2.5 text-sm font-bold">
        <option value="">{label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}

function IntroSeo({ isEn }: { isEn: boolean }) {
  return (
    <div className="mt-10 space-y-4 text-[14px] leading-relaxed text-[#1b1b1f]/85">
      {isEn ? (
        <>
          <h2 className="text-xl font-black text-[#1b1b1f]">2027 — the Year of the Fire Goat (丁未)</h2>
          <p>In the Korean and Chinese calendars, 2027 is <strong>Jeongmi (丁未)</strong>: 丁 is yin Fire (red) and 未 is the Goat (Earth) — the <strong>Red Goat</strong>. It starts at Ipchun on <strong>February 4, 2027</strong>; Lunar New Year (Seollal) falls on February 6.</p>
          <h2 className="text-xl font-black text-[#1b1b1f]">How your talisman is read</h2>
          <p><strong>Your word for 2027</strong> comes from how the year’s 丁 Fire meets your Day Master (the stem of your birth day) — one of ten relationships, grouped into five year types. <strong>Best months</strong> come from each month’s pillar in 2027 and whether you need support or an outlet. Your <strong>lucky colour</strong> is the element your chart lacks.</p>
          <h2 className="text-xl font-black text-[#1b1b1f]">Five Blessings makeup</h2>
          <p>Wealth, Love, Career, Vitality and People — five face-reading makeup looks, each lighting up the matching palace of the face, with a 2027 Red Goat touch. Try all five on your own selfie with AI and collect the secret Golden Gumiho badge.</p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-black text-[#1b1b1f]">2027년은 정미년(丁未年) — 붉은 양의 해</h2>
          <p>2027년은 천간 <strong>丁(정, 음의 불·빨강)</strong>과 지지 <strong>未(미, 양·흙)</strong>가 만난 <strong>붉은 양의 해</strong>예요. 사주에서 해가 바뀌는 날은 1월 1일이 아니라 <strong>입춘(2027년 2월 4일)</strong>이고, 설날은 2월 6일이에요.</p>
          <h2 className="text-xl font-black text-[#1b1b1f]">신년 부적은 이렇게 봐요</h2>
          <p><strong>올해의 한 글자</strong>는 2027년의 丁火가 내 일간(태어난 날의 천간)과 만나 생기는 십성 10가지에서 나와요. 십성을 다섯 묶음으로 나눠 <strong>신년 유형 5가지</strong>(동행·매력 발산·결실·도약·채움)로 보여 드려요. <strong>좋은 달</strong>은 2027년 열두 달의 월주와 내 사주의 힘(신강·신약)으로, <strong>행운색</strong>은 내 사주에 부족한 오행으로 정해요.</p>
          <h2 className="text-xl font-black text-[#1b1b1f]">오복 메이크업</h2>
          <p>재물·연애·직업·건강·인복 — 다섯 가지 복마다 관상 12궁의 해당 자리를 살리는 메이크업이 있어요. 2027 붉은 양 포인트를 더해 내 셀카에 AI로 입혀 보고, 다섯 장을 모두 모으면 시크릿 「황금 구미호」 배지가 열려요.</p>
        </>
      )}
    </div>
  )
}

// ── 문구 ──
const KO = {
  kicker: 'KISSINSKIN · 2027 丁未年 신년운세',
  title1: '2027 붉은 양의 해,', title2: '나의 한 글자',
  lead: '생년월일만 넣으면 올해의 한 글자·신년 유형·오복 순위·좋은 달·행운색 메이크업이 담긴 신년 부적 카드가 나와요. 무료예요.',
  birthTitle: '생년월일', birthSub: '(양력)', year: '년', month: '월', day: '일',
  birthTip: '양력 기준이에요. 태어난 날의 천간(일간)으로 올해를 읽어요.',
  go: '나의 2027 신년 부적 받기 →',
  privacy: '생년월일은 이 기기 밖으로 나가지 않아요.', fun: '재미로 보는 결과예요. 겁주는 운세는 쓰지 않아요.',
  needBirth: '생년월일을 모두 골라 주세요.', badBirth: '생년월일을 다시 확인해 주세요.',
  fiveTeaser: '오복 메이크업 5장 — 내 얼굴에 입혀 보기는 결과에서',
  cardAlt: '나의 2027 신년 부적 카드', saveCard: '부적 저장', shareLink: '친구에게 보내기', copied: '링크를 복사했어요',
  typeKicker: '올해의 한 글자 · 신년 유형',
  monthsTitle: '2027 열두 달',
  restTip: (m: number) => `${m}월은 쉬어 가는 달 —`,
  preciseLink: '12달을 더 자세히(연애·재물·직장) — 관상·사주 정밀 풀이 보기 →',
  fiveKicker: '오복 메이크업 · 5장', fiveTitle: '다섯 가지 복을 내 얼굴에',
  fiveSub: '재물·연애·직업·건강·인복 관상 메이크업을 셀카 한 장으로. 순서는 내 오복 순위대로예요.',
  making: (n: string, k: number) => `${n} 메이크업 입히는 중… (${k}/5, 장당 1분 안팎)`,
  addSelfie: '셀카 올리고 시작하기', changeSelfie: '다른 셀카로 바꾸기',
  loginToMake: '로그인하고 만들기 — 가입하면 무료권 2장',
  makeAll: (n: number) => `${n === 5 ? '5장 한 번에' : `남은 ${n}장`} 만들기 — 크레딧 ${n}개`,
  topupFor: (n: number, c: number) => `크레딧 충전 — ${n}개 필요(보유 ${c}개)`,
  tryFreeOne: (n: string) => `${n} 1장만 무료권으로 먼저 해보기`,
  counts: (f: number, c: number) => `남은 무료권 ${f}장 · 크레딧 ${c}개 · 만든 사진은 이 기기에 보관돼요`,
  badFile: '사진을 열 수 없어요. JPG나 PNG로 해 주세요.',
  genErr: {
    login: '로그인이 필요해요.', topup: '크레딧이 부족해요. 충전하고 돌아오면 이어서 만들어요.', free_used: '무료권을 이미 사용했어요. 크레딧으로 만들 수 있어요.',
    choose: '무료권과 크레딧 중 골라 주세요.', unavailable: '잠시 후 다시 시도해 주세요.', retry: '한 장이 실패했어요. 다시 누르면 추가 차감 없이 이어서 만들어요.',
  } as Record<GenError, string>,
  secretHint: (n: number) => `오복 5장을 다 모으면 열려요 (${n}/5)`,
  boardAlt: '나의 오복 메이크업 모아보기', saveBoard: '오복 모아보기 저장',
  aiNote: 'AI가 내 사진에 입혀 보는 시뮬레이션이에요. 실제 화장 결과와 다를 수 있어요.',
  compatKicker: '궁합 · 동물상', compatTitle: '친구·연인과 2027 궁합도 보기', compatSub: '셀카로 동물상·관상까지 — 관상·사주 메이크업에서',
  again: '다른 생년월일로 보기', secretGot: '🎉 시크릿 배지 「황금 구미호」 획득!',
}
const EN: typeof KO = {
  kicker: 'KISSINSKIN · 2027 HOROSCOPE',
  title1: 'Year of the Fire Goat —', title2: 'your word for 2027',
  lead: 'Enter your birth date for a free 2027 lucky talisman: your word of the year, year type, five-blessings ranking, best months and a lucky-colour makeup.',
  birthTitle: 'Birth date', birthSub: '(solar)', year: 'Year', month: 'Month', day: 'Day',
  birthTip: 'Solar calendar. We read 2027 against your Day Master (the stem of your birth day).',
  go: 'Get my 2027 talisman →',
  privacy: 'Your birth date never leaves this device.', fun: 'Just for fun — no scary predictions.',
  needBirth: 'Please pick your full birth date.', badBirth: 'Please check your birth date.',
  fiveTeaser: 'Five Blessings makeup — try them on your selfie after your result',
  cardAlt: 'My 2027 lucky talisman card', saveCard: 'Save talisman', shareLink: 'Send to friends', copied: 'Link copied',
  typeKicker: 'MY WORD FOR 2027 · YEAR TYPE',
  monthsTitle: '2027 month by month',
  restTip: (m: number) => `Month ${m} is your slow-down month —`,
  preciseLink: 'More detail for each month (love · money · work) — open the full face & saju reading →',
  fiveKicker: 'FIVE BLESSINGS MAKEUP · 5 LOOKS', fiveTitle: 'Five blessings, on your face',
  fiveSub: 'Wealth, Love, Career, Vitality and People face-reading makeup from one selfie — in your blessings order.',
  making: (n: string, k: number) => `Applying ${n} makeup… (${k}/5, about a minute each)`,
  addSelfie: 'Add a selfie to start', changeSelfie: 'Use another selfie',
  loginToMake: 'Log in to make them — 2 free passes on sign-up',
  makeAll: (n: number) => `Make ${n === 5 ? 'all 5' : `the last ${n}`} — ${n} credits`,
  topupFor: (n: number, c: number) => `Top up — ${n} credits needed (you have ${c})`,
  tryFreeOne: (n: string) => `Try ${n} first with a free pass`,
  counts: (f: number, c: number) => `Free pass ${f} · Credits ${c} · images stay on this device`,
  badFile: 'That file couldn’t be opened. Try a JPG or PNG.',
  genErr: {
    login: 'Please log in.', topup: 'Not enough credits — top up and come back to continue.', free_used: 'Your free pass is used. You can use a credit.',
    choose: 'Choose a free pass or a credit.', unavailable: 'Please try again shortly.', retry: 'One image failed. Tap again — no extra charge.',
  },
  secretHint: (n: number) => `Collect all five to unlock (${n}/5)`,
  boardAlt: 'My Five Blessings makeup board', saveBoard: 'Save my Five Blessings board',
  aiNote: 'An AI simulation on your photo — real makeup may look different.',
  compatKicker: 'MATCH · ANIMAL FACE', compatTitle: 'Check your 2027 match with friends', compatSub: 'Animal face & face reading from a selfie — in Face Reading Makeup',
  again: 'Try another birth date', secretGot: '🎉 Secret badge “Golden Gumiho” unlocked!',
}
