import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/tools/makeup-mbti/')) return null
  const title = 'Makeup Quiz — What Makeup Style Suits Me? 16 Types, Free | kissinskin'
  const desc = 'A free 8-question makeup quiz reads your beauty personality and matches you to 1 of 16 types — each with a K-beauty look and product formula that actually suits it. 1 minute, no signup.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="makeup quiz, what makeup suits me, makeup style quiz, makeup personality test, makeup MBTI, beauty quiz, korean makeup style, 16 types" />
      <link rel="canonical" href="https://kissinskin.net/en/tools/makeup-mbti/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/makeup-mbti/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/makeup-mbti/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/makeup-mbti/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/en/tools/makeup-mbti/" />
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
        "name": "Makeup MBTI Quiz", "description": desc,
        "url": "https://kissinskin.net/en/tools/makeup-mbti/", "inLanguage": "en"
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kissinskin.net/en/" },
          { "@type": "ListItem", "position": 2, "name": "Makeup MBTI Quiz", "item": "https://kissinskin.net/en/tools/makeup-mbti/" }
        ]
      }) }} />
    </>
  )
}
