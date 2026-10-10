// /class/ · /class/{slug}/ 의 <head> — KO/EN 4개 라우트가 공유.
import { CLASS_LESSONS, lessonBySlug, chartSrc } from './lessons'
import { CLASS_PARTS } from './curriculum'

const SITE = 'https://kissinskin.net'

export function ClassHubHead({ isEn }: { isEn: boolean }) {
  const title = isEn
    ? 'Free Makeup Class for Beginners — 36 Step-by-Step Lessons | kissinskin'
    : '무료 메이크업 클래스 — 기초부터 단계별 36편 | 키스인스킨'
  const desc = isEn
    ? 'Learn makeup from zero: the right order, skin prep, foundation shade, cushion, concealer, brows, eyeliner, hooded and monolid eyes, blush, contour, gradient lips — drawn on a face chart.'
    : '메이크업 순서·피부 준비·파운데이션 색 고르기부터 쿠션·컨실러·눈썹·아이라인·무쌍·블러셔·컨투어·그라데이션 립까지. 페이스 차트로 보는 단계별 무료 강의.'
  const ko = `${SITE}/class/`
  const en = `${SITE}/en/class/`
  const url = isEn ? en : ko
  const image = CLASS_LESSONS[0] ? `${SITE}${chartSrc(CLASS_LESSONS[0].slug)}` : `${SITE}/looks/charts/natural-glow.webp`
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
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="kissinskin" />
      <meta property="og:locale" content={isEn ? 'en_US' : 'ko_KR'} />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'ItemList',
        name: title,
        itemListElement: CLASS_LESSONS.map((l, i) => ({
          '@type': 'ListItem', position: i + 1, name: isEn ? l.titleEn : l.titleKo,
          url: `${SITE}${isEn ? '/en' : ''}/class/${l.slug}/`,
        })),
      }) }} />
    </>
  )
}

export function ClassLessonHead({ slug, isEn }: { slug: string; isEn: boolean }) {
  const l = lessonBySlug(slug)
  if (!l) return null
  const part = CLASS_PARTS.find((p) => p.id === l.part)!
  const name = isEn ? l.titleEn : l.titleKo
  const title = isEn
    ? `${name} — ${l.steps.length} Steps | Makeup Class ${l.n} | kissinskin`
    : `${name} — ${l.steps.length}단계 | 메이크업 클래스 ${l.n}편 | 키스인스킨`
  const desc = isEn
    ? `${l.introEn} ${l.steps.map((s) => s.titleEn).join(' → ')}.`
    : `${l.introKo} ${l.steps.map((s) => s.titleKo).join(' → ')}.`
  const ko = `${SITE}/class/${slug}/`
  const en = `${SITE}/en/class/${slug}/`
  const url = isEn ? en : ko
  const image = `${SITE}${chartSrc(slug)}`
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
      <meta property="article:published_time" content={l.publishedAt} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'HowTo',
        name, description: isEn ? l.introEn : l.introKo,
        image, totalTime: `PT${l.minutes}M`, inLanguage: isEn ? 'en' : 'ko', datePublished: l.publishedAt,
        tool: l.steps.map((st) => ({ '@type': 'HowToTool', name: isEn ? st.toolsEn : st.toolsKo })),
        step: l.steps.map((st, i) => ({
          '@type': 'HowToStep', position: i + 1,
          name: isEn ? st.titleEn : st.titleKo, text: isEn ? st.bodyEn : st.bodyKo,
        })),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : '홈', item: `${SITE}${isEn ? '/en/' : '/'}` },
          { '@type': 'ListItem', position: 2, name: isEn ? 'Makeup class' : '메이크업 클래스', item: `${SITE}${isEn ? '/en' : ''}/class/` },
          { '@type': 'ListItem', position: 3, name: isEn ? part.en : part.ko, item: `${SITE}${isEn ? '/en' : ''}/class/#${part.id}` },
          { '@type': 'ListItem', position: 4, name, item: url },
        ],
      }) }} />
    </>
  )
}
