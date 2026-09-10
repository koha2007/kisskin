import { supabase } from '../supabase'
import type { BeautyDna } from './types'
import { buildPortraitPrompt } from './portraitPrompt'

export type DnaGenErrorKind = 'login' | 'topup' | 'unconfigured' | 'retry'

export interface DnaGenOk {
  ok: true
  image: string
  tier: 'free' | 'credit'
  used?: number
  free?: number
  balance?: number
}
export interface DnaGenErr {
  ok: false
  kind: DnaGenErrorKind
  balance?: number
  detail?: string
}

/**
 * jobId 는 호출부가 관리한다(makeup-edit 패턴):
 *   - 새 생성/다시 만들기 → 새 jobId (크레딧 차감)
 *   - 에러 후 재시도 → 같은 jobId (멱등, 재청구 없음)
 */
export async function generateDnaPortrait(dna: BeautyDna, jobId: string): Promise<DnaGenOk | DnaGenErr> {
  const built = buildPortraitPrompt(dna)
  if (!built) return { ok: false, kind: 'retry', detail: 'incomplete' }

  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) return { ok: false, kind: 'login' }

  let res: Response
  try {
    res = await fetch('/api/dna-portrait', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prompt: built.prompt, baseShape: built.baseShape, jobId }),
    })
  } catch {
    return { ok: false, kind: 'retry', detail: 'network' }
  }

  const data = (await res.json().catch(() => ({}))) as {
    image?: string; tier?: 'free' | 'credit'; used?: number; free?: number; balance?: number; error?: string
  }

  if (!res.ok) {
    const c = data.error
    if (res.status === 401 || c === 'login_required') return { ok: false, kind: 'login' }
    if (res.status === 402) return { ok: false, kind: 'topup', balance: data.balance }
    if (res.status === 503) return { ok: false, kind: 'unconfigured', detail: c }
    return { ok: false, kind: 'retry', detail: c }
  }
  if (!data.image) return { ok: false, kind: 'retry', detail: 'no_image' }
  return { ok: true, image: data.image, tier: data.tier ?? 'free', used: data.used, free: data.free, balance: data.balance }
}
