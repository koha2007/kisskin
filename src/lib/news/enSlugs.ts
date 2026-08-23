// Slugs of news items that have a hand-written English version under /en/news/.
// Tiny standalone module (no bodies) so the i18n context and nav can import the
// list cheaply. Keep in sync with NEWS_ITEMS_EN in items.en.ts.
export const EN_NEWS_SLUGS = [
  'proya-launches-in-ulta-us',
  'seoul-beauty-week-global-k-beauty-industry-booms',
  'k-beauty-global-online-market-size-jumps-2025',
  'k-beauty-us-slowdown-channel-mix',
  'olive-young-fullmoon-makeup-shift-care-focus',
  'nooni-lip-oil-prime-day-north-america-surge',
  'peach-and-lily-zombie-cell-moisturizer-launch',
  'kiss-zoom-eye-potion-milk-tea-shades-launch',
  'kbeauty-exports-surpass-11-billion-global-growth',
  'mixsoon-pdrn-collagen-tinted-moisturizer-launch',
  'jung-saemmool-sephora-us-debut',
  'kbeauty-record-exports-us-top-market-h1-2026',
  'kbeauty-global-sales-surge-niq-report-july-2026',
  'mamonde-amazon-premium-beauty-launch',
  'kbeauty-gs-global-japan-distribution',
  'kbeauty-amazon-5-trends-2026-aug',
  'kbeauty-global-regulatory-summit-ai-2026-sept',
  'kbeauty-oliveyoung-sephora-us-edit-2026-aug',
  'global-makeup-high-adherence-fixer-primer-surge',
  'kbeauty-us-offline-expansion-1st-gen-revival-2026-aug',
  'kbeauty-h1-2026-us-top-export-market-diversification',
  'kbeauty-jelly-core-makeup-trend-cosmax-2026-july',
  'kbeauty-rx-derma-cosmetics-surge-2026-july',
  'tirtir-bts-the-city-newyork-makeup-collaboration-2026-july',
  'k-beauty-europe-export-surpasses-north-america-h1-2026',
  'k-beauty-ai-export-marketing-platform-newenai-2026-july',
  'k-beauty-third-phase-europe-suncare-haircare-2026-july',
  'k-beauty-phase3-europe-offline-surge-2026-july',
  'k-beauty-indonesia-halal-certification-2026-oct',
  'k-beauty-packaging-sustainability-recycling-challenge-2026-july',
  'k-beauty-ai-hair-platform-lianhair-2026-july',
  'k-beauty-mongolia-market-surge-cepa-2026-july',
  'k-beauty-latin-america-tiktok-surge-2026',
  'amazon-prime-day-2026-kbeauty-skinnification-pdrn',
  'k-beauty-global-sales-surge-niq-2026-july',
  'k-beauty-etf-us-launch-2026',
  'kbeauty-hair-care-export-surge-2026',
  'kbeauty-odm-record-q3-2026',
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
