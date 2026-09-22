import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { syncUserLocale } from '../lib/userLocale'
import { trackSignUp, trackLogin } from '../lib/analytics'
import { startDnaSync } from '../lib/beauty-dna/sync'

// 가입/로그인 완료를 **여기 한 곳에서만** 집계한다. AuthPage 에서 잡으면 구글
// 로그인(리다이렉트로 나갔다 돌아옴)이 통째로 빠진다.
//
// 신규 가입 / 재로그인 구분: Supabase 가 둘 다 SIGNED_IN 으로 주므로
// created_at 이 방금이면 가입으로 센다.
const NEW_USER_WINDOW_MS = 2 * 60 * 1000
const counted = new Set<string>()

function methodOf(u: { app_metadata?: { provider?: string } }): string {
  return u.app_metadata?.provider === 'google' ? 'google' : 'email'
}

function countAuth(user: { id: string; created_at?: string; app_metadata?: { provider?: string } } | null): void {
  if (!user || counted.has(user.id)) return
  counted.add(user.id)
  const created = user.created_at ? Date.parse(user.created_at) : NaN
  const isNew = Number.isFinite(created) && Date.now() - created < NEW_USER_WINDOW_MS
  if (isNew) trackSignUp(methodOf(user))
  else trackLogin(methodOf(user))
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    // 내 뷰티 기록 동기화 — 로그인 동안에만 돌고, 로그아웃/언마운트 때 멈춘다.
    let stopDnaSync: (() => void) | undefined
    let syncedUserId: string | null = null
    const syncDna = (u: User | null) => {
      if (u?.id === syncedUserId) return
      stopDnaSync?.()
      stopDnaSync = undefined
      syncedUserId = u?.id ?? null
      if (u) stopDnaSync = startDnaSync(u)
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
      syncDna(session?.user ?? null)
      // 회원의 언어를 user_metadata 에 남긴다 — 주간 다이제스트 메일이 이 값으로
      // 한/영을 가른다. 값이 없던 기존 회원은 여기서 백필된다(lib/userLocale.ts).
      void syncUserLocale(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      syncDna(session?.user ?? null)
      void syncUserLocale(session?.user ?? null)
      // INITIAL_SESSION(새로고침으로 세션 복원)은 로그인이 아니다 — 세지 않는다.
      if (event === 'SIGNED_IN') countAuth(session?.user ?? null)
    })
    return () => {
      mounted = false
      stopDnaSync?.()
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    // scope:'local' — 이 기기만 로그아웃한다 (2026-09-22).
    //   Supabase 기본값은 'global' 이라 **모든 기기의 세션이 함께 끊긴다.** 폰에서
    //   로그아웃했다고 데스크톱까지 튕기는 건 아무도 기대하지 않는 동작이고,
    //   같은 파일 안 탈퇴 경로(MyPage)는 이미 'local' 을 쓰고 있어 서로 달랐다.
    //   "모든 기기에서 로그아웃"이 필요해지면 그건 별도 버튼으로 둔다.
    // 실패해도(네트워크 끊김 등) 로컬 상태는 반드시 비운다 — 안 그러면 화면만
    //   로그인 상태로 남아 "로그아웃이 안 된다"가 된다.
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } finally {
      setUser(null)
    }
  }

  return { user, loading, signOut }
}
