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
      {/* FAQPage 는 화면에 보이는 FAQ(ToolFaq)에서만 낸다 — 2026-10-10: 여기와 두 벌이었다(구글: 보이지 않는 FAQ·중복 FAQPage 불가) */}
    </>
  )
}
