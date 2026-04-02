import { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n/context'

function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || navigator.vendor || ''
  return /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line|DaumApps|everytimeApp|SamsungBrowser\/(?![\d.]+\s)/i.test(ua)
    || (/wv\)/.test(ua) && /Android/.test(ua))
}

interface AuthPageProps {
  onNavigate?: (page: 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth') => void
}

export default function AuthPage({ onNavigate }: AuthPageProps) {
  const nav = (page: string) => {
    const paths: Record<string, string> = { home: '/', analysis: '/analysis', terms: '/terms', privacy: '/privacy', refund: '/refund', contact: '/contact', auth: '/auth', mypage: '/mypage' }
    if (onNavigate) onNavigate(page as 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth')
    else window.location.href = paths[page] || '/'
  }

  const { t } = useI18n()
  const inApp = useMemo(() => isInAppBrowser(), [])
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (mode === 'forgot') {
      if (!email) { setError(t('auth.fillAll')); return }
    } else {
      if (!email || !password) { setError(t('auth.fillAll')); return }
      if (mode === 'signup' && password !== confirmPassword) { setError(t('auth.passwordMismatch')); return }
      if (password.length < 6) { setError(t('auth.passwordMin')); return }
    }

    setLoading(true)
    try {
      if (mode === 'forgot') {
        if (!email) {
          setError(t('auth.fillAll'))
          setLoading(false)
          return
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/mypage`,
        })
        if (error) throw error
        setSuccess(t('auth.resetEmailSent'))
        setLoading(false)
        return
      }
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        })
        if (error) throw error
        // Supabase는 이미 존재하는 이메일에 에러 없이 빈 session을 반환할 수 있음
        if (data.user && !data.session) {
          // 이메일 확인이 필요한 경우
          setSuccess(t('auth.signupSuccess'))
        } else if (data.session) {
          // 이메일 확인 없이 바로 로그인된 경우
          nav('home')
        } else {
          setError(t('auth.fillAll'))
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        nav('home')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #070953 0%, #121570 50%, #070953 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
    }}>
      {/* Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', cursor: 'pointer' }}
        onClick={() => nav('home')}
      >
        <img src="/logo.png" alt="kissinskin" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>kissinskin</span>
      </div>

      {/* Auth Card */}
      <div style={{
        background: 'rgba(18, 21, 112, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: 'clamp(20px, 5vw, 32px)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}>
        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(7, 9, 83, 0.6)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '24px',
        }}>
          <button
            onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: mode === 'login' ? 'linear-gradient(135deg, #ec4899, #f472b6)' : 'transparent',
              color: mode === 'login' ? '#fff' : '#94a3b8',
            }}
          >
            {t('auth.login')}
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); setSuccess(null) }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: mode === 'signup' ? 'linear-gradient(135deg, #ec4899, #f472b6)' : 'transparent',
              color: mode === 'signup' ? '#fff' : '#94a3b8',
            }}
          >
            {t('auth.signup')}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(7, 9, 83, 0.6)',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {mode !== 'forgot' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: 'rgba(7, 9, 83, 0.6)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: 'rgba(7, 9, 83, 0.6)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#86efac',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: loading ? '#64748b' : 'linear-gradient(135deg, #ec4899, #f472b6)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '...' : mode === 'forgot' ? t('auth.resetBtn') : mode === 'login' ? t('auth.loginBtn') : t('auth.signupBtn')}
          </button>

          {/* 비밀번호 찾기 / 로그인으로 돌아가기 */}
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(null); setSuccess(null) }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '12px',
                width: '100%',
                textAlign: 'center',
              }}
            >
              {t('auth.forgotPassword')}
            </button>
          )}
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '12px',
                width: '100%',
                textAlign: 'center',
              }}
            >
              {t('auth.backToLogin')}
            </button>
          )}
        </form>

        {/* Divider - 비밀번호 찾기 모드에서는 숨김 */}
        {mode !== 'forgot' && <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '20px 0',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.3)' }} />
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.3)' }} />
        </div>}

        {/* Google Login - 비밀번호 찾기 모드에서는 숨김 */}
        {mode !== 'forgot' && (inApp ? (
          /* 인앱 브라우저: Google OAuth 차단됨 → 외부 브라우저 안내 */
          <div style={{
            padding: '14px',
            borderRadius: '10px',
            background: 'rgba(251, 191, 36, 0.12)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            textAlign: 'center',
          }}>
            <p style={{ color: '#fbbf24', fontSize: '13px', margin: '0 0 12px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {t('auth.inAppBrowser')}
            </p>
            <button
              onClick={() => {
                const url = window.location.href
                // Android intent로 외부 브라우저 열기 시도
                if (/Android/i.test(navigator.userAgent)) {
                  window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`
                  return
                }
                // iOS / 기타: URL 복사
                navigator.clipboard.writeText(url).then(() => {
                  setSuccess(t('auth.urlCopied'))
                }).catch(() => {
                  // clipboard 실패 시 prompt fallback
                  window.prompt('URL:', url)
                })
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {/Android/i.test(navigator.userAgent) ? t('auth.openExternal') : t('auth.copyUrl')}
            </button>
          </div>
        ) : (
          <button
            onClick={async () => {
              setError(null)
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/`,
                },
              })
              if (error) setError(error.message)
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: '#fff',
              color: '#333',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google {mode === 'login' ? t('auth.login') : t('auth.signup')}
          </button>
        ))}
      </div>
    </div>
  )
}
