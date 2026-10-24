// 홈 — 오늘의 운세 입구 (2026-10-24) — 히어로 바로 아래 남색 카드
// ────────────────────────────────────────────────────────────────────
// 운영자: "오늘의 운세를 메인에 — 가볍게 보고 유입되게, 눈에 잘 띄게."
// 홈 방문자 90%가 첫 화면만 본다(Clarity) → 중간이 아니라 히어로 바로 아래.
//   시안 2개(얇은 띠 / 남색 카드) 중 운영자가 남색 카드(B안)로 확정 — 띠는 지나치기 쉬웠다.
// 둘 다 그 자리에서 생년월일을 고르고 누르면 /tools/today-fortune/?b=YYYY-M-D(&h=) 로 가서 바로 결과.
// 운영자 10/24: "다시 들어오면 자동 리셋 — 페이지 새로 열면 항상 오늘의 운세로." → 지난번 생년월일·결과를
//   꺼내 쓰지 않고 늘 빈 입력 카드(오늘 날짜·일진만 바뀜)로 보여 준다.
// 날짜·일진·저장본은 브라우저에서만 정한다(미리 렌더한 HTML 과 어긋나지 않게 마운트 뒤에).
import { useEffect, useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import { computeSaju, STEMS_HANJA, BRANCHES_HANJA, BRANCHES_KO } from '../../lib/fortune/saju'

const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 0 : i * 2 - 1))
const hourLabel = (v: string, isEn: boolean) => {
  const b = Math.floor(((+v + 1) % 24) / 2)
  return isEn ? `${BRANCHES_KO[b]} hour` : `${BRANCHES_KO[b]}시`
}

export default function HomeFortune({ isEn }: { isEn: boolean }) {
  const href = isEn ? '/en/tools/today-fortune/' : '/tools/today-fortune/'
  const [today, setToday] = useState<{ date: string; pillar: string } | null>(null)
  const [b, setB] = useState({ y: '', m: '', d: '', h: '' })

  useEffect(() => {
    const now = new Date()
    const s = computeSaju({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday({ date: `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`, pillar: STEMS_HANJA[s.day.stem] + BRANCHES_HANJA[s.day.branch] })
  }, [])

  const go = () => {
    if (!b.y || !b.m || !b.d) return
    trackEvent('select_promotion', { creative_slot: 'home_fortune' })
    window.location.href = `${href}?b=${b.y}-${b.m}-${b.d}${b.h ? `&h=${b.h}` : ''}`
  }
  const ready = !!(b.y && b.m && b.d)
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

  // ── 남색 카드(눈에 띄게) — 운영자 10/24 B안 확정 ──
  return (
    <section className="bg-navy text-white" aria-labelledby="home-fortune-title">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 overflow-hidden">
        <span className="pointer-events-none absolute -right-4 -top-6 select-none text-[140px] md:text-[180px] leading-none text-white/[0.06]" style={{ fontFamily: "'Song Myung', serif" }} aria-hidden="true">運</span>
        <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-on-dark">
          {isEn ? 'Today’s fortune' : '오늘의 운세'}{today && ` · ${today.date} · ${today.pillar}日`}
        </p>
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
      </div>
    </section>
  )
}
