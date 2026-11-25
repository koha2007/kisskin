import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/tools/ideal-type/')) return null
  const title = "AI Ideal Type Test — Your Dream Partner's Face & Style"
  const desc = 'Free 1-minute AI ideal type test. 10 questions reveal your type among 8 — Golden Retriever, Black Cat, Fox, Bunny and more — as an art-poster card with their face, style and your date makeup. No sign-up.'
  const url = 'https://kissinskin.net/en/tools/ideal-type/'
  const og = 'https://kissinskin.net/ideal-type/og.jpg'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content='ideal type test, ideal type quiz, golden retriever boyfriend, black cat girlfriend, what is my type, dream partner quiz, AI ideal type' />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/ideal-type/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/ideal-type/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/ideal-type/" />
      <meta property="og:type" content="website" />
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
        '@context': 'https://schema.org', '@type': 'Quiz', name: title, description: desc, url, inLanguage: 'en',
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kissinskin.net/en/' },
          { '@type': 'ListItem', position: 2, name: 'Ideal Type Test', item: url },
        ],
      }) }} />
    </>
  )
}
