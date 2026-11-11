// 페이스 페인팅 그리기 — 얼굴 기준점(MediaPipe 478점)에 SVG 무늬를 붙인다 (2026-11-11)
// 스냅 Lens Studio "Face Mask" 처럼 얼굴 크기·기울기를 따라간다. 사용자 이동·크기·회전은 얼굴 기준 좌표로 저장해
// 좌우 한 쌍(mirror)은 거울처럼 같이 움직인다.
import type { LM } from '../makeup/looksEngine'
import { paintById, svgDoc, type PaintDesign } from './designs'

export interface PlacedPaint {
  id: string
  /** 사용자가 옮긴 거리(얼굴 폭 단위, 얼굴 기울기 기준) */
  ox: number
  oy: number
  /** 크기 배율 */
  s: number
  /** 회전(도) */
  r: number
}

export interface Drawn { x: number; y: number; w: number; h: number; angle: number; flip: boolean }

const svgCache = new Map<string, Promise<HTMLImageElement>>()
export function svgImage(d: PaintDesign): Promise<HTMLImageElement> {
  let p = svgCache.get(d.id)
  if (!p) {
    p = new Promise((res, rej) => {
      const img = new Image()
      img.onload = () => res(img); img.onerror = () => rej(new Error('svg'))
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgDoc(d))
    })
    svgCache.set(d.id, p)
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

/** 무늬 하나가 그려질 자리(좌우 한 쌍이면 2개) */
export function placements(lm: LM[], w: number, h: number, item: PlacedPaint): Drawn[] {
  const d = paintById(item.id); if (!d?.place || !d.vb) return []
  const { fw, angle } = faceFrame(lm, w, h)
  const pl = d.place
  const width = fw * pl.w * item.s
  const height = width * (d.vb[1] / d.vb[0])
  const cos = Math.cos(angle), sin = Math.sin(angle)
  const one = (idx: number[], flip: boolean): Drawn => {
    const c = avg(lm, idx, w, h)
    const sx = flip ? -1 : 1
    // 얼굴 기준 이동량(바깥쪽 = +x, 반대편은 거울)
    const fx = ((pl.dx ?? 0) + item.ox) * sx * fw, fy = ((pl.dy ?? 0) + item.oy) * fw
    return {
      x: c.x + fx * cos - fy * sin,
      y: c.y + fx * sin + fy * cos,
      w: width, h: height,
      angle: angle + (flip ? -1 : 1) * (item.r * Math.PI) / 180,
      flip,
    }
  }
  const out = [one(pl.at, false)]
  if (pl.mirror) out.push(one(pl.mirror, true))
  return out
}

/** 사진 + 무늬 */
export async function renderPaint(canvas: HTMLCanvasElement, photo: HTMLImageElement, lm: LM[] | null, items: PlacedPaint[], opacity: number) {
  const w = photo.naturalWidth || photo.width, h = photo.naturalHeight || photo.height
  const imgs = await Promise.all(items.map((it) => { const d = paintById(it.id); return d?.svg ? svgImage(d) : Promise.resolve(null) }))
  if (canvas.width !== w) canvas.width = w
  if (canvas.height !== h) canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(photo, 0, 0, w, h)
  if (!lm) return
  items.forEach((it, i) => {
    const im = imgs[i]; const d = paintById(it.id); if (!im || !d?.vb) return
    const [vw, vh] = d.vb
    const [ox, oy] = d.place!.origin
    for (const p of placements(lm, w, h, it)) {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      if (p.flip) ctx.scale(-1, 1)
      ctx.globalAlpha = opacity
      // origin 이 기준점에 오게
      ctx.drawImage(im, -(ox / vw) * p.w, -(oy / vh) * p.h, p.w, p.h)
      ctx.restore()
    }
  })
}
