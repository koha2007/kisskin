export default function Head() {
  return (
    <>
      {/* GEO #1 - Korean-focused meta for AI citation.
          제목/설명은 자동완성 실수요 기준으로 잡는다. "메이크업 시뮬레이터"는 네이버·구글
          자동완성에 전혀 뜨지 않는 죽은 키워드라 헤드 term 에서 뺐다. */}
      <title>AI 메이크업 사이트 · 퍼스널컬러 진단 무료 | 키스인스킨 kissinskin</title>
      <meta name="description" content="키스인스킨(kissinskin) — 셀카 1장 60초. AI 가상 메이크업으로 9가지 K-뷰티 룩과 헤어 컬러를 입혀보고, 퍼스널컬러 진단·얼굴형 테스트는 회원가입 없이 무료." />
      <meta name="keywords" content="키스인스킨, kissinskin, AI 메이크업, AI 메이크업 사이트, 가상 메이크업, 퍼스널컬러 진단, 퍼스널컬러 진단 무료, 얼굴형 테스트, 웜톤 쿨톤 테스트, K-뷰티" />

      {/* Canonical + hreflang */}
      <link rel="canonical" href="https://kissinskin.net/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/" />

      {/* GEO #2 - Open Graph for AI sharing/citation */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:title" content="AI 메이크업 사이트 · 퍼스널컬러 진단 무료 | 키스인스킨 kissinskin" />
      <meta property="og:description" content="키스인스킨(kissinskin) — 셀카 1장 60초. AI 가상 메이크업으로 9가지 K-뷰티 룩과 헤어 컬러를 입혀보고, 퍼스널컬러 진단·얼굴형 테스트는 회원가입 없이 무료." />
      <meta property="og:url" content="https://kissinskin.net/" />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="AI 메이크업 사이트 · 퍼스널컬러 진단 무료 | 키스인스킨 kissinskin" />
      <meta name="twitter:description" content="키스인스킨(kissinskin) — 셀카 1장 60초. AI 가상 메이크업으로 9가지 K-뷰티 룩과 헤어 컬러를 입혀보고, 퍼스널컬러 진단·얼굴형 테스트는 회원가입 없이 무료." />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />

      {/* GEO #3 - WebApplication Schema with featureList + multiple offers */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "kissinskin",
        "url": "https://kissinskin.net",
        "description": "AI가 셀카 한 장에 9가지 K-뷰티 메이크업과 룩에 맞는 헤어 컬러를 입혀주는 서비스. 무료 진단 도구(퍼스널컬러·얼굴형·메이크업 MBTI·향수)도 함께 제공",
        "applicationCategory": "BeautyApplication",
        "operatingSystem": "Web, iOS, Android",
        "inLanguage": ["ko", "en"],
        "offers": [
          {
            "@type": "Offer",
            "name": "무료 체험",
            "price": "0",
            "priceCurrency": "USD",
            "description": "로그인하면 AI 메이크업 무료 1회 — 9가지 K-뷰티 룩 + 헤어 컬러. 진단 도구는 로그인 없이 무제한 무료"
          },
          {
            "@type": "Offer",
            "name": "크레딧 충전",
            "price": "2.99",
            "priceCurrency": "USD",
            "description": "무료 횟수 소진 후 크레딧으로 메이크업 계속 생성 — $2.99부터"
          }
        ],
        "featureList": [
          "9가지 K-뷰티 메이크업 시뮬레이션",
          "룩에 맞는 헤어 컬러 변경",
          "비포/애프터 비교",
          "무료 퍼스널컬러·얼굴형·메이크업 MBTI·향수 진단",
          "맞춤 코스메틱 제품 추천",
          "구매 링크 제공"
        ],
        "publisher": {
          "@type": "Organization",
          "name": "kissinskin",
          "url": "https://kissinskin.net",
          "logo": {
            "@type": "ImageObject",
            "url": "https://kissinskin.net/logo.png"
          }
        }
      }) }} />

      {/* GEO - HowTo Schema for AI step-by-step citation */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "kissinskin AI 메이크업 시뮬레이터 사용 방법",
        "description": "셀카 한 장으로 9가지 K-뷰티 메이크업과 헤어 컬러를 AI로 체험하는 방법",
        "totalTime": "PT1M",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "사진 업로드",
            "text": "셀카를 찍거나 갤러리에서 사진을 선택하세요. Galaxy, iPhone, PC 모두 지원합니다."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "AI 분석",
            "text": "9가지 룩 중 하나를 고르면 AI가 얼굴은 그대로 둔 채 메이크업과 헤어 컬러를 입힙니다."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "결과 확인 및 쇼핑",
            "text": "비포/애프터를 비교하고 결과를 저장·공유하세요. 룩에 어울리는 코스메틱 추천도 함께 받습니다."
          }
        ]
      }) }} />

      {/* BreadcrumbList */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://kissinskin.net/" }
        ]
      }) }} />
    </>
  )
}
