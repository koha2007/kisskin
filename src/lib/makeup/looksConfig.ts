// ════════════════════════════════════════════════════════════════════
// MediaPipe 메이크업 룩 단일 소스 — "K-뷰티 풀 메이크업" 1종 × 성별 2
// ────────────────────────────────────────────────────────────────────
// 9종 선택을 폐기하고, 성별별 "풀 메이크업 1장"에 모든 기술(글로우·립·블러셔·
// 아이·라이너·브로우·헤어)을 통합하고 강도를 최대로 올린다. 얼굴은 원본 픽셀
// 위 합성이라 100% 보존, 메이크업만 확 달라 보이게(단, 자연스러움 한계 유지).
//
// 색·알파·스타일을 이 파일 한 곳에서만 관리 → 트렌드 갱신 시 이 파일만 수정.
// (looks-engine 의 renderLook 이 이 타입을 그대로 소비)
// ════════════════════════════════════════════════════════════════════

export type Gender = 'female' | 'male'
export type LipStyle = 'tint' | 'matte' | 'gradient' | 'glossy'

export interface LipSpec {
  color: string
  alpha: number
  style: LipStyle
}
export interface BlushSpec {
  color: string
  alpha: number
  /** 0 = 광대(기본), 양수 = 언더아이 쪽으로 위로 끌어올림(수채 플러시). faceW 비율. */
  offsetY?: number
}
export interface EyeshadowSpec {
  color: string
  alpha: number
  /** 꺼풀→눈썹 방향 번짐 정도. 작을수록 라인에 가까움. */
  spread: number
  shimmer?: boolean
  /** 하단 라인까지(스모키) */
  lower?: boolean
  /** 얇은 젤 아이라이너 모드(라인만, 번짐 최소) */
  liner?: boolean
}
export interface BrowSpec {
  /** 눈썹 강조 색(은은한 다크 브라운) */
  color: string
  alpha: number
}
export interface BaseSpec {
  highlight: number
  blush: BlushSpec
  lip: LipSpec
}
export interface Look {
  id: string
  gender: Gender
  name: string
  nameKo: string
  point: string
  /** 베이스 위 추가 T존 광채 */
  highlightAdd?: number
  /** 지정 시 베이스 립을 대체 */
  lip?: LipSpec
  /** 지정 시 베이스 블러셔를 대체 */
  blush?: BlushSpec
  /** 단일 or 다중 레이어(예: 쉬머 워시 + 또렷한 라이너). 순서대로 합성. */
  eyeshadow?: EyeshadowSpec | EyeshadowSpec[]
  brow?: BrowSpec
  /** 필터 같은 매끈 스킨(다운스케일 블러 저알파 합성) 강도 0~1 */
  skinSmooth?: number
  /** 헤어 리컬러 hex */
  hair?: string
}

// ── 공통 기본 베이스 — 모든 룩에 항상 깔림(화사함) ──
export const BASE_FEMALE: BaseSpec = {
  highlight: 0.17,                                   // T존/광대 광채 강도
  blush: { color: '#f3897e', alpha: 0.15 },          // 자연 생기 블러셔
  lip:   { color: '#d98a86', alpha: 0.22, style: 'tint' }, // 입술 자연 혈색
}
export const BASE_MALE: BaseSpec = {
  highlight: 0.13,
  blush: { color: '#e69484', alpha: 0.07 },
  lip:   { color: '#c98a7e', alpha: 0.12, style: 'tint' },
}

// 각 성별 1장 = 베이스 + 모든 포인트를 통합(강도 최대). lip/blush 지정 시 베이스 대체.
export const LOOKS: Look[] = [
  // ─────────────── 여성 — 화사한 풀 K-뷰티 ───────────────
  // MediaPipe 강점만: 글래스 스킨(광채+스무딩) + 그라데이션 코랄 립 + 화사 블러셔.
  // 약점(눈·눈썹·헤어)은 어색해서 전부 제외 — 원본 그대로 두는 게 자연스럽다.
  { id: 'kbeauty-full-female', gender: 'female', name: 'K-Beauty Full Glam', nameKo: 'K-뷰티 풀 메이크업',
    point: '글래스 스킨 + 그라데이션 코랄 립 + 화사 블러셔',
    skinSmooth: 0.40,
    highlightAdd: 0.20,                                              // base 0.17 + 0.20 = 강한 글래스 광채
    lip:   { color: '#e25a6b', alpha: 0.58, style: 'gradient' },     // 또렷한 그라데이션 핑크/코랄
    blush: { color: '#f5867f', alpha: 0.16, offsetY: 0.02 } },       // 자연스러운 화사함

  // ─────────────── 남성 — K-뷰티 남돌(자연·남성적) ───────────────
  // MediaPipe 강점만: 물광 베이스(광채+스무딩) + 혈색 립 + 헬시 블러셔.
  // 약점(눈·눈썹·헤어)은 제외 — 깔끔·자연스러움 우선.
  { id: 'kbeauty-full-male', gender: 'male', name: 'K-Beauty Idol', nameKo: 'K-뷰티 남돌 메이크업',
    point: '물광 베이스 + 헬시 혈색',
    skinSmooth: 0.32,
    highlightAdd: 0.32,                                              // base 0.13 + 0.32 = 물광 확실히
    lip:   { color: '#c47568', alpha: 0.36, style: 'tint' },         // 혈색 또렷하게
    blush: { color: '#dd8276', alpha: 0.18 } },                      // 헬시 혈색
]

export const looksFor = (gender: Gender): Look[] => LOOKS.filter((l) => l.gender === gender)
export const baseFor = (gender: Gender): BaseSpec => (gender === 'male' ? BASE_MALE : BASE_FEMALE)
