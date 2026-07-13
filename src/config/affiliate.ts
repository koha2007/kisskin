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

// ════════════════════════════════════════════════════════════════════
// 글로벌 머천트 — 승인 나면 **여기만** 고친다 (링크 빌더가 알아서 트래킹 링크로 바뀐다).
// 지금은 둘 다 미승인이라 일반 검색 링크로 나가고, 수익은 0이다.
// ════════════════════════════════════════════════════════════════════

/**
 * YesStyle — Commission Factory 를 통해 운영되는 K-뷰티 글로벌 리테일러.
 * 판매 건수 시계가 없어 트래픽이 적어도 지금 신청해도 안전하다.
 *
 * 승인 절차: CF 퍼블리셔 가입 → 사이트 소유 확인(검증 메타태그는 pages/+Head.tsx 에 이미 있음)
 *          → YesStyle 머천트 신청 → 승인 → 딥링크 프리픽스 수령.
 * 승인 후: approved=true + deeplinkPrefix 를 CF 가 준 값으로 채운다.
 */
export const YESSTYLE_AFFILIATE = {
  approved: false,
  /** CF 딥링크 프리픽스. 최종 목적지 URL 을 encodeURIComponent 해서 뒤에 붙인다. */
  deeplinkPrefix: '',
}

/**
 * Amazon Associates.
 *
 * ⚠️ 의도적으로 미신청 상태다. Amazon 은 **신청한 시점부터** 180일 안에 적격 판매 3건을
 *    못 채우면 계정을 닫는다(본인·가족 구매는 카운트 안 됨). 영문 트래픽이 거의 없는 지금
 *    신청하면 글이 검색에 자리 잡기도 전에 시계가 타버린다.
 *    → GA4 affiliate_click(merchant=amazon) 클릭이 실제로 쌓이기 시작한 뒤에 신청할 것.
 */
export const AMAZON_AFFILIATE = {
  approved: false,
  /** 승인 시 발급되는 Associate Tag (예: kissinskin-20). */
  associateTag: '',
}

/** 이 머천트 클릭이 실제로 돈이 되는가 — GA4 에서 "클릭은 있는데 수익 0"을 구분하기 위함. */
export function isMerchantMonetized(merchant: string): boolean {
  if (merchant === 'coupang' || merchant === 'clubclio') return true
  if (merchant === 'yesstyle') return YESSTYLE_AFFILIATE.approved
  if (merchant === 'amazon') return AMAZON_AFFILIATE.approved
  return false
}

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

// Substring match for free-text brand strings (e.g. "Peripera (한국)") — unlike
// AFFILIATE_CONFIG.clio.shouldShow, which expects an exact-token brand list.
export function clioBrandMatch(text: string): boolean {
  const lower = text.toLowerCase()
  return CLIO_BRAND_TOKENS.some((token) => lower.includes(token.toLowerCase()))
}
