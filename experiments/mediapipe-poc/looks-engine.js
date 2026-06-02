// ════════════════════════════════════════════════════════════════════
// MediaPipe 메이크업 오버레이 엔진 (얼굴 100% 보존 — 원본 픽셀 위 합성)
// POC(index.html)에서 검증된 휘도보존 헤어 리컬러 + 튜닝값(립 alpha0.42 등) 반영.
// ════════════════════════════════════════════════════════════════════
import { FilesetResolver, FaceLandmarker, ImageSegmenter }
  from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18'
import { baseFor } from './looks-config.js'

const VER = '0.10.18'
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VER}/wasm`
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const SEG_MODEL  = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite'
const HAIR_CATEGORY = 1

// ── 랜드마크 인덱스 ──
const LIP_OUTER = [61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146]
const LIP_INNER = [78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95]
const CHEEK_L = 50, CHEEK_R = 280
const FACE_L = 234, FACE_R = 454
const LID_R  = [33,246,161,160,159,158,157,173,133]      // 이미지 좌측 눈 윗꺼풀
const LID_L  = [263,466,388,387,386,385,384,398,362]     // 이미지 우측 눈 윗꺼풀
const BROW_R = [70,63,105,66,107]
const BROW_L = [336,296,334,293,300]
const LOWER_R = [33,7,163,144,145,153,154,155,133]
const LOWER_L = [263,249,390,373,374,380,381,382,362]
// 광채(하이라이트) 포인트: [landmark, 반경계수]
const GLOW_PTS = [[9,0.17],[197,0.06],[4,0.05],[0,0.04],[117,0.10],[346,0.10],[152,0.06]]

const hex = (h) => { const n = parseInt(h.slice(1),16); return [n>>16&255, n>>8&255, n&255] }
const P = (lm,i,w,h) => ({ x: lm[i].x*w, y: lm[i].y*h })
const centroid = (lm,idx,w,h) => {
  let x=0,y=0; for(const i of idx){ x+=lm[i].x*w; y+=lm[i].y*h } return { x:x/idx.length, y:y/idx.length }
}
const faceW = (lm,w) => Math.abs(lm[FACE_R].x - lm[FACE_L].x) * w

// ── 모델 초기화 ──
export async function initEngine(onStatus = () => {}) {
  onStatus('FilesetResolver 로딩…')
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

// ── 레이어 함수 ──
function lipPath(ctx, lm, w, h) {
  ctx.beginPath()
  const ring = (idx) => { ctx.moveTo(lm[idx[0]].x*w, lm[idx[0]].y*h); for(let i=1;i<idx.length;i++) ctx.lineTo(lm[idx[i]].x*w, lm[idx[i]].y*h); ctx.closePath() }
  ring(LIP_OUTER); ring(LIP_INNER)
}

function applyLip(ctx, lm, w, h, { color, alpha, style }) {
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

function applyBlush(ctx, lm, w, h, { color, alpha }) {
  const [r,g,b] = hex(color); const rad = faceW(lm,w)*0.24
  for (const ci of [CHEEK_L, CHEEK_R]) {
    const cx = lm[ci].x*w, cy = lm[ci].y*h
    const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,rad)
    grd.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
    grd.addColorStop(0.5, `rgba(${r},${g},${b},${alpha*0.45})`)
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.filter='blur(6px)'
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,rad,0,Math.PI*2); ctx.fill(); ctx.restore()
  }
}

function applyHighlight(ctx, lm, w, h, intensity) {
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

function eyeShadowOneEye(ctx, lm, w, h, lid, brow, lower, opt) {
  const [r,g,b] = hex(opt.color)
  const lidC = centroid(lm, lid, w, h), browC = centroid(lm, brow, w, h)
  const up = { x: browC.x-lidC.x, y: browC.y-lidC.y }      // 꺼풀→눈썹 방향(기울기 대응)
  const s = opt.spread ?? 0.5
  ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.filter='blur(5px)'; ctx.globalAlpha=opt.alpha
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.beginPath()
  const lp = lid.map(i => P(lm,i,w,h))
  lp.forEach((p,k) => k? ctx.lineTo(p.x,p.y): ctx.moveTo(p.x,p.y))
  for (let k=lp.length-1;k>=0;k--){ const p=lp[k]; ctx.lineTo(p.x+up.x*s, p.y+up.y*s) }
  ctx.closePath(); ctx.fill()
  ctx.restore()
  if (opt.lower && lower) {                                // 스모키: 하단 라인
    ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.filter='blur(4px)'; ctx.globalAlpha=opt.alpha*0.6
    ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.beginPath()
    const dp = lower.map(i=>P(lm,i,w,h)); dp.forEach((p,k)=>k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y))
    for(let k=dp.length-1;k>=0;k--){ const p=dp[k]; ctx.lineTo(p.x-up.x*0.25, p.y-up.y*0.25) }
    ctx.closePath(); ctx.fill(); ctx.restore()
  }
  if (opt.shimmer) {                                       // 쉬머: 꺼풀 중앙 광
    const cx=lidC.x+up.x*0.35, cy=lidC.y+up.y*0.35, rad=faceW(lm,w)*0.05
    ctx.save(); ctx.globalCompositeOperation='screen'; ctx.filter='blur(3px)'
    const gl=ctx.createRadialGradient(cx,cy,0,cx,cy,rad)
    gl.addColorStop(0,'rgba(255,250,245,0.55)'); gl.addColorStop(1,'rgba(255,250,245,0)')
    ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(cx,cy,rad,0,Math.PI*2); ctx.fill(); ctx.restore()
  }
}
function applyEyeshadow(ctx, lm, w, h, opt) {
  eyeShadowOneEye(ctx, lm, w, h, LID_R, BROW_R, LOWER_R, opt)
  eyeShadowOneEye(ctx, lm, w, h, LID_L, BROW_L, LOWER_L, opt)
}

// 크라운(이마 위 정수리) 영역이 머리카락인지 모자인지 판정.
// 총 헤어% 는 짧은 머리 남성과 모자를 구분 못하므로(둘 다 낮음),
// "이마 바로 위"가 hair(1)냐 clothes/others(4/5)냐로 모자를 식별한다.
function crownHairFraction(md, mw, mh, lm) {
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
function applyHair(ctx, w, h, md, mw, mh, color) {
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
export async function renderLook(canvas, img, look, { faceLandmarker, segmenter }) {
  const w = img.naturalWidth||img.width, h = img.naturalHeight||img.height
  canvas.width=w; canvas.height=h
  const ctx = canvas.getContext('2d', { willReadFrequently:true })
  ctx.drawImage(img,0,0,w,h)                               // 1) 원본 = 얼굴 보존
  const report = { lookId: look.id, w, h, face:false, hairPct:null, hatWarning:false }

  const res = faceLandmarker.detect(img)
  if (!res.faceLandmarks?.length) { report.notes='얼굴 미검출'; return report }
  const lm = res.faceLandmarks[0]; report.face = true
  const base = baseFor(look.gender)

  // 2) 기본 베이스: 광채 + 블러셔 (항상)
  applyHighlight(ctx, lm, w, h, base.highlight + (look.highlightAdd||0))
  applyBlush(ctx, lm, w, h, look.blush || base.blush)
  // 3) 립 = 룩 지정 or 베이스(자연 혈색)
  applyLip(ctx, lm, w, h, look.lip || base.lip)
  // 4) 아이 포인트
  if (look.eyeshadow) applyEyeshadow(ctx, lm, w, h, look.eyeshadow)
  // 5) 헤어 룩이면 세그멘테이션 리컬러
  if (look.hair) {
    const seg = segmenter.segment(img); const m = seg.categoryMask
    const md = m.getAsUint8Array()
    const crown = crownHairFraction(md, m.width, m.height, lm)
    report.hairPct = applyHair(ctx, w, h, md, m.width, m.height, look.hair)
    report.crownHair = +crown.toFixed(2)
    m.close()
    // 이마 위가 거의 머리카락이 아니면(모자/두건, ≈0) → 헤어 컬러는 보이는 부분만.
    // 짧은 머리 남성(crown≈0.3)은 통과, 비니(crown≈0)만 경고.
    if (crown < 0.15) report.hatWarning = true
  }
  return report
}
