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
  { code: 'trend', koLabel: '트렌드', enLabel: 'Trend', emoji: '✨', color: '#d8503c' },
  { code: 'lip', koLabel: '립', enLabel: 'Lip', emoji: '💋', color: '#d8503c' },
  { code: 'eye', koLabel: '아이', enLabel: 'Eye', emoji: '👁️', color: '#8e6e9e' },
  { code: 'base', koLabel: '베이스', enLabel: 'Base', emoji: '✨', color: '#c79340' },
  { code: 'cheek', koLabel: '치크', enLabel: 'Cheek', emoji: '🌸', color: '#b03e2d' },
  { code: 'skincare', koLabel: '스킨케어', enLabel: 'Skincare', emoji: '💧', color: '#4e9fa6' },
  { code: 'fragrance', koLabel: '향수', enLabel: 'Fragrance', emoji: '🌹', color: '#4a5488' },
  { code: 'hair', koLabel: '헤어', enLabel: 'Hair', emoji: '💇', color: '#7e9b6a' },
  { code: 'global', koLabel: '글로벌', enLabel: 'Global', emoji: '🌏', color: '#4a5488' },
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
  seoTitle?: string
  seoDescription?: string
}

export function getCategoryMeta(code: NewsCategory): NewsCategoryMeta {
  return NEWS_CATEGORIES.find((c) => c.code === code) || NEWS_CATEGORIES[0]
}
