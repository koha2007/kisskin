// 갤러리 승인 화면 — /gallery/admin/ (2026-11-02). 권한은 서버가 GALLERY_ADMIN_EMAILS 로 판단한다.
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { lookLabel, SOURCE_LABEL, type GallerySource } from '../lib/gallery'

interface WeekRow { week: string; source: string; posts: number; approved: number; uploaders: number; hearts: number; hearters: number }
interface Stats { weeks: WeekRow[]; totals: { posts: number; approved: number; uploaders: number; hearts: number; hearters: number } }

interface Pending { id: string; source: GallerySource; lookId: string; reports: number; createdAt: string; image: string | null }

async function call(init?: RequestInit, q = ''): Promise<Response | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  return fetch('/api/gallery-admin' + q, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` } })
}

export default function GalleryAdmin() {
  const [posts, setPosts] = useState<Pending[] | null>(null)
  const [msg, setMsg] = useState('불러오는 중…')
  const [busy, setBusy] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    let off = false
    void (async () => {
      const res = await call().catch(() => null)
      if (off) return
      if (!res) { window.location.href = '/auth?next=' + encodeURIComponent('/gallery/admin/'); return }
      if (res.status === 403) { setMsg('승인 권한이 없는 계정이에요.'); return }
      if (!res.ok) { setMsg('목록을 불러오지 못했어요.'); return }
      const d = (await res.json()) as { posts: Pending[] }
      if (!off) { setPosts(d.posts); setMsg('') }
      const sr = await call(undefined, '?stats=1').catch(() => null)
      if (!off && sr?.ok) setStats((await sr.json()) as Stats)
    })()
    return () => { off = true }
  }, [])

  const act = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !window.confirm('거절하면 사진이 삭제돼요. 계속할까요?')) return
    setBusy(id)
    const res = await call({ method: 'POST', body: JSON.stringify({ id, action }) }).catch(() => null)
    setBusy(null)
    if (res?.ok) setPosts((p) => p?.filter((x) => x.id !== id) ?? null)
    else setMsg('처리하지 못했어요. 다시 시도해 주세요.')
  }

  return (
    <main className="font-display mx-auto min-h-screen max-w-3xl bg-background-light px-4 py-8 text-navy">
      <h1 className="text-2xl font-extrabold">갤러리 승인</h1>
      <p className="mt-1 text-sm text-slate-600 break-keep">얼굴 사진이 본인 것으로 보이는지, 부적절하지 않은지, 미성년자로 보이지 않는지 확인해 주세요.</p>
      {stats && (
        <section className="mt-5 bg-white p-4">
          <h2 className="text-base font-extrabold">참가 집계(주 = 월요일 시작)</h2>
          <p className="mt-1 text-xs text-slate-600">전체 올림 {stats.totals.posts} · 공개 {stats.totals.approved} · 올린 사람 {stats.totals.uploaders} · 하트 {stats.totals.hearts} · 하트 누른 사람 {stats.totals.hearters}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums">
              <thead><tr className="border-b border-slate-200 text-slate-500"><th className="py-1.5 pr-2">주</th><th className="pr-2">기능</th><th className="pr-2">올림</th><th className="pr-2">공개</th><th className="pr-2">올린 사람</th><th className="pr-2">하트</th><th>누른 사람</th></tr></thead>
              <tbody>{stats.weeks.map((w) => (
                <tr key={w.week + w.source} className="border-b border-slate-100"><td className="py-1.5 pr-2">{w.week}</td><td className="pr-2">{SOURCE_LABEL[w.source as GallerySource]?.ko ?? w.source}</td><td className="pr-2">{w.posts}</td><td className="pr-2">{w.approved}</td><td className="pr-2">{w.uploaders}</td><td className="pr-2">{w.hearts}</td><td>{w.hearters}</td></tr>
              ))}</tbody>
            </table>
            {stats.weeks.length === 0 && <p className="py-3 text-xs text-slate-500">아직 올라온 사진이 없어요.</p>}
          </div>
        </section>
      )}
      {msg && <p role="status" className="mt-4 text-sm font-bold">{msg}</p>}
      {posts?.length === 0 && <p className="mt-6 text-sm">대기 중인 사진이 없어요.</p>}
      <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        {posts?.map((p) => (
          <li key={p.id} className="bg-white p-2">
            {p.image && <img src={p.image} alt="" className="aspect-[3/4] w-full object-cover" />}
            <p className="mt-1 text-xs font-bold">{lookLabel(p.source, p.lookId, false) || p.lookId}{p.reports > 0 && <span className="text-primary-dark"> · 신고 {p.reports}건</span>}</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button type="button" disabled={busy === p.id} onClick={() => void act(p.id, 'approve')} className="bg-navy py-2 text-xs font-bold text-white disabled:opacity-50">승인</button>
              <button type="button" disabled={busy === p.id} onClick={() => void act(p.id, 'reject')} className="border border-navy py-2 text-xs font-bold disabled:opacity-50">거절</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
