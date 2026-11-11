// ════════════════════════════════════════════════════════════════════
// MediaPipe 메이크업 오버레이 엔진 (얼굴 100% 보존 — 원본 픽셀 위 합성)
// Stage 1(POC) 검증 엔진을 src/ TS 로 이식 + Stage 2 신규 레이어
// (skin-smooth / blush offset / 아이라이너 / 디파인드 브로우).
//
// CDN 번들 0: @mediapipe/tasks-vision 를 런타임 동적 import 로 로드(Vite 미번들).
// ════════════════════════════════════════════════════════════════════
import { baseFor, type Look, type LipSpec, type BlushSpec, type EyeshadowSpec, type BrowSpec } from './looksConfig'

const VER = '0.10.18'
const VISION = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VER}`
const WASM = `${VISION}/wasm`
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const SEG_MODEL  = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite'
const HAIR_CATEGORY = 1

// MediaPipe 타입은 CDN 동적 import 라 정적 타입이 없다 → 사용하는 최소 구조만 선언.
type LM = { x: number; y: number }
interface CategoryMask { width: number; height: number; getAsUint8Array(): Uint8Array; close(): void }
interface FaceLandmarkerLike { detect(img: HTMLImageElement): { faceLandmarks?: LM[][] } }
interface SegmenterLike { segment(img: HTMLImageElement): { categoryMask: CategoryMask } }
export interface Engine {
  faceLandmarker: FaceLandmarkerLike
  segmenter: SegmenterLike
}
export interface RenderReport {
  lookId: string
  w: number
  h: number
  face: boolean
  hairPct: number | null
  crownHair?: number
  hatWarning: boolean
  notes?: string
}

// ── 랜드마크 인덱스 ──
const LIP_OUTER = [61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146]
const LIP_INNER = [78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95]
const CHEEK_L = 50, CHEEK_R = 280
const FACE_L = 234, FACE_R = 454
const FACE_TOP = 10, FACE_BOTTOM = 152
const LID_R  = [33,246,161,160,159,158,157,173,133]      // 이미지 좌측 눈 윗꺼풀
const LID_L  = [263,466,388,387,386,385,384,398,362]     // 이미지 우측 눈 윗꺼풀
const BROW_R = [70,63,105,66,107]
const BROW_L = [336,296,334,293,300]
const LOWER_R = [33,7,163,144,145,153,154,155,133]
const LOWER_L = [263,249,390,373,374,380,381,382,362]
// 광채(하이라이트) 포인트: [landmark, 반경계수]
const GLOW_PTS: [number, number][] = [[9,0.17],[197,0.06],[4,0.05],[0,0.04],[117,0.10],[346,0.10],[152,0.06]]

const hex = (h: string): [number, number, number] => { const n = parseInt(h.slice(1),16); return [n>>16&255, n>>8&255, n&255] }
const P = (lm: LM[], i: number, w: number, h: number) => ({ x: lm[i].x*w, y: lm[i].y*h })
const centroid = (lm: LM[], idx: number[], w: number, h: number) => {
  let x=0,y=0; for(const i of idx){ x+=lm[i].x*w; y+=lm[i].y*h } return { x:x/idx.length, y:y/idx.length }
}
const faceW = (lm: LM[], w: number) => Math.abs(lm[FACE_R].x - lm[FACE_L].x) * w

// ── 모델 초기화 (1회) ──
export async function initEngine(onStatus: (s: string) => void = () => {}): Promise<Engine> {
  onStatus('FilesetResolver 로딩…')
  const { FilesetResolver, FaceLandmarker, ImageSegmenter } = await import(/* @vite-ignore */ VISION)
  const vision = await FilesetResolver.forVisionTasks(WASM)
  onStatus('FaceLandmarker 다운로드…')
  const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
    runningMode: 'IMAGE', numFaces: 1, outputFaceBlendshapes: false,
  })
  onStatus('ImageSegmenter(헤어) 다운로드…')
  const segmenter = await ImageSegmenter.createFromOptions(vision, {
    baseOptions: { modelAssetPath: SEG_MODEL, delegate: 'GPU' },
    runningMode: 'IMAGE', outputCategoryMask: true, outputConfidenceMasks: false,
  })
  onStatus('✅ 준비 완료')
  return { faceLandmarker, segmenter }
}

type Ctx = CanvasRenderingContext2D

// ── 레이어 함수 ──
function lipPath(ctx: Ctx, lm: LM[], w: number, h: number) {
  ctx.beginPath()
  const ring = (idx: number[]) => { ctx.moveTo(lm[idx[0]].x*w, lm[idx[0]].y*h); for(let i=1;i<idx.length;i++) ctx.lineTo(lm[idx[i]].x*w, lm[idx[i]].y*h); ctx.closePath() }
  ring(LIP_OUTER); ring(LIP_INNER)
}

function applyLip(ctx: Ctx, lm: LM[], w: number, h: number, { color, alpha, style }: LipSpec) {
  const [r,g,b] = hex(color)
  const c = centroid(lm, LIP_OUTER, w, h)
  ctx.save(); lipPath(ctx, lm, w, h); ctx.clip('evenodd')
  ctx.globalCompositeOperation = 'multiply'
  if (style === 'gradient') {
    const fw = faceW(lm, w)
    const grd = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, fw*0.10)
    grd.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
    grd.addColorStop(1, `rgba(${r},${g},${b},${alpha*0.28})`)
    ctx.fillStyle = grd
  } else {
    ctx.globalAlpha = style === 'matte' ? alpha : alpha*0.9
    ctx.filter = 'blur(1.5px)'
    ctx.fillStyle = `rgb(${r},${g},${b})`
  }
  ctx.fillRect(0,0,w,h)
  ctx.restore()
  if (style === 'glossy') {                       // 하단 입술 중앙 광택
    ctx.save(); lipPath(ctx, lm, w, h); ctx.clip('evenodd')
    ctx.globalCompositeOperation = 'screen'
    const gy = c.y + (lm[17].y*h - c.y)*0.4
    const gl = ctx.createRadialGradient(c.x, gy, 0, c.x, gy, faceW(lm,w)*0.05)
    gl.addColorStop(0,'rgba(255,255,255,0.5)'); gl.addColorStop(1,'rgba(255,255,255,0)')
    ctx.fillStyle = gl; ctx.fillRect(0,0,w,h); ctx.restore()
  }
}

function applyBlush(ctx: Ctx, lm: LM[], w: number, h: number, { color, alpha, offsetY = 0 }: BlushSpec) {
  const [r,g,b] = hex(color); const fw = faceW(lm,w); const rad = fw*0.24
  // offsetY 양수면 광대 위치를 눈 아래(언더아이)로 끌어올림 — 수채 플러시.
  const dy = -offsetY * fw
  for (const ci of [CHEEK_L, CHEEK_R]) {
    const cx = lm[ci].x*w, cy = lm[ci].y*h + dy
    const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,rad)
    grd.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
    grd.addColorStop(0.5, `rgba(${r},${g},${b},${alpha*0.45})`)
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.filter='blur(6px)'
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,rad,0,Math.PI*2); ctx.fill(); ctx.restore()
  }
}

function applyHighlight(ctx: Ctx, lm: LM[], w: number, h: number, intensity: number) {
  const fw = faceW(lm, w)
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.filter = 'blur(8px)'
  for (const [idx, rc] of GLOW_PTS) {
    const cx = lm[idx].x*w, cy = lm[idx].y*h, rad = fw*rc
    const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,rad)
    grd.addColorStop(0, `rgba(255,247,236,${intensity})`)
    grd.addColorStop(1, 'rgba(255,247,236,0)')
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,rad,0,Math.PI*2); ctx.fill()
  }
  ctx.restore()
}

// 필터 같은 매끈 스킨: 얼굴 타원 영역만 블러 사본을 저알파로 덮어 결점 완화.
// 눈·입은 베이스 위에 있어 약간 부드러워지나 강도가 낮아 형태는 보존.
function applySkinSmooth(ctx: Ctx, canvas: HTMLCanvasElement, lm: LM[], w: number, h: number, strength: number) {
  const fw = faceW(lm, w)
  const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h
  const tctx = tmp.getContext('2d'); if (!tctx) return
  tctx.filter = `blur(${Math.max(2, fw*0.012)}px)`
  tctx.drawImage(canvas, 0, 0)
  const cx = (lm[FACE_L].x + lm[FACE_R].x)/2 * w
  const cy = (lm[FACE_TOP].y + lm[FACE_BOTTOM].y)/2 * h
  const rx = fw*0.62, ry = Math.abs(lm[FACE_BOTTOM].y - lm[FACE_TOP].y)*h*0.6
  ctx.save()
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2); ctx.clip()
  ctx.globalAlpha = Math.min(0.55, strength)
  ctx.drawImage(tmp, 0, 0)
  ctx.restore()
}

function eyeShadowOneEye(ctx: Ctx, lm: LM[], w: number, h: number, lid: number[], brow: number[], lower: number[], opt: EyeshadowSpec) {
  const [r,g,b] = hex(opt.color)
  const lidC = centroid(lm, lid, w, h), browC = centroid(lm, brow, w, h)
  const up = { x: browC.x-lidC.x, y: browC.y-lidC.y }      // 꺼풀→눈썹 방향(기울기 대응)
  const s = opt.spread ?? 0.5
  const blur = opt.liner ? 1.5 : 5                          // 라이너는 또렷하게
  ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.filter=`blur(${blur}px)`; ctx.globalAlpha=opt.alpha
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.beginPath()
  const lp = lid.map((i) => P(lm,i,w,h))
  lp.forEach((p,k) => k? ctx.lineTo(p.x,p.y): ctx.moveTo(p.x,p.y))
  for (let k=lp.length-1;k>=0;k--){ const p=lp[k]; ctx.lineTo(p.x+up.x*s, p.y+up.y*s) }
  ctx.closePath(); ctx.fill()
  ctx.restore()
  if (opt.lower && lower) {                                // 스모키: 하단 라인
    ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.filter='blur(4px)'; ctx.globalAlpha=opt.alpha*0.6
    ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.beginPath()
    const dp = lower.map((i)=>P(lm,i,w,h)); dp.forEach((p,k)=>k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y))
    for(let k=dp.length-1;k>=0;k--){ const p=dp[k]; ctx.lineTo(p.x-up.x*0.25, p.y-up.y*0.25) }
    ctx.closePath(); ctx.fill(); ctx.restore()
  }
  if (opt.shimmer) {                                       // 쉬머: 꺼풀 중앙 광(이너코너 근사)
    const cx=lidC.x+up.x*0.35, cy=lidC.y+up.y*0.35, rad=faceW(lm,w)*0.05
    ctx.save(); ctx.globalCompositeOperation='screen'; ctx.filter='blur(3px)'
    const gl=ctx.createRadialGradient(cx,cy,0,cx,cy,rad)
    gl.addColorStop(0,'rgba(255,250,245,0.55)'); gl.addColorStop(1,'rgba(255,250,245,0)')
    ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(cx,cy,rad,0,Math.PI*2); ctx.fill(); ctx.restore()
  }
}
function applyEyeshadow(ctx: Ctx, lm: LM[], w: number, h: number, opt: EyeshadowSpec) {
  eyeShadowOneEye(ctx, lm, w, h, LID_R, BROW_R, LOWER_R, opt)
  eyeShadowOneEye(ctx, lm, w, h, LID_L, BROW_L, LOWER_L, opt)
}

// 디파인드 브로우: 눈썹 라인을 따라 은은한 다크 브라운 스트로크 → 정리·강조.
function applyBrow(ctx: Ctx, lm: LM[], w: number, h: number, { color, alpha }: BrowSpec) {
  const [r,g,b] = hex(color); const lw = Math.max(2, faceW(lm,w)*0.018)
  for (const brow of [BROW_R, BROW_L]) {
    ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.filter='blur(2px)'; ctx.globalAlpha=alpha
    ctx.strokeStyle=`rgb(${r},${g},${b})`; ctx.lineWidth=lw; ctx.lineCap='round'; ctx.lineJoin='round'
    ctx.beginPath()
    const bp = brow.map((i)=>P(lm,i,w,h)); bp.forEach((p,k)=>k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y))
    ctx.stroke(); ctx.restore()
  }
}

// 크라운(이마 위 정수리) 영역이 머리카락인지 모자인지 판정.
function crownHairFraction(md: Uint8Array, mw: number, mh: number, lm: LM[]) {
  const nx = lm[10].x, ny = lm[10].y, faceH = Math.abs(lm[152].y - lm[10].y)
  let hair = 0, total = 0
  for (let yy = ny - 0.18*faceH; yy < ny - 0.02*faceH; yy += 0.01) {
    for (let xx = nx - 0.16; xx <= nx + 0.16; xx += 0.02) {
      if (xx < 0 || xx > 1 || yy < 0 || yy > 1) continue
      const v = md[(Math.min(mh-1,(yy*mh)|0))*mw + Math.min(mw-1,(xx*mw)|0)]
      total++; if (v === HAIR_CATEGORY) hair++
    }
  }
  return total ? hair/total : 1
}

// 휘도 보존 헤어 리컬러 (POC 검증 방식). 반환: 헤어 픽셀 %
function applyHair(ctx: Ctx, w: number, h: number, md: Uint8Array, mw: number, mh: number, color: string) {
  const [tr,tg,tb] = hex(color)
  const frame = ctx.getImageData(0,0,w,h); const fd = frame.data
  let hair = 0
  for (let y=0;y<h;y++){
    const my = Math.min(mh-1,(y*mh/h)|0)
    for (let x=0;x<w;x++){
      const mx = Math.min(mw-1,(x*mw/w)|0)
      if (md[my*mw+mx] !== HAIR_CATEGORY) continue
      hair++
      const p=(y*w+x)*4
      const lum=(0.299*fd[p]+0.587*fd[p+1]+0.114*fd[p+2])/255
      fd[p]  = tr*lum*0.7 + fd[p]*0.3
      fd[p+1]= tg*lum*0.7 + fd[p+1]*0.3
      fd[p+2]= tb*lum*0.7 + fd[p+2]*0.3
    }
  }
  ctx.putImageData(frame,0,0)
  return +(100*hair/(w*h)).toFixed(2)
}

// ── 메인: 룩 1개 렌더 ──
export function renderLook(canvas: HTMLCanvasElement, img: HTMLImageElement, look: Look, engine: Engine): RenderReport {
  const { faceLandmarker, segmenter } = engine
  const w = img.naturalWidth||img.width, h = img.naturalHeight||img.height
  canvas.width=w; canvas.height=h
  const ctx = canvas.getContext('2d', { willReadFrequently:true }) as Ctx
  ctx.drawImage(img,0,0,w,h)                               // 1) 원본 = 얼굴 보존
  const report: RenderReport = { lookId: look.id, w, h, face:false, hairPct:null, hatWarning:false }

  const res = faceLandmarker.detect(img)
  if (!res.faceLandmarks?.length) { report.notes='얼굴 미검출'; return report }
  const lm: LM[] = res.faceLandmarks[0]; report.face = true
  const base = baseFor(look.gender)

  // 2) 스킨 스무딩(블러 베이스 룩) — 가장 먼저(원본 바로 위)
  if (look.skinSmooth) applySkinSmooth(ctx, canvas, lm, w, h, look.skinSmooth)
  // 3) 기본 베이스: 광채 + 블러셔 (항상)
  applyHighlight(ctx, lm, w, h, base.highlight + (look.highlightAdd||0))
  applyBlush(ctx, lm, w, h, look.blush || base.blush)
  // 4) 립 = 룩 지정 or 베이스(자연 혈색)
  applyLip(ctx, lm, w, h, look.lip || base.lip)
  // 5) 아이/브로우 포인트 (eyeshadow 는 단일 or 다중 레이어 — 쉬머 워시 위에 라이너 등)
  if (look.eyeshadow) {
    const layers = Array.isArray(look.eyeshadow) ? look.eyeshadow : [look.eyeshadow]
    for (const es of layers) applyEyeshadow(ctx, lm, w, h, es)
  }
  if (look.brow) applyBrow(ctx, lm, w, h, look.brow)
  // 6) 헤어 룩이면 세그멘테이션 리컬러 (모자면 스킵 + 경고)
  if (look.hair) {
    const seg = segmenter.segment(img); const m = seg.categoryMask
    const md = m.getAsUint8Array() as Uint8Array
    const crown = crownHairFraction(md, m.width, m.height, lm)
    report.crownHair = +crown.toFixed(2)
    if (crown < 0.15) {
      // 이마 위가 거의 머리카락 아님 → 모자/두건. 헤어 색 적용 스킵, 안내만.
      report.hatWarning = true
      report.hairPct = 0
    } else {
      report.hairPct = applyHair(ctx, w, h, md, m.width, m.height, look.hair)
    }
    m.close()
  }
  return report
}

// ════════════════════════════════════════════════════════════════════
// 2026-11-11 페이스 페인팅·헤어 컬러용 (/face-paint/ · /hair-color/)
// ════════════════════════════════════════════════════════════════════
export type { LM }

/** 얼굴 기준점만(페이스 페인팅) — 머리카락 모델(16MB)은 받지 않는다 */
export async function initFaceOnly(): Promise<FaceLandmarkerLike> {
  const { FilesetResolver, FaceLandmarker } = await import(/* @vite-ignore */ VISION)
  const vision = await FilesetResolver.forVisionTasks(WASM)
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
    runningMode: 'IMAGE', numFaces: 1, outputFaceBlendshapes: false,
  })
}

export function detectFace(fl: FaceLandmarkerLike, img: HTMLImageElement): LM[] | null {
  const r = fl.detect(img)
  return r.faceLandmarks?.length ? r.faceLandmarks[0] : null
}

export interface HairMask {
  /** 사진 크기의 0~255 알파(가장자리 부드럽게) */
  alpha: Uint8ClampedArray
  w: number
  h: number
  /** 머리카락 평균 밝기(0~1) */
  meanLum: number
  /** 사진에서 머리카락 비율(%) */
  pct: number
  /** 이마 위가 머리카락이 아님 = 모자·두건 */
  hat: boolean
}

/** 머리카락 영역을 한 번만 구해 둔다(색을 바꿀 때마다 다시 돌리지 않는다) */
export function buildHairMask(engine: Engine, img: HTMLImageElement): HairMask | null {
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height
  const seg = engine.segmenter.segment(img); const m = seg.categoryMask
  const md = m.getAsUint8Array() as Uint8Array
  const lm = engine.faceLandmarker.detect(img).faceLandmarks?.[0]
  const crown = lm ? crownHairFraction(md, m.width, m.height, lm) : 1
  // 256×256 마스크 → 사진 크기로 부드럽게 키우고 살짝 흐린다(계단 가장자리 방지)
  const small = document.createElement('canvas'); small.width = m.width; small.height = m.height
  const sctx = small.getContext('2d')!
  const sd = sctx.createImageData(m.width, m.height)
  for (let i = 0; i < md.length; i++) { sd.data[i * 4 + 3] = md[i] === HAIR_CATEGORY ? 255 : 0 }
  sctx.putImageData(sd, 0, 0)
  m.close()
  const big = document.createElement('canvas'); big.width = w; big.height = h
  const bctx = big.getContext('2d', { willReadFrequently: true })!
  bctx.imageSmoothingEnabled = true
  bctx.filter = `blur(${Math.max(1, Math.round(Math.max(w, h) / 500))}px)`
  bctx.drawImage(small, 0, 0, w, h)
  const bd = bctx.getImageData(0, 0, w, h).data
  const alpha = new Uint8ClampedArray(w * h)
  // 원본 밝기 평균(머리카락 안쪽만)
  const src = document.createElement('canvas'); src.width = w; src.height = h
  const xctx = src.getContext('2d', { willReadFrequently: true })!
  xctx.drawImage(img, 0, 0, w, h)
  const pd = xctx.getImageData(0, 0, w, h).data
  let sum = 0, n = 0, hair = 0
  for (let i = 0; i < w * h; i++) {
    const a = bd[i * 4 + 3]; alpha[i] = a
    if (a > 200) { const p = i * 4; sum += (0.299 * pd[p] + 0.587 * pd[p + 1] + 0.114 * pd[p + 2]) / 255; n++ }
    if (a > 127) hair++
  }
  return { alpha, w, h, meanLum: n ? sum / n : 0.2, pct: +(100 * hair / (w * h)).toFixed(2), hat: crown < 0.15 }
}

/**
 * 머리카락만 새 색으로 (11/11 2차 — "합성한 것처럼 어색" 개선).
 * 1차는 목표색 × 밝기비 → 평평한 페인트처럼 보였다. 2차:
 *   · 색상·채도만 목표색으로, 밝기는 원래 결(가닥 명암)을 목표 밝기 쪽으로 옮긴다(HSL 'color' 블렌드에 가깝게)
 *   · 그림자일수록 채도를 낮추고, 하이라이트는 원래 빛을 일부 남긴다(윤기)
 *   · 정수리 쪽 뿌리는 살짝 어둡게(실제 염색의 뿌리 깊이)
 *   · 마스크 가장자리를 조금 깎아 배경에 색이 번지는 테두리를 줄인다
 */
export function recolorHair(canvas: HTMLCanvasElement, img: HTMLImageElement, mask: HairMask, color: string, strength: number) {
  const { w, h, alpha, meanLum } = mask
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, w, h)
  const frame = ctx.getImageData(0, 0, w, h); const fd = frame.data
  const [tr, tg, tb] = hex(color)
  const [th, ts, tl] = rgbToHsl(tr, tg, tb)
  const base = Math.max(0.05, meanLum)
  // 머리카락 위·아래 끝(뿌리 깊이용)
  let top = h, bottom = 0
  for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) if (alpha[y * w + x] > 160) { if (y < top) top = y; if (y > bottom) bottom = y }
  const span = Math.max(1, bottom - top)
  for (let i = 0; i < w * h; i++) {
    const a0 = alpha[i]; if (a0 < 50) continue
    const a = Math.min(1, (a0 - 50) / 170)              // 가장자리 살짝 깎기
    const p = i * 4
    const r = fd[p], g = fd[p + 1], b = fd[p + 2]
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const rel = Math.pow(lum / base, 0.75)               // 가닥 명암(평균 = 1)
    // 가는 잔머리(배경이 비쳐 밝게 잡힘)가 하얗게 뜨지 않게 위쪽을 낮게 묶는다
    let L = tl * Math.min(1.25, Math.max(0.3, rel))
    const y = (i / w) | 0
    const depth = Math.max(0, 1 - (y - top) / (span * 0.22)) // 정수리 22% 구간
    L *= 1 - 0.18 * depth
    const S = ts * Math.min(1, 0.55 + 0.45 * Math.min(1, rel)) // 그림자일수록 채도 낮게
    let [nr, ng, nb] = hslToRgb(th, S, Math.min(0.85, L))
    if (rel > 1.15 && a > 0.9) { const k = Math.min(0.12, (rel - 1.15) * 0.3); nr += (255 - nr) * k; ng += (255 - ng) * k; nb += (255 - nb) * k } // 윤기(원래 갈색을 섞으면 밝은 색이 회색으로 탁해진다 → 흰 빛 쪽으로)
    const k = a * strength
    fd[p] = r + (Math.min(255, nr) - r) * k
    fd[p + 1] = g + (Math.min(255, ng) - g) * k
    fd[p + 2] = b + (Math.min(255, nb) - b) * k
  }
  ctx.putImageData(frame, 0, 0)
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2
  if (mx === mn) return [0, 0, l]
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
  const hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [hh / 6, s, l]
}
function hslToRgb(hh: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255]
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q
  const f = (t: number) => { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p }
  return [f(hh + 1 / 3) * 255, f(hh) * 255, f(hh - 1 / 3) * 255]
}
