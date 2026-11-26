import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/tools/ideal-type/photo/')) return null
  const title = 'Me + My Ideal Type — AI Date Photo from One Selfie | kissinskin'
  const desc = 'Pick your ideal type (Golden Retriever, Black Cat, Fox…) and add one selfie for an AI date photo of the two of you (pop-up store, photo booth, hanbok and more), with K-pop idol makeup — or your ideal type alone in a studio shot. First preview free; HD 1 credit.'
  const url = 'https://kissinskin.net/en/tools/ideal-type/photo/'
  const og = 'https://kissinskin.net/ideal-type/samples/ex-f-golden-photobooth.webp'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/ideal-type/photo/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/ideal-type/photo/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/ideal-type/photo/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={og} />
      <meta property="og:site_name" content="kissinskin" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={og} />
    </>
  )
}
