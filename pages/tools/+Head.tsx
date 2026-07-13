import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/tools/')) return null
  const title = '무료 뷰티 테스트 모음 — 퍼스널컬러·얼굴형·향수 진단 | 키스인스킨'
  const desc = '회원가입 없이 1분. 퍼스널컬러 진단, 얼굴형 테스트, 메이크업 MBTI, 향수 추천 테스트 — 키스인스킨(kissinskin)의 무료 K-뷰티 AI 진단 도구 모음.'
  const keywords = '무료 퍼스널컬러 진단, 퍼스널컬러 진단 사이트, 얼굴형 테스트, 얼굴형 테스트 사이트, 웜톤 쿨톤 테스트, 메이크업 MBTI, 향수 추천 테스트, 무료 뷰티 테스트, 자가진단 사이트, 키스인스킨, kissinskin'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href="https://kissinskin.net/tools/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:url" content="https://kissinskin.net/tools/" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "AI 도구", "item": "https://kissinskin.net/tools/" }
        ]
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "K-뷰티 AI 도구 모음",
        "description": desc,
        "inLanguage": "ko",
        "url": "https://kissinskin.net/tools/",
        "isPartOf": {
          "@type": "WebSite",
          "name": "kissinskin",
          "url": "https://kissinskin.net/"
        }
      }) }} />
    </>
  )
}
