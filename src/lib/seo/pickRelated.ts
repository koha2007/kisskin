// 관련 글 선택 — 링크를 '고루' 퍼뜨리기 위한 원형 선택기
// ────────────────────────────────────────────────────────────────────
// 2026-07-23. 서치콘솔 미색인 90개 중 71개가 "발견됨/크롤링됨 – 색인 미생성"
// 이었다. 원인을 내부 링크 그래프로 실측했더니(사이트맵 248개 × 프리렌더 250장)
// 고아 페이지는 0개인데 **89개가 인바운드 링크 1~2개뿐**이었다.
//
// 범인은 관련 글 선택 코드였다. 세 곳(뉴스·가이드·리뷰) 모두
//   posts.filter(같은 카테고리).slice(0, 3)
// 이라, 카테고리마다 **앞의 3개만** 계속 링크를 받고 나머지는 목록 페이지에서
// 딱 한 번 링크되는 게 전부였다. 구글에게 "이 페이지는 중요하지 않다"는 신호다.
//
// 해결: 현재 글의 위치에서 **한 칸씩 밀어서** 뽑는다. A→B,C,D / B→C,D,E …
// 원형으로 이어지므로 **모든 글이 정확히 count 개의 인바운드**를 받는다.
// 무작위가 아니라 결정적이라 빌드마다 링크 구조가 흔들리지 않는다(색인에 중요).

interface Linkable {
  slug: string
  category: string
}

/**
 * @param all      해당 섹션의 전체 글(정렬 순서는 호출부가 정한다)
 * @param current  지금 보고 있는 글
 * @param count    뽑을 개수
 */
export function pickRelated<T extends Linkable>(all: T[], current: T, count = 3): T[] {
  const out: T[] = []
  const seen = new Set<string>([current.slug])

  const take = (pool: T[]) => {
    if (pool.length < 2) return
    const i = pool.findIndex((p) => p.slug === current.slug)
    // 현재 글이 이 풀에 없으면(교차 카테고리 보충) 0번부터 이어 간다
    const start = i >= 0 ? i : -1
    for (let k = 1; k < pool.length && out.length < count; k++) {
      const cand = pool[(start + k + pool.length) % pool.length]
      if (seen.has(cand.slug)) continue
      seen.add(cand.slug)
      out.push(cand)
    }
  }

  // ① 같은 카테고리 우선 — 주제가 이어지는 링크가 사용자에게도 유용하다
  take(all.filter((p) => p.category === current.category))
  // ② 카테고리가 작아 모자라면 전체에서 이어 채운다. 링크 수를 항상 채우는 게
  //    색인 관점에서 중요하다 — 글이 2개뿐인 카테고리도 고립되면 안 된다.
  if (out.length < count) take(all)

  return out
}
