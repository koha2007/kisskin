import { createContext, useContext } from 'react'
import type { Locale } from './types'

export interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

export const I18nContext = createContext<I18nContextType>({
  locale: 'ko',
  setLocale: () => {},
  t: (key) => key,
})

export function useI18n() {
  return useContext(I18nContext)
}

/** Inline locale-branched string. `pick(locale, koText, enText)`. */
export function pick<T>(locale: Locale, ko: T, en: T | undefined): T {
  if (locale === 'en' && en !== undefined) return en
  return ko
}
