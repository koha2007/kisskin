export default function Head() {
  const title = 'K-뷰티 AI 도구 모음 | kissinskin'
  const desc = '메이크업 시뮬레이터·MBTI·퍼스널 컬러·얼굴형 진단 — 무료 K-뷰티 AI 도구 모음.'
  const keywords = 'K-뷰티 AI 도구, 메이크업 AI, 메이크업 MBTI, 퍼스널 컬러 진단, 얼굴형 진단, 무료 뷰티 테스트, 한국 메이크업, personal color test, kissinskin'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href="https://kissinskin.net/tools/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/tools/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:url" content="https://kissinskin.net/tools/" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "AI 도구", "item": "https://kissinskin.net/tools/" }
        ]
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "K-뷰티 AI 도구 모음",
        "description": desc,
        "inLanguage": "ko",
        "url": "https://kissinskin.net/tools/",
        "isPartOf": {
          "@type": "WebSite",
          "name": "kissinskin",
          "url": "https://kissinskin.net/"
        }
      }) }} />
    </>
  )
}
