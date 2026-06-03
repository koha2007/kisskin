// ════════════════════════════════════════════════════════════════════
// MediaPipe 메이크업 룩 단일 소스 (base + point) — Stage 2, 9종×2
// ────────────────────────────────────────────────────────────────────
// 모든 룩 = 공통 "기본 베이스"(립 혈색 + 볼 블러셔 + T존 광채) 위에
// 룩별 "포인트"(립/아이/헤어/브로우/스킨)를 얹는 구조. 칙칙함을 베이스가 해결한다.
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
  eyeshadow?: EyeshadowSpec
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

// 각 룩 = 베이스 + 포인트. lip/blush 지정 시 베이스 해당 레이어를 "대체".
export const LOOKS: Look[] = [
  // ─────────────── 여성 9종 ───────────────
  { id: 'cloudglow-skin', gender: 'female', name: 'Cloudglow Skin', nameKo: '클라우드글로우 스킨',
    point: '부드러운 클라우드 광채 + 누드 글로시 립',
    highlightAdd: 0.16, lip: { color: '#cf988c', alpha: 0.30, style: 'glossy' } },

  { id: 'idol-blur-base', gender: 'female', name: 'Idol Blur Base', nameKo: '아이돌 블러 베이스',
    point: 'K팝 필터 피부 — 매끈 광채',
    skinSmooth: 0.5, highlightAdd: 0.10 },

  { id: 'blurred-gradient-tint', gender: 'female', name: 'Blurred Gradient Tint', nameKo: '블러드 그라데이션 틴트',
    point: '그라데이션 로즈 블러 립',
    lip: { color: '#c0455f', alpha: 0.52, style: 'gradient' } },

  { id: 'berry-stain-lip', gender: 'female', name: 'Berry Stain Lip', nameKo: '베리 스테인 립',
    point: '2026 글로벌 베리·와인 립',
    lip: { color: '#8e2f48', alpha: 0.50, style: 'matte' } },

  { id: 'glazed-lavender-lip', gender: 'female', name: 'Glazed Lavender Lip', nameKo: '글레이즈드 라벤더 립',
    point: '라벤더 글로시 립',
    lip: { color: '#b49ad6', alpha: 0.44, style: 'glossy' } },

  { id: 'kpop-idol-shimmer', gender: 'female', name: 'K-Pop Idol Shimmer', nameKo: 'K-pop 아이돌 쉬머',
    point: '이너코너 하이라이터 + 핑크 아이섀도',
    lip: { color: '#e7567f', alpha: 0.44, style: 'glossy' },
    eyeshadow: { color: '#f2a6c2', alpha: 0.34, spread: 0.5, shimmer: true } },

  { id: 'watercolor-flush', gender: 'female', name: 'Watercolor Flush', nameKo: '워터컬러 플러시',
    point: '언더아이 블러셔 — 수채화 혈색',
    blush: { color: '#ef8478', alpha: 0.24, offsetY: 0.06 } },

  { id: 'lingerie-nude', gender: 'female', name: 'Lingerie Nude', nameKo: '란제리 누드',
    point: '뮤트 베이지 — 피부에 녹는 룩',
    lip: { color: '#bb8270', alpha: 0.44, style: 'matte' }, blush: { color: '#e58a86', alpha: 0.22 } },

  { id: 'copper-auburn-hair', gender: 'female', name: 'Copper Auburn Hair', nameKo: '코퍼 어번 헤어',
    point: '베이스 + 코퍼 헤어 컬러',
    hair: '#b4631f' },

  // ─────────────── 남성 9종 ───────────────
  { id: 'chok-chok-glow', gender: 'male', name: 'Chok-Chok Glow', nameKo: '촉촉 글로우',
    point: 'K팝 남돌 물광 피부',
    highlightAdd: 0.20 },

  { id: 'idol-blur-skin', gender: 'male', name: 'Idol Blur Skin', nameKo: '아이돌 블러 스킨',
    point: '필터 같은 매끈 베이스',
    skinSmooth: 0.5, highlightAdd: 0.08 },

  { id: 'no-makeup-base', gender: 'male', name: 'No-Makeup Base', nameKo: '노메이크업 베이스',
    point: 'BB크림 수준 자연 보정' },

  { id: 'tinted-lip-balm', gender: 'male', name: 'Tinted Lip Balm', nameKo: '틴티드 립밤',
    point: '자연 혈색 입술',
    lip: { color: '#c97a6c', alpha: 0.26, style: 'tint' } },

  { id: 'healthy-flush', gender: 'male', name: 'Healthy Flush', nameKo: '헬시 플러시',
    point: '은은한 볼 혈색',
    blush: { color: '#dd8276', alpha: 0.14 } },

  { id: 'kpop-idol-liner', gender: 'male', name: 'K-Pop Idol Liner', nameKo: 'K-pop 아이돌 라이너',
    point: '젤 아이라이너 포인트',
    eyeshadow: { color: '#3a2f2a', alpha: 0.5, spread: 0.16, liner: true } },

  { id: 'smoky-brown-eye', gender: 'male', name: 'Smoky Brown Eye', nameKo: '스모키 브라운 아이',
    point: '절제된 브라운 스모키',
    eyeshadow: { color: '#4b4636', alpha: 0.42, spread: 0.8, lower: true } },

  { id: 'defined-brow', gender: 'male', name: 'Defined Brow', nameKo: '디파인드 브로우',
    point: '눈썹 정리 + 강조(2026 브로우 트렌드)',
    brow: { color: '#3b2a20', alpha: 0.34 } },

  { id: 'ash-brown-hair', gender: 'male', name: 'Ash Brown Hair', nameKo: '애쉬 브라운 헤어',
    point: '베이스 + 애쉬 브라운 헤어',
    hair: '#6e6258' },
]

export const looksFor = (gender: Gender): Look[] => LOOKS.filter((l) => l.gender === gender)
export const baseFor = (gender: Gender): BaseSpec => (gender === 'male' ? BASE_MALE : BASE_FEMALE)
