// AI 메이크업 단일 룩 → 공유용 합성 이미지 빌더
// ────────────────────────────────────────────────────────────────────
// free-pivot 흐름(MakeupResult)엔 톤 분석/추천 텍스트가 없다. 그래서 옛
// AnalysisApp.buildCompositeCanvas 를 그대로 쓰지 않고, 룩 이미지 + 스타일
// 라벨/설명 + kissinskin 브랜딩만 담은 가벼운 세로 합성을 만든다.
// 저장·공유·이메일 3경로가 이 단일 소스를 공유한다(1-039.jpg 스타일).

interface CompositeOpts {
  /** gpt-image 결과 data URL(afterSrc) */
  afterSrc: string
  styleName: string
  styleDesc: string
  isEn?: boolean
}

/** 워터마크/라벨/브랜딩을 얹은 합성 캔버스를 반환. afterSrc 로드 실패 시 throw. */
export async function buildMakeupComposite({ afterSrc, styleName, styleDesc }: CompositeOpts): Promise<HTMLCanvasElement> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('look image load failed'))
    img.src = afterSrc
  })

  // 출력 폭: 룩 이미지 폭 기준(최대 1080). 고DPI 텍스트를 위해 최소 720 보장.
  const W = Math.max(720, Math.min(1080, img.naturalWidth || 1024))
  const pad = Math.round(W * 0.055)
  // 룩 이미지는 패딩 안쪽 폭(imgW)으로 그린다 → 종횡비 보존은 imgW 기준으로 계산.
  const imgW = W - pad * 2
  const aspect = (img.naturalHeight || W) / (img.naturalWidth || W)
  const imgH = Math.round(imgW * aspect)

  const radius = Math.round(W * 0.035)
  const fontName = Math.max(22, Math.round(W * 0.05))
  const fontDesc = Math.max(15, Math.round(W * 0.032))
  const lineH = Math.round(fontDesc * 1.5)

  // 설명 줄바꿈 높이 선계산(임시 컨텍스트)
  const tmp = document.createElement('canvas').getContext('2d')!
  tmp.font = `400 ${fontDesc}px Pretendard, system-ui, sans-serif`
  const contentW = W - pad * 2
  const descLines = wrapLines(tmp, styleDesc, contentW)

  const labelBlockH = Math.round(fontName * 1.5) + descLines.length * lineH + Math.round(pad * 0.5)
  const brandH = Math.round(W * 0.15)
  const totalH = pad + imgH + Math.round(pad * 0.9) + labelBlockH + brandH

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = totalH
  const ctx = canvas.getContext('2d')!

  // 배경
  ctx.fillStyle = '#f8f6f6'
  ctx.fillRect(0, 0, W, totalH)

  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  // 룩 이미지(둥근 모서리 클립 + 그림자). imgW/imgH 는 종횡비 보존값.
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
  ctx.drawImage(img, imgX, imgY, imgW, imgH)
  ctx.restore()

  // 스타일명
  let y = imgY + imgH + Math.round(pad * 0.9)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#232a52'
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

  // 브랜딩(구분선 + 로고 + kissinskin.net)
  const brandY = totalH - brandH
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(pad, brandY + Math.round(brandH * 0.12))
  ctx.lineTo(W - pad, brandY + Math.round(brandH * 0.12))
  ctx.stroke()

  const brandFont = Math.max(18, Math.round(W * 0.042))
  const urlFont = Math.max(12, Math.round(W * 0.028))
  let logoW = 0
  try {
    const logo = new Image()
    logo.crossOrigin = 'anonymous'
    logo.src = '/logo.png'
    await new Promise<void>((resolve) => { logo.onload = () => resolve(); logo.onerror = () => resolve() })
    if (logo.complete && logo.naturalWidth > 0) {
      const logoSize = Math.round(brandH * 0.42)
      logoW = logoSize + Math.round(W * 0.02)
      const blockW = logoW + measureText(ctx, 'kissinskin', `800 ${brandFont}px Pretendard, system-ui, sans-serif`)
      const startX = Math.round((W - blockW) / 2)
      const logoY = brandY + Math.round((brandH - logoSize) / 2 + brandH * 0.04)
      ctx.drawImage(logo, startX, logoY, logoSize, logoSize)
      drawBrandText(ctx, startX + logoW, brandY, brandH, brandFont, urlFont, 'left')
    } else {
      drawBrandText(ctx, W / 2, brandY, brandH, brandFont, urlFont, 'center')
    }
  } catch {
    drawBrandText(ctx, W / 2, brandY, brandH, brandFont, urlFont, 'center')
  }

  return canvas
}

function drawBrandText(
  ctx: CanvasRenderingContext2D,
  x: number,
  brandY: number,
  brandH: number,
  brandFont: number,
  urlFont: number,
  align: 'left' | 'center',
) {
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#232a52'
  ctx.font = `800 ${brandFont}px Pretendard, system-ui, sans-serif`
  ctx.fillText('kissinskin', x, brandY + brandH * 0.42)
  ctx.fillStyle = '#d8503c'
  ctx.font = `600 ${urlFont}px Pretendard, system-ui, sans-serif`
  ctx.fillText('kissinskin.net', x, brandY + brandH * 0.66)
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
