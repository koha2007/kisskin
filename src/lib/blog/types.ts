export type BlogCategory =
  | 'kbeauty'
  | 'science'
  | 'trend'
  | 'history'
  | 'data'
  | 'mens'
  | 'global'

export interface BlogCategoryMeta {
  code: BlogCategory
  koLabel: string
  enLabel: string
  emoji: string
  color: string
}

export const BLOG_CATEGORIES: BlogCategoryMeta[] = [
  { code: 'kbeauty', koLabel: 'K-뷰티', enLabel: 'K-Beauty', emoji: '💄', color: '#eb4763' },
  { code: 'science', koLabel: '뷰티 사이언스', enLabel: 'Science', emoji: '🧬', color: '#06b6d4' },
  { code: 'trend', koLabel: '트렌드', enLabel: 'Trend', emoji: '✨', color: '#a855f7' },
  { code: 'history', koLabel: '뷰티 히스토리', enLabel: 'History', emoji: '🏛️', color: '#92400e' },
  { code: 'data', koLabel: '데이터', enLabel: 'Data', emoji: '📊', color: '#3b82f6' },
  { code: 'mens', koLabel: '남성 뷰티', enLabel: "Men's", emoji: '🧔', color: '#475569' },
  { code: 'global', koLabel: '글로벌', enLabel: 'Global', emoji: '🌏', color: '#f59e0b' },
]

export interface BlogPost {
  slug: string
  category: BlogCategory
  title: string
  summary: string
  body: string[]
  date: string
  readMinutes: number
  tags: string[]
  featured?: boolean
}

export function getBlogCategoryMeta(code: BlogCategory): BlogCategoryMeta {
  return BLOG_CATEGORIES.find((c) => c.code === code) || BLOG_CATEGORIES[0]
}
