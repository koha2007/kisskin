export default function Head() {
  const title = '향수 타입 진단 — 5문항 1분 무료 자가 테스트 | kissinskin'
  const desc = '무료 5문항 1분 진단 · 회원가입 불필요. 플로럴·시트러스·우디·앰버·프레시·구르망 6가지 중 내 향수 타입은? 한국 시장 추천 향수·메이크업·상황 가이드까지.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="향수 타입, 향수 추천, 플로럴 향수, 시트러스 향수, 우디 향수, 앰버 향수, 프레시 향수, 구르망 향수, 향수 진단" />
      <link rel="canonical" href="https://kissinskin.net/tools/perfume-type/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/perfume-type/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/perfume-type/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/tools/perfume-type/" />
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
        "@context": "https://schema.org", "@type": "Quiz",
        "name": "향수 타입 자가 진단", "description": desc,
        "url": "https://kissinskin.net/tools/perfume-type/", "inLanguage": "ko"
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "AI 도구", "item": "https://kissinskin.net/tools/" },
          { "@type": "ListItem", "position": 3, "name": "향수 타입 진단", "item": "https://kissinskin.net/tools/perfume-type/" }
        ]
      }) }} />
    </>
  )
}
