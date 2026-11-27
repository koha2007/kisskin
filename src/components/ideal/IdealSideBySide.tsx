// "이상형 옆에 선 나" — 맛보기(무료·저화질·워터마크) → 고화질(크레딧 1개) (2026-11-25)
// 규칙(docs/IDEAL_TYPE_PLAN.md): 내 셀카가 들어가 AI가 새로 그리면 유료, 첫 1장(한 번만, 11/27)은 맛보기.
// 본인 사진만(동의 체크) · 상대는 AI 가상 인물 · 결과 이미지에 "AI 생성" 표시를 박는다(AI 기본법 31조).
// 11/26: 내 얼굴 메이크업 = K-pop 아이돌 고정 · 장소 9곳(SidePlace) · kind 'solo' = 이상형 혼자 스튜디오 컷(셀카 없음).
// 로그인·충전 왕복: 셀카를 세션에 맡기고 ?side=1#side 로 돌아온다.
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { trackEvent } from '../../lib/analytics'
import { stampLabel, stampPreview } from '../../lib/aiStamp'
import { fitPreserveAspect } from '../../lib/makeup/compose'
import { keepPendingSelfie, takePendingSelfie } from '../../lib/makeup/pendingSelfie'
import { newJobId } from '../../lib/makeup/generateLook'
import { startPackCheckout } from '../../lib/makeup/packCheckout'
import { IDEAL_EXAMPLES, IDEAL_PAID_SAMPLES } from '../home/HomeIdealBanner'
import { SIDE_PLACE_LABEL, type IdealGender, type IdealOutfit, type IdealTypeCode, type SidePlace } from '../../lib/ideal-type/types'

type St = { k: 'idle' } | { k: 'busy'; hd: boolean } | { k: 'done'; image: string; hd: boolean } | { k: 'error'; msg: string; action?: 'login' | 'topup' }
const JOB_KEY = 'kisskin_ideal_side_job'
export type IdealCutKind = 'side' | 'solo'

export default function IdealSideBySide({ isEn, code, g, place, name, hideSamples = false, step, kind = 'side', outfit = 'type' }: { isEn: boolean; code: IdealTypeCode; g: IdealGender; place: SidePlace; name: string; hideSamples?: boolean; step?: string; kind?: IdealCutKind; outfit?: IdealOutfit }) {
  const solo = kind === 'solo'
  const jobKey = `${JOB_KEY}_${kind}`
  const [photo, setPhoto] = useState<string | null>(null)
  const [agree, setAgree] = useState(false)
  const [st, setSt] = useState<St>({ k: 'idle' })
  const fileRef = useRef<HTMLInputElement>(null)

  // 로그인·결제 복귀 — 맡겨 둔 셀카 되살리기
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get('side') !== '1' && q.get('paid') !== '1') return
    const p = takePendingSelfie()
    if (p) { setPhoto(p); setAgree(true); keepPendingSelfie(p) }
  }, [])
  // 고른 장면이 바뀌면 이전 결과를 지운다
  useEffect(() => { setSt({ k: 'idle' }) }, [code, g, place, kind, outfit])

  const pick = (f: File | undefined) => {
    if (!f) return
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => { setPhoto(fitPreserveAspect(img).canvas.toDataURL('image/jpeg', 0.9)); URL.revokeObjectURL(url); setSt({ k: 'idle' }) }
    img.src = url
  }

  const backHere = () => {
    const p = new URLSearchParams(window.location.search); p.set('side', '1')
    return `${window.location.pathname}?${p.toString()}#side`
  }

  const run = async (hd: boolean) => {
    if (!solo && (!photo || !agree)) return
    setSt({ k: 'busy', hd })
    let token: string | undefined
    if (hd) {
      const { data: { session } } = await supabase.auth.getSession()
      token = session?.access_token
      if (!token) { if (photo) keepPendingSelfie(photo); window.location.href = '/auth?next=' + encodeURIComponent(backHere()); return }
    }
    // 같은 작업 재시도 = 같은 jobId(이중 차감 X)
    let jobId = ''
    if (hd) { try { jobId = sessionStorage.getItem(jobKey) || '' } catch { /* noop */ } if (!jobId) { jobId = newJobId(); try { sessionStorage.setItem(jobKey, jobId) } catch { /* noop */ } } }
    trackEvent(hd ? 'ideal_side_hd' : 'ideal_side_preview', { result_slug: code, place: solo ? 'studio' : place, cut: kind, outfit })
    try {
      const res = await fetch('/api/ideal-side', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ image: solo ? undefined : photo, type: code, g, place, kind, outfit, mode: hd ? 'credit' : 'preview', jobId }),
      })
      const d = (await res.json().catch(() => ({}))) as { image?: string; error?: string; moderation?: boolean }
      if (res.ok && d.image) {
        const image = hd ? await stampLabel(d.image, isEn) : await stampPreview(d.image, isEn)
        if (hd) { try { sessionStorage.removeItem(jobKey) } catch { /* noop */ } trackEvent('ideal_side_hd_done', { result_slug: code, cut: kind }) }
        setSt({ k: 'done', image, hd }); return
      }
      if (res.status === 401) { if (photo) keepPendingSelfie(photo); setSt({ k: 'error', msg: isEn ? 'Please log in to get the HD photo.' : '고화질은 로그인 후 받을 수 있어요.', action: 'login' }); return }
      if (res.status === 402) { if (photo) keepPendingSelfie(photo); setSt({ k: 'error', msg: isEn ? 'No credits left. Top up 5 credits ($2.99) and come right back.' : '크레딧이 없어요. 5개($2.99) 충전하면 바로 이어서 만들어요.', action: 'topup' }); return }
      if (d.error === 'preview_used' || d.error === 'preview_cap') { setSt({ k: 'error', msg: isEn ? 'Your free preview is used. Get the HD photo for 1 credit.' : '무료 맛보기는 이미 썼어요. 고화질은 크레딧 1개로 받을 수 있어요.' }); return }
      setSt({ k: 'error', msg: d.moderation && !solo ? (isEn ? 'This photo could not be used. Try a clear, front-facing selfie.' : '이 사진으로는 만들 수 없어요. 정면이 잘 보이는 셀카로 다시 해 주세요.') : (isEn ? 'Generation failed. Tap again — you won\'t be charged twice.' : '만들지 못했어요. 다시 눌러 주세요. 두 번 차감되지 않아요.') })
    } catch { setSt({ k: 'error', msg: isEn ? 'Network error. Please try again.' : '연결이 끊겼어요. 다시 시도해 주세요.' }) }
  }

  const save = async () => {
    if (st.k !== 'done') return
    trackEvent('ideal_side_save', { result_slug: code, hd: st.hd, cut: kind })
    const blob = await (await fetch(st.image)).blob()
    const file = new File([blob], `kissinskin-ideal-${code}${solo ? '-studio' : ''}.jpg`, { type: 'image/jpeg' })
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: solo ? (isEn ? 'My ideal type' : '나만의 이상형') : (isEn ? 'Me & my ideal type' : '이상형 옆에 선 나') }); return } catch { /* 취소 */ } }
    const a = document.createElement('a'); a.href = st.image; a.download = file.name; a.click()
  }

  const busy = st.k === 'busy'
  return (
    <section id="side" aria-labelledby="ideal-side" className="mx-auto mt-12 max-w-[760px] scroll-mt-20 rounded-3xl p-5 text-white md:p-8" style={{ background: '#070953' }}>
      <p className="text-[12px] font-extrabold tracking-[0.2em] text-[#ef4da0]">{solo ? (isEn ? 'MY IDEAL TYPE · STUDIO' : '나만의 이상형 · 스튜디오 컷') : (isEn ? 'ME + MY IDEAL TYPE' : '이상형 옆에 선 나')}</p>
      <h2 id="ideal-side" className="mt-1 text-[24px] font-extrabold leading-tight tracking-[-0.03em] md:text-[30px] break-keep">{step ? `${step} ` : ''}{solo ? (isEn ? `Your ${name} ideal type, in a studio photo` : `${name} 이상형, 스튜디오 프로필 사진으로`) : (isEn ? `A date photo of you and your ${name}` : `${name} 이상형과 함께 찍은 데이트 사진`)}</h2>
      <p className="mt-2 text-[14px] leading-snug text-white/80 break-keep">{solo
        ? (isEn ? 'No selfie needed — your ideal type alone, shot like a magazine profile on one studio backdrop. Every photo comes out a little different. First preview free (low-res, watermarked) · HD = 1 credit.' : '셀카 없이 이상형 혼자, 스튜디오 배경 하나로 찍은 프로필 사진. 만들 때마다 조금씩 다른 나만의 이상형이 나와요. 첫 맛보기 무료(저화질·워터마크) · 고화질 크레딧 1개.')
        : (isEn ? `One selfie → you and your ideal type at the ${SIDE_PLACE_LABEL[place].en.toLowerCase()}, with K-pop idol makeup on your face. First preview free (low-res, watermarked) · HD = 1 credit.` : `셀카 한 장이면 ${SIDE_PLACE_LABEL[place].ko}에서 이상형과 나란히, 내 얼굴엔 K-pop 아이돌 메이크업. 첫 맛보기 무료(저화질·워터마크) · 고화질 크레딧 1개.`)}</p>

      {/* 예시 3장 — 운영자 본인 사진으로 만든 실제 결과(배경 다름) */}
      {st.k !== 'done' && !hideSamples && !solo && (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {IDEAL_PAID_SAMPLES.map((src, i) => <img key={src} src={src} alt={isEn ? `Example ${i + 1}: a user photo with an ideal type, AI-generated` : `예시 ${i + 1}: 사용자 사진으로 만든 결과, AI 생성`} width={213} height={320} loading="lazy" className="aspect-[2/3] w-full rounded-xl object-cover" />)}
          </div>
          <p className="mt-1.5 text-[11px] text-white/60 break-keep">{isEn ? 'Examples — your face stays your face, with K-pop idol makeup and an idol hair colour.' : '예시 — 얼굴은 내 얼굴 그대로, K-pop 아이돌 메이크업과 아이돌 헤어 컬러로 나와요.'}</p>
        </div>
      )}

      {/* 단독 컷 예시 4장 — 11/26 시험 생성(가상 인물, 'AI 생성 · 가상 인물' 박음) */}
      {st.k !== 'done' && solo && (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {IDEAL_EXAMPLES.solo.map((f) => <img key={f} src={f} alt={isEn ? 'Example studio shot, AI-generated fictional person' : '스튜디오 컷 예시, AI 생성 가상 인물'} width={160} height={240} loading="lazy" className="aspect-[2/3] w-full rounded-xl object-cover" />)}
          </div>
          <p className="mt-1.5 text-[11px] text-white/60 break-keep">{isEn ? 'Examples — one studio backdrop for every shot; makeup changes with the face type.' : '예시 — 배경은 모두 같은 스튜디오, 메이크업은 상마다 달라요.'}</p>
        </div>
      )}

      <div className={`mt-5 grid gap-5 ${solo ? 'md:max-w-[420px]' : 'md:grid-cols-[200px_minmax(0,1fr)]'}`}>
        {!solo && <button type="button" onClick={() => fileRef.current?.click()} className="flex aspect-[3/4] w-[150px] md:w-full md:max-w-[200px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/40 bg-white/5 text-[14px] font-bold">
          {photo ? <img src={photo} alt={isEn ? 'Your selfie' : '내 셀카'} className="h-full w-full object-cover" /> : <span className="px-3 text-center">{isEn ? '+ Add a selfie (front-facing)' : '+ 셀카 올리기 (정면)'}</span>}
        </button>}
        {!solo && <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />}
        <div className="flex flex-col gap-3">
          {/* 11/26 운영자: 어떤 사진을 넣어야 하는지 짧게 — 얼굴만 나와도 된다, 몸·옷은 AI가 만든다 */}
          {!solo && (
            <div className="rounded-2xl bg-white/10 p-3 text-[13px] leading-snug break-keep">
              <p className="font-extrabold">{isEn ? 'Which photo?' : '어떤 사진을 넣나요?'}</p>
              <ul className="mt-1 space-y-0.5 text-white/85">
                <li>✅ {isEn ? 'One clear, front-facing photo of your face — a selfie or ID photo is fine.' : '얼굴 정면이 잘 보이는 사진 1장 — 셀카·증명사진 OK'}</li>
                <li>✅ {isEn ? 'Face only is enough: body, outfit and background are made by AI.' : '얼굴만 나와도 돼요. 몸·옷·배경은 AI가 자동으로 만들어요'}</li>
                <li>❌ {isEn ? 'Avoid sunglasses, masks, group photos, heavy filters or dark photos.' : '선글라스·마스크·여러 명·강한 필터·어두운 사진은 피해 주세요'}</li>
              </ul>
            </div>
          )}
          {!solo && <label className="flex items-start gap-2 text-[13px] leading-snug text-white/85 break-keep">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#ef4da0]" />
            <span>{isEn ? 'This is a photo of me (not someone else), and I am 14 or older. The other person is a fictional AI character.' : '내 사진이에요(다른 사람 사진 X), 만 14세 이상이에요. 옆 사람은 AI 가상 인물이에요.'}</span>
          </label>}
          <button type="button" disabled={(!solo && (!photo || !agree)) || busy} onClick={() => run(false)} className="min-h-[48px] rounded-full border border-white px-5 text-[15px] font-extrabold disabled:opacity-40">
            {busy && !st.hd ? (isEn ? 'Making… (up to 1 min)' : '만드는 중… (최대 1분)') : (isEn ? 'Free preview (low-res)' : '무료 맛보기 (저화질)')}
          </button>
          <button type="button" disabled={(!solo && (!photo || !agree)) || busy} onClick={() => run(true)} className="min-h-[48px] rounded-full px-5 text-[15px] font-extrabold text-navy disabled:opacity-40" style={{ background: '#ef4da0' }}>
            {busy && st.hd ? (isEn ? 'Making HD… (up to 1 min)' : '고화질 만드는 중… (최대 1분)') : (isEn ? 'Get HD · 1 credit' : '고화질로 받기 · 크레딧 1개')}
          </button>
          <p className="text-[11px] leading-snug text-white/60 break-keep">{solo ? (isEn ? 'A fictional AI person — not anyone real. Every result carries an "AI-generated" label.' : 'AI가 만든 가상 인물이에요(실존 인물 아님). 결과에는 "AI 생성" 표시가 들어가요.') : (isEn ? 'Your selfie is sent to the AI only to make this photo and is not stored. Every result carries an "AI-generated" label.' : '셀카는 이 사진을 만드는 데만 AI로 보내고 저장하지 않아요. 결과에는 "AI 생성" 표시가 들어가요.')}</p>
        </div>
      </div>

      {st.k === 'error' && (
        <div className="mt-4 rounded-2xl bg-white/10 p-3 text-[14px] break-keep" role="alert">
          {st.msg}
          {st.action === 'login' && <a href={'/auth?next=' + encodeURIComponent(backHere())} className="ml-2 font-extrabold underline">{isEn ? 'Log in' : '로그인'}</a>}
          {st.action === 'topup' && <button type="button" onClick={() => { void startPackCheckout({ id: 'starter', credits: 5, value: 2.99 }, window.location.pathname) }} className="ml-2 font-extrabold underline">{isEn ? 'Top up' : '충전하기'}</button>}
        </div>
      )}
      {st.k === 'done' && (
        <figure className="mt-5">
          <img src={st.image} alt={solo ? (isEn ? 'Your ideal type in a studio photo, AI-generated fictional person' : '스튜디오 컷 이상형, AI 생성 가상 인물') : (isEn ? 'You and your ideal type, AI-generated' : '이상형 옆에 선 나, AI 생성')} className="mx-auto w-full max-w-[420px] rounded-2xl" />
          <figcaption className="mt-3 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => void save()} className="min-h-[44px] rounded-full bg-white px-5 text-[14px] font-extrabold text-navy">{isEn ? 'Save / share' : '저장·공유'}</button>
            {!st.hd && <button type="button" onClick={() => run(true)} className="min-h-[44px] rounded-full px-5 text-[14px] font-extrabold text-navy" style={{ background: '#ef4da0' }}>{isEn ? 'Get it in HD · 1 credit' : '고화질로 받기 · 크레딧 1개'}</button>}
          </figcaption>
        </figure>
      )}
    </section>
  )
}
