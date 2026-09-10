// 클라이언트가 4종 코드로 image-to-image 프롬프트를 조립한다(makeup-edit 와 같은 방식 —
// 서버는 prompt 를 그대로 받아 쓴다). 프롬프트는 항상 영어.
//
// 베이스 = public/dna/base-<faceShape>.webp (민낯 모델). 그 얼굴 위에 4종 결과의
// 메이크업만 올린다. 사용자 셀카가 아니므로 face-lock 은 "베이스 모델 얼굴 보존" 목적.

import type { BeautyDna } from './types'
import { dnaProgress } from './types'
import type { FaceShapeCode } from '../face-shape/types'
import { PERSONAL_COLOR_TYPES } from '../personal-color/types'
import { FACE_SHAPE_TYPES } from '../face-shape/types'
import { PERFUME_TYPES } from '../perfume-type/types'
import { MAKEUP_MBTI_EN } from '../makeup-mbti/types.en'
import { mbtiGroup } from '../makeup-mbti/groupColors'

const GROUP_MOOD: Record<ReturnType<typeof mbtiGroup>, string> = {
  NT: 'precise, structural, minimal-but-deliberate',
  NF: 'soft, dreamy, diffused and emotional',
  SJ: 'polished, classic, balanced and put-together',
  SP: 'playful, high-energy, a little experimental',
}

export interface PortraitPrompt {
  prompt: string
  baseShape: FaceShapeCode
}

export function buildPortraitPrompt(dna: BeautyDna): PortraitPrompt | null {
  if (!dnaProgress(dna).complete) return null

  const pc = PERSONAL_COLOR_TYPES[dna.personalColor!]
  const fs = FACE_SHAPE_TYPES[dna.faceShape!]
  const pf = PERFUME_TYPES[dna.perfume!]
  const mbEn = MAKEUP_MBTI_EN[dna.mbti!]

  const pcB = pc.bestColorsEn ?? pc.bestColors
  const fsC = fs.contouringEn ?? fs.contouring
  const fsS = fs.recommendedStyleEn ?? fs.recommendedStyle
  const sig = mbEn.signature
  const mood = GROUP_MOOD[mbtiGroup(dna.mbti!)]

  const prompt = [
    // ── 베이스 얼굴 보존 ──
    'Keep the exact same person, face shape, facial features, bone structure, eye shape, nose, lips shape and skin texture from the source image. Do not change identity, age, pose, camera angle or framing.',
    'This is a head-and-shoulders beauty portrait, front-facing, vertical 3:4. Only add makeup and adjust hair color/styling — nothing else changes.',
    // ── 4종 결과 ──
    `Overall makeup mood: ${mood}. Reference scent family for the styling vibe: ${pf.enName} (${pf.koFamily}).`,
    `Base / skin: ${pcB.makeup.foundation}. Keep skin realistic with visible texture.`,
    `Lip: ${pcB.makeup.lip}; finish like "${sig.lip}".`,
    `Eyes: ${pcB.makeup.eye}; treatment like "${sig.eye}".`,
    `Blush: ${pcB.makeup.blush}; placement suited to a ${fs.enName.toLowerCase()} face — ${fsS.blush}.`,
    `Contour & highlight for a ${fs.enName.toLowerCase()} face — cheekbones: ${fsC.cheekbone}; jaw: ${fsC.jawline}; highlight: ${fsC.highlighter}.`,
    `Hair: ${fsS.hair}; hair colour direction: ${pcB.hair}.`,
    // ── 스타일 ──
    'Editorial beauty photography, soft even studio light, clean neutral background, sharp focus on the face, natural retouching, no text, no product packaging.',
  ].join(' ')

  return { prompt, baseShape: dna.faceShape! }
}
