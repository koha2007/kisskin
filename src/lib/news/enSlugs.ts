// Slugs of news items that have a hand-written English version under /en/news/.
// Tiny standalone module (no bodies) so the i18n context and nav can import the
// list cheaply. Keep in sync with NEWS_ITEMS_EN in items.en.ts.
export const EN_NEWS_SLUGS = [
  'kbeauty-sun-serum-surge-2026',
  'keyring-beauty-summer-trend-2026',
  'shopee-kbeauty-soothing-june-2026',
  'k-beauty-quick-beauty-sisungbi-trend-2026',
  'ysl-beauty-luxury-makeup-refill-expansion-2026',
  'k-beauty-toner-china-sales-decline-2026',
  'k-beauty-mna-challenges-global-giants-2026',
  'k-beauty-science-industry-pivot-2026',
  'k-beauty-us-overtakes-france-2026',
  'sephora-k-beauty-bestsellers-2026',
] as const

export const EN_NEWS_SLUG_SET: ReadonlySet<string> = new Set(EN_NEWS_SLUGS)

export function hasEnNews(slug: string): boolean {
  return EN_NEWS_SLUG_SET.has(slug)
}
