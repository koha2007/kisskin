export default function Head() {
  const title = 'K-뷰티 AI 도구 모음 | kissinskin'
  const desc = '메이크업 시뮬레이터, 메이크업 MBTI, 퍼스널 컬러 진단, 얼굴형 진단 — kissinskin의 무료 K-뷰티 AI 도구를 한 곳에서.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href="https://kissinskin.net/tools/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/tools/" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://kissinskin.net/tools/" }
        ]
      }) }} />
    </>
  )
}
