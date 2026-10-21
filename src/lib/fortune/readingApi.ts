// 정밀 풀이 — /api/fortune-reading 호출 + 이 기기 저장(같은 결과면 다시 결제하지 않게) (2026-10-21)
// 서버로는 계산된 결과만 보낸다(사진·생년월일 원본 X) — 개인정보처리방침 3.1.1-2.
import { supabase } from '../supabase'
import { computeSaju, pillarHanja } from './saju'
import type { FortuneResult } from './state'
import type { PayChoice } from '../freeStatus'

export interface PreciseReading {
  summary?: string
  face?: { palace: string; area: string; reading: string }[]
  elements?: string
  fortunes?: { id: string; reading: string; makeup: string }[]
  year2027?: { month: number; theme: string }[]
  makeupPlan?: { base?: string; eyes?: string; cheeks?: string; lips?: string; accent?: string }
  products?: string[]
}
export type ReadingError = 'login' | 'topup' | 'free_used' | 'choose' | 'unavailable' | 'retry'

const key = (r: FortuneResult, lang: string) => `fortune:reading:${r.serial}:${lang}`
export function loadReading(r: FortuneResult, lang: string): PreciseReading | null {
  try { return JSON.parse(localStorage.getItem(key(r, lang)) || 'null') } catch { return null }
}

export async function requestReading(r: FortuneResult, lang: 'ko' | 'en', jobId: string, pay?: PayChoice):
  Promise<{ ok: true; reading: PreciseReading; tier: 'free' | 'credit'; balance?: number } | { ok: false; error: ReadingError }> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return { ok: false, error: 'login' }
  const sj = r.birth ? computeSaju(r.birth) : null
  let res: Response
  try {
    res = await fetch('/api/fortune-reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        lang, pay, jobId,
        dayStem: sj?.day.stem,
        pillars: sj ? { year: pillarHanja(sj.year), month: pillarHanja(sj.month), day: pillarHanja(sj.day), hour: sj.hour ? pillarHanja(sj.hour) : undefined } : undefined,
        counts: sj?.counts, lacking: sj?.lacking,
        animal: r.animals?.[0], second: r.animals?.[1], z: r.z,
        scores: r.scores.map((s) => ({ id: s.id, score: s.score })),
      }),
    })
  } catch { return { ok: false, error: 'retry' } }
  const d = (await res.json().catch(() => ({}))) as { reading?: PreciseReading; tier?: 'free' | 'credit'; balance?: number; error?: string }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: 'login' }
    if (res.status === 402) return { ok: false, error: 'topup' }
    if (res.status === 409 && d.error === 'free_pass_used') return { ok: false, error: 'free_used' }
    if (res.status === 409 && d.error === 'pay_required') return { ok: false, error: 'choose' }
    if (res.status === 503) return { ok: false, error: 'unavailable' }
    return { ok: false, error: 'retry' }
  }
  if (!d.reading || !d.tier) return { ok: false, error: 'retry' }
  try { localStorage.setItem(key(r, lang), JSON.stringify(d.reading)) } catch { /* 저장 못 해도 화면엔 보여 준다 */ }
  return { ok: true, reading: d.reading, tier: d.tier, balance: d.balance }
}
