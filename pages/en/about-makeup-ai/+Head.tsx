export default function Head() {
  const title = 'The Complete K-Beauty Makeup Guide | kissinskin'
  const desc =
    'A 3,000-word in-depth guide to K-beauty: history, 18 signature styles, how AI makeup simulation works, and photo tips that improve accuracy.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta
        name="keywords"
        content="K-beauty, makeup guide, Korean makeup, cushion foundation, blood lip, cloud skin, makeup history, AI makeup"
      />
      <link rel="canonical" href="https://kissinskin.net/en/about-makeup-ai/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/about-makeup-ai/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/about-makeup-ai/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/about-makeup-ai/" />
      <meta property="og:type" content="article" />
      <meta property="og:url" content="https://kissinskin.net/en/about-makeup-ai/" />
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'The Complete K-Beauty Makeup Guide',
            description: desc,
            url: 'https://kissinskin.net/en/about-makeup-ai/',
            inLanguage: 'en',
            author: { '@type': 'Organization', name: 'kissinskin' },
            publisher: { '@type': 'Organization', name: 'kissinskin' },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': 'https://kissinskin.net/en/about-makeup-ai/',
            },
            datePublished: '2026-04-19',
            wordCount: 3000,
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
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kissinskin.net/en/' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'K-Beauty Guide',
                item: 'https://kissinskin.net/en/about-makeup-ai/',
              },
            ],
          }),
        }}
      />
    </>
  )
}
