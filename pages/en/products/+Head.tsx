import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../src/lib/seo/isExactRoute'
import { hubListSchema } from '../../../src/lib/seo/hubSchema'
import { PRODUCT_ITEMS_EN } from '../../../src/lib/products/items.en'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/products/')) return null
  const list = hubListSchema({
    url: 'https://kissinskin.net/en/products/',
    name: 'kissinskin Makeup Products',
    description: 'New K-beauty makeup launches, picked daily',
    locale: 'en',
    items: PRODUCT_ITEMS_EN.map((p) => ({
      url: `https://kissinskin.net/en/products/${p.slug}/`,
      name: `${p.brand} ${p.name}`,
    })),
  })
  return (
    <>
      <title>Makeup Products · New K-beauty launches, daily — kissinskin</title>
      <meta
        name="description"
        content="A daily, photo-led look at new K-beauty makeup — lip, eye, base, cheek and more — with links to buy on Amazon and YesStyle."
      />
      <meta property="og:title" content="kissinskin Makeup Products · New K-beauty, daily" />
      <meta property="og:description" content="New makeup launches at a glance, with links to buy." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/en/products/" />
      <meta property="og:image" content="https://kissinskin.net/og-image-en.png" />
      <link rel="canonical" href="https://kissinskin.net/en/products/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/products/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/products/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/products/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
    </>
  )
}
