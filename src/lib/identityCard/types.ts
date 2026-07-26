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

  // ── EN 카드 (필수) ────────────────────────────────────────────────────────
  // ⚠️ 2026-07-26: 이 세 필드가 **선택(`?`)이라서** 영문 결과 페이지에서 카드가
  //    아예 렌더되지 않았다. 한글 닉네임이 영문 페이지에 새는 걸 막으려고 4개
  //    페이지 전부 `{!isEn && <IdentityCard/>}` 로 카드를 숨겼고, 그 결과 영어권
  //    이용자는 저장·공유 버튼을 볼 수 없었다(구글 유입 과반이 영어권인데도).
  //    types.en.ts 가 detailParagraphs/hashtags 를 필수로 만든 것과 같은 이유로
  //    **필수로 둔다** — 새 유형을 추가하면 컴파일이 막혀서 되풀이할 수 없다.
  /** 영문 닉네임 — EN 카드의 최대 타이포. e.g. Fairy of Spring Light */
  nicknameEn: string
  /** 영문 한 줄 정체성 문장 */
  identityLineEn: string
  /** 영문 해시태그 — 없으면 한글 해시태그가 영문 카드로 샌다. */
  hashtagsEn: string[]
}

/** 모든 카드 그라데이션 시작점 — navy (FINAL §1, §3-6) */
export const CARD_NAVY = '#232a52'

/**
 * 로케일에 맞는 카드로 바꿔 준다.
 *
 * DOM 미리보기(IdentityCard)와 1080×1920 PNG 렌더러(cardToPng)가 **둘 다**
 * `card.nickname / identityLine / hashtags` 만 읽으므로, 여기서 한 번 갈아끼우면
 * 화면과 저장 이미지가 자동으로 같은 언어가 된다. 렌더러는 건드릴 필요가 없다.
 */
export function localizeCard(card: IdentityCardData, isEn: boolean): IdentityCardData {
  if (!isEn) return card
  return {
    ...card,
    nickname: card.nicknameEn,
    identityLine: card.identityLineEn,
    hashtags: card.hashtagsEn,
  }
}
