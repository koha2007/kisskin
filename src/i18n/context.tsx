import { useSyncExternalStore, useEffect, useCallback, type ReactNode } from 'react'
import type { Locale } from './types'
import ko from './ko'
import en from './en'
import { I18nContext } from './I18nContext'
import { readLocale, localeFromPath, normalize, isAppRoute } from './readLocale'
import { alternateUrl, hasEnglishVersion } from './alternateUrl'

const dictionaries: Record<Locale, Record<string, string>> = { ko, en }
const LOCALE_EVENT = 'kisskin:locale-change'
// Scroll position stashed right before a locale toggle navigates to the
// other-language URL, so the new page can restore it (see setLocale + effect).
const SCROLL_RESTORE_KEY = 'kisskin_scroll_restore'

function subscribe(cb: () => void): () => void {
  window.addEventListener(LOCALE_EVENT, cb)
  window.addEventListener('popstate', cb)
  return () => {
    window.removeEventListener(LOCALE_EVENT, cb)
    window.removeEventListener('popstate', cb)
  }
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
      // 번역이 없어 허브로 가는 경우는 다른 페이지라 위치를 잇지 않는다.
      const samePage = normalize(target).replace(/^\/en\//, '/') === normalize(window.location.pathname).replace(/^\/en\//, '/')
      if (samePage) {
        try { sessionStorage.setItem(SCROLL_RESTORE_KEY, String(window.scrollY)) } catch { /* unavailable */ }
      }
      window.location.href = target + window.location.search
      return
    }
    window.dispatchEvent(new Event(LOCALE_EVENT))
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // 저장된 'en' 선호를 가진 재방문자가 한글 URL로 들어왔을 때 — 내용을 그 자리에서
  // 영어로 바꾸는 대신(그게 위 readLocale 주석의 SEO 모순을 만들었다) **진짜 영문
  // URL로 보낸다.** 내용과 URL이 늘 일치하고, 그 사람은 매번 다시 토글할 필요가 없다.
  // 크롤러는 localStorage 가 없으니 절대 타지 않는다 → 한글 URL은 크롤러에게
  // 리다이렉트 없이 그대로 한글로 남는다.
  // 목적지는 `/en/` 프리픽스라 도착 즉시 readLocale 이 'en' 을 돌려주고 멈춘다(루프 없음).
  useEffect(() => {
    const path = window.location.pathname
    if (localeFromPath(path) || isAppRoute(normalize(path))) return
    let saved: string | null = null
    try { saved = localStorage.getItem('kisskin_locale') } catch { /* unavailable */ }
    if (saved !== 'en') return
    // 일대일 영문 쌍둥이가 있을 때만 보낸다. `alternateUrl` 의 허브 폴백까지 태우면
    // 영어 선호 재방문자가 **번역 안 된 한글 글**을 클릭했을 때 글은 못 보고
    // /en/guides/ 로 튕겨 나간다. 쌍둥이가 없으면 그냥 그 한글 글에 머문다.
    const normalized = normalize(path)
    if (!hasEnglishVersion(normalized)) return
    const target = alternateUrl(path, 'en')
    // hash 도 넘긴다 — 소셜 로그인 복귀의 #access_token 이 잘리면 로그인이 풀린다.
    if (target !== path) window.location.replace(target + window.location.search + window.location.hash)
  }, [])

  // After a locale toggle reloads the other-language URL, restore the scroll
  // position saved just before the jump so the view stays put. Runs once on mount.
  useEffect(() => {
    let saved: string | null = null
    try { saved = sessionStorage.getItem(SCROLL_RESTORE_KEY) } catch { /* unavailable */ }
    if (saved === null) return
    try { sessionStorage.removeItem(SCROLL_RESTORE_KEY) } catch { /* ignore */ }
    const y = Number.parseInt(saved, 10)
    if (Number.isNaN(y)) return
    // 전역 scroll-behavior: smooth 를 타지 않게 한다 — 새 페이지가 열리며 스르륵 내려가는 모습이 보이지 않도록.
    const restore = () => window.scrollTo({ top: y, behavior: 'instant' })
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
