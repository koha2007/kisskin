// 틱톡 캐러셀 "how to" 슬라이드 — 룩당 단계 4장 + 저장 CTA 1장, 1080×1920. 과금 0(로컬 렌더).
// v2(2026-10-02): 글만 있던 v1 → **페이스 차트 + 부위 스포트라이트 + 확대 원** 으로.
//   벤치마킹: 메이크업 아티스트의 페이스 차트(NYX·Makeup by Mario·Estée Lauder 공식 차트),
//   Charlotte Tilbury 의 번호 단계, 틱톡 캐러셀 "한 장에 한 가지 · 5~10장 · 마지막 장은 한 가지 요청(저장)".
// 문구·좌표는 src/lib/looks/howto.ts 단일 소스. 차트 = public/looks/charts/{id}.webp (CHART_LOOKS 만).
//   node scripts/gen-tiktok-howto.mjs [id]   → _archive/originals/tiktok-howto/{id}-step{1..4}.png, {id}-save.png
import { mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'
import { LOOK_HOWTO, CHART_LOOKS, CHART_ZONE } from '../src/lib/looks/howto.ts'

const OUT = resolve('_archive/originals/tiktok-howto')
mkdirSync(OUT, { recursive: true })
const NAMES = {
  'natural-glow': 'NATURAL GLOW', 'cloud-skin': 'CLOUD SKIN', 'blood-lip': 'BLOOD LIP',
  'maximalist-eye': 'MAXIMALIST EYE', 'metallic-eye': 'METALLIC EYE', 'bold-lip': 'BOLD LIP',
  'blush-draping': 'BLUSH DRAPING', grunge: 'GRUNGE', 'kpop-idol': 'K-POP IDOL',
}
const ACCENT = {
  'natural-glow': '#e0894f', 'cloud-skin': '#6f93d6', 'blood-lip': '#a3122a', 'maximalist-eye': '#6a3fe0',
  'metallic-eye': '#c9971f', 'bold-lip': '#e5452f', 'blush-draping': '#e05a8c', grunge: '#5e2a4a', 'kpop-idol': '#ec4f8f',
}
const AREA = { skin: 'SKIN', eyes: 'EYES', cheeks: 'CHEEKS', lips: 'LIPS', hair: 'HAIR' }
const b64 = (p) => 'data:image/webp;base64,' + readFileSync(p).toString('base64')
const logo = b64('public/logo-sm.webp')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const firstSentence = (s) => (s.match(/^.*?[.!?](\s|$)/) ?? [s])[0].trim()

// 차트 표시 영역: 원본 1024×1536 중 y 300~1160 을 가로 1080 에 맞춘다
const CY0 = 300, CY1 = 1160, SC = 1080 / 1024
const CHART_TOP = 470
// 확대 원이 비출 한 점 — 부위 중심(두 눈 사이·코)은 정작 아무것도 안 보여서 왼쪽 눈·왼쪽 볼로 잡는다
// 2026-10-02 차트 픽셀 실측: 왼쪽 눈동자 (370, 607) · 입술 중심 (506, 894)
const ZOOM_AT = { eyes: [372, 618], cheeks: [395, 725], lips: [508, 896] }

const BASE = (accent) => `
<link href="https://fonts.googleapis.com/css2?family=DynaPuff:wght@600;700&family=Inter:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;background:#f6efe6;font-family:Inter,sans-serif;color:#0b0d4f;position:relative;overflow:hidden}
.kicker{position:absolute;left:72px;top:118px;font:800 30px Inter;letter-spacing:.18em;color:${accent}}
.dyn{font-family:DynaPuff;font-weight:700;color:#fff;-webkit-text-stroke:12px ${accent};paint-order:stroke fill}
.foot{position:absolute;left:72px;bottom:120px;display:flex;align-items:center;gap:14px;font:800 30px Inter}
.foot img{width:50px;height:50px;border-radius:50%}
.blob{display:inline-block;width:110px;height:80px;border-radius:44% 56% 52% 48%/60% 46% 54% 40%;box-shadow:inset 0 -9px 0 rgba(0,0,0,.13)}
</style>`

function stepSlide(id, chart, step, n, total, accent) {
  const z = CHART_ZONE[step.area]
  const zx = z.cx * SC, zy = (z.cy - CY0) * SC + CHART_TOP, rx = z.rx * SC, ry = z.ry * SC
  const chartH = (CY1 - CY0) * SC
  const zoom = step.area !== 'skin' && step.area !== 'hair'
  const Z = { eyes: 2.3, cheeks: 1.4, lips: 1.25 }[step.area] ?? 2, R = 165 // 배율·확대 원 반지름 (입술은 좌우가 넓어 낮춘다)
  // 확대 원 배경: 차트 원본(1024 폭)을 SC*Z 배율로, 부위 중심이 원 중앙에 오게
  const bgW = 1024 * SC * Z
  const [px, py] = ZOOM_AT[step.area] ?? [z.cx, z.cy]
  const IN = R - 8 // 테두리 8px 안쪽(padding box) 중심
  const bgX = IN - px * SC * Z, bgY = IN - py * SC * Z
  const pinX = Math.min(zx + rx * 0.92, 900), pinY = zy - ry * 0.9
  return `<!doctype html><html><head><meta charset="utf-8">${BASE(accent)}
<style>
.chart{position:absolute;left:0;top:${CHART_TOP}px;width:1080px;height:${chartH}px;background:url(${chart}) 0 ${-CY0 * SC}px/1080px auto no-repeat}
.spot{position:absolute;left:0;top:${CHART_TOP}px;width:1080px;height:${chartH}px;
  background:radial-gradient(ellipse ${rx * 1.25}px ${ry * 1.35}px at ${zx}px ${zy - CHART_TOP}px, transparent 62%, rgba(246,239,230,.82) 100%)}
.ring{position:absolute;left:${zx - rx}px;top:${zy - ry}px;width:${rx * 2}px;height:${ry * 2}px;border-radius:50%;border:5px dashed ${accent}}
.pin{position:absolute;left:${pinX - 44}px;top:${pinY - 44}px;width:88px;height:88px;border-radius:50%;background:${accent};color:#fff;
  font:700 50px DynaPuff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 0 rgba(0,0,0,.15)}
.zoom{position:absolute;left:72px;top:${CHART_TOP + chartH - R * 2 + 40}px;width:${R * 2}px;height:${R * 2}px;border-radius:50%;
  border:8px solid #fff;box-shadow:0 0 0 5px ${accent},0 14px 30px rgba(0,0,0,.18);
  background:url(${chart}) ${bgX}px ${bgY}px/${bgW}px auto no-repeat}
.head{position:absolute;left:72px;right:72px;top:180px}
.step{font:800 28px Inter;letter-spacing:.18em;color:#0b0d4f;opacity:.55}
h1{font:800 70px/1.08 Inter;letter-spacing:-.02em;color:#0b0d4f;margin-top:16px}
.info{position:absolute;left:72px;right:150px;top:${CHART_TOP + chartH + 70}px}
.line{font:600 38px/1.4 Inter;color:#2b2e55}
.sw{display:flex;align-items:center;gap:14px;margin-top:34px}
.tools{font:700 28px Inter;color:#6d7090;margin-left:8px;max-width:520px;line-height:1.3}
</style></head><body>
<div class="kicker">HOW TO · ${NAMES[id]}</div>
<div class="head"><div class="step">STEP ${n} / ${total} · ${AREA[step.area]}</div><h1>${esc(step.titleEn)}</h1></div>
<div class="chart"></div><div class="spot"></div><div class="ring"></div><div class="pin">${n}</div>
${zoom ? '<div class="zoom"></div>' : ''}
<div class="info"><p class="line">${esc(firstSentence(step.bodyEn))}</p>
<div class="sw">${step.swatches.map((c, i) => `<span class="blob" style="background:${c};transform:rotate(${(i % 2 ? 1 : -1) * (5 + i * 4)}deg)"></span>`).join('')}<span class="tools">${esc(step.toolsEn)}</span></div></div>
<div class="foot"><img src="${logo}">kissinskin.net/looks</div>
</body></html>`
}

// 마지막 장 — 요청은 하나(저장). 빈 공간 없이: 빈 차트 → 완성 차트 한 쌍이 화면을 채운다.
function saveSlide(id, blank, chart, accent, steps) {
  const W = 400, H = Math.round(W * 1.5)
  const crop = (src) => `background:url(${src}) 50% 22%/${W * 1.28}px auto no-repeat`
  return `<!doctype html><html><head><meta charset="utf-8">${BASE(accent)}
<style>
h1{position:absolute;left:72px;top:190px;font-size:128px;line-height:.98}
.bm{position:absolute;left:470px;top:320px;width:120px;height:120px;transform:rotate(12deg)}
.sub{position:absolute;left:76px;top:490px;font:600 36px/1.4 Inter;color:#2b2e55;max-width:780px}
.pair{position:absolute;left:72px;top:620px;display:flex;align-items:center;gap:24px}
.card{width:${W}px;height:${H}px;border-radius:30px;border:6px solid #fff;box-shadow:0 12px 30px rgba(0,0,0,.12);position:relative}
.tag{position:absolute;left:18px;top:18px;padding:8px 18px;border-radius:999px;font:800 22px Inter;letter-spacing:.12em;color:#fff}
.arrow{position:absolute;left:905px;top:1040px;width:160px;height:330px}
.list{position:absolute;left:72px;top:${620 + H + 40}px;width:824px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.chip{padding:14px 20px;border-radius:18px;background:#fff;font:700 25px/1.25 Inter;color:#0b0d4f}
.chip b{color:${accent};margin-right:8px}
.cta{position:absolute;left:72px;width:824px;top:${620 + H + 40 + 190}px;background:#0b0d4f;color:#fff;border-radius:28px;padding:30px 36px}
.cta p{font:600 28px Inter;opacity:.75}.cta strong{display:block;font:700 46px DynaPuff;margin-top:6px}
</style></head><body>
<div class="kicker">${NAMES[id]} · ${steps.length} STEPS</div>
<h1 class="dyn">save this<br>look</h1><svg class="bm" viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" fill="${accent}" stroke="#fff" stroke-width="1.6"/></svg>
<p class="sub">so the steps are here when you sit down to do it. →</p>
<div class="pair">
  <div class="card" style="${crop(blank)}"><span class="tag" style="background:#0b0d4f">BARE</span></div>
  <div class="card" style="${crop(chart)}"><span class="tag" style="background:${accent}">${NAMES[id]}</span></div>
</div>
<div class="list">${steps.map((s, i) => `<span class="chip"><b>${i + 1}</b>${esc(s.titleEn)}</span>`).join('')}</div>
<div class="cta"><p>full steps + try it on your selfie</p><strong>kissinskin.net/looks</strong></div>
<svg class="arrow" viewBox="0 0 160 330" fill="none" stroke="${accent}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
  <path d="M30 15 C 20 140, 60 250, 140 300"/><path d="M85 300 L 142 302 L 128 245"/></svg>
</body></html>`
}

const only = process.argv[2]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
const blank = b64('public/looks/charts/blank.webp')
for (const id of CHART_LOOKS) {
  if (only && id !== only) continue
  const how = LOOK_HOWTO[id]
  const chart = b64(`public/looks/charts/${id}.webp`)
  const shots = how.steps.map((s, i) => [`${id}-step${i + 1}.png`, stepSlide(id, chart, s, i + 1, how.steps.length, ACCENT[id])])
  shots.push([`${id}-save.png`, saveSlide(id, blank, chart, ACCENT[id], how.steps)])
  for (const [file, html] of shots) {
    await page.setContent(html, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: `${OUT}/${file}` })
    console.log(file)
  }
}
await browser.close()
