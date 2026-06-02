// ════════════════════════════════════════════════════════════════════
// MediaPipe 메이크업 룩 단일 소스 (base + point)
// ────────────────────────────────────────────────────────────────────
// 모든 룩 = 공통 "기본 베이스"(립 혈색 + 볼 블러셔 + T존 광채) 위에
// 룩별 "포인트"(립/아이/헤어)를 얹는 구조. 칙칙함을 베이스가 해결한다.
//
// 색·알파 한 곳에서만 관리 → 트렌드 갱신 시 이 파일만 수정.
// (나중에 src/ React 컴포넌트로 이식 시 이 구조 그대로 이동)
// ════════════════════════════════════════════════════════════════════

// 공통 기본 베이스 — 모든 룩에 항상 깔림(화사함)
export const BASE_FEMALE = {
  highlight: 0.17,                                   // T존/광대 광채 강도
  blush: { color: '#f3897e', alpha: 0.15 },          // 자연 생기 블러셔
  lip:   { color: '#d98a86', alpha: 0.22, style: 'tint' }, // 입술 자연 혈색
}
export const BASE_MALE = {
  highlight: 0.13,
  blush: { color: '#e69484', alpha: 0.07 },
  lip:   { color: '#c98a7e', alpha: 0.12, style: 'tint' },
}

// 각 룩 = 베이스 + 포인트. lip/blush 지정 시 베이스 해당 레이어를 "대체".
// highlightAdd = 베이스 위 추가 광채. eyeshadow/hair = 추가 포인트.
export const LOOKS = [
  // ── 여성 6종 ──
  { id: 'glass-skin', gender: 'female', name: 'Glass Skin Glow', nameKo: '글래스 스킨 글로우',
    point: '강한 물광 + 글로시 누드립',
    highlightAdd: 0.18, lip: { color: '#cf988c', alpha: 0.30, style: 'glossy' } },

  { id: 'blurred-lip', gender: 'female', name: 'Blurred Tint Lip', nameKo: '블러드 틴트 립',
    point: '그라데이션 로즈 틴트 립',
    lip: { color: '#c0455f', alpha: 0.52, style: 'gradient' } },

  { id: 'lingerie', gender: 'female', name: 'Lingerie Makeup', nameKo: '란제리 메이크업',
    point: '뮤트 베이지 립 + 로지 블러셔',
    lip: { color: '#bb8270', alpha: 0.44, style: 'matte' }, blush: { color: '#e58a86', alpha: 0.22 } },

  { id: 'glazed-lavender', gender: 'female', name: 'Glazed Lavender Lip', nameKo: '글레이즈드 라벤더 립',
    point: '라벤더 글로시 립',
    lip: { color: '#b49ad6', alpha: 0.44, style: 'glossy' } },

  { id: 'kpop-idol-f', gender: 'female', name: 'K-Pop Idol Makeup', nameKo: 'K-pop 아이돌',
    point: '핑크 립 + 핑크 아이섀도 + 쉬머',
    lip: { color: '#e7567f', alpha: 0.46, style: 'glossy' },
    eyeshadow: { color: '#f2a6c2', alpha: 0.34, spread: 0.5, shimmer: true } },

  { id: 'copper-hair', gender: 'female', name: 'Copper Auburn Hair', nameKo: '코퍼 어번 헤어',
    point: '베이스 + 코퍼 헤어 컬러',
    hair: '#b4631f' },

  // ── 남성 6종 ──
  { id: 'skincare-glow', gender: 'male', name: 'Skincare Glow Base', nameKo: '스킨케어 글로우',
    point: '강한 피부 광채',
    highlightAdd: 0.20 },

  { id: 'no-makeup', gender: 'male', name: 'No-Makeup Makeup', nameKo: '노메이크업 메이크업',
    point: '자연 수준 베이스만' },

  { id: 'kpop-idol-m', gender: 'male', name: 'K-Pop Idol Makeup', nameKo: 'K-팝 아이돌',
    point: '코랄 립 + 브라운 아이 포인트',
    lip: { color: '#cf6a5c', alpha: 0.30, style: 'tint' },
    eyeshadow: { color: '#8a5a3c', alpha: 0.22, spread: 0.45 } },

  { id: 'grunge-smoky', gender: 'male', name: 'Grunge Smoky Eye', nameKo: '그런지 스모키',
    point: '브라운/다크카키 스모키',
    eyeshadow: { color: '#4b4636', alpha: 0.44, spread: 0.85, lower: true } },

  { id: 'monochrome', gender: 'male', name: 'Monochrome Makeup', nameKo: '모노크롬',
    point: '테라코타 톤온톤(립·볼·아이)',
    lip: { color: '#b5654a', alpha: 0.34, style: 'matte' }, blush: { color: '#b5654a', alpha: 0.15 },
    eyeshadow: { color: '#b5654a', alpha: 0.22, spread: 0.5 } },

  { id: 'ash-brown-hair', gender: 'male', name: 'Ash Brown Hair', nameKo: '애쉬 브라운 헤어',
    point: '베이스 + 애쉬 브라운 헤어',
    hair: '#6e6258' },
]

export const looksFor = (gender) => LOOKS.filter(l => l.gender === gender)
export const baseFor = (gender) => (gender === 'male' ? BASE_MALE : BASE_FEMALE)
