export default function Head() {
  const title = '얼굴형 진단 — 6문항 1분 무료 자가 테스트 | kissinskin'
  const desc = '무료 6문항 1분 진단 · 회원가입 불필요. 계란·둥근·각진·긴·하트 5가지 얼굴형 중 나는 어디? 슬림 컨투어링·헤어·메이크업 가이드까지 한 번에.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="얼굴형 진단, 계란형, 둥근형, 각진형, 긴형, 하트형, 컨투어링, 얼굴형별 메이크업, face shape" />
      <link rel="canonical" href="https://kissinskin.net/tools/face-shape/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/face-shape/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/face-shape/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/face-shape/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/tools/face-shape/" />
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
        "name": "얼굴형 자가 진단", "description": desc,
        "url": "https://kissinskin.net/tools/face-shape/", "inLanguage": "ko"
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "AI 도구", "item": "https://kissinskin.net/tools/" },
          { "@type": "ListItem", "position": 3, "name": "얼굴형 진단", "item": "https://kissinskin.net/tools/face-shape/" }
        ]
      }) }} />
    </>
  )
}
