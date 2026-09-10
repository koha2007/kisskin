// 4종 결과 → 병합 메이크업 루틴. 전부 기존 타입 모듈에서 결정적으로 조립(LLM 없음).
// 각 스텝은 근거(어느 진단에서 왔는지)를 함께 들고 있어 "왜 이걸 바르는지"가 드러난다.

import type { BeautyDna } from './types'
import { dnaProgress } from './types'
import { PERSONAL_COLOR_TYPES } from '../personal-color/types'
import { FACE_SHAPE_TYPES } from '../face-shape/types'
import { PERFUME_TYPES } from '../perfume-type/types'
import { MAKEUP_MBTI_TYPES } from '../makeup-mbti/types'
import { MAKEUP_MBTI_EN } from '../makeup-mbti/types.en'

export interface RoutineStep {
  key: 'base' | 'eye' | 'lip' | 'blush' | 'contour' | 'hair' | 'scent'
  icon: string
  label: string
  /** 한 줄 지시 */
  text: string
  /** 근거 라벨 — "퍼스널컬러 · 가을 웜" */
  source: string
}

export function buildRoutine(dna: BeautyDna, isEn = false): RoutineStep[] {
  if (!dnaProgress(dna).complete) return []

  const pc = PERSONAL_COLOR_TYPES[dna.personalColor!]
  const fs = FACE_SHAPE_TYPES[dna.faceShape!]
  const pf = PERFUME_TYPES[dna.perfume!]
  const mb = MAKEUP_MBTI_TYPES[dna.mbti!]
  const mbEn = MAKEUP_MBTI_EN[dna.mbti!]

  const pcBest = (isEn && pc.bestColorsEn ? pc.bestColorsEn : pc.bestColors)
  const fsContour = (isEn && fs.contouringEn ? fs.contouringEn : fs.contouring)
  const fsStyle = (isEn && fs.recommendedStyleEn ? fs.recommendedStyleEn : fs.recommendedStyle)
  const pfMk = (isEn && pf.makeupMatchEn ? pf.makeupMatchEn : pf.makeupMatch)
  const sig = isEn ? mbEn.signature : mb.signature

  const pcName = isEn ? pc.enName : pc.koName
  const fsName = isEn ? fs.enName : fs.koName
  const pfName = isEn ? pf.enName : (pf.koName)
  const mbName = isEn ? mb.enName : mb.koName

  const L = isEn
    ? { pc: 'Personal Color', fs: 'Face Shape', pf: 'Perfume', mb: 'Makeup MBTI',
        base: 'Base', eye: 'Eye', lip: 'Lip', blush: 'Blush', contour: 'Contour & highlight', hair: 'Hair', scent: 'Signature scent',
        plus: 'finish', with_: 'with' }
    : { pc: '퍼스널컬러', fs: '얼굴형', pf: '향수', mb: '메이크업 MBTI',
        base: '베이스', eye: '아이', lip: '립', blush: '블러셔', contour: '컨투어·하이라이트', hair: '헤어', scent: '시그니처 향',
        plus: '마감', with_: '＋' }

  const src = (label: string, name: string) => `${label} · ${name}`
  const join = (a: string, b: string) => (isEn ? `${a} — ${b}` : `${a} · ${b}`)

  return [
    {
      key: 'base', icon: 'blur_on', label: L.base,
      text: join(pcBest.makeup.foundation, `${pfMk.base} (${L.plus})`),
      source: src(L.pc, pcName) + ` ${L.with_} ` + L.pf + ` · ${pfName}`,
    },
    {
      key: 'eye', icon: 'visibility', label: L.eye,
      text: join(pcBest.makeup.eye, sig.eye),
      source: src(L.pc, pcName) + ` ${L.with_} ` + src(L.mb, mbName),
    },
    {
      key: 'lip', icon: 'favorite', label: L.lip,
      text: join(pcBest.makeup.lip, sig.lip),
      source: src(L.pc, pcName) + ` ${L.with_} ` + src(L.mb, mbName),
    },
    {
      key: 'blush', icon: 'spa', label: L.blush,
      text: join(pcBest.makeup.blush, fsStyle.blush),
      source: src(L.pc, pcName) + ` ${L.with_} ` + src(L.fs, fsName),
    },
    {
      key: 'contour', icon: 'gradient', label: L.contour,
      text: isEn
        ? `Cheekbone: ${fsContour.cheekbone}. Jaw: ${fsContour.jawline}. Highlight: ${fsContour.highlighter}.`
        : `광대: ${fsContour.cheekbone} / 턱: ${fsContour.jawline} / 하이라이트: ${fsContour.highlighter}`,
      source: src(L.fs, fsName),
    },
    {
      key: 'hair', icon: 'content_cut', label: L.hair,
      text: join(fsStyle.hair, pcBest.hair),
      source: src(L.fs, fsName) + ` ${L.with_} ` + src(L.pc, pcName),
    },
    {
      key: 'scent', icon: 'local_florist', label: L.scent,
      text: (() => {
        const occ = (isEn ? (pf.sceneEn ?? pf.scene) : pf.scene)?.occasion ?? ''
        const head = isEn ? `${pf.enName} family` : `${pf.koFamily} 계열`
        return occ ? `${head} — ${occ}` : head
      })(),
      source: src(L.pf, pfName),
    },
  ]
}
