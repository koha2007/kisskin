// 관상·사주 메이크업 페이지 <head> — 한/영 공용 (2026-10-21)
// 카드 그리기용 글꼴(Song Myung 붓글씨 · Gaegu 손글씨 · Nanum Myeongjo)을 이 페이지에서만 불러온다.
export default function FortuneHead({ isEn }: { isEn: boolean }) {
  const url = isEn ? 'https://kissinskin.net/en/tools/fortune-makeup/' : 'https://kissinskin.net/tools/fortune-makeup/'
  // 자동완성 실수요: "관상 테스트"·"동물상 테스트"·"사주 무료" / "face reading", "what animal face do i have"
  const title = isEn
    ? 'Face Reading & Animal Face Test — Free AI + Five Elements Makeup'
    : '관상 테스트 무료 · 동물상 테스트 + 사주 — 관상 메이크업 | 키스인스킨'
  const desc = isEn
    ? 'Free face reading from a selfie: your animal face (fox, cat, puppy…), the 12 palaces of Korean face reading and your five elements from your birth date — then try the face-reading makeup that boosts your luck. Photos never leave your device.'
    : '셀카로 보는 무료 관상 테스트. 여우상·고양이상·강아지상 등 동물상 9종, 관상 12궁, 생년월일 사주 오행까지 — 재물운·연애운을 올리는 관상 메이크업을 내 얼굴에 입혀 보세요. 사진은 기기 밖으로 나가지 않아요.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={isEn
        ? 'face reading, face reading app, animal face test, what animal face do i have, fox face, cat face, korean face reading, physiognomy makeup, five elements, saju, fortune makeup'
        : '관상 테스트, 관상 테스트 무료, 동물상 테스트, 여우상, 고양이상, 강아지상, 관상 보기, 사주 무료, 오행, 재물운, 연애운, 관상 메이크업, 키스인스킨'} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/fortune-makeup/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/fortune-makeup/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/fortune-makeup/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/fortune/og.jpg" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content={isEn ? 'en_US' : 'ko_KR'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/fortune/og.jpg" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Song+Myung&family=Gaegu:wght@700&family=Nanum+Myeongjo:wght@800&display=swap" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebApplication',
        name: isEn ? 'Face Reading & Animal Face Makeup' : '관상·사주 메이크업', url, description: desc,
        applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', inLanguage: isEn ? 'en' : 'ko',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : '홈', item: isEn ? 'https://kissinskin.net/en/' : 'https://kissinskin.net/' },
          { '@type': 'ListItem', position: 2, name: isEn ? 'Tools' : 'AI 도구', item: isEn ? 'https://kissinskin.net/en/tools/' : 'https://kissinskin.net/tools/' },
          { '@type': 'ListItem', position: 3, name: isEn ? 'Face Reading' : '관상·사주 메이크업', item: url },
        ],
      }) }} />
    </>
  )
}
