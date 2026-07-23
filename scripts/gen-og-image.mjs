#!/usr/bin/env node
/**
 * og-image 생성기 (2026-07-23)
 *
 * 왜 스크립트인가: 기존 og-image.png 는 옛 핑크 팔레트에 옛 카피
 * ("셀카 한 장으로 9가지 메이크업 룩 완성")가 **픽셀로 구워져** 있었다.
 * 카피나 팔레트가 바뀔 때마다 손으로 다시 그릴 수 없으므로 HTML → 스크린샷으로
 * 재생성 가능하게 만든다. (recolor-logo.mjs 와 같은 취지)
 *
 * 이미지 모델을 쓰지 않는 이유: OG 카드는 텍스트가 본체다. 이미지 모델은 한글
 * 자소를 정확히 그리지 못한다. 사진은 이미 만들어 둔 public/mood/ 를 합성한다.
 *
 *   node scripts/gen-og-image.mjs          # ko + en 둘 다
 *   node scripts/gen-og-image.mjs --only ko
 */
import { chromium } from 'playwright'
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const W = 1200
const H = 630
const SCALE = 2 // 2배로 찍고 줄여야 글자 가장자리가 깨끗하다

const dataUri = (rel) => {
  const buf = readFileSync(resolve(ROOT, rel))
  return `data:image/webp;base64,${buf.toString('base64')}`
}

/** 팔레트 — src/index.css @theme 과 1:1 */
const C = {
  cream: '#f5efe3',
  surface: '#fffdf8',
  navy: '#232a52',
  muted: '#6b6f8c',
  primary: '#d8503c',
  line: 'rgba(35, 42, 82, 0.16)',
}

const COPY = {
  ko: {
    eyebrow: '무료 AI 뷰티 진단 · 서울',
    // 홈 히어로(home.hero.title*)와 같은 문장을 쓴다. 공유 카드와 도착 페이지의
    // 첫 문장이 다르면 클릭한 사람이 "다른 데 왔나" 하고 되돌아간다.
    line1: '사보기 전에,',
    line2Accent: '내 얼굴에',
    line2: ' 발라본다',
    sub: '셀카 한 장이면 60초. 진단 4종은 가입 없이 무료.',
    chips: ['퍼스널컬러', '얼굴형', '메이크업 MBTI', '향수 타입'],
    cta: '무료로 진단하기',
  },
  en: {
    eyebrow: 'FREE AI BEAUTY ANALYSIS · SEOUL',
    line1: 'Try it on your face',
    line2Accent: 'before',
    line2: ' you buy.',
    sub: 'One selfie, 60 seconds. Four quizzes, free, no signup.',
    chips: ['Personal Color', 'Face Shape', 'Makeup MBTI', 'Perfume Type'],
    cta: 'Take the free quiz',
  },
}

const html = (locale) => {
  const t = COPY[locale]
  const portrait = dataUri('public/mood/fs-oval.webp')
  const palette = dataUri('public/mood/pc-autumn.webp')
  const scent = dataUri('public/mood/pt-woody.webp')
  const logo = dataUri('public/logo-sm.webp')
  return `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=block">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${W}px; height: ${H}px; display: flex; overflow: hidden;
    background: ${C.cream}; color: ${C.navy};
    font-family: "Pretendard Variable", Pretendard, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .left { flex: 1; padding: 44px 44px 44px 56px; display: flex; flex-direction: column; justify-content: center; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand img { width: 34px; height: 34px; border-radius: 50%; }
  .brand span { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
  .eyebrow {
    margin-top: 30px; font-size: 12px; font-weight: 700; letter-spacing: 0.18em;
    text-transform: uppercase; color: ${C.primary};
  }
  h1 {
    /* 영문은 Cormorant(세리프), 한글은 글리프 폴백으로 Pretendard — index.css 와 같은 규칙 */
    font-family: "Cormorant Garamond", "Pretendard Variable", Pretendard, serif;
    margin-top: 14px; font-size: ${locale === 'en' ? 62 : 56}px; font-weight: 700;
    line-height: 1.08; letter-spacing: -0.03em;
  }
  h1 .accent { color: ${C.primary}; }
  .sub { margin-top: 18px; font-size: 17px; line-height: 1.6; color: ${C.muted}; max-width: 520px; }
  .chips { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    font-size: 13px; font-weight: 600; color: ${C.navy};
    background: ${C.surface}; border: 1px solid ${C.line}; border-radius: 4px; padding: 6px 12px;
  }
  .foot { margin-top: 34px; display: flex; align-items: center; gap: 14px; }
  .cta {
    background: ${C.primary}; color: #fff; font-size: 16px; font-weight: 700;
    border-radius: 4px; padding: 13px 24px;
  }
  .domain { font-size: 14px; color: ${C.muted}; letter-spacing: 0.02em; }
  .right { width: 470px; display: flex; gap: 6px; padding: 6px 6px 6px 0; }
  .col { display: flex; flex-direction: column; gap: 6px; }
  .col.main { flex: 1.55; }
  .col.side { flex: 1; }
  .tile { flex: 1; overflow: hidden; border-radius: 4px; background: ${C.line}; }
  .tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style></head>
<body>
  <div class="left">
    <div class="brand"><img src="${logo}" alt=""><span>kissinskin</span></div>
    <div class="eyebrow">${t.eyebrow}</div>
    <h1>${t.line1}<br><span class="accent">${t.line2Accent}</span>${t.line2}</h1>
    <p class="sub">${t.sub}</p>
    <div class="chips">${t.chips.map((c) => `<span class="chip">${c}</span>`).join('')}</div>
    <div class="foot"><div class="cta">${t.cta}</div><div class="domain">kissinskin.net</div></div>
  </div>
  <div class="right">
    <div class="col main"><div class="tile"><img src="${portrait}"></div></div>
    <div class="col side">
      <div class="tile"><img src="${palette}"></div>
      <div class="tile"><img src="${scent}"></div>
    </div>
  </div>
</body></html>`
}

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null
const locales = only ? [only] : ['ko', 'en']

const browser = await chromium.launch()
for (const locale of locales) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE })
  await page.setContent(html(locale), { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  const shot = await page.screenshot({ type: 'png' })
  await page.close()

  const base = locale === 'ko' ? 'og-image' : `og-image-${locale}`
  const png = await sharp(shot).resize(W, H, { fit: 'fill', kernel: 'lanczos3' }).png({ quality: 92 }).toBuffer()
  const webp = await sharp(png).webp({ quality: 88 }).toBuffer()
  writeFileSync(resolve(ROOT, `public/${base}.png`), png)
  writeFileSync(resolve(ROOT, `public/${base}.webp`), webp)
  console.log(`✓ public/${base}.png  (${(png.length / 1024).toFixed(0)}KB)`)
  console.log(`✓ public/${base}.webp (${(webp.length / 1024).toFixed(0)}KB)`)
}
await browser.close()
