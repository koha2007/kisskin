export default function Head() {
  const title = 'Personal Color Quiz — 4 Seasons in 6 Questions | kissinskin'
  const desc = 'Free 6-question quiz · 1 minute · no signup. Match yourself to Spring Warm, Summer Cool, Autumn Warm, or Winter Cool — with tailored color, lip, eye, and hair picks.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="personal color, color analysis, spring warm, summer cool, autumn warm, winter cool, 4-season" />
      <link rel="canonical" href="https://kissinskin.net/en/tools/personal-color/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/personal-color/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/personal-color/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/personal-color/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/en/tools/personal-color/" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Quiz",
        "name": "Personal Color Self-Diagnosis", "description": desc,
        "url": "https://kissinskin.net/en/tools/personal-color/", "inLanguage": "en"
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kissinskin.net/en/" },
          { "@type": "ListItem", "position": 2, "name": "Personal Color Quiz", "item": "https://kissinskin.net/en/tools/personal-color/" }
        ]
      }) }} />
    </>
  )
}
