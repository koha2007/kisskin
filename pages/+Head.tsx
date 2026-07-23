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
      {/* 상단 네비가 bg-navy 라 모바일 브라우저 크롬을 같은 색으로 이어 붙인다.
          힐다 팔레트 전환(2026-07-22) 전까지 옛 핑크 #eb4763 이 남아 있었다. */}
      <meta name="theme-color" content="#232a52" />
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
      <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
      {/*
        Pretendard Variable — 폰트 스택엔 예전부터 이름이 있었지만 실제로 로드된 적이 없어
        한글이 시스템 폴백(Windows=맑은 고딕)으로 렌더됐다. "레이아웃이 옛스럽다"의 큰 축.
        동적 서브셋이라 페이지에 실제 등장하는 글자 범위의 woff2 청크만 내려받는다.
      */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
      />
      {/*
        Cormorant Garamond — 영문 제목 전용 세리프. 한글 글리프가 없어 한글은 글리프 폴백으로
        Pretendard(산세리프)가 받는다 → 영문=세리프 / 한글=산세리프가 토큰 하나로 성립.
        display=optional 은 CLS 방어용: 늦게 도착하면 폴백을 유지하고 바꿔치지 않는다.
      */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&display=optional"
      />
      <script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        crossOrigin="anonymous"
        defer
      />
      {/*
        아이콘 폰트는 <head> 에서 동기 로드한다. 예전엔 bodyHtmlEnd 에서 media="print"
        트릭으로 비동기 주입했는데, 그러면 CSS 가 붙기 전까지 @font-face 자체가 없어서
        <span class="material-symbols-outlined">menu</span> 가 글자 "menu" 로 그대로
        보인다. 첫 화면이 "face 얼굴형 자가 진단 / 진단 시작하기 arrow_forward" 처럼
        깨져 보였고, 네이버 인앱 웹뷰 유입이 1~14초 만에 튕기던 유력 원인이다.
        display=block 이면 폰트 대기 중 글자가 '투명'으로 잡혀 리거처 텍스트가 새지 않는다.
      */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,100..700,0..1&display=block"
      />
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
      {/* ⚠ potentialAction(SearchAction)을 넣지 말 것 — **우리 사이트에는 검색 기능이 없다.**
          예전에 `target: "https://kissinskin.net/?q={search_term_string}"` 를 선언해 뒀는데,
          구글이 그 템플릿을 실제 URL 로 알고 긁어가서 서치콘솔에 "적절한 표준 태그가 포함된
          대체 페이지"로 잡혔다(2026-07-14 제거). 사이트 검색 페이지를 실제로 만들기 전까지는
          다시 넣지 않는다. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "kissinskin",
        "alternateName": ["키스인스킨", "K-beauty AI Makeup Simulator", "K-뷰티 AI 메이크업"],
        "url": "https://kissinskin.net",
        "inLanguage": ["en", "ko"]
      }) }} />
    </>
  )
}
