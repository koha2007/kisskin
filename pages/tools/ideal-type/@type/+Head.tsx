import { usePageContext } from 'vike-react/usePageContext'
import { getIdealTypeBySlug } from '../../../../src/lib/ideal-type/types'

export default function Head() {
  const ctx = usePageContext()
  const t = getIdealTypeBySlug((ctx.routeParams?.type ?? '').toString())
  if (!t) return null
  const title = `${t.ko} 이상형 — 얼굴 인상·패션·데이트 메이크업 | AI 이상형 테스트`
  const desc = `${t.ko} 이상형: ${t.taglineKo}. 얼굴 인상·패션·데이트 장소와 그날 내 메이크업까지. 무료 1분 AI 이상형 테스트.`
  const url = `https://kissinskin.net/tools/ideal-type/${t.code}/`
  const og = `https://kissinskin.net/ideal-type/${t.code}-f-picnic.webp`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={`https://kissinskin.net/tools/ideal-type/${t.code}/`} />
      <link rel="alternate" hrefLang="en" href={`https://kissinskin.net/en/tools/ideal-type/${t.code}/`} />
      <link rel="alternate" hrefLang="x-default" href={`https://kissinskin.net/tools/ideal-type/${t.code}/`} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={og} />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={og} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: 'https://kissinskin.net/' },
          { '@type': 'ListItem', position: 2, name: 'AI 이상형 테스트', item: 'https://kissinskin.net/tools/ideal-type/' },
          { '@type': 'ListItem', position: 3, name: t.ko, item: url },
        ],
      }) }} />
    </>
  )
}
