import { useMemo } from 'react'
import HubShell, { type HubItem, type HubCategory } from '../components/HubShell'
import { REVIEW_POSTS } from '../lib/reviews/posts'
import { REVIEW_POSTS_EN } from '../lib/reviews/posts.en'
import { REVIEW_CATEGORIES, getReviewCategoryMeta } from '../lib/reviews/types'
import { useI18n } from '../i18n/I18nContext'

export default function ReviewsHub() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const posts = isEn ? REVIEW_POSTS_EN : REVIEW_POSTS

  const items = useMemo<HubItem[]>(
    () =>
      posts.map((p) => {
        const meta = getReviewCategoryMeta(p.category)
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
          rightMeta: <span>{isEn ? `${p.products.length} compared` : `${p.products.length}개 비교`}</span>,
        }
      }),
    [posts, isEn],
  )

  const categories = useMemo<HubCategory[]>(
    () =>
      REVIEW_CATEGORIES.filter((c) => posts.some((p) => p.category === c.code)).map((c) => ({
        code: c.code,
        label: isEn ? c.enLabel : c.koLabel,
      })),
    [posts, isEn],
  )

  return (
    <HubShell
      eyebrow="kissinskin · Reviews"
      title={isEn ? 'Global bestselling cosmetics, compared' : '직접 비교한 글로벌 베스트 화장품'}
      subtitle={
        isEn
          ? 'Category top picks built from Sephora, Olive Young, and Amazon data — value, luxury, and vegan included. Only products actually worth buying.'
          : 'Sephora · Olive Young · Amazon 데이터를 통합한 카테고리별 톱 픽. 가성비·럭셔리·비건까지, 진짜 살 만한 제품만.'
      }
      basePath={isEn ? '/en/reviews' : '/reviews'}
      items={items}
      categories={categories}
      totalLabel={isEn ? `${items.length} comparison reviews` : `${items.length}편 비교 리뷰`}
    />
  )
}
