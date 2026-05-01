export type GuideCategory =
  | 'basics'
  | 'lip'
  | 'eye'
  | 'base'
  | 'cheek'
  | 'tpo'
  | 'glasses'
  | 'longevity'
  | 'tools'

export interface GuideCategoryMeta {
  code: GuideCategory
  koLabel: string
  enLabel: string
  emoji: string
  color: string
}

export const GUIDE_CATEGORIES: GuideCategoryMeta[] = [
  { code: 'basics', koLabel: '기초', enLabel: 'Basics', emoji: '✨', color: '#eb4763' },
  { code: 'lip', koLabel: '립', enLabel: 'Lip', emoji: '💋', color: '#f43f5e' },
  { code: 'eye', koLabel: '아이', enLabel: 'Eye', emoji: '👁️', color: '#a855f7' },
  { code: 'base', koLabel: '베이스', enLabel: 'Base', emoji: '✨', color: '#f59e0b' },
  { code: 'cheek', koLabel: '치크', enLabel: 'Cheek', emoji: '🌸', color: '#ec4899' },
  { code: 'tpo', koLabel: 'TPO', enLabel: 'TPO', emoji: '🎯', color: '#06b6d4' },
  { code: 'glasses', koLabel: '안경 메이크업', enLabel: 'Glasses', emoji: '👓', color: '#10b981' },
  { code: 'longevity', koLabel: '지속력', enLabel: 'Longevity', emoji: '⏱️', color: '#3b82f6' },
  { code: 'tools', koLabel: '도구', enLabel: 'Tools', emoji: '🖌️', color: '#8b5cf6' },
]

export interface GuidePost {
  slug: string
  category: GuideCategory
  title: string
  summary: string
  body: string[]
  date: string
  readMinutes: number
  tags: string[]
  featured?: boolean
}

export function getGuideCategoryMeta(code: GuideCategory): GuideCategoryMeta {
  return GUIDE_CATEGORIES.find((c) => c.code === code) || GUIDE_CATEGORIES[0]
}
