// 페이스 페인팅 — /face-paint/ · /en/face-paint/ (2026-11-11)
// ─────────────────────────────────────────────────────────────────
// 운영자 11/11: "사진이나 카메라로 얼굴이 나오면 고른 페이스 페인팅을 움직여 원하는 위치에서 저장·생성. 작은 것부터 얼굴 전체까지,
//   시즌 페인팅도. AI 완성본까지." 벤치마크 = 스냅·틱톡 Face Mask(얼굴 기준점에 붙는 무늬) + YouCam 시즌 묶음.
// 흐름: ① 무늬 고르기(작은 9·절반 5·전체 4·시즌 4) → ② 내 얼굴(처음엔 예시 모델) 위에서 옮기기·키우기·돌리기
//       → 무료 저장  /  ③ AI 완성본(크레딧 1개) — 작은·절반은 무늬 얹은 사진을 그대로, 전체·시즌은 원본 셀카로.
// 얼굴 인식은 기기 안(MediaPipe, 서버 0원). 사진은 서버에 남기지 않는다(AI 완성본을 만들 때만 전송).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import AiFinish from '../components/edit/AiFinish'
import ResultSaveEmail from '../components/makeup/ResultSaveEmail'
import { pickImage } from '../lib/nativePicker'
import { trackEvent } from '../lib/analytics'
import { savePendingSelfieFromSrc, takePendingSelfie, keepPendingSelfie, clearPendingSelfie } from '../lib/makeup/pendingSelfie'
import { initFaceOnly, detectFace, type LM } from '../lib/makeup/looksEngine'
import { PAINT_DESIGNS, paintById, isArOnly, promptFull, promptOverlay, type PaintSize } from '../lib/paint/designs'
import { renderPaint, placements, faceFrame, type PlacedPaint } from '../lib/paint/render'
import { trackCheckoutReturn } from '../lib/purchaseTracking'

// 페인팅 전용 모델(11/11 2차 — 9가지·럭키·헤어와 다른 사람, 머리를 올려 이마·귀가 보임)
const DEMO = '/paint/model.webp?v=20261111c'
const MAX_ITEMS = 6
const PENDING = 'paint:pending'
type FL = Awaited<ReturnType<typeof initFaceOnly>>

const KO = {
  kicker: 'FACE PAINTING · 페이스 페인팅', title1: '페이스 페인팅', title2: '내 얼굴에 붙여 보기',
  lead: '진주·크롬 별·레이스 같은 작은 스티커부터 명화로 덮는 얼굴 전체, 1년 열두 달 시즌 페인팅까지 46종. 무늬는 얼굴을 알아보고 제자리에 붙고, 손가락으로 옮기고 키우고 돌릴 수 있어요. 무료로 저장하고, 원하면 AI 가 진짜 칠한 것처럼 완성해 드려요.',
  strip: [['작은 무늬', '무료'], ['위치 조정', '무료'], ['AI 완성', '크레딧 1']],
  tabs: { small: '작은 무늬', half: '얼굴 절반', full: '얼굴 전체', season: '시즌' } as Record<PaintSize, string>,
  tabHint: { small: '여러 개 겹쳐 붙일 수 있어요(최대 6개)', half: '작은 무늬와 함께 붙일 수 있어요', full: '명화의 얼굴 — AI 완성본으로 그려요', season: '1년 열두 달, 기념일마다 바뀌는 페인팅' } as Record<PaintSize, string>,
  step1: '무늬 고르기', step2: '내 얼굴에서 맞추기', step3: 'AI 로 진짜처럼',
  demo: '예시 모델 사진이에요. 내 사진으로 바꿔 보세요.', camera: '셀카 찍기', gallery: '사진 고르기', change: '사진 바꾸기',
  loading: '얼굴 찾는 중…', noFace: '얼굴을 찾지 못했어요. 정면 사진으로 바꿔 주세요.', engineErr: '얼굴 인식을 불러오지 못했어요. 새로고침해 주세요.', badFile: '사진을 읽지 못했어요. 다른 사진으로 해 주세요.',
  dragTip: '사진 위를 끌어서 옮기고, 두 손가락으로 키우고 돌려요.',
  size: '크기', turn: '회전', strength: '진하기', reset: '제자리로', remove: '빼기', clear: '모두 지우기',
  picked: '붙인 무늬', none: '위에서 무늬를 골라 주세요.', full: (n: string) => `"${n}" 는 얼굴 전체 페인팅이라 AI 완성본으로 그려요.`,
  example: '예시', save: '이대로 저장하기(무료)', saveTitle: '페이스 페인팅',
  max: `무늬는 ${MAX_ITEMS}개까지 붙일 수 있어요.`,
  needOwn: '내 사진을 넣으면 AI 완성본을 만들 수 있어요.', needPick: '무늬를 먼저 골라 주세요.',
  aiNote: '예시는 이 도구로 AI 생성 모델에 만든 결과예요.',
  howTitle: '이렇게 만들어요',
  how: [['얼굴 기준점', '얼굴의 점 478개를 찾아 볼·눈꼬리·콧등 같은 제자리에 무늬를 붙여요. 얼굴이 기울어도 같이 기울어요.'], ['직접 맞추기', '끌어서 옮기고, 크기·회전·진하기를 바꿔요. 양쪽에 붙는 무늬는 거울처럼 함께 움직여요.'], ['AI 완성본', '맞춘 그대로를 진짜 물감·큐빅처럼 다시 칠해요. 얼굴 전체·시즌은 AI 가 처음부터 그려요.']],
  privacy: '얼굴 인식은 이 기기 안에서만 해요. 사진은 AI 완성본을 만들 때만 보내고 저장하지 않아요.',
}
const EN: typeof KO = {
  kicker: 'FACE PAINTING', title1: 'Face Painting', title2: 'try it on your face',
  lead: '46 designs, from pearls, chrome stars and lace to full-face masterpieces and a painting for every month. Designs find their place on your face, and you can drag, resize and rotate them. Save for free, or let AI finish it like real paint.',
  strip: [['Small designs', 'Free'], ['Placement', 'Free'], ['AI finish', '1 credit']],
  tabs: { small: 'Small', half: 'Half face', full: 'Full face', season: 'Seasonal' },
  tabHint: { small: 'Stack up to 6 designs', half: 'Combine with small designs', full: 'Masterpiece faces — painted by AI', season: 'A painting for every month and holiday' },
  step1: 'Pick a design', step2: 'Fit it on your face', step3: 'Make it real with AI',
  demo: 'This is a sample model photo. Try your own.', camera: 'Take a selfie', gallery: 'Choose a photo', change: 'Change photo',
  loading: 'Finding your face…', noFace: 'We couldn’t find a face. Try a front-facing photo.', engineErr: 'Face tracking failed to load. Please refresh.', badFile: 'Couldn’t read that photo. Please try another.',
  dragTip: 'Drag on the photo to move. Pinch to resize and rotate.',
  size: 'Size', turn: 'Rotate', strength: 'Strength', reset: 'Reset', remove: 'Remove', clear: 'Clear all',
  picked: 'On your face', none: 'Pick a design above.', full: (n: string) => `“${n}” covers the whole face, so AI paints it.`,
  example: 'Example', save: 'Save as is (free)', saveTitle: 'Face Painting',
  max: `You can add up to ${MAX_ITEMS} designs.`,
  needOwn: 'Add your own photo to make an AI finish.', needPick: 'Pick a design first.',
  aiNote: 'Examples are this tool’s output on an AI-generated model.',
  howTitle: 'How it works',
  how: [['Face points', 'We find 478 points on your face and place designs on the cheek, eye corner or nose. They tilt with your face.'], ['Fit it yourself', 'Drag to move; change size, rotation and strength. Paired designs move like a mirror.'], ['AI finish', 'Repaints your exact layout like real paint and gems. Full-face and seasonal looks are painted from scratch.']],
  privacy: 'Face tracking runs on this device. Your photo is sent only to make an AI finish and is not stored.',
}

const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
  const im = new Image(); im.crossOrigin = 'anonymous'
  im.onload = () => res(im); im.onerror = () => rej(new Error('img')); im.src = src
})

export default function FacePaint() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const T = isEn ? EN : KO
  const base = isEn ? '/en/face-paint/' : '/face-paint/'
  const [tab, setTab] = useState<PaintSize>('small')
  const [items, setItems] = useState<PlacedPaint[]>([{ id: 'pearl-corner', ox: 0, oy: 0, s: 1, r: 0 }])
  const [sel, setSel] = useState(0)
  const [full, setFull] = useState<string | null>(null)
  const [opacity, setOpacity] = useState(0.92)
  const [photo, setPhoto] = useState<string | null>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [lm, setLm] = useState<LM[] | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'noface' | 'error'>('loading')
  const [err, setErr] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)
  const flRef = useRef<Promise<FL> | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const makeRef = useRef<HTMLDivElement>(null)

  const getFl = () => { if (!flRef.current) flRef.current = initFaceOnly(); return flRef.current }

  // 진입: 로그인·결제 복귀면 사진·고른 것 되살리기
  useEffect(() => { const t = window.setTimeout(() => {
    const q = new URLSearchParams(window.location.search)
    const back = q.get('resume') === '1' || q.get('paid') === '1'
    if (q.get('paid') === '1') { trackCheckoutReturn(); setRefresh((n) => n + 1) }
    const d = q.get('d'); const pd = d ? paintById(d) : undefined
    if (pd) { if (isArOnly(pd)) setItems([{ id: pd.id, ox: 0, oy: 0, s: 1, r: 0 }]); else { setFull(pd.id); setItems([]) } setTab(pd.size) }
    if (back) {
      const ph = takePendingSelfie(); if (ph) { setPhoto(ph); keepPendingSelfie(ph) }
      try {
        const st = JSON.parse(sessionStorage.getItem(PENDING) || 'null') as { items: PlacedPaint[]; full: string | null; opacity: number } | null
        if (st) { setItems(st.items.filter((i) => paintById(i.id))); setFull(st.full); setOpacity(st.opacity); const f = st.full && paintById(st.full); if (f) setTab(f.size) }
      } catch { /* noop */ }
      setTimeout(() => makeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400)
    }
  }, 0); return () => window.clearTimeout(t) }, [])

  // 사진이 바뀌면 얼굴 찾기
  useEffect(() => {
    let off = false
    ;(async () => {
      try {
        const im = await loadImg(photo ?? DEMO)
        if (off) return
        setImg(im); setLm(null); setStatus('loading')
        const fl = await getFl()
        if (off) return
        const found = detectFace(fl, im)
        setLm(found); setStatus(found ? 'ready' : 'noface')
      } catch { if (!off) setStatus('error') }
    })()
    return () => { off = true }
  }, [photo])

  // 그리기
  useEffect(() => {
    if (!img || !canvasRef.current) return
    void renderPaint(canvasRef.current, img, lm, full ? [] : items, opacity)
  }, [img, lm, items, full, opacity])

  const cur = items[sel]
  const update = (patch: Partial<PlacedPaint>) => setItems((arr) => arr.map((it, i) => (i === sel ? { ...it, ...patch } : it)))

  const pick = (id: string) => {
    const d = paintById(id); if (!d) return
    setSaved(null); setErr(null)
    trackEvent('style_selected', { style: `paint:${id}` })
    if (!isArOnly(d)) { setFull(id); return }
    setFull(null)
    const at = items.findIndex((i) => i.id === id)
    if (at >= 0) { setSel(at); return }
    if (items.length >= MAX_ITEMS) { setErr(T.max); return }
    setItems([...items, { id, ox: 0, oy: 0, s: 1, r: 0 }]); setSel(items.length)
  }
  const removeAt = (i: number) => { setItems(items.filter((_, k) => k !== i)); setSel(0); setSaved(null) }

  // ── 끌기·두 손가락 ──
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ flip: boolean; start?: { d: number; a: number; s: number; r: number } } | null>(null)
  const toImg = (e: React.PointerEvent) => {
    const c = canvasRef.current!; const b = c.getBoundingClientRect()
    return { x: ((e.clientX - b.left) / b.width) * c.width, y: ((e.clientY - b.top) / b.height) * c.height }
  }
  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!lm || !img || full || !cur) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = toImg(e)
    pointers.current.set(e.pointerId, p)
    if (pointers.current.size === 1) {
      // 가장 가까운 무늬(좌우 한 쌍이면 잡은 쪽)를 고른다
      let best = { i: sel, flip: false, d: Infinity }
      items.forEach((it, i) => placements(lm, img.naturalWidth, img.naturalHeight, it).forEach((pl) => {
        const d = Math.hypot(pl.x - p.x, pl.y - p.y); if (d < best.d) best = { i, flip: pl.flip, d }
      }))
      setSel(best.i)
      gesture.current = { flip: best.flip }
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const it = items[sel]
      gesture.current = { flip: gesture.current?.flip ?? false, start: { d: Math.hypot(b.x - a.x, b.y - a.y), a: Math.atan2(b.y - a.y, b.x - a.x), s: it.s, r: it.r } }
    }
  }
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const prev = pointers.current.get(e.pointerId); if (!prev || !lm || !img) return
    const p = toImg(e); pointers.current.set(e.pointerId, p)
    const g = gesture.current; if (!g) return
    if (pointers.current.size >= 2 && g.start) {
      const [a, b] = [...pointers.current.values()]
      const d = Math.hypot(b.x - a.x, b.y - a.y), ang = Math.atan2(b.y - a.y, b.x - a.x)
      const s = Math.min(3, Math.max(0.3, (g.start.s * d) / g.start.d))
      const r = g.start.r + ((ang - g.start.a) * 180) / Math.PI * (g.flip ? -1 : 1)
      update({ s, r: Math.max(-180, Math.min(180, r)) })
      return
    }
    const { fw, angle } = faceFrame(lm, img.naturalWidth, img.naturalHeight)
    const dx = p.x - prev.x, dy = p.y - prev.y
    const fx = (dx * Math.cos(angle) + dy * Math.sin(angle)) / fw
    const fy = (-dx * Math.sin(angle) + dy * Math.cos(angle)) / fw
    setItems((arr) => arr.map((it, i) => (i === sel ? { ...it, ox: it.ox + (g.flip ? -fx : fx), oy: it.oy + fy } : it)))
  }
  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 0) { gesture.current = null; setSaved(null) }
    else if (gesture.current) gesture.current.start = undefined
  }

  const choosePhoto = async (mode: 'camera' | 'gallery') => {
    const file = await pickImage(mode); if (!file) return
    const url = URL.createObjectURL(file)
    const ok = await savePendingSelfieFromSrc(url)
    const small = ok ? takePendingSelfie() : null
    URL.revokeObjectURL(url)
    if (!small) { setErr(T.badFile); return }
    keepPendingSelfie(small); setStatus('loading'); setPhoto(small); setErr(null); setSaved(null)
    trackEvent('makeup_photo', { mode, store: 'paint' })
  }
  const stash = useCallback(() => {
    if (photo) keepPendingSelfie(photo)
    try { sessionStorage.setItem(PENDING, JSON.stringify({ items, full, opacity })) } catch { /* noop */ }
  }, [photo, items, full, opacity])

  const saveFree = () => {
    const c = canvasRef.current; if (!c) return
    try { setSaved(c.toDataURL('image/jpeg', 0.92)); trackEvent('paint_saved', { n: items.length }) } catch { setErr(T.badFile) }
  }

  const fullD = full ? paintById(full) : undefined
  const picked = fullD ? [fullD] : items.map((i) => paintById(i.id)!)
  const names = picked.map((d) => (isEn ? d.en : d.ko)).join(' · ')
  // 카드 설명 — 기능 이름은 카드 배지(FACE PAINT)가 맡으니 무늬 설명만
  const descs = picked.map((d) => (isEn ? d.descEn : d.descKo)).join(' · ')
  const aiReady = !!photo && status === 'ready' && (!!fullD || items.length > 0)
  const resetKey = useMemo(() => JSON.stringify([photo?.length, full, items, opacity]), [photo, full, items, opacity])
  const build = () => {
    if (fullD) return img ? { source: img, prompt: promptFull(fullD), styleId: fullD.id } : null
    const c = canvasRef.current; if (!c) return null
    return { source: c, prompt: promptOverlay(items.map((i) => paintById(i.id)!)), styleId: items.map((i) => i.id).join('+') }
  }

  const list = PAINT_DESIGNS.filter((d) => d.size === tab)
  const eyebrow = 'text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark'
  const range = 'w-full accent-[#d6247f]'
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
            <ul className="grid grid-cols-3 divide-x divide-slate-200 border border-slate-200 bg-white text-center md:max-w-sm md:justify-self-end md:w-full">
              {T.strip.map(([n, p]) => <li key={n} className="px-2 py-3"><span className="block text-[11px] font-semibold text-slate-500">{n}</span><span className="block text-lg font-extrabold">{p}</span></li>)}
            </ul>
          </div>

          {/* ① 무늬 고르기 */}
          <div id="designs" className="mt-12 scroll-mt-20">
            <h2 className="text-xl font-extrabold md:text-3xl"><span className="mr-2 tabular-nums text-primary-dark">1</span>{T.step1}</h2>
            <div className="mt-4 grid grid-cols-4 border border-navy text-center text-[13px] font-extrabold md:max-w-xl md:text-sm" role="tablist">
              {(['small', 'half', 'full', 'season'] as PaintSize[]).map((s) => (
                <button key={s} type="button" role="tab" aria-selected={tab === s} onClick={() => setTab(s)} className={`py-2.5 ${tab === s ? 'bg-navy text-white' : 'bg-white'}`}>{T.tabs[s]}</button>
              ))}
            </div>
            <p className="mt-2 text-sm font-bold text-primary-dark">{T.tabHint[tab]}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-4">
              {list.map((d) => {
                const on = full === d.id || (!full && items.some((i) => i.id === d.id))
                return (
                  <button key={d.id} type="button" aria-pressed={on} onClick={() => { pick(d.id); setTimeout(() => makeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60) }}
                    className={`block border-2 bg-white text-left transition-colors ${on ? 'border-primary' : 'border-transparent ring-1 ring-slate-200 hover:ring-navy'}`}>
                    <span className="relative block aspect-square overflow-hidden bg-[#f6dfd3]">
                      {d.sample
                        ? <img src={d.sample} alt={isEn ? `${d.en} face paint on an AI-generated model` : `${d.ko} 페이스 페인팅, AI 생성 모델`} loading="lazy" className="h-full w-full object-cover object-[50%_30%]" />
                        : <img src={`/paint/thumb/${d.id}.webp?v=20261111c`} alt={isEn ? `${d.en} on an AI-generated model` : `${d.ko}, AI 생성 모델`} loading="lazy" className="h-full w-full object-cover" />}
                      {d.tagKo && <span className="absolute bottom-1.5 left-1.5 bg-white/90 px-1.5 py-0.5 text-[10px] font-extrabold text-primary-dark">{isEn ? d.tagEn : d.tagKo}</span>}
                      {(d.monthKo) && <span className="absolute left-1.5 top-1.5 bg-navy px-1.5 py-0.5 text-[10px] font-extrabold text-white">{isEn ? d.monthEn : d.monthKo}</span>}
                      {on && <span className="material-symbols-outlined absolute right-1.5 top-1.5 rounded-full bg-primary p-0.5 text-[16px] text-navy" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                    </span>
                    <span className="block p-2 md:p-3">
                      <span className={`block text-[13px] font-extrabold leading-tight md:text-base break-keep ${on ? 'text-primary-dark' : ''}`}>{isEn ? d.en : d.ko}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-slate-600 md:text-[13px] break-keep">{isEn ? d.descEn : d.descKo}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            {(tab === 'full' || tab === 'season') && <p className="mt-2 text-[11px] text-slate-500">{T.aiNote}</p>}
          </div>

          {/* ② 내 얼굴에서 맞추기 */}
          <div ref={makeRef} id="make" className="mt-12 scroll-mt-20">
            <h2 className="text-xl font-extrabold md:text-3xl"><span className="mr-2 tabular-nums text-primary-dark">2</span>{T.step2}</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
              <div className="min-w-0">
                <div className="relative mx-auto max-w-md overflow-hidden bg-slate-200">
                  <canvas ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
                    className="block h-auto w-full touch-none select-none" style={{ cursor: full ? 'default' : 'grab' }} aria-label={T.dragTip} />
                  {status === 'loading' && <p className="absolute inset-x-0 bottom-0 bg-navy/80 py-2 text-center text-sm font-bold text-white">{T.loading}</p>}
                  {status === 'noface' && <p className="absolute inset-x-0 bottom-0 bg-primary py-2 text-center text-sm font-bold text-navy">{T.noFace}</p>}
                  {status === 'error' && <p className="absolute inset-x-0 bottom-0 bg-primary py-2 text-center text-sm font-bold text-navy">{T.engineErr}</p>}
                  {fullD?.sample && (
                    <figure className="absolute right-2 top-2 w-24 border-2 border-white bg-white shadow md:w-28">
                      <img src={fullD.sample} alt="" className="aspect-[3/4] w-full object-cover" />
                      <figcaption className="py-0.5 text-center text-[10px] font-bold">{T.example}</figcaption>
                    </figure>
                  )}
                </div>
                {!photo && <p className="mx-auto mt-2 max-w-md text-center text-[12px] font-semibold text-slate-600">{T.demo}</p>}
                <div className="mx-auto mt-2 grid max-w-md grid-cols-2 gap-2">
                  <button type="button" onClick={() => void choosePhoto('camera')} className="bg-navy py-3 text-sm font-bold text-white">{T.camera}</button>
                  <button type="button" onClick={() => void choosePhoto('gallery')} className="border border-navy bg-white py-3 text-sm font-bold">{photo ? T.change : T.gallery}</button>
                </div>
                {photo && <button type="button" onClick={() => { setStatus('loading'); setPhoto(null); clearPendingSelfie() }} className="mx-auto mt-2 block text-[12px] font-bold text-slate-500 underline underline-offset-4">{isEn ? 'Back to the sample model' : '예시 모델로 돌아가기'}</button>}
                {err && <p className="mx-auto mt-2 max-w-md bg-primary/20 px-3 py-2 text-[13px] font-bold">{err}</p>}
              </div>

              <div className="min-w-0 space-y-4">
                {fullD ? (
                  <p className="border border-slate-200 bg-white p-4 text-sm font-bold break-keep">{T.full(isEn ? fullD.en : fullD.ko)}</p>
                ) : (
                  <div className="border border-slate-200 bg-white p-4">
                    <p className="text-sm font-extrabold">{T.picked}</p>
                    {items.length === 0 ? <p className="mt-2 text-sm text-slate-600">{T.none}</p> : (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {items.map((it, i) => {
                          const d = paintById(it.id)!
                          return (
                            <span key={it.id} className={`inline-flex items-center border text-[13px] font-bold ${i === sel ? 'border-primary bg-primary/15' : 'border-slate-300'}`}>
                              <button type="button" onClick={() => setSel(i)} className="px-2.5 py-1.5">{isEn ? d.en : d.ko}</button>
                              <button type="button" onClick={() => removeAt(i)} aria-label={T.remove} className="border-l border-slate-300 px-2 py-1.5 text-slate-500">×</button>
                            </span>
                          )
                        })}
                      </div>
                    )}
                    {cur && (
                      <div className="mt-4 space-y-3 text-[13px] font-bold">
                        <p className="text-[12px] font-semibold text-slate-600">{T.dragTip}</p>
                        <label className="block">{T.size} <span className="tabular-nums text-slate-500">{Math.round(cur.s * 100)}%</span>
                          <input type="range" min={0.3} max={3} step={0.05} value={cur.s} onChange={(e) => update({ s: +e.target.value })} className={range} /></label>
                        <label className="block">{T.turn} <span className="tabular-nums text-slate-500">{Math.round(cur.r)}°</span>
                          <input type="range" min={-180} max={180} step={1} value={cur.r} onChange={(e) => update({ r: +e.target.value })} className={range} /></label>
                        <label className="block">{T.strength} <span className="tabular-nums text-slate-500">{Math.round(opacity * 100)}%</span>
                          <input type="range" min={0.3} max={1} step={0.02} value={opacity} onChange={(e) => setOpacity(+e.target.value)} className={range} /></label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => update({ ox: 0, oy: 0, s: 1, r: 0 })} className="flex-1 border border-navy py-2">{T.reset}</button>
                          <button type="button" onClick={() => { setItems([]); setSel(0) }} className="flex-1 border border-slate-300 py-2 text-slate-600">{T.clear}</button>
                        </div>
                      </div>
                    )}
                    {items.length > 0 && status === 'ready' && (
                      <div className="mt-4">
                        {saved
                          ? <div className="bg-navy p-3"><ResultSaveEmail image={saved} name={names} desc={descs} fileName="kissinskin-face-paint.jpg" tag="paint:free" isEn={isEn} gallery={photo ? { source: 'paint', lookId: items[0]?.id ?? 'pearl-corner' } : undefined} /></div>
                          : <button type="button" onClick={saveFree} className="w-full bg-primary py-3 text-sm font-extrabold text-navy">{T.save}</button>}
                      </div>
                    )}
                  </div>
                )}

                <div id="ai">
                  <p className="mb-2 text-sm font-extrabold"><span className="mr-1.5 tabular-nums text-primary-dark">3</span>{T.step3}</p>
                  <AiFinish isEn={isEn} base={base} pool="paint" ready={aiReady}
                    blockedHint={!photo ? T.needOwn : (!fullD && items.length === 0) ? T.needPick : undefined}
                    build={build} before={photo} name={names} desc={descs} onStash={stash} resetKey={resetKey} refreshKey={refresh} galleryLook={fullD ? fullD.id : items[0]?.id} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14">
            <h2 className="text-xl font-extrabold md:text-3xl">{T.howTitle}</h2>
            <ol className="mt-4 grid gap-3 md:grid-cols-3 md:gap-5">
              {T.how.map(([h, p], i) => (
                <li key={h} className="border border-slate-200 bg-white p-5">
                  <p className="text-sm font-extrabold text-primary-dark tabular-nums">{i + 1}</p>
                  <p className="mt-1 text-lg font-extrabold">{h}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 break-keep">{p}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-slate-500 break-keep">{T.privacy}</p>
          </div>
        </section>
      </main>
      <ToolsFooter />
    </div>
  )
}
