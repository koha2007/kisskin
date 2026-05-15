import { usePageContext } from 'vike-react/usePageContext'
import { getSeasonBySlug } from '../../../../src/lib/personal-color/types'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.type ?? '').toString()
  const t = getSeasonBySlug(slug)
  if (!t) return null
  const title = `${t.koName} 완전 가이드 — 어울리는 색·립·아이·헤어 | kissinskin`
  const desc = `${t.koName} 어울리는 색·립스틱·아이섀도·헤어 컬러 완전 가이드. 피해야 할 색까지 한 번에. 무료 1분 퍼스널컬러 진단으로 내 타입 바로 확인.`
  const url = `https://kissinskin.net/tools/personal-color/${t.slug}/`
  const enUrl = `https://kissinskin.net/en/tools/personal-color/${t.slug}/`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={`${t.koName}, ${t.enName}, 퍼스널컬러, ${t.tone}, 어울리는 색, K-뷰티`} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={url} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Article",
        "headline": `${t.koName} — 퍼스널 컬러 완전 가이드`,
        "description": desc, "url": url, "inLanguage": "ko",
        "author": { "@type": "Organization", "name": "kissinskin" },
        "publisher": { "@type": "Organization", "name": "kissinskin" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": url }
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "AI 도구", "item": "https://kissinskin.net/tools/" },
          { "@type": "ListItem", "position": 3, "name": "퍼스널 컬러 진단", "item": "https://kissinskin.net/tools/personal-color/" },
          { "@type": "ListItem", "position": 4, "name": t.koName, "item": url }
        ]
      }) }} />
    </>
  )
}
