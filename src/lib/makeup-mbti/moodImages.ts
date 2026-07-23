// Mood imagery for makeup-MBTI result cards — single edit point for operator photos.
//
// 현재는 비어 있음(이미지 무드 보류). 비어 있으면 결과 카드의 MoodCard/ImageCard가
// 유형색 그라데이션 + 이모지로 폴백 렌더링한다(빨간 깨진-이미지 박스 없음).
// 운영자 사진 준비 후 아래 OVERRIDES에 유형별로 채우면 즉시 반영된다.
// 자동 키워드 스톡(LoremFlickr 등)은 엉뚱한 사진을 가져와 무드를 깨므로 쓰지 않는다.
// 얼굴 최소화. 모델 인종 제한 없음(글로벌 전환, 2026-07-12 §8 개정) — AI 생성 인물도 데모/장식용은 허용하되 실제 고객·후기처럼 포장하지 않는다.

import { MBTI_ORDER, type MbtiCode } from './types'

export interface ToolMood {
  /** 메인 무드 이미지(3:4) — 없으면 그라데이션+이모지 폴백. */
  image?: string
  /** 메이크업 무드 이미지(4:5) — 선택. */
  makeupImage?: string
  /** 스타일 무드 이미지(4:5) — 선택. */
  fashionImage?: string
}

// 운영자 편집 지점: ENFP: { image: '/mood/mbti-enfp.jpg' } 형태로 추가.
//
// 2026-07-23 생성(scripts/gen-mood-images.mjs). **여기만 정물이다** — 얼굴형이
// 인물을 쓰는 것과 반대 이유다. 16장이 랜딩 한 그리드에 깔리는데 인물을 세우면
// 유형을 가르는 색이 얼굴에 묻힌다. 색은 groupColors.ts 의 4역할군
// (NT 틸 / NF 세이지 / SJ 인디고 / SP 머스터드)으로 묶어, 개별 유형보다
// 그룹이 먼저 읽히게 했다.
//
// ⚠️ 결과 페이지의 격자는 이 사진이 아니라 **추천 룩의 실제 결과 사진**을 우선한다
// (MakeupMbtiResult.tsx 의 `lookPhoto(...) ?? mood.image`). 우리가 진짜로 만들어내는
// 결과물은 결과 페이지에서만 보여준다는 원칙이다. 여기 사진은 랜딩 카드와
// 롱폼 본문의 무드용이다.
const OVERRIDES: Partial<Record<MbtiCode, ToolMood>> = {
  INTJ: { image: '/mood/mb-intj.webp' },
  INTP: { image: '/mood/mb-intp.webp' },
  ENTJ: { image: '/mood/mb-entj.webp' },
  ENTP: { image: '/mood/mb-entp.webp' },
  INFJ: { image: '/mood/mb-infj.webp' },
  INFP: { image: '/mood/mb-infp.webp' },
  ENFJ: { image: '/mood/mb-enfj.webp' },
  ENFP: { image: '/mood/mb-enfp.webp' },
  ISTJ: { image: '/mood/mb-istj.webp' },
  ISFJ: { image: '/mood/mb-isfj.webp' },
  ESTJ: { image: '/mood/mb-estj.webp' },
  ESFJ: { image: '/mood/mb-esfj.webp' },
  ISTP: { image: '/mood/mb-istp.webp' },
  ISFP: { image: '/mood/mb-isfp.webp' },
  ESTP: { image: '/mood/mb-estp.webp' },
  ESFP: { image: '/mood/mb-esfp.webp' },
}

export const MBTI_MOOD: Record<MbtiCode, ToolMood> = Object.fromEntries(
  MBTI_ORDER.map((c) => [c, OVERRIDES[c] ?? {}]),
) as Record<MbtiCode, ToolMood>
