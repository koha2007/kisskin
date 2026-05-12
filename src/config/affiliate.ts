// Centralised affiliate configuration.
// Single source of truth for merchant links, IDs, and display labels.
// Adding a new merchant: extend AFFILIATE_CONFIG + (optionally) categoryMapping helpers.

export type ClioCategory = 'main' | 'base' | 'lip' | 'eye' | 'cheek'

const CLIO_LINKS: Record<ClioCategory, string> = {
  main: 'https://newtip.net/click.php?m=clubclio&a=A100704523&l=0000',
  base: 'https://newtip.net/click.php?m=clubclio&a=A100704523&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fclubclio.co.kr%2Fshop%2FgoodsList%2F120701000000000',
  lip: 'https://newtip.net/click.php?m=clubclio&a=A100704523&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fclubclio.co.kr%2Fshop%2FgoodsList%2F120702000000000',
  eye: 'https://newtip.net/click.php?m=clubclio&a=A100704523&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fclubclio.co.kr%2Fshop%2FgoodsList%2F120703000000000',
  cheek: 'https://newtip.net/click.php?m=clubclio&a=A100704523&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fclubclio.co.kr%2Fshop%2FgoodsList%2F120704000000000',
}

const COUPANG_LPTAG = 'AF6657739'

const CLIO_BRAND_TOKENS = ['클리오', 'CLIO', 'Clio', '페리페라', 'PERIPERA', 'Peripera']

export const AFFILIATE_CONFIG = {
  coupang: {
    enabled: true,
    name: '쿠팡',
    lptag: COUPANG_LPTAG,
    buildUrl: (query: string) =>
      `https://www.coupang.com/np/search?q=${encodeURIComponent(query)}&lptag=${COUPANG_LPTAG}`,
  },

  clio: {
    enabled: true,
    name: '클리오',
    nameEn: 'CLIO',
    affiliateId: 'A100704523',
    platform: 'linkprice',
    links: CLIO_LINKS,
    shouldShow: (brandExamples: string[]): boolean =>
      brandExamples.some((b) => CLIO_BRAND_TOKENS.includes(b)),
  },

  // Future merchants (kept disabled until approved + IDs land).
  coskr: {
    enabled: false,
    name: '코스코리아',
    affiliateId: '',
    platform: 'linkprice',
    links: {} as Record<string, string>,
  },
} as const

export const CLIO_CATEGORY_LINKS = CLIO_LINKS
