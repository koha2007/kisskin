import { usePageContext } from 'vike-react/usePageContext'
import { getSeasonBySlug } from '../../../../src/lib/personal-color/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const t = getSeasonBySlug(slug)
  if (!t) return null
  const title = `${t.koName} (${t.enName}) — 퍼스널 컬러 가이드 | kissinskin`
  const desc = `${t.koName} 특징과 어울리는 색·메이크업·헤어·액세서리 완전 가이드. ${t.tagline}`
  const url = `https://kissinskin.net/tools/personal-color/${t.slug}/`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={`${t.koName}, ${t.enName}, 퍼스널컬러, ${t.tone}, 어울리는 색, K-뷰티`} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:locale" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Article",
        "headline": `${t.koName} — 퍼스널 컬러 완전 가이드`,
        "description": desc, "url": url, "inLanguage": "ko",
        "author": { "@type": "Organization", "name": "kissinskin" },
        "publisher": { "@type": "Organization", "name": "kissinskin" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": url }
      }) }} />
    </>
  )
}
