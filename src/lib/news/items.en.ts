import type { NewsItem } from './types'

// Hand-written English news items — not machine translations. Same slugs as
// their Korean counterparts so the language toggle and hreflang map one-to-one.
// Keep EN_NEWS_SLUGS (enSlugs.ts) in sync with this list.
export const NEWS_ITEMS_EN: NewsItem[] = [
  {
    slug: 'k-beauty-us-overtakes-france-2026',
    category: 'global',
    title: 'US K-Beauty Imports Overtake France for the First Time in 2026',
    summary:
      'In 2026, Korea passed France to become the top source of US cosmetics imports. We break down the customs data and what drove it.',
    body: [
      '> KEY: In the first half of 2026, Korea overtook France in US cosmetics import value for the first time — a signal that K-beauty is no longer a niche but a mainstream category.',
      'According to US Department of Commerce Q1 2026 import figures, the value of Korean cosmetics imports passed France’s for the first time — a structural shift roughly two years after the 2024 global K-beauty boom.',
      '## The numbers',
      'In Q1 2026, US imports of Korean cosmetics rose 28% year over year, while French imports grew just 4%. Skincare led the Korean surge.',
      'France has long been the home of luxury fragrance and cosmetics and the #1 source of US imports. Korea passing it reflects a mix of price competitiveness and the pull of K-content — K-pop and K-dramas.',
      '## What drove the growth',
      'Three forces stand out. First, reasonable pricing. Second, fast trend cycles and product innovation — cushions, sheet masks, snail mucin. Third, sharply better access as Olive Young expanded globally and listings grew on Amazon and Sephora.',
      '## The outlook',
      'Analysts expect the trend to hold for now, though shifts in US tariff policy and the rise of China’s C-beauty are variables. Korean brands are responding by strengthening premium lines and adding local production.',
      '> DATA: US cosmetics imports, Q1 2026 — Korea +28% YoY, France +4% YoY (US Dept. of Commerce).',
      'Reaching #1 means more than a number. It marks K-beauty’s move from the edge of the global beauty industry to its center — and opens a new window of opportunity for Korean brands.',
    ],
    date: '2026-04-28',
    readMinutes: 5,
    tags: ['K-beauty', 'Global', 'Market data', 'US'],
    featured: true,
    seoTitle: 'US K-Beauty Imports Pass France for #1 in 2026 — Analysis',
    seoDescription:
      'In 2026 Korea overtook France as the top source of US cosmetics imports. The customs data, growth drivers, and outlook.',
  },
  {
    slug: 'sephora-k-beauty-bestsellers-2026',
    category: 'global',
    title: '2026 Sephora K-Beauty Bestsellers: What US Shoppers Actually Buy',
    summary:
      'We analyze Sephora US’s H1 2026 K-beauty bestsellers — which Korean products American shoppers actually reach for.',
    body: [
      '> KEY: At Sephora US, skincare dominates the K-beauty bestsellers. American shoppers open their wallets for products that "make the skin itself better" more than for makeup.',
      'An analysis of Sephora US’s H1 2026 K-beauty bestsellers shows skincare sweeping the top ranks — evidence that the US perception of K-beauty has shifted from "makeup" to "skincare."',
      '## Skincare sweeps the top',
      'Seven of Sephora US’s top 10 K-beauty bestsellers are skincare — toners, essences, serums, and sunscreens, with calming and hydrating formulas especially strong.',
      '## The brands US shoppers chose',
      'The upper ranks include Anua (heartleaf toner), COSRX (snail essence), Belif (moisture cream), and Laneige (Lip Sleeping Mask). The common thread is reasonable prices and proven efficacy.',
      '## In makeup, lips lead',
      'Within makeup, lip products sold best — rom&nd and Laneige’s Lip Sleeping Mask among them — favored for natural payoff with built-in moisture.',
      '> DATA: Of Sephora US’s H1 2026 K-beauty top 10, seven are skincare and three are makeup (mostly lip).',
      'The data reconfirms that K-beauty’s core strength in the US market is skincare — and Korean brands are leaning into it.',
    ],
    date: '2026-03-30',
    readMinutes: 5,
    tags: ['Sephora', 'K-beauty', 'Bestseller', 'US'],
    seoTitle: '2026 Sephora K-Beauty Bestsellers — What US Shoppers Buy',
    seoDescription:
      'Analysis of Sephora US H1 2026 K-beauty bestsellers: why skincare swept the top and what it says about US shoppers.',
  },
]

export function getNewsBySlugEn(slug: string): NewsItem | undefined {
  return NEWS_ITEMS_EN.find((n) => n.slug === slug)
}
