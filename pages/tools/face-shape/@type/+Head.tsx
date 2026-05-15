import { usePageContext } from 'vike-react/usePageContext'
import { getFaceShapeBySlug } from '../../../../src/lib/face-shape/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const t = getFaceShapeBySlug(slug)
  if (!t) return null
  const title = `${t.koName} 얼굴 메이크업 — 컨투어링·셰이딩·헤어 가이드 | kissinskin`
  const desc = `${t.koName} 얼굴형 슬림 컨투어링·셰이딩 포인트, 어울리는 헤어·메이크업 룩 완전 가이드. 무료 1분 얼굴형 진단으로 내 타입 바로 확인.`
  const url = `https://kissinskin.net/tools/face-shape/${t.slug}/`
  const enUrl = `https://kissinskin.net/en/tools/face-shape/${t.slug}/`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={`${t.koName}, ${t.enName}, 얼굴형, 컨투어링, 메이크업`} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={url} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
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
        "headline": `${t.koName} 얼굴형 완전 가이드`,
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
          { "@type": "ListItem", "position": 3, "name": "얼굴형 진단", "item": "https://kissinskin.net/tools/face-shape/" },
          { "@type": "ListItem", "position": 4, "name": `${t.koName} 얼굴형`, "item": url }
        ]
      }) }} />
    </>
  )
}
