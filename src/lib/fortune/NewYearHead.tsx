// 2027 신년 관상 메이크업 페이지 <head> — 한/영 공용 (2026-10-22)
// 실수요 키워드: "2027 신년운세 무료"·"정미년 운세"·"2027 토정비결" / "2027 horoscope", "year of the fire goat"
export default function NewYearHead({ isEn }: { isEn: boolean }) {
  const url = isEn ? 'https://kissinskin.net/en/tools/2027-fortune/' : 'https://kissinskin.net/tools/2027-fortune/'
  const title = isEn
    ? '2027 Horoscope Free — Year of the Fire Goat Lucky Talisman & Makeup'
    : '2027 신년운세 무료 · 정미년 붉은 양의 해 신년 부적 + 오복 메이크업 | 키스인스킨'
  const desc = isEn
    ? 'Free 2027 horoscope from your birth date: your word of the year, year type, five-blessings ranking, best months and lucky-colour makeup for the Year of the Fire Goat (丁未). Then try Five Blessings makeup on your selfie.'
    : '생년월일만 넣으면 무료 2027 신년운세 — 올해의 한 글자, 신년 유형, 오복 순위, 좋은 달, 행운색 메이크업이 담긴 정미년(붉은 양의 해) 신년 부적 카드. 재물·연애·직업·건강·인복 오복 메이크업을 내 셀카에 입혀 보세요.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={isEn
        ? '2027 horoscope, year of the fire goat, 2027 chinese zodiac, 2027 lucky color, saju 2027, korean new year fortune, lucky makeup'
        : '2027 신년운세, 신년운세 무료, 2027 운세, 정미년 운세, 붉은 양의 해, 2027 행운색, 사주 신년운세, 오복, 관상 메이크업, 키스인스킨'} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/2027-fortune/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/2027-fortune/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/2027-fortune/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content="https://kissinskin.net/fortune/og-2027.jpg" />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content={isEn ? 'en_US' : 'ko_KR'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content="https://kissinskin.net/fortune/og-2027.jpg" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Song+Myung&family=Gaegu:wght@700&family=Nanum+Myeongjo:wght@800&display=swap" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebApplication',
        name: isEn ? '2027 Lucky Talisman & Five Blessings Makeup' : '2027 신년 부적 · 오복 메이크업', url, description: desc,
        applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', inLanguage: isEn ? 'en' : 'ko',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : '홈', item: isEn ? 'https://kissinskin.net/en/' : 'https://kissinskin.net/' },
          { '@type': 'ListItem', position: 2, name: isEn ? 'Tools' : 'AI 도구', item: isEn ? 'https://kissinskin.net/en/tools/' : 'https://kissinskin.net/tools/' },
          { '@type': 'ListItem', position: 3, name: isEn ? '2027 Horoscope' : '2027 신년운세', item: url },
        ],
      }) }} />
    </>
  )
}
