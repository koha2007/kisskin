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
