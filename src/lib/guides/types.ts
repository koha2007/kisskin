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
  { code: 'basics', koLabel: '기초', enLabel: 'Basics', emoji: '✨', color: '#d8503c' },
  // 아래 3개는 검색 수요(자동완성 상위) 기준으로 연 축 — 각 무료 도구로 보내는 유입 글이 쌓인다.
  { code: 'color', koLabel: '퍼스널컬러', enLabel: 'Personal Color', emoji: '🎨', color: '#8e6e9e' },
  { code: 'shape', koLabel: '얼굴형', enLabel: 'Face Shape', emoji: '🪞', color: '#4e9fa6' },
  { code: 'perfume', koLabel: '향수', enLabel: 'Perfume', emoji: '🌷', color: '#8e6e9e' },
  { code: 'style', koLabel: '추구미·스타일', enLabel: 'Style', emoji: '🪄', color: '#c79340' },
  { code: 'lip', koLabel: '립', enLabel: 'Lip', emoji: '💋', color: '#d8503c' },
  { code: 'eye', koLabel: '아이', enLabel: 'Eye', emoji: '👁️', color: '#8e6e9e' },
  { code: 'base', koLabel: '베이스', enLabel: 'Base', emoji: '✨', color: '#c79340' },
  { code: 'cheek', koLabel: '치크', enLabel: 'Cheek', emoji: '🌸', color: '#b03e2d' },
  { code: 'tpo', koLabel: 'TPO', enLabel: 'TPO', emoji: '🎯', color: '#4e9fa6' },
  { code: 'glasses', koLabel: '안경 메이크업', enLabel: 'Glasses', emoji: '👓', color: '#7e9b6a' },
  { code: 'longevity', koLabel: '지속력', enLabel: 'Longevity', emoji: '⏱️', color: '#4a5488' },
  { code: 'tools', koLabel: '도구', enLabel: 'Tools', emoji: '🖌️', color: '#4a5488' },
]

export interface GuidePost {
  slug: string
  category: GuideCategory
  title: string
  summary: string
  /**
   * 검색결과 전용 제목/설명. 없으면 title·summary 를 쓴다(뉴스·제품과 같은 패턴).
   *
   * 왜 따로 두나: `title` 은 H1 이자 글의 정체성이라 짧게 깎으면 본문이 상한다.
   * 그런데 구글은 제목을 **약 60자**, 설명을 **약 160자**에서 자른다. 편집 제목이
   * 그보다 길면 뒷부분이 "…" 로 사라지므로, 자를 위치를 우리가 정하는 편이 낫다.
   * (2026-08-15 실측: EN 가이드·리뷰 11개가 60자 초과, 5개가 160자 초과.
   *  길이가 맞는 페이지들의 CTR 이 눈에 띄게 높았다 — makeup-mbti 56자 6.2% vs
   *  personal-color-analysis-korea 122자 ~0%.)
   */
  seoTitle?: string
  seoDescription?: string
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
