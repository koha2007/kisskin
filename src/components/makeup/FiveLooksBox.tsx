// 1장 · 5장 · 9장 고르기 탭 + 5가지 골라 만들기 패널 — 9가지 메이크업·럭키 메이크업 공용 (2026-11-02)
// ────────────────────────────────────────────────────────────────────
// 운영자: "1가지 선택과 5가지 선택, 9장 모두 선택을 어떻게 해? 5가지는 안 되고 있어."
// 규칙:
//   · 5가지를 고르고 셀카를 넣는다. 보유 장수가 모자라면 5장($2.99) 결제 → 복귀하면 잔액 확인 후 자동으로 이어 만든다.
//   · 5장은 항상 크레딧으로 만든다(무료권은 1장 탭에서 쓴다 — 9장 묶음과 같은 규칙).
//   · 룩마다 jobId 를 고정한다. 실패·새로고침 후 다시 만들어도 이중 차감 없음(jobId 가 있으면 이미 차감된 것으로 센다).
//   · 셀카·결과는 이 기기(IndexedDB)에만 둔다(fiveStore.ts).
import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import type { FreeStatus } from '../../lib/freeStatus'
import { buildMakeupComposite } from '../../lib/makeup/composite'
import { dataUrlToFile, mailImages, saveAllImages, saveOneImage, toJpegDataUrl } from '../../lib/makeup/collectionSave'
import { clearFive, loadFive, saveFive, type FiveKey, type FiveRun } from '../../lib/makeup/fiveStore'
import { startPackCheckout } from '../../lib/makeup/packCheckout'
import LongPressSaveViewer from './LongPressSaveViewer'

export const FIVE_COUNT = 5
export type LookMode = 'one' | 'five' | 'nine'

const STARTER = { id: 'starter' as const, credits: 5, value: 2.99 }
const CONCURRENCY = 3
const RESUME_WINDOW_MS = 2 * 60 * 60 * 1000

export function LookModeTabs({ mode, isEn, onChange, nineLabel }: { mode: LookMode; isEn: boolean; onChange: (m: LookMode) => void; nineLabel: { ko: string; en: string } }) {
  const tabs: { m: LookMode; n: string; p: string }[] = [
    { m: 'one', n: isEn ? '1 look' : '1가지', p: isEn ? 'Free' : '가입 무료' },
    { m: 'five', n: isEn ? '5 looks' : '5가지', p: '$2.99' },
    { m: 'nine', n: isEn ? nineLabel.en : nineLabel.ko, p: '$4.99' },
  ]
  return (
    <div role="tablist" aria-label={isEn ? 'How many looks' : '몇 가지 만들까요'} className="mt-4 grid grid-cols-3 border border-navy bg-white">
      {tabs.map((t) => {
        const on = t.m === mode
        return (
          <button key={t.m} type="button" role="tab" aria-selected={on} onClick={() => onChange(t.m)} className={`px-1 py-2.5 text-center transition-colors ${on ? 'bg-navy text-white' : 'text-navy hover:bg-cream'}`}>
            <span className="block text-sm font-extrabold md:text-base">{t.n}</span>
            <span className={`block text-[11px] font-semibold tabular-nums ${on ? 'text-white/75' : 'text-slate-500'}`}>{t.p}</span>
          </button>
        )
      })}
    </div>
  )
}

export interface FiveLook { id: string; name: string; desc: string; img: string; howHref: string }
type GenResult = { ok: true; image: string; balance?: number } | { ok: false; error: 'login' | 'topup' | 'free_used' | 'choose' | 'unavailable' | 'retry' }

export default function FiveLooksBox({ storeKey, isEn, base, photo, picked, looks, loggedIn, free, generate, onPhoto, onClearPhoto, onRestore, onLocked, onReset, onFree, onLoggedOut }: {
  storeKey: FiveKey
  isEn: boolean
  base: string
  photo: string | null
  picked: string[]
  looks: FiveLook[]
  loggedIn: boolean | null
  free: FreeStatus | null
  generate: (id: string, selfie: string, jobId: string) => Promise<GenResult>
  onPhoto: (mode: 'camera' | 'gallery') => void
  onClearPhoto: () => void
  /** 저장된 작업을 되살린다. open = 5가지 탭을 열어 보여 준다 */
  onRestore: (ids: string[], selfie: string, open: boolean) => void
  onLocked: (locked: boolean) => void
  onReset: () => void
  onFree: () => void
  onLoggedOut: () => void
}) {
  const [run, setRun] = useState<FiveRun | null>(null)
  const [working, setWorking] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [singles, setSingles] = useState<string[] | null>(null)
  const [files, setFiles] = useState<File[] | null>(null)
  const [viewer, setViewer] = useState(false)
  const [mail, setMail] = useState<'idle' | 'sending' | 'sent' | 'error' | 'limit'>('idle')
  const [mailTo, setMailTo] = useState('')
  const runRef = useRef<FiveRun | null>(null)
  const runningRef = useRef(false)

  const commit = (next: FiveRun | null) => {
    runRef.current = next
    setRun(next)
    if (next) void saveFive(storeKey, next)
  }

  const started = !!run && Object.values(run.items).some(Boolean)
  const ids = started ? run!.ids : picked
  const selfie = started ? run!.selfie : photo
  const items = (started ? run!.items : {}) as FiveRun['items']
  const unfinished = ids.filter((id) => !items[id]?.image)
  // jobId 가 있으면 이미 차감됐거나 같은 키로 다시 부르면 추가 차감이 없다 → 새로 낼 장수에서 뺀다
  const needed = ids.filter((id) => !items[id]?.jobId).length
  const done = ids.length === FIVE_COUNT && unfinished.length === 0
  const credits = free?.balance ?? 0
  const enough = !!free && credits >= needed
  const lookOf = (id: string) => looks.find((l) => l.id === id)

  useEffect(() => { onLocked(started) }, [started]) // eslint-disable-line react-hooks/exhaustive-deps

  // 진입: 진행 중인 작업 · 로그인 복귀(?resume=1&mode=5) · 결제 복귀(?paid=1) 를 되살린다
  useEffect(() => {
    let off = false
    const q = new URLSearchParams(window.location.search)
    loadFive(storeKey).then((saved) => {
      if (off || !saved) return
      const hasJobs = Object.values(saved.items).some(Boolean)
      const complete = saved.ids.every((id) => saved.items[id]?.image)
      const paidBack = q.get('paid') === '1' && !!saved.armedAt && Date.now() - saved.armedAt < RESUME_WINDOW_MS
      const loginBack = q.get('resume') === '1' && q.get('mode') === '5'
      if (!hasJobs && !paidBack && !loginBack) return
      const next = { ...saved, armedAt: undefined }
      commit(next)
      onRestore(saved.ids, saved.selfie, paidBack || loginBack || (hasJobs && !complete && !q.get('look')))
      if (paidBack) setWaiting(true)
    })
    return () => { off = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 잔액을 아직 못 읽었으면 다시 읽는다(버튼을 잘못 띄우지 않게)
  useEffect(() => {
    if (!loggedIn || free) return
    const t = setInterval(onFree, 3000)
    return () => clearInterval(t)
  }, [loggedIn, free, onFree])

  // 앱: 브라우저에서 결제하고 돌아오면 잔액을 다시 읽는다
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible' && loggedIn) onFree() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [loggedIn, onFree])

  const make = async () => {
    if (runningRef.current || !selfie || ids.length !== FIVE_COUNT) return
    runningRef.current = true
    setRunning(true); setMsg(null); setWaiting(false)
    const cur0 = runRef.current
    const base0: FiveRun = cur0 && cur0.selfie === selfie && cur0.ids.join() === ids.join() ? cur0 : { selfie, ids, items: {} }
    commit({ ...base0, armedAt: undefined })
    trackEvent('look5_generate', { store: storeKey, n: unfinished.length })

    const queue = ids.filter((id) => !base0.items[id]?.image)
    let stop: 'login' | 'topup' | null = null
    let failed = false
    const setItem = (id: string, v: FiveRun['items'][string]) => {
      const cur = runRef.current!
      commit({ ...cur, items: { ...cur.items, [id]: v } })
    }
    const worker = async () => {
      while (queue.length && !stop) {
        const id = queue.shift()!
        const jobId = runRef.current!.items[id]?.jobId || newJobId()
        setItem(id, { jobId })
        setWorking((w) => [...w, id])
        const r = await generate(id, selfie, jobId)
        setWorking((w) => w.filter((x) => x !== id))
        if (r.ok) {
          const image = await toJpegDataUrl(r.image).catch(() => r.image)
          setItem(id, { jobId, image })
          trackEvent('look5_generated', { store: storeKey, look: id })
        } else if (r.error === 'login') {
          stop = 'login'
        } else if (r.error === 'topup') {
          // 차감되지 않았다 → 키를 비워 '새로 낼 장수'로 다시 센다(결제 버튼이 뜬다)
          setItem(id, undefined); stop = 'topup'
        } else {
          failed = true // retry·unavailable: 같은 jobId 로 다시 부르면 추가 차감 없음
        }
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    runningRef.current = false
    setRunning(false)
    onFree()
    if (stop === 'login') { onLoggedOut(); setMsg(isEn ? 'Please log in to continue.' : '로그인하면 이어서 만들어요.'); return }
    if (stop === 'topup') { setMsg(isEn ? 'Not enough looks to finish. Top up and we’ll carry on.' : '장수가 모자라 멈췄어요. 충전하면 이어서 만들어요.'); return }
    if (failed) { setMsg(isEn ? 'Some looks failed. Tap below to retry — you won’t be charged twice.' : '몇 장이 실패했어요. 아래 버튼을 누르면 추가 차감 없이 다시 만들어요.'); return }
    trackEvent('look5_all_done', { store: storeKey })
  }

  // 결제 복귀 — 웹훅 충전이 몇 초 늦을 수 있어 잔액이 들어올 때까지 다시 읽고, 들어오면 자동 시작
  const triesRef = useRef(0)
  useEffect(() => {
    if (!waiting || !run || loggedIn === null) return
    if (free && credits >= needed) { void make(); return }
    const t = setInterval(() => {
      if (triesRef.current++ < 30) { onFree(); return }
      setWaiting(false)
      setMsg(isEn ? 'Your payment is taking longer than usual. Refresh in a minute, or email support@kissinskin.net.' : '충전 반영이 늦어지고 있어요. 1분 뒤 새로고침해 주세요. 계속 안 되면 support@kissinskin.net 으로 알려 주세요.')
    }, 3000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waiting, run, loggedIn, free])

  const goLogin = async () => {
    if (!selfie || ids.length !== FIVE_COUNT) return
    await saveFive(storeKey, { selfie, ids, items: {} })
    window.location.assign('/auth?next=' + encodeURIComponent(`${base}?resume=1&mode=5`))
  }

  const buy = async () => {
    if (!selfie || ids.length !== FIVE_COUNT) return
    setPaying(true); setMsg(null)
    const keep: FiveRun = { selfie, ids, items: items, armedAt: Date.now() }
    await saveFive(storeKey, keep)
    trackEvent('paywall_cta', { plan: 'starter', from: `${storeKey}_five` })
    const out = await startPackCheckout(STARTER, base)
    if (out === 'error') {
      await saveFive(storeKey, { ...keep, armedAt: undefined })
      setMsg(isEn ? 'Couldn’t open checkout. Please try again.' : '결제창을 열지 못했어요. 다시 눌러 주세요.')
    }
    if (out === 'external') setMsg(isEn ? 'Finish payment in your browser, then come back here.' : '브라우저에서 결제를 마치고 이 화면으로 돌아와 주세요.')
    if (out !== 'redirect') setPaying(false)
  }

  const reset = async () => {
    await clearFive(storeKey)
    commit(null)
    setSingles(null); setFiles(null); setMail('idle'); setMsg(null)
    onReset()
  }

  // 다 만들면 저장·메일용 낱장(룩 이름 + 로고)을 미리 만들어 둔다(공유는 탭 직후 바로 불러야 함)
  useEffect(() => {
    if (!done || running) return
    let off = false
    setSingles(null); setFiles(null); setMail('idle')
    ;(async () => {
      const branded: string[] = []
      for (const id of ids) {
        const l = lookOf(id)
        const c = await buildMakeupComposite({ afterSrc: items[id]!.image!, styleName: l?.name ?? '', styleDesc: l?.desc ?? '' })
        branded.push(c.toDataURL('image/jpeg', 0.92))
      }
      if (off) return
      setSingles(branded)
      setFiles(ids.map((id, i) => dataUrlToFile(branded[i], `kissinskin-${storeKey}-${i + 1}-${id}.jpg`)))
    })().catch(() => setMsg(isEn ? 'Could not build the save images. Refresh and try again.' : '저장 이미지를 만들지 못했어요. 새로고침 후 다시 시도해 주세요.'))
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, running, ids.join()])

  const saveAll = async () => {
    if (!files || !singles) return
    const method = await saveAllImages(files, singles, isEn ? 'My 5 looks' : '나의 5가지 메이크업')
    if (method === 'cancel') return
    if (method === 'viewer') setViewer(true)
    trackEvent('look5_save', { store: storeKey, method: method === 'viewer' ? 'longpress' : method })
  }
  const sendMail = async () => {
    if (!singles) return
    setMail('sending')
    const r = await mailImages(ids.map((id, i) => ({ name: `kissinskin-${storeKey}-${i + 1}-${id}.jpg`, dataUrl: singles[i] })), isEn ? 'en' : 'ko', storeKey === 'lucky' ? 'lucky5' : 'makeup5')
    if (r.k === 'login') { setMail('idle'); onLoggedOut(); return }
    if (r.k !== 'sent') { setMail(r.k); return }
    setMailTo(r.to); setMail('sent')
    trackEvent('look5_save', { store: storeKey, method: 'email' })
  }

  const btn = 'flex w-full items-center justify-center gap-1.5 py-3.5 text-[15px] font-bold transition-colors disabled:opacity-60'
  const lack = FIVE_COUNT - ids.length
  return (
    <div id="five" className="mx-auto mt-10 max-w-xl scroll-mt-20 bg-navy p-5 text-white md:p-7">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-on-dark"><span className="mr-1.5 tabular-nums">2</span>{isEn ? 'Make all 5 on my face' : '고른 5가지를 내 얼굴로'}</p>

      <ol className="mt-3 grid grid-cols-5 gap-1.5">
        {Array.from({ length: FIVE_COUNT }, (_, i) => {
          const id = ids[i]
          const l = id ? lookOf(id) : undefined
          const image = id ? items[id]?.image : undefined
          const tile = l ? (
            <>
              <img src={image ?? l.img} alt={image ? l.name : ''} className={`aspect-[3/4] w-full object-cover object-[50%_26%] ${image ? '' : 'opacity-60'}`} />
              {working.includes(l.id) && <span className="absolute inset-0 flex items-center justify-center bg-navy/50"><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /></span>}
              {files && <span className="material-symbols-outlined absolute right-0.5 top-0.5 rounded-full bg-primary-dark text-[13px] text-white">download</span>}
              <span className="absolute inset-x-0 bottom-0 truncate bg-navy/75 px-0.5 py-0.5 text-center text-[9.5px] font-bold">{l.name}</span>
            </>
          ) : (
            <span className="flex aspect-[3/4] w-full items-center justify-center border border-dashed border-white/40 text-sm font-bold text-white/50">{i + 1}</span>
          )
          return (
            <li key={i} className="min-w-0">
              {files && id
                ? <button type="button" onClick={() => saveOneImage(files[i])} aria-label={(isEn ? 'Save ' : '저장 ') + (l?.name ?? '')} className="relative block w-full overflow-hidden bg-white/5">{tile}</button>
                : <div className="relative overflow-hidden bg-white/5">{tile}</div>}
            </li>
          )
        })}
      </ol>

      <div className="mt-4 space-y-2">
        {msg && <p className="bg-primary/20 px-3 py-2 text-[13px] font-bold">{msg}</p>}
        {running ? (
          <p className="bg-white/10 py-4 text-center text-sm font-bold">{isEn ? `Making ${FIVE_COUNT - unfinished.length} / 5 done… keep this page open` : `${FIVE_COUNT - unfinished.length} / 5장 완성… 이 화면을 열어 두세요`}</p>
        ) : waiting ? (
          <p className="bg-white/10 py-4 text-center text-sm font-bold">{isEn ? 'Payment done. Checking your looks…' : '결제 확인 중… 들어오면 바로 만들어요'}</p>
        ) : done ? (
          <>
            <button type="button" onClick={() => void saveAll()} disabled={!files} className={`${btn} bg-primary text-navy`}>{files ? (isEn ? 'Save all 5 images' : '5장 모두 저장') : (isEn ? 'Preparing images…' : '저장 이미지 준비 중…')}</button>
            <button type="button" onClick={() => void sendMail()} disabled={!singles || mail === 'sending' || mail === 'sent'} className={`${btn} border border-white/40 text-white`}>
              <span className="material-symbols-outlined text-base">mail</span>
              {mail === 'sending' ? (isEn ? 'Sending…' : '보내는 중…') : mail === 'sent' ? (isEn ? `Sent to ${mailTo}` : `${mailTo} 로 보냈어요`) : (isEn ? 'Email all 5 to me' : '내 메일로 5장 받기')}
            </button>
            {mail === 'error' && <p className="text-center text-xs font-bold">{isEn ? 'Could not send. Please try again.' : '보내지 못했어요. 다시 시도해 주세요.'}</p>}
            {mail === 'limit' && <p className="text-center text-xs font-bold">{isEn ? 'You can email this up to 3 times a day.' : '메일 받기는 하루 3번까지예요.'}</p>}
            <p className="text-center text-[11px] text-white/60 break-keep">{isEn ? 'Tap a photo above to save just that one. Sent only to your account email.' : '위 사진을 누르면 한 장씩 저장돼요. 메일은 로그인한 계정으로만 보내요.'}</p>
            <ul className="space-y-1 pt-1 text-xs">
              {ids.map((id) => { const l = lookOf(id); return l ? <li key={id}><a href={l.howHref} className="font-bold underline underline-offset-4">{isEn ? `How to do ${l.name} →` : `${l.name} 따라 하는 방법 →`}</a></li> : null })}
            </ul>
            <button type="button" onClick={() => void reset()} className="block w-full pt-2 text-center text-sm font-bold underline underline-offset-4">{isEn ? 'Choose 5 more' : '다른 5가지 고르기'}</button>
          </>
        ) : lack > 0 ? (
          <a href="#looks" className={`${btn} border border-white/40 text-white`}>{isEn ? `Pick ${lack} more above` : `위에서 ${lack}가지 더 골라 주세요`}</a>
        ) : (
          <>
            {photo || started ? (
              <div className="flex items-center gap-3 bg-white/10 p-2 text-xs">
                <img src={selfie ?? ''} alt="" className="h-12 w-12 object-cover" />
                <span className="min-w-0 flex-1 font-bold">{isEn ? 'Photo ready' : '사진 준비 완료'}</span>
                {!started && <button type="button" onClick={onClearPhoto} className="font-bold underline underline-offset-4">{isEn ? 'Change' : '바꾸기'}</button>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => onPhoto('camera')} className={`${btn} bg-white text-navy`}>{isEn ? 'Take a selfie' : '셀카 찍기'}</button>
                <button type="button" onClick={() => onPhoto('gallery')} className={`${btn} border border-white/40 text-white`}>{isEn ? 'Add a photo' : '사진 넣기'}</button>
              </div>
            )}
            {loggedIn === false ? (
              <button type="button" disabled={!selfie} onClick={() => void goLogin()} className={`${btn} bg-primary text-navy`}>{isEn ? 'Log in to make all 5' : '로그인하고 5장 만들기'}</button>
            ) : !free ? (
              <button type="button" disabled className={`${btn} bg-primary text-navy`}>{isEn ? 'Checking your looks…' : '보유 장수 확인 중…'}</button>
            ) : enough ? (
              <button type="button" disabled={!selfie} onClick={() => void make()} className={`${btn} bg-primary text-navy`}>
                {started
                  ? (isEn ? `Finish the last ${unfinished.length}${needed === 0 ? ' — no extra charge' : ''}` : `남은 ${unfinished.length}장 이어서 만들기${needed === 0 ? ' (추가 차감 없음)' : ''}`)
                  : (isEn ? 'Make all 5 — uses 5 of your looks' : '보유 5장으로 5장 만들기')}
              </button>
            ) : (
              <button type="button" disabled={!selfie || paying} onClick={() => void buy()} className={`${btn} bg-primary text-navy`}>{paying ? '…' : (isEn ? 'Buy & make all 5 · $2.99' : '5장 구매하고 만들기 · $2.99')}</button>
            )}
            {free && <p className="text-center text-[11px] text-white/70">{isEn ? `You have ${credits} looks · free passes are for the 1-look tab` : `보유 ${credits}장 · 무료권은 1가지 탭에서 사용해요`}</p>}
            {!selfie && <p className="text-center text-[11px] text-white/60 break-keep">{isEn ? 'All 5 use the same selfie. Front-facing, even light works best.' : '5장 모두 같은 셀카로 만들어요. 정면·고른 조명이면 더 잘 나와요.'}</p>}
          </>
        )}
      </div>
      <p className="mt-4 text-[11px] text-white/60">{isEn ? 'One-time payment · no subscription · AI-generated images.' : '한 번 결제 · 구독 없음 · AI가 만든 이미지예요.'}</p>
      {viewer && singles && <LongPressSaveViewer images={singles} isEn={isEn} onClose={() => setViewer(false)} />}
    </div>
  )
}

function newJobId(): string {
  try { return crypto.randomUUID() } catch { /* secure context 아님 */ }
  return 'job-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}
