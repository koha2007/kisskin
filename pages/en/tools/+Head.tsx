import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/tools/')) return null
  // 영어권 실검색어를 따른다 — test/quiz 보다 detector/analyzer 가 헤드 term 이고,
  // "personal color analysis" 에는 korea/seoul 이 붙는다(우리가 서울에 있다는 게 무기).
  const title = 'Free Beauty Tools — Face Shape Detector, Personal Color Analyzer & Perfume Quiz | kissinskin'
  const desc =
    'Free, no sign-up: a face shape detector, a Korean personal color analyzer, a makeup MBTI quiz, and a perfume match quiz. Each takes under a minute — from a Seoul-based K-beauty studio.'
  const keywords =
    'face shape detector, personal color analyzer, personal color analysis korea, what perfume suits me, makeup quiz, free beauty tools, k-beauty, virtual makeup try on free'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href="https://kissinskin.net/en/tools/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:url" content="https://kissinskin.net/en/tools/" />
      <meta property="og:title" content="kissinskin Tools · Free K-beauty self-diagnosis" />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="kissinskin Tools · Free K-beauty self-diagnosis" />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kissinskin.net/en/" },
          { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://kissinskin.net/en/tools/" }
        ]
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Free K-Beauty Tools",
        "description": desc,
        "inLanguage": "en",
        "url": "https://kissinskin.net/en/tools/",
        "isPartOf": {
          "@type": "WebSite",
          "name": "kissinskin",
          "url": "https://kissinskin.net/"
        }
      }) }} />
    </>
  )
}
