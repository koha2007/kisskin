import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/tools/perfume-type/')) return null
  // "향수 추천" 이 헤드 term(자동완성 상위), "향수 타입 진단" 은 롱테일 → 둘 다 태운다.
  const title = '향수 추천 테스트 — 1분 무료 향수 타입 진단 | 키스인스킨'
  const desc = '무료 향수 추천 테스트. 5문항 1분 · 회원가입 불필요. 플로럴·시트러스·우디·앰버·프레시·구르망 6가지 중 내 향수 타입을 진단하고 어울리는 향수·메이크업·상황 가이드까지.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="향수 추천, 향수 추천 테스트, 향수 테스트, 향수 타입 진단, 나에게 맞는 향수, 무료 향수 진단, 플로럴 향수, 시트러스 향수, 우디 향수, 키스인스킨" />
      <link rel="canonical" href="https://kissinskin.net/tools/perfume-type/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/perfume-type/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/perfume-type/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/perfume-type/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/tools/perfume-type/" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Quiz",
        "name": "향수 타입 자가 진단", "description": desc,
        "url": "https://kissinskin.net/tools/perfume-type/", "inLanguage": "ko"
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "AI 도구", "item": "https://kissinskin.net/tools/" },
          { "@type": "ListItem", "position": 3, "name": "향수 타입 진단", "item": "https://kissinskin.net/tools/perfume-type/" }
        ]
      }) }} />
    </>
  )
}
