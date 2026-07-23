import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../hooks/useAuth'
import { getCreditBalance } from '../lib/credits'

/**
 * 브랜드 팔레트 토큰 (2026-07-23) — AuthPage.tsx 와 같은 값. 이 두 페이지만
 * 인라인 스타일 덩어리라 Tailwind @theme 이 닿지 않는다. index.css 와 함께 고칠 것.
 */
const C = {
  cream: '#f8f6f6',
  surface: '#ffffff',
  navy: '#070953',
  muted: '#6b6f8c',
  line: 'rgba(7, 9, 83, 0.16)',
  primary: '#eb4763',
  primaryDark: '#c9304a',
  mustard: '#c79340',
  sage: '#7e9b6a',
} as const

const RAD = '4px'

/**
 * 파괴적 동작(회원 탈퇴) 전용 색.
 * 시그니처 핑크(#eb4763)와 같은 계열이면 "탈퇴"가 메인 CTA 처럼 보인다.
 * 채도를 낮추고 확실히 어둡게 잡아 팔레트 안에 있으면서도 구분되게 한다.
 */
const DANGER = '#8f2d20'

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: C.navy,
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

interface SubStatus {
  active: boolean
  checked: boolean
  status?: string
  tier?: string | null
  usage: number
  limit: number
  trialEndsAt?: string | null
  periodEnd?: string
  cancelAtPeriodEnd?: boolean
}

interface OrderRow {
  polar_order_id: string
  email: string
  amount: number
  currency: string
  status: string
  created_at: string
}

interface MyPageProps {
  onNavigate?: (page: 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth' | 'mypage') => void
  user?: { id?: string; email?: string; app_metadata?: { provider?: string } } | null
  onLogout?: () => void
  subStatus?: SubStatus
  onCheckout?: (type: 'one-time' | 'subscription') => void
}

const DEFAULT_SUB_STATUS: SubStatus = { active: false, checked: false, usage: 0, limit: 0 }

export default function MyPage({ onNavigate, user: userProp, onLogout: onLogoutProp, subStatus: subStatusProp }: MyPageProps) {
  const nav = (page: string) => {
    const paths: Record<string, string> = { home: '/', analysis: '/analysis/', terms: '/terms/', privacy: '/privacy/', refund: '/refund/', contact: '/contact/', auth: '/auth/', mypage: '/mypage/' }
    if (onNavigate) onNavigate(page as 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth' | 'mypage')
    else window.location.href = paths[page] || '/'
  }
  const { t, locale } = useI18n()
  const { user: authUser, loading: authLoading, signOut } = useAuth()
  const user = userProp ?? authUser

  // Self-fetched subscription status (only used when no prop is passed)
  const [fetchedSubStatus, setFetchedSubStatus] = useState<SubStatus>(DEFAULT_SUB_STATUS)
  const subStatus = subStatusProp ?? fetchedSubStatus

  // Self-implemented logout / checkout fallbacks for direct-URL access.
  // The logout fallback owns its own navigation so the click handler can
  // simply await it — otherwise the in-flight signOut races a
  // window.location.href assignment and the user appears logged in.
  const onLogout = onLogoutProp ?? (async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('[MyPage] signOut failed:', err)
    } finally {
      window.location.href = '/'
    }
  })

  // Redirect unauthenticated users to /auth/ once session check finishes
  useEffect(() => {
    if (!authLoading && !user && !userProp) {
      window.location.href = '/auth/'
    }
  }, [authLoading, user, userProp])

  // Self-fetch subscription status when wrapper didn't pass one
  useEffect(() => {
    if (subStatusProp) return
    if (!user?.email) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/subscription-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setFetchedSubStatus({ ...data, checked: true } as SubStatus)
      } catch {
        if (!cancelled) setFetchedSubStatus({ ...DEFAULT_SUB_STATUS, checked: true })
      }
    })()
    return () => { cancelled = true }
  }, [subStatusProp, user?.email])
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)

  const isOAuth = user?.app_metadata?.provider && user.app_metadata.provider !== 'email'
  const isKo = locale === 'ko'

  // Fetch order history from Supabase
  const fetchOrders = useCallback(async () => {
    if (!user?.email) return
    setOrdersLoading(true)
    try {
      const supabaseUrl = 'https://vrcltmhhbgnsmdeoxlck.supabase.co'
      const res = await fetch(
        `${supabaseUrl}/rest/v1/orders?email=eq.${encodeURIComponent(user.email)}&order=created_at.desc&limit=10`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          },
        },
      )
      if (res.ok) {
        const data = await res.json()
        setOrders(data as OrderRow[])
      }
    } catch {
      // silently fail
    } finally {
      setOrdersLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // 크레딧 잔액 — 로그인 유저의 남은 AI 메이크업 크레딧(RLS 로 본인 것만).
  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    getCreditBalance()
      .then((n) => { if (!cancelled) setCredits(n) })
      .catch(() => { if (!cancelled) setCredits(0) })
    return () => { cancelled = true }
  }, [user?.id])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (!newPassword || !confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: t('auth.fillAll') })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: t('auth.passwordMin') })
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: t('auth.passwordMismatch') })
      return
    }

    setPasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPasswordMsg({ type: 'success', text: t('mypage.passwordChanged') })
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setPasswordMsg({ type: 'error', text: message })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) return // safety guard: must go through confirmation step
    setDeleteError(null)
    setDeleteLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ userId: user?.id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete account')
      }
      await supabase.auth.signOut({ scope: 'local' })
      await onLogout()
      window.location.href = '/'
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setDeleteError(message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return isKo
      ? `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: RAD,
    border: `1px solid ${C.line}`,
    background: '#fff',
    color: C.navy,
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const cardStyle: React.CSSProperties = {
    background: C.surface,
    borderRadius: RAD,
    padding: 'clamp(16px, 4vw, 24px)',
    width: '100%',
    maxWidth: '440px',
    border: `1px solid ${C.line}`,
    marginBottom: '16px',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px', color: C.muted,
  }

  const valueStyle: React.CSSProperties = {
    fontSize: '14px', color: C.navy, margin: '4px 0 0',
  }

  // Subscription info
  const planName = !subStatus.active
    ? (isKo ? '무료 / 건별 결제' : 'Free / Pay-per-analysis')
    : subStatus.status === 'trialing'
      ? (isKo ? '무료 체험 (Trial)' : 'Free Trial')
      : (isKo ? 'Pro 구독' : 'Pro Subscription')

  const planColor = !subStatus.active ? C.muted
    : subStatus.status === 'trialing' ? C.mustard : C.sage

  const usageText = subStatus.limit === -1
    ? `${subStatus.usage} / ${isKo ? '무제한' : 'Unlimited'}`
    : `${subStatus.usage} / ${subStatus.limit}`

  return (
    <div style={{
      minHeight: '100dvh',
      background: C.cream,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 16px',
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => nav('home')}
          style={{ background: 'none', border: 'none', color: C.navy, cursor: 'pointer', padding: '4px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
        </button>
        <h1 className="t-h2" style={{ color: C.navy, margin: 0 }}>{t('mypage.title')}</h1>
      </div>

      {/* 내 정보 */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
          {t('mypage.info')}
        </h2>
        <div style={{ marginBottom: '12px' }}>
          <span style={labelStyle}>{t('auth.email')}</span>
          <p style={valueStyle}>{user?.email || '-'}</p>
        </div>
        <div>
          <span style={labelStyle}>{t('mypage.loginMethod')}</span>
          <p style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isOAuth ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mail</span>
                {t('mypage.emailLogin')}
              </>
            )}
          </p>
        </div>
      </div>

      {/* 내 크레딧 — AI 메이크업 생성에 쓰는 크레딧 잔액 */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_awesome</span>
          {isKo ? '내 크레딧' : 'My Credits'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: C.primary, lineHeight: 1 }}>
              {credits === null ? '…' : credits}
            </span>
            <span style={{ fontSize: '13px', color: C.muted }}>
              {isKo ? '개 남음' : credits === 1 ? 'credit left' : 'credits left'}
            </span>
          </div>
          <button
            onClick={() => { window.location.href = '/analysis/?topup=1' }}
            style={{
              padding: '10px 18px', borderRadius: RAD, border: 'none',
              background: C.primary,
              color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
            {isKo ? '크레딧 충전' : 'Top up'}
          </button>
        </div>
        <p style={{ fontSize: '12px', color: C.muted, margin: '12px 0 0', lineHeight: 1.5 }}>
          {isKo
            ? '크레딧 1개 = AI 메이크업 1장. 첫 1회는 무료로 체험할 수 있어요.'
            : '1 credit = 1 AI makeup. Your first try is free.'}
        </p>
      </div>

      {/* 구독 관리 */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>card_membership</span>
          {isKo ? '구독 관리' : 'Subscription'}
        </h2>

        {/* 현재 플랜 */}
        <div style={{ marginBottom: '16px' }}>
          <span style={labelStyle}>{isKo ? '현재 플랜' : 'Current Plan'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{
              display: 'inline-block',
              background: planColor,
              color: '#fff',
              borderRadius: RAD,
              padding: '4px 14px',
              fontSize: '13px',
              fontWeight: 700,
            }}>
              {planName}
            </span>
            {subStatus.cancelAtPeriodEnd && (
              <span style={{
                fontSize: '12px',
                color: '#7a5a20',
                background: 'rgba(199, 147, 64, 0.16)',
                borderRadius: RAD,
                padding: '3px 10px',
              }}>
                {isKo ? '해지 예정' : 'Canceling'}
              </span>
            )}
          </div>
        </div>

        {/* 사용량 (구독자만) */}
        {subStatus.active && (
          <div style={{ marginBottom: '16px' }}>
            <span style={labelStyle}>{isKo ? '이번 달 사용량' : 'Monthly Usage'}</span>
            <div style={{ marginTop: '6px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px',
              }}>
                <span style={{ fontSize: '14px', color: C.navy, fontWeight: 600 }}>{usageText}</span>
              </div>
              {subStatus.limit > 0 && (
                <div style={{
                  width: '100%', height: '6px', borderRadius: '3px',
                  background: C.line,
                }}>
                  <div style={{
                    width: `${Math.min(100, (subStatus.usage / subStatus.limit) * 100)}%`,
                    height: '100%', borderRadius: '3px',
                    background: subStatus.usage >= subStatus.limit ? C.primary : C.sage,
                  }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 체험 종료일 / 다음 결제일 */}
        {subStatus.active && subStatus.status === 'trialing' && subStatus.trialEndsAt && (
          <div style={{ marginBottom: '16px' }}>
            <span style={labelStyle}>{isKo ? '체험 종료일' : 'Trial Ends'}</span>
            <p style={valueStyle}>{formatDate(subStatus.trialEndsAt)}</p>
          </div>
        )}
        {subStatus.active && subStatus.status === 'active' && subStatus.periodEnd && (
          <div style={{ marginBottom: '16px' }}>
            <span style={labelStyle}>
              {subStatus.cancelAtPeriodEnd
                ? (isKo ? '구독 만료일' : 'Subscription Ends')
                : (isKo ? '다음 결제일' : 'Next Billing Date')}
            </span>
            <p style={valueStyle}>{formatDate(subStatus.periodEnd)}</p>
          </div>
        )}

        {/* 액션 버튼 — $9.88 신규 구독 유도 표기 제거 (P0-5). 기존 구독자 관리(Polar 포털)는 유지. */}
        {subStatus.active && (
          <>
            <button
              onClick={() => window.open('https://polar.sh/kisskin-makeup7/portal', '_blank')}
              style={{
                width: '100%', padding: '12px', borderRadius: RAD,
                border: `1px solid ${C.line}`,
                background: 'transparent', color: C.navy,
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
              {isKo ? '구독 관리 (결제·해지·변경)' : 'Manage Subscription'}
            </button>
            {subStatus.cancelAtPeriodEnd && (
              <div style={{
                background: 'rgba(199, 147, 64, 0.12)', borderRadius: RAD,
                padding: '12px 14px', border: `1px solid ${C.mustard}44`,
                marginTop: '12px',
              }}>
                <p style={{ fontSize: '13px', color: '#7a5a20', margin: 0, lineHeight: 1.5 }}>
                  {isKo
                    ? `구독이 ${subStatus.periodEnd ? formatDate(subStatus.periodEnd) : ''} 에 만료됩니다. 포털에서 다시 구독할 수 있습니다.`
                    : `Your subscription expires on ${subStatus.periodEnd ? formatDate(subStatus.periodEnd) : ''}. You can resubscribe from the portal.`}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 결제 내역 */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>receipt_long</span>
          {isKo ? '결제 내역' : 'Payment History'}
        </h2>

        {ordersLoading ? (
          <p style={{ fontSize: '13px', color: C.muted }}>{isKo ? '불러오는 중...' : 'Loading...'}</p>
        ) : orders.length === 0 ? (
          <p style={{ fontSize: '13px', color: C.muted }}>{isKo ? '결제 내역이 없습니다.' : 'No payment history.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {orders.map(order => (
              <div
                key={order.polar_order_id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: RAD,
                  background: C.cream,
                  border: `1px solid ${C.line}`,
                }}
              >
                <div>
                  <p style={{ fontSize: '13px', color: C.navy, margin: 0, fontWeight: 600 }}>
                    ${(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
                  </p>
                  <p style={{ fontSize: '11px', color: C.muted, margin: '2px 0 0' }}>
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  color: order.status === 'refunded' ? '#7a5a20' : '#4c6339',
                  background: order.status === 'refunded' ? 'rgba(199, 147, 64, 0.16)' : 'rgba(126, 155, 106, 0.16)',
                  borderRadius: RAD, padding: '3px 10px',
                }}>
                  {order.status === 'refunded' ? (isKo ? '환불됨' : 'Refunded') : (isKo ? '완료' : 'Paid')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 비밀번호 변경 - OAuth가 아닌 경우만 */}
      {!isOAuth && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock_reset</span>
            {t('mypage.changePassword')}
          </h2>
          <form onSubmit={handlePasswordReset}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>
                {t('mypage.newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>
                {t('mypage.confirmNewPassword')}
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
            {passwordMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: RAD,
                background: passwordMsg.type === 'success' ? 'rgba(126, 155, 106, 0.14)' : 'rgba(176, 62, 45, 0.1)',
                border: `1px solid ${passwordMsg.type === 'success' ? `${C.sage}66` : `${C.primaryDark}44`}`,
                color: passwordMsg.type === 'success' ? '#4c6339' : C.primaryDark,
                fontSize: '13px',
                marginBottom: '12px',
              }}>
                {passwordMsg.text}
              </div>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: RAD,
                border: 'none',
                background: passwordLoading ? C.muted : C.primary,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: passwordLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {passwordLoading ? '...' : t('mypage.changePasswordBtn')}
            </button>
          </form>
        </div>
      )}

      {/* 로그아웃 */}
      <div style={cardStyle}>
        <button
          onClick={async () => {
            try { await onLogout() } catch (err) { console.error('[MyPage] logout error:', err) }
            // Safety net in case onLogout (prop-injected) doesn't navigate
            window.location.href = '/'
          }}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: RAD,
            border: `1px solid ${C.line}`,
            background: 'transparent',
            color: C.muted,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          {t('auth.logout')}
        </button>
      </div>

      {/* 회원 탈퇴 */}
      <div style={{ ...cardStyle, border: `1px solid ${DANGER}33` }}>
        <h2 style={{ ...sectionTitleStyle, color: DANGER, marginBottom: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>warning</span>
          {t('mypage.deleteAccount')}
        </h2>
        <p style={{ fontSize: '13px', color: C.muted, marginBottom: '16px', lineHeight: 1.5 }}>
          {t('mypage.deleteWarning')}
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: RAD,
              border: `1px solid ${DANGER}66`,
              background: 'transparent',
              color: DANGER,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('mypage.deleteAccountBtn')}
          </button>
        ) : (
          <div>
            <p style={{ fontSize: '13px', color: DANGER, marginBottom: '12px', fontWeight: 600 }}>
              {t('mypage.deleteConfirm')}
            </p>
            {deleteError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: RAD,
                background: `${DANGER}14`,
                border: `1px solid ${DANGER}44`,
                color: DANGER,
                fontSize: '13px',
                marginBottom: '12px',
              }}>
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: RAD,
                  border: `1px solid ${C.line}`,
                  background: 'transparent',
                  color: C.muted,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('mypage.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: RAD,
                  border: 'none',
                  background: deleteLoading ? C.muted : DANGER,
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {deleteLoading ? '...' : t('mypage.deleteConfirmBtn')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
