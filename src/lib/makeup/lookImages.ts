// 룩 카드용 비포/애프터 이미지 — 단일 소스 (스타일 선택 화면 + 홈 마퀴가 공유)
// ────────────────────────────────────────────────────────────────────
// scripts/gen-look-models.mjs 산출물. 룩마다 다른 모델 1명이 비포(민낯) → 애프터로.
// 애프터는 라이브 도구와 **동일한 경로**(gpt-image-2 + promptWholeFace)로 만든 실제
// 결과물이라 "우리 도구가 실제로 이렇게 바꿔준다"는 주장이 사실이다(§8).
//
// 재생성: set -a && . ./.dev.vars && set +a && node scripts/gen-look-models.mjs --force
import type { MakeupStyleId } from './styles'

export interface LookImage {
  /** 민낯 원본 */
  before: string
  /** 그 원본에 해당 룩을 실제로 입힌 결과 */
  after: string
}

const DIR = '/styles/looks'

export const LOOK_IMAGES: Record<MakeupStyleId, LookImage> = {
  'natural-glow': { before: `${DIR}/natural-glow-before.webp`, after: `${DIR}/natural-glow-after.webp` },
  'cloud-skin': { before: `${DIR}/cloud-skin-before.webp`, after: `${DIR}/cloud-skin-after.webp` },
  'blood-lip': { before: `${DIR}/blood-lip-before.webp`, after: `${DIR}/blood-lip-after.webp` },
  'maximalist-eye': { before: `${DIR}/maximalist-eye-before.webp`, after: `${DIR}/maximalist-eye-after.webp` },
  'metallic-eye': { before: `${DIR}/metallic-eye-before.webp`, after: `${DIR}/metallic-eye-after.webp` },
  'bold-lip': { before: `${DIR}/bold-lip-before.webp`, after: `${DIR}/bold-lip-after.webp` },
  'blush-draping': { before: `${DIR}/blush-draping-before.webp`, after: `${DIR}/blush-draping-after.webp` },
  grunge: { before: `${DIR}/grunge-before.webp`, after: `${DIR}/grunge-after.webp` },
  'kpop-idol': { before: `${DIR}/kpop-idol-before.webp`, after: `${DIR}/kpop-idol-after.webp` },
}

export const lookImage = (id: MakeupStyleId): LookImage | undefined => LOOK_IMAGES[id]
