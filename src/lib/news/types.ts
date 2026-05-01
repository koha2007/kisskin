export type NewsCategory =
  | 'trend'
  | 'lip'
  | 'eye'
  | 'base'
  | 'cheek'
  | 'skincare'
  | 'fragrance'
  | 'hair'
  | 'global'

export interface NewsCategoryMeta {
  code: NewsCategory
  koLabel: string
  enLabel: string
  emoji: string
  color: string
}

export const NEWS_CATEGORIES: NewsCategoryMeta[] = [
  { code: 'trend', koLabel: '트렌드', enLabel: 'Trend', emoji: '✨', color: '#eb4763' },
  { code: 'lip', koLabel: '립', enLabel: 'Lip', emoji: '💋', color: '#f43f5e' },
  { code: 'eye', koLabel: '아이', enLabel: 'Eye', emoji: '👁️', color: '#a855f7' },
  { code: 'base', koLabel: '베이스', enLabel: 'Base', emoji: '✨', color: '#f59e0b' },
  { code: 'cheek', koLabel: '치크', enLabel: 'Cheek', emoji: '🌸', color: '#ec4899' },
  { code: 'skincare', koLabel: '스킨케어', enLabel: 'Skincare', emoji: '💧', color: '#06b6d4' },
  { code: 'fragrance', koLabel: '향수', enLabel: 'Fragrance', emoji: '🌹', color: '#8b5cf6' },
  { code: 'hair', koLabel: '헤어', enLabel: 'Hair', emoji: '💇', color: '#10b981' },
  { code: 'global', koLabel: '글로벌', enLabel: 'Global', emoji: '🌏', color: '#3b82f6' },
]

export interface NewsItem {
  slug: string
  category: NewsCategory
  title: string
  summary: string
  body: string[]
  date: string
  readMinutes: number
  tags: string[]
  featured?: boolean
}

export function getCategoryMeta(code: NewsCategory): NewsCategoryMeta {
  return NEWS_CATEGORIES.find((c) => c.code === code) || NEWS_CATEGORIES[0]
}
