import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/tools/personal-color/')) return null
  // 검색어는 붙여 쓴 "퍼스널컬러"가 압도적이다("퍼스널 컬러" 아님). 자동완성 상위가
  // 진단 사이트 / 진단 무료 / 자가진단 순이라 그 세 조합을 title·desc 에 그대로 실었다.
  const title = '퍼스널컬러 진단 무료 — 웜톤 쿨톤 1분 자가진단 | 키스인스킨'
  const desc = '무료 퍼스널컬러 진단 사이트. 6문항 1분 · 회원가입 불필요. 웜톤·쿨톤 구분부터 봄웜·여름쿨·가을웜·겨울쿨 4시즌 자가진단까지, 어울리는 립·아이·헤어 컬러 추천도 함께.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="퍼스널컬러 진단, 퍼스널컬러 진단 무료, 무료 퍼스널컬러 진단, 퍼스널컬러 진단 사이트, 퍼스널컬러 자가진단, 퍼스널컬러 테스트, 웜톤 쿨톤 테스트, 웜톤 쿨톤 구분, 봄웜 여름쿨 가을웜 겨울쿨, 키스인스킨" />
      <link rel="canonical" href="https://kissinskin.net/tools/personal-color/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/personal-color/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/personal-color/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/personal-color/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kissinskin.net/tools/personal-color/" />
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
        "name": "퍼스널 컬러 자가 진단", "description": desc,
        "url": "https://kissinskin.net/tools/personal-color/", "inLanguage": "ko",
        "about": { "@type": "Thing", "name": "Personal Color Analysis" }
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" },
          { "@type": "ListItem", "position": 2, "name": "AI 도구", "item": "https://kissinskin.net/tools/" },
          { "@type": "ListItem", "position": 3, "name": "퍼스널컬러 진단", "item": "https://kissinskin.net/tools/personal-color/" }
        ]
      }) }} />
      {/* 실제 검색 자동완성 상위 질문을 그대로 Q 로 썼다 — 답은 사실만 적는다(과장 금지). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "퍼스널컬러 진단을 무료로 할 수 있나요?",
            "acceptedAnswer": { "@type": "Answer", "text": "네. 키스인스킨의 퍼스널컬러 자가진단은 회원가입이나 결제 없이 무료로 이용할 수 있습니다. 6문항에 답하면 약 1분 만에 결과가 나옵니다." }
          },
          {
            "@type": "Question",
            "name": "웜톤 쿨톤은 어떻게 구분하나요?",
            "acceptedAnswer": { "@type": "Answer", "text": "피부에 도는 기본 색조로 나눕니다. 노란빛·황금빛이 돌고 골드 액세서리가 잘 어울리면 웜톤, 붉은빛·푸른빛이 돌고 실버가 잘 어울리면 쿨톤에 가깝습니다. 이 진단은 혈관 색, 햇빛 반응, 어울리는 립 색 등 6가지 문항으로 웜·쿨을 먼저 가른 뒤 4시즌으로 세분합니다." }
          },
          {
            "@type": "Question",
            "name": "자가진단 결과는 얼마나 정확한가요?",
            "acceptedAnswer": { "@type": "Answer", "text": "설문 기반 자가진단이라 조명·화장 상태에 따라 결과가 달라질 수 있고, 오프라인 컬러 드레이핑 진단을 대체하지는 않습니다. 내 톤의 방향을 빠르게 잡고 어울리는 색을 좁히는 출발점으로 쓰시는 것을 권합니다." }
          },
          {
            "@type": "Question",
            "name": "퍼스널컬러는 몇 가지 유형으로 나뉘나요?",
            "acceptedAnswer": { "@type": "Answer", "text": "이 진단은 봄 웜, 여름 쿨, 가을 웜, 겨울 쿨 4시즌으로 분류하고, 시즌별로 어울리는 립·아이·헤어 컬러를 함께 추천합니다." }
          }
        ]
      }) }} />
    </>
  )
}
