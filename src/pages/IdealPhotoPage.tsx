// 유료 "이상형 옆에 선 나" 전용 페이지 (2026-11-25, 운영자: 유료 입구가 무료 퀴즈와 같으면 안 된다)
// 퀴즈 없이 바로: ① 예시 3장 ② 이상형 고르기(성별·유형 8·장소 4) ③ 셀카 → 맛보기 무료 / 고화질 크레딧 1개.
// 11/26: 컷 2종(나+이상형 데이트컷 / 이상형 단독 스튜디오컷) · 장소 9곳(10·20대 인기 5곳 추가) · 내 메이크업 = K-pop 아이돌.
// 이상형을 모르면 1분 테스트로. 고른 값은 주소(?t=&g=&p=)와 세션에 둔다(로그인·결제 왕복 대비).
import { useEffect, useState } from 'react'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import IdealSideBySide, { type IdealCutKind } from '../components/ideal/IdealSideBySide'
import { IDEAL_EXAMPLES } from '../components/home/HomeIdealBanner'
import { IDEAL_MAKEUP, IDEAL_ORDER, IDEAL_TYPES, NEW_SIDE_PLACES, idealBadge, SIDE_PLACES, SIDE_PLACE_LABEL, idealCardImage, refPlace, type IdealGender, type IdealTypeCode, type SidePlace } from '../lib/ideal-type/types'
import { trackEvent } from '../lib/analytics'
import { useI18n } from '../i18n/I18nContext'

const PICK_KEY = 'kisskin_ideal_photo_pick'

export default function IdealPhotoPage() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const [code, setCode] = useState<IdealTypeCode>('golden-retriever')
  const [g, setG] = useState<IdealGender>('m')
  const [place, setPlace] = useState<SidePlace>('picnic')
  const [kind, setKind] = useState<IdealCutKind>('side')

  // 주소 → 세션 순으로 되살린다(결제 복귀는 경로만 남아서)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    let t = q.get('t'), gg = q.get('g'), p = q.get('p'), c = q.get('c')
    if (!t) { try { const s = JSON.parse(sessionStorage.getItem(PICK_KEY) || 'null') as { t?: string; g?: string; p?: string; c?: string } | null; t = s?.t ?? null; gg = s?.g ?? null; p = s?.p ?? null; c = s?.c ?? null } catch { /* noop */ } }
    if (c === 'solo' || c === 'side') setKind(c)
    if (t && (IDEAL_ORDER as string[]).includes(t)) setCode(t as IdealTypeCode)
    if (gg === 'm' || gg === 'f') setG(gg)
    if (p && (SIDE_PLACES as string[]).includes(p)) setPlace(p as SidePlace)
  }, [])
  useEffect(() => {
    try { sessionStorage.setItem(PICK_KEY, JSON.stringify({ t: code, g, p: place, c: kind })) } catch { /* noop */ }
    const q = new URLSearchParams(window.location.search); q.set('t', code); q.set('g', g); q.set('p', place); q.set('c', kind)
    window.history.replaceState(null, '', `${window.location.pathname}?${q.toString()}${window.location.hash}`)
  }, [code, g, place, kind])

  const t = IDEAL_TYPES[code]
  const quiz = isEn ? '/en/tools/ideal-type/' : '/tools/ideal-type/'
  const chip = (on: boolean) => `min-h-[40px] rounded-full border px-4 text-[14px] font-extrabold ${on ? 'border-navy bg-navy text-white' : 'border-navy bg-white text-navy'}`

  return (
    <div className="font-display bg-background-light min-h-screen text-navy">
      <ToolsNav />
      <main className="mx-auto max-w-[1080px] px-5 pb-16 pt-6 md:px-6 md:pt-10">
        <span className="inline-block rounded-full px-2.5 py-0.5 text-[12px] font-extrabold text-navy" style={{ background: '#ef4da0' }}>{isEn ? 'PAID · 1st preview free' : '유료 · 첫 맛보기 무료'}</span>
        <h1 className="mt-2 text-[32px] font-extrabold leading-tight tracking-[-0.04em] md:text-[50px] break-keep">{isEn ? 'Me + my ideal type' : '이상형 옆에 선 나'}</h1>
        <p className="mt-2 max-w-[640px] text-[16px] leading-snug md:text-[18px] break-keep">{isEn ? 'Pick your ideal type, add one selfie — get a date photo of the two of you, with K-pop idol makeup on your face. Or get your ideal type alone in a studio shot.' : '이상형을 고르고 셀카 한 장만 올리면, 둘이 함께 찍은 데이트 사진이 나와요. 내 얼굴엔 K-pop 아이돌 메이크업까지. 이상형 혼자 찍은 스튜디오 컷도 받을 수 있어요.'}</p>
        <ul className="mt-3 flex flex-wrap gap-2 text-[13px] font-bold">
          <li className="rounded-full bg-white px-3 py-1.5 shadow-sm">{isEn ? 'Preview: free, no sign-up (1/day, low-res)' : '맛보기: 무료·가입 없이 (하루 1장, 저화질)'}</li>
          <li className="rounded-full bg-white px-3 py-1.5 shadow-sm">{isEn ? 'HD: 1 credit · 5 credits $2.99' : '고화질: 크레딧 1개 · 5개 $2.99'}</li>
        </ul>

        {/* ① 예시 */}
        <section aria-labelledby="photo-ex" className="mt-6">
          <h2 id="photo-ex" className="text-[15px] font-extrabold">{isEn ? 'Examples — 9 photos made with this tool' : '예시 9장 — 실제로 이 기능으로 만든 사진'}</h2>
          {([
            ['m', isEn ? 'A man\'s selfie + his ideal type (operator\'s photo)' : '남자 사용자 + 이상형 데이트 (운영자 사진)', IDEAL_EXAMPLES.m],
            ['f', isEn ? 'A woman\'s selfie + her ideal type (sample model)' : '여자 사용자 + 이상형 데이트 (예시 모델)', IDEAL_EXAMPLES.f],
            ['solo', isEn ? 'Ideal type alone — studio shot (no selfie)' : '이상형 단독 — 스튜디오 컷 (셀카 없이)', IDEAL_EXAMPLES.solo],
          ] as const).map(([k, label, srcs]) => (
            <div key={k} className="mt-3">
              <h3 className="text-[13px] font-bold text-slate-600 break-keep">{label}</h3>
              <div className="mt-1.5 grid grid-cols-3 gap-2 md:gap-4">
                {srcs.map((src, i) => <img key={src} src={src} alt={isEn ? `${label} — example ${i + 1}, AI-generated` : `${label} — 예시 ${i + 1}, AI 생성 사진`} width={320} height={480} loading={k === 'm' ? undefined : 'lazy'} className="aspect-[2/3] w-full rounded-2xl object-cover" />)}
              </div>
            </div>
          ))}
        </section>

        {/* ② 이상형 고르기 */}
        <section aria-labelledby="photo-pick" className="mt-8">
          <h2 id="photo-pick" className="text-[22px] font-extrabold tracking-[-0.03em]">{isEn ? '1. Pick your ideal type' : '1. 이상형 고르기'}</h2>
          <p className="mt-1 text-[13px] text-slate-600 break-keep">{isEn ? 'Not sure? ' : '내 이상형을 모르겠다면 '}<a href={quiz} onClick={() => trackEvent('ideal_photo_to_quiz')} className="font-extrabold underline">{isEn ? 'Take the free 1-minute test →' : '무료 1분 테스트로 찾기 →'}</a></p>
          <div className="mt-3 flex gap-2" role="group" aria-label={isEn ? 'Gender' : '성별'}>
            <button type="button" aria-pressed={g === 'm'} onClick={() => setG('m')} className={chip(g === 'm')}>{isEn ? 'A man' : '남자'}</button>
            <button type="button" aria-pressed={g === 'f'} onClick={() => setG('f')} className={chip(g === 'f')}>{isEn ? 'A woman' : '여자'}</button>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 md:gap-3">
            {IDEAL_ORDER.map((c) => { const x = IDEAL_TYPES[c]; const on = c === code; return (
              <button key={c} type="button" aria-pressed={on} onClick={() => { setCode(c); trackEvent('ideal_photo_pick', { result_slug: c }) }} className={`overflow-hidden rounded-xl border-2 bg-white text-left ${on ? 'border-navy ring-2 ring-navy/25' : 'border-transparent'}`}>
                <span className="relative block">
                  <img src={idealCardImage(c, g, refPlace(place))} alt={isEn ? `${x.en}, AI illustration` : `${x.ko}, AI 일러스트`} width={174} height={228} loading="lazy" className="aspect-[580/760] w-full object-cover" />
                  <img src={idealBadge(c)} alt="" aria-hidden="true" width={44} height={44} loading="lazy" className="absolute left-1 top-1 h-8 w-8 drop-shadow md:h-11 md:w-11" />
                </span>
                <span className="block truncate px-1.5 py-1 text-[12px] font-extrabold md:text-[14px]">{isEn ? x.en : x.ko}</span>
              </button>
            ) })}
          </div>
          <h3 className="mt-5 text-[15px] font-extrabold">{isEn ? 'Which photo?' : '어떤 사진?'}</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 md:max-w-[560px]" role="group" aria-label={isEn ? 'Photo type' : '사진 종류'}>
            {([
              ['side', isEn ? 'Me + my ideal type' : '나 + 이상형 데이트컷', isEn ? 'Selfie · date place' : '셀카 필요 · 장소 선택'],
              ['solo', isEn ? 'My ideal type alone' : '이상형 단독 컷', isEn ? 'No selfie · studio' : '셀카 없이 · 스튜디오 배경'],
            ] as const).map(([k, a, b]) => (
              <button key={k} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); trackEvent('ideal_photo_cut', { cut: k }) }} className={`rounded-2xl border-2 px-3 py-2.5 text-left ${kind === k ? 'border-navy bg-navy text-white' : 'border-navy bg-white text-navy'}`}>
                <span className="block text-[14px] font-extrabold break-keep">{a}</span>
                <span className={`block text-[12px] ${kind === k ? 'text-white/75' : 'text-slate-600'}`}>{b}</span>
              </button>
            ))}
          </div>
          {kind === 'side' && <>
            <h3 className="mt-5 text-[15px] font-extrabold">{isEn ? 'Date place' : '데이트 장소'}</h3>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={isEn ? 'Date place' : '데이트 장소'}>
              {SIDE_PLACES.map((p) => <button key={p} type="button" aria-pressed={place === p} onClick={() => setPlace(p)} className={chip(place === p)}>{isEn ? SIDE_PLACE_LABEL[p].en : SIDE_PLACE_LABEL[p].ko}{NEW_SIDE_PLACES.includes(p) && <span className={`ml-1 text-[10px] font-extrabold ${place === p ? 'text-[#ef4da0]' : 'text-[#d6247f]'}`}>NEW</span>}</button>)}
            </div>
          </>}
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white p-3 shadow-sm md:max-w-[640px]">
            <img src={idealBadge(code)} alt={isEn ? `${t.en} badge` : `${t.ko} 뱃지`} width={64} height={64} className="h-14 w-14 shrink-0 md:h-16 md:w-16" />
            <div className="min-w-0 text-[13px] leading-snug break-keep md:text-[14px]">
              <p><strong className="text-[15px]">{isEn ? t.en : t.ko}</strong> · {isEn ? t.taglineEn : t.taglineKo}</p>
              <p className="mt-1"><span className="font-extrabold">{isEn ? 'Their makeup: ' : '이상형 메이크업: '}</span>{isEn ? IDEAL_MAKEUP[code].en : IDEAL_MAKEUP[code].ko}</p>
              {kind === 'side' && <p><span className="font-extrabold">{isEn ? 'Your makeup: ' : '내 메이크업: '}</span>{isEn ? 'K-pop idol makeup' : 'K-pop 아이돌 메이크업'}</p>}
            </div>
          </div>
        </section>

        {/* ③ 셀카 → 만들기 */}
        <IdealSideBySide isEn={isEn} code={code} g={g} place={place} name={isEn ? t.en : t.ko} hideSamples step="2." kind={kind} />
      </main>
      <ToolsFooter />
    </div>
  )
}
