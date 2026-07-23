import { usePageContext } from 'vike-react/usePageContext'
import { getNewsBySlugEn } from '../../../../src/lib/news/items.en'
import { getCategoryMeta } from '../../../../src/lib/news/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  const item = getNewsBySlugEn(slug)

  if (!item) {
    return (
      <>
        <title>Article not found · kissinskin News</title>
        <meta name="robots" content="noindex" />
      </>
    )
  }

  const meta = getCategoryMeta(item.category)
  const url = `https://kissinskin.net/en/news/${item.slug}/`
  const koUrl = `https://kissinskin.net/news/${item.slug}/`
  const seoTitle = item.seoTitle ?? `${item.title} · kissinskin News`
  const seoDesc = item.seoDescription ?? item.summary

  return (
    <>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDesc} />
      <meta name="keywords" content={item.tags.join(', ')} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={item.title} />
      <meta property="og:description" content={seoDesc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content="https://kissinskin.net/og-image-en.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ko_KR" />
      <meta property="article:published_time" content={item.date} />
      <meta property="article:section" content={meta.enLabel} />
      {item.tags.map((t) => (
        <meta key={t} property="article:tag" content={t} />
      ))}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={item.title} />
      <meta name="twitter:description" content={seoDesc} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={koUrl} />
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="x-default" href={koUrl} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kissinskin.net/en/' },
              { '@type': 'ListItem', position: 2, name: 'News', item: 'https://kissinskin.net/en/news/' },
              { '@type': 'ListItem', position: 3, name: item.title, item: url },
            ],
          }),
        }}
      />
    </>
  )
}
