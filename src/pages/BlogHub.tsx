import { useMemo } from 'react'
import HubShell, { type HubItem, type HubCategory } from '../components/HubShell'
import { BLOG_POSTS } from '../lib/blog/posts'
import { BLOG_CATEGORIES, getBlogCategoryMeta } from '../lib/blog/types'

export default function BlogHub() {
  const items = useMemo<HubItem[]>(
    () =>
      BLOG_POSTS.map((p) => {
        const meta = getBlogCategoryMeta(p.category)
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
    () => BLOG_CATEGORIES.map((c) => ({ code: c.code, label: c.koLabel })),
    [],
  )

  return (
    <HubShell
      eyebrow="kissinskin · Blog"
      title="뷰티의 진짜 이야기"
      subtitle="K-뷰티 시장 데이터, 메디코스메틱 성분의 과학, 100년 화장품의 역사 — 단순한 트렌드 너머의 깊이."
      basePath="/blog"
      items={items}
      categories={categories}
      totalLabel={`${items.length}편 · 매주 업데이트`}
    />
  )
}
