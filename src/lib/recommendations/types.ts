// Shared ProductRecommendation type used across all 3 diagnostic tools.
// Coupang Partners search affiliate active 2026-05-09.

export interface ProductRec {
  category: string              // "립", "쿠션", "아이섀도", "블러셔", "컨투어" 등
  title: string                 // "코랄 오렌지 틴트 립"
  features: string[]            // 3가지 핵심 특징
  brandExamples: string[]       // 2~3개 브랜드 예시 (사용자 검색 참고용)
  whyForType: string            // 왜 이 유형에 어울리는지 (1~2 문장)
  searchKeywords: string        // 향후 Google Shopping / 제휴 링크용 검색어
  icon: string                  // material-symbols icon
  affiliateUrl?: string         // AdSense 승인 후 채워 넣을 제휴 URL (옵션)
}

/**
 * AFFILIATE_ENABLED — AdSense 승인 후 true로 변경하면
 * 제품 카드에 실제 구매 버튼이 활성화됩니다.
 *
 * 활성화 체크리스트:
 * 1. AdSense 승인 확정
 * 2. Privacy Policy에 제휴 프로그램 참여 공지 추가
 * 3. 각 ProductRec에 affiliateUrl 입력 (또는 Google Shopping 검색 URL)
 * 4. AFFILIATE_ENABLED = true
 */
export const AFFILIATE_ENABLED = true

/** Coupang Partners 검색 어필리에이트 ID — 환영 메일 발급 (2026-05-09) */
const COUPANG_TRACKING_CODE = 'AF6657739'

/** 쿠팡 검색 어필리에이트 링크 빌더 — 모든 검색 키워드에 자동 적용 */
export function buildSearchLink(query: string): string {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(query)}&channel=affiliate&trackingCode=${COUPANG_TRACKING_CODE}`
}
