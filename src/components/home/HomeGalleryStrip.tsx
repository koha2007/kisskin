// 홈 갤러리 띠 (2026-11-02) — 승인된 사진이 HOME_MIN_POSTS 장 이상일 때만 보인다(그 전엔 아예 안 그린다)
import { useEffect, useState } from 'react'
import { fetchGallery, HOME_MIN_POSTS, lookLabel, type GalleryPost } from '../../lib/gallery'

export default function HomeGalleryStrip({ isEn }: { isEn: boolean }) {
  const [posts, setPosts] = useState<GalleryPost[]>([])
  useEffect(() => {
    let off = false
    void fetchGallery().then((d) => { if (!off && d) setPosts(d.posts) })
    return () => { off = true }
  }, [])
  if (posts.length < HOME_MIN_POSTS) return null
  const href = isEn ? '/en/gallery/' : '/gallery/'
  return (
    <section aria-label={isEn ? 'Customer gallery' : '고객 갤러리'} className="mx-auto max-w-[1120px] px-5 py-6 text-navy md:px-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-[22px] font-extrabold tracking-[-0.03em] md:text-[32px] break-keep">{isEn ? 'Looks made by our customers' : '고객이 만든 메이크업'}</h2>
        <a href={href} className="shrink-0 text-[13px] font-extrabold underline underline-offset-4">{isEn ? 'See all →' : '전체 보기 →'}</a>
      </div>
      <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-2">
        {posts.slice(0, 12).map((p) => (
          <li key={p.id} className="w-32 shrink-0 md:w-44">
            <a href={href} className="relative block">
              <img src={p.image} alt={isEn ? `${lookLabel(p.source, p.lookId, true)}, AI makeup on a customer's selfie` : `${lookLabel(p.source, p.lookId, false)}, 고객 셀카로 만든 AI 메이크업`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
              <span className="absolute left-1 top-1 bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">AI</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
