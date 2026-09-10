import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/tools/beauty-dna/')) return null
  const title = 'I Found My Makeup — Personalized routine & products from 4 quizzes | kissinskin'
  const desc = 'Merge your personal color, face shape, perfume, and makeup MBTI results into one makeup routine and a shopping list built for your exact combination. No selfie. Free.'
  const url = 'https://kissinskin.net/en/tools/beauty-dna/'
  const koUrl = 'https://kissinskin.net/tools/beauty-dna/'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="personalized makeup routine, personal color face shape combination, makeup product recommendations, kissinskin" />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={koUrl} />
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="x-default" href={koUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "WebApplication",
        "name": "I Found My Makeup", "description": desc,
        "url": url, "inLanguage": "en", "applicationCategory": "LifestyleApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      }) }} />
    </>
  )
}
