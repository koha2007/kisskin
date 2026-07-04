// 인페인팅 후처리 (FREE_PIVOT_PLAN P1-3)
// ────────────────────────────────────────────────────────────────────
// 1) fitToSupported: 셀카를 gpt-image-1 지원 사이즈(정사각/세로/가로)로 cover 리사이즈.
// 2) compositeInsideMask: 결과에서 "마스크 밖은 원본 픽셀"로 다시 덮어쓴다.
//    gpt-image-1 이 마스크 밖도 미세 재렌더하는 문제(§8 얼굴변형) 방지의 핵심.
// 3) applyGlow: MediaPipe 글로우(원본 픽셀 위 soft-light 광채)를 인페인팅 후 별도 레이어로.

type LM = { x: number; y: number }

const SUPPORTED: [string, number][] = [
  ['1024x1024', 1],
  ['1536x1024', 1.5],
  ['1024x1536', 1 / 1.5],
]

/** 셀카를 가장 가까운 지원 비율 사이즈로 cover 리사이즈(가장자리만 약간 크롭, 패딩 없음). */
export function fitToSupported(img: HTMLImageElement): { canvas: HTMLCanvasElement; size: string } {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height
  const ar = iw / ih
  let best = SUPPORTED[0], bd = Infinity
  for (const s of SUPPORTED) { const d = Math.abs(Math.log(ar / s[1])); if (d < bd) { bd = d; best = s } }
  const [w, h] = best[0].split('x').map(Number)
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const ctx = c.getContext('2d')!
  const scale = Math.max(w / iw, h / ih)
  const dw = iw * scale, dh = ih * scale
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
  return { canvas: c, size: best[0] }
}

/** 결과 = 원본(src) + (편집결과 ∩ 마스크). 마스크 밖은 원본 픽셀 그대로 보존(페더 블렌드). */
export function compositeInsideMask(
  src: HTMLCanvasElement,
  edited: HTMLImageElement | HTMLCanvasElement,
  alphaMask: HTMLCanvasElement, // toAlphaMask 결과(편집부=불투명)
): HTMLCanvasElement {
  const w = src.width, h = src.height
  // edited 를 마스크 영역으로만 클립
  const em = document.createElement('canvas'); em.width = w; em.height = h
  const ec = em.getContext('2d')!
  ec.drawImage(edited, 0, 0, w, h)
  ec.globalCompositeOperation = 'destination-in'
  ec.drawImage(alphaMask, 0, 0, w, h)
  // 원본 위에 마스크된 편집결과 합성
  const out = document.createElement('canvas'); out.width = w; out.height = h
  const oc = out.getContext('2d')!
  oc.drawImage(src, 0, 0)
  oc.drawImage(em, 0, 0)
  return out
}

// 광채 포인트 [landmark, 반경계수] — looksEngine 과 동일 위치(T존·광대·코·턱)
const GLOW_PTS: [number, number][] = [[9, 0.17], [197, 0.06], [4, 0.05], [0, 0.04], [117, 0.10], [346, 0.10], [152, 0.06]]
const FACE_L = 234, FACE_R = 454

/** MediaPipe 글로우: 원본 픽셀 위 soft-light 광채만(구조 100% 보존). intensity=style.glow. */
export function applyGlow(canvas: HTMLCanvasElement, lm: LM[], intensity: number): void {
  if (!intensity) return
  const w = canvas.width, h = canvas.height
  const ctx = canvas.getContext('2d')!
  const fw = Math.abs(lm[FACE_R].x - lm[FACE_L].x) * w
  ctx.save()
  ctx.globalCompositeOperation = 'soft-light'
  ctx.filter = 'blur(8px)'
  for (const [idx, rc] of GLOW_PTS) {
    const cx = lm[idx].x * w, cy = lm[idx].y * h, rad = fw * rc
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
    g.addColorStop(0, `rgba(255,247,236,${intensity})`)
    g.addColorStop(1, 'rgba(255,247,236,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}
