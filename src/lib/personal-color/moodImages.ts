// Mood image + signature palette for personal-color result cards — single edit point.
//
// 이미지는 비워둠(보류) → MoodCard가 시즌색 그라데이션 + 이모지로 폴백 렌더링한다
// (빨간 깨진-이미지 박스 없음). 운영자 사진 준비 후 아래 OVERRIDES의 image에 채우면
// 즉시 반영된다. LoremFlickr 등 키워드 스톡은 엉뚱한 사진(가방·고양이상 등)을 가져와
// 무드를 깨므로 쓰지 않는다. 얼굴 최소화. 모델 인종 제한 없음(글로벌 전환, 2026-07-12 §8 개정) — AI 생성 인물도 데모/장식용은 허용하되 실제 고객·후기처럼 포장하지 않는다.
// palette(hex)는 PaletteCard 전용으로 계속 유지한다.

import { SEASON_ORDER, type SeasonCode } from './types'

export interface SeasonMood {
  /** 메인 무드 이미지 — 없으면 시즌색 그라데이션+이모지 폴백. */
  image?: string
  /** 핵심 팔레트 — signature colors as hex swatches. */
  palette: { label: string; hex: string }[]
}

// 운영자 편집 지점: spring: { image: '/mood/pc-spring.jpg' } 형태로 추가.
const OVERRIDE_IMAGES: Partial<Record<SeasonCode, string>> = {
  // 2026-07-22 생성(scripts/gen-mood-images.mjs). 얼굴이 아니라 **계절 팔레트**가 주인공이다
  // — 색 자체가 진단 내용이라, 인물을 세우면 오히려 그 색이 안 보인다.
  spring: '/mood/pc-spring.webp',
  summer: '/mood/pc-summer.webp',
  autumn: '/mood/pc-autumn.webp',
  winter: '/mood/pc-winter.webp',
}

const PALETTES: Record<SeasonCode, { label: string; hex: string }[]> = {
  spring: [
    { label: '코랄', hex: '#ff7f6b' },
    { label: '피치', hex: '#ffb997' },
    { label: '아이보리', hex: '#f7efe1' },
    { label: '샛노랑', hex: '#ffd34e' },
    { label: '민트', hex: '#9fe3c5' },
  ],
  summer: [
    { label: '로즈', hex: '#e7a6b8' },
    { label: '라벤더', hex: '#c3b3e0' },
    { label: '파우더블루', hex: '#a8c6e8' },
    { label: '쿨민트', hex: '#a9ddd2' },
    { label: '소프트그레이', hex: '#cfd2da' },
  ],
  autumn: [
    { label: '브릭', hex: '#b5563a' },
    { label: '카멜', hex: '#c08a52' },
    { label: '머스타드', hex: '#cf9f3b' },
    { label: '카키', hex: '#7c7a4d' },
    { label: '딥브라운', hex: '#6e4a32' },
  ],
  winter: [
    { label: '퓨어화이트', hex: '#f7f8fb' },
    { label: '푸시아', hex: '#d6286f' },
    { label: '로열블루', hex: '#2657c7' },
    { label: '에메랄드', hex: '#0f9e74' },
    { label: '트루블랙', hex: '#1a1a22' },
  ],
}

export const SEASON_MOOD: Record<SeasonCode, SeasonMood> = Object.fromEntries(
  SEASON_ORDER.map((c) => [c, { image: OVERRIDE_IMAGES[c], palette: PALETTES[c] }]),
) as Record<SeasonCode, SeasonMood>
