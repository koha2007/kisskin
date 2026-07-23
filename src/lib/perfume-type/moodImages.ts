// Mood imagery for perfume-type result cards — single edit point for operator photos.
//
// 현재는 비어 있음(이미지 무드 보류). 비어 있으면 결과 카드의 MoodCard/ImageCard가
// 유형색 그라데이션 + 이모지로 폴백 렌더링한다(빨간 깨진-이미지 박스 없음).
// 운영자 사진 준비 후 아래 OVERRIDES에 유형별로 채우면 즉시 반영된다.
// 자동 키워드 스톡(LoremFlickr 등)은 엉뚱한 사진을 가져와 무드를 깨므로 쓰지 않는다.
// 얼굴 최소화. 모델 인종 제한 없음(글로벌 전환, 2026-07-12 §8 개정) — AI 생성 인물도 데모/장식용은 허용하되 실제 고객·후기처럼 포장하지 않는다.

import { PERFUME_TYPE_ORDER, type PerfumeTypeCode } from './types'

export interface ToolMood {
  /** 메인 무드 이미지(3:4) — 없으면 그라데이션+이모지 폴백. */
  image?: string
  /** 메이크업 무드 이미지(4:5) — 선택. */
  makeupImage?: string
  /** 향/분위기 무드 이미지(4:5) — 선택. */
  fashionImage?: string
}

// 운영자 편집 지점: floral: { image: '/mood/perfume-floral.jpg' } 형태로 추가.
const OVERRIDES: Partial<Record<PerfumeTypeCode, ToolMood>> = {
  // 2026-07-22 생성(scripts/gen-mood-images.mjs). 향은 눈에 보이지 않으므로
  // 그 향이 떠오르는 정물/장면으로 간다. 얼굴 없음.
  floral: { image: '/mood/pt-floral.webp' },
  citrus: { image: '/mood/pt-citrus.webp' },
  woody: { image: '/mood/pt-woody.webp' },
  amber: { image: '/mood/pt-amber.webp' },
  fresh: { image: '/mood/pt-fresh.webp' },
  gourmand: { image: '/mood/pt-gourmand.webp' },
}

export const PERFUME_MOOD: Record<PerfumeTypeCode, ToolMood> = Object.fromEntries(
  PERFUME_TYPE_ORDER.map((c) => [c, OVERRIDES[c] ?? {}]),
) as Record<PerfumeTypeCode, ToolMood>
