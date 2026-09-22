// 명도대비 실측 (WCAG AA) — 렌더된 페이지의 모든 텍스트 노드를 훑는다.
//
// 왜 이게 있나(2026-09-22): 색상은 소스만 봐서는 판정할 수 없다. 글자색은 토큰이고
// 배경은 조상 어딘가에서 오며, 틴트가 겹치면 합성색이 달라진다. 그래서 **브라우저가
// 실제로 칠한 색**을 읽어야 한다. 이 스크립트로 처음 재 봤을 때 10페이지에서 131건이
// 나왔고 원인은 전부 하나였다 — 액센트 원색을 글자에 쓴 것(src/index.css 규칙 참고).
//
// 쓰는 법:
//   npm run build
//   (cd dist/client && python3 -m http.server 4173 &)
//   node scripts/audit-contrast.mjs / /tools/ /news/ ...
//
// 판정 기준: 4.5:1(본문) / 3:1(24px 이상 또는 18.66px 이상 bold).
// '판정보류' 는 사진·그라디언트 위의 글자다 — DOM 배경색으로는 알 수 없어 세기만 한다.
// 이모지는 자체 색으로 그려지므로 제외한다.

import { chromium } from 'playwright'

const BASE = process.env.AUDIT_BASE ?? 'http://localhost:4173'
const PAGES = process.argv.slice(2)

const audit = () => {
  const out = []
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const p = m[1].split(',').map((x) => parseFloat(x))
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
  }
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  })
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b)
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  }

  // 사진/그라디언트 위에 얹힌 글자는 DOM 배경색으로 판정할 수 없다(스크림이 <img> 형제로
  // 깔린 경우가 많다). 페이지의 모든 <img>·그라디언트 상자의 사각형을 미리 모아 두고,
  // 글자 사각형이 그와 겹치면 '판정보류'로 뺀다 — 거짓 실패를 만들지 않기 위해.
  const overlays = []
  for (const el of document.querySelectorAll('img, svg, video, [style*="gradient"], *')) {
    const s = getComputedStyle(el)
    const isImg = el.tagName === 'IMG' || el.tagName === 'SVG' || el.tagName === 'VIDEO'
    const hasGrad = s.backgroundImage && s.backgroundImage !== 'none'
    if (!isImg && !hasGrad) continue
    const r = el.getBoundingClientRect()
    if (r.width > 4 && r.height > 4) overlays.push(r)
  }
  const overlapsMedia = (r) =>
    overlays.some((o) => r.left < o.right && r.right > o.left && r.top < o.bottom && r.bottom > o.top)

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const seen = new Set()
  let n
  while ((n = walker.nextNode())) {
    const text = n.nodeValue.trim()
    if (!text) continue
    // 이모지는 자체 색으로 그려지는 그림이다. CSS color 로 판정하면 거짓 실패가 난다.
    if (!/[\p{L}\p{N}]/u.test(text)) continue
    const el = n.parentElement
    if (!el || seen.has(el)) continue
    seen.add(el)
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.15) continue
    // 아이콘 폰트(리거처)는 글자가 아니다
    if (cs.fontFamily.includes('Material Symbols')) continue
    const rect = el.getBoundingClientRect()
    if (rect.width < 2 || rect.height < 2) continue

    const fg0 = parse(cs.color)
    if (!fg0) continue

    // 배경 찾기
    let bg = null, imageBg = false, node = el
    while (node) {
      const s = getComputedStyle(node)
      if (s.backgroundImage && s.backgroundImage !== 'none') { imageBg = true; break }
      const c = parse(s.backgroundColor)
      if (c && c.a > 0) {
        bg = bg ? over(bg, c) : c
        if (bg.a >= 0.999) break
      }
      node = node.parentElement
    }
    if (imageBg || overlapsMedia(rect)) { out.push({ skip: 'image-bg', text: text.slice(0, 40) }); continue }
    if (!bg) bg = { r: 255, g: 255, b: 255, a: 1 }
    if (bg.a < 0.999) bg = over(bg, { r: 255, g: 255, b: 255, a: 1 })

    const fg = fg0.a < 1 ? over(fg0, bg) : fg0
    const size = parseFloat(cs.fontSize)
    const weight = parseInt(cs.fontWeight, 10) || 400
    const large = size >= 24 || (size >= 18.66 && weight >= 700)
    const need = large ? 3 : 4.5
    const r = ratio(fg, bg)
    if (r < need) {
      out.push({
        text: text.slice(0, 60),
        ratio: Math.round(r * 100) / 100,
        need,
        size,
        weight,
        color: cs.color,
        bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
        sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''),
      })
    }
  }
  return out
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const all = []
for (const p of PAGES) {
  await page.goto(BASE + p, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const res = await page.evaluate(audit)
  const fails = res.filter((x) => !x.skip)
  const skipped = res.filter((x) => x.skip).length
  all.push({ page: p, fails, skipped })
  console.log(`\n── ${p}  (실패 ${fails.length} · 판정보류 ${skipped})`)
  for (const f of fails) console.log(`   ${f.ratio} / ${f.need}  ${f.size}px w${f.weight}  ${f.color} on ${f.bg}\n      "${f.text}"\n      ${f.sel}`)
}
await browser.close()
const total = all.reduce((a, b) => a + b.fails.length, 0)
console.log(`\n합계 실패 ${total}건 / ${PAGES.length}페이지`)
