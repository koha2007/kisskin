// AI 완성본 1장 — 페이스 페인팅·헤어 컬러 공용 (2026-11-11)
// /api/makeup-edit 을 그대로 쓰되 pool='paint'|'hair' = 항상 크레딧 1개(가입 무료권 2장은 9가지·럭키 전용, 정책 유지).
// 같은 작업 재시도는 같은 jobId(이중 차감 X) — generateLook.ts 와 같은 규칙.
import { supabase } from '../supabase'
import { fitPreserveAspect } from './compose'
import type { GenError } from './generateLook'

export type EditPool = 'paint' | 'hair'
export type EditResult =
  | { ok: true; image: string; balance?: number }
  | { ok: false; error: GenError }

export async function generateEdit(opts: { source: HTMLImageElement | HTMLCanvasElement; prompt: string; styleId: string; jobId: string; pool: EditPool }): Promise<EditResult> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) return { ok: false, error: 'login' }
  let dataUrl: string
  try {
    if (opts.source instanceof HTMLCanvasElement) {
      // 긴 변 1024 로 줄여 보낸다(원가 같음, 업로드만 가볍게)
      const s = opts.source
      const k = Math.min(1, 1024 / Math.max(s.width, s.height))
      const c = document.createElement('canvas'); c.width = Math.round(s.width * k); c.height = Math.round(s.height * k)
      c.getContext('2d')!.drawImage(s, 0, 0, c.width, c.height)
      dataUrl = c.toDataURL('image/png')
    } else {
      dataUrl = fitPreserveAspect(opts.source).canvas.toDataURL('image/png')
    }
  } catch { return { ok: false, error: 'retry' } }
  let res: Response
  try {
    res = await fetch('/api/makeup-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ image: dataUrl, prompt: opts.prompt, styleId: `${opts.pool}:${opts.styleId}`, jobId: opts.jobId, size: 'auto', pay: 'credit', pool: opts.pool }),
    })
  } catch { return { ok: false, error: 'retry' } }
  const data = (await res.json().catch(() => ({}))) as { image?: string; balance?: number; error?: string }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: 'login' }
    if (res.status === 402) return { ok: false, error: 'topup' }
    if (res.status === 503) return { ok: false, error: 'unavailable' }
    return { ok: false, error: 'retry' }
  }
  if (!data.image) return { ok: false, error: 'retry' }
  return { ok: true, image: data.image, balance: data.balance }
}
