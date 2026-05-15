import { usePageContext } from 'vike-react/usePageContext'
import { getPerfumeTypeBySlug } from '../../../../src/lib/perfume-type/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const t = getPerfumeTypeBySlug(slug)
  if (!t) return null
  const title = `${t.koName} 향수 타입 — 추천 향수·메이크업·상황 가이드 | kissinskin`
  const desc = `${t.koName} (${t.enName}) 향수 타입 완전 가이드 — 한국 시장 추천 향수·어울리는 메이크업·계절·상황까지. 무료 1분 향수 타입 진단으로 내 타입 바로 확인.`
  const url = `https://kissinskin.net/tools/perfume-type/${t.slug}/`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={`${t.koName}, ${t.enName} 향수, 향수 타입, 추천 향수, ${t.koFamily} 향수`} />
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
        "@context": "https://schema.org", "@type": "Article",
        "headline": `${t.koName} 향수 타입 완전 가이드`,
        "description": desc, "url": url, "inLanguage": "ko",
        "author": { "@type": "Organization", "name": "kissinskin" },
        "publisher": { "@type": "Organization", "name": "kissinskin" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": url }
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "AI 도구", "item": "https://kissinskin.net/tools/" },
          { "@type": "ListItem", "position": 3, "name": "향수 타입 진단", "item": "https://kissinskin.net/tools/perfume-type/" },
          { "@type": "ListItem", "position": 4, "name": `${t.koName}`, "item": url }
        ]
      }) }} />
    </>
  )
}
