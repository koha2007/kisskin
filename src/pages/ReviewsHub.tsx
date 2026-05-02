import { useMemo } from 'react'
import HubShell, { type HubItem, type HubCategory } from '../components/HubShell'
import { REVIEW_POSTS } from '../lib/reviews/posts'
import { REVIEW_CATEGORIES, getReviewCategoryMeta } from '../lib/reviews/types'

export default function ReviewsHub() {
  const items = useMemo<HubItem[]>(
    () =>
      REVIEW_POSTS.map((p) => {
        const meta = getReviewCategoryMeta(p.category)
        return {
          slug: p.slug,
          title: p.title,
          summary: p.summary,
          date: p.date,
          readMinutes: p.readMinutes,
          category: p.category,
          categoryLabel: meta.koLabel,
          categoryColor: meta.color,
          rightMeta: <span>{p.products.length}개 비교</span>,
        }
      }),
    [],
  )

  const categories = useMemo<HubCategory[]>(
    () => REVIEW_CATEGORIES.map((c) => ({ code: c.code, label: c.koLabel })),
    [],
  )

  return (
    <HubShell
      eyebrow="kissinskin · Reviews"
      title="직접 비교한 글로벌 베스트 화장품"
      subtitle="Sephora · Olive Young · Amazon 데이터를 통합한 카테고리별 톱 픽. 가성비·럭셔리·비건까지, 진짜 살 만한 제품만."
      basePath="/reviews"
      items={items}
      categories={categories}
      totalLabel={`${items.length}편 비교 리뷰`}
    />
  )
}
