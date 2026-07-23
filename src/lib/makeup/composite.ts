// AI 메이크업 단일 룩 → 공유용 합성 이미지 빌더
// ────────────────────────────────────────────────────────────────────
// free-pivot 흐름(MakeupResult)엔 톤 분석/추천 텍스트가 없다. 그래서 옛
// AnalysisApp.buildCompositeCanvas 를 그대로 쓰지 않고, 룩 이미지 + 스타일
// 라벨/설명 + kissinskin 브랜딩만 담은 가벼운 세로 합성을 만든다.
// 저장·공유·이메일 3경로가 이 단일 소스를 공유한다.
//
// 2026-07-23 — 출력 비율을 **1080×1350(4:5)로 고정**했다.
//   그 전까지 캔버스 높이를 "사진 높이 + 텍스트 높이"로 계산해서, 결과 비율이
//   업로드한 셀카에 따라 매번 달라졌다(9:16 셀카면 세로로 길쭉한 이미지가 나왔다).
//   인스타그램 피드는 4:5 가 세로 최대치라, 그보다 길면 잘리거나 축소돼 올라간다.
//   저장한 이미지를 그대로 올릴 수 있어야 공유가 늘어난다.
//
//   사진은 남는 영역에 **cover(잘라 채우기)** 로 그린다. contain 으로 하면 9:16
//   셀카에서 좌우에 큰 여백이 생겨 카드가 비어 보인다. 세로 크롭 기준점은 40% —
//   얼굴은 보통 화면 위쪽에 있어서 정중앙을 기준으로 자르면 턱이 먼저 잘린다.

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

/** 설명은 2줄까지만 — 더 길어지면 사진 영역을 갉아먹어 레이아웃이 매번 달라진다. */
const MAX_DESC_LINES = 2

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
  const pad = Math.round(W * 0.055)
  const imgW = W - pad * 2

  const radius = Math.round(W * 0.035)
  const fontName = Math.max(22, Math.round(W * 0.05))
  const fontDesc = Math.max(15, Math.round(W * 0.032))
  const lineH = Math.round(fontDesc * 1.5)

  // 설명 줄바꿈 선계산(임시 컨텍스트)
  const tmp = document.createElement('canvas').getContext('2d')!
  tmp.font = `400 ${fontDesc}px Pretendard, system-ui, sans-serif`
  const descLines = wrapLines(tmp, styleDesc, imgW).slice(0, MAX_DESC_LINES)

  const labelBlockH = Math.round(fontName * 1.5) + descLines.length * lineH + Math.round(pad * 0.5)
  const brandH = Math.round(W * 0.15)
  const gap = Math.round(pad * 0.9)
  // 사진이 쓸 수 있는 높이 = 전체에서 여백·라벨·브랜딩을 뺀 나머지
  const imgH = H - pad - gap - labelBlockH - brandH

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 배경
  ctx.fillStyle = '#f8f6f6'
  ctx.fillRect(0, 0, W, H)

  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  // 룩 이미지 — 고정 틀에 cover 로 채운다(세로 기준점 40%: 얼굴이 위쪽에 있다)
  const imgX = pad
  const imgY = pad
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.12)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 4
  roundRect(imgX, imgY, imgW, imgH, radius)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.restore()
  ctx.save()
  roundRect(imgX, imgY, imgW, imgH, radius)
  ctx.clip()
  drawCover(ctx, img, imgX, imgY, imgW, imgH, 0.5, 0.4)
  ctx.restore()

  // 스타일명
  let y = imgY + imgH + gap
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#070953'
  ctx.font = `800 ${fontName}px Pretendard, system-ui, sans-serif`
  ctx.fillText(styleName, pad, y)
  y += Math.round(fontName * 1.4)

  // 설명(줄바꿈)
  ctx.fillStyle = '#475569'
  ctx.font = `400 ${fontDesc}px Pretendard, system-ui, sans-serif`
  for (const line of descLines) {
    ctx.fillText(line, pad, y)
    y += lineH
  }

  // 브랜딩(구분선 + 로고 + kissinskin / kissinskin.net)
  const brandY = H - brandH
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(pad, brandY + Math.round(brandH * 0.12))
  ctx.lineTo(W - pad, brandY + Math.round(brandH * 0.12))
  ctx.stroke()

  const brandFont = Math.max(18, Math.round(W * 0.042))
  const urlFont = Math.max(12, Math.round(W * 0.028))

  // 2026-07-23 정렬 수정: 블록 폭을 'kissinskin' 폭으로만 재고 있었는데, 실제로는
  // 그보다 넓은 'kissinskin.net' 이 아래 줄에 함께 그려진다. 좁게 잰 폭으로
  // 가운데를 잡으니 록업 전체가 오른쪽으로 밀려 있었다.
  // 두 줄 중 넓은 쪽을 기준으로 블록 폭을 재고, 두 줄은 서로 가운데 정렬한다.
  const nameW = measureText(ctx, 'kissinskin', `800 ${brandFont}px Pretendard, system-ui, sans-serif`)
  const urlW = measureText(ctx, 'kissinskin.net', `600 ${urlFont}px Pretendard, system-ui, sans-serif`)
  const textW = Math.max(nameW, urlW)

  let logo: HTMLImageElement | null = null
  try {
    const el = new Image()
    el.crossOrigin = 'anonymous'
    el.src = '/logo.png'
    await new Promise<void>((resolve) => { el.onload = () => resolve(); el.onerror = () => resolve() })
    if (el.complete && el.naturalWidth > 0) logo = el
  } catch { /* 로고 없이도 그린다 */ }

  if (logo) {
    const logoSize = Math.round(brandH * 0.42)
    const gapLogo = Math.round(W * 0.02)
    const blockW = logoSize + gapLogo + textW
    const startX = Math.round((W - blockW) / 2)
    const logoY = brandY + Math.round((brandH - logoSize) / 2 + brandH * 0.04)
    ctx.drawImage(logo, startX, logoY, logoSize, logoSize)
    drawBrandText(ctx, startX + logoSize + gapLogo + textW / 2, brandY, brandH, brandFont, urlFont)
  } else {
    drawBrandText(ctx, W / 2, brandY, brandH, brandFont, urlFont)
  }

  return canvas
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

/** 로고 오른쪽 텍스트 록업 — 두 줄을 x 기준 가운데로 맞춘다. */
function drawBrandText(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  brandY: number,
  brandH: number,
  brandFont: number,
  urlFont: number,
) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#070953'
  ctx.font = `800 ${brandFont}px Pretendard, system-ui, sans-serif`
  ctx.fillText('kissinskin', centerX, brandY + brandH * 0.42)
  ctx.fillStyle = '#eb4763'
  ctx.font = `600 ${urlFont}px Pretendard, system-ui, sans-serif`
  ctx.fillText('kissinskin.net', centerX, brandY + brandH * 0.66)
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
