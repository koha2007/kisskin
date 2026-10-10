// 자동 발행 중복 검사 — 2026-10-10 전체 점검에서 발견.
// ────────────────────────────────────────────────────────────────────
// 그때까지 중복 방지는 **slug 가 완전히 같을 때만** 걸렸다. 그래서 같은 소식이 주소만 바꿔
// 여러 번 나갔다(로레알·코스맥스 MOU 4번, 상반기 수출 3번 …, 제품도 5쌍). 구글 2026-03 업데이트의
// 최우선 단속 대상이 "사람 검수 없는 대량·중복 발행"이라 사이트 전체 평가를 깎는다.
//
// 방식: 제목(제품은 브랜드+제품명)을 글자 2-gram 집합으로 바꿔 겹침을 잰다. 단어 단위는
// 한국어 조사('로레알과' vs '로레알')에 깨져서 2-gram 이 낫다. 흔한 말(K-뷰티·2026 등)은 뺀다.
// 기준값은 기존 110 뉴스 · 81 제품의 실제 중복쌍/비중복쌍으로 맞췄다(scripts 주석 아래 표).

const STOP = /k-?뷰티|kbeauty|k-beauty|뷰티|화장품|시장|글로벌|20\d\d년?|위해|위한|체결|발표|출시|공개|확정|기록|급증|성장|역대|최대|신제품|[0-9]+월/gi

export function grams(s) {
  const t = String(s).toLowerCase().replace(STOP, ' ').replace(/[^0-9a-z가-힣]+/g, '')
  const g = new Set()
  for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2))
  return g
}

/** 겹침 = |A∩B| / min(|A|,|B|) — 짧은 제목이 긴 제목에 거의 다 들어 있으면 같은 이야기 */
export function overlap(a, b) {
  const A = grams(a), B = grams(b)
  if (!A.size || !B.size) return 0
  let n = 0
  for (const x of A) if (B.has(x)) n++
  return n / Math.min(A.size, B.size)
}

export const NEWS_DUP = 0.62
export const PRODUCT_DUP = 0.7

/** 새 뉴스 제목이 기존 제목 중 하나와 같은 이야기인가 → 그 제목(없으면 null) */
export function findDupTitle(title, titles, th = NEWS_DUP) {
  let best = null, bv = 0
  for (const t of titles) { const v = overlap(title, t); if (v > bv) { bv = v; best = t } }
  return bv >= th ? { title: best, score: +bv.toFixed(2) } : null
}

/** 새 제품이 기존 제품과 같은가 — 브랜드가 같고 제품명이 거의 같을 때 */
export function findDupProduct(brand, name, items, th = PRODUCT_DUP) {
  const nb = String(brand).toLowerCase().replace(/[^0-9a-z가-힣]/g, '')
  for (const it of items) {
    const ib = String(it.brand).toLowerCase().replace(/[^0-9a-z가-힣]/g, '')
    if (!nb || !ib || !(nb.includes(ib) || ib.includes(nb))) continue
    const v = overlap(name.replace(/\[.*?\]|#\S+/g, ''), it.name.replace(/\[.*?\]|#\S+/g, ''))
    if (v >= th) return { ...it, score: +v.toFixed(2) }
  }
  return null
}
