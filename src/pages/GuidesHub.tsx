import { useMemo } from 'react'
import HubShell, { type HubItem, type HubCategory } from '../components/HubShell'
import { GUIDE_POSTS } from '../lib/guides/posts'
import { GUIDE_POSTS_EN } from '../lib/guides/posts.en'
import { GUIDE_CATEGORIES, getGuideCategoryMeta } from '../lib/guides/types'
import { useI18n } from '../i18n/I18nContext'

export default function GuidesHub() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const posts = isEn ? GUIDE_POSTS_EN : GUIDE_POSTS

  const items = useMemo<HubItem[]>(
    () =>
      posts.map((p) => {
        const meta = getGuideCategoryMeta(p.category)
        return {
          slug: p.slug,
          title: p.title,
          summary: p.summary,
          date: p.date,
          readMinutes: p.readMinutes,
          category: p.category,
          categoryLabel: isEn ? meta.enLabel : meta.koLabel,
          categoryColor: meta.color,
          categoryEmoji: meta.emoji,
        }
      }),
    [posts, isEn],
  )

  // Only surface category tabs that actually have an article (the EN set is a
  // curated subset, so empty tabs would otherwise show "0").
  const categories = useMemo<HubCategory[]>(
    () =>
      GUIDE_CATEGORIES.filter((c) => posts.some((p) => p.category === c.code)).map((c) => ({
        code: c.code,
        label: isEn ? c.enLabel : c.koLabel,
      })),
    [posts, isEn],
  )

  return (
    <HubShell
      eyebrow="kissinskin · Guides"
      title={isEn ? 'Makeup, step by step' : '메이크업, 단계별로 정확하게'}
      subtitle={
        isEn
          ? 'From long-lasting lipstick to monolid eye makeup — the techniques global artists use every day, broken into steps you can follow.'
          : '립스틱 지속력부터 안경 메이크업까지 — 글로벌 아티스트가 매일 쓰는 기술을 따라 할 수 있는 단계로 정리했습니다.'
      }
      basePath={isEn ? '/en/guides' : '/guides'}
      items={items}
      categories={categories}
      totalLabel={isEn ? `${items.length} how-to guides` : `${items.length}편 How-to`}
    />
  )
}
