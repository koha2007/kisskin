import { usePageContext } from 'vike-react/usePageContext'
import { getGuideBySlugEn } from '../../../../src/lib/guides/posts.en'
import { getGuideCategoryMeta } from '../../../../src/lib/guides/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  const post = getGuideBySlugEn(slug)

  if (!post) {
    return (
      <>
        <title>Guide not found · kissinskin</title>
        <meta name="robots" content="noindex" />
      </>
    )
  }

  const meta = getGuideCategoryMeta(post.category)
  const url = `https://kissinskin.net/en/guides/${post.slug}/`
  const koUrl = `https://kissinskin.net/guides/${post.slug}/`

  return (
    <>
      <title>{`${post.title} · kissinskin Guides`}</title>
      <meta name="description" content={post.summary} />
      <meta name="keywords" content={post.tags.join(', ')} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.summary} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ko_KR" />
      <meta property="article:published_time" content={post.date} />
      <meta property="article:section" content={meta.enLabel} />
      {post.tags.map((t) => (
        <meta key={t} property="article:tag" content={t} />
      ))}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.summary} />
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
              { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://kissinskin.net/en/guides/' },
              { '@type': 'ListItem', position: 3, name: post.title, item: url },
            ],
          }),
        }}
      />
    </>
  )
}
