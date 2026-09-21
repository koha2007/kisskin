// URL·저장된 선호로 현재 언어를 정하는 규칙. context.tsx 에서 떼어 냈다 —
// 프로바이더 파일이 컴포넌트 외의 것을 export 하면 Fast Refresh 가 깨지고,
// 이 규칙은 컴포넌트 밖(lib/userLocale.ts)에서도 필요하다.
import type { Locale } from './types'

export function normalize(p: string): string {
  if (!p) return '/'
  return p.endsWith('/') ? p : p + '/'
}

export function localeFromPath(pathname: string): Locale | null {
  if (pathname === '/en' || pathname === '/en/' || pathname.startsWith('/en/')) return 'en'
  return null
}

// Interactive app routes — the only pages with no prerendered English twin.
// Here the browser's language is all we have to go on, so the fallback below
// still applies. Every *other* non-/en/ path is a page we prerendered as
// Korean, and the URL decides its language.
const APP_ROUTE_PREFIXES = ['/analysis/', '/auth/', '/mypage/', '/result/', '/maketest/']

export function isAppRoute(normalizedPath: string): boolean {
  return APP_ROUTE_PREFIXES.some(prefix => normalizedPath.startsWith(prefix))
}

export function readLocale(): Locale {
  // URL prefix wins — `/en/...` is canonical English.
  const path = window.location.pathname
  const fromUrl = localeFromPath(path)
  if (fromUrl) return fromUrl

  // ⚠️ 2026-07-26: 여기서 navigator.language 로 폴백하면 **한글 URL이 영어로
  // 렌더된다.** `/tools/face-shape/oval/` 은 한글 HTML 로 프리렌더되는데,
  // 브라우저 로케일이 한국어가 아니면 하이드레이션 직후 영어로 갈아엎히고
  // `<html lang>` 까지 en 이 됐다(canonical 은 한글 URL 그대로). useSyncExternalStore
  // 라 하이드레이션 경고도 안 떠서 오래 안 보였다.
  // Googlebot 렌더러는 en-US 다 → 구글에겐 한글 URL과 `/en/` URL이 같은 영어
  // 문서로 보이는데 hreflang 은 둘을 ko/en 짝이라고 선언하는 모순이 생긴다.
  // 그래서 프리렌더된 콘텐츠 경로에서는 **URL이 유일한 기준**이다.
  // 저장된 'en' 선호는 여기서 무시하고, 아래 useEffect 가 진짜 `/en/` URL로
  // 보내 준다 — 내용과 URL이 어긋나지 않게.
  if (!isAppRoute(normalize(path))) return 'ko'

  try {
    const saved = localStorage.getItem('kisskin_locale') as Locale | null
    if (saved === 'ko' || saved === 'en') return saved
    const lang = navigator.language || ''
    return lang.startsWith('ko') ? 'ko' : 'en'
  } catch {
    return 'ko'
  }
}
