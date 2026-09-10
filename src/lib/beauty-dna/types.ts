// "나만의 메이크업 찾았다" — 4종 무료도구 결과를 한곳에 모으는 로컬 상태.
// 이미지 생성(P1) 전까지 P0 는 이 데이터로 통합 해석 + 루틴 + 제품 그리드만 만든다.
//
// 저장 위치: localStorage. 로그인/서버 동기화 없음(무료도구는 무로그인 원칙).
// 크로스디바이스는 P3 선택.

import type { SeasonCode } from '../personal-color/types'
import { SEASON_ORDER, getSeasonBySlug, PERSONAL_COLOR_TYPES } from '../personal-color/types'
import type { FaceShapeCode } from '../face-shape/types'
import { FACE_SHAPE_ORDER, getFaceShapeBySlug, FACE_SHAPE_TYPES } from '../face-shape/types'
import type { PerfumeTypeCode } from '../perfume-type/types'
import { PERFUME_TYPE_ORDER, getPerfumeTypeBySlug, PERFUME_TYPES } from '../perfume-type/types'
import type { MbtiCode } from '../makeup-mbti/types'
import { MBTI_ORDER, getMbtiTypeBySlug, MAKEUP_MBTI_TYPES } from '../makeup-mbti/types'

export const DNA_STORAGE_KEY = 'kissin:dna:v1'
export const DNA_EVENT = 'kissin:dna-change'

export type DnaField = 'personalColor' | 'faceShape' | 'perfume' | 'mbti'

export interface BeautyDna {
  personalColor?: SeasonCode
  faceShape?: FaceShapeCode
  perfume?: PerfumeTypeCode
  mbti?: MbtiCode
  updatedAt?: string
  /** P1: 생성된 모델 얼굴 이미지 (dataURL). 조합이 바뀌면 무효화된다. */
  portraitUrl?: string
  /** portraitUrl 이 어느 조합으로 만들어졌는지 — 현재 조합과 다르면 안 보여준다. */
  portraitCode?: string
}

/** 진행도 계산 순서 — DnaProgress 슬롯 순서와 동일 */
export const DNA_FIELDS: readonly DnaField[] = ['personalColor', 'faceShape', 'perfume', 'mbti'] as const

export interface DnaFieldMeta {
  field: DnaField
  /** 도구 라우트 (KO 기준, EN 은 `/en` 프리픽스) */
  path: string
  labelKo: string
  labelEn: string
}

export const DNA_FIELD_META: Record<DnaField, DnaFieldMeta> = {
  personalColor: { field: 'personalColor', path: '/tools/personal-color/', labelKo: '퍼스널 컬러', labelEn: 'Personal Color' },
  faceShape: { field: 'faceShape', path: '/tools/face-shape/', labelKo: '얼굴형', labelEn: 'Face Shape' },
  perfume: { field: 'perfume', path: '/tools/perfume-type/', labelKo: '향수 유형', labelEn: 'Perfume Type' },
  mbti: { field: 'mbti', path: '/tools/makeup-mbti/', labelKo: '메이크업 MBTI', labelEn: 'Makeup MBTI' },
}

export function readDna(): BeautyDna {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(DNA_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as BeautyDna
    return sanitize(parsed)
  } catch {
    return {}
  }
}

function sanitize(d: BeautyDna): BeautyDna {
  const out: BeautyDna = {}
  if (d.personalColor && SEASON_ORDER.includes(d.personalColor)) out.personalColor = d.personalColor
  if (d.faceShape && FACE_SHAPE_ORDER.includes(d.faceShape)) out.faceShape = d.faceShape
  if (d.perfume && PERFUME_TYPE_ORDER.includes(d.perfume)) out.perfume = d.perfume
  if (d.mbti && MBTI_ORDER.includes(d.mbti)) out.mbti = d.mbti
  if (typeof d.updatedAt === 'string') out.updatedAt = d.updatedAt
  // portrait 는 현재 조합 코드와 일치할 때만 유효
  if (typeof d.portraitUrl === 'string' && d.portraitUrl.startsWith('data:image') && typeof d.portraitCode === 'string') {
    if (encodeDnaCode(out) === d.portraitCode) {
      out.portraitUrl = d.portraitUrl
      out.portraitCode = d.portraitCode
    }
  }
  return out
}

/** 생성된 모델 이미지를 저장. 조합 코드도 함께 박아 조합이 바뀌면 자동 무효화. */
export function writeDnaPortrait(dataUrl: string): void {
  if (typeof window === 'undefined') return
  const cur = readDna()
  const code = encodeDnaCode(cur)
  if (!code) return
  const next: BeautyDna = { ...cur, portraitUrl: dataUrl, portraitCode: code, updatedAt: new Date().toISOString() }
  try {
    window.localStorage.setItem(DNA_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(DNA_EVENT))
  } catch {
    /* quota */
  }
}

/** 결과 페이지에서 호출 — 값이 이미 같으면 write 를 건너뛴다(불필요한 이벤트 방지). */
export function writeDnaField(field: DnaField, value: string): void {
  if (typeof window === 'undefined') return
  const cur = readDna()
  if (cur[field] === value) return
  const next: BeautyDna = { ...cur, [field]: value, updatedAt: new Date().toISOString() }
  try {
    window.localStorage.setItem(DNA_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(DNA_EVENT))
  } catch {
    /* quota / private mode — 조용히 무시 */
  }
}

export interface DnaProgress {
  done: number
  total: number
  missing: DnaField[]
  complete: boolean
}

export function dnaProgress(dna: BeautyDna): DnaProgress {
  const missing = DNA_FIELDS.filter((f) => !dna[f])
  return { done: DNA_FIELDS.length - missing.length, total: DNA_FIELDS.length, missing, complete: missing.length === 0 }
}

// ── 공유 코드 (P1 의 ?c= 에서 사용, 여기서 정의만) ─────────────────────────
// 형식: "<pc-slug>-<fs-slug>-<pf-slug>-<mbti-slug>" 예: "autumn-warm-heart-woody-enfp"
// slug 에 '-' 가 있어(예: autumn-warm) 단순 split 이 안 된다 → slug 를 순서대로 그리디 매칭.
export function encodeDnaCode(dna: BeautyDna): string | null {
  if (!dnaProgress(dna).complete) return null
  return [
    PERSONAL_COLOR_TYPES[dna.personalColor!].slug,
    FACE_SHAPE_TYPES[dna.faceShape!].slug,
    PERFUME_TYPES[dna.perfume!].slug,
    MAKEUP_MBTI_TYPES[dna.mbti!].slug,
  ].join('~')
}

export function decodeDnaCode(code: string): BeautyDna | null {
  const parts = code.split('~')
  if (parts.length !== 4) return null
  const pc = getSeasonBySlug(parts[0])
  const fs = getFaceShapeBySlug(parts[1])
  const pf = getPerfumeTypeBySlug(parts[2])
  const mb = getMbtiTypeBySlug(parts[3])
  if (!pc || !fs || !pf || !mb) return null
  return { personalColor: pc.code, faceShape: fs.code, perfume: pf.code, mbti: mb.code }
}
