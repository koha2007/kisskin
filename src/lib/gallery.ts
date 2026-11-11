// 고객 갤러리 클라이언트 (2026-11-02). 규칙은 supabase/migrations/0012_gallery.sql 참고.
import { supabase } from './supabase'
import { FORTUNE_LOOKS } from './fortune/looks'
import { ALL_MAKEUP_STYLES } from './makeup/styles'
import { paintById } from './paint/designs'
import { hairById } from './hair/colors'

export type GallerySource = 'makeup' | 'lucky' | 'paint' | 'hair'
export const GALLERY_SOURCES: GallerySource[] = ['makeup', 'lucky', 'paint', 'hair']
export const SOURCE_LABEL: Record<GallerySource, { ko: string; en: string }> = {
  makeup: { ko: '9가지 메이크업', en: '9 Looks' }, lucky: { ko: '럭키 메이크업', en: 'Lucky Makeup' },
  paint: { ko: '페이스 페인팅', en: 'Face Painting' }, hair: { ko: '헤어 컬러', en: 'Hair Color' },
}
export interface GalleryPost { id: string; source: GallerySource; lookId: string; image: string; hearts: number }
export interface MyGalleryPost extends Omit<GalleryPost, 'image'> { status: 'pending' | 'approved'; image: string | null }
export interface GalleryList { posts: GalleryPost[]; hearted: string[]; mine: MyGalleryPost[] }

/** 홈에 띄울 최소 사진 수 — 몇 장 없을 때 메인이 비어 보이지 않게 */
export const HOME_MIN_POSTS = 6

async function token(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}
const authHeaders = async (): Promise<Record<string, string>> => {
  const t = await token()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function fetchGallery(o: { sort?: 'hearts' | 'new'; source?: GallerySource } = {}): Promise<GalleryList | null> {
  try {
    const q = new URLSearchParams()
    if (o.sort === 'hearts') q.set('sort', 'hearts')
    if (o.source) q.set('source', o.source)
    const res = await fetch('/api/gallery' + (q.toString() ? `?${q}` : ''), { headers: await authHeaders(), cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as GalleryList
  } catch { return null }
}

/** 결과 이미지 → 긴 변 1024 JPEG(서버 제한 2MB 안쪽) */
function toUploadJpeg(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const k = Math.min(1, 1024 / Math.max(img.naturalWidth, img.naturalHeight))
      const c = document.createElement('canvas')
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', 0.86))
    }
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}

export type SubmitResult = 'ok' | 'login' | 'limit' | 'error'
export async function submitToGallery(o: { image: string; source: GallerySource; lookId: string; locale: 'ko' | 'en' }): Promise<SubmitResult> {
  try {
    const t = await token()
    if (!t) return 'login'
    const image = await toUploadJpeg(o.image)
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ image, source: o.source, lookId: o.lookId, locale: o.locale, consent: true, adultSelf: true }),
    })
    if (res.status === 401) return 'login'
    if (res.status === 429) return 'limit'
    return res.ok ? 'ok' : 'error'
  } catch { return 'error' }
}

export async function deleteMyPost(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: await authHeaders() })
    return res.ok
  } catch { return false }
}

export async function galleryAction(id: string, action: 'heart' | 'report'): Promise<{ hearted?: boolean; hearts?: number; ok?: boolean } | 'login' | null> {
  try {
    const t = await token()
    if (!t) return 'login'
    const res = await fetch('/api/gallery-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ id, action }),
    })
    if (res.status === 401) return 'login'
    return res.ok ? await res.json() : null
  } catch { return null }
}

export function lookLabel(source: GallerySource, lookId: string, isEn: boolean): string {
  if (source === 'lucky') {
    const l = FORTUNE_LOOKS.find((x) => x.id === lookId)
    return l ? (isEn ? l.nameEn : l.fortuneKo) : ''
  }
  if (source === 'paint') { const d = paintById(lookId); return d ? (isEn ? d.en : d.ko) : '' }
  if (source === 'hair') { const c = hairById(lookId); return c ? (isEn ? c.en : c.ko) : '' }
  const s = ALL_MAKEUP_STYLES.find((x) => x.id === lookId)
  return s ? (isEn ? s.subEn : s.nameKo) : ''
}

export function lookTryHref(source: GallerySource, lookId: string, isEn: boolean): string {
  const p = isEn ? '/en' : ''
  if (source === 'paint') return `${p}/face-paint/?d=${encodeURIComponent(lookId)}`
  if (source === 'hair') return `${p}/hair-color/?c=${encodeURIComponent(lookId)}`
  const base = source === 'lucky' ? '/lucky-makeup/' : '/makeup/'
  return `${p}${base}?look=${encodeURIComponent(lookId)}`
}
