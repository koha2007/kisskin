// 언어를 바꿀 때 어느 주소로 갈지 정하는 규칙. context.tsx(토글)와 푸터 링크가 같이 쓴다.
//
// ⚠ 2026-11-05: 전에는 "영문판이 있는 경로" 허용 목록이었다. 목록에 없는 /looks/·/class/·/makeup/·
//   /products/<slug>/·/tools/beauty-dna/ 는 영문판이 멀쩡히 있는데도 언어를 바꾸면 영문 홈으로
//   튕겼다. 섹션을 추가할 때마다 빠뜨리기 쉬워서, 기본을 "같은 경로의 영문판"으로 뒤집고
//   영문판이 없는 경우만 아래에 적는다.
import type { Locale } from './types'
import { isAppRoute, normalize } from './readLocale'
import { EN_GUIDE_SLUG_SET } from '../lib/guides/enSlugs'
import { EN_ONLY_GUIDE_SLUG_SET } from '../lib/guides/enOnlySlugs'
import { EN_REVIEW_SLUG_SET } from '../lib/reviews/enSlugs'
import { EN_NEWS_SLUG_SET } from '../lib/news/enSlugs'

// 글은 슬러그마다 번역 여부가 다르다. 번역이 없는 글은 같은 섹션의 영문 허브로 보낸다.
const ARTICLE_SECTIONS = [
  { pattern: /^\/guides\/([^/]+)\/$/, slugs: EN_GUIDE_SLUG_SET, hub: '/en/guides/' },
  { pattern: /^\/reviews\/([^/]+)\/$/, slugs: EN_REVIEW_SLUG_SET, hub: '/en/reviews/' },
  { pattern: /^\/news\/([^/]+)\/$/, slugs: EN_NEWS_SLUG_SET, hub: '/en/news/' },
]

function untranslatedArticleHub(normalizedPath: string): string | null {
  for (const { pattern, slugs, hub } of ARTICLE_SECTIONS) {
    const match = normalizedPath.match(pattern)
    if (match && !slugs.has(match[1])) return hub
  }
  return null
}

/** 같은 내용의 `/en/...` 페이지가 있는가. 앱 화면과 번역 안 된 글만 없다. */
export function hasEnglishVersion(normalizedPath: string): boolean {
  return !isAppRoute(normalizedPath) && !untranslatedArticleHub(normalizedPath)
}

export function alternateUrl(currentPath: string, target: Locale): string {
  const normalized = normalize(currentPath)
  // 앱 화면(/analysis/·/mypage/ 등)은 주소가 하나뿐이고 저장된 언어로 그린다 → 그 자리에서 바뀐다.
  if (isAppRoute(normalized)) return currentPath

  if (target === 'en') {
    if (normalized === '/en/' || normalized.startsWith('/en/')) return currentPath
    return untranslatedArticleHub(normalized) ?? `/en${normalized}`
  }

  if (normalized !== '/en/' && !normalized.startsWith('/en/')) return currentPath
  // 영어로만 쓴 글은 한글판이 없다 — /en 만 떼면 404 라서 한글 가이드 허브로 보낸다.
  const enGuide = normalized.match(/^\/en\/guides\/([^/]+)\/$/)
  if (enGuide && EN_ONLY_GUIDE_SLUG_SET.has(enGuide[1])) return '/guides/'
  return normalized.slice('/en'.length)
}
