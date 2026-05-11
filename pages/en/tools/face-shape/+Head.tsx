export default function Head() {
  const title = 'Face Shape Quiz — Free 6-Question 1-Min Diagnosis | kissinskin'
  const desc = 'Oval, round, square, oblong, or heart — which one are you? Includes per-shape contouring, hair, and eyewear guidance.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="face shape quiz, oval, round, square, oblong, heart, contouring, face shape makeup" />
      <link rel="canonical" href="https://kissinskin.net/en/tools/face-shape/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/face-shape/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/face-shape/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/face-shape/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/en/tools/face-shape/" />
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
        "name": "Face Shape Self-Diagnosis", "description": desc,
        "url": "https://kissinskin.net/en/tools/face-shape/", "inLanguage": "en"
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kissinskin.net/en/" },
          { "@type": "ListItem", "position": 2, "name": "Face Shape Quiz", "item": "https://kissinskin.net/en/tools/face-shape/" }
        ]
      }) }} />
    </>
  )
}
