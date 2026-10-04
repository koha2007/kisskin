// YesStyle 검색어 후보 — /api/go/yesstyle 이 앞에서부터 결과 있는 첫 후보로 보낸다.
//
// 왜 필요한가(2026-10-04 실측): 제품 globalQuery 80개를 그대로 YesStyle 에 넣으면
// 61개가 "0 items". YesStyle 검색은 모든 단어가 맞아야 하는데
//   · 호수/컬러명(…cheek balm 06 peach beam)
//   · 미입점 브랜드(Dior·Tamburins…), 검색 안 되는 브랜드 표기(rom&nd → 0)
//   · 영문명 오타
// 중 하나만 걸려도 0 이 된다. 단어를 하나씩 덜어내며 후보를 만든다.

// 긴 것부터 — "lip oil stick" 이 "oil" 보다 먼저 잡혀야 한다.
const CATEGORIES = [
  'lip oil stick', 'tinted lip oil', 'lip oil', 'lip tint', 'lip gloss', 'lip glaze', 'lip balm', 'lip stain',
  'lip mask', 'liquid lipstick', 'cheek balm', 'liquid blush', 'powder blush', 'cream blush', 'sun cream',
  'sun stick', 'hand cream', 'hair oil', 'hair mask', 'dry shampoo', 'eyeshadow palette', 'eye palette',
  'face palette', 'makeup palette', 'cushion foundation', 'brow shaper', 'eau de parfum',
  'eyeliner', 'mascara', 'cushion', 'foundation', 'primer', 'serum', 'sunscreen', 'toner', 'essence',
  'ampoule', 'cleanser', 'concealer', 'lipstick', 'eyeshadow', 'perfume', 'blush', 'palette', 'gloss',
  'tint', 'balm', 'cream', 'cheek', 'powder', 'mask', 'oil', 'shampoo', 'spray', 'stick', 'straightener',
]

// 첫 단어만으론 브랜드가 안 되는 경우(Rare → Rare Beauty).
const TWO_WORD_BRANDS = [
  'rare beauty', 'charlotte tilbury', 'banila co', 'dr. jart', 'round lab', 'kylie cosmetics', 'laura geller',
  'natasha denona', 'milk makeup', 'haus labs', 'color wow', 'louis vuitton', 'fenty skin', 'fenty beauty',
  'flower knows', 'kaja beauty', 'mielle organics',
]

const clean = (s: string) =>
  s.replace(/&/g, '').replace(/[+_]/g, ' ').replace(/\s+/g, ' ').trim()

export function yesStyleCandidates(raw: string): string[] {
  const q = clean(raw)
  const words = q.split(' ')
  const lower = q.toLowerCase()

  const brandLen = TWO_WORD_BRANDS.some((b) => lower.startsWith(b + ' ')) ? 2 : 1
  const brand = words.slice(0, brandLen).join(' ')

  // 첫 카테고리 단어의 끝 위치(단어 수). 그 뒤는 호수·컬러명으로 본다.
  let cat = ''
  let catEnd = -1
  for (const c of CATEGORIES) {
    const m = new RegExp(`(^|\\s)${c.replace(/\./g, '\\.')}(\\s|$)`, 'i').exec(q)
    if (m) {
      const end = q.slice(0, m.index + m[0].trimEnd().length).split(' ').filter(Boolean).length
      if (end > brandLen) { cat = c; catEnd = end; break }
    }
  }

  const out: string[] = [q]
  if (catEnd > 0) {
    out.push(words.slice(0, catEnd).join(' '))          // 컬러명 떼기
    out.push(`${brand} ${cat}`)                          // 브랜드 + 종류
    out.push(brand)                                      // 그 제품만 미입점 → 브랜드 목록
    // 브랜드 떼기 — 검색이 안 되는 브랜드 표기용(rom&nd 는 어떤 철자로도 0).
    // 브랜드보다 뒤인 이유: 단어 몇 개짜리 라인명은 남의 제품에 걸리기 쉽다.
    const line = words.slice(brandLen, catEnd)
    if (line.length >= 2) out.push(line.join(' '))
    out.push(cat)                                        // 미입점 브랜드 → 같은 종류
  } else if (words.length > brandLen) {
    out.push(brand)
  }
  return [...new Set(out.map((s) => s.trim()).filter(Boolean))]
}

export const yesStyleSearchUrl = (q: string) =>
  `https://www.yesstyle.com/en/list.html?q=${encodeURIComponent(q)}&bpt=48`
