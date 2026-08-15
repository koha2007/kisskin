// 검색결과 제목 조립 — 가이드·리뷰(ko/en) 4개 Head 가 공유한다.
//
// 구글은 제목을 픽셀 폭 기준 약 60자에서 자른다. 우리 편집 제목은 그보다 길 때가
// 있는데, 거기에 " · kissinskin Guides"(19자) 같은 사이트 접미사까지 무조건 붙이면
// 정작 사람이 읽어야 할 부분이 "…" 로 잘려 나간다.
//
// 2026-08-15 실측(EN 142페이지): 제목 60자 초과 11개, 설명 160자 초과 5개.
// 길이가 맞는 페이지의 CTR 이 눈에 띄게 높았다 —
//   /en/tools/makeup-mbti/ 56자 → 노출 257·클릭 16 (6.2%)
//   /en/ 짧음              → 노출 38·클릭 4 (10.5%)
//   /en/reviews/global-bestseller-lipstick-top-10/ 91자 → 노출 70·클릭 3 (4.3%)
//   /en/guides/personal-color-analysis-korea/ 122자 → 노출 90·클릭 ~0
// 인과의 증거는 아니지만 방향은 일관되고, 잘린 제목이 도움이 될 이유는 없다.

/** 구글이 제목을 자르기 시작하는 대략의 글자 수. */
export const TITLE_LIMIT = 60

/**
 * 접미사를 붙여도 한계 안이면 붙이고, 넘치면 제목만 낸다.
 *
 * 제목 자체를 깎지는 **않는다** — 그건 편집 판단이라 `seoTitle` 로 직접 쓰는 게 맞다.
 * 여기서 하는 일은 "접미사 때문에 잘리는" 경우만 없애는 것이다.
 */
export function withSiteSuffix(title: string, suffix: string): string {
  const full = `${title} · ${suffix}`
  return full.length <= TITLE_LIMIT ? full : title
}

/** seoTitle 이 있으면 그대로(이미 사람이 길이를 보고 쓴 값), 없으면 접미사 규칙 적용. */
export function resolveSeoTitle(
  post: { title: string; seoTitle?: string },
  suffix: string,
): string {
  return post.seoTitle ?? withSiteSuffix(post.title, suffix)
}
