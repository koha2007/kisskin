import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n/context'

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
  onNavigate: (page: 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth' | 'mypage') => void
  user: { id?: string; email?: string; app_metadata?: { provider?: string } } | null
  onLogout: () => void
  subStatus: SubStatus
  onCheckout: (type: 'one-time' | 'subscription') => void
}

export default function MyPage({ onNavigate, user, onLogout, subStatus, onCheckout }: MyPageProps) {
  const { t, locale } = useI18n()
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

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
    setDeleteError(null)
    setDeleteLoading(true)
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete account')
      }
      await supabase.auth.signOut({ scope: 'local' })
      onLogout()
      onNavigate('home')
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
    borderRadius: '10px',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    background: 'rgba(7, 9, 83, 0.6)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(18, 21, 112, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 24px)',
    width: '100%',
    maxWidth: '440px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    marginBottom: '16px',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px', color: '#94a3b8',
  }

  const valueStyle: React.CSSProperties = {
    fontSize: '14px', color: '#fff', margin: '4px 0 0',
  }

  // Subscription info
  const planName = !subStatus.active
    ? (isKo ? '무료 / 건별 결제' : 'Free / Pay-per-analysis')
    : subStatus.status === 'trialing'
      ? (isKo ? '무료 체험 (Trial)' : 'Free Trial')
      : (isKo ? 'Pro 구독' : 'Pro Subscription')

  const planColor = !subStatus.active ? '#94a3b8'
    : subStatus.status === 'trialing' ? '#fbbf24' : '#34d399'

  const usageText = subStatus.limit === -1
    ? `${subStatus.usage} / ${isKo ? '무제한' : 'Unlimited'}`
    : `${subStatus.usage} / ${subStatus.limit}`

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #070953 0%, #121570 50%, #070953 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 16px',
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => onNavigate('home')}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>{t('mypage.title')}</h1>
      </div>

      {/* 내 정보 */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f472b6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      {/* 구독 관리 */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f472b6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '13px',
              fontWeight: 700,
            }}>
              {planName}
            </span>
            {subStatus.cancelAtPeriodEnd && (
              <span style={{
                fontSize: '12px',
                color: '#fbbf24',
                background: 'rgba(251, 191, 36, 0.15)',
                borderRadius: '20px',
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
                <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{usageText}</span>
              </div>
              {subStatus.limit > 0 && (
                <div style={{
                  width: '100%', height: '6px', borderRadius: '3px',
                  background: 'rgba(148, 163, 184, 0.2)',
                }}>
                  <div style={{
                    width: `${Math.min(100, (subStatus.usage / subStatus.limit) * 100)}%`,
                    height: '100%', borderRadius: '3px',
                    background: subStatus.usage >= subStatus.limit
                      ? 'linear-gradient(90deg, #ef4444, #f87171)'
                      : 'linear-gradient(90deg, #34d399, #6ee7b7)',
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

        {/* 액션 버튼 */}
        {!subStatus.active && (
          <button
            onClick={() => onCheckout('subscription')}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #ec4899, #f472b6)',
              color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              marginBottom: '8px',
            }}
          >
            {isKo ? '구독하기 — $9.88/월' : 'Subscribe — $9.88/mo'}
          </button>
        )}

        {subStatus.active && !subStatus.cancelAtPeriodEnd && (
          <>
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '10px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: 'transparent', color: '#94a3b8',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {isKo ? '구독 해지' : 'Cancel Subscription'}
              </button>
            ) : (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                borderRadius: '12px', padding: '16px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                <p style={{ fontSize: '13px', color: '#fca5a5', marginBottom: '12px', lineHeight: 1.5 }}>
                  {isKo
                    ? `구독을 해지하면 ${subStatus.periodEnd ? formatDate(subStatus.periodEnd) : ''} 이후 서비스를 이용할 수 없습니다. 그때까지는 정상 이용 가능합니다.`
                    : `After cancellation, your access will end on ${subStatus.periodEnd ? formatDate(subStatus.periodEnd) : ''}. You can continue using the service until then.`}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      background: 'transparent', color: '#94a3b8',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {t('mypage.cancel')}
                  </button>
                  <button
                    onClick={() => {
                      // Polar customer portal for cancellation
                      window.open('https://polar.sh/kissinskin/portal', '_blank')
                      setShowCancelConfirm(false)
                    }}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px',
                      border: 'none', background: '#ef4444', color: '#fff',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {isKo ? '해지하기' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {subStatus.active && subStatus.cancelAtPeriodEnd && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)', borderRadius: '10px',
            padding: '12px 14px', border: '1px solid rgba(251, 191, 36, 0.2)',
          }}>
            <p style={{ fontSize: '13px', color: '#fbbf24', margin: 0, lineHeight: 1.5 }}>
              {isKo
                ? `구독이 ${subStatus.periodEnd ? formatDate(subStatus.periodEnd) : ''} 에 만료됩니다. 그 전에 다시 구독하시면 연속으로 이용 가능합니다.`
                : `Your subscription expires on ${subStatus.periodEnd ? formatDate(subStatus.periodEnd) : ''}. Resubscribe before then to continue.`}
            </p>
          </div>
        )}
      </div>

      {/* 결제 내역 */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f472b6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>receipt_long</span>
          {isKo ? '결제 내역' : 'Payment History'}
        </h2>

        {ordersLoading ? (
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>{isKo ? '불러오는 중...' : 'Loading...'}</p>
        ) : orders.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#64748b' }}>{isKo ? '결제 내역이 없습니다.' : 'No payment history.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {orders.map(order => (
              <div
                key={order.polar_order_id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: '10px',
                  background: 'rgba(7, 9, 83, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                }}
              >
                <div>
                  <p style={{ fontSize: '13px', color: '#fff', margin: 0, fontWeight: 600 }}>
                    ${(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
                  </p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  color: order.status === 'refunded' ? '#fbbf24' : '#34d399',
                  background: order.status === 'refunded' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                  borderRadius: '20px', padding: '3px 10px',
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
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f472b6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock_reset</span>
            {t('mypage.changePassword')}
          </h2>
          <form onSubmit={handlePasswordReset}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
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
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
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
                borderRadius: '8px',
                background: passwordMsg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${passwordMsg.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: passwordMsg.type === 'success' ? '#86efac' : '#fca5a5',
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
                borderRadius: '10px',
                border: 'none',
                background: passwordLoading ? '#64748b' : 'linear-gradient(135deg, #ec4899, #f472b6)',
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
          onClick={() => { onLogout(); onNavigate('home') }}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'transparent',
            color: '#94a3b8',
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
      <div style={{ ...cardStyle, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#ef4444', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>warning</span>
          {t('mypage.deleteAccount')}
        </h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
          {t('mypage.deleteWarning')}
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'transparent',
              color: '#f87171',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('mypage.deleteAccountBtn')}
          </button>
        ) : (
          <div>
            <p style={{ fontSize: '13px', color: '#fca5a5', marginBottom: '12px', fontWeight: 600 }}>
              {t('mypage.deleteConfirm')}
            </p>
            {deleteError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
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
                  borderRadius: '10px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: 'transparent',
                  color: '#94a3b8',
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
                  borderRadius: '10px',
                  border: 'none',
                  background: deleteLoading ? '#64748b' : '#ef4444',
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
