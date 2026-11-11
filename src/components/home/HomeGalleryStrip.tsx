// 홈 "오늘의 하트 룩" (2026-11-02 → 11-11 네 문 바로 아래로)
// 운영자 11/11: "메이크업 밑에 사용자 결과 이미지 올리고 하트 많이 받은 사람 기프트 — 기프트는 아직, 참가 데이터부터."
// 하트순 · 기능 탭(전체/9가지/럭키/페인팅/헤어). 승인 사진이 HOME_MIN_POSTS 장 미만이면 사진 띠 대신
// 참여 안내 한 줄(빈 띠로 메인이 비어 보이지 않게). 선물·순위 문구는 아직 넣지 않는다.
import { useEffect, useState } from 'react'
import { trackEvent } from '../../lib/analytics'
import { fetchGallery, GALLERY_SOURCES, HOME_MIN_POSTS, lookLabel, SOURCE_LABEL, type GalleryPost, type GallerySource } from '../../lib/gallery'

export default function HomeGalleryStrip({ isEn }: { isEn: boolean }) {
  const [all, setAll] = useState<GalleryPost[] | null>(null)
  const [tab, setTab] = useState<GallerySource | 'all'>('all')
  useEffect(() => {
    let off = false
    void fetchGallery({ sort: 'hearts' }).then((d) => { if (!off) setAll(d?.posts ?? []) })
    return () => { off = true }
  }, [])
  const href = isEn ? '/en/gallery/' : '/gallery/'
  if (all === null) return null
  if (all.length < HOME_MIN_POSTS) {
    return (
      <section aria-label={isEn ? 'Customer gallery' : '고객 갤러리'} className="mx-auto max-w-[1120px] px-5 pb-6 text-navy md:px-4">
        <a href={href} onClick={() => trackEvent('select_promotion', { creative_slot: 'home_gallery_invite' })} className="flex items-center justify-between gap-3 border-2 border-navy px-4 py-3 md:px-6">
          <span className="min-w-0">
            <strong className="block text-[15px] font-extrabold md:text-lg break-keep">{isEn ? 'Share your look, collect hearts' : '내 결과를 올리고 하트를 받아 보세요'}</strong>
            <span className="block text-[12px] md:text-[13px] break-keep">{isEn ? 'Tap “Post to the gallery” on any result — 9 looks, lucky, face paint or hair.' : '결과 화면의 "갤러리에 올리기" — 9가지·럭키·페인팅·헤어 모두 돼요'}</span>
          </span>
          <span className="shrink-0 text-[13px] font-extrabold underline underline-offset-4">{isEn ? 'Gallery →' : '갤러리 →'}</span>
        </a>
      </section>
    )
  }
  const posts = tab === 'all' ? all : all.filter((p) => p.source === tab)
  return (
    <section aria-label={isEn ? 'Customer gallery' : '고객 갤러리'} className="mx-auto max-w-[1120px] px-5 pb-8 text-navy md:px-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-[22px] font-extrabold tracking-[-0.03em] md:text-[32px] break-keep">{isEn ? 'Most-hearted looks' : '오늘의 하트 룩'}</h2>
        <a href={href} className="shrink-0 text-[13px] font-extrabold underline underline-offset-4">{isEn ? 'See all →' : '전체 보기 →'}</a>
      </div>
      <div className="mt-2 flex gap-1.5 overflow-x-auto text-[12px] font-bold" role="tablist">
        {(['all', ...GALLERY_SOURCES] as const).map((s) => (
          <button key={s} type="button" role="tab" aria-selected={tab === s} onClick={() => setTab(s)} className={`shrink-0 border px-2.5 py-1.5 ${tab === s ? 'border-navy bg-navy text-white' : 'border-slate-300'}`}>{s === 'all' ? (isEn ? 'All' : '전체') : isEn ? SOURCE_LABEL[s].en : SOURCE_LABEL[s].ko}</button>
        ))}
      </div>
      <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-2">
        {posts.slice(0, 12).map((p) => (
          <li key={p.id} className="w-32 shrink-0 md:w-44">
            <a href={href} onClick={() => trackEvent('select_promotion', { creative_slot: 'home_gallery', promotion_id: p.source })} className="relative block">
              <img src={p.image} alt={isEn ? `${lookLabel(p.source, p.lookId, true)}, AI result on a customer's selfie` : `${lookLabel(p.source, p.lookId, false)}, 고객 셀카로 만든 AI 결과`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
              <span className="absolute left-1 top-1 bg-navy px-1.5 py-0.5 text-[10px] font-extrabold text-white">{isEn ? SOURCE_LABEL[p.source].en : SOURCE_LABEL[p.source].ko}</span>
              <span className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-white/90 px-1.5 py-0.5 text-[11px] font-extrabold"><span className="material-symbols-outlined text-[13px] text-primary-dark" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>{p.hearts}</span>
            </a>
          </li>
        ))}
        {posts.length === 0 && <li className="py-6 text-sm text-slate-500">{isEn ? 'No photos here yet.' : '아직 올라온 사진이 없어요.'}</li>}
      </ul>
    </section>
  )
}
