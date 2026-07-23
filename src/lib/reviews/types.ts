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
  { code: 'lip', koLabel: '립 제품', enLabel: 'Lip', emoji: '💋', color: '#d8503c' },
  { code: 'base', koLabel: '베이스', enLabel: 'Base', emoji: '✨', color: '#c79340' },
  { code: 'eye', koLabel: '아이 제품', enLabel: 'Eye', emoji: '👁️', color: '#8e6e9e' },
  { code: 'skincare', koLabel: '스킨케어', enLabel: 'Skincare', emoji: '💧', color: '#4e9fa6' },
  { code: 'tools', koLabel: '도구', enLabel: 'Tools', emoji: '🖌️', color: '#4a5488' },
  { code: 'vegan', koLabel: '비건', enLabel: 'Vegan', emoji: '🌱', color: '#7e9b6a' },
  { code: 'budget', koLabel: '가성비', enLabel: 'Budget', emoji: '💰', color: '#4a5488' },
  { code: 'mens', koLabel: '남성', enLabel: "Men's", emoji: '🧔', color: '#232a52' },
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
