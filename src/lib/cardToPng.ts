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
  /** 유형 이모지 */
  emoji: string
  card: IdentityCardData
}

export const CARD_W = 1080
export const CARD_H = 1920

const FONT_STACK =
  "'Pretendard', 'Pretendard Variable', -apple-system, system-ui, 'Apple SD Gothic Neo', sans-serif"

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

export async function renderIdentityCardCanvas(
  input: IdentityCardRenderInput,
): Promise<HTMLCanvasElement> {
  await ensureFonts()

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')

  const { card, emoji, label } = input
  const [from, to] = card.gradient

  // Background: diagonal navy → type-color gradient.
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  bg.addColorStop(0, from)
  bg.addColorStop(1, to)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Soft radial glow behind the emoji for depth + legibility.
  const glow = ctx.createRadialGradient(CARD_W / 2, 640, 80, CARD_W / 2, 640, 760)
  glow.addColorStop(0, 'rgba(255,255,255,0.22)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  const cx = CARD_W / 2
  const maxTextW = CARD_W - 160 // 80px side padding
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // 1) 진단명 라벨 (uppercase-ish chip text)
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.font = `600 40px ${FONT_STACK}`
  try { ctx.letterSpacing = '6px' } catch { /* older browsers */ }
  ctx.fillText(label, cx, 300)
  try { ctx.letterSpacing = '0px' } catch { /* noop */ }

  // 2) 유형 이모지 (large)
  ctx.font = `400 240px ${FONT_STACK}`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(emoji, cx, 720)

  // 3) 유형 닉네임 (최대 타이포, shrink-to-fit, wrap as last resort)
  let nickPx = fitFontSize(ctx, card.nickname, 700, 104, 64, maxTextW)
  ctx.font = `700 ${nickPx}px ${FONT_STACK}`
  ctx.fillStyle = '#ffffff'
  const nickLines = wrapLines(ctx, card.nickname, maxTextW)
  let y = 880
  for (const ln of nickLines) {
    ctx.fillText(ln, cx, y)
    y += nickPx * 1.12
  }
  y += 10

  // 4) 영문 서브
  ctx.font = `600 38px ${FONT_STACK}`
  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  try { ctx.letterSpacing = '4px' } catch { /* noop */ }
  ctx.fillText(card.enName.toUpperCase(), cx, y)
  try { ctx.letterSpacing = '0px' } catch { /* noop */ }
  y += 90

  // 5) 한 줄 정체성 문장 (wrapped, with quotes)
  ctx.font = `500 46px ${FONT_STACK}`
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  const lineText = `“${card.identityLine}”`
  for (const ln of wrapLines(ctx, lineText, maxTextW)) {
    ctx.fillText(ln, cx, y)
    y += 64
  }

  // 6) 해시태그 칩 (centered row, wraps to next row if needed)
  y += 50
  ctx.font = `600 32px ${FONT_STACK}`
  const chipH = 64
  const chipPadX = 30
  const chipGap = 18
  const rows: { text: string; w: number }[][] = [[]]
  for (const tag of card.hashtags) {
    const w = ctx.measureText(tag).width + chipPadX * 2
    const row = rows[rows.length - 1]
    const rowW = row.reduce((s, c) => s + c.w + chipGap, 0)
    if (rowW + w > maxTextW && row.length) rows.push([{ text: tag, w }])
    else row.push({ text: tag, w })
  }
  for (const row of rows) {
    const totalW = row.reduce((s, c) => s + c.w, 0) + chipGap * (row.length - 1)
    let x = cx - totalW / 2
    for (const chip of row) {
      ctx.fillStyle = 'rgba(255,255,255,0.16)'
      roundRectPath(ctx, x, y - chipH + 16, chip.w, chipH, chipH / 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.textAlign = 'center'
      ctx.fillText(chip.text, x + chip.w / 2, y)
      x += chip.w + chipGap
    }
    y += chipH + chipGap
  }

  // 7) 워터마크 (bottom)
  ctx.font = `700 38px ${FONT_STACK}`
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  try { ctx.letterSpacing = '2px' } catch { /* noop */ }
  ctx.fillText('kissinskin.net', cx, CARD_H - 90)
  try { ctx.letterSpacing = '0px' } catch { /* noop */ }

  return canvas
}

function trackCardSaved(input: IdentityCardRenderInput): void {
  trackCardSavedEvent({
    card_label: input.label,
    card_nickname: input.card.nickname,
  })
}

/** Render + trigger a PNG download. Fires GA `card_saved` (skips internal traffic). */
export async function downloadIdentityCard(
  input: IdentityCardRenderInput,
  filename: string,
): Promise<void> {
  const canvas = await renderIdentityCardCanvas(input)
  trackCardSaved(input)
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}
