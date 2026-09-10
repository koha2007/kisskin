// 4종 추천맵 병합 — 카테고리 중복 제거, 상한 8.
// ProductRec 자체는 그대로 재사용하므로 신규 어필리에이트 데이터/키워드 없음
// (npm run check:keywords 통과).

import type { BeautyDna } from './types'
import type { ProductRec } from '../recommendations/types'
import { PC_RECOMMENDATIONS } from '../recommendations/personal-color'
import { FS_RECOMMENDATIONS } from '../recommendations/face-shape'
import { MBTI_RECOMMENDATIONS } from '../recommendations/makeup-mbti'
import { PERFUME_TYPE_RECOMMENDATIONS } from '../recommendations/perfume-type'

const MAX = 8

/** 카테고리를 정규화해 "립 틴트" / "립스틱" 류 중복을 한 카드로 접는다. */
function catKey(rec: ProductRec): string {
  const c = (rec.category || '').toLowerCase()
  if (/립|lip/.test(c)) return 'lip'
  if (/아이|eye|섀도|shadow|라이너|liner/.test(c)) return 'eye'
  if (/블러|치크|blush|cheek/.test(c)) return 'blush'
  if (/쿠션|파운데|베이스|foundation|cushion|base/.test(c)) return 'base'
  if (/컨투어|셰이딩|contour|bronzer/.test(c)) return 'contour'
  if (/하이라이|highlight/.test(c)) return 'highlight'
  if (/브로우|눈썹|brow/.test(c)) return 'brow'
  if (/향수|퍼퓸|perfume|fragrance/.test(c)) return 'fragrance'
  if (/헤어|hair/.test(c)) return 'hair'
  return c || rec.title.toLowerCase()
}

export function mergeDnaRecs(dna: BeautyDna): ProductRec[] {
  const pools: ProductRec[][] = []
  if (dna.personalColor) pools.push(PC_RECOMMENDATIONS[dna.personalColor] ?? [])
  if (dna.faceShape) pools.push(FS_RECOMMENDATIONS[dna.faceShape] ?? [])
  if (dna.mbti) pools.push(MBTI_RECOMMENDATIONS[dna.mbti] ?? [])
  if (dna.perfume) pools.push(PERFUME_TYPE_RECOMMENDATIONS[dna.perfume] ?? [])

  // 라운드로빈으로 뽑아 4개 진단이 고르게 대표되게 한다(한 진단이 8칸을 다 먹지 않도록).
  const seen = new Set<string>()
  const out: ProductRec[] = []
  const cursors = pools.map(() => 0)
  let active = true
  while (active && out.length < MAX) {
    active = false
    for (let p = 0; p < pools.length && out.length < MAX; p++) {
      const pool = pools[p]
      if (cursors[p] >= pool.length) continue
      active = true
      const rec = pool[cursors[p]++]
      const key = catKey(rec)
      if (seen.has(key)) continue
      seen.add(key)
      out.push(rec)
    }
  }
  return out
}
