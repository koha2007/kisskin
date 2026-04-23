export default function Head() {
  return (
    <>
      {/* GEO #1 - Korean-focused meta for AI citation */}
      <title>AI K-뷰티 메이크업 시뮬레이터 | kissinskin</title>
      <meta name="description" content="셀카로 60초 AI K-뷰티 메이크업 9가지 + 퍼스널컬러 진단·맞춤 화장품 추천." />

      {/* Canonical + hreflang */}
      <link rel="canonical" href="https://kissinskin.net/" />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/" />

      {/* GEO #2 - Open Graph for AI sharing/citation */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:title" content="AI K-뷰티 메이크업 시뮬레이터 | kissinskin" />
      <meta property="og:description" content="셀카로 60초 AI K-뷰티 메이크업 9가지 + 퍼스널컬러 진단·맞춤 화장품 추천." />
      <meta property="og:url" content="https://kissinskin.net/" />
      <meta property="og:image" content="https://kissinskin.net/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="AI K-뷰티 메이크업 시뮬레이터 | kissinskin" />
      <meta name="twitter:description" content="셀카로 60초 AI K-뷰티 메이크업 9가지 + 퍼스널컬러 진단·맞춤 화장품 추천." />
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

      {/* GEO - Korean FAQ Schema for AI Q&A citation */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "kissinskin은 어떤 서비스인가요?",
            "acceptedAnswer": { "@type": "Answer", "text": "kissinskin은 AI가 셀카 한 장을 분석해 9가지 K-뷰티 메이크업 룩을 시뮬레이션하는 서비스입니다. 퍼스널컬러 진단, 피부 분석, 맞춤 코스메틱 제품 추천까지 60초 안에 제공합니다." }
          },
          {
            "@type": "Question",
            "name": "어떤 메이크업 스타일을 체험할 수 있나요?",
            "acceptedAnswer": { "@type": "Answer", "text": "내추럴 글로우, 클라우드 스킨, 블러드 립, 맥시멀리스트 아이, 메탈릭 아이, 볼드 립, 블러쉬 드레이핑, 그런지 메이크업, K-pop 아이돌 메이크업 등 2026년 최신 트렌드 9가지 스타일을 AI로 체험할 수 있습니다." }
          },
          {
            "@type": "Question",
            "name": "무료로 사용할 수 있나요?",
            "acceptedAnswer": { "@type": "Answer", "text": "월 구독 플랜($9.88/월)은 7일 무료 체험이 제공됩니다. 건별 분석은 $2.99에 가입 없이 즉시 이용 가능합니다." }
          },
          {
            "@type": "Question",
            "name": "어떤 기기에서 사용할 수 있나요?",
            "acceptedAnswer": { "@type": "Answer", "text": "Galaxy, iPhone 등 스마트폰은 물론 PC에서도 사용 가능합니다. 카메라로 직접 촬영하거나 갤러리에서 사진을 업로드하는 방식 모두 지원합니다." }
          },
          {
            "@type": "Question",
            "name": "AI 메이크업 시뮬레이션 결과는 얼마나 정확한가요?",
            "acceptedAnswer": { "@type": "Answer", "text": "kissinskin의 AI는 얼굴 구조, 피부톤, 피부 특성을 분석해 각 사용자에게 맞춤화된 메이크업 룩을 생성합니다. 단순한 필터가 아닌 퍼스널컬러와 피부 타입을 반영한 결과를 제공합니다." }
          }
        ]
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
