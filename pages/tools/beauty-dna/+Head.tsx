import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/tools/beauty-dna/')) return null
  const title = '나만의 메이크업 찾았다 — 4가지 진단으로 맞춤 메이크업·제품 | 키스인스킨'
  const desc = '퍼스널컬러·얼굴형·향수·메이크업 MBTI 결과를 하나로. 셀카 없이 내 조합에 딱 맞는 메이크업 루틴과 살 수 있는 제품 리스트를 만들어드려요. 무료.'
  const url = 'https://kissinskin.net/tools/beauty-dna/'
  const enUrl = 'https://kissinskin.net/en/tools/beauty-dna/'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="맞춤 메이크업, 퍼스널컬러 얼굴형 조합, 메이크업 루틴 추천, 나만의 메이크업, 키스인스킨" />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={url} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
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
        "@context": "https://schema.org", "@type": "WebApplication",
        "name": "나만의 메이크업 찾았다", "description": desc,
        "url": url, "inLanguage": "ko", "applicationCategory": "LifestyleApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" }
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "무료 도구", "item": "https://kissinskin.net/tools/" },
          { "@type": "ListItem", "position": 3, "name": "나만의 메이크업 찾았다", "item": url }
        ]
      }) }} />
    </>
  )
}
