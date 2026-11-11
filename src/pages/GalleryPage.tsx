// 고객 메이크업 갤러리 — /gallery/ · /en/gallery/ (2026-11-02)
// 운영자 결정: 별점 대신 하트(1인 1개). 승인된 AI 결과 이미지만 공개, 이름·이메일 없음.
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { trackEvent } from '../lib/analytics'
import { deleteMyPost, fetchGallery, galleryAction, lookLabel, lookTryHref, GALLERY_SOURCES, SOURCE_LABEL, type GalleryList, type GallerySource } from '../lib/gallery'

export default function GalleryPage() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const [data, setData] = useState<GalleryList | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [msg, setMsg] = useState<string | null>(null)
  // 2026-11-11 — 네 기능 탭 + 하트순(기본)/최신순
  const [source, setSource] = useState<GallerySource | 'all'>('all')
  const [sort, setSort] = useState<'hearts' | 'new'>('hearts')

  const opts = () => ({ sort, source: source === 'all' ? undefined : source })
  const load = () => fetchGallery(opts()).then((d) => {
    setData(d)
    setState(d ? 'ready' : 'error')
  })
  useEffect(() => {
    let off = false
    void fetchGallery({ sort, source: source === 'all' ? undefined : source }).then((d) => { if (off) return; setData(d); setState(d ? 'ready' : 'error') })
    return () => { off = true }
  }, [sort, source])

  const goLogin = () => { window.location.href = '/auth?next=' + encodeURIComponent(window.location.pathname) }

  const heart = async (id: string) => {
    const r = await galleryAction(id, 'heart')
    if (r === 'login') { goLogin(); return }
    if (!r || typeof r.hearted !== 'boolean') { setMsg(isEn ? 'Please try again.' : '다시 시도해 주세요.'); return }
    setData((d) => d && {
      ...d,
      hearted: r.hearted ? [...d.hearted, id] : d.hearted.filter((x) => x !== id),
      posts: d.posts.map((p) => (p.id === id ? { ...p, hearts: r.hearts ?? p.hearts } : p)),
    })
    if (r.hearted) trackEvent('gallery_heart', { id })
  }
  const report = async (id: string) => {
    if (!window.confirm(isEn ? 'Report this photo as inappropriate?' : '이 사진을 부적절한 사진으로 신고할까요?')) return
    const r = await galleryAction(id, 'report')
    if (r === 'login') { goLogin(); return }
    setMsg(r ? (isEn ? 'Thanks. We will review it.' : '신고가 접수됐어요. 검토할게요.') : (isEn ? 'Please try again.' : '다시 시도해 주세요.'))
  }
  const remove = async (id: string) => {
    if (!window.confirm(isEn ? 'Delete this photo from the gallery?' : '이 사진을 갤러리에서 삭제할까요?')) return
    if (await deleteMyPost(id)) { void load(); setMsg(isEn ? 'Deleted.' : '삭제했어요.') }
    else setMsg(isEn ? 'Could not delete. Please try again.' : '삭제하지 못했어요. 다시 시도해 주세요.')
  }

  const posts = data?.posts ?? []
  const mine = data?.mine ?? []
  const makeHref = isEn ? '/en/makeup/' : '/makeup/'
  return (
    <div className="font-display bg-background-light min-h-screen text-navy">
      <ToolsNav />
      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <section className="pt-10 md:pt-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-dark md:text-xs">{isEn ? 'Gallery' : 'Gallery · 갤러리'}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl break-keep">{isEn ? 'Looks made by our customers' : '고객이 만든 메이크업'}</h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 break-keep">{isEn ? 'Real customers’ selfies with AI makeup, shared by choice. Tap the heart on a look you like.' : '고객이 직접 공개한, 본인 셀카로 만든 AI 메이크업이에요. 마음에 드는 룩에 하트를 눌러 주세요.'}</p>
          <a href={makeHref} className="mt-5 inline-flex bg-navy px-5 py-3 text-sm font-bold text-white">{isEn ? 'Make my look' : '내 메이크업 만들기'}</a>
        </section>

        {msg && <p role="status" className="mt-6 bg-white px-3 py-2 text-[13px] font-bold">{msg}</p>}

        {mine.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-extrabold">{isEn ? 'My photos' : '내 사진'}</h2>
            <ul className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-6">
              {mine.map((p) => (
                <li key={p.id} className="bg-white">
                  {p.image && <img src={p.image} alt={lookLabel(p.source, p.lookId, isEn)} className="aspect-[3/4] w-full object-cover" />}
                  <p className="px-1.5 pt-1 text-[11px] font-bold">{p.status === 'approved' ? (isEn ? 'Public' : '공개 중') : (isEn ? 'In review' : '검토 중')}</p>
                  <button type="button" onClick={() => void remove(p.id)} className="px-1.5 pb-1.5 text-[11px] font-bold text-primary-dark underline underline-offset-2">{isEn ? 'Delete' : '삭제'}</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 text-[12px] font-bold" role="tablist">
              {(['all', ...GALLERY_SOURCES] as const).map((s) => (
                <button key={s} type="button" role="tab" aria-selected={source === s} onClick={() => { setSource(s); trackEvent('gallery_tab', { source: s }) }} className={`border px-2.5 py-1.5 ${source === s ? 'border-navy bg-navy text-white' : 'border-slate-300 bg-white'}`}>{s === 'all' ? (isEn ? 'All' : '전체') : isEn ? SOURCE_LABEL[s].en : SOURCE_LABEL[s].ko}</button>
              ))}
            </div>
            <div className="flex gap-1 text-[12px] font-bold">
              {(['hearts', 'new'] as const).map((o) => (
                <button key={o} type="button" aria-pressed={sort === o} onClick={() => setSort(o)} className={`px-2 py-1.5 ${sort === o ? 'text-primary-dark underline underline-offset-4' : 'text-slate-500'}`}>{o === 'hearts' ? (isEn ? 'Most hearts' : '하트순') : (isEn ? 'Newest' : '최신순')}</button>
              ))}
            </div>
          </div>
          <div className="mt-4" />
          {state === 'loading' && <p className="py-10 text-center text-sm text-slate-500">{isEn ? 'Loading…' : '불러오는 중…'}</p>}
          {state === 'error' && <p className="py-10 text-center text-sm text-slate-500">{isEn ? 'Could not load the gallery. Please refresh.' : '갤러리를 불러오지 못했어요. 새로고침해 주세요.'}</p>}
          {state === 'ready' && posts.length === 0 && (
            <div className="border border-slate-200 bg-white p-8 text-center">
              <p className="text-lg font-extrabold break-keep">{isEn ? 'Be the first to share your look' : '첫 번째 주인공이 되어 주세요'}</p>
              <p className="mt-2 text-sm text-slate-600 break-keep">{isEn ? 'Make a look, then tap “Post to the gallery” on your result.' : '메이크업을 만든 뒤 결과 화면에서 “갤러리에 올리기”를 눌러 주세요.'}</p>
            </div>
          )}
          {posts.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {posts.map((p) => {
                const on = data?.hearted.includes(p.id) ?? false
                const name = lookLabel(p.source, p.lookId, isEn)
                return (
                  <li key={p.id} className="flex flex-col bg-white">
                    <div className="relative">
                      <img src={p.image} alt={isEn ? `${name}, AI makeup on a customer's selfie` : `${name}, 고객 셀카로 만든 AI 메이크업`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                      <span className="absolute left-1.5 top-1.5 bg-navy px-1.5 py-0.5 text-[10px] font-extrabold text-white">{isEn ? SOURCE_LABEL[p.source].en : SOURCE_LABEL[p.source].ko}</span>
                      <span className="absolute right-1.5 top-1.5 bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">AI</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2">
                      <a href={lookTryHref(p.source, p.lookId, isEn)} onClick={() => trackEvent('gallery_try_look', { source: p.source, look: p.lookId })} className="min-w-0 truncate text-[13px] font-extrabold underline-offset-4 hover:underline">{name || (isEn ? 'Try this' : '따라 만들기')}</a>
                      <button type="button" aria-pressed={on} aria-label={isEn ? `Heart, ${p.hearts}` : `하트 ${p.hearts}개`} onClick={() => void heart(p.id)} className="flex min-h-[44px] shrink-0 items-center gap-1 px-1 text-[13px] font-bold">
                        <span className={`material-symbols-outlined text-[20px] ${on ? 'text-primary-dark' : ''}`} style={on ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
                        <span className="tabular-nums">{p.hearts}</span>
                      </button>
                    </div>
                    <button type="button" onClick={() => void report(p.id)} className="px-2 pb-2 text-left text-[11px] text-slate-500 underline underline-offset-2">{isEn ? 'Report' : '신고'}</button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
      <ToolsFooter />
    </div>
  )
}
