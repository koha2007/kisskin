import { usePageContext } from 'vike-react/usePageContext'
import { getProductBySlugEn } from '../../../../src/lib/products/items.en'
import { getCategoryMeta } from '../../../../src/lib/products/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  const item = getProductBySlugEn(slug)

  if (!item) {
    return (
      <>
        <title>Product not found · kissinskin</title>
        <meta name="robots" content="noindex" />
      </>
    )
  }

  const meta = getCategoryMeta(item.category)
  const url = `https://kissinskin.net/en/products/${item.slug}/`
  const koUrl = `https://kissinskin.net/products/${item.slug}/`
  const seoTitle = item.seoTitle ?? `${item.brand} ${item.name} · kissinskin Makeup Products`
  const seoDesc = item.seoDescription ?? item.summary
  const ogImage = item.image ? `https://kissinskin.net${item.image}` : 'https://kissinskin.net/og-image.png'

  return (
    <>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDesc} />
      <meta name="keywords" content={item.tags.join(', ')} />
      <meta property="og:type" content="product" />
      <meta property="og:title" content={`${item.brand} ${item.name}`} />
      <meta property="og:description" content={seoDesc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="article:section" content={meta.enLabel} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${item.brand} ${item.name}`} />
      <meta name="twitter:description" content={seoDesc} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={koUrl} />
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="x-default" href={koUrl} />
    </>
  )
}
