import { usePageContext } from 'vike-react/usePageContext'
import { getIdealTypeBySlug } from '../../../../../src/lib/ideal-type/types'

export default function Head() {
  const ctx = usePageContext()
  const t = getIdealTypeBySlug((ctx.routeParams?.type ?? '').toString())
  if (!t) return null
  const title = `${t.en} Ideal Type — Face, Style & Date Makeup | AI Ideal Type Test`
  const desc = `The ${t.en} ideal type: ${t.taglineEn.toLowerCase()}. Their face, style, first-date scene and the makeup to wear. Free 1-minute AI ideal type test.`
  const url = `https://kissinskin.net/en/tools/ideal-type/${t.code}/`
  const og = `https://kissinskin.net/ideal-type/${t.code}-f-picnic.webp`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={`https://kissinskin.net/tools/ideal-type/${t.code}/`} />
      <link rel="alternate" hrefLang="en" href={`https://kissinskin.net/en/tools/ideal-type/${t.code}/`} />
      <link rel="alternate" hrefLang="x-default" href={`https://kissinskin.net/tools/ideal-type/${t.code}/`} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={og} />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={og} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kissinskin.net/en/' },
          { '@type': 'ListItem', position: 2, name: 'Ideal Type Test', item: 'https://kissinskin.net/en/tools/ideal-type/' },
          { '@type': 'ListItem', position: 3, name: t.en, item: url },
        ],
      }) }} />
    </>
  )
}
