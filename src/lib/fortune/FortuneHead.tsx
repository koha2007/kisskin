// 럭키 메이크업 페이지 <head> — 한/영 공용 (2026-10-21, 2026-10-22 /tools/fortune-makeup/ → /lucky-makeup/)
import { fortuneLookById, type FortuneLookId } from './looks'
import { LUCKY_HOWTO } from './howto'

const ORIGIN = 'https://kissinskin.net'
// 카드 그리기용 글꼴(Song Myung 붓글씨 · Gaegu 손글씨 · Nanum Myeongjo)을 이 페이지에서만 불러온다.
export default function FortuneHead({ isEn }: { isEn: boolean }) {
  const url = isEn ? `${ORIGIN}/en/lucky-makeup/` : `${ORIGIN}/lucky-makeup/`
  // 자동완성 실수요: "관상 테스트"·"동물상 테스트"·"사주 무료" / "face reading", "what animal face do i have"
  const title = isEn
    ? 'Lucky Makeup — 9 Makeup Looks for Wealth, Love & More, on Your Selfie'
    : '럭키 메이크업 — 재물운·연애운 메이크업 9가지, 내 셀카에 AI로 | 키스인스킨'
  const desc = isEn
    ? 'Wealth, love, career, exams… 9 lucky makeup looks from Korean face reading. Try them on your own selfie with AI, with a free how-to and product links for every look. First look free, 5 looks $2.99, all 9 $4.99.'
    : '재물운·연애운·승진운·합격운… 관상에서 운을 보는 자리를 살리는 럭키 메이크업 9가지. 내 셀카에 AI로 입혀 보고, 따라 하는 방법과 제품 링크까지. 첫 장 무료, 5장 $2.99, 9장 전부 $4.99.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={isEn
        ? 'lucky makeup, face reading, face reading app, animal face test, what animal face do i have, fox face, cat face, korean face reading, physiognomy makeup, five elements, saju, fortune makeup'
        : '럭키 메이크업, 개운 메이크업, 복 들어오는 메이크업, 관상 테스트, 관상 테스트 무료, 동물상 테스트, 여우상, 고양이상, 강아지상, 관상 보기, 사주 무료, 오행, 재물운, 연애운, 관상 메이크업, 키스인스킨'} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={`${ORIGIN}/lucky-makeup/`} />
      <link rel="alternate" hrefLang="en" href={`${ORIGIN}/en/lucky-makeup/`} />
      <link rel="alternate" hrefLang="x-default" href={`${ORIGIN}/lucky-makeup/`} />
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
        name: isEn ? 'Lucky Makeup' : '럭키 메이크업', url, description: desc,
        applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', inLanguage: isEn ? 'en' : 'ko',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : '홈', item: isEn ? 'https://kissinskin.net/en/' : 'https://kissinskin.net/' },
          { '@type': 'ListItem', position: 2, name: isEn ? 'Lucky Makeup' : '럭키 메이크업', item: url },
        ],
      }) }} />
    </>
  )
}

/** /lucky-makeup/{id}/ 방법 페이지 <head> — "재물운 메이크업"·"관상 메이크업 방법" 류 검색용 */
export function LuckyLookHead({ id, isEn }: { id: FortuneLookId; isEn: boolean }) {
  const l = fortuneLookById(id)
  const h = LUCKY_HOWTO[id]
  const hub = isEn ? `${ORIGIN}/en/lucky-makeup/` : `${ORIGIN}/lucky-makeup/`
  const url = `${hub}${id}/`
  const title = isEn
    ? `${l.nameEn} Makeup Tutorial — Korean Face Reading Look, Step by Step | kissinskin`
    : `${l.nameKo} 방법 — 관상 포인트 · 단계별 제품 | 키스인스킨`
  const desc = isEn
    ? `${l.hookEn}. ${h.steps.length} steps, ~${h.minutes} min: ${h.steps.map((s) => s.titleEn).join(' · ')}. Try it on your own selfie with AI.`
    : `${l.hookKo}. ${h.steps.length}단계 · 약 ${h.minutes}분 — ${h.steps.map((s) => s.titleKo).join(' · ')}. 내 셀카에 AI로 바로 입혀 보세요.`
  const img = `${ORIGIN}/fortune/looks/${id}-after.webp`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={`${ORIGIN}/lucky-makeup/${id}/`} />
      <link rel="alternate" hrefLang="en" href={`${ORIGIN}/en/lucky-makeup/${id}/`} />
      <link rel="alternate" hrefLang="x-default" href={`${ORIGIN}/lucky-makeup/${id}/`} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content={isEn ? 'en_US' : 'ko_KR'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={img} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'HowTo',
        name: isEn ? `${l.nameEn} makeup` : l.nameKo, description: desc, image: img, inLanguage: isEn ? 'en' : 'ko',
        totalTime: `PT${h.minutes}M`,
        step: h.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: isEn ? s.titleEn : s.titleKo, text: isEn ? s.bodyEn : s.bodyKo })),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : '홈', item: isEn ? `${ORIGIN}/en/` : `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: isEn ? 'Lucky Makeup' : '럭키 메이크업', item: hub },
          { '@type': 'ListItem', position: 3, name: isEn ? l.nameEn : l.nameKo, item: url },
        ],
      }) }} />
    </>
  )
}
