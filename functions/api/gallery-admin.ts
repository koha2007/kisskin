// 고객 갤러리 승인 — GET 대기 목록 · POST 승인/거절 (2026-11-02). GALLERY_ADMIN_EMAILS 에 있는 계정만.
import { verifyUser } from './_freeUsage'
import { copyImage, imageUrlOf, isGalleryAdmin, isUuid, json, PENDING, PUBLIC, removeImage, rest, type GalleryEnv, type GalleryRow } from './_gallery'

async function guard(request: Request, env: GalleryEnv): Promise<Response | null> {
  const h = request.headers.get('Authorization') || ''
  if (!h.startsWith('Bearer ')) return json({ error: 'login_required' }, 401)
  const user = await verifyUser(env, h.slice(7))
  if (!user) return json({ error: 'invalid_token' }, 401)
  if (!isGalleryAdmin(env, user.email)) return json({ error: 'forbidden' }, 403)
  return null
}

export async function onRequestGet({ request, env }: { request: Request; env: GalleryEnv }) {
  const denied = await guard(request, env)
  if (denied) return denied
  if (new URL(request.url).searchParams.get('stats') === '1') return stats(env)
  try {
    const rows = await rest<GalleryRow[]>(env, 'gallery_post?status=eq.pending&select=id,source,look_id,image_bucket,image_path,report_count,created_at&order=created_at.asc&limit=50')
    const posts = await Promise.all(rows.map(async (r) => ({ id: r.id, source: r.source, lookId: r.look_id, reports: r.report_count, createdAt: r.created_at, image: await imageUrlOf(env, r) })))
    return json({ posts })
  } catch (e) {
    console.error('[gallery-admin] list', e)
    return json({ error: 'list_failed' }, 500)
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: GalleryEnv }) {
  const denied = await guard(request, env)
  if (denied) return denied
  let body: { id?: string; action?: string }
  try { body = await request.json() } catch { return json({ error: 'bad_json' }, 400) }
  if (!isUuid(body.id)) return json({ error: 'bad_id' }, 400)
  try {
    const [row] = await rest<GalleryRow[]>(env, `gallery_post?id=eq.${body.id}&status=eq.pending&select=id,image_bucket,image_path`)
    if (!row) return json({ error: 'not_found' }, 404)
    if (body.action === 'approve') {
      if (row.image_bucket === PENDING) await copyImage(env, PENDING, PUBLIC, row.image_path)
      // 신고로 내려왔다가 다시 승인하면 신고 수를 비운다(다음 신고 1건에 바로 내려가지 않게 기록도 지운다)
      await rest(env, `gallery_report?post_id=eq.${row.id}`, { method: 'DELETE' })
      await rest(env, `gallery_post?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved', image_bucket: PUBLIC, report_count: 0, reviewed_at: new Date().toISOString() }) })
      if (row.image_bucket === PENDING) await removeImage(env, PENDING, row.image_path)
      return json({ ok: true })
    }
    if (body.action === 'reject') {
      // 거절한 사진은 보관하지 않는다
      await removeImage(env, row.image_bucket, row.image_path)
      await rest(env, `gallery_post?id=eq.${row.id}`, { method: 'DELETE' })
      return json({ ok: true })
    }
    return json({ error: 'bad_action' }, 400)
  } catch (e) {
    console.error('[gallery-admin] action', e)
    return json({ error: 'action_failed' }, 500)
  }
}

// ── 주간 참가 집계(2026-11-11 운영자: "선물은 나중, 얼마나 참가하는지 데이터부터") ──
// 주 = 월요일 시작(UTC). 올린 수·승인 수·올린 사람 수·하트 수·하트 누른 사람 수를 기능별로.
const weekOf = (iso: string) => {
  const d = new Date(iso); const day = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - day); return d.toISOString().slice(0, 10)
}
async function stats(env: GalleryEnv): Promise<Response> {
  try {
    const posts = await rest<{ id: string; source: string; status: string; user_id: string; created_at: string; heart_count: number }[]>(env, 'gallery_post?select=id,source,status,user_id,created_at,heart_count&order=created_at.desc&limit=5000')
    const hearts = await rest<{ post_id: string; user_id: string; created_at: string }[]>(env, 'gallery_heart?select=post_id,user_id,created_at&order=created_at.desc&limit=20000')
    const srcOf = new Map(posts.map((p) => [p.id, p.source]))
    type Row = { week: string; source: string; posts: number; approved: number; uploaders: Set<string>; hearts: number; hearters: Set<string> }
    const rows = new Map<string, Row>()
    const get = (week: string, source: string) => {
      const k = `${week}|${source}`
      if (!rows.has(k)) rows.set(k, { week, source, posts: 0, approved: 0, uploaders: new Set(), hearts: 0, hearters: new Set() })
      return rows.get(k)!
    }
    for (const p of posts) { const r = get(weekOf(p.created_at), p.source); r.posts++; if (p.status === 'approved') r.approved++; r.uploaders.add(p.user_id) }
    for (const h of hearts) { const r = get(weekOf(h.created_at), srcOf.get(h.post_id) ?? 'unknown'); r.hearts++; r.hearters.add(h.user_id) }
    const out = [...rows.values()].map((r) => ({ week: r.week, source: r.source, posts: r.posts, approved: r.approved, uploaders: r.uploaders.size, hearts: r.hearts, hearters: r.hearters.size }))
      .sort((a, b) => (a.week === b.week ? a.source.localeCompare(b.source) : b.week.localeCompare(a.week)))
    const top = [...posts].filter((p) => p.status === 'approved').sort((a, b) => b.heart_count - a.heart_count).slice(0, 10).map((p) => ({ id: p.id, source: p.source, hearts: p.heart_count }))
    return json({ weeks: out, totals: { posts: posts.length, approved: posts.filter((p) => p.status === 'approved').length, uploaders: new Set(posts.map((p) => p.user_id)).size, hearts: hearts.length, hearters: new Set(hearts.map((h) => h.user_id)).size }, top })
  } catch (e) {
    console.error('[gallery-admin] stats', e)
    return json({ error: 'stats_failed' }, 500)
  }
}
