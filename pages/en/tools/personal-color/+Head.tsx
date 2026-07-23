import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/tools/personal-color/')) return null
  // 자동완성 실수요: "personal color analysis" + free/test/korea 조합이 상위.
  // "korea"가 붙는 건 한국식 진단을 찾는 수요라서, 실제 한국 사이트라는 점을 전면에 세운다.
  const title = 'Personal Color Analysis Free — Korean 4-Season Test in 1 Min | kissinskin'
  const desc = 'Free personal color analysis, the Korean way · 6 questions · 1 minute · no signup. Find your season — Spring Warm, Summer Cool, Autumn Warm, Winter Cool — with lip, eye and hair colors that match. Built in Seoul.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="personal color analysis free, personal color analysis, personal color analysis korea, personal color test, personal color quiz, korean color analysis, warm cool undertone test, spring warm, summer cool, autumn warm, winter cool" />
      <link rel="canonical" href="https://kissinskin.net/en/tools/personal-color/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/personal-color/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/personal-color/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/personal-color/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/en/tools/personal-color/" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image-en.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/og-image-en.png" />
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
