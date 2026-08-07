// Slugs of product items that have an English version under /en/products/.
// Auto-maintained by scripts/gen-products.mjs (kept in sync with PRODUCT_ITEMS_EN
// in items.en.ts). Tiny standalone module so nav/i18n can import it cheaply.
export const EN_PRODUCT_SLUGS = [
  'tamburins-shell-perfume-hand-chamo',
  'dyson-airstrait-straightener',
  'cosrx-the-6-peptide-skin-booster-serum',
  'dior-backstage-glow-maximizer-face-palette',
  'peripera-pure-blushed-sunshine-cheek-12-sunny-pink',
  'milk-makeup-hydro-grip-primer',
  'peripera-all-take-mood-palette-04-cool-tone-dm-please',
  'kylie-cosmetics-matte-liquid-lipstick',
  'tamburins-perfume-chamo',
  'amika-perk-up-dry-shampoo',
  'dr-g-red-blemish-clear-soothing-cream-ex',
  'dior-backstage-rosy-glow-blush',
  'lilybyred-love-beam-cheek-balm-06-peach-beam',
  'charlotte-tilbury-beautiful-skin-foundation',
  'romand-han-all-fix-mascara-long-ash',
  'fenty-skin-cherry-treat-conditioning-strengthening-lip-oil',
  'tamburins-perfume-hand-000',
  'kerastase-elixir-ultime-l-huile-originale',
  'round-lab-birch-juice-moisturizing-sun-cream',
  'nars-the-multiple',
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
