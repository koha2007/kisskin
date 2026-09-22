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
//
// 2026-09-15 — **1080×1920(9:16) + 블러 전면 제거.** (운영자 시안 "00.jpg")
//   인스타 스토리·릴스·틱톡에 그대로 올리는 세로 풀사이즈로 바꿨다(위 07-23 의 4:5 고정을 대체).
//   · 카드 안 여백의 블러를 없앴다. 결과물이 대부분 정사각(1024²)이라 3:4 카드 위아래에
//     블러 띠가 크게 깔렸고, 그게 사진보다 눈에 먼저 들어왔다.
//   · 사진 카드 = 흰색. 캔버스 폭을 거의 꽉 채우고, 캡션 위로 남는 높이를 전부 쓴다.
//     사진은 카드 안에서 contain(원본 비율 그대로, 한 픽셀도 안 잘림)으로 최대한 크게.
//     남는 공간은 흰 여백으로 둔다.
//   · 라벨·설명·브랜드 록업은 크기·위치 규칙 그대로(카드 아래 가운데).

interface CompositeOpts {
  /** gpt-image 결과 data URL(afterSrc) */
  afterSrc: string
  styleName: string
  styleDesc: string
  isEn?: boolean
}

/** 인스타 스토리·릴스·틱톡 세로 풀사이즈(9:16). 피드용 4:5 로 돌리려면 5 / 4. */
const OUT_W = 1080
const OUT_RATIO = 16 / 9
const OUT_H = Math.round(OUT_W * OUT_RATIO) // 1920

/** 설명은 2줄까지만 — 더 길어지면 카드가 그만큼 작아진다. */
const MAX_DESC_LINES = 2

const FONT = 'Pretendard, system-ui, sans-serif'
// 2026-09-22 — 캔버스 바탕을 아이보리(#f6f6f4)에서 **순백**으로 바꿨다(운영자 지정).
// 사진 카드도 흰색이라 이제 한 장의 흰 종이로 읽힌다. 카드 경계는 아래 그림자가 맡는다.
const BG = '#ffffff'
const CARD_BG = '#ffffff'
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
  const cardMargin = Math.round(W * 0.022)       // 24 — 사진이 폭을 거의 꽉 채운다
  const cardTop = cardMargin
  const cardW = W - cardMargin * 2               // 1032
  const textMaxW = W - Math.round(W * 0.1176) * 2 // 826 — 캡션 폭은 기존 그대로

  const fontName = Math.max(20, Math.round(W * 0.0444))  // 48
  const fontDesc = Math.max(14, Math.round(W * 0.0296))  // 32
  const brandFont = Math.max(16, Math.round(W * 0.0333)) // 36
  const logoSize = Math.round(W * 0.038)                 // 41
  const logoGap = Math.round(W * 0.013)

  const nameRowH = Math.round(fontName * 1.25)
  const lineH = Math.round(fontDesc * 1.45)
  const gapCardName = Math.round(W * 0.016)
  const gapDescBrand = Math.round(W * 0.016)
  const bottomPad = Math.round(W * 0.03)
  const brandRowH = logo ? logoSize : Math.round(brandFont * 1.3)

  ctx.font = `400 ${fontDesc}px ${FONT}`
  const descLines = wrapLines(ctx, styleDesc, textMaxW).slice(0, MAX_DESC_LINES)

  const textBlockH = gapCardName + nameRowH + descLines.length * lineH + gapDescBrand + brandRowH + bottomPad

  // ── ② 흰 카드 — 캡션 위로 남는 높이를 전부 쓴다
  const cardH = H - cardTop - textBlockH
  const cardX = cardMargin
  const cardR = Math.round(W * 0.019)

  // ── ③ 배경
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)

  // ── ④ 사진 카드
  ctx.save()
  ctx.shadowColor = 'rgba(7,9,40,0.10)'
  ctx.shadowBlur = Math.round(W * 0.022)
  ctx.shadowOffsetY = Math.round(W * 0.006)
  roundRect(ctx, cardX, cardTop, cardW, cardH, cardR)
  ctx.fillStyle = CARD_BG
  ctx.fill()
  ctx.restore()

  ctx.save()
  roundRect(ctx, cardX, cardTop, cardW, cardH, cardR)
  ctx.clip()
  // 원본 전체 — contain 이라 한 픽셀도 잘리지 않는다. 남는 곳은 흰 여백.
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
  ctx.fillText(styleName, W / 2, y + nameRowH / 2, textMaxW)
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
