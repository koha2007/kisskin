// 9가지 메이크업 1장 생성 — /api/makeup-edit 호출 (2026-11-02, 럭키 generate.ts 와 같은 규칙)
// 무료권 = makeup 풀(pool 미지정) · 크레딧은 공용 · 같은 작업 재시도는 같은 jobId(이중 차감 X).
import { supabase } from '../supabase'
import { promptWholeFace, styleById, type MakeupStyleId } from './styles'
import { fitPreserveAspect } from './compose'
import type { PayChoice } from '../freeStatus'

export type GenError = 'login' | 'topup' | 'free_used' | 'choose' | 'unavailable' | 'retry'
export type GenResult =
  | { ok: true; image: string; tier: 'free' | 'credit'; balance?: number; freeLeft?: number }
  | { ok: false; error: GenError }

export function newJobId(): string {
  try { return crypto.randomUUID() } catch { /* secure context 아님 */ }
  return 'job-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

export async function generateMakeupLook(opts: { photo: string; styleId: MakeupStyleId; jobId: string; pay?: PayChoice }): Promise<GenResult> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) return { ok: false, error: 'login' }
  const img = new Image()
  img.crossOrigin = 'anonymous'
  try {
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('load')); img.src = opts.photo })
  } catch { return { ok: false, error: 'retry' } }
  const { canvas, size } = fitPreserveAspect(img)
  let res: Response
  try {
    res = await fetch('/api/makeup-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ image: canvas.toDataURL('image/png'), prompt: promptWholeFace(styleById(opts.styleId)), styleId: opts.styleId, jobId: opts.jobId, size, pay: opts.pay }),
    })
  } catch { return { ok: false, error: 'retry' } }
  const data = (await res.json().catch(() => ({}))) as { image?: string; tier?: 'free' | 'credit'; balance?: number; freeLeft?: number; error?: string }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: 'login' }
    if (res.status === 402) return { ok: false, error: 'topup' }
    if (res.status === 409 && data.error === 'free_pass_used') return { ok: false, error: 'free_used' }
    if (res.status === 409 && data.error === 'pay_required') return { ok: false, error: 'choose' }
    if (res.status === 503) return { ok: false, error: 'unavailable' }
    return { ok: false, error: 'retry' }
  }
  if (!data.image || (data.tier !== 'free' && data.tier !== 'credit')) return { ok: false, error: 'retry' }
  return { ok: true, image: data.image, tier: data.tier, balance: data.balance, freeLeft: data.freeLeft }
}

const PENDING_STYLE = 'makeup:pendingStyle'
export const keepPendingStyle = (id: MakeupStyleId) => { try { sessionStorage.setItem(PENDING_STYLE, id) } catch { /* noop */ } }
export const takePendingStyle = (): MakeupStyleId | null => {
  try { const v = sessionStorage.getItem(PENDING_STYLE); sessionStorage.removeItem(PENDING_STYLE); return v as MakeupStyleId | null } catch { return null }
}
