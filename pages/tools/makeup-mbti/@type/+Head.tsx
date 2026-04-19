import { usePageContext } from 'vike-react/usePageContext'
import { getMbtiTypeBySlug } from '../../../../src/lib/makeup-mbti/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const type = getMbtiTypeBySlug(slug)
  if (!type) return null

  const title = `${type.koName} (${type.code}) — 메이크업 MBTI 결과 | kissinskin`
  const desc = `${type.koName} 유형의 메이크업 성향 — ${type.tagline}. 추천 K-뷰티 스타일과 시그니처 룩 공식을 지금 확인하세요.`
  const url = `https://kissinskin.net/tools/makeup-mbti/${type.slug}/`

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={`${type.koName}, ${type.code}, ${type.enName}, 메이크업 MBTI, ${type.recommended.women.primary}, ${type.recommended.men.primary}, K-뷰티 스타일`} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      <meta property="og:type" content="article" />
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
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `${type.koName} (${type.code}) — 메이크업 MBTI`,
        "description": desc,
        "url": url,
        "image": "https://kissinskin.net/og-image.png",
        "author": { "@type": "Organization", "name": "kissinskin" },
        "publisher": { "@type": "Organization", "name": "kissinskin", "logo": { "@type": "ImageObject", "url": "https://kissinskin.net/logo.png" } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": url },
        "inLanguage": "ko"
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://kissinskin.net/tools/" },
          { "@type": "ListItem", "position": 3, "name": "Makeup MBTI", "item": "https://kissinskin.net/tools/makeup-mbti/" },
          { "@type": "ListItem", "position": 4, "name": type.koName, "item": url }
        ]
      }) }} />
    </>
  )
}
