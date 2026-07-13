import { useSyncExternalStore, useEffect, useCallback, type ReactNode } from 'react'
import type { Locale } from './types'
import ko from './ko'
import en from './en'
import { I18nContext } from './I18nContext'
import { EN_GUIDE_SLUG_SET } from '../lib/guides/enSlugs'
import { EN_ONLY_GUIDE_SLUG_SET } from '../lib/guides/enOnlySlugs'
import { EN_REVIEW_SLUG_SET } from '../lib/reviews/enSlugs'
import { EN_NEWS_SLUG_SET } from '../lib/news/enSlugs'

const dictionaries: Record<Locale, Record<string, string>> = { ko, en }
const LOCALE_EVENT = 'kisskin:locale-change'
// Scroll position stashed right before a locale toggle navigates to the
// other-language URL, so the new page can restore it (see setLocale + effect).
const SCROLL_RESTORE_KEY = 'kisskin_scroll_restore'

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

// Standalone pages that have a real prerendered English version under /en/...
// (non-tool pages — home, legal, about). Tool pages are matched by prefix below.
const EN_AVAILABLE_PATHS = new Set<string>([
  '/',
  '/about/',
  '/about-makeup-ai/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/refund/',
  '/guides/',
  '/reviews/',
  '/news/',
])

// Tool families that have a complete English mirror under /en/tools/<tool>/...
// — the intro page plus every result/type sub-page. Because the EN side
// prerenders the exact same slug set as KO, any sub-path the user can actually
// be on (e.g. /tools/face-shape/oval/) has a matching English page. So we can
// map these by prefix instead of enumerating every slug, which keeps the
// toggle landing on the *same* page in the other language rather than the
// English home — and stays correct automatically as new type pages are added.
const EN_MIRRORED_TOOL_PREFIXES = [
  '/tools/face-shape/',
  '/tools/personal-color/',
  '/tools/makeup-mbti/',
  '/tools/perfume-type/',
]

function normalize(p: string): string {
  if (!p) return '/'
  return p.endsWith('/') ? p : p + '/'
}

// Individual guide/review/news articles with a hand-written English version.
// The hubs are in EN_AVAILABLE_PATHS; only the translated slugs map one-to-one
// (others fall back to the matching English hub — see alternateUrl below).
function isTranslatedArticlePath(normalizedPath: string): boolean {
  const guide = normalizedPath.match(/^\/guides\/([^/]+)\/$/)
  if (guide) return EN_GUIDE_SLUG_SET.has(guide[1])
  const review = normalizedPath.match(/^\/reviews\/([^/]+)\/$/)
  if (review) return EN_REVIEW_SLUG_SET.has(review[1])
  const news = normalizedPath.match(/^\/news\/([^/]+)\/$/)
  if (news) return EN_NEWS_SLUG_SET.has(news[1])
  return false
}

function hasEnglishVersion(normalizedPath: string): boolean {
  if (EN_AVAILABLE_PATHS.has(normalizedPath)) return true
  if (isTranslatedArticlePath(normalizedPath)) return true
  return EN_MIRRORED_TOOL_PREFIXES.some(prefix => normalizedPath.startsWith(prefix))
}

// An untranslated article still has a relevant English landing — its hub.
function sectionHubFallback(normalizedPath: string): string | null {
  if (normalizedPath.startsWith('/guides/')) return '/en/guides/'
  if (normalizedPath.startsWith('/reviews/')) return '/en/reviews/'
  if (normalizedPath.startsWith('/news/')) return '/en/news/'
  return null
}

function alternateUrl(currentPath: string, target: Locale): string {
  if (target === 'en') {
    if (currentPath === '/' || currentPath === '') return '/en/'
    if (currentPath.startsWith('/en/') || currentPath === '/en') return currentPath
    const normalized = normalize(currentPath)
    if (hasEnglishVersion(normalized)) {
      return `/en${normalized}`
    }
    const hub = sectionHubFallback(normalized)
    if (hub) return hub
    // No translated version yet — send the user to the English home.
    return '/en/'
  }
  // target === 'ko'
  if (currentPath === '/en' || currentPath === '/en/') return '/'
  if (currentPath.startsWith('/en/')) {
    // English originals have no Korean twin — stripping /en would land on a 404.
    // Send the reader to the Korean guides hub instead.
    const enGuide = normalize(currentPath).match(/^\/en\/guides\/([^/]+)\/$/)
    if (enGuide && EN_ONLY_GUIDE_SLUG_SET.has(enGuide[1])) return '/guides/'
    return currentPath.replace(/^\/en/, '') || '/'
  }
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
      // Preserve the reader's scroll position across the full-page locale switch
      // so they stay where they were instead of snapping to the top. Drop any
      // #hash too, so the browser doesn't re-jump to an anchor (e.g. the tools
      // section) and fight the restore below.
      try { sessionStorage.setItem(SCROLL_RESTORE_KEY, String(window.scrollY)) } catch { /* unavailable */ }
      window.location.href = target + window.location.search
      return
    }
    window.dispatchEvent(new Event(LOCALE_EVENT))
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // After a locale toggle reloads the other-language URL, restore the scroll
  // position saved just before the jump so the view stays put. Runs once on mount.
  useEffect(() => {
    let saved: string | null = null
    try { saved = sessionStorage.getItem(SCROLL_RESTORE_KEY) } catch { /* unavailable */ }
    if (saved === null) return
    try { sessionStorage.removeItem(SCROLL_RESTORE_KEY) } catch { /* ignore */ }
    const y = Number.parseInt(saved, 10)
    if (Number.isNaN(y)) return
    const restore = () => window.scrollTo(0, y)
    // Take over from the browser's own restore, then re-apply across a couple of
    // frames so late layout shifts (images/fonts) don't leave us short.
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual' } catch { /* ignore */ }
    requestAnimationFrame(restore)
    const t1 = window.setTimeout(restore, 150)
    return () => window.clearTimeout(t1)
  }, [])

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
