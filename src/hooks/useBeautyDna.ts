import { useSyncExternalStore, useCallback } from 'react'
import {
  readDna,
  writeDnaField,
  dnaProgress,
  DNA_EVENT,
  type BeautyDna,
  type DnaField,
  type DnaProgress,
} from '../lib/beauty-dna/types'

// localStorage 백드 스토어 — useRegion.ts 와 같은 패턴.
// SSR/프리렌더와 첫 클라이언트 페인트는 항상 빈 dna(=상태 A). 마운트 후 저장값으로 스왑
// (하이드레이션 경고 없이). 그래서 프리렌더 산출물엔 개인화가 새지 않는다.

const EMPTY: BeautyDna = {}

function subscribe(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(DNA_EVENT, cb)
  window.addEventListener('storage', cb) // 다른 탭에서 진단 완료 시
  return () => {
    window.removeEventListener(DNA_EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

// getSnapshot 은 안정적인 참조를 돌려줘야 한다(매번 새 객체 X → 무한 렌더).
// 캐시 키는 값 전체를 직렬화하지 않는다 — portraitUrl 이 수 MB dataURL 이라
// 매 렌더 JSON.stringify(2MB) 는 비싸다. 의미 있는 필드만 짧게 서명한다.
let cacheKey = ''
let cacheVal: BeautyDna = EMPTY
function sig(d: BeautyDna): string {
  return [d.personalColor, d.faceShape, d.perfume, d.mbti, d.portraitCode, d.updatedAt].join('|')
}
function getSnapshot(): BeautyDna {
  const fresh = readDna()
  const key = sig(fresh)
  if (key !== cacheKey) {
    cacheKey = key
    cacheVal = fresh
  }
  return cacheVal
}
function getServerSnapshot(): BeautyDna {
  return EMPTY
}

export interface UseBeautyDna extends DnaProgress {
  dna: BeautyDna
  setField: (field: DnaField, value: string) => void
}

export function useBeautyDna(): UseBeautyDna {
  const dna = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const setField = useCallback((field: DnaField, value: string) => writeDnaField(field, value), [])
  return { dna, setField, ...dnaProgress(dna) }
}
