// 4종 조합 → 한 줄 페르소나. 전부 결정적 룩업(LLM 없음).
// 형식: "<향 형용사> <계절 빛> <MBTI 역할군 명사>"  예: "깊은 가을 빛의 몽상가"

import type { BeautyDna } from './types'
import { dnaProgress } from './types'
import { mbtiGroup, type MbtiGroup } from '../makeup-mbti/groupColors'
import type { SeasonCode } from '../personal-color/types'
import type { PerfumeTypeCode } from '../perfume-type/types'

const SEASON_LIGHT: Record<SeasonCode, { ko: string; en: string }> = {
  spring: { ko: '봄볕의', en: 'spring-light' },
  summer: { ko: '여름 물빛의', en: 'summer-water' },
  autumn: { ko: '가을 빛의', en: 'autumn-glow' },
  winter: { ko: '겨울 서리의', en: 'winter-frost' },
}

const GROUP_NOUN: Record<MbtiGroup, { ko: string; en: string }> = {
  NT: { ko: '설계자', en: 'Architect' },
  NF: { ko: '몽상가', en: 'Dreamer' },
  SJ: { ko: '수호자', en: 'Keeper' },
  SP: { ko: '탐험가', en: 'Explorer' },
}

const PERFUME_ADJ: Record<PerfumeTypeCode, { ko: string; en: string }> = {
  floral: { ko: '피어나는', en: 'blooming' },
  citrus: { ko: '산뜻한', en: 'bright' },
  woody: { ko: '깊은', en: 'deep' },
  amber: { ko: '따뜻한', en: 'warm' },
  fresh: { ko: '맑은', en: 'clear' },
  gourmand: { ko: '달콤한', en: 'sweet' },
}

export function getPersona(dna: BeautyDna, isEn = false): string | null {
  if (!dnaProgress(dna).complete) return null
  const adj = PERFUME_ADJ[dna.perfume!]
  const light = SEASON_LIGHT[dna.personalColor!]
  const noun = GROUP_NOUN[mbtiGroup(dna.mbti!)]
  return isEn
    ? `The ${adj.en} ${light.en} ${noun.en}`
    : `${adj.ko} ${light.ko} ${noun.ko}`
}
