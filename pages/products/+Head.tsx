import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/products/')) return null
  return (
    <>
      <title>메이크업 제품 · 매일 새로 나온 K-뷰티 신상 — kissinskin</title>
      <meta
        name="description"
        content="새로 나온 메이크업 신상과 요즘 뜨는 K-뷰티 제품을 사진 위주로 매일 소개합니다. 립·아이·베이스·치크·향수까지, 구매 링크와 함께 한 곳에서 확인하세요."
      />
      <meta property="og:title" content="kissinskin 메이크업 제품 · 매일 업데이트 K-뷰티 신상" />
      <meta property="og:description" content="새로 나온 메이크업 신상을 사진 위주로 매일. 구매 링크까지 한 번에." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/products/" />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <link rel="canonical" href="https://kissinskin.net/products/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/products/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/products/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/products/" />
    </>
  )
}
