// 필드별 표시 정보(이름·이모지·무드컷·색) 한 곳 해석 — DnaProgress / 유형칩 공용.

import type { BeautyDna, DnaField } from './types'
import { PERSONAL_COLOR_TYPES } from '../personal-color/types'
import { SEASON_MOOD } from '../personal-color/moodImages'
import { FACE_SHAPE_TYPES } from '../face-shape/types'
import { FACE_SHAPE_MOOD } from '../face-shape/moodImages'
import { PERFUME_TYPES } from '../perfume-type/types'
import { PERFUME_MOOD } from '../perfume-type/moodImages'
import { MAKEUP_MBTI_TYPES } from '../makeup-mbti/types'
import { MBTI_MOOD } from '../makeup-mbti/moodImages'

export interface DnaTypeDisplay {
  name: string
  emoji: string
  image?: string
  accent: string
}

export function dnaTypeDisplay(field: DnaField, dna: BeautyDna, isEn = false): DnaTypeDisplay | null {
  switch (field) {
    case 'personalColor': {
      const c = dna.personalColor
      if (!c) return null
      const t = PERSONAL_COLOR_TYPES[c]
      return { name: isEn ? t.enName : t.koName, emoji: t.emoji, image: SEASON_MOOD[c].image, accent: t.primaryColor }
    }
    case 'faceShape': {
      const c = dna.faceShape
      if (!c) return null
      const t = FACE_SHAPE_TYPES[c]
      return { name: isEn ? t.enName : t.koName, emoji: t.emoji, image: FACE_SHAPE_MOOD[c].image, accent: t.primaryColor }
    }
    case 'perfume': {
      const c = dna.perfume
      if (!c) return null
      const t = PERFUME_TYPES[c]
      return { name: isEn ? t.enName : t.koName, emoji: t.emoji, image: PERFUME_MOOD[c].image, accent: t.primaryColor }
    }
    case 'mbti': {
      const c = dna.mbti
      if (!c) return null
      const t = MAKEUP_MBTI_TYPES[c]
      return { name: isEn ? t.enName : t.koName, emoji: t.emoji, image: MBTI_MOOD[c].image, accent: t.primaryColor }
    }
  }
}
