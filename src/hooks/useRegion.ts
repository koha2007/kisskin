import { useSyncExternalStore, useCallback } from 'react'
import { useI18n } from '../i18n/I18nContext'

// Where the reader intends to buy. Drives which merchant CTAs show:
//   'korea'  → Coupang + Clio (affiliate)
//   'global' → Amazon + YesStyle (plain search, not affiliate yet)
// The choice is persisted in localStorage so it carries across page loads.
export type Region = 'korea' | 'global'

const KEY = 'kisskin_region'
const EVENT = 'kisskin:region-change'

function readStored(): Region | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'korea' || v === 'global' ? v : null
  } catch {
    return null
  }
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}

// Shared region store backed by localStorage. useSyncExternalStore keeps SSR and
// the first client paint on `default` (locale-derived) — then, once mounted, it
// swaps to any persisted choice without a hydration warning.
export function useRegion(): [Region, (r: Region) => void] {
  const { locale } = useI18n()
  // Korean pages default to buying in Korea, English pages to buying globally.
  const fallback: Region = locale === 'en' ? 'global' : 'korea'

  const getSnapshot = useCallback((): Region => readStored() ?? fallback, [fallback])
  const getServerSnapshot = useCallback((): Region => fallback, [fallback])
  const region = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setRegion = useCallback((r: Region) => {
    try {
      localStorage.setItem(KEY, r)
    } catch {
      /* quota / unavailable */
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])

  return [region, setRegion]
}
