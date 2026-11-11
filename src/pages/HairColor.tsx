// 나만의 헤어 컬러 찾기 — /hair-color/ · /en/hair-color/ (2026-11-11)
// ─────────────────────────────────────────────────────────────────
// 운영자 11/11: "머리 헤어 염색만 바꿔주는 나만의 헤어 컬러 찾기."
// 무료: MediaPipe 머리카락 영역만 16색으로 즉시 바꿔 보기(기기 안, 서버 0원). 퍼스널컬러 4계절로 거르기.
// AI(크레딧 1개): 같은 색을 진짜 염색처럼 — 밝은 색(탈색이 필요한 색)은 무료 미리보기가 어색해서 AI 를 권한다.
// 모자·두건이면(이마 위가 머리카락 아님) 보이는 머리만 바뀐다고 알린다(looksEngine crownHairFraction).
import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import AiFinish from '../components/edit/AiFinish'
import ResultSaveEmail from '../components/makeup/ResultSaveEmail'
import { pickImage } from '../lib/nativePicker'
import { trackEvent } from '../lib/analytics'
import { LOOK_HERO } from '../lib/makeup/lookImages'
import { savePendingSelfieFromSrc, takePendingSelfie, keepPendingSelfie, clearPendingSelfie } from '../lib/makeup/pendingSelfie'
import { initEngine, buildHairMask, recolorHair, type Engine, type HairMask } from '../lib/makeup/looksEngine'
import { HAIR_COLORS, SEASON_LABEL, hairById, promptHair, type Season } from '../lib/hair/colors'
import { trackCheckoutReturn } from '../lib/purchaseTracking'

const DEMO = LOOK_HERO['autumn-berry'].before
const PENDING = 'hair:pending'

const KO = {
  kicker: 'HAIR COLOR · 헤어 컬러', title1: '나만의 헤어 컬러', title2: '염색 전에 먼저 보기',
  lead: '머리카락만 찾아서 색을 바꿔요. 얼굴·옷·배경은 그대로. 16가지 색을 무료로 바로 바꿔 보고, 마음에 드는 색은 AI 가 진짜 염색한 것처럼 만들어 드려요.',
  strip: [['16가지 색', '무료'], ['계절 추천', '무료'], ['AI 염색', '크레딧 1']],
  step1: '색 고르기', step2: '내 머리에 바로', all: '전체', seasonQ: '내 계절을 모르면',
  seasonLink: '퍼스널컬러 무료 진단 →',
  demo: '예시 모델 사진이에요. 내 사진으로 바꿔 보세요.', camera: '셀카 찍기', gallery: '사진 고르기', change: '사진 바꾸기', backDemo: '예시 모델로 돌아가기',
  loading: '머리카락 찾는 중… (처음 한 번 10초 안팎)', noHair: '머리카락을 찾지 못했어요. 머리가 보이는 사진으로 바꿔 주세요.', hat: '모자·두건을 쓴 사진 같아요. 보이는 머리만 바뀌어요.', engineErr: '인식 도구를 불러오지 못했어요. 새로고침해 주세요.', badFile: '사진을 읽지 못했어요. 다른 사진으로 해 주세요.',
  strength: '진하기', compare: '누르고 있으면 원래 머리', bleach: '밝은 색이라 검은 머리는 실제로 탈색이 필요할 수 있어요. AI 염색으로 더 진짜처럼 볼 수 있어요.',
  save: '이 색으로 저장하기(무료)', saveTitle: '헤어 컬러',
  needOwn: '내 사진을 넣으면 AI 염색을 만들 수 있어요.',
  aiNote: '예시는 이 도구로 AI 생성 모델에 만든 결과예요.',
  privacy: '머리카락 인식은 이 기기 안에서만 해요. 사진은 AI 염색을 만들 때만 보내고 저장하지 않아요.',
  tip: '팁: 머리 전체가 보이고 밝은 곳에서 찍은 사진일수록 정확해요.',
}
const EN: typeof KO = {
  kicker: 'HAIR COLOR', title1: 'Find Your Hair Color', title2: 'see it before you dye',
  lead: 'We find just your hair and change its colour — face, clothes and background stay the same. Try 16 colours instantly for free, then let AI make your favourite look like a real salon dye.',
  strip: [['16 colours', 'Free'], ['By season', 'Free'], ['AI dye', '1 credit']],
  step1: 'Pick a colour', step2: 'On your hair, instantly', all: 'All', seasonQ: 'Don’t know your season?',
  seasonLink: 'Free personal colour test →',
  demo: 'This is a sample model photo. Try your own.', camera: 'Take a selfie', gallery: 'Choose a photo', change: 'Change photo', backDemo: 'Back to the sample model',
  loading: 'Finding your hair… (about 10s the first time)', noHair: 'We couldn’t find hair. Try a photo where your hair shows.', hat: 'Looks like a hat or scarf — only visible hair will change.', engineErr: 'The tool failed to load. Please refresh.', badFile: 'Couldn’t read that photo. Please try another.',
  strength: 'Strength', compare: 'Hold to see the original', bleach: 'This is a light shade — dark hair may need bleaching in real life. The AI dye shows it more realistically.',
  save: 'Save this colour (free)', saveTitle: 'Hair Color',
  needOwn: 'Add your own photo to make an AI dye.',
  aiNote: 'Examples are this tool’s output on an AI-generated model.',
  privacy: 'Hair detection runs on this device. Your photo is sent only to make an AI dye and is not stored.',
  tip: 'Tip: a bright photo that shows all of your hair works best.',
}

const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
  const im = new Image(); im.crossOrigin = 'anonymous'
  im.onload = () => res(im); im.onerror = () => rej(new Error('img')); im.src = src
})

export default function HairColor() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const T = isEn ? EN : KO
  const base = isEn ? '/en/hair-color/' : '/hair-color/'
  const [season, setSeason] = useState<Season | 'all'>('all')
  const [color, setColor] = useState('rose-brown')
  const [strength, setStrength] = useState(0.85)
  const [photo, setPhoto] = useState<string | null>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [mask, setMask] = useState<HairMask | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'nohair' | 'error'>('loading')
  const [err, setErr] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [peek, setPeek] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const engRef = useRef<Promise<Engine> | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const makeRef = useRef<HTMLDivElement>(null)

  useEffect(() => { const t = window.setTimeout(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get('paid') === '1') { trackCheckoutReturn(); setRefresh((n) => n + 1) }
    const qc = q.get('c'); if (qc && hairById(qc)) setColor(qc)
    const qs = q.get('season') as Season | null; if (qs && SEASON_LABEL[qs]) setSeason(qs)
    if (q.get('resume') === '1' || q.get('paid') === '1') {
      const ph = takePendingSelfie(); if (ph) { setPhoto(ph); keepPendingSelfie(ph) }
      try { const st = JSON.parse(sessionStorage.getItem(PENDING) || 'null') as { color: string; strength: number } | null; if (st && hairById(st.color)) { setColor(st.color); setStrength(st.strength) } } catch { /* noop */ }
      setTimeout(() => makeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400)
    }
  }, 0); return () => window.clearTimeout(t) }, [])

  useEffect(() => {
    let off = false
    ;(async () => {
      try {
        const im = await loadImg(photo ?? DEMO)
        if (off) return
        setImg(im); setMask(null); setStatus('loading')
        if (!engRef.current) engRef.current = initEngine()
        const eng = await engRef.current
        if (off) return
        const m = buildHairMask(eng, im)
        setMask(m); setStatus(m && m.pct > 0.5 ? 'ready' : 'nohair')
      } catch { if (!off) setStatus('error') }
    })()
    return () => { off = true }
  }, [photo])

  useEffect(() => {
    const c = canvasRef.current; if (!c || !img) return
    if (!mask || peek) {
      c.width = img.naturalWidth; c.height = img.naturalHeight
      c.getContext('2d')!.drawImage(img, 0, 0)
      return
    }
    recolorHair(c, img, mask, hairById(color)!.hex, strength)
  }, [img, mask, color, strength, peek])

  const choosePhoto = async (mode: 'camera' | 'gallery') => {
    const file = await pickImage(mode); if (!file) return
    const url = URL.createObjectURL(file)
    const ok = await savePendingSelfieFromSrc(url)
    const small = ok ? takePendingSelfie() : null
    URL.revokeObjectURL(url)
    if (!small) { setErr(T.badFile); return }
    keepPendingSelfie(small); setStatus('loading'); setPhoto(small); setErr(null); setSaved(null)
    trackEvent('makeup_photo', { mode, store: 'hair' })
  }
  const stash = useCallback(() => {
    if (photo) keepPendingSelfie(photo)
    try { sessionStorage.setItem(PENDING, JSON.stringify({ color, strength })) } catch { /* noop */ }
  }, [photo, color, strength])
  const choose = (id: string) => { setColor(id); setSaved(null); trackEvent('style_selected', { style: `hair:${id}` }) }
  const saveFree = () => {
    const c = canvasRef.current; if (!c) return
    try { setSaved(c.toDataURL('image/jpeg', 0.92)); trackEvent('hair_saved', { color }) } catch { setErr(T.badFile) }
  }

  const cur = hairById(color)!
  const name = isEn ? cur.en : cur.ko
  const list = HAIR_COLORS.filter((c) => season === 'all' || c.seasons.includes(season))
  const eyebrow = 'text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark'
  const ptc = isEn ? '/en/tools/personal-color/' : '/tools/personal-color/'
  return (
    <div className="font-display bg-background-light min-h-screen text-navy">
      <ToolsNav />
      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <section className="pt-10 md:pt-14">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div className="min-w-0">
              <p className={eyebrow}>{T.kicker}</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl break-keep">{T.title1}<br /><span className="text-primary-dark">{T.title2}</span></h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 md:text-lg break-keep">{T.lead}</p>
            </div>
            <div className="min-w-0 md:w-full md:max-w-sm md:justify-self-end">
              <ul className="grid grid-cols-3 divide-x divide-slate-200 border border-slate-200 bg-white text-center">
                {T.strip.map(([n, p]) => <li key={n} className="px-2 py-3"><span className="block text-[11px] font-semibold text-slate-500">{n}</span><span className="block text-lg font-extrabold">{p}</span></li>)}
              </ul>
              <figure className="mt-3 grid grid-cols-2 gap-2">
                <img src={DEMO} alt={isEn ? 'Original hair, AI-generated model' : '원래 머리, AI 생성 모델'} className="aspect-[3/4] w-full object-cover object-[50%_25%]" />
                <img src="/hair/samples/pink.webp" alt={isEn ? 'Baby pink AI dye, AI-generated model' : '베이비 핑크 AI 염색, AI 생성 모델'} className="aspect-[3/4] w-full object-cover object-[50%_25%]" />
                <figcaption className="col-span-2 text-[11px] text-slate-500">{T.aiNote}</figcaption>
              </figure>
            </div>
          </div>

          <div ref={makeRef} id="make" className="mt-12 grid scroll-mt-20 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold md:text-3xl">{T.step2}</h2>
              <div className="relative mx-auto mt-4 max-w-md overflow-hidden bg-slate-200">
                <canvas ref={canvasRef} className="block h-auto w-full select-none" />
                {status === 'loading' && <p className="absolute inset-x-0 bottom-0 bg-navy/80 py-2 text-center text-sm font-bold text-white">{T.loading}</p>}
                {status === 'nohair' && <p className="absolute inset-x-0 bottom-0 bg-primary py-2 text-center text-sm font-bold text-navy">{T.noHair}</p>}
                {status === 'error' && <p className="absolute inset-x-0 bottom-0 bg-primary py-2 text-center text-sm font-bold text-navy">{T.engineErr}</p>}
                {status === 'ready' && mask?.hat && <p className="absolute inset-x-0 top-0 bg-primary/90 py-1.5 text-center text-[12px] font-bold text-navy">{T.hat}</p>}
              </div>
              {status === 'ready' && (
                <button type="button" onPointerDown={() => setPeek(true)} onPointerUp={() => setPeek(false)} onPointerLeave={() => setPeek(false)} onContextMenu={(e) => e.preventDefault()}
                  className="mx-auto mt-2 block w-full max-w-md select-none border border-slate-300 bg-white py-2 text-[13px] font-bold touch-none">{T.compare}</button>
              )}
              {!photo && <p className="mx-auto mt-2 max-w-md text-center text-[12px] font-semibold text-slate-600">{T.demo}</p>}
              <div className="mx-auto mt-2 grid max-w-md grid-cols-2 gap-2">
                <button type="button" onClick={() => void choosePhoto('camera')} className="bg-navy py-3 text-sm font-bold text-white">{T.camera}</button>
                <button type="button" onClick={() => void choosePhoto('gallery')} className="border border-navy bg-white py-3 text-sm font-bold">{photo ? T.change : T.gallery}</button>
              </div>
              {photo && <button type="button" onClick={() => { setStatus('loading'); setPhoto(null); clearPendingSelfie() }} className="mx-auto mt-2 block text-[12px] font-bold text-slate-500 underline underline-offset-4">{T.backDemo}</button>}
              <p className="mx-auto mt-2 max-w-md text-center text-[11px] text-slate-500">{T.tip}</p>
              {err && <p className="mx-auto mt-2 max-w-md bg-primary/20 px-3 py-2 text-[13px] font-bold">{err}</p>}
            </div>

            <div className="min-w-0 space-y-4">
              <div className="border border-slate-200 bg-white p-4">
                <p className="text-base font-extrabold">{T.step1}</p>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[12px] font-bold">
                  {(['all', 'spring', 'summer', 'autumn', 'winter'] as const).map((s) => (
                    <button key={s} type="button" aria-pressed={season === s} onClick={() => setSeason(s)} className={`border px-2.5 py-1.5 ${season === s ? 'border-navy bg-navy text-white' : 'border-slate-300'}`}>{s === 'all' ? T.all : isEn ? SEASON_LABEL[s].en : SEASON_LABEL[s].ko}</button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-500">{T.seasonQ} <a href={ptc} className="font-bold text-primary-dark underline underline-offset-2">{T.seasonLink}</a></p>
                <div className="mt-3 grid grid-cols-4 gap-2" role="radiogroup" aria-label={T.step1}>
                  {list.map((c) => (
                    <button key={c.id} type="button" role="radio" aria-checked={c.id === color} onClick={() => choose(c.id)} className="flex flex-col items-center gap-1 text-center">
                      <span className={`block h-11 w-11 rounded-full border-2 ${c.id === color ? 'border-navy ring-2 ring-primary ring-offset-2' : 'border-white ring-1 ring-slate-300'}`} style={{ background: `radial-gradient(circle at 35% 30%, #ffffff55, transparent 45%), ${c.hex}` }} />
                      <span className={`text-[11px] font-bold leading-tight break-keep ${c.id === color ? 'text-primary-dark' : ''}`}>{isEn ? c.en : c.ko}</span>
                    </button>
                  ))}
                </div>
                <label className="mt-4 block text-[13px] font-bold">{T.strength} <span className="tabular-nums text-slate-500">{Math.round(strength * 100)}%</span>
                  <input type="range" min={0.3} max={1} step={0.02} value={strength} onChange={(e) => { setStrength(+e.target.value); setSaved(null) }} className="w-full accent-[#d6247f]" /></label>
                {cur.bleach && <p className="mt-2 bg-cream px-3 py-2 text-[12px] font-semibold text-slate-700 break-keep">{T.bleach}</p>}
                {status === 'ready' && (
                  <div className="mt-4">
                    {saved
                      ? <div className="bg-navy p-3"><ResultSaveEmail image={saved} name={`${T.saveTitle} · ${name}`} desc={name} fileName={`kissinskin-hair-${color}.jpg`} tag="hair:free" isEn={isEn} /></div>
                      : <button type="button" onClick={saveFree} className="w-full bg-primary py-3 text-sm font-extrabold text-navy">{T.save}</button>}
                  </div>
                )}
              </div>
              <AiFinish isEn={isEn} base={base} pool="hair" ready={!!photo && !!img}
                blockedHint={!photo ? T.needOwn : undefined}
                build={() => (img ? { source: img, prompt: promptHair(cur), styleId: cur.id } : null)}
                before={photo} name={`${T.saveTitle} · ${name}`} desc={name} onStash={stash} resetKey={`${photo?.length}:${color}`} refreshKey={refresh} />
              <p className="text-xs text-slate-500 break-keep">{T.privacy}</p>
            </div>
          </div>
        </section>
      </main>
      <ToolsFooter />
    </div>
  )
}
