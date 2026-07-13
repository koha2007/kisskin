import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/tools/perfume-type/')) return null
  // "what perfume suits me" 는 자동완성 상위 질문형 검색어이고 우리 도구가 그대로 답이다 → 제목에 그대로.
  const title = 'What Perfume Suits Me? — Free 1-Minute Fragrance Type Quiz | kissinskin'
  const desc = 'What perfume suits me? Answer 5 questions in 1 minute — free, no signup — and find your fragrance family among Floral, Citrus, Woody, Amber, Fresh and Gourmand, with matched scents and when to wear them.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="what perfume suits me, perfume quiz, fragrance quiz, how to choose perfume, fragrance families, perfume type test, floral citrus woody amber, find my scent" />
      <link rel="canonical" href="https://kissinskin.net/en/tools/perfume-type/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/perfume-type/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/perfume-type/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/perfume-type/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/en/tools/perfume-type/" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Quiz",
        "name": "Perfume Type Quiz", "description": desc,
        "url": "https://kissinskin.net/en/tools/perfume-type/", "inLanguage": "en"
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kissinskin.net/en/" },
          { "@type": "ListItem", "position": 2, "name": "Perfume Type Quiz", "item": "https://kissinskin.net/en/tools/perfume-type/" }
        ]
      }) }} />
    </>
  )
}
