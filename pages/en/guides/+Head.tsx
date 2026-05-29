import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/guides/')) return null
  const title = 'K-Beauty Makeup Guides — Step-by-Step How-To | kissinskin'
  const desc =
    'Follow-along K-beauty makeup guides: a 10-minute daily routine, cushion foundation, monolid & hooded eyes, no-makeup makeup, and all-day lipstick.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content="kissinskin Guides · K-beauty how-to" />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/en/guides/" />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="kissinskin Guides · K-beauty how-to" />
      <meta name="twitter:description" content={desc} />
      <link rel="canonical" href="https://kissinskin.net/en/guides/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/guides/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/guides/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/guides/" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kissinskin.net/en/' },
              { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://kissinskin.net/en/guides/' },
            ],
          }),
        }}
      />
    </>
  )
}
