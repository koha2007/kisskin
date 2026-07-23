// Identity Card — shared data shape for the 9:16 shareable result card.
// Used by all 4 free tools (personal-color / makeup-mbti / face-shape / perfume-type).
// Spec: FINAL §3-4 (card layout) · §3-5 (31 nicknames) · §3-6 (per-type gradients).

export interface IdentityCardData {
  /** 유형 닉네임 — "나를 말해주는 이름" (최대 타이포). e.g. 봄볕의 요정 */
  nickname: string
  /** 영문 서브 (ALL CAPS). e.g. SPRING MUSE */
  enName: string
  /** 한 줄 정체성 문장 (따옴표 없이 본문만 저장) */
  identityLine: string
  /** 해시태그 3~5개 (# 포함, nowrap 칩) */
  hashtags: string[]
  /** 배경 그라데이션 [시작(navy #232a52), 끝(유형색)] */
  gradient: [string, string]
  /** 영문 닉네임 (선택, EN 카드용 — 추후 i18n 패스에서 채움) */
  nicknameEn?: string
  /** 영문 한 줄 정체성 (선택) */
  identityLineEn?: string
}

/** 모든 카드 그라데이션 시작점 — navy (FINAL §1, §3-6) */
export const CARD_NAVY = '#232a52'
