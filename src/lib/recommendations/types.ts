// Shared ProductRecommendation type used across all 3 diagnostic tools.
// Coupang Partners search affiliate active 2026-05-09.

/**
 * searchKeywords 작성 규칙 — 위반 시 `npm run check:keywords` 실패
 *
 * 1. ≤ 5 단어 (공백 기준). 6단어 이상은 쿠팡 AND 검색에서 결과 0건 위험
 * 2. 제품 속성만: 컬러 / 질감 / 제품 타입 / 퍼스널컬러 / 호수
 * 3. 금지 — 위치·행동 설명: 광대, 헤어라인, 콧등, 둥글게, 사선, 세로, 가로, V자
 * 4. 금지 — 얼굴형 호칭: 각진형, 둥근형, 긴형, 하트형, 계란형
 * 5. 금지 — 부정 어감: "번짐" 단독 (단, "번짐 방지"는 허용)
 * 6. 금지 — 인칭 구문: "내 입술 같은" 등
 *
 * 좋은 예: '봄웜톤 코랄 피치 틴트 립', 'MLBB 로즈 틴트 시어'
 * 나쁜 예: '파우더 하이라이터 광대 둥글게' (위치 설명+행동), '겨울쿨톤 정순 레드 블랙 체리 와인 플럼 립' (8단어)
 */
export interface ProductRec {
  category: string              // "립", "쿠션", "아이섀도", "블러셔", "컨투어" 등
  title: string                 // "코랄 오렌지 틴트 립"
  features: string[]            // 3가지 핵심 특징
  brandExamples: string[]       // 2~3개 브랜드 예시 (사용자 검색 참고용)
  whyForType: string            // 왜 이 유형에 어울리는지 (1~2 문장)
  searchKeywords: string        // 쿠팡 어필리에이트 검색 키워드 (위 규칙 준수)
  icon: string                  // material-symbols icon
  affiliateUrl?: string         // 단축링크 또는 직접 URL (있으면 searchKeywords 무시)
  // English variants — used when locale === 'en'. Optional;
  // when absent, the KO fields are shown.
  categoryEn?: string
  titleEn?: string
  featuresEn?: string[]
  whyForTypeEn?: string
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

/** Coupang Partners 추적 파라미터 — 실제 단축링크 리디렉션 결과에서 확인 (2026-05-09) */
const COUPANG_LPTAG = 'AF6657739'

/** 쿠팡 검색 어필리에이트 링크 빌더 — 모든 검색 키워드에 자동 적용 */
export function buildSearchLink(query: string): string {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(query)}&lptag=${COUPANG_LPTAG}`
}
