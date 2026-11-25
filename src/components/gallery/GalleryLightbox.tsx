// 하트 갤러리 사진 크게 보기 (2026-11-17)
// 운영자: "하트 받으려고 올린 사진이니 누르면 확대 — 요즘 유행하는 방식으로".
// 인스타·핀터레스트식: 어두운 전체 화면 · 좌우 넘기기(스와이프·화살표 키) · 아래로 끌어 닫기 ·
// 사진 두 번 탭 = 하트(큰 하트가 톡) · 휴대폰 뒤로 가기 = 닫기. 이미지 추가 요청 없음(목록 사진 그대로).
import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import { lookLabel, lookTryHref, type GalleryPost } from '../../lib/gallery'

interface Props {
  posts: GalleryPost[]
  index: number
  hearted: string[]
  isEn: boolean
  onIndex: (i: number) => void
  onClose: () => void
  onHeart: (id: string) => void
  /** 아래 작은 링크(예: 홈에서 열면 "전체 보기") */
  footerLink?: { href: string; label: string }
}

export default function GalleryLightbox({ posts, index, hearted, isEn, onIndex, onClose, onHeart, footerLink }: Props) {
  const p = posts[index]
  const [shown, setShown] = useState(false)
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [pop, setPop] = useState(0)
  const start = useRef<{ x: number; y: number; t: number } | null>(null)
  const lastTap = useRef(0)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  const go = (d: number) => {
    const n = index + d
    if (n >= 0 && n < posts.length) onIndex(n)
  }

  // 열림 애니메이션 · 스크롤 잠금 · 뒤로 가기 = 닫기
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true))
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // vike 상태를 복사하지 않는다 — vike 가 pushState 를 감싸 triggeredBy:'user' 를 붙여야 뒤로 가기 때 페이지를
    // 다시 그리지 않는다(복사하면 'browser' 로 남아 페이지 재렌더 → 닫기가 안 먹었다). 이미 올려 둔 기록이면 또 올리지 않는다.
    if (!(window.history.state as { galleryLightbox?: boolean } | null)?.galleryLightbox) window.history.pushState({ galleryLightbox: true }, '')
    const onPop = () => { if (!(window.history.state as { galleryLightbox?: boolean } | null)?.galleryLightbox) closeRef.current() }
    window.addEventListener('popstate', onPop)
    return () => {
      cancelAnimationFrame(r)
      document.body.style.overflow = prev
      window.removeEventListener('popstate', onPop)
    }
  }, [])
  // 닫기 버튼·배경·Esc 는 기록을 한 칸 되돌려 닫는다(popstate 가 onClose 를 부른다)
  const close = () => {
    if ((window.history.state as { galleryLightbox?: boolean } | null)?.galleryLightbox) window.history.back()
    else onClose()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => { if (p) trackEvent('gallery_view_photo', { source: p.source, look: p.lookId }) }, [p?.id])
  // 다음·이전 사진 미리 받기 — 넘길 때 빈 화면이 안 보이게
  useEffect(() => {
    for (const d of [1, -1]) { const q = posts[index + d]; if (q) { const im = new Image(); im.src = q.image } }
  }, [index, posts])

  if (!p) return null
  const on = hearted.includes(p.id)
  const name = lookLabel(p.source, p.lookId, isEn)

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    start.current = { x: t.clientX, y: t.clientY, t: Date.now() }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!start.current) return
    const t = e.touches[0]
    const dx = t.clientX - start.current.x
    const dy = t.clientY - start.current.y
    // 처음 움직인 방향으로 고정 — 가로면 넘기기, 아래로면 닫기
    setDrag(Math.abs(dx) > Math.abs(dy) ? { x: dx, y: 0 } : { x: 0, y: Math.max(0, dy) })
  }
  const onTouchEnd = () => {
    const { x, y } = drag
    start.current = null
    setDrag({ x: 0, y: 0 })
    if (y > 110) { close(); return }
    if (x < -60) go(1)
    else if (x > 60) go(-1)
  }
  // 두 번 탭 = 하트(이미 눌렀으면 큰 하트만 보여 주고 취소하지 않는다 — 인스타와 같음)
  const onImageTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      if (!on) onHeart(p.id)
      setPop((n) => n + 1)
      trackEvent('gallery_double_tap', { id: p.id })
      lastTap.current = 0
    } else lastTap.current = now
  }

  const dim = drag.y ? Math.max(0.35, 1 - drag.y / 400) : 1

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEn ? `${name} photo` : `${name} 사진`}
      className="fixed inset-0 z-[105] flex flex-col text-white transition-opacity duration-200"
      style={{ background: `rgba(6,7,30,${0.94 * dim})`, opacity: shown ? 1 : 0, backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      {/* 위: 몇 번째 · 닫기 */}
      <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))]">
        <span className="text-[13px] font-bold tabular-nums text-white/70">{index + 1} / {posts.length}</span>
        <button type="button" onClick={close} aria-label={isEn ? 'Close' : '닫기'} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
      </div>

      {/* 가운데: 사진 */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-3"
        onClick={(e) => { if (e.target === e.currentTarget) close() }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {index > 0 && (
          <button type="button" onClick={() => go(-1)} aria-label={isEn ? 'Previous' : '이전 사진'} className="absolute left-3 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 md:flex">
            <span className="material-symbols-outlined text-[28px]">chevron_left</span>
          </button>
        )}
        <img
          key={p.id}
          src={p.image}
          alt={p.sample ? (isEn ? `${name}, sample on an AI-generated model` : `${name}, AI 생성 모델 예시`) : isEn ? `${name}, AI result` : `${name}, AI 결과`}
          onClick={onImageTap}
          draggable={false}
          className="max-h-full max-w-full select-none rounded-xl object-contain shadow-2xl"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) scale(${shown ? (drag.y ? 1 - drag.y / 1600 : 1) : 0.92})`,
            transition: start.current ? 'none' : 'transform 220ms cubic-bezier(.2,.8,.2,1)',
            maxHeight: 'calc(100dvh - 170px)',
          }}
        />
        {pop > 0 && (
          <span key={pop} aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-[120px] text-primary drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1", animation: 'kis-heart-pop 700ms ease-out forwards' }}>favorite</span>
          </span>
        )}
        {index < posts.length - 1 && (
          <button type="button" onClick={() => go(1)} aria-label={isEn ? 'Next' : '다음 사진'} className="absolute right-3 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 md:flex">
            <span className="material-symbols-outlined text-[28px]">chevron_right</span>
          </button>
        )}
      </div>

      {/* 아래: 이름(따라 만들기) · 하트 */}
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
        <div className="min-w-0">
          <a href={lookTryHref(p.source, p.lookId, isEn)} onClick={() => trackEvent('gallery_try_look', { source: p.source, look: p.lookId, from: 'lightbox' })} className="block truncate text-[16px] font-extrabold underline-offset-4 hover:underline">{name}</a>
          <span className="block text-[12px] text-white/60">{isEn ? 'AI-generated · Make this look on my face →' : 'AI 생성 · 이 룩 내 얼굴로 만들기 →'}</span>
          {footerLink && <a href={footerLink.href} className="mt-1 block text-[12px] font-bold text-white/70 underline underline-offset-2">{footerLink.label}</a>}
        </div>
        <button
          type="button"
          aria-pressed={on}
          aria-label={isEn ? `Heart, ${p.hearts}` : `하트 ${p.hearts}개`}
          onClick={() => { if (!on) setPop((n) => n + 1); onHeart(p.id) }}
          className={`flex min-h-[52px] shrink-0 items-center gap-1.5 rounded-full px-5 text-[16px] font-extrabold transition ${on ? 'bg-primary text-navy' : 'bg-white/12 hover:bg-white/20'}`}
          style={on ? undefined : { background: 'rgba(255,255,255,0.12)' }}
        >
          <span className="material-symbols-outlined text-[24px]" style={on ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
          <span className="tabular-nums">{p.hearts}</span>
        </button>
      </div>
      <style>{'@keyframes kis-heart-pop{0%{transform:scale(.3);opacity:0}25%{transform:scale(1.15);opacity:1}55%{transform:scale(.95);opacity:1}100%{transform:scale(1.1);opacity:0}}'}</style>
    </div>
  )
}
