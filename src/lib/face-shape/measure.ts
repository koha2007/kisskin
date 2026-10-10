// 셀카로 얼굴형 측정 — 2026-10-10 (운영자 요청 A·B).
// ────────────────────────────────────────────────────────────────────
// AI 메이크업이 이미 쓰는 MediaPipe FaceLandmarker(478점)를 **기기 안에서** 돌린다.
// 사진은 서버로 가지 않는다(비용 0, 개인정보 부담 0). CDN 동적 import 라 번들에 안 들어간다.
//
// 재는 것(모두 광대 너비로 나눈 비율 — 사진 크기·거리와 무관):
//   L  세로 비율   = 이마 위(10) ~ 턱 끝(152) / 광대 너비(234–454)
//   T  이마/턱     = 이마 너비(54–284) / 턱 너비(172–397)   — 하트형↑, 각진형↓
//   A  턱 각도     = 광대(234)–턱 모서리(172)–턱 끝(152) 각도 — 각진·둥근형↓(넓은 턱)
//
// ⚠ 정직하게: 얼굴 메시는 평균 얼굴로 끌려가는 성질이 있어 유형 간 차이가 작다
//   (2026-10-10 대표 사진 10장 실측: L 1.16~1.30, A 130~143°). 그래서 하나로 단정하지 않고
//   **가까운 정도(%)**로 보여준다(B). 기준점은 아래 PROTOTYPES — 대표 사진 두 세트(무드컷·DNA)
//   실측 평균. 실제 사용자 분포가 쌓이면 다시 맞출 것.
//   이마 위 기준점(10)은 헤어라인이 아니다 — 앞머리·각도에 덜 흔들리게 일부러 이걸 쓴다.
import type { FaceShapeCode } from './types'

const VER = '0.10.18'
const VISION = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VER}`
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

type LM = { x: number; y: number }
interface Landmarker { detect(img: HTMLImageElement | HTMLCanvasElement): { faceLandmarks?: LM[][] } }

let loading: Promise<Landmarker> | null = null
export function loadLandmarker(): Promise<Landmarker> {
  if (!loading) {
    loading = (async () => {
      const { FilesetResolver, FaceLandmarker } = await import(/* @vite-ignore */ VISION)
      const vision = await FilesetResolver.forVisionTasks(`${VISION}/wasm`)
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'CPU' },
        runningMode: 'IMAGE', numFaces: 2,
      }) as Promise<Landmarker>
    })()
    loading.catch(() => { loading = null })
  }
  return loading
}

export interface FaceFeatures { L: number; T: number; A: number }

/** 유형별 기준점 — 대표 사진 실측 평균(무드컷 5 + DNA 베이스 5, 2026-10-10) */
const PROTOTYPES: Record<FaceShapeCode, FaceFeatures> = {
  oval: { L: 1.23, T: 1.156, A: 137.9 },
  round: { L: 1.185, T: 1.115, A: 132.3 },
  square: { L: 1.195, T: 1.088, A: 134.6 },
  oblong: { L: 1.27, T: 1.14, A: 139.9 },
  heart: { L: 1.215, T: 1.163, A: 138.5 },
}
/** 축마다 "한 걸음" 크기 — 대표 사진 사이 간격 수준 */
const SCALE: FaceFeatures = { L: 0.03, T: 0.03, A: 3 }
/** 클수록 분포가 평평해진다(한 유형 몰아주기 방지) */
const TEMPERATURE = 1.6

export function features(lm: LM[], w: number, h: number): FaceFeatures {
  const P = (i: number) => ({ x: lm[i].x * w, y: lm[i].y * h })
  const d = (a: number, b: number) => Math.hypot(P(a).x - P(b).x, P(a).y - P(b).y)
  const cheek = d(234, 454)
  const A0 = P(234), O = P(172), B0 = P(152)
  const v1 = { x: A0.x - O.x, y: A0.y - O.y }, v2 = { x: B0.x - O.x, y: B0.y - O.y }
  const angle = (Math.acos((v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y))) * 180) / Math.PI
  return { L: d(10, 152) / cheek, T: d(54, 284) / d(172, 397), A: angle }
}

/** 각 유형까지의 가까운 정도(합 100, 정수) — 내림차순 */
export function shapeMix(f: FaceFeatures): { code: FaceShapeCode; pct: number }[] {
  const codes = Object.keys(PROTOTYPES) as FaceShapeCode[]
  const logits = codes.map((c) => {
    const p = PROTOTYPES[c]
    const dist2 = ((f.L - p.L) / SCALE.L) ** 2 + ((f.T - p.T) / SCALE.T) ** 2 + ((f.A - p.A) / SCALE.A) ** 2
    return -dist2 / (2 * TEMPERATURE)
  })
  const m = Math.max(...logits)
  const ex = logits.map((x) => Math.exp(x - m))
  const sum = ex.reduce((a, b) => a + b, 0)
  const raw = codes.map((c, i) => ({ code: c, v: (ex[i] / sum) * 100 }))
  // 반올림 후 합 100 맞추기(가장 큰 쪽에 보정)
  const out = raw.map((r) => ({ code: r.code, pct: Math.round(r.v) })).sort((a, b) => b.pct - a.pct)
  out[0].pct += 100 - out.reduce((a, b) => a + b.pct, 0)
  return out
}

/** 6문항 답 → 같은 형식의 비율(답한 횟수 비율) */
export function quizMix(answers: FaceShapeCode[]): { code: FaceShapeCode; pct: number }[] {
  const codes: FaceShapeCode[] = ['oval', 'round', 'square', 'oblong', 'heart']
  const n = answers.length || 1
  const out = codes.map((c) => ({ code: c, pct: Math.round((answers.filter((a) => a === c).length / n) * 100) }))
    .filter((x) => x.pct > 0).sort((a, b) => b.pct - a.pct)
  if (out.length) out[0].pct += 100 - out.reduce((a, b) => a + b.pct, 0)
  return out
}

export type ScanError = 'no-face' | 'many-faces' | 'tilted' | 'load-failed'

export interface ScanResult {
  features: FaceFeatures
  mix: { code: FaceShapeCode; pct: number }[]
  /** 측정선을 그린 사진(작은 JPEG data URL) — 결과 페이지에서 이 기기 안에서만 다시 보여준다 */
  overlay: string
}

/** 사진 한 장 → 측정. 사진은 이 함수 밖으로(서버로) 나가지 않는다. */
export async function scanFace(img: HTMLImageElement, labels: { length: string; forehead: string; cheek: string; jaw: string }): Promise<ScanResult | ScanError> {
  let lmk: Landmarker
  try { lmk = await loadLandmarker() } catch { return 'load-failed' }
  // 큰 사진은 줄여서(속도·메모리) 한 캔버스에서 측정과 그리기를 같이 한다
  const maxSide = 900
  const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s)
  const cv = document.createElement('canvas')
  cv.width = w; cv.height = h
  const ctx = cv.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  const faces = lmk.detect(cv).faceLandmarks ?? []
  if (faces.length === 0) return 'no-face'
  if (faces.length > 1) return 'many-faces'
  const lm = faces[0]
  // 고개가 많이 돌아가 있으면(양 광대에서 코까지 거리가 크게 다르면) 비율이 틀어진다
  const nose = lm[1].x, l = Math.abs(nose - lm[234].x), r = Math.abs(lm[454].x - nose)
  if (Math.min(l, r) / Math.max(l, r) < 0.6) return 'tilted'

  const f = features(lm, w, h)
  drawOverlay(ctx, lm, w, h, labels)
  // 얼굴 주변만 잘라 작게 저장(세션 저장소 용량)
  const xs = lm.map((p) => p.x * w), ys = lm.map((p) => p.y * h)
  const fx0 = Math.min(...xs), fx1 = Math.max(...xs), fy0 = Math.min(...ys), fy1 = Math.max(...ys)
  const pad = (fx1 - fx0) * 0.35
  const cx0 = Math.max(0, fx0 - pad), cy0 = Math.max(0, fy0 - pad * 1.2)
  const cw = Math.min(w, fx1 + pad) - cx0, ch = Math.min(h, fy1 + pad * 0.8) - cy0
  const out = document.createElement('canvas')
  const os = Math.min(1, 480 / cw)
  out.width = Math.round(cw * os); out.height = Math.round(ch * os)
  out.getContext('2d')!.drawImage(cv, cx0, cy0, cw, ch, 0, 0, out.width, out.height)
  return { features: f, mix: shapeMix(f), overlay: out.toDataURL('image/jpeg', 0.82) }
}

const OUTLINE = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]

function drawOverlay(ctx: CanvasRenderingContext2D, lm: LM[], w: number, h: number, labels: { length: string; forehead: string; cheek: string; jaw: string }) {
  const P = (i: number) => ({ x: lm[i].x * w, y: lm[i].y * h })
  const unit = Math.abs(P(454).x - P(234).x) / 100
  ctx.save()
  ctx.fillStyle = 'rgba(10,14,40,0.18)'
  ctx.fillRect(0, 0, w, h)
  // 얼굴 윤곽
  ctx.lineWidth = Math.max(2, unit * 0.8)
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.setLineDash([unit * 2, unit * 1.5])
  ctx.beginPath()
  OUTLINE.forEach((i, k) => (k ? ctx.lineTo(P(i).x, P(i).y) : ctx.moveTo(P(i).x, P(i).y)))
  ctx.closePath(); ctx.stroke()
  ctx.setLineDash([])
  const line = (a: number, b: number, color: string, label: string, dy = 0) => {
    const A = P(a), B = P(b)
    ctx.strokeStyle = color; ctx.fillStyle = color
    ctx.lineWidth = Math.max(2.5, unit * 1.1)
    ctx.beginPath(); ctx.moveTo(A.x, A.y + dy); ctx.lineTo(B.x, B.y + dy); ctx.stroke()
    for (const p of [A, B]) { ctx.beginPath(); ctx.arc(p.x, p.y + dy, Math.max(3, unit * 1.4), 0, Math.PI * 2); ctx.fill() }
    ctx.font = `700 ${Math.max(12, unit * 4.2)}px system-ui, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.lineWidth = Math.max(3, unit * 1.2); ctx.strokeStyle = 'rgba(10,14,40,0.75)'
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 + dy - unit * 1.5
    ctx.strokeText(label, mx, my); ctx.fillText(label, mx, my)
  }
  line(54, 284, '#ffd166', labels.forehead)
  line(234, 454, '#ff74a8', labels.cheek)
  line(172, 397, '#7bdff2', labels.jaw)
  // 세로
  const T = P(10), B = P(152)
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(2, unit * 0.9)
  ctx.beginPath(); ctx.moveTo(T.x, T.y); ctx.lineTo(B.x, B.y); ctx.stroke()
  ctx.font = `700 ${Math.max(12, unit * 4.2)}px system-ui, sans-serif`
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.lineWidth = Math.max(3, unit * 1.2); ctx.strokeStyle = 'rgba(10,14,40,0.75)'; ctx.fillStyle = '#fff'
  const ly = T.y + (B.y - T.y) * 0.18
  ctx.strokeText(labels.length, T.x + unit * 2, ly); ctx.fillText(labels.length, T.x + unit * 2, ly)
  ctx.restore()
}

// ── 결과 페이지로 넘기기(이 기기·이 탭 안에서만) ──
const KEY = 'fs:mix'
export interface StoredMix { source: 'scan' | 'quiz'; mix: { code: FaceShapeCode; pct: number }[]; features?: FaceFeatures; overlay?: string; at: number }

export function storeMix(m: Omit<StoredMix, 'at'>) {
  try { sessionStorage.setItem(KEY, JSON.stringify({ ...m, at: Date.now() })) } catch {
    // 용량 초과(사진) — 사진 없이라도 저장
    try { sessionStorage.setItem(KEY, JSON.stringify({ ...m, overlay: undefined, at: Date.now() })) } catch { /* 저장 불가 환경 */ }
  }
}
export function readMix(): StoredMix | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) || 'null') as StoredMix | null
    return v && Date.now() - v.at < 6 * 3600 * 1000 ? v : null
  } catch { return null }
}
