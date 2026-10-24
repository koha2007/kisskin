// 홈 — 오늘의 운세 입구 (2026-10-24) — 히어로 바로 아래 남색 카드
// ────────────────────────────────────────────────────────────────────
// 운영자: "오늘의 운세를 메인에 — 가볍게 보고 유입되게, 눈에 잘 띄게."
// 홈 방문자 90%가 첫 화면만 본다(Clarity) → 중간이 아니라 히어로 바로 아래.
//   시안 2개(얇은 띠 / 남색 카드) 중 운영자가 남색 카드(B안)로 확정 — 띠는 지나치기 쉬웠다.
// 둘 다 그 자리에서 생년월일을 고르고 누르면 /tools/today-fortune/?b=YYYY-M-D(&h=) 로 가서 바로 결과.
// 다시 온 사람(이 기기에 생년월일 저장본)은 오늘 결과 미리보기를 보여 준다 — 매일 다시 올 이유.
// 날짜·일진·저장본은 브라우저에서만 정한다(미리 렌더한 HTML 과 어긋나지 않게 마운트 뒤에).
import { useEffect, useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import { loadLast, type FortuneResult } from '../../lib/fortune/state'
import { dailyFortune, type DailyFortune } from '../../lib/fortune/daily'
import { computeSaju, STEMS_HANJA, BRANCHES_HANJA, BRANCHES_KO } from '../../lib/fortune/saju'

const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 0 : i * 2 - 1))
const hourLabel = (v: string, isEn: boolean) => {
  const b = Math.floor(((+v + 1) % 24) / 2)
  return isEn ? `${BRANCHES_KO[b]} hour` : `${BRANCHES_KO[b]}시`
}

export default function HomeFortune({ isEn }: { isEn: boolean }) {
  const href = isEn ? '/en/tools/today-fortune/' : '/tools/today-fortune/'
  const [today, setToday] = useState<{ date: string; pillar: string } | null>(null)
  const [mine, setMine] = useState<{ r: FortuneResult; d: DailyFortune } | null>(null)
  const [b, setB] = useState({ y: '', m: '', d: '', h: '' })

  useEffect(() => {
    const now = new Date()
    const s = computeSaju({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() })
    const last = loadLast()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday({ date: `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`, pillar: STEMS_HANJA[s.day.stem] + BRANCHES_HANJA[s.day.branch] })
    if (last?.birth) setMine({ r: last, d: dailyFortune(last, now) })
  }, [])

  const go = () => {
    if (!b.y || !b.m || !b.d) return
    trackEvent('select_promotion', { creative_slot: 'home_fortune' })
    window.location.href = `${href}?b=${b.y}-${b.m}-${b.d}${b.h ? `&h=${b.h}` : ''}`
  }
  const ready = !!(b.y && b.m && b.d)
  // 다시 온 사람 — 저장된 생년월일로 바로 결과 페이지
  const mineHref = mine?.r.birth ? `${href}?b=${mine.r.birth.year}-${mine.r.birth.month}-${mine.r.birth.day}${mine.r.birth.hour != null ? `&h=${mine.r.birth.hour}` : ''}` : href
  const sel = (label: string, v: string, set: (v: string) => void, opts: string[], render?: (o: string) => string, cls = '') => (
    <label className={`block min-w-0 ${cls}`}>
      <span className="sr-only">{label}</span>
      <select value={v} onChange={(e) => set(e.target.value)}
        className="w-full bg-white px-2.5 py-2.5 text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-primary-on-dark">
        <option value="">{label}</option>
        {opts.map((o) => <option key={o} value={o}>{render ? render(o) : o}</option>)}
      </select>
    </label>
  )
  const years = Array.from({ length: 76 }, (_, i) => String(2015 - i))
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1))
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
  const stars = (n: number) => <span aria-label={isEn ? `${n} of 5` : `5점 중 ${n}점`}>{'★'.repeat(n)}<span className="opacity-25">{'★'.repeat(5 - n)}</span></span>

  // ── 남색 카드(눈에 띄게) — 운영자 10/24 B안 확정 ──
  return (
    <section className="bg-navy text-white" aria-labelledby="home-fortune-title">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 overflow-hidden">
        <span className="pointer-events-none absolute -right-4 -top-6 select-none text-[140px] md:text-[180px] leading-none text-white/[0.06]" style={{ fontFamily: "'Song Myung', serif" }} aria-hidden="true">運</span>
        <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-on-dark">
          {isEn ? 'Today’s fortune' : '오늘의 운세'}{today && ` · ${today.date} · ${today.pillar}日`}
        </p>
        {mine ? (
          <>
            <h2 id="home-fortune-title" className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight break-keep">{isEn ? mine.d.themeEn : mine.d.themeKo}</h2>
            <p className="mt-1 text-xl text-amber-300">{stars(mine.d.stars)}</p>
            <p className="mt-3 max-w-lg text-[15px] text-white/80 leading-relaxed">{isEn ? mine.d.tipEn : mine.d.tipKo}</p>
            <p className="mt-3 flex items-center gap-2 text-sm font-bold">
              <span className="inline-block h-4 w-4 rounded-full ring-1 ring-white/30" style={{ background: mine.d.color.hex }} />
              {isEn ? `Today’s colour: ${mine.d.color.en}` : `오늘의 색: ${mine.d.color.ko}`}
            </p>
            <a href={mineHref} onClick={() => trackEvent('select_promotion', { creative_slot: 'home_fortune_mine' })}
              className="mt-6 inline-flex items-center gap-1.5 bg-white px-5 py-3.5 text-sm font-bold text-navy hover:bg-cream transition-colors">
              {isEn ? 'See my strongest lucks' : '나의 강한 운까지 보기'}<span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </>
        ) : (
          <>
            <h2 id="home-fortune-title" className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight break-keep">{isEn ? 'How’s your luck today?' : '오늘, 나의 운은?'}</h2>
            <p className="mt-2 text-[15px] text-white/75">{isEn ? 'Just your birth date — 10 seconds, free.' : '생년월일만 넣으면 10초 · 무료'}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
              {sel(isEn ? 'Year' : '년', b.y, (y) => setB({ ...b, y }), years)}
              {sel(isEn ? 'Month' : '월', b.m, (m) => setB({ ...b, m }), months)}
              {sel(isEn ? 'Day' : '일', b.d, (d) => setB({ ...b, d }), days)}
              {sel(isEn ? 'Birth hour (optional)' : '태어난 시 (몰라도 돼요)', b.h, (h) => setB({ ...b, h }), HOURS, (o) => hourLabel(o, isEn), 'col-span-3 md:col-span-1')}
            </div>
            <button type="button" onClick={go} disabled={!ready}
              className="mt-3 flex w-full items-center justify-center gap-1.5 bg-primary-dark py-4 text-base font-bold text-white hover:bg-primary disabled:opacity-60 transition-colors">
              {isEn ? 'See today’s fortune' : '오늘의 운세 보기'}<span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <p className="mt-2 text-center text-[11px] text-white/50">{isEn ? 'Your birth date never leaves this device.' : '생년월일은 이 기기 밖으로 나가지 않아요.'}</p>
          </>
        )}
      </div>
    </section>
  )
}
