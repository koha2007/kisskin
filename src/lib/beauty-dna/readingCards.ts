// "이 조합 읽는 법" — 각 진단이 이번 룩에 무엇을 기여하는지 4미니카드.

import type { BeautyDna } from './types'
import { dnaProgress } from './types'
import { PERSONAL_COLOR_TYPES } from '../personal-color/types'
import { FACE_SHAPE_TYPES } from '../face-shape/types'
import { PERFUME_TYPES } from '../perfume-type/types'
import { MAKEUP_MBTI_TYPES } from '../makeup-mbti/types'

export interface ReadingCard {
  icon: string
  /** 진단명 */
  label: string
  /** 이 유형 이름 */
  typeName: string
  /** 이번 룩에서 이 진단이 정하는 것 */
  drives: string
}

export function buildReadingCards(dna: BeautyDna, isEn = false): ReadingCard[] {
  if (!dnaProgress(dna).complete) return []

  const pc = PERSONAL_COLOR_TYPES[dna.personalColor!]
  const fs = FACE_SHAPE_TYPES[dna.faceShape!]
  const pf = PERFUME_TYPES[dna.perfume!]
  const mb = MAKEUP_MBTI_TYPES[dna.mbti!]

  return isEn
    ? [
        { icon: 'palette', label: 'Personal Color', typeName: pc.enName, drives: 'Skin tone, base shade, and lip color family.' },
        { icon: 'face', label: 'Face Shape', typeName: fs.enName, drives: 'Contour placement, blush position, and hair volume.' },
        { icon: 'quiz', label: 'Makeup MBTI', typeName: mb.enName, drives: 'Overall mood and how bold each step goes.' },
        { icon: 'local_florist', label: 'Perfume', typeName: pf.enName, drives: 'The vibe that ties it together and the styling keywords.' },
      ]
    : [
        { icon: 'palette', label: '퍼스널 컬러', typeName: pc.koName, drives: '피부 톤 · 베이스 호수 · 립 색 계열을 정해요.' },
        { icon: 'face', label: '얼굴형', typeName: fs.koName, drives: '컨투어 위치 · 블러셔 자리 · 헤어 볼륨을 정해요.' },
        { icon: 'quiz', label: '메이크업 MBTI', typeName: mb.koName, drives: '전체 무드와 각 단계의 강도를 정해요.' },
        { icon: 'local_florist', label: '향수', typeName: pf.koName, drives: '전체 분위기와 스타일링 키워드를 정해요.' },
      ]
}
