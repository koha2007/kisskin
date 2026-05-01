export type ReviewCategory =
  | 'lip'
  | 'base'
  | 'eye'
  | 'skincare'
  | 'tools'
  | 'vegan'
  | 'budget'
  | 'mens'

export interface ReviewCategoryMeta {
  code: ReviewCategory
  koLabel: string
  enLabel: string
  emoji: string
  color: string
}

export const REVIEW_CATEGORIES: ReviewCategoryMeta[] = [
  { code: 'lip', koLabel: '립 제품', enLabel: 'Lip', emoji: '💋', color: '#f43f5e' },
  { code: 'base', koLabel: '베이스', enLabel: 'Base', emoji: '✨', color: '#f59e0b' },
  { code: 'eye', koLabel: '아이 제품', enLabel: 'Eye', emoji: '👁️', color: '#a855f7' },
  { code: 'skincare', koLabel: '스킨케어', enLabel: 'Skincare', emoji: '💧', color: '#06b6d4' },
  { code: 'tools', koLabel: '도구', enLabel: 'Tools', emoji: '🖌️', color: '#8b5cf6' },
  { code: 'vegan', koLabel: '비건', enLabel: 'Vegan', emoji: '🌱', color: '#10b981' },
  { code: 'budget', koLabel: '가성비', enLabel: 'Budget', emoji: '💰', color: '#3b82f6' },
  { code: 'mens', koLabel: '남성', enLabel: "Men's", emoji: '🧔', color: '#475569' },
]

export interface ReviewProduct {
  rank: number
  brand: string
  name: string
  price: string
  highlight: string
  pros: string[]
  cons?: string[]
}

export interface ReviewPost {
  slug: string
  category: ReviewCategory
  title: string
  summary: string
  intro: string
  products: ReviewProduct[]
  outro: string[]
  date: string
  readMinutes: number
  tags: string[]
  featured?: boolean
}

export function getReviewCategoryMeta(code: ReviewCategory): ReviewCategoryMeta {
  return REVIEW_CATEGORIES.find((c) => c.code === code) || REVIEW_CATEGORIES[0]
}
