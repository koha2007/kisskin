import { usePageContext } from 'vike-react/usePageContext'

export default function Head() {
  // Localize the language-specific global meta for /en/* routes so prerendered
  // English pages don't carry Korean subject/classification/Content-Language.
  const ctx = usePageContext()
  const isEn = ctx.urlPathname?.startsWith('/en') ?? false
  return (
    <>
      <meta name="google-site-verification" content="pjnJhImk95zvFQwAUOK8YLAAL4kCuMQGc71-C0Hg2ZE" />
      <meta name="naver-site-verification" content="efbca87df560d16f2ce20199b681b86319b65e56" />
      {/* Commission Factory 퍼블리셔 계정 소유 확인 (2026-07-13 재발급).
          이전 값(a9cdb379…)은 완결되지 않은 옛 시도의 코드라 교체했다. 태그를 두 개 두면
          검증기가 앞의 것만 읽고 실패할 수 있으므로 반드시 하나만 남긴다. */}
      <meta name="commission-factory-verification" content="f1d19eec63034cf0877b6adf7fc2e9a4" />
      <meta name="google-adsense-account" content="ca-pub-5109067049933124" />
      {/* Google Consent Mode v2 — default deny until the cookie banner records a choice. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});`,
        }}
      />
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5109067049933124"
        crossOrigin="anonymous"
      />
      <meta name="theme-color" content="#eb4763" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Kissinskin" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="author" content="kissinskin" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="NaverBot" content="All" />
      <meta name="Yeti" content="All" />
      <meta name="subject" content={isEn ? 'AI Virtual Makeup Try-On · Free Personal Color Analysis' : '키스인스킨 — AI 가상 메이크업 · 퍼스널컬러 진단 무료'} />
      <meta name="classification" content={isEn ? 'Beauty, Makeup, AI, Personal Color, K-Beauty' : '뷰티, 메이크업, AI, 퍼스널컬러, 키스인스킨, K-뷰티'} />
      <meta name="copyright" content="kissinskin" />
      <meta httpEquiv="Content-Language" content={isEn ? 'en' : 'ko'} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        crossOrigin="anonymous"
        defer
      />
      <noscript>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,100..700,0..1&display=swap" />
      </noscript>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "kissinskin",
        // 구조화 데이터의 alternateName 만으로는 한글 브랜드 검색에 잡히지 않는다.
        // 실제 본문(푸터·소개·히어로)에도 "키스인스킨"을 노출해 둔 상태다.
        "alternateName": ["키스인스킨", "키스인 스킨", "키스인스킨 kissinskin"],
        "url": "https://kissinskin.net",
        "logo": "https://kissinskin.net/og-image.png",
        "description": "셀카 한 장으로 AI가 9가지 K-뷰티 메이크업 룩과 헤어 컬러를 입혀주고, 퍼스널 컬러 진단과 맞춤 화장품을 추천하는 서비스. AI-powered K-beauty makeup simulator with personal color analysis and Korean cosmetics recommendations.",
        "sameAs": [],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "url": "https://kissinskin.net/contact/",
          "availableLanguage": ["Korean", "English"]
        }
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "kissinskin",
        "alternateName": ["키스인스킨", "K-beauty AI Makeup Simulator", "K-뷰티 AI 메이크업"],
        "url": "https://kissinskin.net",
        "inLanguage": ["en", "ko"],
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://kissinskin.net/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }) }} />
    </>
  )
}
