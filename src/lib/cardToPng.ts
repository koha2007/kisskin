// Pure-Canvas renderer for the 9:16 identity card (FINAL §3-4).
// Decision ①: no html2canvas — draw directly on a 1080×1920 canvas so we
// control fonts/emoji precisely and ship zero new dependencies.
// We await document.fonts.ready before drawing so Pretendard (Korean) and
// emoji glyphs are loaded — otherwise the export shows tofu/□ boxes.

import type { IdentityCardData } from './identityCard/types'
import { trackCardSaved as trackCardSavedEvent } from './analytics'

export interface IdentityCardRenderInput {
  /** 진단명 라벨 — e.g. "향수 타입" / "퍼스널컬러" */
  label: string
  /** 유형 이모지 — 일러스트가 없을 때 아치 창 안에 그린다 */
  emoji: string
  card: IdentityCardData
  /** 유형 일러스트(같은 출처 이미지 경로) — 있으면 이모지 대신 아치 창을 채운다 */
  illustration?: string
}

export const CARD_W = 1080
export const CARD_H = 1920

const FONT_STACK =
  "'Pretendard Variable', 'Pretendard', -apple-system, system-ui, 'Apple SD Gothic Neo', sans-serif"

/** Wait for web fonts so Korean + emoji render instead of tofu boxes. */
async function ensureFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.ready) return
  try {
    // Nudge the browser to actually load the weights we draw with.
    await Promise.all([
      document.fonts.load(`700 96px ${FONT_STACK}`),
      document.fonts.load(`500 44px ${FONT_STACK}`),
    ]).catch(() => {})
    await document.fonts.ready
  } catch {
    /* fonts.ready can reject in odd states — draw anyway */
  }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/** Word/char wrap that respects Korean (no spaces) by falling back to char-wrap. */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(' ')
    let line = ''
    const pushChars = (chunk: string) => {
      let cur = ''
      for (const ch of chunk) {
        if (ctx.measureText(cur + ch).width > maxWidth && cur) {
          lines.push(cur)
          cur = ch
        } else {
          cur += ch
        }
      }
      line = cur
    }
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate
      } else {
        if (line) lines.push(line)
        if (ctx.measureText(word).width > maxWidth) {
          pushChars(word)
        } else {
          line = word
        }
      }
    }
    if (line) lines.push(line)
  }
  return lines
}

/** Shrink font until the (possibly single) line fits maxWidth. */
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  startPx: number,
  minPx: number,
  maxWidth: number,
): number {
  let px = startPx
  while (px > minPx) {
    ctx.font = `${weight} ${px}px ${FONT_STACK}`
    if (ctx.measureText(text).width <= maxWidth) break
    px -= 4
  }
  return px
}

// ── 2026-10-17 카드 리디자인: "미술 포스터" ──────────────────────────────
// 전: 네이비→유형색 그라데이션 + 큰 이모지(🌕🥚🧊). 공유되는 이미지인데 싸 보였다.
// 후: 크림 종이 + 컷페이퍼(마티스풍) 도형 + 아치 창 안의 유형 일러스트(없으면 이모지).
//    브랜드 비전 "미술 × 메이크업" — 결과 카드가 한 장의 작은 판화처럼 보이게.
//    유형색(card.gradient[1])은 아치 바탕·큰 도형에만 써서 31종이 한 체계 안에서 갈린다.
const PAPER = '#F3EADC'
const INK = '#232a52'
const TERRACOTTA = '#B5523B'
const MUSTARD = '#D9A441'
const BLUSH = '#E8A598'

/** 문자열 → 0..1 결정적 난수 (같은 유형은 늘 같은 도형 배치) */
function seeded(seedText: string) {
  let h = 2166136261
  for (const ch of seedText) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function withAlpha(hex: string, a: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return hex
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** 두 색을 섞는다(t=0 → a, 1 → b) — 탁한 유형색도 종이 위에서 맑은 바탕이 되게 */
function mix(a: string, b: string, t: number): string {
  const p = (h: string) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255] }
  if (!/^#?[0-9a-f]{6}$/i.test(a.trim()) || !/^#?[0-9a-f]{6}$/i.test(b.trim())) return a
  const [x, y] = [p(a.trim()), p(b.trim())]
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`
}

/** 둥글게 일렁이는 컷페이퍼 덩어리 */
function blob(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rnd: () => number, fill: string) {
  const n = 7
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const rr = r * (0.78 + rnd() * 0.36)
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]
  })
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[(i + 1) % n]
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2
    if (i === 0) ctx.moveTo(mx, my)
    else ctx.quadraticCurveTo(x0, y0, mx, my)
  }
  const [x0, y0] = pts[0]
  const [x1, y1] = pts[1]
  ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

/** 마티스풍 잎사귀 줄기 */
function frond(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, angle: number, fill: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = fill
  ctx.fillRect(-4, -len, 8, len)
  for (let i = 1; i <= 5; i++) {
    const yy = -len * (i / 6)
    const w = 70 * (1 - i / 8)
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.ellipse(side * w * 0.75, yy, w, 22, side * -0.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('illustration load failed'))
    img.src = src
  })
}

export async function renderIdentityCardCanvas(
  input: IdentityCardRenderInput,
): Promise<HTMLCanvasElement> {
  await ensureFonts()

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')

  const { card, emoji, label, illustration } = input
  const typeColor = card.gradient[1]
  const rnd = seeded(card.enName + card.nickname)

  // 종이 바탕 + 아주 옅은 결
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, CARD_W, CARD_H)
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(80,60,40,0.035)' : 'rgba(255,255,255,0.05)'
    ctx.fillRect(rnd() * CARD_W, rnd() * CARD_H, 2, 2)
  }

  // 컷페이퍼 도형 — 위 오른쪽 유형색 덩어리 · 아래 왼쪽 테라코타 · 해(머스터드) · 잎(네이비)
  blob(ctx, 930 + rnd() * 60, 150 + rnd() * 60, 210, rnd, withAlpha(typeColor, 0.9))
  blob(ctx, 90 + rnd() * 50, 1790, 230, rnd, withAlpha(TERRACOTTA, 0.85))
  blob(ctx, 1000, 960 + rnd() * 40, 62, rnd, withAlpha(MUSTARD, 0.95))
  blob(ctx, 130, 330 + rnd() * 40, 55, rnd, withAlpha(BLUSH, 0.9))
  // 잎은 글자 영역 밖에만 — 왼쪽은 아치 옆, 오른쪽은 맨 아래 구석
  frond(ctx, 128, 1030, 520, -0.12, withAlpha(INK, 0.88))
  frond(ctx, 1000, 1900, 300, 0.25, withAlpha(MUSTARD, 0.9))

  const cx = CARD_W / 2
  const maxTextW = CARD_W - 250
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // 1) 진단명 라벨
  ctx.fillStyle = TERRACOTTA
  ctx.font = `700 38px ${FONT_STACK}`
  try { ctx.letterSpacing = '8px' } catch { /* older browsers */ }
  ctx.fillText(label, cx, 230)
  try { ctx.letterSpacing = '0px' } catch { /* noop */ }

  // 2) 아치 창 — 유형 일러스트(있으면) / 이모지
  const ax = 250, aw = 580, atop = 290, ah = 760, ar = aw / 2
  const archPath = () => {
    ctx.beginPath()
    ctx.moveTo(ax, atop + ar)
    ctx.arc(ax + ar, atop + ar, ar, Math.PI, 0)
    ctx.lineTo(ax + aw, atop + ah)
    ctx.lineTo(ax, atop + ah)
    ctx.closePath()
  }
  ctx.save()
  archPath()
  ctx.fillStyle = mix(typeColor, PAPER, 0.62)
  ctx.fill()
  ctx.clip()
  let drewArt = false
  if (illustration) {
    try {
      const img = await loadImage(illustration)
      const scale = Math.max(aw / img.naturalWidth, ah / img.naturalHeight)
      const w = img.naturalWidth * scale, h = img.naturalHeight * scale
      ctx.drawImage(img, ax + (aw - w) / 2, atop + (ah - h) / 2, w, h)
      drewArt = true
    } catch { /* 이모지로 */ }
  }
  ctx.restore()
  if (!drewArt) {
    ctx.font = `400 280px ${FONT_STACK}`
    ctx.fillStyle = INK
    ctx.fillText(emoji, cx, atop + ah / 2 + 110)
  }
  archPath()
  ctx.lineWidth = 6
  ctx.strokeStyle = INK
  ctx.stroke()

  // 3) 닉네임
  const nickPx = fitFontSize(ctx, card.nickname, 800, 100, 60, maxTextW)
  ctx.font = `800 ${nickPx}px ${FONT_STACK}`
  ctx.fillStyle = INK
  let y = 1196
  for (const ln of wrapLines(ctx, card.nickname, maxTextW)) {
    ctx.fillText(ln, cx, y)
    y += nickPx * 1.12
  }
  y += 4

  // 4) 영문 서브
  ctx.font = `700 34px ${FONT_STACK}`
  ctx.fillStyle = withAlpha(INK, 0.6)
  try { ctx.letterSpacing = '6px' } catch { /* noop */ }
  ctx.fillText(card.enName.toUpperCase(), cx, y)
  try { ctx.letterSpacing = '0px' } catch { /* noop */ }
  y += 92

  // 5) 한 줄 정체성 문장
  ctx.font = `500 44px ${FONT_STACK}`
  ctx.fillStyle = withAlpha(INK, 0.88)
  for (const ln of wrapLines(ctx, `“${card.identityLine}”`, maxTextW)) {
    ctx.fillText(ln, cx, y)
    y += 62
  }

  // 6) 해시태그 — 테두리 칩
  y += 46
  ctx.font = `700 31px ${FONT_STACK}`
  const chipH = 62, chipPadX = 28, chipGap = 16
  const rows: { text: string; w: number }[][] = [[]]
  for (const tag of card.hashtags) {
    const w = ctx.measureText(tag).width + chipPadX * 2
    const row = rows[rows.length - 1]
    const rowW = row.reduce((sum, c) => sum + c.w + chipGap, 0)
    if (rowW + w > maxTextW && row.length) rows.push([{ text: tag, w }])
    else row.push({ text: tag, w })
  }
  for (const row of rows) {
    const totalW = row.reduce((sum, c) => sum + c.w, 0) + chipGap * (row.length - 1)
    let x = cx - totalW / 2
    for (const chip of row) {
      roundRectPath(ctx, x, y - chipH + 16, chip.w, chipH, chipH / 2)
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = withAlpha(INK, 0.35)
      ctx.stroke()
      ctx.fillStyle = INK
      ctx.fillText(chip.text, x + chip.w / 2, y)
      x += chip.w + chipGap
    }
    y += chipH + chipGap
  }

  // 7) 워터마크
  ctx.font = `800 38px ${FONT_STACK}`
  ctx.fillStyle = INK
  try { ctx.letterSpacing = '2px' } catch { /* noop */ }
  ctx.fillText('kissinskin.net', cx, CARD_H - 92)
  try { ctx.letterSpacing = '0px' } catch { /* noop */ }

  return canvas
}

/** GA `card_saved` (skips internal traffic). `method` = 어떤 경로로 저장됐는지. */
export function trackCardSaved(input: IdentityCardRenderInput, method: string): void {
  trackCardSavedEvent({
    card_label: input.label,
    card_nickname: input.card.nickname,
    method,
  })
}

export interface IdentityCardImage {
  /** 네이티브 공유 시트(navigator.share files)용 */
  file: File
  /** 앱 웹뷰 브릿지(nativeSaveImage/nativeShareImage)용 */
  dataUrl: string
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob null'))), 'image/png')
  })
}

/**
 * 카드 PNG 를 File + dataURL 로 만들어 준다.
 *
 * ⚠️ 예전엔 여기서 곧장 `toDataURL()` + `<a download>` 로 내려받았는데, 그 경로는
 *   · iOS Safari — data: URL 의 download 속성을 무시한다(아무 일도 안 일어남)
 *   · 카카오/네이버/인스타 인앱 브라우저 — download 자체가 무반응
 *   · Expo 앱 웹뷰 — download 도 navigator.share 도 없음
 * 에서 전부 실패했다. 파일 생성과 "어떻게 내보낼지" 를 분리해, 호출부
 * (components/IdentityCard.tsx)가 환경별 경로를 고르게 한다.
 */
export async function buildIdentityCardImage(
  input: IdentityCardRenderInput,
  filename: string,
): Promise<IdentityCardImage> {
  const canvas = await renderIdentityCardCanvas(input)
  const blob = await canvasToBlob(canvas)
  return {
    file: new File([blob], filename, { type: 'image/png' }),
    dataUrl: canvas.toDataURL('image/png'),
  }
}
