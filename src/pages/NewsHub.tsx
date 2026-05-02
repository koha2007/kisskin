import { useMemo } from 'react'
import HubShell, { type HubItem, type HubCategory } from '../components/HubShell'
import { NEWS_ITEMS } from '../lib/news/items'
import { NEWS_CATEGORIES, getCategoryMeta } from '../lib/news/types'

export default function NewsHub() {
  const items = useMemo<HubItem[]>(
    () =>
      NEWS_ITEMS.map((n) => {
        const meta = getCategoryMeta(n.category)
        return {
          slug: n.slug,
          title: n.title,
          summary: n.summary,
          date: n.date,
          readMinutes: n.readMinutes,
          category: n.category,
          categoryLabel: meta.koLabel,
          categoryColor: meta.color,
        }
      }),
    [],
  )

  const categories = useMemo<HubCategory[]>(
    () => NEWS_CATEGORIES.map((c) => ({ code: c.code, label: c.koLabel })),
    [],
  )

  return (
    <HubShell
      eyebrow="kissinskin · News"
      title="K-뷰티·글로벌 화장품 산업 뉴스"
      subtitle="신제품, 시장 데이터, 트렌드 변화를 매주 정리합니다. 광고가 아닌 인사이트만."
      basePath="/news"
      items={items}
      categories={categories}
      totalLabel={`${items.length}건 · 매주 업데이트`}
    />
  )
}
