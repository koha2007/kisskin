// Slugs of guides that have a hand-written English version under /en/guides/.
// Kept in a tiny standalone module (no guide bodies) so the i18n locale context
// and nav can import the list without pulling the full English guide text into
// their bundles. Keep in sync with GUIDE_POSTS_EN in posts.en.ts.
export const EN_GUIDE_SLUGS = [
  '10-minute-daily-makeup-routine',
  'cushion-foundation-no-cakiness-5-steps',
  'monolid-hooded-eye-makeup-techniques',
  'natural-no-makeup-makeup',
  'lipstick-stay-all-day-7-tips',
] as const

export const EN_GUIDE_SLUG_SET: ReadonlySet<string> = new Set(EN_GUIDE_SLUGS)

export function hasEnGuide(slug: string): boolean {
  return EN_GUIDE_SLUG_SET.has(slug)
}
