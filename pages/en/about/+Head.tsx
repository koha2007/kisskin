export default function Head() {
  return (
    <>
      <title>About kissinskin · Operator and editorial standards</title>
      <meta
        name="description"
        content="kissinskin is an indie K-beauty AI site. Operator, editorial process, AI usage, ad policy, and privacy approach in one page."
      />
      <link rel="canonical" href="https://kissinskin.net/en/about/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/about/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/about/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/about/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/en/about/" />
      <meta property="og:title" content="About kissinskin" />
      <meta
        property="og:description"
        content="Indie one-person K-beauty AI site. Editorial, AI, advertising, and privacy policy."
      />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ko_KR" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="About kissinskin" />
      <meta
        name="twitter:description"
        content="Indie one-person K-beauty AI site. Editorial, AI, advertising, and privacy policy."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            url: 'https://kissinskin.net/en/about/',
            mainEntity: {
              '@type': 'Organization',
              name: 'kissinskin',
              url: 'https://kissinskin.net',
              founder: { '@type': 'Person', name: 'Yonghun Kim' },
              email: 'support@kissinskin.net',
              foundingLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'KR' } },
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
              { '@type': 'ListItem', position: 2, name: 'About', item: 'https://kissinskin.net/en/about/' },
            ],
          }),
        }}
      />
    </>
  )
}
