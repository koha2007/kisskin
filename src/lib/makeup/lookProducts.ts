// AI 메이크업 결과 화면의 "이 룩 따라 하기" 제품 — 룩별 방법 데이터(LOOK_HOWTO)가 단일 소스.
// ────────────────────────────────────────────────────────────────────
// 2026-11-02: 어떤 룩이든 같은 고정 제품 3개 + "플레이스홀더" 문구가 나오던 것을 교체.
// 단계별 검색어는 /looks/{id}/ 의 구매 링크와 같은 값이다(check:keywords 가 howto.ts 를 검사).
// 링크는 "제품 종류 검색"이지 특정 제품 추천이 아니다 → 브랜드 예시를 넣지 않는다.
import { LOOK_HOWTO, AREA_LABEL, type HowToArea } from '../looks/howto'
import type { MakeupStyleId } from './styles'
import type { ProductRec } from '../recommendations/types'

const AREA_ICON: Record<HowToArea, string> = {
  skin: 'water_drop',
  brows: 'edit',
  eyes: 'visibility',
  cheeks: 'blur_on',
  lips: 'favorite',
  hair: 'content_cut',
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function lookProducts(styleId: MakeupStyleId): ProductRec[] {
  return LOOK_HOWTO[styleId].steps.map((step) => ({
    category: AREA_LABEL[step.area].ko,
    categoryEn: AREA_LABEL[step.area].en,
    title: step.searchKeywords,
    titleEn: capitalize(step.shopEn),
    features: [],
    brandExamples: [],
    whyForType: step.titleKo,
    whyForTypeEn: step.titleEn,
    searchKeywords: step.searchKeywords,
    searchKeywordsEn: step.shopEn,
    icon: AREA_ICON[step.area],
  }))
}
