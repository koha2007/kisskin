// AI 메이크업 플로우 — 공용 디자인 토큰 (2026-07-27)
// ────────────────────────────────────────────────────────────────────
// 왜 한 파일로 모으나: screenBg 를 5개 화면(업로드·룩선택·생성중/에러·결과·충전)이
// 각자 복붙해 갖고 있어서, 한 화면만 고치면 다음 화면에서 색이 튀었다.
//
// 방향 = "다크는 유지, 브랜드로 정렬".
//   · 이 화면들의 주인공은 **사용자 셀카와 결과 사진**이다. 밝은 크림 배경 위에서는
//     인물 사진의 대비가 죽고, "읽는 중 → 내 사진을 다루는 중"의 모드 전환도 사라진다.
//     사진 편집 도구가 다크 UI 를 쓰는 건 관습이기도 하다.
//   · 다만 예전 배경은 navy → #1a1268(보라) → primary 로 이어지는 3스톱 그라데이션이라
//     화면 절반이 채도 높은 보라·마젠타였다. 브랜드는 "네이비 + 핑크 **액센트**"인데
//     거기선 핑크가 액센트가 아니라 배경이었다. 그래서:
//       배경 = 네이비 단색 + 우상단에 아주 옅은 핑크 워시 한 겹(홈 히어로와 같은 문법).
//       핑크 = CTA·선택 표시 등 **행동에만**.
//   · 글래스모피즘(white/10 + backdrop-blur) 제거 → 솔리드 서피스 + 헤어라인 테두리.
//   · 모서리 언어를 홈과 맞춘다 — 버튼은 각지게, 사진/카드만 둥글게(홈: CTA 각짐,
//     썸네일 rounded-lg, 히어로 슬라이더 rounded-2xl).

export const NAVY = '#070953'
export const PRIMARY = '#eb4763'

/** 화면 배경 — 네이비 단색 + 우상단 옅은 핑크 워시 한 겹 */
export const screenBg = {
  background: `radial-gradient(95% 48% at 92% -6%, rgba(235,71,99,0.13) 0%, transparent 62%), ${NAVY}`,
}

/** 카드/서피스 — 반투명 유리가 아니라 네이비 한 단계 위의 솔리드 면 */
export const SURFACE = '#141863'
export const SURFACE_2 = '#1B2077'
export const BORDER = 'rgba(255,255,255,0.13)'

export const surfaceStyle = { background: SURFACE, border: `1px solid ${BORDER}` }
export const surface2Style = { background: SURFACE_2, border: `1px solid ${BORDER}` }

/** 하단 고정 푸터 스크림 — 장식이 아니라 가독성용(콘텐츠가 CTA 밑으로 지나감) */
export const footerScrim = { background: `linear-gradient(to top, ${NAVY} 62%, rgba(7,9,83,0))` }

// ── 버튼 ── 홈 CTA 와 같은 각진 사각. active:scale 같은 통통 튀는 모션은 쓰지 않는다.
export const btnPrimary =
  'w-full py-4 text-[15px] font-extrabold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40'
export const btnPrimaryStyle = { background: PRIMARY }
export const btnGhost =
  'inline-flex items-center justify-center gap-1.5 px-4 py-3 text-[13px] font-bold text-white border transition-colors hover:bg-white/5'
export const btnGhostStyle = { borderColor: BORDER }

/** 소형 라벨 칩 — 알약(rounded-full) 대신 각진 칩 */
export const chip = 'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold'
/** 홈과 같은 eyebrow 라벨 */
export const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.18em]'

/** 3단계 진행 표시 — 점 대신 각진 바 */
export const stepBar = (active: boolean) =>
  `h-[3px] w-5 ${active ? 'bg-white' : 'bg-white/25'}`
