// 고객 갤러리 — GET 공개 목록(+로그인 시 내 사진·하트) · POST 올리기 · DELETE 내 사진 삭제 (2026-11-02)
import { verifyUser } from './_freeUsage'
import { imageUrlOf, isUuid, json, PENDING, publicUrl, removeImage, rest, uploadImage, type GalleryEnv, type GalleryRow } from './_gallery'

const LIST_LIMIT = 60
// 2026-11-11 네 기능 — 9가지·럭키·페이스 페인팅·헤어 컬러
const SOURCES = ['makeup', 'lucky', 'paint', 'hair']
const MAX_BYTES = 2 * 1024 * 1024
const MAX_PENDING = 3
const MAX_TOTAL = 20
// 동의 증빙은 서버가 정한 문구로 남긴다(클라이언트가 보낸 글을 믿지 않는다). 화면 문구를 바꾸면 여기도 바꿀 것.
const CONSENT = {
  ko: 'v1: 이 이미지를 키스인스킨 갤러리(메인 페이지 포함)에 공개하는 데 동의 / 만 18세 이상이고 사진 속 사람은 본인',
  en: 'v1: Agreed to show this image in the kissinskin gallery (including the home page) / 18 or older and the person in the photo is me',
}
// 2026-11-11 사진첩에서 직접 올리기 — "키스인스킨에서 만든 결과 이미지" 확인이 하나 더 붙는다
const CONSENT_UPLOAD = {
  ko: 'v1-upload: 사진첩에서 직접 올림 / 키스인스킨에서 만든 결과 이미지 / ' + CONSENT.ko.slice(4),
  en: 'v1-upload: Uploaded from device / an image I made with kissinskin / ' + CONSENT.en.slice(4),
}

const bearer = (request: Request) => {
  const h = request.headers.get('Authorization') || ''
  return h.startsWith('Bearer ') ? h.slice(7) : null
}

export async function onRequestGet({ request, env }: { request: Request; env: GalleryEnv }) {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'not_configured' }, 503)
  try {
    const url = new URL(request.url)
    const order = url.searchParams.get('sort') === 'hearts' ? 'heart_count.desc,created_at.desc' : 'created_at.desc'
    const src = url.searchParams.get('source')
    const only = src && SOURCES.includes(src) ? `&source=eq.${src}` : ''
    const rows = await rest<GalleryRow[]>(env, `gallery_post?status=eq.approved&image_bucket=eq.gallery${only}&select=id,source,look_id,image_path,heart_count,created_at&order=${order}&limit=${LIST_LIMIT}`)
    const posts = rows.map((r) => ({ id: r.id, source: r.source, lookId: r.look_id, image: publicUrl(env, r.image_path), hearts: r.heart_count }))

    const token = bearer(request)
    const user = token ? await verifyUser(env, token) : null
    if (!user) return json({ posts, hearted: [], mine: [] })
    const ids = posts.map((p) => p.id)
    const hearted = ids.length
      ? (await rest<{ post_id: string }[]>(env, `gallery_heart?user_id=eq.${user.id}&post_id=in.(${ids.join(',')})&select=post_id`)).map((h) => h.post_id)
      : []
    const own = await rest<GalleryRow[]>(env, `gallery_post?user_id=eq.${user.id}&select=id,source,look_id,image_bucket,image_path,status,heart_count&order=created_at.desc`)
    const mine = await Promise.all(own.map(async (r) => ({ id: r.id, source: r.source, lookId: r.look_id, status: r.status, hearts: r.heart_count, image: await imageUrlOf(env, r) })))
    return json({ posts, hearted, mine })
  } catch (e) {
    console.error('[gallery] list', e)
    return json({ error: 'list_failed' }, 500)
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: GalleryEnv }) {
  const token = bearer(request)
  if (!token) return json({ error: 'login_required' }, 401)
  const user = await verifyUser(env, token)
  if (!user) return json({ error: 'invalid_token' }, 401)

  let body: { image?: string; source?: string; lookId?: string; consent?: boolean; adultSelf?: boolean; locale?: string; origin?: string }
  try { body = await request.json() } catch { return json({ error: 'bad_json' }, 400) }
  if (body.consent !== true || body.adultSelf !== true) return json({ error: 'consent_required' }, 400)
  if (!SOURCES.includes(body.source as string)) return json({ error: 'bad_source' }, 400)
  if (!body.lookId || !/^[a-z0-9-]{1,40}$/.test(body.lookId)) return json({ error: 'bad_look' }, 400)
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(body.image || '')
  if (!m || (m[1].length * 3) / 4 > MAX_BYTES) return json({ error: 'bad_image' }, 400)
  const bin = atob(m[1])
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return json({ error: 'bad_image' }, 400)

  try {
    const own = await rest<{ status: string }[]>(env, `gallery_post?user_id=eq.${user.id}&select=status`)
    if (own.length >= MAX_TOTAL || own.filter((r) => r.status === 'pending').length >= MAX_PENDING) return json({ error: 'limit' }, 429)
    const path = `${crypto.randomUUID()}.jpg`
    await uploadImage(env, PENDING, path, bytes)
    const locale = body.locale === 'en' ? 'en' : 'ko'
    try {
      const [row] = await rest<{ id: string }[]>(env, 'gallery_post', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id, source: body.source, look_id: body.lookId, image_path: path, locale, consent_text: (body.origin === 'upload' ? CONSENT_UPLOAD : CONSENT)[locale] }),
      })
      return json({ ok: true, id: row.id })
    } catch (e) {
      await removeImage(env, PENDING, path).catch(() => undefined)
      throw e
    }
  } catch (e) {
    console.error('[gallery] submit', e)
    return json({ error: 'submit_failed' }, 500)
  }
}

export async function onRequestDelete({ request, env }: { request: Request; env: GalleryEnv }) {
  const token = bearer(request)
  if (!token) return json({ error: 'login_required' }, 401)
  const user = await verifyUser(env, token)
  if (!user) return json({ error: 'invalid_token' }, 401)
  const id = new URL(request.url).searchParams.get('id')
  if (!isUuid(id)) return json({ error: 'bad_id' }, 400)
  try {
    const [row] = await rest<GalleryRow[]>(env, `gallery_post?id=eq.${id}&user_id=eq.${user.id}&select=id,image_bucket,image_path`)
    if (!row) return json({ error: 'not_found' }, 404)
    await removeImage(env, row.image_bucket, row.image_path)
    await rest(env, `gallery_post?id=eq.${id}&user_id=eq.${user.id}`, { method: 'DELETE' })
    return json({ ok: true })
  } catch (e) {
    console.error('[gallery] delete', e)
    return json({ error: 'delete_failed' }, 500)
  }
}
