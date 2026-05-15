export default function Head() {
  const title = '퍼스널 컬러 진단 — 6문항 1분 무료 테스트 | kissinskin'
  const desc = '무료 6문항 1분 완료 · 회원가입 불필요. 봄웜·여름쿨·가을웜·겨울쿨 4시즌 진단부터 어울리는 립·아이·헤어 컬러 추천까지 한 번에. 지금 바로 내 톤 확인.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="퍼스널컬러, 퍼스널 컬러 진단, 봄 웜톤, 여름 쿨톤, 가을 웜톤, 겨울 쿨톤, 자가진단, personal color korea" />
      <link rel="canonical" href="https://kissinskin.net/tools/personal-color/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/personal-color/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/personal-color/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/personal-color/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/tools/personal-color/" />
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
        "name": "퍼스널 컬러 자가 진단", "description": desc,
        "url": "https://kissinskin.net/tools/personal-color/", "inLanguage": "ko",
        "about": { "@type": "Thing", "name": "Personal Color Analysis" }
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "AI 도구", "item": "https://kissinskin.net/tools/" },
          { "@type": "ListItem", "position": 3, "name": "퍼스널 컬러 진단", "item": "https://kissinskin.net/tools/personal-color/" }
        ]
      }) }} />
    </>
  )
}
