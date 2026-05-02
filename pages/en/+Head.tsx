export default function Head() {
  return (
    <>
      <title>AI K-Beauty Makeup Simulator | kissinskin</title>
      <meta
        name="description"
        content="Try 9 K-beauty makeup looks on your selfie in 60 seconds — plus personal-color analysis and curated cosmetic picks."
      />
      <link rel="canonical" href="https://kissinskin.net/en/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:title" content="AI K-Beauty Makeup Simulator | kissinskin" />
      <meta
        property="og:description"
        content="Try 9 K-beauty makeup looks on your selfie in 60 seconds — plus personal-color analysis and curated cosmetic picks."
      />
      <meta property="og:url" content="https://kissinskin.net/en/" />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="AI K-Beauty Makeup Simulator | kissinskin" />
      <meta
        name="twitter:description"
        content="Try 9 K-beauty makeup looks on your selfie in 60 seconds — plus personal-color analysis and curated cosmetic picks."
      />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'kissinskin',
            url: 'https://kissinskin.net/en/',
            description:
              'AI tool that turns one selfie into 9 K-beauty makeup looks plus personal-color analysis and curated product picks.',
            applicationCategory: 'BeautyApplication',
            operatingSystem: 'Web, iOS, Android',
            inLanguage: ['en', 'ko'],
            offers: [
              {
                '@type': 'Offer',
                name: 'Per analysis',
                price: '2.99',
                priceCurrency: 'USD',
                description: 'One AI makeup analysis — 9 looks + skin report + product picks',
              },
              {
                '@type': 'Offer',
                name: 'Monthly subscription',
                price: '9.88',
                priceCurrency: 'USD',
                description: 'Unlimited analyses, 7-day free trial',
              },
            ],
            featureList: [
              'AI personal-color diagnosis',
              '9 K-beauty makeup simulations',
              'Skin analysis report',
              'Curated cosmetic product picks',
              'Direct purchase links',
            ],
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '150',
              bestRating: '5',
            },
            publisher: {
              '@type': 'Organization',
              name: 'kissinskin',
              url: 'https://kissinskin.net',
              logo: { '@type': 'ImageObject', url: 'https://kissinskin.net/logo.png' },
            },
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
            ],
          }),
        }}
      />
    </>
  )
}
