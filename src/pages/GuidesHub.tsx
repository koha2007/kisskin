import { useMemo } from 'react'
import HubShell, { type HubItem, type HubCategory } from '../components/HubShell'
import { GUIDE_POSTS } from '../lib/guides/posts'
import { GUIDE_CATEGORIES, getGuideCategoryMeta } from '../lib/guides/types'

export default function GuidesHub() {
  const items = useMemo<HubItem[]>(
    () =>
      GUIDE_POSTS.map((p) => {
        const meta = getGuideCategoryMeta(p.category)
        return {
          slug: p.slug,
          title: p.title,
          summary: p.summary,
          date: p.date,
          readMinutes: p.readMinutes,
          category: p.category,
          categoryLabel: meta.koLabel,
          categoryColor: meta.color,
        }
      }),
    [],
  )

  const categories = useMemo<HubCategory[]>(
    () => GUIDE_CATEGORIES.map((c) => ({ code: c.code, label: c.koLabel })),
    [],
  )

  return (
    <HubShell
      eyebrow="kissinskin · Guides"
      title="메이크업, 단계별로 정확하게"
      subtitle="립스틱 지속력부터 안경 메이크업까지 — 글로벌 아티스트가 매일 쓰는 기술을 따라 할 수 있는 단계로 정리했습니다."
      basePath="/guides"
      items={items}
      categories={categories}
      totalLabel={`${items.length}편 How-to`}
    />
  )
}
