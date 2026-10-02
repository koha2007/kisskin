// /looks/ · /looks/{id}/ 의 <head> — KO/EN 4개 라우트가 공유.
import { MAKEUP_STYLES, type MakeupStyleId } from '../makeup/styles'
import { LOOK_HOWTO } from './howto'

const SITE = 'https://kissinskin.net'

export function LooksHubHead({ isEn }: { isEn: boolean }) {
  const title = isEn ? '9 K-Beauty Makeup Looks, Step by Step — How-To Guides | kissinskin' : 'K-뷰티 9룩 메이크업 방법 — 단계별 따라 하기 | 키스인스킨'
  const desc = isEn
    ? 'Step-by-step K-beauty makeup: K-pop idol, blood lip, blush draping, cloud skin, grunge and more — skin, eyes, cheeks and lips with shades and tools.'
    : 'K-pop 아이돌·블러드 립·블러쉬 드레이핑·클라우드 스킨·그런지까지. 피부·눈·볼·입술 단계별 방법과 색·도구 정리.'
  const ko = `${SITE}/looks/`
  const en = `${SITE}/en/looks/`
  const url = isEn ? en : ko
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={ko} />
      <link rel="alternate" hrefLang="en" href={en} />
      <link rel="alternate" hrefLang="x-default" href={ko} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={`${SITE}/styles/looks/kpop-idol-after.webp`} />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content={isEn ? 'en_US' : 'ko_KR'} />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'ItemList',
        name: title,
        itemListElement: MAKEUP_STYLES.map((s, i) => ({
          '@type': 'ListItem', position: i + 1, name: isEn ? s.subEn : s.nameKo,
          url: `${SITE}${isEn ? '/en' : ''}/looks/${s.id}/`,
        })),
      }) }} />
    </>
  )
}

export function LookHead({ id, isEn }: { id: MakeupStyleId; isEn: boolean }) {
  const s = MAKEUP_STYLES.find((x) => x.id === id)
  if (!s) return null
  const how = LOOK_HOWTO[id]
  const short = isEn ? s.subEn.replace(/ MAKEUP$/i, '') : s.nameKo.replace(/ 메이크업$/, '')
  const title = isEn
    ? `How to Do ${short.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w/g, (c) => c.toLowerCase())} Makeup — ${how.steps.length} Steps | kissinskin`
    : `${short} 메이크업 하는 법 — ${how.steps.length}단계 따라 하기 | 키스인스킨`
  const desc = isEn
    ? `${how.introEn} ${how.steps.map((st) => st.titleEn).join(' → ')}. Shades and tools for each step.`
    : `${how.introKo} ${how.steps.map((st) => st.titleKo).join(' → ')}. 단계별 색·도구 정리.`
  const ko = `${SITE}/looks/${id}/`
  const en = `${SITE}/en/looks/${id}/`
  const url = isEn ? en : ko
  const image = `${SITE}/styles/looks/${id}-after.webp`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ko" href={ko} />
      <link rel="alternate" hrefLang="en" href={en} />
      <link rel="alternate" hrefLang="x-default" href={ko} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content={isEn ? 'en_US' : 'ko_KR'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'HowTo',
        name: isEn ? `How to do ${short.toLowerCase()} makeup` : `${short} 메이크업 하는 법`,
        description: isEn ? how.introEn : how.introKo,
        image, totalTime: `PT${how.minutes}M`, inLanguage: isEn ? 'en' : 'ko',
        tool: how.steps.map((st) => ({ '@type': 'HowToTool', name: isEn ? st.toolsEn : st.toolsKo })),
        step: how.steps.map((st, i) => ({
          '@type': 'HowToStep', position: i + 1,
          name: isEn ? st.titleEn : st.titleKo, text: isEn ? st.bodyEn : st.bodyKo,
        })),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : '홈', item: `${SITE}${isEn ? '/en/' : '/'}` },
          { '@type': 'ListItem', position: 2, name: isEn ? 'Makeup how-to' : '메이크업 방법', item: `${SITE}${isEn ? '/en' : ''}/looks/` },
          { '@type': 'ListItem', position: 3, name: short, item: url },
        ],
      }) }} />
    </>
  )
}
