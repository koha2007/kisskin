import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/tools/perfume-type/')) return null
  const title = 'Perfume Type Quiz — Find Your Fragrance Type in 1 Minute | kissinskin'
  const desc = 'A free 5-question quiz reveals your perfume type across 6 families — Floral, Citrus, Woody, Amber, Fresh, Gourmand — with matched scent picks plus makeup, occasion, and season guides.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="perfume quiz, fragrance type test, perfume personality test, what perfume suits me, perfume type, fragrance quiz" />
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
