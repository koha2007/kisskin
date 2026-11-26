import { usePageContext } from 'vike-react/usePageContext'
import { isExactRoute } from '../../../../src/lib/seo/isExactRoute'

export default function Head() {
  const ctx = usePageContext()
  if (!isExactRoute(ctx.urlPathname, '/tools/ideal-type/photo/')) return null
  const title = '이상형 옆에 선 나 — 셀카 한 장으로 AI 데이트 사진 | 키스인스킨'
  const desc = '이상형(강아지상·고양이상·여우상…)을 고르고 셀카 한 장만 올리면 둘이 함께 찍은 AI 데이트 사진(성수 팝업·포토부스·한복 등 9곳). 내 얼굴엔 K-pop 아이돌 메이크업. 이상형 단독 스튜디오 컷도. 첫 맛보기 무료, 고화질 크레딧 1개.'
  const url = 'https://kissinskin.net/tools/ideal-type/photo/'
  const og = 'https://kissinskin.net/ideal-type/samples/ex-f-golden-photobooth.webp'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href="https://kissinskin.net/tools/ideal-type/photo/" />
      <link rel="alternate" hrefLang="en" href="https://kissinskin.net/en/tools/ideal-type/photo/" />
      <link rel="alternate" hrefLang="x-default" href="https://kissinskin.net/tools/ideal-type/photo/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={og} />
      <meta property="og:site_name" content="kissinskin" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={og} />
    </>
  )
}
