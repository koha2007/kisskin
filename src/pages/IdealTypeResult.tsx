// AI 이상형 테스트 — 유형 페이지 겸 내 결과 (2026-11-25, docs/IDEAL_TYPE_PLAN.md)
// 같은 주소가 두 역할: ① 검색용 고정 페이지(쿼리 없음 → 남·여 그림 둘 다) ② 퀴즈 결과(?g=&a= → 내 성별·장소 그림,
// 답 배지, AI 한 줄). 쿼리는 마운트 뒤에만 읽는다(정적 HTML 과 첫 렌더를 같게 → 하이드레이션 오류 방지).
// 테스트 결과는 잠그지 않는다(16Personalities 불만 교훈). 그림은 모두 AI 일러스트 — 화면·카드에 표시.
import { useEffect, useMemo, useState } from 'react'
import { IDEAL_ORDER, IDEAL_PLACES, IDEAL_TYPES, PLACE_LABEL, idealImage, type IdealGender, type IdealPlace, type IdealTypeCode } from '../lib/ideal-type/types'
import { IQ_QUESTIONS, decodeAnswers, placeOf } from '../lib/ideal-type/questions'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import IdentityCard from '../components/IdentityCard'
import ShareBar from '../components/ShareBar'
import { TypePreviewCard } from '../components/tools/ToolLanding'
import { EmailSubscribe } from '../components/EmailSubscribe'
import { localizeCard } from '../lib/identityCard/types'
import { LOOK_HERO } from '../lib/makeup/lookImages'
import { styleById } from '../lib/makeup/styles'
import { trackEvent } from '../lib/analytics'
import IdealSideBySide from '../components/ideal/IdealSideBySide'
import { useI18n } from '../i18n/I18nContext'

const LAST_KEY = 'kisskin_ideal_last'

interface Mine { g: 'm' | 'f' | 'a'; answers: number[]; place: IdealPlace }

export default function IdealTypeResult({ code }: { code: IdealTypeCode }) {
  const t = IDEAL_TYPES[code]
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const basePath = isEn ? '/en/tools/ideal-type' : '/tools/ideal-type'
  const [mine, setMine] = useState<Mine | null>(null)
  const [shown, setShown] = useState<IdealGender>('f')
  const [aiLine, setAiLine] = useState<string | null>(null)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    // 로그인·결제 왕복(?side=1·?paid=1)에서 g·a 가 빠지면 이 탭에 적어 둔 내 결과로 되살린다
    if (!p.get('a') && (p.get('side') === '1' || p.get('paid') === '1')) {
      try { const last = JSON.parse(sessionStorage.getItem(LAST_KEY) || 'null') as { code?: string; g?: string; a?: string } | null; if (last?.code === code && last.g && last.a) { p.set('g', last.g); p.set('a', last.a) } } catch { /* noop */ }
    }
    const answers = decodeAnswers(p.get('a'))
    const g = p.get('g')
    if (!answers || (g !== 'm' && g !== 'f' && g !== 'a')) return
    setMine({ g, answers, place: placeOf(answers) })
    try { sessionStorage.setItem(LAST_KEY, JSON.stringify({ code, g, a: p.get('a') })) } catch { /* noop */ }
    setShown(g === 'm' ? 'm' : 'f')
    // AI 한 줄 — 실패·한도 초과면 미리 쓴 문장 그대로(202 fallback)
    const ctrl = new AbortController()
    fetch('/api/ideal-line', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
      body: JSON.stringify({ type: code, g: g === 'a' ? 'f' : g, a: p.get('a'), lang: isEn ? 'en' : 'ko' }) })
      .then((r) => (r.ok ? r.json() : null)).then((j: { line?: string } | null) => { if (j?.line) setAiLine(j.line) }).catch(() => {})
    return () => ctrl.abort()
  }, [code, isEn])

  const [placeOverride, setPlaceOverride] = useState<IdealPlace | null>(null)
  const place: IdealPlace = placeOverride ?? mine?.place ?? 'picnic'
  const name = isEn ? t.en : t.ko
  const look = styleById(t.look)
  const lookHref = isEn ? '/en/makeup/' : `/analysis/?style=${t.look}`

  // 카드: 닉네임·한 줄(AI 있으면 교체)·해시태그(유형 키워드 2 + 내 답 배지 2)
  const card = useMemo(() => {
    const base = localizeCard(t.card, isEn)
    const tags = base.hashtags.slice(0, 2)
    if (mine) for (const i of [0, 2]) { const op = IQ_QUESTIONS[i].options[mine.answers[i]]; tags.push(`#${(isEn ? op.en : op.ko).replace(/\s+/g, '')}`) }
    else tags.push(...base.hashtags.slice(2))
    return { ...base, identityLine: aiLine ?? base.identityLine, hashtags: tags }
  }, [t, isEn, mine, aiLine])

  const shareUrl = `https://kissinskin.net${basePath}/${code}/`
  const shareText = isEn ? `My ideal type is the ${t.en} ${t.emoji}\n${t.taglineEn}\n\n` : `내 이상형은 ${t.ko} ${t.emoji}\n${t.taglineKo}\n\n`
  const both = !mine || mine.g === 'a'

  return (
    <div className="font-display bg-background-light min-h-screen text-navy">
      <ToolsNav />
      <main className="mx-auto max-w-[1080px] px-5 pb-16 pt-6 md:px-6 md:pt-10">
        <p className="text-[13px] font-extrabold tracking-[0.2em]" style={{ color: t.color }}>{mine ? (isEn ? 'YOUR IDEAL TYPE' : '나의 이상형') : (isEn ? 'IDEAL TYPE' : '이상형 유형')}</p>
        <h1 className="mt-1 text-[34px] font-extrabold leading-tight tracking-[-0.04em] md:text-[52px]">{t.emoji} {name}{!isEn && <span className="ml-2 text-[18px] font-bold text-slate-500 md:text-[24px]">{t.en}</span>}</h1>
        <p className="mt-2 text-[17px] font-semibold leading-snug md:text-[20px] break-keep">{isEn ? t.taglineEn : t.taglineKo}</p>

        <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
          {/* 그림 — 성별 둘 다 보기(검색 방문·상관없음)면 나란히, 아니면 크게 한 장 */}
          {mine && !both ? (
            <div>
              <IdentityCard label={isEn ? 'IDEAL TYPE' : '나의 이상형'} emoji={t.emoji} card={card} illustration={idealImage(code, shown, place)} fileSlug={`ideal-${code}`}
                saveLabel={isEn ? 'Save image' : '이미지 저장하기'} isEn={isEn} share={{ url: shareUrl, text: shareText, title: isEn ? `Ideal type: ${t.en}` : `이상형: ${t.ko}` }} shareLabel={isEn ? 'Share' : '공유하기'} />
              <p className="mt-2 text-center text-[12px] text-slate-500 break-keep">{isEn ? `First date: ${PLACE_LABEL[place].en} · AI-generated illustration, not a real person` : `첫 데이트: ${PLACE_LABEL[place].ko} · AI로 그린 일러스트예요(실제 인물 아님)`}{aiLine ? (isEn ? ' · the line was written by AI from your answers' : ' · 카드 속 한 줄은 내 답을 보고 AI가 썼어요') : ''}</p>
            </div>
          ) : (
          <figure>
            {both ? (
              <div className="grid grid-cols-2 gap-2.5">
                {(['f', 'm'] as IdealGender[]).map((g) => (
                  <button key={g} type="button" onClick={() => setShown(g)} aria-pressed={shown === g} className={`overflow-hidden rounded-2xl border-2 ${shown === g ? 'border-navy' : 'border-transparent'}`}>
                    <img src={idealImage(code, g, place)} alt={isEn ? `${t.en} ideal type, ${g === 'm' ? 'man' : 'woman'}, AI illustration` : `${t.ko} 이상형 ${g === 'm' ? '남자' : '여자'}, AI 일러스트`} width={512} height={576} className="aspect-[8/9] w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <img src={idealImage(code, shown, place)} alt={isEn ? `${t.en} ideal type at a ${PLACE_LABEL[place].en.toLowerCase()}, AI illustration` : `${PLACE_LABEL[place].ko}의 ${t.ko} 이상형, AI 일러스트`} width={1024} height={1152} className="aspect-[8/9] w-full rounded-3xl object-cover" />
            )}
            <figcaption className="mt-2 text-[12px] text-slate-500 break-keep">
              {mine ? (isEn ? `First date: ${PLACE_LABEL[place].en} · ` : `첫 데이트: ${PLACE_LABEL[place].ko} · `) : ''}{isEn ? 'AI-generated illustration, not a real person' : 'AI로 그린 일러스트예요(실제 인물 아님)'}{both ? (isEn ? ' · tap one to put it on your card' : ' · 누른 쪽이 카드에 들어가요') : ''}
            </figcaption>
          </figure>
          )}

          <div className="flex flex-col gap-6">
            <section aria-labelledby="ideal-face">
              <h2 id="ideal-face" className="border-b-2 border-navy pb-2 text-base font-extrabold">{isEn ? 'Their face' : '얼굴 인상'}</h2>
              <ul className="mt-2 flex flex-wrap gap-2">{(isEn ? t.faceEn : t.faceKo).map((x) => <li key={x} className="rounded-full border border-navy px-3 py-1.5 text-[14px] font-bold">{x}</li>)}</ul>
            </section>
            <section aria-labelledby="ideal-style">
              <h2 id="ideal-style" className="border-b-2 border-navy pb-2 text-base font-extrabold">{isEn ? 'Their style' : '패션'}</h2>
              <ul className="mt-2 flex flex-wrap gap-2">{(isEn ? t.fashionEn : t.fashionKo).map((x) => <li key={x} className="rounded-full border border-navy px-3 py-1.5 text-[14px] font-bold">{x}</li>)}</ul>
            </section>
            {mine && (
              <section aria-labelledby="ideal-mine">
                <h2 id="ideal-mine" className="border-b-2 border-navy pb-2 text-base font-extrabold">{isEn ? 'Your answers' : '내 답'}</h2>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {mine.answers.map((a, i) => { const q = IQ_QUESTIONS[i]; const op = q.options[a]; return <li key={q.id} className="rounded-full bg-white px-2.5 py-1 text-[12px] font-bold shadow-sm">{op.emoji} {isEn ? q.badgeEn : q.badgeKo} · {isEn ? op.en : op.ko}</li> })}
                </ul>
              </section>
            )}
            {/* 매출 동선 핵심 — 이 사람 만나는 날 내 메이크업 */}
            <a href={lookHref} onClick={() => trackEvent('ideal_to_makeup', { result_slug: code, look: t.look })} className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-4 rounded-3xl p-3 text-white" style={{ background: '#070953' }}>
              <img src={LOOK_HERO[t.look].after} alt={isEn ? `${look?.subEn ?? ''} makeup, AI-generated model` : `${look?.nameKo ?? ''} 메이크업, AI 생성 모델`} width={96} height={128} loading="lazy" className="aspect-[3/4] w-full rounded-2xl object-cover" />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-[12px] font-bold text-white/70">{isEn ? 'Your makeup for the day you meet them' : '이 사람 만나는 날 내 메이크업'}</span>
                <strong className="text-[18px] leading-tight">{isEn ? look?.subEn : look?.nameKo}</strong>
                <span className="text-[13px] leading-snug text-white/80 break-keep">{isEn ? t.lookWhyEn : t.lookWhyKo}</span>
                <span className="mt-1 text-[13px] font-extrabold" style={{ color: '#ef4da0' }}>{isEn ? 'Try it on my selfie →' : '내 셀카로 해 보기 →'}</span>
              </span>
            </a>
          </div>
        </div>

        {/* 공유 카드 — 화면 미리보기 = 저장 PNG. 내 결과(성별 하나)면 위에서 이미 보여 준다 */}
        {both && <section aria-labelledby="ideal-card" className="mx-auto mt-12 max-w-[420px]">
          <h2 id="ideal-card" className="mb-3 text-center text-[22px] font-extrabold tracking-[-0.03em]">{isEn ? 'Save & share your card' : '내 이상형 카드 저장·공유'}</h2>
          <IdentityCard label={isEn ? 'IDEAL TYPE' : '나의 이상형'} emoji={t.emoji} card={card} illustration={idealImage(code, shown, place)} fileSlug={`ideal-${code}`}
            saveLabel={isEn ? 'Save image' : '이미지 저장하기'} isEn={isEn} share={{ url: shareUrl, text: shareText, title: isEn ? `Ideal type: ${t.en}` : `이상형: ${t.ko}` }} shareLabel={isEn ? 'Share' : '공유하기'} />
          {mine && aiLine && <p className="mt-2 text-center text-[12px] text-slate-500 break-keep">{isEn ? 'The line on your card was written by AI from your answers.' : '카드 속 한 줄은 내 답을 보고 AI가 썼어요.'}</p>}
        </section>}

        {/* 유료 — 이상형 옆에 선 나(맛보기 무료 → 고화질 크레딧 1개) */}
        <IdealSideBySide isEn={isEn} code={code} g={shown} place={place} name={name} />

        {/* 11/25 데이트 장소별 4장 — 64장 전부 둘러보기(체류·이미지 검색). 누르면 카드 그림도 그 장면으로 */}
        <section aria-labelledby="ideal-places" className="mt-12">
          <h2 id="ideal-places" className="text-[22px] font-extrabold tracking-[-0.03em]">{isEn ? `The ${t.en} on 4 first dates` : `데이트 장소별 ${t.ko}`}</h2>
          <p className="mt-1 text-[13px] text-slate-500 break-keep">{isEn ? 'Tap a scene to put it on your card. AI-generated illustrations.' : '누르면 카드 그림이 그 장면으로 바뀌어요. AI 일러스트예요.'}</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {IDEAL_PLACES.map((pl) => (
              <button key={pl} type="button" onClick={() => { setPlaceOverride(pl); trackEvent('ideal_place_view', { result_slug: code, place: pl }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-pressed={place === pl}
                className={`overflow-hidden rounded-2xl border-2 bg-white text-left ${place === pl ? 'border-navy' : 'border-transparent'}`}>
                <img src={idealImage(code, shown, pl)} alt={isEn ? `${t.en} ideal type, ${shown === 'm' ? 'man' : 'woman'}, ${PLACE_LABEL[pl].en.toLowerCase()}, AI illustration` : `${PLACE_LABEL[pl].ko}의 ${t.ko} 이상형 ${shown === 'm' ? '남자' : '여자'}, AI 일러스트`} width={384} height={432} loading="lazy" className="aspect-[8/9] w-full object-cover" />
                <span className="block px-2 py-1.5 text-[13px] font-extrabold">{isEn ? PLACE_LABEL[pl].en : PLACE_LABEL[pl].ko}</span>
              </button>
            ))}
          </div>
          {both && (
            <div className="mt-3 flex gap-2" role="group" aria-label={isEn ? 'Show man or woman' : '남자·여자 보기'}>
              {(['f', 'm'] as IdealGender[]).map((g) => (
                <button key={g} type="button" onClick={() => setShown(g)} aria-pressed={shown === g} className={`min-h-[40px] rounded-full border px-4 text-[13px] font-extrabold ${shown === g ? 'border-navy bg-navy text-white' : 'border-navy'}`}>{g === 'f' ? (isEn ? 'Woman' : '여자') : (isEn ? 'Man' : '남자')}</button>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="ideal-more" className="mx-auto mt-12 max-w-[760px]">
          <h2 id="ideal-more" className="text-[24px] font-extrabold tracking-[-0.03em]">{isEn ? `About the ${t.en} type` : `${t.ko} 이상형은 이런 사람`}</h2>
          {(isEn ? t.bodyEn : t.bodyKo).map((para) => <p key={para.slice(0, 20)} className="mt-3 text-[16px] leading-relaxed break-keep">{para}</p>)}
        </section>

        <div className="mx-auto mt-10 max-w-[760px]">
          <ShareBar url={shareUrl} shareText={shareText} shareTitle={isEn ? `Ideal type: ${t.en}` : `이상형: ${t.ko}`} retakeUrl={`${basePath}/`} retakeLabel={isEn ? 'Take the test' : mine ? '다시 테스트하기' : '나도 테스트하기'} />
        </div>

        <section aria-labelledby="ideal-all" className="mt-12">
          <h2 id="ideal-all" className="mb-3 text-[22px] font-extrabold tracking-[-0.03em]">{isEn ? 'All 8 ideal types' : '8가지 이상형 전체 보기'}</h2>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {IDEAL_ORDER.map((c) => { const x = IDEAL_TYPES[c]; return <TypePreviewCard key={c} href={`${basePath}/${c}/`} emoji={x.emoji} name={isEn ? x.en : x.ko} sub={isEn ? x.ko : x.en} accent={x.color} image={idealImage(c, shown)} current={c === code} compact aspectClass="aspect-[4/5]" /> })}
          </div>
        </section>

        <div className="mx-auto mt-12 max-w-[560px]"><EmailSubscribe source="ideal-type" /></div>
      </main>
      <ToolsFooter />
    </div>
  )
}
