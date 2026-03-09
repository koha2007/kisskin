import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Locale } from './types'
import ko from './ko'
import en from './en'

const dictionaries: Record<Locale, Record<string, string>> = { ko, en }

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: 'ko',
  setLocale: () => {},
  t: (key) => key,
})

function detectLocale(): Locale {
  const saved = localStorage.getItem('kisskin_locale') as Locale | null
  if (saved && (saved === 'ko' || saved === 'en')) return saved
  const lang = navigator.language || ''
  return lang.startsWith('ko') ? 'ko' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('kisskin_locale', l)
  }

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = (key: string): string => {
    return dictionaries[locale][key] || dictionaries['ko'][key] || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
