// 틱톡 캐러셀 "how to get this look" 슬라이드 생성 — 룩당 2장(1/2, 2/2), 1080×1920.
// 문구·색 칩은 src/lib/looks/howto.ts 단일 소스(사이트 /looks/ 와 동일). 과금 0(로컬 렌더).
// 모델 사진을 넣지 않는다 — 틱톡 모델(운영자 PC)과 사이트 모델이 달라서, 어느 모델의
// 캐러셀에도 끼워 넣을 수 있게 "색 + 방법"만으로 만든다.
//   node scripts/gen-tiktok-howto.mjs            # 9룩 전부 → _archive/originals/tiktok-howto/
//   node scripts/gen-tiktok-howto.mjs kpop-idol  # 한 룩만
import { mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'
import { LOOK_HOWTO } from '../src/lib/looks/howto.ts'

const OUT = resolve('_archive/originals/tiktok-howto')
mkdirSync(OUT, { recursive: true })
const NAMES = {
  'natural-glow': 'NATURAL GLOW', 'cloud-skin': 'CLOUD SKIN', 'blood-lip': 'BLOOD LIP',
  'maximalist-eye': 'MAXIMALIST EYE', 'metallic-eye': 'METALLIC EYE', 'bold-lip': 'BOLD LIP',
  'blush-draping': 'BLUSH DRAPING', grunge: 'GRUNGE', 'kpop-idol': 'K-POP IDOL',
}
const AREA = { skin: 'SKIN', eyes: 'EYES', cheeks: 'CHEEKS', lips: 'LIPS', hair: 'HAIR' }
const logo = 'data:image/webp;base64,' + readFileSync('public/logo-sm.webp').toString('base64')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

function html(id, steps, part, accent) {
  const blob = (c, i) => `<span class="blob" style="background:${c};transform:rotate(${(i % 2 ? 1 : -1) * (6 + i * 3)}deg)"></span>`
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=DynaPuff:wght@600;700&family=Inter:wght@500;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;background:#f6efe6;font-family:Inter,sans-serif;color:#0b0d4f;padding:150px 84px 230px;display:flex;flex-direction:column}
.kicker{font:800 30px Inter;letter-spacing:.2em;color:${accent}}
h1{font:700 104px/1 DynaPuff;color:#fff;-webkit-text-stroke:14px ${accent};paint-order:stroke fill;margin-top:20px}
.part{font:700 40px DynaPuff;color:#0b0d4f;margin-top:16px}
.steps{margin-top:60px;display:flex;flex-direction:column;gap:44px;flex:1}
.step{background:#fff;border-radius:36px;padding:48px 52px;box-shadow:0 10px 0 rgba(11,13,79,.08)}
.head{display:flex;align-items:center;gap:20px}
.num{width:68px;height:68px;border-radius:50%;background:#0b0d4f;color:#fff;font:700 38px DynaPuff;display:flex;align-items:center;justify-content:center}
.area{font:800 26px Inter;letter-spacing:.2em;color:${accent}}
h2{font:800 50px/1.15 Inter;margin-top:26px;letter-spacing:-.01em}
p{font:500 34px/1.45 Inter;color:#3c3f5c;margin-top:18px}
.sw{display:flex;gap:14px;margin-top:30px;align-items:center}
.blob{width:96px;height:72px;border-radius:44% 56% 52% 48%/60% 46% 54% 40%;box-shadow:inset 0 -8px 0 rgba(0,0,0,.12)}
.tools{font:700 26px Inter;color:#7a7c93;margin-left:10px}
.foot{display:flex;align-items:center;gap:16px;margin-top:40px;font:800 34px Inter}
.foot img{width:56px;height:56px;border-radius:50%}
.foot span{color:#7a7c93;font-weight:600;font-size:28px;margin-left:auto}
</style></head><body>
<div class="kicker">HOW TO GET THIS LOOK</div>
<h1>${NAMES[id]}</h1>
<div class="part">step by step · ${part}/2</div>
<div class="steps">${steps.map((s) => `
<div class="step"><div class="head"><div class="num">${s.n}</div><div class="area">${AREA[s.area]}</div></div>
<h2>${esc(s.titleEn)}</h2><p>${esc(s.bodyEn)}</p>
<div class="sw">${s.swatches.map(blob).join('')}<span class="tools">${esc(s.toolsEn)}</span></div></div>`).join('')}
</div>
<div class="foot"><img src="${logo}">kissinskin.net/looks<span>${part === 1 ? 'swipe for steps 3–4 →' : 'save this for later 🔖'}</span></div>
</body></html>`
}

const ACCENT = {
  'natural-glow': '#e0894f', 'cloud-skin': '#6f93d6', 'blood-lip': '#a3122a', 'maximalist-eye': '#6a3fe0',
  'metallic-eye': '#c9971f', 'bold-lip': '#e5452f', 'blush-draping': '#e05a8c', grunge: '#5e2a4a', 'kpop-idol': '#ec4f8f',
}

const only = process.argv[2]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
for (const [id, how] of Object.entries(LOOK_HOWTO)) {
  if (only && id !== only) continue
  const steps = how.steps.map((s, i) => ({ ...s, n: i + 1 }))
  for (const part of [1, 2]) {
    await page.setContent(html(id, steps.slice((part - 1) * 2, part * 2), part, ACCENT[id]), { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const overflow = await page.evaluate(() => document.body.scrollHeight > 1920)
    await page.screenshot({ path: `${OUT}/${id}-howto-${part}.png` })
    console.log(`${id}-howto-${part}.png${overflow ? '  ⚠ 넘침' : ''}`)
  }
}
await browser.close()
