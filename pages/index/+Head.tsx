export default function Head() {
  return (
    <>
      {/* GEO #1 - Korean-focused meta for AI citation */}
      <title>AI 메이크업 시뮬레이터 — 셀카 1장으로 9가지 K-뷰티 룩 | kissinskin</title>
      <meta name="description" content="셀카 1장 60초 · 무료 미리보기 · 회원가입 불필요. AI가 9가지 K-뷰티 메이크업 룩 시뮬레이션 + 퍼스널컬러 진단 + 맞춤 화장품 추천까지. 지금 바로 체험." />

      {/* Canonical + hreflang */}
      <link rel="canonical" href="https://kissinskin.net/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/" />

      {/* GEO #2 - Open Graph for AI sharing/citation */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:title" content="AI 메이크업 시뮬레이터 — 셀카 1장으로 9가지 K-뷰티 룩 | kissinskin" />
      <meta property="og:description" content="셀카 1장 60초 · 무료 미리보기 · 회원가입 불필요. AI가 9가지 K-뷰티 메이크업 룩 시뮬레이션 + 퍼스널컬러 진단 + 맞춤 화장품 추천까지. 지금 바로 체험." />
      <meta property="og:url" content="https://kissinskin.net/" />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="AI 메이크업 시뮬레이터 — 셀카 1장으로 9가지 K-뷰티 룩 | kissinskin" />
      <meta name="twitter:description" content="셀카 1장 60초 · 무료 미리보기 · 회원가입 불필요. AI가 9가지 K-뷰티 메이크업 룩 시뮬레이션 + 퍼스널컬러 진단 + 맞춤 화장품 추천까지. 지금 바로 체험." />
      <meta name="twitter:image" content="https://kissinskin.net/og-image.png" />

      {/* GEO #3 - WebApplication Schema with featureList + multiple offers */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "kissinskin",
        "url": "https://kissinskin.net",
        "description": "AI가 셀카 한 장을 분석해 9가지 K-뷰티 메이크업 룩을 시뮬레이션하고 퍼스널컬러와 맞춤 제품을 추천하는 서비스",
        "applicationCategory": "BeautyApplication",
        "operatingSystem": "Web, iOS, Android",
        "inLanguage": ["ko", "en"],
        "offers": [
          {
            "@type": "Offer",
            "name": "건별 분석",
            "price": "2.99",
            "priceCurrency": "USD",
            "description": "1회 AI 메이크업 분석 — 9가지 룩 + 피부 분석 + 제품 추천"
          },
          {
            "@type": "Offer",
            "name": "월 구독",
            "price": "9.88",
            "priceCurrency": "USD",
            "description": "무제한 분석, 7일 무료 체험 포함"
          }
        ],
        "featureList": [
          "AI 퍼스널컬러 진단",
          "9가지 K-뷰티 메이크업 시뮬레이션",
          "피부 특성 분석 리포트",
          "맞춤 코스메틱 제품 추천",
          "구매 링크 제공"
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "150",
          "bestRating": "5"
        },
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
        "description": "셀카 한 장으로 9가지 K-뷰티 메이크업 룩을 AI로 체험하는 방법",
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
            "text": "AI가 얼굴 특징, 피부톤, 피부 특성을 분석해 9가지 메이크업을 시뮬레이션합니다."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "결과 확인 및 쇼핑",
            "text": "9가지 K-뷰티 메이크업 룩과 퍼스널컬러에 맞는 코스메틱 제품 추천 및 구매 링크를 받으세요."
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
