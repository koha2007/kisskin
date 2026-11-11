// 페이스 페인팅 그리기 — 얼굴 기준점(MediaPipe 478점)에 무늬를 붙인다 (2026-11-11, 2차 개편)
// 스냅 Lens Studio "Face Mask" 처럼 얼굴 크기·기울기를 따라간다. 사용자 이동·크기·회전은 얼굴 기준 좌표로 저장해
// 좌우 한 쌍(mirror)은 거울처럼 같이 움직인다.
// 2차: 투명 원화(진주·크롬·레이스) + 붙인 것(sticker)엔 작은 그림자 + 눈동자 자리는 늘 비운다(무늬가 눈을 덮지 않게).
import type { LM } from '../makeup/looksEngine'
import { artSrc, paintById, type PaintDesign } from './designs'

export interface PlacedPaint {
  id: string
  /** 사용자가 옮긴 거리(얼굴 폭 단위, 얼굴 기울기 기준) */
  ox: number
  oy: number
  s: number
  /** 회전(도) */
  r: number
}

export interface Drawn { x: number; y: number; w: number; h: number; angle: number; flip: boolean }

const artCache = new Map<string, Promise<HTMLImageElement>>()
export function artImage(d: PaintDesign): Promise<HTMLImageElement> {
  let p = artCache.get(d.id)
  if (!p) {
    p = new Promise((res, rej) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => res(img); img.onerror = () => { artCache.delete(d.id); rej(new Error('art')) }
      img.src = artSrc(d)
    })
    artCache.set(d.id, p)
  }
  return p
}

const avg = (lm: LM[], idx: number[], w: number, h: number) => {
  let x = 0, y = 0
  for (const i of idx) { x += lm[i].x * w; y += lm[i].y * h }
  return { x: x / idx.length, y: y / idx.length }
}

export interface FaceFrame { fw: number; angle: number }
export function faceFrame(lm: LM[], w: number, h: number): FaceFrame {
  const a = { x: lm[234].x * w, y: lm[234].y * h }, b = { x: lm[454].x * w, y: lm[454].y * h }
  const e1 = { x: lm[33].x * w, y: lm[33].y * h }, e2 = { x: lm[263].x * w, y: lm[263].y * h }
  return { fw: Math.hypot(b.x - a.x, b.y - a.y), angle: Math.atan2(e2.y - e1.y, e2.x - e1.x) }
}

/** 무늬 하나가 그려질 자리(좌우 한 쌍이면 2개). aspect = 원화 높이/폭 */
export function placements(lm: LM[], w: number, h: number, item: PlacedPaint, aspect = 1): Drawn[] {
  const d = paintById(item.id); if (!d?.place) return []
  const { fw, angle } = faceFrame(lm, w, h)
  const pl = d.place
  const width = fw * pl.w * item.s
  const height = width * aspect
  const cos = Math.cos(angle), sin = Math.sin(angle)
  const one = (idx: number[], flip: boolean): Drawn => {
    const c = avg(lm, idx, w, h)
    const sx = flip ? -1 : 1
    const fx = ((pl.dx ?? 0) + item.ox) * sx * fw, fy = ((pl.dy ?? 0) + item.oy) * fw
    return {
      x: c.x + fx * cos - fy * sin,
      y: c.y + fx * sin + fy * cos,
      w: width, h: height,
      angle: angle + (flip ? -1 : 1) * ((item.r + (pl.rot ?? 0)) * Math.PI) / 180,
      flip,
    }
  }
  const out = [one(pl.at, false)]
  if (pl.mirror) out.push(one(pl.mirror, true))
  return out
}

// 눈 뜬 자리(윗꺼풀~아랫꺼풀) — 무늬 층에서 지운다
const EYE_OPEN_R = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
const EYE_OPEN_L = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]

let layer: HTMLCanvasElement | null = null

/** 사진 + 무늬 */
export async function renderPaint(canvas: HTMLCanvasElement, photo: HTMLImageElement, lm: LM[] | null, items: PlacedPaint[], opacity: number) {
  const w = photo.naturalWidth || photo.width, h = photo.naturalHeight || photo.height
  const arts = await Promise.all(items.map((it) => { const d = paintById(it.id); return d ? artImage(d).catch(() => null) : Promise.resolve(null) }))
  if (canvas.width !== w) canvas.width = w
  if (canvas.height !== h) canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(photo, 0, 0, w, h)
  if (!lm || !items.length) return

  if (!layer) layer = document.createElement('canvas')
  layer.width = w; layer.height = h
  const lc = layer.getContext('2d')!
  lc.clearRect(0, 0, w, h)
  const { fw } = faceFrame(lm, w, h)
  items.forEach((it, i) => {
    const im = arts[i]; const d = paintById(it.id); if (!im || !d?.place) return
    const aspect = im.naturalHeight / im.naturalWidth
    const [ox, oy] = d.place.origin
    for (const p of placements(lm, w, h, it, aspect)) {
      lc.save()
      lc.translate(p.x, p.y)
      lc.rotate(p.angle)
      if (p.flip !== !!d.place.flipArt) lc.scale(-1, 1)
      if (d.kind === 'sticker') {
        // 붙인 것 — 피부 위에 살짝 뜬 그림자
        lc.shadowColor = 'rgba(60,30,20,0.35)'
        lc.shadowBlur = Math.max(1, fw * 0.006)
        lc.shadowOffsetY = Math.max(0.5, fw * 0.003)
      }
      lc.drawImage(im, -ox * p.w, -oy * p.h, p.w, p.h)
      lc.restore()
    }
  })
  // 눈 뜬 자리는 비운다
  lc.save()
  lc.globalCompositeOperation = 'destination-out'
  for (const eye of [EYE_OPEN_R, EYE_OPEN_L]) {
    lc.beginPath()
    eye.forEach((k, j) => { const x = lm[k].x * w, y = lm[k].y * h; if (j) lc.lineTo(x, y); else lc.moveTo(x, y) })
    lc.closePath(); lc.fill()
  }
  lc.restore()
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.drawImage(layer, 0, 0)
  ctx.restore()
}

/** 끌기용: 원화 비율을 미리 알아 둔다 */
export async function aspectOf(id: string): Promise<number> {
  const d = paintById(id); if (!d) return 1
  try { const im = await artImage(d); return im.naturalHeight / im.naturalWidth } catch { return 1 }
}
