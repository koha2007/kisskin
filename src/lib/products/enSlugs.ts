// Slugs of product items that have an English version under /en/products/.
// Auto-maintained by scripts/gen-products.mjs (kept in sync with PRODUCT_ITEMS_EN
// in items.en.ts). Tiny standalone module so nav/i18n can import it cheaply.
export const EN_PRODUCT_SLUGS = [
  'romand-better-than-cheek-n02-vine-nude',
  'rare-beauty-always-an-optimist-pore-diffusing-primer',
  'hince-signature-brow-shaper-clear',
  'rare-beauty-soft-pinch-tinted-lip-oil',
  'nonfiction-santal-cream-hand-cream',
  'k18-leave-in-molecular-repair-hair-mask',
  'anua-heartleaf-silky-moisture-sun-cream',
  'charlotte-tilbury-pillow-talk-lip-cheek-glow-colour-of-dreams',
  'rare-beauty-soft-pinch-liquid-blush',
  'espoir-pro-tailor-be-velvet-cover-cushion-new-class',
  'kaja-beauty-bento-bouncy-shimmer-eyeshadow-trio-orange-blossom',
  'romand-lip-matter',
  'naming-high-dew-lip-glaze',
  'dinto-bare-gloss',
  'romnd-glasting-water-tint-sample',
] as const

export const EN_PRODUCT_SLUG_SET: ReadonlySet<string> = new Set(EN_PRODUCT_SLUGS)

export function hasEnProduct(slug: string): boolean {
  return EN_PRODUCT_SLUG_SET.has(slug)
}
