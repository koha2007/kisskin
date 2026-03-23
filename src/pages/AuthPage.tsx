import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n/context'

interface AuthPageProps {
  onNavigate: (page: 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth') => void
}

export default function AuthPage({ onNavigate }: AuthPageProps) {
  const { t } = useI18n()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
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

    if (!email || !password) {
      setError(t('auth.fillAll'))
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('auth.passwordMin'))
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess(t('auth.signupSuccess'))
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onNavigate('home')
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
        onClick={() => onNavigate('home')}
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
            {loading ? '...' : mode === 'login' ? t('auth.loginBtn') : t('auth.signupBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}
