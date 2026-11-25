import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/tools/ideal-type/')) return null
  const title = 'AI 이상형 테스트 — 내 이상형 얼굴·패션 1분 진단 | 키스인스킨'
  const desc = '무료 AI 이상형 테스트. 10문항 1분 · 가입 불필요. 강아지상·고양이상·여우상·토끼상 등 동물상 8가지 중 내 이상형의 얼굴 인상·패션·데이트 장소를 미술 포스터 카드로, 그날 내 메이크업까지.'
  const url = 'https://kissinskin.net/tools/ideal-type/'
  const og = 'https://kissinskin.net/ideal-type/og.jpg'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content='이상형 테스트, AI 이상형, 이상형 찾기, 동물상 테스트, 강아지상, 고양이상, 여우상, 이상형 얼굴, 키스인스킨' />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/ideal-type/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/ideal-type/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/ideal-type/" />
      <meta property="og:type" content="website" />
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
        '@context': 'https://schema.org', '@type': 'Quiz', name: title, description: desc, url, inLanguage: 'ko',
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: 'https://kissinskin.net/' },
          { '@type': 'ListItem', position: 2, name: 'AI 이상형 테스트', item: url },
        ],
      }) }} />
    </>
  )
}
