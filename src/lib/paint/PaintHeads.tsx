// <head> — /face-paint/ · /hair-color/ (2026-11-11)
// 검색어: "페이스 페인팅"·"페이스페인팅 도안"·"얼굴 페인팅" / "헤어 컬러 시뮬레이션"·"염색 미리보기"·"어울리는 머리색"
// EN: "face paint ideas", "face paint filter" / "hair color try on", "hair color simulator"
const ORIGIN = 'https://kissinskin.net'

function Base({ path, title, desc, keywords, image, isEn, schemaName }: { path: string; title: string; desc: string; keywords: string; image: string; isEn: boolean; schemaName: string }) {
  const url = `${ORIGIN}${isEn ? '/en' : ''}${path}`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={`${ORIGIN}${path}`} />
      <link rel="alternate" hrefLang="en" href={`${ORIGIN}/en${path}`} />
      <link rel="alternate" hrefLang="x-default" href={`${ORIGIN}${path}`} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={`${ORIGIN}${image}`} />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content={isEn ? 'en_US' : 'ko_KR'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={`${ORIGIN}${image}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebApplication', name: schemaName, url,
        applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', inLanguage: isEn ? 'en' : 'ko',
        description: desc, isAccessibleForFree: true,
      }) }} />
    </>
  )
}

export function FacePaintHead({ isEn }: { isEn: boolean }) {
  return isEn ? (
    <Base path="/face-paint/" isEn image="/paint/og.jpg" schemaName="Face Painting"
      title="Face Paint Ideas — Try Face Painting on Your Selfie, Free | kissinskin"
      desc="46 face paint designs: pearls, chrome stars, lace and gems to full-face Van Gogh, Klimt and Hokusai, plus a look for every month. They snap to your face; drag, resize and save free. AI finish makes it look real."
      keywords="face paint ideas, face painting, face paint filter, faux freckles, face gems, cheek face paint, halloween face paint, christmas face paint" />
  ) : (
    <Base path="/face-paint/" isEn={false} image="/paint/og.jpg" schemaName="페이스 페인팅"
      title="페이스 페인팅 — 내 셀카에 무료로 붙여 보기 · 도안 46종 | 키스인스킨"
      desc="진주·크롬 별·레이스 스티커부터 고흐·클림트·호쿠사이 명화 얼굴, 열두 달 시즌 페인팅까지 46종. 얼굴에 자동으로 붙고, 옮기고 키워서 무료 저장. AI 완성본은 진짜 칠한 것처럼."
      keywords="페이스 페인팅, 페이스페인팅 도안, 얼굴 페인팅, 가짜 주근깨, 페이스 큐빅, 할로윈 페이스 페인팅, 크리스마스 메이크업, 키스인스킨" />
  )
}

export function HairColorHead({ isEn }: { isEn: boolean }) {
  return isEn ? (
    <Base path="/hair-color/" isEn image="/hair/og.jpg" schemaName="Find Your Hair Color"
      title="Hair Color Try-On — See 16 Hair Colors on Your Selfie, Free | kissinskin"
      desc="Change only your hair colour on your own photo, instantly and free. 16 shades with AI examples from three angles, sorted by personal-colour season, from chocolate brown to pastel pink. AI dye makes it look salon-real."
      keywords="hair color try on, hair color simulator, hair color changer, what hair color suits me, virtual hair color, personal color hair" />
  ) : (
    <Base path="/hair-color/" isEn={false} image="/hair/og.jpg" schemaName="나만의 헤어 컬러 찾기"
      title="헤어 컬러 시뮬레이션 — 염색 전에 내 사진으로 무료 미리보기 | 키스인스킨"
      desc="내 사진에서 머리색만 바꿔 보세요. 초코 브라운부터 베이비 핑크까지 16가지를 모델이 3각도로 먼저 AI 염색, 퍼스널컬러 계절별 추천. 무료로 바로 보고, AI 염색으로 진짜처럼."
      keywords="헤어 컬러 시뮬레이션, 염색 미리보기, 어울리는 머리색, 머리색 바꾸기, 퍼스널컬러 염색, 염색 색 추천, 키스인스킨" />
  )
}
