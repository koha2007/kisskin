// MBTI 16타입 → 4그룹 색 (2026-07-22)
//
// 왜: 랜딩의 타입 미리보기 16장이 각자 다른 accentColor 로 색면을 칠하고 있어서,
// 나란히 놓으면 색 16개가 서로 싸워 목록 전체가 시끄러웠다.
// 16Personalities(45개 언어·10억 회 응시)는 같은 16타입을 **4색 그룹**으로 묶어
// 색을 정보(역할군)로 쓴다. 그 방식을 그대로 가져왔다.
//
// 그룹은 MBTI 표준 역할군을 따른다: NT(분석) / NF(외교) / SJ(관리) / SP(탐험).
// 색은 힐다(Hilda) 팔레트에서 뽑은 낮은 채도의 플랫 컬러다 — 형광하지 않고,
// 10% 틴트로 깔았을 때 옆 카드와 부딪히지 않는다.
//
// ⚠️ 여기 색은 **랜딩 미리보기 카드 표면**에만 쓴다. 각 타입의 primaryColor/accentColor
// (src/lib/makeup-mbti/types.ts)는 IdentityCard 그라디언트와 cardToPng.ts 의 1080×1920
// PNG 렌더러가 함께 참조하므로 건드리지 않는다.

import type { MbtiCode } from './types'

export const MBTI_GROUPS = {
  /** 분석가 — 틸 */
  NT: '#4E9FA6',
  /** 외교관 — 세이지 */
  NF: '#7E9B6A',
  /** 관리자 — 인디고 */
  SJ: '#4A5488',
  /** 탐험가 — 머스터드 */
  SP: '#C79340',
} as const

export type MbtiGroup = keyof typeof MBTI_GROUPS

export function mbtiGroup(code: MbtiCode): MbtiGroup {
  const c = code.toUpperCase()
  const n = c.includes('N')
  if (n) return c.includes('T') ? 'NT' : 'NF'
  return c.includes('J') ? 'SJ' : 'SP'
}

export function mbtiGroupColor(code: MbtiCode): string {
  return MBTI_GROUPS[mbtiGroup(code)]
}


// 유형별 추천 룩 이름 → 실제 결과 사진의 스타일 id.
// 랜딩의 16타입 카드가 이모지 하나로만 구분되던 것을 실제 사진으로 바꾸기 위한 다리다.
// (recommended.women.primary 는 사람이 읽는 이름이라 그대로는 파일 경로가 안 된다)
export const LOOK_NAME_TO_ID: Record<string, string> = {
  'Natural Glow': 'natural-glow',
  'Cloud Skin': 'cloud-skin',
  'Blood Lip': 'blood-lip',
  'Maximalist Eye': 'maximalist-eye',
  'Metallic Eye': 'metallic-eye',
  'Bold Lip': 'bold-lip',
  'Blush Draping': 'blush-draping',
  'Grunge Makeup': 'grunge',
  'Kpop Idol Makeup': 'kpop-idol',
}
