import { useSyncExternalStore, useEffect, useCallback, type ReactNode } from 'react'
import type { Locale } from './types'
import ko from './ko'
import en from './en'
import { I18nContext } from './I18nContext'

const dictionaries: Record<Locale, Record<string, string>> = { ko, en }
const LOCALE_EVENT = 'kisskin:locale-change'

function readLocale(): Locale {
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
  return () => window.removeEventListener(LOCALE_EVENT, cb)
}

// SSR/pre-render fallback — must match the initial client render when no
// saved preference exists. If a user had 'en' saved, the store will swap
// locally after hydration; React accepts a one-time subscription refresh.
function getServerSnapshot(): Locale {
  return 'ko'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, getServerSnapshot)

  const setLocale = useCallback((l: Locale) => {
    try { localStorage.setItem('kisskin_locale', l) } catch { /* quota / unavailable */ }
    window.dispatchEvent(new Event(LOCALE_EVENT))
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = (key: string): string =>
    dictionaries[locale][key] || dictionaries['ko'][key] || key

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}
