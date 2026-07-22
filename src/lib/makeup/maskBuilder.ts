// ════════════════════════════════════════════════════════════════════
// MediaPipe 마스크 생성기 (FREE_PIVOT_PLAN 커밋 P1-2)
// ────────────────────────────────────────────────────────────────────
// 브라우저에서 얼굴 랜드마크를 감지하고, 선택 스타일의 maskAreas 대로
// 편집 마스크를 만든다. 흰색 = 편집(인페인팅) 영역, 검정 = 보존 영역.
// 가장자리는 반드시 페더링(블러)해 경계 자국을 없앤다.
//
// 검출은 looksEngine 의 initEngine(FaceLandmarker)을 그대로 재활용한다.
// looksEngine 의 "색 오버레이" 합성은 최종적으로 쓰지 않는다(§8) — 여기서는
// 위치(랜드마크)만 빌려 마스크 기하만 그린다.
//
// 이 마스크는 P1-3(OpenAI 이미지 편집)이 그대로 소비한다. 지금은 OpenAI 미연결 —
// buildMaskOutputs 가 디버그 오버레이(마스크 영역 시각화)도 함께 돌려준다.
// ════════════════════════════════════════════════════════════════════

import type { MakeupArea } from './styles'

type LM = { x: number; y: number }

// ── 얼굴 검출 엔진(FaceLandmarker만) ────────────────────────────────
// looksEngine 과 동일한 CDN/모델을 쓰되, 마스크에는 헤어 세그멘터가 불필요하므로
// FaceLandmarker 만 로드한다(다운로드 절약). delegate GPU 실패 시 CPU 폴백.
const VER = '0.10.18'
const VISION = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VER}`
const WASM = `${VISION}/wasm`
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

type ImgSrc = HTMLImageElement | HTMLCanvasElement
type Matrix = { data: number[] | Float32Array }
interface DetectResult { faceLandmarks?: LM[][]; facialTransformationMatrixes?: Matrix[] }
interface FaceLandmarkerLike { detect(img: ImgSrc): DetectResult }
export interface Engine { faceLandmarker: FaceLandmarkerLike }

export async function initEngine(onStatus: (s: string) => void = () => {}): Promise<Engine> {
  onStatus('FilesetResolver 로딩…')
  const { FilesetResolver, FaceLandmarker } = await import(/* @vite-ignore */ VISION)
  const vision = await FilesetResolver.forVisionTasks(WASM)
  onStatus('얼굴 인식 모델 다운로드…')
  const make = (delegate: 'GPU' | 'CPU') =>
    FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: FACE_MODEL, delegate },
      runningMode: 'IMAGE', numFaces: 1, outputFaceBlendshapes: false,
      // 3D 헤드 포즈 행렬 — 좌우 회전(yaw) 게이트용. landmark 휴리스틱보다 roll/렌즈에 강건.
      outputFacialTransformationMatrixes: true,
    })
  let faceLandmarker: FaceLandmarkerLike
  try {
    faceLandmarker = await make('GPU')
  } catch (e) {
    console.warn('[maskBuilder] GPU delegate failed, falling back to CPU', e)
    faceLandmarker = await make('CPU')
  }
  onStatus('✅ 준비 완료')
  return { faceLandmarker }
}

// ── 랜드마크 인덱스 (MediaPipe FaceMesh 표준 — looksEngine 과 동일 좌표계) ──
const LIP_OUTER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]
const CHEEK_L = 50, CHEEK_R = 280
const FACE_L = 234, FACE_R = 454
// 표준 얼굴 윤곽(FACEMESH_FACE_OVAL) 순서 — 스킨 마스크용
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
  152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
]
// 눈(윗꺼풀+아랫꺼풀) 링 — 눈 영역 보호/편집용
const EYE_R = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
const EYE_L = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]
// 윗꺼풀(아이섀도 영역을 눈썹쪽으로 확장하기 위한 기준선)
const UPPER_R = [33, 246, 161, 160, 159, 158, 157, 173, 133]
const UPPER_L = [263, 466, 388, 387, 386, 385, 384, 398, 362]
const BROW_R = [70, 63, 105, 66, 107]
const BROW_L = [336, 296, 334, 293, 300]

// 안쪽 피부 평면 기준점
const GLABELLA = 9, FOREHEAD_TOP = 10, BROW_OUT_R = 70, BROW_OUT_L = 300
const NOSE_BRIDGE = 168, NOSE_TIP = 4

// ── 정면도(yaw) 게이트 ──────────────────────────────────────────────
// 측면 각도 셀카는 마스크가 어긋나 인페인팅 품질이 급락한다(립 어긋남·피부 보정
// 실패). "나쁜 입력 거르기" 차원에서 좌우 회전(yaw)을 추정해 임계값을 넘으면 차단.
//
// yaw 는 MediaPipe 3D 헤드 포즈 행렬(facialTransformationMatrixes)에서 뽑는다.
// 코끝 수평 오프셋 같은 landmark 휴리스틱은 고개 기울임(roll)·렌즈 왜곡에 오염돼
// 정면 셀카를 측면으로 오판(실측: 정면 데모가 57°로 읽힘)하므로 쓰지 않는다.
// 행렬이 없을 때만 landmark 폴백을 쓴다.
//
// 보수적으로(=정면에 가까운 것은 통과) 잡되, 아래 상수로 나중에 튜닝 가능.
// 보정 실측(matrix yaw): 정면 데모 ≤4°, 살짝 돌린 허용 셀카 ~18°, 강한 측면은 25°+.
// 25 = 사용자 제시 20~25 범위 상단 + 허용 셀카(~18°)에 안전 마진 → 정면 오차단 최소화.
export const YAW_LIMIT_DEG = 25 // ↓ 낮출수록 엄격(측면 차단 강화), ↑ 높일수록 관대
const NOSE_TIP_FRONT = 1 // landmark 폴백용 코끝

const RAD2DEG = 180 / Math.PI

/**
 * 3D 포즈 행렬(열우선 16) → 좌우 회전 yaw(도). 0 = 정면.
 * 얼굴 forward 축(로컬 +Z = 3번째 열)을 카메라 좌표에서 본 수평 성분으로 각도를 구한다.
 */
export function yawFromMatrix(m: number[] | Float32Array): number {
  // 열우선: col2(=forward) = (m[8], m[9], m[10]). 스케일이 섞여도 atan2 비율은 불변.
  const fx = m[8], fz = m[10]
  if (!isFinite(fx) || !isFinite(fz)) return 0
  return Math.atan2(fx, fz) * RAD2DEG
}

/** landmark 폴백(행렬 미제공 환경 전용 — 정밀도 낮음). */
export function estimateYawDeg(lm: LM[]): number {
  const faceL = lm[FACE_L].x, faceR = lm[FACE_R].x
  const width = faceR - faceL
  if (Math.abs(width) < 1e-6) return 0
  const center = (faceL + faceR) / 2
  return ((lm[NOSE_TIP_FRONT].x - center) / width) * 180
}

type Ctx = CanvasRenderingContext2D

const faceW = (lm: LM[], w: number) => Math.abs(lm[FACE_R].x - lm[FACE_L].x) * w
const PT = (lm: LM[], i: number, w: number, h: number) => ({ x: lm[i].x * w, y: lm[i].y * h })
const centroid = (lm: LM[], idx: number[], w: number, h: number) => {
  let x = 0, y = 0
  for (const i of idx) { x += lm[i].x * w; y += lm[i].y * h }
  return { x: x / idx.length, y: y / idx.length }
}
function fillPoly(ctx: Ctx, lm: LM[], idx: number[], w: number, h: number) {
  ctx.beginPath()
  idx.forEach((i, k) => (k ? ctx.lineTo(lm[i].x * w, lm[i].y * h) : ctx.moveTo(lm[i].x * w, lm[i].y * h)))
  ctx.closePath()
  ctx.fill()
}

// ── 부위별 도형 (흰색으로 그려진다고 가정; 합성모드는 호출부가 정함) ──
function drawLips(ctx: Ctx, lm: LM[], w: number, h: number) {
  fillPoly(ctx, lm, LIP_OUTER, w, h)
}
function drawCheeks(ctx: Ctx, lm: LM[], w: number, h: number) {
  const rad = faceW(lm, w) * 0.20
  for (const ci of [CHEEK_L, CHEEK_R]) {
    ctx.beginPath()
    ctx.arc(lm[ci].x * w, lm[ci].y * h, rad, 0, Math.PI * 2)
    ctx.fill()
  }
}
// 눈 영역: 눈 링 + 윗꺼풀을 눈썹쪽으로 확장한 리드(lid) 영역
function drawOneEye(ctx: Ctx, lm: LM[], w: number, h: number, ring: number[], upper: number[], brow: number[]) {
  fillPoly(ctx, lm, ring, w, h)
  const browC = centroid(lm, brow, w, h)
  const up = upper.map((i) => ({ x: lm[i].x * w, y: lm[i].y * h }))
  ctx.beginPath()
  up.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
  for (let k = up.length - 1; k >= 0; k--) {
    const p = up[k]
    ctx.lineTo(p.x + (browC.x - p.x) * 0.7, p.y + (browC.y - p.y) * 0.7)
  }
  ctx.closePath()
  ctx.fill()
}
function drawEyes(ctx: Ctx, lm: LM[], w: number, h: number) {
  drawOneEye(ctx, lm, w, h, EYE_R, UPPER_R, BROW_R)
  drawOneEye(ctx, lm, w, h, EYE_L, UPPER_L, BROW_L)
}
function drawBrows(ctx: Ctx, lm: LM[], w: number, h: number) {
  const lw = Math.max(4, faceW(lm, w) * 0.05)
  ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  for (const brow of [BROW_R, BROW_L]) {
    ctx.beginPath()
    brow.forEach((i, k) => (k ? ctx.lineTo(lm[i].x * w, lm[i].y * h) : ctx.moveTo(lm[i].x * w, lm[i].y * h)))
    ctx.stroke()
  }
}
function drawSkin(ctx: Ctx, lm: LM[], w: number, h: number) {
  fillPoly(ctx, lm, FACE_OVAL, w, h)
}
// 안쪽 피부 평면(이마·양볼·코)만 — 얼굴 윤곽/턱선은 절대 건드리지 않게 내부에 한정.
// 잡티·점 제거(인페인팅)용. 가장자리는 호출부가 크게 페더링한다.
function ellipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number) {
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill()
}
function drawInnerSkin(ctx: Ctx, lm: LM[], w: number, h: number) {
  const fw = faceW(lm, w)
  const g = PT(lm, GLABELLA, w, h), top = PT(lm, FOREHEAD_TOP, w, h)
  const browSpan = Math.abs(lm[BROW_OUT_L].x - lm[BROW_OUT_R].x) * w
  // 이마: 미간(9)~이마(10) 사이 평면. 모자·그림자·헤어라인 침범을 막기 위해
  // 비중을 줄이고(작은 타원) 중심을 미간 쪽으로 더 내려 상단 안전거리를 확보한다.
  // 보정의 무게중심은 볼·코로 옮긴다(모자에 가장 적게 걸리는 영역).
  const foreheadY = g.y + (top.y - g.y) * 0.35 // 헤어라인(10)에서 더 아래로
  ellipse(ctx, (g.x + top.x) / 2, foreheadY, browSpan * 0.34, Math.abs(top.y - g.y) * 0.32)
  // 양 볼: 중앙쪽 평면(보정 핵심). 윤곽(234/454)에 못 미치는 반경.
  for (const ci of [CHEEK_L, CHEEK_R]) {
    const p = PT(lm, ci, w, h); ellipse(ctx, p.x, p.y, fw * 0.17, fw * 0.21)
  }
  // 콧대~코끝 평면
  const nb = PT(lm, NOSE_BRIDGE, w, h), nt = PT(lm, NOSE_TIP, w, h)
  ellipse(ctx, (nb.x + nt.x) / 2, (nb.y + nt.y) / 2, fw * 0.08, Math.abs(nt.y - nb.y) * 0.7)
}
// 스킨 마스크에서 눈·입(·눈썹)을 빼서(보존) 인페인팅 대상에서 제외.
function eraseFeatures(ctx: Ctx, lm: LM[], w: number, h: number, withBrows = false) {
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  drawLips(ctx, lm, w, h)
  fillPoly(ctx, lm, EYE_R, w, h)
  fillPoly(ctx, lm, EYE_L, w, h)
  if (withBrows) { ctx.strokeStyle = '#000'; drawBrows(ctx, lm, w, h) }
  ctx.restore()
}

export interface MaskOptions {
  /** 페더링(가장자리 블러) px. 기본 = faceW * 0.018 자동 */
  feather?: number
}

/**
 * 랜드마크 + maskAreas → 페더링된 마스크 캔버스.
 * 흰색(불투명) = 편집 영역, 검정 = 보존.
 */
export function buildMask(landmarks: LM[], w: number, h: number, areas: MakeupArea[], opts: MaskOptions = {}): HTMLCanvasElement {
  const lm = landmarks
  const feather = opts.feather ?? Math.max(3, faceW(lm, w) * 0.018)

  // 1) 하드엣지 도형을 임시 캔버스에 흰색으로 그린다.
  const tmp = document.createElement('canvas')
  tmp.width = w; tmp.height = h
  const tctx = tmp.getContext('2d') as Ctx
  tctx.fillStyle = '#fff'; tctx.strokeStyle = '#fff'

  if (areas.includes('skin')) {
    drawSkin(tctx, lm, w, h)
    eraseFeatures(tctx, lm, w, h) // 눈·입 보존(스타일이 명시 요청하면 아래서 되살림)
    tctx.globalCompositeOperation = 'source-over'
    tctx.fillStyle = '#fff'; tctx.strokeStyle = '#fff'
  }
  if (areas.includes('skinInner')) {
    drawInnerSkin(tctx, lm, w, h)
    eraseFeatures(tctx, lm, w, h, true) // 눈·입·눈썹 모두 보존(잡티 제거 대상에서 제외)
    tctx.globalCompositeOperation = 'source-over'
    tctx.fillStyle = '#fff'; tctx.strokeStyle = '#fff'
  }
  if (areas.includes('lips')) drawLips(tctx, lm, w, h)
  if (areas.includes('cheeks')) drawCheeks(tctx, lm, w, h)
  if (areas.includes('eyes')) drawEyes(tctx, lm, w, h)
  if (areas.includes('brows')) drawBrows(tctx, lm, w, h)

  // 2) 검정 배경 위에 페더링해서 최종 마스크.
  const out = document.createElement('canvas')
  out.width = w; out.height = h
  const octx = out.getContext('2d') as Ctx
  octx.fillStyle = '#000'; octx.fillRect(0, 0, w, h)
  octx.filter = `blur(${feather}px)`
  octx.drawImage(tmp, 0, 0)
  octx.filter = 'none'
  return out
}

/** 마스크 흰색 픽셀 비율(0~1) — 검증/로깅용. */
export function maskCoverage(mask: HTMLCanvasElement): number {
  const ctx = mask.getContext('2d', { willReadFrequently: true }) as Ctx
  const { data } = ctx.getImageData(0, 0, mask.width, mask.height)
  let on = 0
  const total = mask.width * mask.height
  for (let i = 0; i < data.length; i += 4) if (data[i] > 127) on++
  return total ? on / total : 0
}

/** 사진 위에 마스크(흰=편집) 영역만 색으로 덮은 디버그 오버레이(dataURL). */
export function buildDebugOverlay(img: HTMLImageElement | HTMLCanvasElement, mask: HTMLCanvasElement, tint = '#d8503c', alpha = 0.5): string {
  const w = mask.width, h = mask.height
  // 마스크는 흑백 모두 alpha=255(불투명)라 그대로 쓰면 전체가 칠해진다.
  // 흰색 명도를 alpha 로 옮겨(흰→불투명, 검정→투명) 흰 영역에만 tint 가 남게 한다.
  const tintC = document.createElement('canvas'); tintC.width = w; tintC.height = h
  const tc = tintC.getContext('2d') as Ctx
  tc.drawImage(mask, 0, 0)
  const g = tc.getImageData(0, 0, w, h)
  for (let i = 0; i < g.data.length; i += 4) g.data[i + 3] = g.data[i] // alpha = 흰색 명도(페더 보존)
  tc.putImageData(g, 0, 0)
  tc.globalCompositeOperation = 'source-in'
  tc.fillStyle = tint; tc.fillRect(0, 0, w, h)

  const out = document.createElement('canvas'); out.width = w; out.height = h
  const octx = out.getContext('2d') as Ctx
  octx.drawImage(img, 0, 0, w, h)
  octx.globalAlpha = alpha
  octx.drawImage(tintC, 0, 0)
  octx.globalAlpha = 1
  return out.toDataURL('image/jpeg', 0.9)
}

export interface MaskResult {
  ok: boolean
  /** 실패 사유: 'no-face'(얼굴 미검출) | 'side-angle'(측면 각도 초과) */
  reason?: 'no-face' | 'side-angle'
  /** 추정 yaw(도). 0 = 정면. side-angle 판정/튜닝용. */
  yawDeg?: number
  mask?: HTMLCanvasElement
  /** 디버그 오버레이(사진+마스크 색) dataURL */
  debug?: string
  coverage?: number
  w?: number
  h?: number
  /** 검출된 얼굴 랜드마크(정규화 0~1) — glow 레이어가 소비 */
  landmarks?: LM[]
}

/**
 * 이미지/캔버스 1장 검출 → maskAreas 마스크 생성(+디버그+랜드마크). 엔진은 호출부가 캐시해 넘긴다.
 */
export function detectAndBuildMask(engine: Engine, img: ImgSrc, areas: MakeupArea[], opts?: MaskOptions): MaskResult {
  const w = (img as HTMLImageElement).naturalWidth || img.width
  const h = (img as HTMLImageElement).naturalHeight || img.height
  const res = engine.faceLandmarker.detect(img)
  if (!res.faceLandmarks?.length) return { ok: false, reason: 'no-face' }
  const lm = res.faceLandmarks[0] as LM[]
  // 측면 각도 게이트: 정면에서 너무 벗어난 입력은 마스크가 어긋나므로 차단(비용 0).
  const mtx = res.facialTransformationMatrixes?.[0]?.data
  const yawDeg = mtx ? yawFromMatrix(mtx) : estimateYawDeg(lm)
  if (typeof console !== 'undefined')
    console.info('[maskBuilder] yawDeg=', yawDeg.toFixed(1), mtx ? '(matrix)' : '(landmark)')
  if (Math.abs(yawDeg) > YAW_LIMIT_DEG) return { ok: false, reason: 'side-angle', yawDeg, landmarks: lm }
  const mask = buildMask(lm, w, h, areas, opts)
  return { ok: true, mask, debug: buildDebugOverlay(img, mask), coverage: maskCoverage(mask), w, h, landmarks: lm, yawDeg }
}

/** white/black 마스크 → OpenAI images/edits 형식(편집부=투명 alpha0, 보존부=불투명). */
export function toOpenAIMask(mask: HTMLCanvasElement): HTMLCanvasElement {
  return remapAlpha(mask, (white) => 255 - white)
}
/** white/black 마스크 → 합성용 alpha 마스크(편집부=불투명, 페더 보존). */
export function toAlphaMask(mask: HTMLCanvasElement): HTMLCanvasElement {
  return remapAlpha(mask, (white) => white)
}
function remapAlpha(mask: HTMLCanvasElement, fn: (white: number) => number): HTMLCanvasElement {
  const w = mask.width, h = mask.height
  const out = document.createElement('canvas'); out.width = w; out.height = h
  const octx = out.getContext('2d') as Ctx
  octx.drawImage(mask, 0, 0)
  const g = octx.getImageData(0, 0, w, h)
  for (let i = 0; i < g.data.length; i += 4) { const v = g.data[i]; g.data[i] = 0; g.data[i + 1] = 0; g.data[i + 2] = 0; g.data[i + 3] = fn(v) }
  octx.putImageData(g, 0, 0)
  return out
}
