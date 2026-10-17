// Mood imagery for face-shape result cards — single edit point for operator photos.
//
// 현재는 비어 있음(이미지 무드 보류). 비어 있으면 결과 카드의 MoodCard/ImageCard가
// 유형색 그라데이션 + 이모지로 폴백 렌더링한다(빨간 깨진-이미지 박스 없음).
// 운영자 사진 준비 후 아래 OVERRIDES에 유형별로 채우면 즉시 반영된다.
// 자동 키워드 스톡(LoremFlickr 등)은 엉뚱한 사진을 가져와 무드를 깨므로 쓰지 않는다.
// 얼굴 최소화. 모델 인종 제한 없음(글로벌 전환, 2026-07-12 §8 개정) — AI 생성 인물도 데모/장식용은 허용하되 실제 고객·후기처럼 포장하지 않는다.

import { FACE_SHAPE_ORDER, type FaceShapeCode } from './types'

export interface ToolMood {
  /** 메인 무드 이미지(3:4) — 없으면 그라데이션+이모지 폴백. */
  image?: string
  /** 메이크업 무드 이미지(4:5) — 선택. */
  makeupImage?: string
  /** 스타일/패션 무드 이미지(4:5) — 선택. */
  fashionImage?: string
  /** 남성 인물(3:4) — 랜딩 카드의 여성/남성 전환용 */
  imageMale?: string
  /** 같은 여성 인물 + 이 얼굴형 추천 룩(3:4) — 결과 화면 비포/애프터 */
  lookImage?: string
  /** 결과 카드(IdentityCard) 아치 창 일러스트(2:3) */
  cardArt?: string
}

const art = (c: FaceShapeCode): ToolMood => ({
  image: `/mood/fs-${c}.webp`,
  imageMale: `/mood/fs-${c}-m.webp`,
  lookImage: `/mood/fs-${c}-look.webp`,
  cardArt: `/cards/fs-${c}.webp`,
})

// 운영자 편집 지점: oval: { image: '/mood/face-oval.jpg', makeupImage: '…' } 형태로 추가.
const OVERRIDES: Partial<Record<FaceShapeCode, ToolMood>> = {
  // 2026-07-22 생성(scripts/gen-mood-images.mjs). 여기만 인물을 쓴다 —
  // 얼굴 윤곽 자체가 진단 내용이라 정물로는 전달이 안 된다.
  // 메이크업을 최소화해 턱선·이마 폭이 그대로 읽히도록 생성했다.
  // 2026-10-17 호감형 재촬영(gpt-image-2): 크림 스튜디오·옅은 미소·니트 통일, 여성·남성 각 5,
  // 한국인 위주 + 다양한 인종. 전엔 회색 배경·무표정·여성만이라 증명사진처럼 차가웠다.
  oval: art('oval'),
  round: art('round'),
  square: art('square'),
  oblong: art('oblong'),
  heart: art('heart'),
}

export const FACE_SHAPE_MOOD: Record<FaceShapeCode, ToolMood> = Object.fromEntries(
  FACE_SHAPE_ORDER.map((c) => [c, OVERRIDES[c] ?? {}]),
) as Record<FaceShapeCode, ToolMood>
