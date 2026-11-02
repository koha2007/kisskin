// 9가지 메이크업 페이지 <head> — 한/영 공용 (2026-11-02)
const ORIGIN = 'https://kissinskin.net'
export default function MakeupPageHead({ isEn }: { isEn: boolean }) {
  const url = isEn ? `${ORIGIN}/en/makeup/` : `${ORIGIN}/makeup/`
  const title = isEn ? '9 AI Makeup Looks on Your Selfie — Seasonal & K-Beauty | kissinskin' : 'AI 메이크업 9가지 — 계절 룩·K-뷰티를 내 셀카에 | 키스인스킨'
  const desc = isEn
    ? 'Pick from 9 K-beauty looks, including spring, summer, autumn and winter, and see them on your own selfie. First look free when you sign up.'
    : '봄·여름·가을·겨울 계절 룩과 K-뷰티 메이크업 9가지 중 원하는 룩을 골라 내 셀카에 입혀 보세요. 가입하면 첫 1장 무료.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={`${ORIGIN}/makeup/`} />
      <link rel="alternate" hrefLang="en" href={`${ORIGIN}/en/makeup/`} />
      <link rel="alternate" hrefLang="x-default" href={`${ORIGIN}/makeup/`} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content={isEn ? 'en_US' : 'ko_KR'} />
    </>
  )
}
