// 친구 초대 (2026-10-21) — 서버는 functions/api/referral.ts · 규칙은 supabase/migrations/0009_referral.sql
//   ① 아무 페이지에 ?ref=<코드> 로 들어오면 기기에 기억(30일)  — captureRef (Layout)
//   ② 로그인되면 서버에 묶기 요청, 확답(성공·거절)이 오면 지운다 — claimStoredRef (useAuth)
//   ③ 내 코드는 기기에 캐시해 두고 공유 링크에 붙인다           — withRef (공유 버튼)
import { supabase } from './supabase'

const PENDING_KEY = 'kis_ref_pending'
const MINE_KEY = 'kis_ref_mine'
const TTL_MS = 30 * 24 * 60 * 60 * 1000
const CODE_RE = /^[A-Z0-9]{8}$/

function read<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : null
  } catch {
    return null
  }
}
function write(key: string, v: unknown): void {
  try {
    if (v == null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(v))
  } catch { /* 저장 불가(사생활 보호 모드) — 초대만 빠진다 */ }
}

/** 주소의 ?ref= 를 기억한다. 내 코드면 무시. */
export function captureRef(): void {
  if (typeof window === 'undefined') return
  const code = new URLSearchParams(window.location.search).get('ref')?.trim().toUpperCase()
  if (!code || !CODE_RE.test(code)) return
  if (read<{ code: string }>(MINE_KEY)?.code === code) return
  write(PENDING_KEY, { code, at: Date.now() })
}

let claiming = false

/** 로그인 상태에서 부른다 — 기억해 둔 초대 코드를 서버에 묶는다. */
export async function claimStoredRef(): Promise<void> {
  const p = read<{ code: string; at: number }>(PENDING_KEY)
  if (!p || claiming) return
  if (Date.now() - p.at > TTL_MS) { write(PENDING_KEY, null); return }
  claiming = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    const res = await fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ code: p.code }),
    })
    // 200 = 확답(묶임 또는 거절 사유) → 지운다. 503 등은 다음 방문에 다시 시도.
    if (res.ok) write(PENDING_KEY, null)
  } catch { /* 다음 방문에 다시 */ } finally {
    claiming = false
  }
}

export interface ReferralInfo { code: string; joined: number; paid: number; rewarded: number; cap: number; bonus: number }

/** 내 초대 코드 + 현황. 0009 실행 전·실패면 null(화면은 초대 카드를 숨긴다). */
export async function getMyReferral(): Promise<ReferralInfo | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return null
    const res = await fetch('/api/referral', { headers: { Authorization: `Bearer ${session.access_token}` }, cache: 'no-store' })
    if (!res.ok) return null
    const d = (await res.json()) as ReferralInfo
    if (!d.code) return null
    write(MINE_KEY, { uid: session.user.id, code: d.code })
    return d
  } catch {
    return null
  }
}

/** 로그인되면 한 번 내 코드를 받아 둔다(공유 버튼이 기다리지 않게 — navigator.share 는 클릭 직후여야 한다). */
export async function ensureMyCode(uid: string): Promise<void> {
  if (read<{ uid: string }>(MINE_KEY)?.uid === uid) return
  await getMyReferral()
}

export function forgetMyCode(): void {
  write(MINE_KEY, null)
}

/** 공유 링크에 내 초대 코드를 붙인다(로그인해 코드가 있을 때만). */
export function withRef(url: string): string {
  const mine = read<{ code: string }>(MINE_KEY)
  if (!mine?.code) return url
  try {
    const u = new URL(url)
    u.searchParams.set('ref', mine.code)
    return u.toString()
  } catch {
    return url
  }
}

/** 초대 링크(홈) */
export function inviteUrl(code: string, isEn: boolean): string {
  return `https://kissinskin.net${isEn ? '/en/' : '/'}?ref=${code}`
}
