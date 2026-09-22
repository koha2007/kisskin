// 액센트 색을 "읽히는 글자색"으로 내리는 변환 (WCAG AA).
//
// 왜(2026-09-22 색상 실측): 결과·도구 화면의 작은 라벨이 그 유형의 상징색을 그대로
// 글자색으로 썼다. 상징색은 눈에 띄라고 고른 밝은 색이라 흰 배경에서 대비가 무너진다.
//   가을웜 머스터드 #f59e0b on white = 2.15:1   (AA 기준 4.5:1)
//   MBTI 틸 #4e9fa6 = 3.07 · 세이지 #7e9b6a = 3.10 · 플럼 #8e6e9e = 4.31
// 11px 짜리 "립 / 눈동자 / 모발" 같은 라벨이 이 색이라 사실상 안 읽혔다.
//
// 상징색 자체는 바꿀 수 없다(퍼스널컬러 4계절색은 그 계절의 색 자체다). 그래서
// **색상(hue)·채도는 그대로 두고 명도만 낮춰** 기준을 넘는 지점을 찾는다. 점·테두리·
// 아이콘 같은 비텍스트 요소에는 원색을 그대로 쓰고, 글자에만 이 함수를 통과시킨다.
//
// 데이터에서 색이 오는 자리(유형별 primaryColor 등)에 쓰므로 런타임 계산이다.
// 입력이 같으면 결과가 같아 SSR/CSR 값이 어긋나지 않는다.

function srgbToLinear(v: number): number {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const l1 = luminance(a)
  const l2 = luminance(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function toHex([r, g, b]: [number, number, number]): string {
  const p = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${p(r)}${p(g)}${p(b)}`
}

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return [h, s, l]
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255]
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const f = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255]
}

/**
 * 배경 위에서 `minRatio` 를 만족하는, 원색에 가장 가까운 글자색을 돌려준다.
 * 이미 만족하면 원색을 그대로 돌려준다(불필요하게 어둡히지 않는다).
 *
 * @param accent 유형의 상징색 (#rrggbb)
 * @param bg     그 글자가 얹히는 배경색 — 기본값은 흰색
 * @param minRatio 4.5 = 본문·소형 라벨(AA) / 3 = 큰 글자·아이콘
 */
export function readableInk(accent: string, bg = '#ffffff', minRatio = 4.5): string {
  const fg = parseHex(accent)
  const back = parseHex(bg)
  if (!fg || !back) return accent
  if (contrast(fg, back) >= minRatio) return accent

  const [h, s] = rgbToHsl(fg)
  // 배경이 밝으면 어둡게, 어두우면 밝게. 이분탐색 20회면 명도 1/1,000,000 단위까지 좁혀진다.
  const backIsLight = luminance(back) > 0.18
  let lo = backIsLight ? 0 : rgbToHsl(fg)[2]
  let hi = backIsLight ? rgbToHsl(fg)[2] : 1
  let best = backIsLight ? [0, 0, 0] as [number, number, number] : [255, 255, 255] as [number, number, number]
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    const c = hslToRgb([h, s, mid])
    if (contrast(c, back) >= minRatio) {
      best = c
      if (backIsLight) lo = mid
      else hi = mid
    } else if (backIsLight) {
      hi = mid
    } else {
      lo = mid
    }
  }
  // ⚠ 이분탐색은 실수 공간에서 '기준을 갓 넘긴' 값을 찾는다. 그 값을 8비트 정수로
  //   반올림하면 다시 기준 아래로 떨어질 수 있다(실측 4.49:1 로 미달한 적 있음).
  //   그러니 반올림한 **최종 색**으로 다시 재고, 모자라면 만족할 때까지 한 단계씩 민다.
  let out = toHex(best)
  for (let i = 0; i < 24; i++) {
    const c = parseHex(out)!
    if (contrast(c, back) >= minRatio) break
    out = toHex(backIsLight ? [c[0] - 3, c[1] - 3, c[2] - 3] : [c[0] + 3, c[1] + 3, c[2] + 3])
  }
  return out
}

/**
 * 반투명 액센트를 `base` 위에 깐 결과색. 벤토 타일의 `${accent}14`(=8%) 같은 틴트 배경을
 * readableInk 의 bg 로 넘기려면 먼저 이 함수로 실제 색을 만들어야 한다. 흰색으로 어림하면
 * 틴트만큼의 차이를 놓쳐 기준을 아슬아슬하게 못 넘긴다(실측: 4.40:1 로 미달).
 * base 는 그 타일 뒤에 깔린 섹션 배경이다 — 도구 결과 화면은 힐다 #f5efe3.
 */
export function tintOver(accent: string, alpha: number, base = '#ffffff'): string {
  const c = parseHex(accent)
  const b = parseHex(base)
  if (!c || !b) return base
  const a = Math.max(0, Math.min(1, alpha))
  return toHex([c[0] * a + b[0] * (1 - a), c[1] * a + b[1] * (1 - a), c[2] * a + b[2] * (1 - a)])
}
