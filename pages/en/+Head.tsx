import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/')) return null
  return (
    <>
      <title>AI K-Beauty Makeup Simulator | kissinskin</title>
      <meta
        name="description"
        content="One selfie · 60 seconds · log in for 1 free try · no card needed. AI applies 9 K-beauty makeup looks and matching hair colour. Compare before/after instantly."
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
        content="One selfie · 60 seconds · log in for 1 free try · no card needed. AI applies 9 K-beauty makeup looks and matching hair colour. Compare before/after instantly."
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
        content="One selfie · 60 seconds · log in for 1 free try · no card needed. AI applies 9 K-beauty makeup looks and matching hair colour. Compare before/after instantly."
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
              'AI tool that turns one selfie into 9 K-beauty makeup looks with matching hair colour, plus free personal-color, face-shape, makeup-MBTI and perfume quizzes.',
            applicationCategory: 'BeautyApplication',
            operatingSystem: 'Web, iOS, Android',
            inLanguage: ['en', 'ko'],
            offers: [
              {
                '@type': 'Offer',
                name: 'Per analysis',
                price: '2.99',
                priceCurrency: 'USD',
                description: 'One AI makeup analysis — 5 looks + skin report + product picks',
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
              'Matching hair colour change',
              'Before/after comparison',
              'Skin analysis report',
              'Curated cosmetic product picks',
              'Direct purchase links',
            ],
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
