// Slugs of product items that have an English version under /en/products/.
// Auto-maintained by scripts/gen-products.mjs (kept in sync with PRODUCT_ITEMS_EN
// in items.en.ts). Tiny standalone module so nav/i18n can import it cheaply.
export const EN_PRODUCT_SLUGS = [
  'dinto-bare-gloss',
  'romnd-glasting-water-tint-sample',
] as const

export const EN_PRODUCT_SLUG_SET: ReadonlySet<string> = new Set(EN_PRODUCT_SLUGS)

export function hasEnProduct(slug: string): boolean {
  return EN_PRODUCT_SLUG_SET.has(slug)
}
