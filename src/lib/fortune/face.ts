// 셀카 → 관상 측정 → 동물상 9종 + 12궁 부위 점수 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 얼굴형 측정(src/lib/face-shape/measure.ts)과 같은 MediaPipe FaceLandmarker 를 **기기 안에서**
// 돌린다. 사진은 서버로 가지 않는다(비용 0, 개인정보 부담 0).
//
// 기준값(NORM) = 사이트 모델 사진 16명(88장) 실측, 2026-10-21.
//   사람 간 표준편차가 "같은 사람·다른 메이크업" 흔들림의 5~10배 → 메이크업에 흔들리지 않고
//   사람을 구분하는 수치다. ⚠ 표본이 작고 대부분 20대 여성 AI 모델이다 — 실사용 분포가 쌓이면
//   다시 맞출 것. 판정은 하나로 단정하지 않고 가까운 정도(%)로 보여 준다.
//
// 동물상·관상 풀이는 재미용이다(화면에 "재미로 보는 결과" 고지). 사람을 평가하는 말
// (신뢰 못 할 얼굴·범죄형 등)은 어디에도 쓰지 않는다.
import { loadLandmarker } from '../face-shape/measure'

type LM = { x: number; y: number }

export interface FaceMetrics {
  /** 눈꼬리 각도(°, 바깥쪽이 올라가면 +) */ tilt: number
  /** 눈 세로/가로 */ open: number
  /** 두 눈 사이 / 눈 가로 */ gap: number
  /** 얼굴 세로 / 광대 너비 */ L: number
  /** 턱 각도(°, 작을수록 넓고 각진 턱) */ A: number
  /** 콧방울 너비 / 광대 너비 */ nose: number
  /** 입술 두께 / 입 너비 */ lip: number
  /** 입 너비 / 광대 너비 */ mouth: number
  /** 이마 높이 / 얼굴 세로 */ fore: number
  /** 턱 길이 / 얼굴 세로 */ chin: number
  /** 미간 / 광대 너비 */ brow: number
}
export type MetricKey = keyof FaceMetrics

/** 2026-10-21 실측(16명) — [평균, 사람 간 표준편차] */
export const NORM: Record<MetricKey, [number, number]> = {
  tilt: [4.765, 2.093], open: [0.332, 0.0436], gap: [1.230, 0.0615], L: [1.2135, 0.0781],
  A: [137.54, 5.249], nose: [0.3005, 0.018], lip: [0.3483, 0.048], mouth: [0.4121, 0.0523],
  fore: [0.1875, 0.0107], chin: [0.2078, 0.0182], brow: [0.1957, 0.0109],
}

export function metrics(lm: LM[], w: number, h: number): FaceMetrics {
  const P = (i: number) => ({ x: lm[i].x * w, y: lm[i].y * h })
  const d = (a: number, b: number) => Math.hypot(P(a).x - P(b).x, P(a).y - P(b).y)
  const cheek = d(234, 454), face = d(10, 152)
  const tiltOf = (outer: number, inner: number) => {
    const o = P(outer), n = P(inner)
    return (Math.atan2(n.y - o.y, Math.abs(n.x - o.x)) * 180) / Math.PI
  }
  const ew = (d(33, 133) + d(362, 263)) / 2
  const A0 = P(234), O = P(172), B0 = P(152)
  const v1 = { x: A0.x - O.x, y: A0.y - O.y }, v2 = { x: B0.x - O.x, y: B0.y - O.y }
  const A = (Math.acos((v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y))) * 180) / Math.PI
  return {
    tilt: (tiltOf(33, 133) + tiltOf(263, 362)) / 2,
    open: (d(159, 145) + d(386, 374)) / 2 / ew,
    gap: d(133, 362) / ew,
    L: face / cheek, A,
    nose: d(129, 358) / cheek,
    lip: d(0, 17) / d(61, 291),
    mouth: d(61, 291) / cheek,
    fore: d(10, 9) / face,
    chin: d(17, 152) / face,
    brow: d(55, 285) / cheek,
  }
}

/** 기준 대비 몇 표준편차인지(±3 으로 자름) */
export function zScores(m: FaceMetrics): Record<MetricKey, number> {
  const out = {} as Record<MetricKey, number>
  for (const k of Object.keys(NORM) as MetricKey[]) {
    const [mu, sd] = NORM[k]
    out[k] = Math.max(-3, Math.min(3, (m[k] - mu) / sd))
  }
  return out
}

// ── 동물상 9종 ──
export type AnimalId = 'fox' | 'cat' | 'dog' | 'rabbit' | 'bear' | 'deer' | 'tiger' | 'wolf' | 'dino'
export const ANIMAL_IDS: AnimalId[] = ['fox', 'cat', 'dog', 'rabbit', 'bear', 'deer', 'tiger', 'wolf', 'dino']

/**
 * 동물상 = 두 축의 3×3 격자 — "왜 이 동물인지"를 한 줄로 설명할 수 있게.
 *   X 눈매   = (눈꼬리 각도 − 눈 크기)   : −순하고 둥근 눈 ↔ +날카롭고 올라간 눈
 *   Y 이목구비 = (코 너비 + 입 너비 − 턱 각도) : −섬세 ↔ +굵직(넓은 코·입, 넓고 각진 턱)
 *
 *              순한 눈   중간     날카로운 눈
 *   섬세        토끼     사슴     여우
 *   중간        강아지   고양이   늑대
 *   굵직        곰       공룡     호랑이
 *
 * 격자 간격(STEP)은 실측 16명의 X·Y 퍼짐에 맞춰 9종이 고르게 나오도록 잡았다.
 * 비율(%)은 각 칸 중심까지 거리로 부드럽게 나눈다(이웃 동물이 2·3위로 자연스럽게 나옴).
 */
const GRID: Record<AnimalId, [number, number]> = {
  rabbit: [-1, -1], deer: [0, -1], fox: [1, -1],
  dog: [-1, 0], cat: [0, 0], wolf: [1, 0],
  bear: [-1, 1], dino: [0, 1], tiger: [1, 1],
}
const STEP_X = 0.6   // 실측 X 표준편차 0.67 × 0.86(정규분포 3등분 경계 ±0.43σ)
const STEP_Y = 1.2   // 실측 Y 표준편차 1.39 × 0.86
const TEMP = 0.35

export function faceAxes(z: Record<MetricKey, number>): { x: number; y: number } {
  return { x: (z.tilt - z.open) / Math.SQRT2, y: (z.nose + z.mouth - z.A) / Math.sqrt(3) }
}

/** 동물상 비율(합 100, 내림차순) */
export function animalMix(z: Record<MetricKey, number>): { id: AnimalId; pct: number }[] {
  const { x, y } = faceAxes(z)
  const logits = ANIMAL_IDS.map((id) => {
    const [gx, gy] = GRID[id]
    return -(((x / STEP_X - gx) ** 2) + ((y / STEP_Y - gy) ** 2)) / TEMP
  })
  const m = Math.max(...logits)
  const ex = logits.map((v) => Math.exp(v - m))
  const sum = ex.reduce((a, b) => a + b, 0)
  const out = ANIMAL_IDS.map((id, i) => ({ id, pct: Math.round((ex[i] / sum) * 100) })).sort((a, b) => b.pct - a.pct)
  out[0].pct += 100 - out.reduce((a, b) => a + b.pct, 0)
  return out
}

export type FaceScanError = 'no-face' | 'many-faces' | 'tilted' | 'load-failed'
export interface FaceScan { metrics: FaceMetrics; z: Record<MetricKey, number>; animals: { id: AnimalId; pct: number }[] }

/** 사진 한 장 → 관상 측정. 사진은 이 함수 밖으로(서버로) 나가지 않는다. */
export async function scanFortuneFace(img: HTMLImageElement): Promise<FaceScan | FaceScanError> {
  let lmk: Awaited<ReturnType<typeof loadLandmarker>>
  try { lmk = await loadLandmarker() } catch { return 'load-failed' }
  const maxSide = 900
  const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s)
  const cv = document.createElement('canvas')
  cv.width = w; cv.height = h
  cv.getContext('2d')!.drawImage(img, 0, 0, w, h)
  const faces = lmk.detect(cv).faceLandmarks ?? []
  if (faces.length === 0) return 'no-face'
  if (faces.length > 1) return 'many-faces'
  const lm = faces[0]
  const nose = lm[1].x, l = Math.abs(nose - lm[234].x), r = Math.abs(lm[454].x - nose)
  if (Math.min(l, r) / Math.max(l, r) < 0.6) return 'tilted'
  const m = metrics(lm, w, h)
  const z = zScores(m)
  return { metrics: m, z, animals: animalMix(z) }
}
