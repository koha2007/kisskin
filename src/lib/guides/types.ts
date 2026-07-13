export type GuideCategory =
  | 'basics'
  | 'color'
  | 'shape'
  | 'perfume'
  | 'style'
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
  // 아래 3개는 검색 수요(자동완성 상위) 기준으로 연 축 — 각 무료 도구로 보내는 유입 글이 쌓인다.
  { code: 'color', koLabel: '퍼스널컬러', enLabel: 'Personal Color', emoji: '🎨', color: '#7c5cff' },
  { code: 'shape', koLabel: '얼굴형', enLabel: 'Face Shape', emoji: '🪞', color: '#0ea5e9' },
  { code: 'perfume', koLabel: '향수', enLabel: 'Perfume', emoji: '🌷', color: '#d946ef' },
  { code: 'style', koLabel: '추구미·스타일', enLabel: 'Style', emoji: '🪄', color: '#f59e0b' },
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
  /** Context-aware headline for the in-article AI-analysis upsell CTA. */
  ctaHook?: string
}

export function getGuideCategoryMeta(code: GuideCategory): GuideCategoryMeta {
  return GUIDE_CATEGORIES.find((c) => c.code === code) || GUIDE_CATEGORIES[0]
}
