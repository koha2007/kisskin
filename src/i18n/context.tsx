import { useSyncExternalStore, useEffect, useCallback, type ReactNode } from 'react'
import type { Locale } from './types'
import ko from './ko'
import en from './en'
import { I18nContext } from './I18nContext'

const dictionaries: Record<Locale, Record<string, string>> = { ko, en }
const LOCALE_EVENT = 'kisskin:locale-change'

function localeFromPath(pathname: string): Locale | null {
  if (pathname === '/en' || pathname === '/en/' || pathname.startsWith('/en/')) return 'en'
  return null
}

function readLocale(): Locale {
  // URL prefix wins — `/en/...` is canonical English.
  const fromUrl = localeFromPath(window.location.pathname)
  if (fromUrl) return fromUrl
  try {
    const saved = localStorage.getItem('kisskin_locale') as Locale | null
    if (saved === 'ko' || saved === 'en') return saved
    const lang = navigator.language || ''
    return lang.startsWith('ko') ? 'ko' : 'en'
  } catch {
    return 'ko'
  }
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(LOCALE_EVENT, cb)
  window.addEventListener('popstate', cb)
  return () => {
    window.removeEventListener(LOCALE_EVENT, cb)
    window.removeEventListener('popstate', cb)
  }
}

// Paths that have a real prerendered English version under /en/...
// Any other URL falls back to the English home when the user toggles to EN.
const EN_AVAILABLE_PATHS = new Set<string>([
  '/',
  '/about/',
  '/about-makeup-ai/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/refund/',
  '/tools/face-shape/',
  '/tools/face-shape/oval/',
  '/tools/face-shape/round/',
  '/tools/face-shape/square/',
  '/tools/face-shape/oblong/',
  '/tools/face-shape/heart/',
  '/tools/personal-color/',
  '/tools/personal-color/spring-warm/',
  '/tools/personal-color/summer-cool/',
  '/tools/personal-color/autumn-warm/',
  '/tools/personal-color/winter-cool/',
  '/tools/makeup-mbti/',
])

function normalize(p: string): string {
  if (!p) return '/'
  return p.endsWith('/') ? p : p + '/'
}

function alternateUrl(currentPath: string, target: Locale): string {
  if (target === 'en') {
    if (currentPath === '/' || currentPath === '') return '/en/'
    if (currentPath.startsWith('/en/') || currentPath === '/en') return currentPath
    const normalized = normalize(currentPath)
    if (EN_AVAILABLE_PATHS.has(normalized)) {
      return `/en${normalized}`
    }
    // No translated version yet — send the user to the English home.
    return '/en/'
  }
  // target === 'ko'
  if (currentPath === '/en' || currentPath === '/en/') return '/'
  if (currentPath.startsWith('/en/')) return currentPath.replace(/^\/en/, '') || '/'
  return currentPath
}

export function I18nProvider({ children, initialLocale = 'ko' }: { children: ReactNode; initialLocale?: Locale }) {
  // SSR/prerender has no window — the locale is derived from the route URL by the
  // layout (which passes initialLocale), so /en/* pages render English HTML instead
  // of Korean. On the client, readLocale (URL prefix wins) returns the same value,
  // so hydration matches with no flash. Non-/en/ paths stay 'ko' (Korean unaffected).
  const getServerSnapshot = useCallback((): Locale => initialLocale, [initialLocale])
  const locale = useSyncExternalStore(subscribe, readLocale, getServerSnapshot)

  const setLocale = useCallback((l: Locale) => {
    try { localStorage.setItem('kisskin_locale', l) } catch { /* quota / unavailable */ }
    const target = alternateUrl(window.location.pathname, l)
    if (target !== window.location.pathname) {
      window.location.href = target + window.location.search + window.location.hash
      return
    }
    window.dispatchEvent(new Event(LOCALE_EVENT))
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = (key: string): string => {
    const dict = dictionaries[locale]
    // Use the active-locale value whenever the key exists — even if it's an empty
    // string, which is an intentional, valid translation (e.g. an English heading
    // that needs no prefix). Only fall back to Korean when the key is genuinely
    // absent, so '' in en.ts no longer leaks the Korean value onto /en/ pages.
    if (key in dict) return dict[key]
    return key in dictionaries.ko ? dictionaries.ko[key] : key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}
