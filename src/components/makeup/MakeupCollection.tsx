// AI 메이크업 — 9룩 컬렉션 (2026-10-12)
// ────────────────────────────────────────────────────────────────────
// 셀카 한 장 → 9룩 전부 + 3×3 모아보기 1장 = 10장, $4.99(크레딧 9개 충전 후 자동 생성).
//
// 왜 묶음인가: TikTok·CF 로 알리는 게 "9룩"이다. 광고에서 본 9개를 내 얼굴로 한 번에 받는 게
// 가장 자연스러운 상품이고, "크레딧 5개"보다 받을 결과물이 분명하다(Lensa 의 아바타 팩 방식).
// 모아보기는 맨얼굴 없이 "나한테 제일 어울리는 건?" + 번호 — 올리고 싶은 결과물이어야 퍼진다.
//
// 규칙:
//   · 9장 전부 **같은 셀카 한 장**으로 새로 만든다. 무료 1회 결과는 섞지 않는다(얼굴·옷·배경이
//     달라져 모아보기가 깨진다). 서버도 `collection: true` 면 무료 1회를 건드리지 않는다.
//   · 룩마다 jobId 를 고정해 둔다 → 실패 재시도·새로고침 후 이어 만들기에도 이중 차감 없음.
//   · 셀카·결과는 이 기기(IndexedDB)에만 둔다(collectionStore.ts). 서버 업로드 없음.
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getCreditBalance } from '../../lib/credits'
import { MAKEUP_STYLES, promptWholeFace, type MakeupStyleId } from '../../lib/makeup/styles'
import { lookImage } from '../../lib/makeup/lookImages'
import { fitPreserveAspect } from '../../lib/makeup/compose'
import { buildCollectionGrid } from '../../lib/makeup/collectionGrid'
import { buildMakeupComposite } from '../../lib/makeup/composite'
import { loadCollection, saveCollection, type CollectionState } from '../../lib/makeup/collectionStore'
import { startPackCheckout } from '../../lib/makeup/packCheckout'
import { isNativeApp, nativeSaveImage } from '../../lib/nativePicker'
import { screenBg, surfaceStyle, btnPrimary, btnPrimaryStyle, btnGhost, btnGhostStyle, eyebrow } from './theme'

function gtagEvent(name: string, params?: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', name, params)
}

export const COLLECTION_PRICE = '$4.99'
const COLLECTION_PACK = { id: 'collection' as const, credits: 9, value: 4.99 }
const CONCURRENCY = 3
const IDS = MAKEUP_STYLES.map((s) => s.id)

function makeJobId(): string {
  try { return crypto.randomUUID() } catch { /* secure context 아니면 폴백 */ }
  return 'job-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}

/** 결과 PNG(장당 수 MB) → JPEG 로 줄여 보관·저장한다. 9장을 기기에 담아야 해서. */
async function toJpeg(src: string): Promise<string> {
  const img = await loadImg(src)
  const c = document.createElement('canvas')
  c.width = img.naturalWidth; c.height = img.naturalHeight
  c.getContext('2d')!.drawImage(img, 0, 0)
  return c.toDataURL('image/jpeg', 0.92)
}

function dataUrlToFile(dataUrl: string, name: string): File {
  const [head, b64] = dataUrl.split(',')
  const type = /data:([^;]+)/.exec(head)?.[1] || 'image/jpeg'
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new File([arr], name, { type })
}

// 저장 경로 판정 — 인앱 브라우저(인스타·카톡·틱톡·네이버 등)는 다운로드를 무시하거나 파일 공유를
// 못 해서 "꾹 눌러 저장" 보기로 보낸다. iOS 는 공유 창의 "이미지 N개 저장"이 사진첩으로 바로 간다.
// 안드로이드 크롬 공유 창엔 "기기에 저장"이 없는 폰이 많아 공유 대신 다운로드(갤러리에 잡힌다).
const ua = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent)
const isInApp = () => /KAKAOTALK|Instagram|FBAN|FBAV|NAVER\(inapp|Line\/|musical_ly|BytedanceWebview|TikTok|Snapchat/i.test(ua())
const isIOS = () => /iPhone|iPad|iPod/.test(ua()) || (/Macintosh/.test(ua()) && typeof document !== 'undefined' && 'ontouchend' in document)

const doneCount = (s: CollectionState | null) => (s ? IDS.filter((id) => s.items[id]?.image).length : 0)
/** 아직 결제가 필요한 룩 수 — 차감 후 실패한 룩(charged)은 재시도가 무료라 빼고 센다 */
const neededCredits = (s: CollectionState | null) =>
  s ? IDS.filter((id) => !s.items[id]?.image && !s.items[id]?.charged).length : IDS.length

type Phase = 'loading' | 'intro' | 'waiting' | 'running' | 'done' | 'login'
type TileStatus = 'idle' | 'working' | 'error'

interface Props {
  isEn: boolean
  /** 지금 화면에 있는 셀카(업로드 직후·결과 화면에서 진입). 없으면 기기에 저장된 컬렉션을 이어간다. */
  photo?: string
  /** 결제 후 복귀(/analysis/?collection=1) — 잔액이 들어오면 바로 생성 시작 */
  resume?: boolean
  onBack: () => void
  /** 셀카를 새로 올리러 간다(저장된 컬렉션이 없을 때 포함) */
  onRetake: () => void
  /** 로그인 화면 주소(?next= 포함) */
  loginHref: string
}

export default function MakeupCollection({ isEn, photo, resume, onBack, onRetake, loginHref }: Props) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [state, setState] = useState<CollectionState | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [tiles, setTiles] = useState<Partial<Record<MakeupStyleId, TileStatus>>>({})
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [grid, setGrid] = useState<string | null>(null)
  const [files, setFiles] = useState<File[] | null>(null)
  // 저장·메일용 낱장 = 사진 아래 룩 이름 + 로고(결과 화면 단일 저장과 같은 1080×1920 디자인)
  const [singles, setSingles] = useState<string[] | null>(null)
  const [viewer, setViewer] = useState(false)
  const [mail, setMail] = useState<'idle' | 'sending' | 'sent' | 'error' | 'limit'>('idle')
  const [mailTo, setMailTo] = useState('')
  const stateRef = useRef<CollectionState | null>(null)
  const runningRef = useRef(false)

  const remaining = IDS.length - doneCount(state)
  const needed = neededCredits(state)
  const commit = useCallback((next: CollectionState) => {
    stateRef.current = next
    setState(next)
    void saveCollection(next)
  }, [])

  const refreshBalance = useCallback(async () => {
    const b = await getCreditBalance().catch(() => 0)
    setBalance(b)
    return b
  }, [])

  // ── 진입: 지금 셀카로 새 컬렉션 준비 or 저장된 컬렉션 이어가기
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { if (!cancelled) setPhase('login'); return }
      const saved = await loadCollection()
      let s: CollectionState | null = null
      if (photo) {
        const img = await loadImg(photo)
        const selfie = fitPreserveAspect(img).canvas.toDataURL('image/png')
        // 같은 셀카로 다시 들어온 거면(뒤로 갔다 옴) 만든 룩을 살린다
        s = saved && saved.selfie === selfie ? saved : { selfie, items: {}, createdAt: Date.now() }
      } else {
        s = saved
      }
      if (cancelled) return
      if (!s) { onRetake(); return }
      commit(s)
      await refreshBalance()
      if (cancelled) return
      gtagEvent('collection_view', { resume: !!resume, done: doneCount(s) })
      setPhase(doneCount(s) === IDS.length ? 'done' : resume ? 'waiting' : 'intro')
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 생성: 룩별 jobId 고정, 동시에 3개씩
  const generateAll = useCallback(async () => {
    if (runningRef.current || !stateRef.current) return
    runningRef.current = true
    setMsg(null)
    setPhase('running')
    gtagEvent('collection_start', { remaining: IDS.length - doneCount(stateRef.current) })

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) { runningRef.current = false; setPhase('login'); return }

    // jobId 먼저 전부 박아 둔다(중간에 닫혀도 다음에 같은 키로 이어간다)
    const base = stateRef.current
    const items = { ...base.items }
    for (const id of IDS) if (!items[id]) items[id] = { jobId: makeJobId() }
    commit({ ...base, items })

    const queue = IDS.filter((id) => !stateRef.current!.items[id]?.image)
    let stop: 'credits' | 'login' | null = null

    const worker = async () => {
      while (queue.length && !stop) {
        const id = queue.shift()!
        setTiles((t) => ({ ...t, [id]: 'working' }))
        try {
          const style = MAKEUP_STYLES.find((s) => s.id === id)!
          const res = await fetch('/api/makeup-edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              image: stateRef.current!.selfie, prompt: promptWholeFace(style), styleId: id,
              jobId: stateRef.current!.items[id]!.jobId, size: 'auto', collection: true,
            }),
          })
          const data = (await res.json().catch(() => ({}))) as { image?: string; error?: string; balance?: number }
          if (res.status === 402) { stop = 'credits'; setTiles((t) => ({ ...t, [id]: 'idle' })); break }
          if (res.status === 401) { stop = 'login'; setTiles((t) => ({ ...t, [id]: 'idle' })); break }
          if (res.status === 502) {
            // 차감은 됐고 생성만 실패 — 같은 jobId 로 다시 부르면 추가 차감 없이 재생성된다
            const cur = stateRef.current!
            commit({ ...cur, items: { ...cur.items, [id]: { ...cur.items[id]!, charged: true } } })
          }
          if (!res.ok || !data.image) throw new Error(data.error || String(res.status))
          const image = await toJpeg(data.image)
          const cur = stateRef.current!
          commit({ ...cur, items: { ...cur.items, [id]: { ...cur.items[id]!, image } } })
          if (typeof data.balance === 'number') setBalance(data.balance)
          setTiles((t) => ({ ...t, [id]: 'idle' }))
          gtagEvent('collection_look_done', { style: id })
        } catch {
          setTiles((t) => ({ ...t, [id]: 'error' }))
        }
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    runningRef.current = false

    if (stop === 'login') { setPhase('login'); return }
    if (stop === 'credits') {
      await refreshBalance()
      setMsg(isEn ? 'Not enough credits to finish. Get the collection to continue.' : '크레딧이 모자라 멈췄어요. 컬렉션을 결제하면 이어서 만들어요.')
      setPhase('intro'); return
    }
    if (doneCount(stateRef.current) === IDS.length) {
      gtagEvent('collection_complete', {})
      setPhase('done')
    } else {
      await refreshBalance()
      setMsg(isEn
        ? 'Some looks failed. Tap the button to retry — you will not be charged twice.'
        : '몇 개가 실패했어요. 버튼을 눌러 이어서 만들어 주세요 — 이중으로 차감되지 않아요.')
      setPhase('intro')
    }
  }, [commit, isEn, refreshBalance])

  // ── 결제 복귀: 웹훅이 크레딧을 넣을 때까지 잠깐 기다렸다가 자동 시작
  useEffect(() => {
    if (phase !== 'waiting') return
    let tries = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = async () => {
      const b = await refreshBalance()
      if (b >= neededCredits(stateRef.current)) { void generateAll(); return }
      if (++tries < 30) timer = setTimeout(tick, 3000)
      else { setMsg(isEn ? 'Payment is still being confirmed. Try again in a moment.' : '결제 확인이 늦어지고 있어요. 잠시 뒤 다시 눌러 주세요.'); setPhase('intro') }
    }
    void tick()
    return () => clearTimeout(timer)
  }, [phase, refreshBalance, generateAll, isEn])

  // 앱: 브라우저에서 결제하고 돌아오면 잔액을 다시 읽는다
  useEffect(() => {
    if (phase !== 'intro') return
    const onVisible = () => { if (document.visibilityState === 'visible') void refreshBalance() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [phase, refreshBalance])

  // ── 완성: 모아보기 만들고, 저장·공유용 파일을 미리 만들어 둔다(공유는 탭 직후 바로 불러야 함)
  useEffect(() => {
    if (phase !== 'done' || !state) return
    let cancelled = false
    ;(async () => {
      const looks = MAKEUP_STYLES.map((style) => ({ style, image: state.items[style.id]!.image! }))
      const canvas = await buildCollectionGrid(looks, isEn)
      const gridUrl = canvas.toDataURL('image/jpeg', 0.92)
      if (cancelled) return
      setGrid(gridUrl)
      const branded: string[] = []
      for (const l of looks) {
        const c = await buildMakeupComposite({ afterSrc: l.image, styleName: isEn ? l.style.subEn : l.style.nameKo, styleDesc: '' })
        branded.push(c.toDataURL('image/jpeg', 0.92))
      }
      if (cancelled) return
      setSingles(branded)
      setFiles([
        dataUrlToFile(gridUrl, 'kissinskin-my-9-looks.jpg'),
        ...looks.map((l, i) => dataUrlToFile(branded[i], `kissinskin-${i + 1}-${l.style.id}.jpg`)),
      ])
    })().catch(() => setMsg(isEn ? 'Could not build the grid image.' : '모아보기 이미지를 만들지 못했어요.'))
    return () => { cancelled = true }
  }, [phase, state, isEn])

  async function buy() {
    setBusy(true); setMsg(null)
    gtagEvent('collection_checkout', { remaining })
    const outcome = await startPackCheckout(COLLECTION_PACK)
    if (outcome === 'error') setMsg(isEn ? 'Could not start checkout. Please try again.' : '결제를 시작하지 못했어요. 다시 시도해 주세요.')
    if (outcome === 'external') setMsg(isEn ? 'Finish payment in your browser, then come back here.' : '브라우저에서 결제를 마치고 이 화면으로 돌아와 주세요.')
    if (outcome !== 'redirect') setBusy(false)
  }

  async function saveAll() {
    if (!files || !grid || !state) return
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
    if (isNativeApp()) {
      const urls = [grid, ...(singles ?? [])]
      for (const u of urls) await nativeSaveImage(u)
      gtagEvent('collection_save', { method: 'native' })
      return
    }
    if (isInApp()) {
      setViewer(true)
      gtagEvent('collection_save', { method: 'longpress' })
      return
    }
    // 아이폰: 공유 시트 한 번으로 10장을 사진첩에 저장/바로 올리기
    if (isIOS() && typeof nav.share === 'function' && nav.canShare?.({ files })) {
      try {
        await nav.share({ files, title: isEn ? 'My 9 looks' : '나의 9룩' })
        gtagEvent('collection_save', { method: 'share' })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }
    // 안드로이드 크롬·데스크톱: 하나씩 내려받기(크롬이 "여러 파일 다운로드 허용"을 한 번 묻는다)
    for (const f of files) {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(f)
      a.download = f.name
      document.body.appendChild(a); a.click(); a.remove()
      await new Promise((r) => setTimeout(r, 250))
    }
    gtagEvent('collection_save', { method: 'download' })
  }

  async function sendMail() {
    if (!grid || !singles) return
    setMail('sending')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setPhase('login'); return }
      const images = [
        { name: 'kissinskin-my-9-looks.jpg', dataUrl: grid },
        ...MAKEUP_STYLES.map((s, i) => ({ name: `kissinskin-${i + 1}-${s.id}.jpg`, dataUrl: singles[i] })),
      ]
      const res = await fetch('/api/collection-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ images, lang: isEn ? 'en' : 'ko' }),
      })
      const d = (await res.json().catch(() => ({}))) as { to?: string }
      if (res.status === 429) { setMail('limit'); return }
      if (!res.ok) throw new Error(String(res.status))
      setMailTo(d.to || '')
      setMail('sent')
      gtagEvent('collection_save', { method: 'email' })
    } catch {
      setMail('error')
    }
  }

  function saveOne(file: File) {
    if (isNativeApp()) {
      const r = new FileReader()
      r.onload = () => { void nativeSaveImage(String(r.result)) }
      r.readAsDataURL(file)
      return
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(file)
    a.download = file.name
    document.body.appendChild(a); a.click(); a.remove()
  }

  // ── 렌더
  const header = (
    <header className="px-5 pt-5 flex items-center gap-3 max-w-xl w-full mx-auto">
      <button onClick={onBack} aria-label={isEn ? 'Back' : '뒤로'} className="shrink-0 -ml-1 p-1 text-white/80 hover:text-white">
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 className="flex-1 text-center text-sm font-bold uppercase tracking-[0.18em] text-white/85">
        {isEn ? 'My 9 looks' : '나의 9룩 컬렉션'}
      </h1>
      <span className="w-7" />
    </header>
  )

  if (phase === 'loading') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={screenBg}>
        <div className="w-10 h-10 border-[3px] border-white/25 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (phase === 'login') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-5 font-display text-white px-8 text-center" style={screenBg}>
        <p className="text-[15px] text-white/85 break-keep">{isEn ? 'Log in to create your 9-look collection.' : '로그인하면 9룩 컬렉션을 만들 수 있어요.'}</p>
        <a href={loginHref} className={`${btnPrimary} max-w-[260px] block`} style={btnPrimaryStyle}>{isEn ? 'Log in' : '로그인'}</a>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="min-h-[100dvh] font-display text-white pb-12" style={screenBg}>
        {header}
        <main className="px-5 pt-5 max-w-xl w-full mx-auto">
          <div className="mx-auto w-full max-w-[360px] aspect-[9/16] overflow-hidden rounded-2xl bg-white">
            {grid
              ? <img src={grid} alt={isEn ? 'My 9 looks in one image' : '나의 9룩 모아보기'} className="w-full h-full object-contain" />
              : <div className="w-full h-full flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-500 rounded-full animate-spin" /></div>}
          </div>
          <button onClick={saveAll} disabled={!files} className={`${btnPrimary} mt-5`} style={btnPrimaryStyle}>
            {isEn ? 'Save all 10 images' : '10장 모두 저장'}
          </button>
          <button onClick={sendMail} disabled={!singles || mail === 'sending' || mail === 'sent'} className={`${btnGhost} mt-2.5 w-full disabled:opacity-60`} style={btnGhostStyle}>
            <span className="material-symbols-outlined text-base">mail</span>
            {mail === 'sending' ? (isEn ? 'Sending…' : '보내는 중…')
              : mail === 'sent' ? (isEn ? `Sent to ${mailTo}` : `${mailTo} 로 보냈어요`)
              : (isEn ? 'Email all 10 to me' : '내 메일로 10장 받기')}
          </button>
          {mail === 'error' && <p className="mt-2 text-center text-xs text-red-200">{isEn ? 'Could not send. Please try again.' : '보내지 못했어요. 다시 시도해 주세요.'}</p>}
          {mail === 'limit' && <p className="mt-2 text-center text-xs text-red-200">{isEn ? 'You can email this up to 3 times a day.' : '메일 받기는 하루 3번까지예요.'}</p>}
          <p className="mt-2 text-center text-[11px] text-white/55 break-keep">
            {isEn ? 'Sent only to your account email. Check spam if it does not arrive.' : '로그인한 계정 메일로만 보내요. 안 보이면 스팸함을 확인해 주세요.'}
          </p>

          <p className={`${eyebrow} mt-8 mb-3 text-white/55`}>{isEn ? 'Each look' : '낱장'}</p>
          <div className="grid grid-cols-3 gap-2">
            {MAKEUP_STYLES.map((s, i) => (
              <button key={s.id} type="button" onClick={() => files && saveOne(files[i + 1])}
                className="relative aspect-[3/4] overflow-hidden rounded-lg bg-white/5" aria-label={(isEn ? 'Save ' : '저장 ') + (isEn ? s.subEn : s.nameKo)}>
                <img src={state!.items[s.id]!.image} alt="" className="absolute inset-0 w-full h-full object-cover object-[50%_30%]" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1.5 pt-5 text-[10px] font-bold leading-tight">
                  {i + 1}. {isEn ? s.subEn : s.nameKo}
                </span>
                <span className="absolute right-1 top-1 material-symbols-outlined text-[18px] text-white drop-shadow">download</span>
              </button>
            ))}
          </div>
          <p className="mt-6 text-center text-[11px] leading-relaxed text-white/45 break-keep">
            {isEn
              ? 'Images stay on this device only — we do not upload your selfie. AI-generated makeup.'
              : '이미지는 이 기기에만 보관돼요(셀카를 서버에 올리지 않아요). AI 로 만든 메이크업이에요.'}
          </p>
          <button onClick={onRetake} className={`${btnGhost} mt-4 w-full`} style={btnGhostStyle}>
            {isEn ? 'New collection with another selfie' : '다른 셀카로 새 컬렉션'}
          </button>
          {msg && <p className="mt-3 text-center text-xs text-red-200">{msg}</p>}
        </main>

        {/* 인앱 브라우저용 — 다운로드가 막히는 곳에서도 사진 길게 누르기 저장은 된다 */}
        {viewer && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 px-5 pb-10" role="dialog" aria-modal="true">
            <div className="sticky top-0 -mx-5 flex items-center gap-3 bg-black/90 px-5 py-4">
              <p className="flex-1 text-[14px] font-bold text-white break-keep">
                {isEn ? 'Press and hold each image to save it' : '사진을 꾹 눌러서 하나씩 저장하세요'}
              </p>
              <button onClick={() => setViewer(false)} aria-label={isEn ? 'Close' : '닫기'} className="material-symbols-outlined text-white">close</button>
            </div>
            <p className="mb-4 text-[12px] text-white/60 break-keep">
              {isEn ? 'Or open this page in Safari/Chrome, or use "Email all 10 to me".' : '안 되면 사파리·크롬으로 열거나 "내 메일로 10장 받기"를 쓰세요.'}
            </p>
            <div className="mx-auto flex max-w-sm flex-col gap-4">
              {[grid!, ...(singles ?? [])].map((src, i) => (
                <img key={i} src={src} alt={i === 0 ? (isEn ? 'Grid image' : '모아보기') : `${i}`} className="w-full rounded-lg" />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // intro · waiting · running — 9칸 진행판
  const running = phase === 'running' || phase === 'waiting'
  const enough = balance != null && balance >= needed
  return (
    <div className="min-h-[100dvh] font-display text-white pb-12" style={screenBg}>
      {header}
      <main className="px-5 pt-5 max-w-xl w-full mx-auto">
        <div className="text-center">
          <p className={`${eyebrow} text-white/55`}>{isEn ? 'One selfie · 9 looks' : '셀카 한 장 · 9룩 전부'}</p>
          <h2 className="mt-2 text-[24px] font-extrabold tracking-[-0.02em] break-keep">
            {isEn ? 'All 9 looks on your face + 1 grid image' : '내 얼굴로 9룩 전부 + 모아보기 1장'}
          </h2>
          <p className="mt-2 text-sm text-white/75 break-keep">
            {isEn
              ? '10 images to post right away — the grid asks friends "which one suits me?"'
              : '바로 올릴 수 있는 10장 — 모아보기에는 "나한테 제일 어울리는 건?"이 들어가요.'}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {MAKEUP_STYLES.map((s, i) => {
            const done = state?.items[s.id]?.image
            const st = tiles[s.id]
            return (
              <div key={s.id} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-white/5">
                <img src={done || lookImage(s.id)?.after} alt="" className={`absolute inset-0 w-full h-full object-cover object-[50%_30%] ${done ? '' : 'opacity-40'}`} />
                {st === 'working' && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-7 h-7 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                  </span>
                )}
                {st === 'error' && <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-red-200">error</span>}
                {done && <span className="absolute right-1 top-1 material-symbols-outlined text-[18px] text-emerald-300" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1.5 pt-5 text-[10px] font-bold leading-tight">
                  {i + 1}. {isEn ? s.subEn : s.nameKo}
                </span>
              </div>
            )
          })}
        </div>

        {running ? (
          <div className="mt-6 text-center">
            <p className="text-base font-extrabold">
              {phase === 'waiting'
                ? (isEn ? 'Confirming payment…' : '결제 확인 중…')
                : (isEn ? `Creating… ${doneCount(state)} / 9` : `만드는 중… ${doneCount(state)} / 9`)}
            </p>
            <p className="mt-1 text-xs text-white/60 break-keep">
              {isEn ? 'Takes about 2–3 minutes. If you close this, you can pick up where you left off.' : '2~3분 걸려요. 창을 닫아도 다시 들어오면 이어서 만들어요.'}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {state?.selfie && (
              <div className="flex items-center gap-3 p-3" style={surfaceStyle}>
                <img src={state.selfie} alt={isEn ? 'Your selfie' : '내 셀카'} className="h-14 w-11 shrink-0 rounded object-cover" />
                <p className="flex-1 text-[12px] text-white/75 break-keep">
                  {isEn ? 'All 9 looks use this one selfie.' : '9룩 전부 이 셀카 한 장으로 만들어요.'}
                </p>
                <button onClick={onRetake} className="shrink-0 text-[12px] font-bold underline underline-offset-2 text-white/85">
                  {isEn ? 'Change' : '바꾸기'}
                </button>
              </div>
            )}
            {doneCount(state) > 0 && enough ? (
              <button onClick={() => void generateAll()} className={btnPrimary} style={btnPrimaryStyle}>
                {isEn ? `Finish the remaining ${remaining}` : `남은 ${remaining}개 이어서 만들기`}
              </button>
            ) : enough ? (
              <button onClick={() => void generateAll()} className={btnPrimary} style={btnPrimaryStyle}>
                {isEn ? `Create with ${needed} credits` : `크레딧 ${needed}개로 9룩 만들기`}
              </button>
            ) : (
              <button onClick={buy} disabled={busy} className={btnPrimary} style={btnPrimaryStyle}>
                {busy ? (isEn ? 'Opening checkout…' : '결제창 여는 중…') : (isEn ? `Get my 9 looks · ${COLLECTION_PRICE}` : `9룩 컬렉션 받기 · ${COLLECTION_PRICE}`)}
              </button>
            )}
            <p className="text-center text-[11px] text-white/55 break-keep">
              {balance != null && (isEn ? `Balance: ${balance} credit(s) · ` : `현재 잔액 ${balance} 크레딧 · `)}
              {isEn ? 'Secure checkout via Polar · refund requests within 14 days' : 'Polar 안전 결제 · 14일 이내 환불 요청 가능'}
            </p>
          </div>
        )}
        {msg && <p className="mt-3 text-center text-xs text-red-200 break-keep">{msg}</p>}
        <p className="mt-6 text-center text-[11px] text-white/40 break-keep">
          {isEn ? 'Your selfie and results stay on this device.' : '셀카와 결과는 이 기기에만 보관돼요.'}
        </p>
      </main>
    </div>
  )
}
