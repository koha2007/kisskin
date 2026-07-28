// 목록(허브) 페이지용 구조화 데이터 — CollectionPage + ItemList
// ────────────────────────────────────────────────────────────────────
// 2026-07-28. /tools/ 만 CollectionPage 를 갖고 있었고 /news/ · /products/ 는
// WebSite·Organization 뿐이었다. 검색엔진 입장에서 이 두 페이지는 "글이 잔뜩 있는
// 아무 페이지"였다 — 매일 갱신되는 목록이라는 것도, 그 목록에 뭐가 들어 있는지도
// 선언된 적이 없다.
//
// ItemList 는 목록에 실린 항목과 순서를 명시적으로 알려 준다. 허브가 상세 링크를
// 이미 전부 서버렌더하고 있으므로(뉴스 53 · 제품 25) 목록을 그대로 옮겨 적는다 —
// HTML 에 없는 걸 스키마로만 주장하지 않는다(그건 정책 위반이다).
//
// ⚠️ 여기서도 없는 데이터는 만들지 않는다. 평점·가격·리뷰 수는 넣지 않는다.

export interface HubListItem {
  /** 상세 페이지 절대 URL */
  url: string
  /** 목록에 표시되는 이름 */
  name: string
}

export function hubListSchema(opts: {
  url: string
  name: string
  description: string
  locale: 'ko' | 'en'
  items: HubListItem[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inLanguage: opts.locale,
    isPartOf: { '@type': 'WebSite', name: 'kissinskin', url: 'https://kissinskin.net/' },
    mainEntity: {
      '@type': 'ItemList',
      // 최신순으로 렌더한다 — 목록 순서를 사실대로 적는다.
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: it.url,
        name: it.name,
      })),
    },
  }
}
