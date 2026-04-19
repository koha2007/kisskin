export default function Head() {
  const title = 'K-뷰티 메이크업 완전 가이드 | 역사·18가지 스타일·AI 원리 — kissinskin'
  const desc = 'K-뷰티 메이크업의 역사, 9가지 여성·9가지 남성 스타일 상세 설명, AI 메이크업 시뮬레이션의 원리, 사진 촬영 팁까지. 3,000단어 심화 가이드.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="K-뷰티, 메이크업 가이드, 한국 메이크업, 쿠션 파운데이션, 블러드 립, 클라우드 스킨, 메이크업 역사, AI 메이크업" />
      <link rel="canonical" href="https://kissinskin.net/about-makeup-ai/" />
      <meta property="og:type" content="article" />
      <meta property="og:url" content="https://kissinskin.net/about-makeup-ai/" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:locale" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Article",
        "headline": "K-뷰티 메이크업 완전 가이드", "description": desc,
        "url": "https://kissinskin.net/about-makeup-ai/", "inLanguage": "ko",
        "author": { "@type": "Organization", "name": "kissinskin" },
        "publisher": { "@type": "Organization", "name": "kissinskin" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://kissinskin.net/about-makeup-ai/" },
        "datePublished": "2026-04-19", "wordCount": 3200
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "Guide", "item": "https://kissinskin.net/about-makeup-ai/" }
        ]
      }) }} />
    </>
  )
}
