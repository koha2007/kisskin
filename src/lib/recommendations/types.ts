// Shared ProductRecommendation type used across all 3 diagnostic tools.
// Purchase links deliberately NOT included until AdSense approval lands.
// When ready, flip AFFILIATE_ENABLED and populate `affiliateUrl`.

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

/** 향후 Google Shopping 검색 링크 빌더 — 제휴 전 임시로 안전하게 사용 가능 */
export function buildSearchLink(query: string): string {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`
}
