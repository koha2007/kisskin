import { usePageContext } from 'vike-react/usePageContext'
import { getMbtiTypeBySlug } from '../../../../../src/lib/makeup-mbti/types'
import { MAKEUP_MBTI_EN } from '../../../../../src/lib/makeup-mbti/types.en'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const t = getMbtiTypeBySlug(slug)
  if (!t) return null
  const en = MAKEUP_MBTI_EN[t.code]
  const title = `${en.enPersona} (${t.code}) — Makeup MBTI Result | kissinskin`
  const desc = `${en.enPersona}: ${en.tagline}. Signature look, recommended K-beauty style, and product picks for ${t.code}.`
  const url = `https://kissinskin.net/en/tools/makeup-mbti/${t.slug}/`
  const koUrl = `https://kissinskin.net/tools/makeup-mbti/${t.slug}/`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={`${en.enPersona}, ${t.koName}, ${t.code}, makeup MBTI, K-beauty`} />
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
        "headline": `${en.enPersona} — Makeup MBTI ${t.code}`,
        "description": desc, "url": url, "inLanguage": "en",
        "author": { "@type": "Organization", "name": "kissinskin" },
        "publisher": { "@type": "Organization", "name": "kissinskin" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": url }
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kissinskin.net/en/" },
          { "@type": "ListItem", "position": 2, "name": "Makeup MBTI Quiz", "item": "https://kissinskin.net/en/tools/makeup-mbti/" },
          { "@type": "ListItem", "position": 3, "name": `${en.enPersona} (${t.code})`, "item": url }
        ]
      }) }} />
    </>
  )
}
