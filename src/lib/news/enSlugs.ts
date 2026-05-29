// Slugs of news items that have a hand-written English version under /en/news/.
// Tiny standalone module (no bodies) so the i18n context and nav can import the
// list cheaply. Keep in sync with NEWS_ITEMS_EN in items.en.ts.
export const EN_NEWS_SLUGS = [
  'k-beauty-us-overtakes-france-2026',
  'sephora-k-beauty-bestsellers-2026',
] as const

export const EN_NEWS_SLUG_SET: ReadonlySet<string> = new Set(EN_NEWS_SLUGS)

export function hasEnNews(slug: string): boolean {
  return EN_NEWS_SLUG_SET.has(slug)
}
