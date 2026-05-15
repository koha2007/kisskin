import { usePageContext } from 'vike-react/usePageContext'
import { getSeasonBySlug } from '../../../../../src/lib/personal-color/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const t = getSeasonBySlug(slug)
  if (!t) return null
  const enName = t.enName
  const title = `${enName} — Personal Color Guide for Makeup & Hair | kissinskin`
  const desc = `${enName} complete guide — best & worst colors, lip, eye, hair picks, and practical shopping tips. Take the free 1-minute personal color quiz to find your type.`
  const url = `https://kissinskin.net/en/tools/personal-color/${t.slug}/`
  const koUrl = `https://kissinskin.net/tools/personal-color/${t.slug}/`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={`${enName}, ${t.koName}, personal color, color analysis, makeup`} />
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
        "headline": `${enName} — Complete Personal Color Guide`,
        "description": desc, "url": url, "inLanguage": "en",
        "author": { "@type": "Organization", "name": "kissinskin" },
        "publisher": { "@type": "Organization", "name": "kissinskin" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": url }
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kissinskin.net/en/" },
          { "@type": "ListItem", "position": 2, "name": "Personal Color Quiz", "item": "https://kissinskin.net/en/tools/personal-color/" },
          { "@type": "ListItem", "position": 3, "name": enName, "item": url }
        ]
      }) }} />
    </>
  )
}
