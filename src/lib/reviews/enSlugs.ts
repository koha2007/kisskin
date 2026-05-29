// Slugs of reviews that have a hand-written English version under /en/reviews/.
// Tiny standalone module (no bodies) so the i18n context and nav can import the
// list cheaply. Keep in sync with REVIEW_POSTS_EN in posts.en.ts.
export const EN_REVIEW_SLUGS = [
  'global-bestseller-lipstick-top-10',
  'k-beauty-skincare-bestsellers-comparison',
  'cushion-foundation-comparison-best-5',
] as const

export const EN_REVIEW_SLUG_SET: ReadonlySet<string> = new Set(EN_REVIEW_SLUGS)

export function hasEnReview(slug: string): boolean {
  return EN_REVIEW_SLUG_SET.has(slug)
}
