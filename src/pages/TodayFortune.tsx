// 오늘의 운세 — /tools/today-fortune/ · /en/tools/today-fortune/ (2026-10-24 럭키 메이크업에서 분리)
// 운영자 10/24: "2026 메이크업 9종 · 럭키 메이크업 9종 · 오늘의 운세 — 결과가 다 다르게."
// 운영자 10/24(2차): "셀카는 일단 없애. 생년월일과 태어난 시만 적고 사주 보듯이 오늘의 운세만.
//   결과에서 동물상·운세 카드 빼고 오늘의 운세 · 오늘의 색 · 강한 운 정도만, 제목과 결과가 통일감 있게."
// ────────────────────────────────────────────────────────────────────
// 흐름: 생년월일(+태어난 시, 몰라도 됨) → 사주 계산(기기 안, 서버 X) → 오늘의 운세 · 오늘의 색 · 강한 운 3
//      → 맨 아래 한 줄로 오늘의 럭키 메이크업(/lucky-makeup/?look=)
// 같은 날·같은 생년월일이면 항상 같은 결과(daily.ts). 로그인·결제 없음. 생년월일은 이 기기에만(state.saveLast).
// 동물상 카드·포카·도감·공유 링크·사주 명식·정밀 풀이·궁합 코드는 git(360a30c)에 — 다시 켤 때 거기서 꺼낸다.
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { trackEvent, trackToolComplete } from '../lib/analytics'
import { computeSaju, isValidBirth, BRANCHES_KO, STEMS_KO, STEMS_HANJA, stemElement, type BirthInput, type Element } from '../lib/fortune/saju'
import { readFortunes } from '../lib/fortune/reading'
import { fortuneLookById } from '../lib/fortune/looks'
import { saveLast, loadLast, serialOf, type FortuneResult } from '../lib/fortune/state'
import { dailyFortune } from '../lib/fortune/daily'

type Phase = 'intro' | 'result'
type BirthForm = { y: string; m: string; d: string; h: string }
const ELEM_KO: Record<Element, string> = { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' }
const ELEM_EN: Record<Element, string> = { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' }

function analyze(birth: BirthInput): FortuneResult {
  const saju = computeSaju(birth)
  const seed = JSON.stringify([birth, null])
  return {
    v: 1, createdAt: Date.now(), birth,
    scores: readFortunes({ saju, seed }),
    dayStem: saju.day.stem, lacking: saju.lacking, counts: saju.counts,
    serial: serialOf(seed),
  }
}

/** 태어난 시 → 12시진(자시 23~01 …). 값은 그 시진의 대표 시각 */
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 0 : i * 2 - 1))
const hourLabel = (v: string, isEn: boolean) => {
  const b = Math.floor(((+v + 1) % 24) / 2)
  const from = String((b * 2 + 23) % 24).padStart(2, '0'), to = String((b * 2 + 1) % 24).padStart(2, '0')
  return isEn ? `${BRANCHES_KO[b]} hour (${from}–${to})` : `${BRANCHES_KO[b]}시 (${from}~${to}시)`
}

export default function TodayFortune() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const lucky = isEn ? '/en/lucky-makeup/' : '/lucky-makeup/'
  const [phase, setPhase] = useState<Phase>('intro')
  const [birth, setBirth] = useState<BirthForm>({ y: '', m: '', d: '', h: '' })
  const [err, setErr] = useState<string | null>(null)
  const [result, setResult] = useState<FortuneResult | null>(null)
  const T = isEn ? EN : KO

  // 진입 — 홈 카드에서 ?b=YYYY-M-D(&h=) 로 오면 바로 결과, 아니면 지난번 생년월일을 채워 둔다
  // (미리 렌더한 HTML 과 어긋나지 않게 마운트 뒤에)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const [y, m, d] = (q.get('b') ?? '').split('-')
    if (y && m && d) {
      const f: BirthForm = { y, m, d, h: q.get('h') ?? '' }
      setBirth(f); run(f, 'home')
      return
    }
    const b = loadLast()?.birth
    if (b) setBirth({ y: String(b.year), m: String(b.month), d: String(b.day), h: b.hour == null ? '' : String(b.hour) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const run = (f: BirthForm = birth, from = 'page') => {
    if (!f.y || !f.m || !f.d) { setErr(T.needBirth); return }
    const b: BirthInput = { year: +f.y, month: +f.m, day: +f.d, hour: f.h === '' ? undefined : +f.h }
    if (!isValidBirth(b)) { setErr(T.badBirth); return }
    setErr(null)
    const res = analyze(b)
    setResult(res); saveLast(res); setPhase('result')
    window.scrollTo({ top: 0 })
    trackToolComplete('today-fortune', res.scores[0].id)
    trackEvent('fortune_result', { top: res.scores[0].id, hour: b.hour != null, from })
  }

  const d = result ? dailyFortune(result) : null
  const eyebrow = 'text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark'
  const sectionTitle = 'text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500'
  return (
    <div className="font-display bg-background-light min-h-screen text-navy">
      <ToolsNav />
      <main className="max-w-xl mx-auto px-4 sm:px-6 pb-20">
        {/* 머리 — 입력·결과 같은 제목(통일감). 결과에선 날짜·일진과 내 생일이 붙는다 */}
        <header className="pt-10 md:pt-14">
          <p className={eyebrow}>{d ? T.kickerDate(d.dateKey) : T.kicker}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">{T.title}</h1>
            {d && <span className="text-2xl text-slate-400" style={{ fontFamily: "'Song Myung', serif" }} aria-label={T.dayPillar}>{d.dayPillarHanja}日</span>}
          </div>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            {result?.birth ? T.whoLine(result.birth, result.dayStem) : T.lead}
          </p>
        </header>

        {phase === 'intro' && (
          <section className="mt-8 border border-slate-200 bg-white p-5 md:p-7">
            <p className="text-sm font-extrabold">{T.birthTitle} <span className="font-medium text-slate-500">{T.solar}</span></p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Select label={T.year} value={birth.y} onChange={(v) => setBirth({ ...birth, y: v })} options={Array.from({ length: 76 }, (_, i) => String(2015 - i))} />
              <Select label={T.month} value={birth.m} onChange={(v) => setBirth({ ...birth, m: v })} options={Array.from({ length: 12 }, (_, i) => String(i + 1))} />
              <Select label={T.day} value={birth.d} onChange={(v) => setBirth({ ...birth, d: v })} options={Array.from({ length: 31 }, (_, i) => String(i + 1))} />
            </div>
            <p className="mt-5 text-sm font-extrabold">{T.hourTitle} <span className="font-medium text-slate-500">{T.hourSub}</span></p>
            <div className="mt-3">
              <Select label={T.hourTitle} value={birth.h} onChange={(v) => setBirth({ ...birth, h: v })} options={HOUR_OPTIONS} render={(v) => hourLabel(v, isEn)} emptyLabel={T.hourUnknown} />
            </div>

            {err && <p className="mt-4 bg-primary/10 px-3 py-2 text-sm font-bold text-primary-dark">{err}</p>}
            <button type="button" onClick={() => run()} className="mt-6 flex w-full items-center justify-center gap-1.5 bg-navy py-4 text-base font-bold text-white hover:bg-navy-mid transition-colors">{T.go}<span className="material-symbols-outlined text-lg">arrow_forward</span></button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">{T.privacy}<br />{T.fun}</p>
          </section>
        )}

        {phase === 'result' && result && d && (
          <section className="mt-8">
            {/* 결과 = 입력과 같은 흰 카드 한 장, 세 칸(오늘의 운세 · 오늘의 색 · 강한 운) */}
            <div className="divide-y divide-slate-200 border border-slate-200 bg-white">
              <div className="p-5 md:p-7">
                <p className={sectionTitle}>{T.sFortune}</p>
                <p className="mt-2 text-2xl md:text-3xl font-extrabold leading-snug break-keep">{isEn ? d.themeEn : d.themeKo}</p>
                <p className="mt-1 text-xl text-primary" aria-label={isEn ? `${d.stars} of 5` : `5점 중 ${d.stars}점`}>{'★'.repeat(d.stars)}<span className="text-slate-200">{'★'.repeat(5 - d.stars)}</span></p>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{isEn ? d.tipEn : d.tipKo}</p>
              </div>
              <div className="flex items-center gap-4 p-5 md:p-7">
                <span className="h-14 w-14 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: d.color.hex }} aria-hidden="true" />
                <div className="min-w-0">
                  <p className={sectionTitle}>{T.sColor}</p>
                  <p className="mt-1 text-xl font-extrabold">{isEn ? d.color.en : d.color.ko}</p>
                  <p className="mt-0.5 text-[13px] text-slate-600">{T.colorTip}</p>
                </div>
              </div>
              <div className="p-5 md:p-7">
                <p className={sectionTitle}>{T.sLuck}</p>
                <ol className="mt-3 space-y-2.5">
                  {result.scores.slice(0, 3).map((s, i) => {
                    const l = fortuneLookById(s.id)
                    return (
                      <li key={s.id} className="flex items-center gap-3 text-sm font-bold">
                        <span className="w-4 shrink-0 tabular-nums text-slate-400">{i + 1}</span>
                        <span className="w-24 shrink-0 truncate">{isEn ? l.nameEn : l.fortuneKo}</span>
                        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${s.score}%`, background: l.accent }} /></span>
                        <span className="w-8 text-right tabular-nums">{s.score}</span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>

            {/* 결과 밑 — 럭키 메이크업으로(오늘의 운에 맞는 룩을 골라 둔 채) */}
            <a href={`${lucky}?look=${d.look}`} onClick={() => trackEvent('fortune_to_lucky', { look: d.look })}
              className="mt-4 flex items-center justify-between gap-3 bg-navy px-5 py-4 text-white hover:bg-navy-mid transition-colors">
              <span className="min-w-0">
                <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-primary-on-dark">{T.luckyKicker}</span>
                <span className="mt-0.5 block text-[15px] font-extrabold">{T.luckyLine(isEn ? fortuneLookById(d.look).nameEn : fortuneLookById(d.look).nameKo)}</span>
              </span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>

            <button type="button" onClick={() => { setPhase('intro'); setResult(null); window.scrollTo({ top: 0 }) }}
              className="mt-3 w-full border border-slate-300 bg-white py-3 text-sm font-bold hover:border-navy transition-colors">{T.again}</button>
            <p className="mt-3 text-center text-[11px] text-slate-400">{T.fun}</p>
          </section>
        )}

        {phase === 'intro' && <IntroSeo isEn={isEn} lucky={lucky} />}
      </main>
      <ToolsFooter />
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

function IntroSeo({ isEn, lucky }: { isEn: boolean; lucky: string }) {
  return (
    <div className="mt-14 space-y-4 border-t border-slate-200 pt-10 text-[15px] leading-relaxed text-slate-600">
      <h2 className="text-xl font-extrabold text-navy">{isEn ? 'How does today’s fortune work?' : '오늘의 운세는 어떻게 보나요?'}</h2>
      {isEn ? (
        <>
          <p><strong className="text-navy">Like a saju reading.</strong> From your birth date (and birth hour, if you know it) we find your Day Master, then compare it with today’s day pillar. The relationship between the two sets today’s theme.</p>
          <p><strong className="text-navy">Three things, every day.</strong> Today’s fortune with a one-line tip, today’s lucky colour, and your three strongest lucks. Free, no log-in — your birth date never leaves this device.</p>
          <p><strong className="text-navy">Then wear your luck.</strong> Each day comes with a matching <a href={lucky} className="font-bold text-navy underline underline-offset-4">lucky makeup</a>.</p>
        </>
      ) : (
        <>
          <p><strong className="text-navy">사주 보듯이 봐요.</strong> 생년월일(아시면 태어난 시까지)로 나를 나타내는 기운(일간)을 찾고, 오늘의 일진과 비교해요. 둘의 관계가 오늘의 운을 정해요.</p>
          <p><strong className="text-navy">매일 세 가지.</strong> 오늘의 운세와 한 줄 조언, 오늘의 색, 나의 강한 운 3가지. 무료 · 로그인 없이, 생년월일은 이 기기 밖으로 나가지 않아요.</p>
          <p><strong className="text-navy">운은 얼굴에 입히세요.</strong> 날마다 어울리는 <a href={lucky} className="font-bold text-navy underline underline-offset-4">럭키 메이크업</a>을 골라 드려요.</p>
        </>
      )}
    </div>
  )
}

// ── 문구 ──
const KO = {
  kicker: 'Today’s fortune · 오늘의 운세',
  kickerDate: (k: string) => `오늘의 운세 · ${k.replace(/-/g, '.')}`,
  title: '오늘의 운세', dayPillar: '오늘의 일진',
  lead: '생년월일과 태어난 시로 사주를 풀어, 오늘의 운세와 오늘의 색, 나의 강한 운을 알려 드려요. 무료 · 로그인 없이.',
  whoLine: (b: BirthInput, stem?: number) =>
    `${b.year}년 ${b.month}월 ${b.day}일${b.hour != null ? ` · ${hourLabel(String(b.hour), false).split(' ')[0]}` : ''} 생${stem != null ? ` · 일간 ${STEMS_KO[stem]}${STEMS_HANJA[stem]} ${ELEM_KO[stemElement(stem)]}` : ''}`,
  birthTitle: '생년월일', solar: '양력 기준', year: '년', month: '월', day: '일',
  hourTitle: '태어난 시', hourSub: '몰라도 돼요', hourUnknown: '모름',
  go: '오늘의 운세 보기',
  privacy: '생년월일은 이 기기 밖으로 나가지 않아요.', fun: '사주는 재미로 보는 전통이에요. 사람을 평가하지 않아요.',
  needBirth: '생년월일을 골라 주세요.', badBirth: '생년월일을 다시 확인해 주세요.',
  sFortune: '오늘의 운세', sColor: '오늘의 색', sLuck: '나의 강한 운',
  colorTip: '옷·소품·립이나 블러셔 포인트로 써 보세요.',
  luckyKicker: '오늘의 럭키 메이크업', luckyLine: (n: string) => `${n} 내 얼굴에 입혀 보기`,
  again: '다른 생년월일로 보기',
}
const EN: typeof KO = {
  kicker: 'Today’s fortune · K-saju',
  kickerDate: (k: string) => `Today’s fortune · ${k.replace(/-/g, '.')}`,
  title: 'Today’s Fortune', dayPillar: 'Today’s day pillar',
  lead: 'Like a saju reading: from your birth date and birth hour — today’s fortune, today’s colour and your strongest lucks. Free, no log-in.',
  whoLine: (b: BirthInput, stem?: number) =>
    `Born ${b.year}.${b.month}.${b.day}${b.hour != null ? ` · ${hourLabel(String(b.hour), true).split(' (')[0]}` : ''}${stem != null ? ` · Day Master ${STEMS_HANJA[stem]} ${ELEM_EN[stemElement(stem)]}` : ''}`,
  birthTitle: 'Birth date', solar: 'solar calendar', year: 'Year', month: 'Month', day: 'Day',
  hourTitle: 'Birth hour', hourSub: 'optional', hourUnknown: 'Don’t know',
  go: 'See today’s fortune',
  privacy: 'Your birth date never leaves this device.', fun: 'Saju is a tradition to enjoy for fun — it never judges anyone.',
  needBirth: 'Please pick your birth date.', badBirth: 'Please check your birth date.',
  sFortune: 'Today’s fortune', sColor: 'Today’s colour', sLuck: 'Your strongest lucks',
  colorTip: 'Wear it — clothes, accessories, or a lip or blush accent.',
  luckyKicker: 'Today’s lucky makeup', luckyLine: (n: string) => `Try ${n} makeup on my face`,
  again: 'Try another birth date',
}
