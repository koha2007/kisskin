import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'

const STORAGE_KEY = 'kissinskin_cookie_consent'

type Decision = 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] }
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
  // Clarity 는 GA4 동의 신호를 읽지 않는다 — 따로 넘겨야 "필수만 허용"이 Clarity 에도 먹힌다.
  // 스크립트가 아직 안 떴을 수 있으니 Clarity 공식 스텁과 같은 큐에 넣어 둔다(로드되면 처리).
  type ClarityFn = NonNullable<Window['clarity']>
  const clarity: ClarityFn =
    w.clarity ||
    (w.clarity = ((...args: unknown[]) => {
      ;(clarity.q = clarity.q || []).push(args)
    }) as ClarityFn)
  clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: decision })
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
          body: '서비스 개선을 위해 분석 쿠키(Google Analytics·Clarity)를 사용합니다.',
          accept: '모두 동의',
          deny: '필수만 허용',
          details: '자세히',
          link: '개인정보처리방침 보기',
          managed:
            'EU·영국·스위스 이용자는 동의 후에만 분석 쿠키가 켜집니다. 그 밖의 지역은 "필수만 허용"을 누르면 꺼집니다. 필수(보안·서비스 작동) 쿠키는 항상 사용됩니다. 결정은 언제든 변경할 수 있으며, 브라우저의 쿠키를 삭제하면 다시 표시됩니다.',
        }
      : {
          title: 'Cookie notice',
          body: 'We use analytics cookies (Google Analytics, Clarity) to improve the service.',
          accept: 'Accept all',
          deny: 'Essential only',
          details: 'Details',
          link: 'Read privacy policy',
          managed:
            'In the EU, UK and Switzerland, analytics cookies run only after you opt in. Elsewhere, "Essential only" turns them off. Strictly necessary (security and service) cookies are always on. You can change this any time by clearing site cookies.',
        }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.title}
      className="fixed bottom-0 inset-x-0 z-[100] p-2 md:p-4 pointer-events-none"
    >
      {/* 2026-09-26 압축: 390×844 첫 화면의 약 25%(210px)를 덮고 있었다. 방문의 90%가 신규라
          거의 모든 첫 화면이 이 배너 차지였다 — 네이버에서 제품명으로 검색해 온 사람은
          제품명·구매 버튼 대신 이걸 봤다. EU 밖은 기본 허용이라 여기선 안내 역할이 크다. */}
      <div className="max-w-3xl mx-auto bg-[#fffdf8] border border-navy/15 shadow-[0_-4px_24px_rgba(35,42,82,0.10)] rounded px-3 py-2.5 md:p-4 pointer-events-auto">
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
          <div className="flex-1 min-w-0">
            <div className="sr-only">{t.title}</div>
            <p className="text-[13px] md:text-sm text-slate-700 leading-snug">{t.body}</p>
            {details && (
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                {t.managed}
              </p>
            )}
            <div className="mt-1 text-xs">
              <a href="/privacy/" className="text-navy underline hover:text-primary">
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
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => decide('denied')}
              className="px-3 py-1.5 text-[13px] font-semibold text-slate-700 hover:text-navy border border-navy/20 hover:border-navy rounded transition-colors"
            >
              {t.deny}
            </button>
            <button
              type="button"
              onClick={() => decide('granted')}
              className="px-3 py-1.5 text-[13px] font-semibold bg-navy text-white hover:bg-navy-mid rounded transition-colors"
            >
              {t.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
