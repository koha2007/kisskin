// 결과 이미지를 갤러리에 올리기 — 공개 동의 + 성인 본인 확인 → 운영자 승인 후 공개 (2026-11-02)
// 두 체크는 기본 해제. 문구를 바꾸면 functions/api/gallery.ts CONSENT 도 같이 바꿀 것(동의 증빙).
import { useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import { submitToGallery, type GallerySource, type SubmitResult } from '../../lib/gallery'

function GalleryDialog({ image, name, source, lookId, isEn, onClose }: { image: string; name: string; source: GallerySource; lookId: string; isEn: boolean; onClose: () => void }) {
  const [agree, setAgree] = useState(false)
  const [adult, setAdult] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | SubmitResult>('idle')
  const send = async () => {
    setState('sending')
    const r = await submitToGallery({ image, source, lookId, locale: isEn ? 'en' : 'ko' })
    setState(r)
    if (r === 'ok') trackEvent('gallery_submit', { source, look: lookId })
  }
  return (
    <div role="dialog" aria-modal="true" aria-label={isEn ? 'Post to the gallery' : '갤러리에 올리기'} className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-navy/70 p-4 text-left text-navy">
      <div className="w-full max-w-sm bg-white p-5">
        <h2 className="text-lg font-extrabold">{isEn ? 'Post to the gallery' : '갤러리에 올리기'}</h2>
        {state === 'ok' ? (
          <>
            <p className="mt-3 text-sm leading-relaxed break-keep">{isEn ? 'Thanks! It will appear after we review it. You can delete it any time in the gallery.' : '고마워요! 운영자 검토 후 공개돼요. 갤러리의 내 사진에서 언제든 삭제할 수 있어요.'}</p>
            <a href={isEn ? '/en/gallery/' : '/gallery/'} className="mt-4 block bg-navy py-3 text-center text-sm font-bold text-white">{isEn ? 'Go to the gallery' : '갤러리 보기'}</a>
            <button type="button" onClick={onClose} className="mt-2 w-full py-2 text-sm font-bold underline underline-offset-4">{isEn ? 'Close' : '닫기'}</button>
          </>
        ) : (
          <>
            <div className="mt-3 flex items-center gap-3">
              <img src={image} alt="" className="h-20 w-16 shrink-0 object-cover" />
              <p className="min-w-0 text-[13px] font-bold break-keep">{name}</p>
            </div>
            <label className="mt-4 flex gap-2 text-[13px] leading-snug break-keep">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{isEn ? '(Required) I agree to show this image in the kissinskin gallery, including the home page.' : '(필수) 이 이미지를 키스인스킨 갤러리(메인 페이지 포함)에 공개하는 데 동의해요.'}</span>
            </label>
            <label className="mt-2.5 flex gap-2 text-[13px] leading-snug break-keep">
              <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{isEn ? '(Required) I am 18 or older, and the person in the photo is me.' : '(필수) 만 18세 이상이고, 사진 속 사람은 저 본인이에요.'}</span>
            </label>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500 break-keep">{isEn ? 'Only this AI image is posted, never your original selfie. Your name and email are not shown. Publicly shown images can be seen or saved by others.' : '이 AI 결과 이미지만 올라가고 원본 셀카는 올라가지 않아요. 이름·이메일은 표시되지 않아요. 공개된 사진은 다른 사람이 보거나 저장할 수 있어요.'} <a href={isEn ? '/en/privacy/' : '/privacy/'} target="_blank" rel="noreferrer" className="underline">{isEn ? 'Privacy Policy' : '개인정보처리방침'}</a></p>
            {state === 'limit' && <p className="mt-2 text-xs font-bold text-primary-dark break-keep">{isEn ? 'You have too many photos waiting for review. Please try again after they are reviewed.' : '검토를 기다리는 사진이 많아요. 검토가 끝난 뒤 다시 올려 주세요.'}</p>}
            {state === 'login' && <p className="mt-2 text-xs font-bold text-primary-dark">{isEn ? 'Please log in and try again.' : '로그인한 뒤 다시 시도해 주세요.'}</p>}
            {state === 'error' && <p className="mt-2 text-xs font-bold text-primary-dark">{isEn ? 'Could not post. Please try again.' : '올리지 못했어요. 다시 시도해 주세요.'}</p>}
            <button type="button" disabled={!agree || !adult || state === 'sending'} onClick={() => void send()} className="mt-4 w-full bg-navy py-3 text-sm font-bold text-white disabled:opacity-40">{state === 'sending' ? (isEn ? 'Posting…' : '올리는 중…') : (isEn ? 'Post for review' : '검토 요청하고 올리기')}</button>
            <button type="button" onClick={onClose} className="mt-1 w-full py-2 text-sm font-bold underline underline-offset-4">{isEn ? 'Cancel' : '취소'}</button>
          </>
        )}
      </div>
    </div>
  )
}

/** 결과 1장 화면 */
export function GalleryShareButton({ image, name, source, lookId, isEn, className }: { image: string; name: string; source: GallerySource; lookId: string; isEn: boolean; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => { setOpen(true); trackEvent('gallery_open', { source, look: lookId }) }} className={className ?? 'flex w-full items-center justify-center gap-1.5 border border-white/40 py-3 text-sm font-bold'}>
        <span className="material-symbols-outlined text-base">photo_library</span>{isEn ? 'Post to the gallery' : '갤러리에 올리기'}
      </button>
      {open && <GalleryDialog image={image} name={name} source={source} lookId={lookId} isEn={isEn} onClose={() => setOpen(false)} />}
    </>
  )
}

/** 5장·9장 결과 화면 — 올릴 사진을 골라서 */
export function GalleryShareList({ items, source, isEn, dark }: { items: { id: string; name: string; image: string }[]; source: GallerySource; isEn: boolean; dark?: boolean }) {
  const [cur, setCur] = useState<{ id: string; name: string; image: string } | null>(null)
  return (
    <div className="pt-2">
      <p className={`text-xs font-bold ${dark ? 'text-white/80' : 'text-slate-600'}`}>{isEn ? 'Post one to the gallery (tap a photo)' : '갤러리에 올릴 사진을 눌러 고르세요'}</p>
      <ul className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
        {items.map((l) => (
          <li key={l.id} className="w-12 shrink-0">
            <button type="button" aria-label={(isEn ? 'Post to the gallery: ' : '갤러리에 올리기: ') + l.name} onClick={() => { setCur(l); trackEvent('gallery_open', { source, look: l.id }) }} className="block w-full">
              <img src={l.image} alt="" className="aspect-[3/4] w-full object-cover object-[50%_26%]" />
            </button>
          </li>
        ))}
      </ul>
      {cur && <GalleryDialog image={cur.image} name={cur.name} source={source} lookId={cur.id} isEn={isEn} onClose={() => setCur(null)} />}
    </div>
  )
}
