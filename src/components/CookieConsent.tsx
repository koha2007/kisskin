import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'

const STORAGE_KEY = 'kissinskin_cookie_consent'

type Decision = 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function applyConsent(decision: Decision) {
  const w = window as Window
  w.dataLayer = w.dataLayer || []
  if (!w.gtag) {
    w.gtag = function gtag(...args: unknown[]) {
      ;(w.dataLayer as unknown[]).push(args)
    }
  }
  w.gtag('consent', 'update', {
    ad_storage: decision,
    ad_user_data: decision,
    ad_personalization: decision,
    analytics_storage: decision,
  })
}

export default function CookieConsent() {
  const { locale } = useI18n()
  const [visible, setVisible] = useState(false)
  const [details, setDetails] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      // localStorage may be blocked; show banner regardless
    }
    if (stored === 'granted' || stored === 'denied') {
      applyConsent(stored as Decision)
      return
    }
    const t = window.setTimeout(() => setVisible(true), 200)
    return () => window.clearTimeout(t)
  }, [])

  const decide = (decision: Decision) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, decision)
    } catch {
      // ignore quota / privacy mode failures
    }
    applyConsent(decision)
    setVisible(false)
  }

  if (!visible) return null

  const t =
    locale === 'ko'
      ? {
          title: '쿠키 사용 안내',
          body:
            '본 사이트는 서비스 개선과 광고 게재를 위해 Google AdSense, Google Analytics, Microsoft Clarity의 쿠키를 사용합니다. EU·영국 이용자는 동의 후에만 광고·분석 쿠키가 활성화됩니다.',
          accept: '모두 동의',
          deny: '필수만 허용',
          details: '자세히',
          link: '개인정보처리방침 보기',
          managed:
            '필수(보안·서비스 작동) 쿠키는 항상 사용됩니다. 광고/분석 쿠키는 동의 시에만 사용됩니다. 결정은 언제든 변경할 수 있으며, 브라우저의 쿠키를 삭제하면 다시 표시됩니다.',
        }
      : {
          title: 'Cookie notice',
          body:
            'We use cookies from Google AdSense, Google Analytics, and Microsoft Clarity to improve the service and serve ads. For EU/UK visitors, advertising and analytics cookies activate only after you consent.',
          accept: 'Accept all',
          deny: 'Essential only',
          details: 'Details',
          link: 'Read privacy policy',
          managed:
            'Strictly necessary (security and service) cookies are always on. Advertising/analytics cookies run only after you opt in. You can change this any time by clearing site cookies.',
        }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.title}
      className="fixed bottom-0 inset-x-0 z-[100] p-3 md:p-4 pointer-events-none"
    >
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] rounded-2xl p-4 md:p-5 pointer-events-auto">
        <div className="flex flex-col md:flex-row gap-4 md:items-start">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1.5">
              {t.title}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{t.body}</p>
            {details && (
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                {t.managed}
              </p>
            )}
            <div className="mt-2 text-xs">
              <a href="/privacy" className="text-navy underline hover:text-primary">
                {t.link}
              </a>
              <button
                type="button"
                onClick={() => setDetails((v) => !v)}
                className="ml-3 text-slate-500 hover:text-navy underline"
              >
                {t.details}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => decide('denied')}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-navy border border-slate-300 hover:border-navy rounded-full transition-colors"
            >
              {t.deny}
            </button>
            <button
              type="button"
              onClick={() => decide('granted')}
              className="px-4 py-2 text-sm font-semibold bg-navy text-white hover:bg-navy-mid rounded-full transition-colors"
            >
              {t.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
