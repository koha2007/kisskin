import { usePageContext } from 'vike-react/usePageContext'
import { getReviewBySlug } from '../../../src/lib/reviews/posts'
import { getReviewCategoryMeta } from '../../../src/lib/reviews/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  const post = getReviewBySlug(slug)

  if (!post) {
    return (
      <>
        <title>리뷰를 찾을 수 없습니다 · kissinskin</title>
        <meta name="robots" content="noindex" />
      </>
    )
  }

  const meta = getReviewCategoryMeta(post.category)
  const url = `https://kissinskin.net/reviews/${post.slug}/`

  return (
    <>
      <title>{`${post.title} · kissinskin Reviews`}</title>
      <meta name="description" content={post.summary} />
      <meta name="keywords" content={post.tags.join(', ')} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.summary} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="article:published_time" content={post.date} />
      <meta property="article:section" content={meta.koLabel} />
      {post.tags.map((t) => (
        <meta key={t} property="article:tag" content={t} />
      ))}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.summary} />
      <link rel="canonical" href={url} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: '홈', item: 'https://kissinskin.net/' },
              { '@type': 'ListItem', position: 2, name: '리뷰', item: 'https://kissinskin.net/reviews/' },
              { '@type': 'ListItem', position: 3, name: post.title, item: url },
            ],
          }),
        }}
      />
    </>
  )
}
