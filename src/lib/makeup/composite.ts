// AI 메이크업 단일 룩 → 공유용 합성 이미지 빌더
// ────────────────────────────────────────────────────────────────────
// free-pivot 흐름(MakeupResult)엔 톤 분석/추천 텍스트가 없다. 그래서 옛
// AnalysisApp.buildCompositeCanvas 를 그대로 쓰지 않고, 룩 이미지 + 스타일
// 라벨/설명 + kissinskin 브랜딩만 담은 가벼운 합성을 만든다.
// 저장·공유·이메일 3경로가 이 단일 소스를 공유한다.
//
// 2026-07-23 — 출력 비율을 **1080×1350(4:5)로 고정**했다.
//   그 전까지 캔버스 높이를 "사진 높이 + 텍스트 높이"로 계산해서, 결과 비율이
//   업로드한 셀카에 따라 매번 달라졌다(9:16 셀카면 세로로 길쭉한 이미지가 나왔다).
//   인스타그램 피드는 4:5 가 세로 최대치라, 그보다 길면 잘리거나 축소돼 올라간다.
//   저장한 이미지를 그대로 올릴 수 있어야 공유가 늘어난다. → 이 4:5 고정은 유지한다.
//
// 2026-07-25 — 사진 틀을 ~정사각으로 넓히고 크롭 기준점을 위로 올렸다.
//   (아래 2026-07-26 항목에서 이 접근 자체를 폐기했다. 기록만 남긴다.)
//
// 2026-07-26 — **운영자 시안대로 재설계.** ("메이크업 생성 결과 비율_002/003")
//   증상: 저장 이미지에서 머리 위와 턱이 잘렸다.
//   원인: 사진 틀이 982×951(거의 정사각)인데 makeup-edit 는 size='auto' 라
//     세로 셀카(9:16)가 그대로 들어온다. 정사각 틀에 cover 하면 **원본의 약 45%**
//     가 잘려나간다. 여백·폰트를 조여도 틀은 40~60px 밖에 못 키운다.
//   해결(운영자 시안 실측 반영):
//     · 사진 카드를 **3:4 세로형**으로. 캔버스 1080×1350 안에서 826×1101,
//       좌우 여백 127, 상단 43. 시안과 픽셀 단위로 맞췄다.
//     · 카드 안에서는 **contain** — 원본이 한 픽셀도 잘리지 않는다. 3:4 셀카면
//       카드를 정확히 꽉 채우고, 9:16 이면 좌우에 같은 사진의 블러가 깔린다.
//     · 라벨·설명·브랜드 록업은 카드 **아래 가운데 정렬**. 사진을 가리지 않는다.
//     · 브랜드 록업에서 핑크 'kissinskin.net' 을 빼고 'kissinskin' 만 남겼다.
//   블러는 전부 캔버스 로컬 연산(ctx.filter)이라 서버·API 비용이 0 이다.

interface CompositeOpts {
  /** gpt-image 결과 data URL(afterSrc) */
  afterSrc: string
  styleName: string
  styleDesc: string
  isEn?: boolean
}

/** 인스타그램 피드 세로 최대 비율. 1:1 로 바꾸려면 1, 스토리는 16/9 로 두면 된다. */
const OUT_W = 1080
const OUT_RATIO = 5 / 4
const OUT_H = Math.round(OUT_W * OUT_RATIO) // 1350

/** 사진 카드 비율(세로형). 운영자 시안 실측값 826×1101 = 3:4. */
const CARD_RATIO = 4 / 3

/**
 * 카드 바깥 배경.
 *   'flat' — 단색만(시안 002) ← 채택
 *   'blur' — 같은 사진을 크게 블러해 깔고, 카드 아래쪽에서 단색으로 페이드(시안 003)
 *
 * 2026-07-26 'flat' 채택 근거: 블러의 두 장점(빈 공간 은폐·텍스트 가독성)이 이 레이아웃엔
 *   해당이 없다. 사진은 이미 카드 안에 있고 캡션은 카드 밖 단색 위에 앉는다. 반면 우리가
 *   블러하는 건 앨범아트가 아니라 **사용자 방의 벽·잡동사니**라, 룩 9종이 전부 그 사람 방
 *   색으로 물들어 브랜드 프레임이 깨진다. 단색은 사이트 배경(#f6f6f4)과 같아 누가 뽑아도
 *   같은 프레임이 나온다. 업계 통설도 "피사체 자체가 콘텐츠면 단색 테두리"다.
 *   ※ 카드 '안쪽' 여백은 블러를 유지한다 — 거긴 흰 띠가 곧 죽은 공간으로 보인다.
 */
const BACKDROP: 'blur' | 'flat' = 'flat'

/** 설명은 2줄까지만 — 더 길어지면 카드가 그만큼 작아진다. */
const MAX_DESC_LINES = 2

const FONT = 'Pretendard, system-ui, sans-serif'
const BG = '#f6f6f4'
const INK = '#070953'
const MUTED = '#475569'

/** 워터마크/라벨/브랜딩을 얹은 합성 캔버스를 반환. afterSrc 로드 실패 시 throw. */
export async function buildMakeupComposite({ afterSrc, styleName, styleDesc }: CompositeOpts): Promise<HTMLCanvasElement> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('look image load failed'))
    img.src = afterSrc
  })

  const W = OUT_W
  const H = OUT_H

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // ── 로고 선로드(레이아웃 계산에 크기가 필요하다)
  let logo: HTMLImageElement | null = null
  try {
    const el = new Image()
    el.crossOrigin = 'anonymous'
    el.src = '/logo.png'
    await new Promise<void>((resolve) => { el.onload = () => resolve(); el.onerror = () => resolve() })
    if (el.complete && el.naturalWidth > 0) logo = el
  } catch { /* 로고 없이도 그린다 */ }

  // ── ① 카드 아래 텍스트 블록 선계산 — 남는 높이가 곧 카드 높이다
  const cardTop = Math.round(H * 0.032)          // 43
  const cardMaxW = W - Math.round(W * 0.1176) * 2 // 826

  const fontName = Math.max(20, Math.round(W * 0.0444))  // 48
  const fontDesc = Math.max(14, Math.round(W * 0.0296))  // 32
  const brandFont = Math.max(16, Math.round(W * 0.0333)) // 36
  const logoSize = Math.round(W * 0.038)                 // 41
  const logoGap = Math.round(W * 0.013)

  const nameRowH = Math.round(fontName * 1.25)
  const lineH = Math.round(fontDesc * 1.45)
  const gapCardName = Math.round(W * 0.016)
  const gapDescBrand = Math.round(W * 0.016)
  const bottomPad = Math.round(W * 0.019)
  const brandRowH = logo ? logoSize : Math.round(brandFont * 1.3)

  ctx.font = `400 ${fontDesc}px ${FONT}`
  const descLines = wrapLines(ctx, styleDesc, cardMaxW).slice(0, MAX_DESC_LINES)

  const textBlockH = gapCardName + nameRowH + descLines.length * lineH + gapDescBrand + brandRowH + bottomPad

  // ── ② 카드 사각형 — 3:4 를 유지한 채 남는 높이에 맞춘다
  const cardH = Math.min(H - cardTop - textBlockH, Math.round(cardMaxW * CARD_RATIO))
  const cardW = Math.round(cardH / CARD_RATIO)
  const cardX = Math.round((W - cardW) / 2)
  const cardR = Math.round(W * 0.019)

  // ── ③ 배경
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)
  if (BACKDROP === 'blur' && supportsCanvasFilter(ctx)) {
    ctx.save()
    // 블러는 가장자리 픽셀을 투명하게 먹으므로 캔버스보다 크게 그린다
    const over = Math.round(W * 0.12)
    ctx.filter = `blur(${Math.round(W * 0.05)}px)`
    drawCover(ctx, img, -over, -over, W + over * 2, H + over * 2, 0.5, 0.4)
    ctx.restore()
    // 카드 아래(텍스트 영역)로 갈수록 단색으로 정리된다
    const fadeTop = Math.round(H * 0.5)
    const fade = ctx.createLinearGradient(0, fadeTop, 0, cardTop + cardH)
    fade.addColorStop(0, hexToRgba(BG, 0))
    fade.addColorStop(1, hexToRgba(BG, 1))
    ctx.fillStyle = fade
    ctx.fillRect(0, fadeTop, W, H - fadeTop)
  }

  // ── ④ 사진 카드
  ctx.save()
  ctx.shadowColor = 'rgba(7,9,40,0.18)'
  ctx.shadowBlur = Math.round(W * 0.022)
  ctx.shadowOffsetY = Math.round(W * 0.006)
  roundRect(ctx, cardX, cardTop, cardW, cardH, cardR)
  ctx.fillStyle = BG
  ctx.fill()
  ctx.restore()

  ctx.save()
  roundRect(ctx, cardX, cardTop, cardW, cardH, cardR)
  ctx.clip()
  // 카드 안 여백 채움 — 원본이 3:4 가 아니어도 카드가 비어 보이지 않게
  if (supportsCanvasFilter(ctx)) {
    ctx.save()
    ctx.filter = `blur(${Math.round(W * 0.035)}px)`
    const over = Math.round(W * 0.08)
    drawCover(ctx, img, cardX - over, cardTop - over, cardW + over * 2, cardH + over * 2, 0.5, 0.4)
    ctx.restore()
  } else {
    ctx.fillStyle = averageColor(img)
    ctx.fillRect(cardX, cardTop, cardW, cardH)
  }
  // 원본 전체 — contain 이라 한 픽셀도 잘리지 않는다
  const nw = img.naturalWidth || cardW
  const nh = img.naturalHeight || cardH
  const fit = Math.min(cardW / nw, cardH / nh)
  const fw = Math.round(nw * fit)
  const fh = Math.round(nh * fit)
  ctx.drawImage(img, cardX + Math.round((cardW - fw) / 2), cardTop + Math.round((cardH - fh) / 2), fw, fh)
  ctx.restore()

  // ── ⑤ 카드 아래 캡션 — 전부 가운데 정렬
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let y = cardTop + cardH + gapCardName

  ctx.fillStyle = INK
  ctx.font = `800 ${fontName}px ${FONT}`
  ctx.fillText(styleName, W / 2, y + nameRowH / 2, cardMaxW)
  y += nameRowH

  ctx.fillStyle = MUTED
  ctx.font = `400 ${fontDesc}px ${FONT}`
  for (const line of descLines) {
    ctx.fillText(line, W / 2, y + lineH / 2)
    y += lineH
  }
  y += gapDescBrand

  // 브랜드 록업 — 로고 + kissinskin 을 한 덩어리로 가운데
  const brandTextW = measureText(ctx, 'kissinskin', `800 ${brandFont}px ${FONT}`)
  const brandW = brandTextW + (logo ? logoSize + logoGap : 0)
  const brandX = Math.round((W - brandW) / 2)
  const brandMid = y + brandRowH / 2
  if (logo) ctx.drawImage(logo, brandX, Math.round(brandMid - logoSize / 2), logoSize, logoSize)
  ctx.textAlign = 'left'
  ctx.fillStyle = INK
  ctx.font = `800 ${brandFont}px ${FONT}`
  ctx.fillText('kissinskin', brandX + (logo ? logoSize + logoGap : 0), brandMid + 1)

  return canvas
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function hexToRgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

function supportsCanvasFilter(ctx: CanvasRenderingContext2D): boolean {
  const prev = ctx.filter
  try {
    ctx.filter = 'blur(2px)'
    const ok = ctx.filter === 'blur(2px)'
    ctx.filter = prev
    return ok
  } catch {
    return false
  }
}

/** 1×1 로 축소해 평균색을 읽는다. 캔버스가 오염됐거나 실패하면 배경색. */
function averageColor(img: HTMLImageElement): string {
  try {
    const c = document.createElement('canvas')
    c.width = 1
    c.height = 1
    const cx = c.getContext('2d')
    if (!cx) return BG
    cx.drawImage(img, 0, 0, 1, 1)
    const [r, g, b] = cx.getImageData(0, 0, 1, 1).data
    return `rgb(${r},${g},${b})`
  } catch {
    return BG
  }
}

/** object-fit: cover 와 같은 그리기. fx/fy 는 0~1 크롭 기준점(0.5,0.4 = 가로 중앙·세로 위쪽). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  fx = 0.5,
  fy = 0.5,
) {
  const nw = img.naturalWidth || dw
  const nh = img.naturalHeight || dh
  const scale = Math.max(dw / nw, dh / nh)
  const sw = dw / scale
  const sh = dh / scale
  const sx = Math.max(0, Math.min(nw - sw, (nw - sw) * fx))
  const sy = Math.max(0, Math.min(nh - sh, (nh - sh) * fy))
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

function measureText(ctx: CanvasRenderingContext2D, text: string, font: string): number {
  const prev = ctx.font
  ctx.font = font
  const w = ctx.measureText(text).width
  ctx.font = prev
  return w
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  if (!text) return []
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}
