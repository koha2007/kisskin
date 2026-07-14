import type { NewsCategory } from '../news/types'
import type { ClioCategory } from '../../config/affiliate'

// "메이크업 제품" (Makeup Products) — a daily, photo-led product-showcase feed.
// Unlike news (text-forward articles), each item leads with a visual and only a
// few short highlights, then affiliate buy buttons. Auto-generated daily by
// scripts/gen-products.mjs (KO) + auto-translated to EN (items.en.ts).
//
// Categories reuse the news taxonomy (lip/eye/base/cheek/skincare/fragrance/
// hair/trend/global) so the category chips, colors and emoji stay consistent
// across the whole site.
export interface ProductPost {
  slug: string
  category: NewsCategory
  /** Brand name (romanized for EN in items.en.ts). */
  brand: string
  /** Product name / line. */
  name: string
  /** Card + SEO headline (brand + product + hook). */
  title: string
  /** 1–2 sentence intro. Photo-led → kept short. */
  summary: string
  /** 2–4 short highlight bullets (why it's worth a look). */
  highlights: string[]
  /** Longer feature sentences (제형·발색·지속력·컬러 구성·사용팁 등). Detail page only. */
  details?: string[]
  // ── 아래는 상세 페이지 본문을 두껍게 하려고 2026-07-14 에 추가한 필드들 ──
  // 배경: 제품 상세가 726자밖에 안 돼 구글이 "크롤링됨 – 색인 안 됨"으로 버렸고(90개 미색인),
  // Commission Factory 도 같은 이유("콘텐츠가 채워지지 않음")로 퍼블리셔 신청을 반려했다.
  // 항목 구성은 CF 가 공개한 "좋은 제휴 리뷰란?" 가이드를 그대로 따랐다 —
  // 누구에게 맞나 / 사용법 / 장점 / 정직한 단점.
  // 모두 optional 이다: 이 필드들이 생기기 전에 발행된 제품은 없이도 정상 렌더된다.
  /** 어떤 사람·피부·상황에 맞는지 2문장. */
  whoFor?: string
  /** 실제 사용법·팁 2~3문장. */
  howTo?: string[]
  /** 장점 2~3개. */
  pros?: string[]
  /** 정직한 단점·호불호 1~2개. 없으면 비워 둔다 — 지어내지 말 것. */
  cons?: string[]
  /** 색조 제품에 한해 어울리는 퍼스널컬러 + 한 줄 이유(우리 진단 도구로 연결되는 지점). */
  colorFit?: string
  /** Hero image path — AI mood image at /products/{slug}.webp. Absent → design card. */
  image?: string
  /** Coupang search phrase (attribute/brand based, Korean — Coupang is a KR store). */
  coupangQuery: string
  /** English brand + product phrase for Amazon/YesStyle (global region). */
  globalQuery?: string
  /** Optional verified direct product URL — used before the search-link fallback. */
  affiliateUrl?: string
  /** Also show the Clio official-store button (color makeup only). */
  clio: boolean
  clioCategory: ClioCategory
  date: string
  tags: string[]
  featured?: boolean
  seoTitle?: string
  seoDescription?: string
}

// Re-export the shared category system so product pages don't import from news
// directly (keeps the domains loosely coupled if they ever diverge).
export {
  NEWS_CATEGORIES as PRODUCT_CATEGORIES,
  getCategoryMeta,
} from '../news/types'
export type { NewsCategory as ProductCategory, NewsCategoryMeta as ProductCategoryMeta } from '../news/types'
