import { usePageContext } from 'vike-react/usePageContext'
import { getProductBySlug } from '../../../src/lib/products/items'
import { getCategoryMeta } from '../../../src/lib/products/types'
import { hasEnProduct } from '../../../src/lib/products/enSlugs'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  const item = getProductBySlug(slug)

  if (!item) {
    return (
      <>
        <title>제품을 찾을 수 없습니다 · kissinskin</title>
        <meta name="robots" content="noindex" />
      </>
    )
  }

  const meta = getCategoryMeta(item.category)
  const url = `https://kissinskin.net/products/${item.slug}/`
  const enUrl = `https://kissinskin.net/en/products/${item.slug}/`
  const translated = hasEnProduct(item.slug)
  const seoTitle = item.seoTitle ?? `${item.brand} ${item.name} · kissinskin 메이크업 제품`
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
      <meta property="article:section" content={meta.koLabel} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${item.brand} ${item.name}`} />
      <meta name="twitter:description" content={seoDesc} />
      <link rel="canonical" href={url} />
      {translated && (
        <>
          <link rel="alternate" hrefLang="ko" href={url} />
          <link rel="alternate" hrefLang="en" href={enUrl} />
          <link rel="alternate" hrefLang="x-default" href={url} />
        </>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: '홈', item: 'https://kissinskin.net/' },
              { '@type': 'ListItem', position: 2, name: '메이크업 제품', item: 'https://kissinskin.net/products/' },
              { '@type': 'ListItem', position: 3, name: `${item.brand} ${item.name}`, item: url },
            ],
          }),
        }}
      />
    </>
  )
}
