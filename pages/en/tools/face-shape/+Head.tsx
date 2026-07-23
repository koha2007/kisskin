import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/en/tools/face-shape/')) return null
  // 영어권은 quiz/test 보다 detector·analyzer 로 검색한다(자동완성: face shape detector /
  // analyzer / calculator / types / and glasses). 그 단어를 title 에 실어 준다.
  const title = 'Face Shape Detector — Free Face Shape Test & Analyzer, 1 Min | kissinskin'
  const desc = 'Free face shape detector · no photo, no signup, 1 minute. Find out if you are oval, round, square, oblong or heart — then get the hairstyles, glasses and contouring that suit that shape.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="face shape detector, face shape analyzer, face shape test, face shape quiz, face shape types, face shape calculator, face shape and glasses, oval face, round face, square face, oblong face, heart face" />
      <link rel="canonical" href="https://kissinskin.net/en/tools/face-shape/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/face-shape/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/face-shape/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/face-shape/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/en/tools/face-shape/" />
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
