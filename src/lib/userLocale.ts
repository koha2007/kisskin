// 회원의 언어(user_metadata.locale)를 실제 사용 언어에 맞춰 기록한다.
//
// 왜 필요한가: 주간 다이제스트 메일(functions/api/announce-products.ts)은
// user_metadata.locale 로 한국어/영어 본문을 가른다. 그런데 가입 시 이 값을
// 아무도 안 넣어 온 회원 전원이 기본값 'ko' 로 떨어졌고, 발송 로그의
// byLang 은 늘 `{ ko: 26, en: 0 }` 이었다 — 영문 분기가 사실상 죽은 코드였다.
//
// 기록 규칙 (2026-09-21):
//   1) 값이 아예 없으면  → 지금 보고 있는 언어로 채운다(기존 회원 백필).
//   2) 값이 있는데 사용자가 **직접 토글한 선호**(localStorage kisskin_locale)와
//      다르면 → 선호 쪽으로 고친다.
//   3) 그 외에는 건드리지 않는다.
//
// 2)·3) 이 핵심이다. 지금 화면의 언어만 보고 매번 덮어쓰면, 영어 회원이 한글
// URL(공유 링크 등)을 한 번 열었다는 이유로 'ko' 로 뒤집힌다. 한글 URL은
// 프리렌더가 한국어라 readLocale 이 무조건 'ko' 를 돌려주기 때문이다.
import type { User } from '@supabase/supabase-js'
import type { Locale } from '../i18n/types'
import { readLocale } from '../i18n/readLocale'
import { supabase } from './supabase'

function savedPreference(): Locale | null {
  try {
    const v = localStorage.getItem('kisskin_locale')
    return v === 'ko' || v === 'en' ? v : null
  } catch {
    return null
  }
}

function currentOf(u: User): Locale | null {
  const raw = String(u.user_metadata?.locale ?? u.user_metadata?.lang ?? '').toLowerCase()
  if (raw.startsWith('ko')) return 'ko'
  if (raw.startsWith('en')) return 'en'
  return null
}

/** 이번 세션에서 이미 맞춰 둔 사용자 — 훅이 여러 화면에서 동시에 돌아도 한 번만 쓴다. */
const done = new Set<string>()

export async function syncUserLocale(user: User | null): Promise<void> {
  if (!user || typeof window === 'undefined') return

  const stored = currentOf(user)
  const pref = savedPreference()
  const next: Locale | null = stored === null ? (pref ?? readLocale()) : pref && pref !== stored ? pref : null
  if (!next) return

  const key = `${user.id}:${next}`
  if (done.has(key)) return
  done.add(key)

  const { error } = await supabase.auth.updateUser({ data: { locale: next } })
  // 실패해도 화면에 영향이 없다(다음 방문에 다시 시도). 조용히 넘어간다.
  if (error) done.delete(key)
}
