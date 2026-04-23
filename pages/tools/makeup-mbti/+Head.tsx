export default function Head() {
  const title = '메이크업 MBTI 테스트 | 16가지 K-뷰티 성향 분석 — kissinskin'
  const desc = '10문항으로 알아보는 나의 메이크업 MBTI. 16가지 유형별 맞춤 K-뷰티 스타일과 시그니처 룩 공식을 무료로 확인하세요. 로그인 불필요.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="메이크업 MBTI, 메이크업 테스트, 뷰티 성향, K-뷰티 스타일, 메이크업 성향 테스트, makeup mbti, 퍼스널 메이크업, 16가지 뷰티" />
      <link rel="canonical" href="https://kissinskin.net/tools/makeup-mbti/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/makeup-mbti/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/tools/makeup-mbti/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/makeup-mbti/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/tools/makeup-mbti/" />
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
        "@context": "https://schema.org",
        "@type": "Quiz",
        "name": "메이크업 MBTI 테스트",
        "description": desc,
        "url": "https://kissinskin.net/tools/makeup-mbti/",
        "educationalUse": "Personality Test",
        "inLanguage": "ko",
        "about": { "@type": "Thing", "name": "K-Beauty Makeup Personality" }
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "AI 도구", "item": "https://kissinskin.net/tools/" },
          { "@type": "ListItem", "position": 3, "name": "메이크업 MBTI 테스트", "item": "https://kissinskin.net/tools/makeup-mbti/" }
        ]
      }) }} />
    </>
  )
}
