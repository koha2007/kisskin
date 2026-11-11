// 고객 갤러리 공용 — Supabase REST·Storage 호출 (2026-11-02). 규칙은 supabase/migrations/0012_gallery.sql 참고.
export interface GalleryEnv {
  VITE_SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  /** 승인 권한 메일(쉼표로 구분). 비어 있으면 아무도 승인할 수 없다 */
  GALLERY_ADMIN_EMAILS?: string
}
export interface GalleryRow {
  id: string; user_id: string; source: 'makeup' | 'lucky'; look_id: string
  image_bucket: 'gallery-pending' | 'gallery'; image_path: string; status: 'pending' | 'approved'
  heart_count: number; report_count: number; created_at: string
}
export const PENDING = 'gallery-pending'
export const PUBLIC = 'gallery'

export const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

const auth = (env: GalleryEnv) => ({ apikey: env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` })

export async function rest<T>(env: GalleryEnv, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...auth(env), 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers as Record<string, string> | undefined) },
  })
  if (!res.ok) throw new Error(`rest ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export async function uploadImage(env: GalleryEnv, bucket: string, path: string, bytes: Uint8Array): Promise<void> {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: { ...auth(env), 'Content-Type': 'image/jpeg', 'Cache-Control': 'max-age=3600' },
    body: bytes,
  })
  if (!res.ok) throw new Error(`upload ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

export async function removeImage(env: GalleryEnv, bucket: string, path: string): Promise<void> {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, { method: 'DELETE', headers: auth(env) })
  if (!res.ok && res.status !== 404) throw new Error(`remove ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

/** 버킷 이동: 복사 → 호출부가 행을 갱신 → 원본 삭제 순서로 써서, 중간에 실패해도 이미지를 잃지 않는다 */
export async function copyImage(env: GalleryEnv, from: string, to: string, path: string): Promise<void> {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/storage/v1/object/copy`, {
    method: 'POST',
    headers: { ...auth(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucketId: from, sourceKey: path, destinationBucket: to, destinationKey: path }),
  })
  if (!res.ok) throw new Error(`copy ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

export const publicUrl = (env: GalleryEnv, path: string) => `${env.VITE_SUPABASE_URL}/storage/v1/object/public/${PUBLIC}/${path}`

export async function signedUrl(env: GalleryEnv, bucket: string, path: string): Promise<string | null> {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/storage/v1/object/sign/${bucket}/${path}`, {
    method: 'POST',
    headers: { ...auth(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: 900 }),
  })
  if (!res.ok) return null
  const d = (await res.json()) as { signedURL?: string }
  return d.signedURL ? `${env.VITE_SUPABASE_URL}/storage/v1${d.signedURL}` : null
}

export const imageUrlOf = async (env: GalleryEnv, r: Pick<GalleryRow, 'image_bucket' | 'image_path'>) =>
  r.image_bucket === PUBLIC ? publicUrl(env, r.image_path) : signedUrl(env, r.image_bucket, r.image_path)

export const isUuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

export function isGalleryAdmin(env: GalleryEnv, email: string | undefined): boolean {
  if (!email || !env.GALLERY_ADMIN_EMAILS) return false
  return env.GALLERY_ADMIN_EMAILS.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase())
}
