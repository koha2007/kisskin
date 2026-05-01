import { usePageContext } from 'vike-react/usePageContext'
import { getNewsBySlug } from '../../../src/lib/news/items'
import { getCategoryMeta } from '../../../src/lib/news/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  const item = getNewsBySlug(slug)

  if (!item) {
    return (
      <>
        <title>기사를 찾을 수 없습니다 · kissinskin News</title>
        <meta name="robots" content="noindex" />
      </>
    )
  }

  const meta = getCategoryMeta(item.category)
  const url = `https://kissinskin.net/news/${item.slug}/`

  return (
    <>
      <title>{`${item.title} · kissinskin News`}</title>
      <meta name="description" content={item.summary} />
      <meta name="keywords" content={item.tags.join(', ')} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={item.title} />
      <meta property="og:description" content={item.summary} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="article:published_time" content={item.date} />
      <meta property="article:section" content={meta.koLabel} />
      {item.tags.map((t) => (
        <meta key={t} property="article:tag" content={t} />
      ))}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={item.title} />
      <meta name="twitter:description" content={item.summary} />
      <link rel="canonical" href={url} />
    </>
  )
}
