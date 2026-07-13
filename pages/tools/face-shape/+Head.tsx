import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/tools/face-shape/')) return null
  // 자동완성 실수요: "얼굴형 테스트" > "얼굴형 진단". 사이트/무료/AI 조합이 상위라 함께 태운다.
  const title = '얼굴형 테스트 무료 — 1분 얼굴형 진단 사이트 | 키스인스킨'
  const desc = '무료 얼굴형 테스트 사이트. 6문항 1분 · 회원가입 불필요. 계란형·둥근형·각진형·긴형·하트형 5가지 중 내 얼굴형을 자가진단하고, 얼굴형별 헤어스타일·컨투어링·메이크업 가이드까지 한 번에.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="얼굴형 테스트, 얼굴형 테스트 무료, 얼굴형 테스트 사이트, 얼굴형 진단, 얼굴형 분석 사이트, 얼굴 분석 테스트, 얼굴형 종류, 얼굴형 헤어스타일, 계란형 둥근형 각진형 긴형 하트형, 컨투어링, 키스인스킨" />
      <link rel="canonical" href="https://kissinskin.net/tools/face-shape/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/face-shape/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/face-shape/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/face-shape/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/tools/face-shape/" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Quiz",
        "name": "얼굴형 자가 진단", "description": desc,
        "url": "https://kissinskin.net/tools/face-shape/", "inLanguage": "ko"
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "AI 도구", "item": "https://kissinskin.net/tools/" },
          { "@type": "ListItem", "position": 3, "name": "얼굴형 테스트", "item": "https://kissinskin.net/tools/face-shape/" }
        ]
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "얼굴형 테스트는 무료인가요?",
            "acceptedAnswer": { "@type": "Answer", "text": "네. 키스인스킨의 얼굴형 자가 테스트는 회원가입도 결제도 필요 없이 무료입니다. 6문항에 답하면 약 1분 만에 결과가 나옵니다." }
          },
          {
            "@type": "Question",
            "name": "얼굴형 종류는 몇 가지인가요?",
            "acceptedAnswer": { "@type": "Answer", "text": "이 테스트는 계란형, 둥근형, 각진형, 긴형, 하트형 5가지로 분류합니다. 얼굴 길이와 폭의 비율, 턱선과 이마의 각도, 광대 위치를 묻는 문항으로 판별합니다." }
          },
          {
            "@type": "Question",
            "name": "얼굴형에 맞는 헤어스타일도 알려주나요?",
            "acceptedAnswer": { "@type": "Answer", "text": "네. 결과 페이지에서 얼굴형별로 어울리는 헤어스타일과 컨투어링·메이크업 포인트를 함께 안내합니다." }
          },
          {
            "@type": "Question",
            "name": "사진을 올려야 하나요?",
            "acceptedAnswer": { "@type": "Answer", "text": "아니요. 얼굴형 테스트는 6개 문항에 답하는 방식이라 사진 업로드가 필요 없습니다. 사진으로 메이크업을 입혀보는 AI 메이크업은 별도 기능입니다." }
          }
        ]
      }) }} />
    </>
  )
}
