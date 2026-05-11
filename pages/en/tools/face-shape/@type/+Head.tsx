import { usePageContext } from 'vike-react/usePageContext'
import { getFaceShapeBySlug } from '../../../../../src/lib/face-shape/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const t = getFaceShapeBySlug(slug)
  if (!t) return null
  const enName = t.enName
  const title = `${enName} Face — Contour, Shading, and Hair Guide | kissinskin`
  const desc = `Features of an ${enName.toLowerCase()} face plus slimming contour & shading placement, plus hairstyles and makeup tips that complement the shape.`
  const url = `https://kissinskin.net/en/tools/face-shape/${t.slug}/`
  const koUrl = `https://kissinskin.net/tools/face-shape/${t.slug}/`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={`${enName}, ${t.koName}, face shape, contouring, makeup`} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={koUrl} />
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="x-default" href={koUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
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
        "@context": "https://schema.org", "@type": "Article",
        "headline": `${enName} Face Shape — Complete Guide`,
        "description": desc, "url": url, "inLanguage": "en",
        "author": { "@type": "Organization", "name": "kissinskin" },
        "publisher": { "@type": "Organization", "name": "kissinskin" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": url }
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kissinskin.net/en/" },
          { "@type": "ListItem", "position": 2, "name": "Face Shape Quiz", "item": "https://kissinskin.net/en/tools/face-shape/" },
          { "@type": "ListItem", "position": 3, "name": `${enName} face shape`, "item": url }
        ]
      }) }} />
    </>
  )
}
