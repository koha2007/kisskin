export default function Head() {
  return (
    <>
      <title>운영자 소개 · 편집 원칙 | kissinskin</title>
      <meta
        name="description"
        content="kissinskin의 운영자, 편집 원칙, AI 사용 방식, 광고 정책, 개인정보 보호 방식을 한 페이지에 정리했습니다."
      />
      <link rel="canonical" href="https://kissinskin.net/about/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/about/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/about/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/about/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/about/" />
      <meta property="og:title" content="운영자 소개 · 편집 원칙 | kissinskin" />
      <meta
        property="og:description"
        content="kissinskin은 1인 인디 K-뷰티 사이트입니다. 운영자, 편집·AI·광고·개인정보 정책을 공개합니다."
      />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="About kissinskin" />
      <meta
        name="twitter:description"
        content="Indie K-beauty AI site. Operator, editorial standards, ad and privacy policy."
      />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            url: 'https://kissinskin.net/about/',
            mainEntity: {
              '@type': 'Organization',
              name: 'kissinskin',
              url: 'https://kissinskin.net',
              founder: { '@type': 'Person', name: 'Yonghun Kim' },
              email: 'support@kissinskin.net',
              foundingLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'KR' } },
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: '홈', item: 'https://kissinskin.net/' },
              { '@type': 'ListItem', position: 2, name: '소개', item: 'https://kissinskin.net/about/' },
            ],
          }),
        }}
      />
    </>
  )
}
