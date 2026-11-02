// 고객 갤러리 — 하트(1인 1개)·신고(1인 1회, 3건이면 공개 내림) (2026-11-02)
import { verifyUser } from './_freeUsage'
import { copyImage, isUuid, json, PENDING, PUBLIC, removeImage, rest, type GalleryEnv, type GalleryRow } from './_gallery'

export async function onRequestPost({ request, env }: { request: Request; env: GalleryEnv }) {
  const h = request.headers.get('Authorization') || ''
  if (!h.startsWith('Bearer ')) return json({ error: 'login_required' }, 401)
  const user = await verifyUser(env, h.slice(7))
  if (!user) return json({ error: 'invalid_token' }, 401)
  let body: { id?: string; action?: string }
  try { body = await request.json() } catch { return json({ error: 'bad_json' }, 400) }
  if (!isUuid(body.id)) return json({ error: 'bad_id' }, 400)
  try {
    if (body.action === 'heart') {
      const [r] = await rest<{ hearted: boolean; heart_count: number }[]>(env, 'rpc/gallery_toggle_heart', { method: 'POST', body: JSON.stringify({ p_post: body.id, p_user: user.id }) })
      return json({ hearted: r.hearted, hearts: r.heart_count })
    }
    if (body.action === 'report') {
      const [r] = await rest<{ hidden: boolean }[]>(env, 'rpc/gallery_report_post', { method: 'POST', body: JSON.stringify({ p_post: body.id, p_user: user.id }) })
      if (r?.hidden) {
        // 링크로도 볼 수 없게 비공개 버킷으로 되돌린다
        const [row] = await rest<GalleryRow[]>(env, `gallery_post?id=eq.${body.id}&select=image_bucket,image_path`)
        if (row?.image_bucket === PUBLIC) {
          await copyImage(env, PUBLIC, PENDING, row.image_path)
          await rest(env, `gallery_post?id=eq.${body.id}`, { method: 'PATCH', body: JSON.stringify({ image_bucket: PENDING }) })
          await removeImage(env, PUBLIC, row.image_path)
        }
      }
      return json({ ok: true })
    }
    return json({ error: 'bad_action' }, 400)
  } catch (e) {
    console.error('[gallery-action]', e)
    return json({ error: 'action_failed' }, 400)
  }
}
