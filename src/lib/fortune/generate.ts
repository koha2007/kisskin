// 관상 메이크업 생성 — /api/makeup-edit 호출 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 9룩(MakeupFlow)과 같은 서버·같은 무료권(makeup 풀)·같은 크레딧. 다른 점은 지시문뿐:
//   promptWholeFace(관상 룩 + 부족 오행 포인트 색).
// 규칙(기존과 동일): 무료권/크레딧은 사용자가 고른다(pay) · 같은 작업 재시도는 같은 jobId(이중 차감 X).
import { supabase } from '../supabase'
import { promptWholeFace } from '../makeup/styles'
import { fitPreserveAspect } from '../makeup/compose'
import { ELEMENT_ACCENT, fortuneLookById, type FortuneLookId } from './looks'
import type { Element } from './saju'
import type { PayChoice } from '../freeStatus'

export type GenError = 'login' | 'topup' | 'free_used' | 'choose' | 'unavailable' | 'retry'
export type GenResult =
  | { ok: true; image: string; tier: 'free' | 'credit'; balance?: number; freeLeft?: number }
  | { ok: false; error: GenError }

export function newJobId(): string {
  try { return crypto.randomUUID() } catch { /* secure context 아님 */ }
  return 'job-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

/** extra = 덧붙일 포인트 지시문(2027 신년 오복은 newYearAccentPrompt — 부족 오행 포인트를 대신한다) */
export function fortunePrompt(lookId: FortuneLookId, lacking?: Element, extra?: string): string {
  const look = fortuneLookById(lookId)
  const accent = extra ? ' ' + extra : lacking ? ' ' + ELEMENT_ACCENT[lacking].prompt : ''
  return promptWholeFace({ subEn: look.subEn, hair: look.hair, prompt: look.prompt + accent })
}

export async function generateFortuneMakeup(opts: {
  photo: string; lookId: FortuneLookId; lacking?: Element; extra?: string; styleTag?: string; jobId: string; pay?: PayChoice
}): Promise<GenResult> {
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
      body: JSON.stringify({
        image: canvas.toDataURL('image/png'),
        prompt: fortunePrompt(opts.lookId, opts.lacking, opts.extra),
        styleId: `${opts.styleTag ?? 'fortune'}:${opts.lookId}`,
        jobId: opts.jobId, size, pay: opts.pay,
      }),
    })
  } catch { return { ok: false, error: 'retry' } }
  const data = (await res.json().catch(() => ({}))) as {
    image?: string; tier?: 'free' | 'credit'; balance?: number; freeLeft?: number; error?: string
  }
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

// ── 로그인 왕복 보존: 고른 룩만 세션에 맡긴다(셀카는 pendingSelfie, 결과는 state.saveLast) ──
const PENDING_LOOK = 'fortune:pendingLook'
export const keepPendingLook = (id: FortuneLookId) => { try { sessionStorage.setItem(PENDING_LOOK, id) } catch { /* noop */ } }
export const takePendingLook = (): FortuneLookId | null => {
  try { const v = sessionStorage.getItem(PENDING_LOOK); sessionStorage.removeItem(PENDING_LOOK); return v as FortuneLookId | null } catch { return null }
}
