import { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n/I18nContext'
import { isNativeApp } from '../lib/nativePicker'

function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || navigator.vendor || ''
  return /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line|DaumApps|everytimeApp|SamsungBrowser\/(?![\d.]+\s)/i.test(ua)
    || (/wv\)/.test(ua) && /Android/.test(ua))
}

/**
 * 로그인 후 돌아갈 경로(?next=). 오픈 리다이렉트를 막기 위해 같은 사이트의
 * 절대경로만 허용한다("/analysis/" O · "//evil.com" X · "https://…" X).
 */
function safeNext(): string | null {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('next')
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

/**
 * 힐다 팔레트 토큰 (2026-07-23).
 * 이 페이지는 인라인 스타일 덩어리라 Tailwind 토큰(@theme)이 닿지 않는다.
 * 값을 흩뿌리지 않고 한 곳에 모아 index.css 의 @theme 과 1:1 로 대응시킨다.
 * 값이 바뀌면 index.css → 여기 순으로 같이 고칠 것.
 */
const C = {
  cream: '#f5efe3',
  surface: '#fffdf8',
  navy: '#232a52',
  muted: '#6b6f8c',
  line: 'rgba(35, 42, 82, 0.16)',
  primary: '#d8503c',
  primaryDark: '#b03e2d',
  mustard: '#c79340',
  sage: '#7e9b6a',
} as const

const R = { sm: '4px', md: '4px' } as const

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: R.sm,
  border: `1px solid ${C.line}`,
  background: '#fff',
  color: C.navy,
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: C.muted,
  marginBottom: '6px',
  fontWeight: 500,
}

interface AuthPageProps {
  onNavigate?: (page: 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth') => void
}

export default function AuthPage({ onNavigate }: AuthPageProps) {
  // 로그인 성공 시 원래 하던 자리로 복귀(예: AI 메이크업 도중 게이트에 걸린 경우).
  // next 가 없으면 기존대로 홈.
  const next = useMemo(() => safeNext(), [])

  const nav = (page: string) => {
    if (next) { window.location.href = next; return }
    const paths: Record<string, string> = { home: '/', analysis: '/analysis/', terms: '/terms/', privacy: '/privacy/', refund: '/refund/', contact: '/contact/', auth: '/auth/', mypage: '/mypage/' }
    if (onNavigate) onNavigate(page as 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact' | 'auth')
    else window.location.href = paths[page] || '/'
  }

  const { t, locale } = useI18n()
  const inApp = useMemo(() => isInAppBrowser(), [])
  // 우리 Expo 앱 웹뷰: "외부 브라우저로 열기"는 동작하지 않고(intent 미지원),
  // 동작해도 세션이 크롬에 생겨 앱은 비로그인 그대로라 안내 자체가 잘못이다.
  // → 앱에서는 이메일 로그인 안내만 보여준다. (UA 스푸핑된 새 APK 는 inApp
  //   판정 자체를 통과해 Google 버튼이 그대로 보인다)
  const nativeApp = useMemo(() => typeof window !== 'undefined' && isNativeApp(), [])
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (mode === 'forgot') {
      if (!email) { setError(t('auth.fillAll')); return }
      if (!emailRegex.test(email)) { setError(locale === 'ko' ? '올바른 이메일 형식을 입력해 주세요.' : 'Please enter a valid email address.'); return }
    } else {
      if (!email || !password) { setError(t('auth.fillAll')); return }
      if (!emailRegex.test(email)) { setError(locale === 'ko' ? '올바른 이메일 형식을 입력해 주세요.' : 'Please enter a valid email address.'); return }
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
          redirectTo: `${window.location.origin}/mypage/`,
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
            emailRedirectTo: `${window.location.origin}${next ?? '/'}`,
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
      background: C.cream,
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
        {/* 워드마크는 제목이 아니라 브랜드 록업이다 — 네비(ToolsLayout·HomePage)와 같은
            산세리프 볼드로 두고, t-h2(세리프) 를 쓰지 않는다 */}
        <span className="text-xl font-bold tracking-tight" style={{ color: C.navy }}>kissinskin</span>
      </div>

      {/* Auth Card */}
      <div style={{
        background: C.surface,
        borderRadius: R.md,
        padding: 'clamp(20px, 5vw, 32px)',
        width: '100%',
        maxWidth: '400px',
        border: `1px solid ${C.line}`,
      }}>
        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          background: C.cream,
          borderRadius: R.sm,
          padding: '4px',
          marginBottom: '24px',
        }}>
          <button
            onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: R.sm,
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: mode === 'login' ? C.navy : 'transparent',
              color: mode === 'login' ? '#fff' : C.muted,
            }}
          >
            {t('auth.login')}
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); setSuccess(null) }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: R.sm,
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: mode === 'signup' ? C.navy : 'transparent',
              color: mode === 'signup' ? '#fff' : C.muted,
            }}
          >
            {t('auth.signup')}
          </button>
        </div>

        {/* Important email notice */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          background: 'rgba(199, 147, 64, 0.12)',
          border: `1px solid ${C.mustard}55`,
          borderRadius: R.sm,
          padding: '12px 14px',
          marginBottom: '20px',
        }}>
          <span
            className="material-symbols-outlined"
            style={{ color: C.mustard, fontSize: '20px', lineHeight: 1.2, marginTop: '1px', flexShrink: 0 }}
            aria-hidden="true"
          >
            warning
          </span>
          <p style={{
            margin: 0,
            fontSize: '12.5px',
            lineHeight: 1.55,
            color: '#7a5a20',
            fontWeight: 500,
          }}>
            {t('auth.emailNotice')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={inputStyle}
            />
          </div>

          {mode !== 'forgot' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: R.sm,
              background: 'rgba(176, 62, 45, 0.1)',
              border: `1px solid ${C.primaryDark}44`,
              color: C.primaryDark,
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '10px 14px',
              borderRadius: R.sm,
              background: 'rgba(126, 155, 106, 0.14)',
              border: `1px solid ${C.sage}66`,
              color: '#4c6339',
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
              borderRadius: R.sm,
              border: 'none',
              background: loading ? C.muted : C.primary,
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
                color: C.muted,
                fontSize: '13px',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
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
                color: C.muted,
                fontSize: '13px',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
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
          <div style={{ flex: 1, height: '1px', background: C.line }} />
          <span className="t-eyebrow" style={{ color: C.muted }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: C.line }} />
        </div>}

        {/* Google Login - 비밀번호 찾기 모드에서는 숨김 */}
        {mode !== 'forgot' && (nativeApp && inApp ? (
          /* 우리 앱(구형 APK): 외부 브라우저 안내는 무의미 → 이메일 로그인 유도 */
          <div style={{
            padding: '14px',
            borderRadius: R.sm,
            background: C.cream,
            border: `1px solid ${C.line}`,
            textAlign: 'center',
          }}>
            <p style={{ color: C.muted, fontSize: '13px', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {t('auth.appUseEmail')}
            </p>
          </div>
        ) : inApp ? (
          /* 인앱 브라우저: Google OAuth 차단됨 → 외부 브라우저 안내 */
          <div style={{
            padding: '14px',
            borderRadius: R.sm,
            background: 'rgba(199, 147, 64, 0.12)',
            border: `1px solid ${C.mustard}55`,
            textAlign: 'center',
          }}>
            <p style={{ color: '#7a5a20', fontSize: '13px', margin: '0 0 12px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
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
                borderRadius: R.sm,
                border: 'none',
                background: C.primary,
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
                  redirectTo: `${window.location.origin}${next ?? '/'}`,
                },
              })
              if (error) setError(error.message)
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: R.sm,
              border: `1px solid ${C.line}`,
              background: '#fff',
              color: C.navy,
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
