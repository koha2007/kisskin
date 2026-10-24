// 관상·사주 메이크업 카드 — 캔버스 직접 그리기 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 시안: casting/mockups/cards-young.html(A2 민화 팝) · photocard.html(관상 포카).
// 기존 결과 카드(src/lib/cardToPng.ts)처럼 html2canvas 없이 캔버스에 직접 그린다(의존성 0).
// ⚠ 얼굴 위에는 아무것도 올리지 않는다(운영자 10/21) — 스티커·배지·낙관은 사진 밖에만.
// 폰트: Song Myung(붓글씨 제목)·Gaegu(손글씨)·Pretendard(본문) — 페이지 Head 에서 로드.
import { ANIMALS, badgeSrc } from './animals'
import type { AnimalId } from './face'
import { FORTUNE_LOOKS, fortuneLookById, type FortuneLookId } from './looks'
import { ELEMENTS, STEMS_HANJA, type Element } from './saju'

export const OBANG: Record<Element, string> = {
  wood: '#1f6f8b', fire: '#d6402f', earth: '#f2b632', metal: '#f7f2e8', water: '#1b1b1f',
}
const HANJA: Record<Element, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' }
const STEM_ELEM_HANJA = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']
export const INK = '#1b1b1f', CREAM = '#f6eedc', RED = '#d6402f', YELLOW = '#f2b632'
export const SANS = "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif"
export const BRUSH = "'Song Myung', 'Nanum Myeongjo', serif"
export const HAND = "'Gaegu', 'Nanum Pen Script', cursive"

export interface CardData {
  isEn: boolean
  /** 셀카 또는 메이크업 결과(data URL). 없으면 오행 그림 */
  photo?: string
  animal?: AnimalId
  animalPct?: number
  second?: { id: AnimalId; pct: number }
  top: { id: FortuneLookId; score: number }[]
  counts?: Record<Element, number>
  lacking?: Element
  dayStem?: number
  serial: string
  /** 처방 룩(기본 = 1위 운) */
  look?: FortuneLookId
  /** 메이크업을 입힌 사진이면 true — 문구가 "처방" → "적용" */
  applied?: boolean
}

// text: 카드에 실제 그릴 글자. 구글 웹폰트는 글자 범위별 조각(unicode-range)이라
// 넘기지 않으면 일부 한글 조각이 늦게 와 대체 폰트로 찍힌다(10/22 '사람이' 깨짐).
export async function fonts(text?: string) {
  if (typeof document === 'undefined' || !document.fonts) return
  await Promise.all([
    document.fonts.load(`900 80px ${SANS}`, text), document.fonts.load(`700 40px ${SANS}`, text),
    document.fonts.load(`400 80px ${BRUSH}`, text), document.fonts.load(`700 40px ${HAND}`, text),
  ]).catch(() => {})
  await document.fonts.ready.catch(() => {})
}

export function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const im = new Image()
    im.crossOrigin = 'anonymous'
    im.onload = () => res(im)
    im.onerror = () => res(null)
    im.src = src
  })
}

export function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/** 사진을 상자에 꽉 채워 그리기(object-fit: cover, 얼굴 위쪽 기준) */
function cover(ctx: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number, focusY = 0.22) {
  const s = Math.max(w / im.naturalWidth, h / im.naturalHeight)
  const sw = w / s, sh = h / s
  const sx = (im.naturalWidth - sw) / 2
  const sy = Math.max(0, Math.min(im.naturalHeight - sh, im.naturalHeight * focusY - sh * focusY))
  ctx.drawImage(im, sx, sy, sw, sh, x, y, w, h)
}

export function sticker(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, rot: number, bg = '#fff') {
  ctx.save()
  ctx.translate(cx, cy); ctx.rotate(rot)
  ctx.font = `700 38px ${HAND}`
  const w = ctx.measureText(text).width + 56, h = 66
  ctx.fillStyle = INK; rr(ctx, -w / 2 + 8, -h / 2 + 8, w, h, h / 2); ctx.fill()
  ctx.fillStyle = bg; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill()
  ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke()
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 3)
  ctx.restore()
  return w
}

export function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, font: (px: number) => string, start: number, min = 20) {
  let px = start
  ctx.font = font(px)
  while (ctx.measureText(text).width > maxW && px > min) { px -= 2; ctx.font = font(px) }
  return px
}

/** 사진이 없을 때 — 오행 원형 그림 */
function drawElementsArt(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, counts?: Record<Element, number>, lacking?: Element) {
  ctx.fillStyle = '#efe4cc'; ctx.fillRect(x, y, w, h)
  const cx = x + w / 2, cy = y + h * 0.5, R = Math.min(w, h) * 0.32
  ELEMENTS.forEach((e, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R
    const n = counts?.[e] ?? 1
    const r = 52 + n * 16
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fillStyle = e === lacking ? 'transparent' : OBANG[e]; ctx.fill()
    ctx.lineWidth = 7; ctx.strokeStyle = e === lacking ? RED : INK
    if (e === lacking) ctx.setLineDash([16, 12])
    ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = e === 'metal' || e === 'earth' ? INK : e === lacking ? RED : '#fff'
    ctx.font = `400 ${r * 0.9}px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(HANJA[e], px, py + 4)
  })
}

// ════════════════════════════════════════════════════════════════════
// A2 — 결과 카드(인스타 스토리 1080×1920)
// ════════════════════════════════════════════════════════════════════
export async function renderResultCard(d: CardData): Promise<HTMLCanvasElement> {
  await fonts()
  const W = 1080, H = 1920
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  const ctx = cv.getContext('2d')!
  const a = d.animal ? ANIMALS[d.animal] : null
  const look = fortuneLookById(d.look ?? d.top[0]?.id ?? 'wealth')
  const [photo, badge] = await Promise.all([
    d.photo ? loadImg(d.photo) : Promise.resolve(null),
    d.animal ? loadImg(badgeSrc(d.animal)) : Promise.resolve(null),
  ])

  // 바탕(한지)
  ctx.fillStyle = CREAM; ctx.fillRect(0, 0, W, H)
  ctx.globalAlpha = 0.05; ctx.fillStyle = '#7a5a28'
  for (let x = 0; x < W; x += 21) ctx.fillRect(x, 0, 6, H)
  ctx.globalAlpha = 1
  // 해·달(일월오봉도)
  ctx.beginPath(); ctx.arc(110, 110, 52, 0, Math.PI * 2); ctx.fillStyle = '#f7f2e8'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke()
  ctx.beginPath(); ctx.arc(W - 110, 100, 66, 0, Math.PI * 2); ctx.fillStyle = RED; ctx.fill()

  // 제목
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
  const title = a ? (d.isEn ? `I'm a ${a.en}` : `나는 ${a.ko}`) : (d.isEn ? 'My Fortune Face' : '나의 관상·사주')
  const tpx = fitText(ctx, title, W - 340, (px) => `900 ${px}px ${SANS}`, 132, 60)
  const pre = a ? (d.isEn ? "I'm a " : '나는 ') : ''
  if (a) {
    const full = ctx.measureText(title).width, preW = ctx.measureText(pre).width
    const left = W / 2 - full / 2
    ctx.textAlign = 'left'
    ctx.fillStyle = INK; ctx.fillText(pre, left, 190)
    ctx.fillStyle = RED; ctx.fillText(d.isEn ? a.en : a.ko, left + preW, 190)
  } else { ctx.fillStyle = INK; ctx.fillText(title, W / 2, 190) }
  void tpx
  ctx.textAlign = 'center'
  ctx.font = `900 30px ${SANS}`; ctx.fillStyle = INK
  const kick = `KISSINSKIN ${d.isEn ? 'FACE READING' : '관상도'}${d.dayStem != null ? ` · ${STEMS_HANJA[d.dayStem]}${STEM_ELEM_HANJA[d.dayStem]}日生` : ''}`
  ctx.save(); ctx.letterSpacing = '8px'; ctx.fillText(kick, W / 2, 252); ctx.restore()

  // 사진(아치) — 얼굴 위에는 아무것도 올리지 않는다
  const px0 = 210, py0 = 300, pw = 660, ph = 786
  ctx.save()
  rr(ctx, px0, py0, pw, ph, [pw / 2, pw / 2, 54, 54]); ctx.clip()
  if (photo) cover(ctx, photo, px0, py0, pw, ph)
  else drawElementsArt(ctx, px0, py0, pw, ph, d.counts, d.lacking)
  ctx.restore()
  rr(ctx, px0, py0, pw, ph, [pw / 2, pw / 2, 54, 54]); ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.stroke()

  // 배지(왼쪽 아래 모서리 바깥) · 낙관(오른쪽 아래 바깥)
  if (badge) {
    ctx.save(); ctx.translate(120, 1000); ctx.rotate(-0.17)
    ctx.drawImage(badge, -110, -110, 220, 220); ctx.restore()
  }
  if (d.lacking) {
    ctx.save(); ctx.translate(W - 116, 1000); ctx.rotate(-0.14)
    ctx.fillStyle = INK; rr(ctx, -84, -84, 184, 184, 22); ctx.fill()
    ctx.fillStyle = RED; rr(ctx, -92, -92, 184, 184, 22); ctx.fill()
    ctx.strokeStyle = '#f7f2e8'; ctx.lineWidth = 6; rr(ctx, -80, -80, 160, 160, 14); ctx.stroke()
    ctx.fillStyle = '#f7f2e8'; ctx.font = `400 62px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(HANJA[d.lacking], 0, -30); ctx.fillText('補', 0, 38)
    ctx.restore()
  }

  // 스티커 줄(사진 아래)
  const t1 = d.top[0] ? fortuneLookById(d.top[0].id) : null
  const st: { t: string; bg: string }[] = []
  if (d.second && d.isEn) st.push({ t: `${ANIMALS[d.second.id].en} ${d.second.pct}%`, bg: '#fff' })
  if (d.second && !d.isEn) st.push({ t: `${ANIMALS[d.second.id].ko} ${d.second.pct}%`, bg: '#fff' })
  if (t1) st.push({ t: d.isEn ? `#1 ${t1.fortuneEn} ${t1.emoji}` : `${t1.fortuneKo} 1위 ${t1.emoji}`, bg: YELLOW })
  if (t1) st.push({ t: d.isEn ? t1.palaceEn.split(' · ')[1] + ' ✨' : t1.palaceKo.split(' · ')[0] + ' ✨', bg: '#fff' })
  const rots = [-0.06, 0.05, -0.03]
  ctx.font = `700 38px ${HAND}`
  const widths = st.map((s) => ctx.measureText(s.t).width + 56)
  const gap = 18, total = widths.reduce((x, y) => x + y, 0) + gap * (st.length - 1)
  let sx = W / 2 - total / 2
  st.forEach((s, i) => { sticker(ctx, s.t, sx + widths[i] / 2, 1150, rots[i], s.bg); sx += widths[i] + gap })

  // 오행 5칸(사주 있을 때) 또는 운 TOP3(사진만)
  const rowY = 1232, rowH = 168
  if (d.counts) {
    const bw = (W - 168 - 4 * 18) / 5
    ELEMENTS.forEach((e, i) => {
      const x = 84 + i * (bw + 18)
      const lack = e === d.lacking
      ctx.fillStyle = INK; rr(ctx, x + 8, rowY + 8, bw, rowH, 30); if (!lack) ctx.fill()
      ctx.fillStyle = lack ? CREAM : OBANG[e]; rr(ctx, x, rowY, bw, rowH, 30); ctx.fill()
      ctx.lineWidth = 7; ctx.strokeStyle = lack ? RED : INK; if (lack) ctx.setLineDash([18, 12]); ctx.stroke(); ctx.setLineDash([])
      const fg = lack ? RED : e === 'earth' || e === 'metal' ? INK : '#fff'
      ctx.fillStyle = fg; ctx.textAlign = 'center'
      ctx.font = `400 66px ${BRUSH}`; ctx.fillText(HANJA[e], x + bw / 2, rowY + 82)
      ctx.font = `900 34px ${SANS}`; ctx.fillText(lack ? (d.isEn ? `${d.counts![e]} · low` : `${d.counts![e]} · 부족`) : String(d.counts![e]), x + bw / 2, rowY + 136)
    })
  } else {
    const bw = (W - 168 - 2 * 24) / 3
    d.top.slice(0, 3).forEach((t, i) => {
      const lk = fortuneLookById(t.id), x = 84 + i * (bw + 24)
      ctx.fillStyle = INK; rr(ctx, x + 8, rowY + 8, bw, rowH, 30); ctx.fill()
      ctx.fillStyle = i === 0 ? RED : '#fff'; rr(ctx, x, rowY, bw, rowH, 30); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke()
      ctx.fillStyle = i === 0 ? '#fff' : INK; ctx.textAlign = 'center'
      ctx.font = `900 40px ${SANS}`; ctx.fillText(`${lk.emoji} ${d.isEn ? lk.fortuneEn : lk.fortuneKo}`, x + bw / 2, rowY + 76)
      ctx.font = `900 46px ${SANS}`; ctx.fillText(String(t.score), x + bw / 2, rowY + 136)
    })
  }

  // 처방 상자
  const bx = 84, by = 1420, bw2 = W - 168, bh = 236
  ctx.fillStyle = INK; rr(ctx, bx, by, bw2, bh, 42); ctx.fill()
  ctx.textAlign = 'left'; ctx.fillStyle = YELLOW
  ctx.save(); ctx.letterSpacing = '6px'
  ctx.font = `900 30px ${SANS}`
  ctx.fillText(d.applied ? (d.isEn ? 'APPLIED · LUCKY MAKEUP' : '적용 완료 · 럭키 메이크업') : (d.isEn ? 'MY LUCKY MAKEUP' : '나의 처방 · 럭키 메이크업'), bx + 52, by + 70)
  ctx.restore()
  ctx.fillStyle = CREAM
  fitText(ctx, d.isEn ? look.nameEn : look.nameKo, bw2 - 104, (px) => `900 ${px}px ${SANS}`, 66, 40)
  ctx.fillText(d.isEn ? look.nameEn : look.nameKo, bx + 52, by + 140)
  ctx.globalAlpha = 0.9
  fitText(ctx, d.isEn ? look.descEn : look.descKo, bw2 - 104, (px) => `500 ${px}px ${SANS}`, 34, 22)
  ctx.fillText(d.isEn ? look.descEn : look.descKo, bx + 52, by + 196)
  ctx.globalAlpha = 1

  // 산(일월오봉) + 바닥
  ctx.fillStyle = '#1f6f8b'
  ctx.beginPath(); ctx.moveTo(0, H)
  // 산은 처방 상자(…1656) 아래에서만 — 상자를 침범하지 않게
  const peaks = [[0, 1790], [120, 1730], [210, 1790], [330, 1712], [450, 1790], [540, 1700], [630, 1790], [750, 1718], [870, 1790], [960, 1736], [1080, 1790]]
  ctx.lineTo(0, 1790)
  for (let i = 1; i < peaks.length; i++) {
    const [x0, y0] = peaks[i - 1], [x1, y1] = peaks[i]
    ctx.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 24, x1, y1)
  }
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill()
  ctx.fillStyle = INK; ctx.fillRect(0, 1820, W, 100)
  ctx.fillStyle = CREAM; ctx.font = `900 30px ${SANS}`
  ctx.save(); ctx.letterSpacing = '5px'
  ctx.textAlign = 'left'; ctx.fillText(d.isEn ? 'PAINT YOUR FORTUNE' : '얼굴에 운을 그리다', 84, 1880)
  ctx.textAlign = 'right'; ctx.fillText('kissinskin.net', W - 84, 1880)
  ctx.restore()
  return cv
}

// ════════════════════════════════════════════════════════════════════
// 관상 포카 — 55×85mm 비율(990×1530), 앞면·뒷면
// ════════════════════════════════════════════════════════════════════
export const PC_W = 990, PC_H = 1530

export async function renderPhotocardFront(d: CardData): Promise<HTMLCanvasElement> {
  await fonts()
  const cv = document.createElement('canvas'); cv.width = PC_W; cv.height = PC_H
  const ctx = cv.getContext('2d')!
  const a = d.animal ? ANIMALS[d.animal] : null
  const [photo, badge] = await Promise.all([
    d.photo ? loadImg(d.photo) : Promise.resolve(null),
    d.animal ? loadImg(badgeSrc(d.animal)) : Promise.resolve(null),
  ])
  const R = 54
  ctx.save(); rr(ctx, 0, 0, PC_W, PC_H, R); ctx.clip()
  if (photo) cover(ctx, photo, 0, 0, PC_W, PC_H, 0.18)
  else drawElementsArt(ctx, 0, 0, PC_W, PC_H, d.counts, d.lacking)
  // 빛 반사
  const sh = ctx.createLinearGradient(0, 0, PC_W, PC_H)
  sh.addColorStop(0.3, 'rgba(255,255,255,0)'); sh.addColorStop(0.45, 'rgba(255,255,255,0.18)'); sh.addColorStop(0.6, 'rgba(255,255,255,0)')
  ctx.fillStyle = sh; ctx.fillRect(0, 0, PC_W, PC_H)
  // 아래 그늘(글자 자리) — 얼굴은 위쪽이라 가리지 않는다
  const fade = ctx.createLinearGradient(0, PC_H - 520, 0, PC_H)
  fade.addColorStop(0, 'rgba(27,27,31,0)'); fade.addColorStop(0.58, 'rgba(27,27,31,0.86)'); fade.addColorStop(1, 'rgba(27,27,31,0.92)')
  ctx.fillStyle = fade; ctx.fillRect(0, PC_H - 520, PC_W, 520)
  ctx.restore()

  // 홀로그램 테두리
  const holo = ctx.createLinearGradient(0, 0, PC_W, PC_H)
  ;['#ff9ec7', '#ffe58a', '#9ef0c8', '#8fd3ff', '#c7a6ff', '#ff9ec7'].forEach((c, i, arr) => holo.addColorStop(i / (arr.length - 1), c))
  ctx.lineWidth = 22; ctx.strokeStyle = holo; rr(ctx, 11, 11, PC_W - 22, PC_H - 22, R - 8); ctx.stroke()

  // 윗줄
  ctx.fillStyle = '#fff'; ctx.font = `700 27px ${SANS}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.save(); ctx.letterSpacing = '6px'; ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 8
  ctx.fillText(d.isEn ? 'KISSINSKIN FACE CARD' : 'KISSINSKIN 관상 포카', 56, 74); ctx.restore()
  ctx.font = `700 27px ${SANS}`
  const no = `No. ${d.serial}`, nw = ctx.measureText(no).width + 44
  ctx.fillStyle = 'rgba(27,27,31,.55)'; rr(ctx, PC_W - 56 - nw, 50, nw, 50, 25); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(no, PC_W - 56 - nw / 2, 76)

  // 이름
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  if (a) {
    ctx.fillStyle = YELLOW; ctx.font = `700 46px ${HAND}`
    ctx.fillText(d.isEn ? a.vibeEn : a.vibeKo, 60, PC_H - 300)
    ctx.fillStyle = '#fff'; ctx.font = `400 ${d.isEn ? 110 : 138}px ${BRUSH}`
    ctx.fillText(d.isEn ? a.en : a.ko, 56, PC_H - 170)
  } else {
    ctx.fillStyle = '#fff'; ctx.font = `400 110px ${BRUSH}`
    const t = d.top[0] ? fortuneLookById(d.top[0].id) : null
    ctx.fillText(t ? (d.isEn ? t.fortuneEn : t.fortuneKo) : '', 56, PC_H - 170)
  }
  ctx.font = `700 30px ${SANS}`; ctx.save(); ctx.letterSpacing = '9px'
  const sub = [a ? a.en.toUpperCase() : null, d.dayStem != null ? STEMS_HANJA[d.dayStem] + STEM_ELEM_HANJA[d.dayStem] : null, '2027'].filter(Boolean).join(' · ')
  ctx.fillText(sub, 62, PC_H - 112); ctx.restore()
  // 오행 점
  ELEMENTS.forEach((e, i) => {
    ctx.beginPath(); ctx.arc(76 + i * 46, PC_H - 62, 15, 0, Math.PI * 2)
    if (e !== d.lacking) { ctx.fillStyle = OBANG[e]; ctx.fill() }
    ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; if (e === d.lacking) ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([])
  })
  // 배지(오른쪽 아래, 얼굴 밖)
  if (badge) ctx.drawImage(badge, PC_W - 260, PC_H - 270, 200, 200)
  return cv
}

export async function renderPhotocardBack(d: CardData & { dex: AnimalId[]; secret?: boolean }): Promise<HTMLCanvasElement> {
  await fonts()
  const cv = document.createElement('canvas'); cv.width = PC_W; cv.height = PC_H
  const ctx = cv.getContext('2d')!
  const a = d.animal ? ANIMALS[d.animal] : null
  const ids: AnimalId[] = ['fox', 'cat', 'dog', 'rabbit', 'bear', 'deer', 'tiger', 'wolf', 'dino']
  const imgs = await Promise.all(ids.map((id) => loadImg(badgeSrc(id))))
  const secretImg = d.secret ? await loadImg(badgeSrc('secret-gumiho')) : null
  const R = 54
  ctx.save(); rr(ctx, 0, 0, PC_W, PC_H, R); ctx.clip()
  ctx.fillStyle = CREAM; ctx.fillRect(0, 0, PC_W, PC_H)
  // 색동 띠
  const saek = ['#d6402f', '#f2b632', '#2f8f5b', '#1f6f8b', '#f7f2e8', '#c2378f']
  for (let x = 0, i = 0; x < PC_W; x += 66, i++) {
    ctx.fillStyle = saek[i % saek.length]; ctx.fillRect(x, 0, 66, 90); ctx.fillRect(x, PC_H - 90, 66, 90)
  }
  ctx.restore()

  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
  const big = a ? imgs[ids.indexOf(a.id)] : null
  if (secretImg) ctx.drawImage(secretImg, PC_W / 2 - 120, 130, 240, 240)
  else if (big) ctx.drawImage(big, PC_W / 2 - 120, 130, 240, 240)
  ctx.fillStyle = INK; ctx.font = `700 24px ${SANS}`
  ctx.save(); ctx.letterSpacing = '6px'; ctx.globalAlpha = 0.6
  ctx.fillText(d.isEn ? 'FACE DEX · MINHWA ARCHETYPE' : '관상 도감 · MINHWA FACE ARCHETYPE', PC_W / 2, 420); ctx.restore()
  if (a) {
    ctx.font = `400 92px ${BRUSH}`; ctx.fillText(d.isEn ? a.en : a.ko, PC_W / 2, 510)
    ctx.font = `700 42px ${HAND}`; ctx.fillStyle = RED; ctx.fillText(`"${d.isEn ? a.quoteEn : a.quoteKo}"`, PC_W / 2, 572)
  }
  // 도감 3×3
  const gx = 70, gy = 620, cw = (PC_W - 140 - 2 * 24) / 3, ch = 200
  ids.forEach((id, i) => {
    const x = gx + (i % 3) * (cw + 24), y = gy + Math.floor(i / 3) * (ch + 22)
    const own = d.dex.includes(id)
    ctx.fillStyle = id === d.animal ? YELLOW : own ? '#fff' : 'transparent'
    rr(ctx, x, y, cw, ch, 28); ctx.fill()
    ctx.lineWidth = 6; ctx.strokeStyle = own ? INK : '#c9c2b4'; ctx.stroke()
    const im = imgs[i]
    if (im) {
      ctx.save(); if (!own) { ctx.filter = 'grayscale(0.85) brightness(1.1)'; ctx.globalAlpha = 0.45 }
      ctx.drawImage(im, x + cw / 2 - 62, y + 18, 124, 124); ctx.restore()
    }
    ctx.fillStyle = own ? INK : '#9a948a'; ctx.font = `700 30px ${SANS}`
    ctx.fillText(d.isEn ? ANIMALS[id].en.replace(' Face', '') : ANIMALS[id].ko, x + cw / 2, y + 180)
  })
  const n = ids.filter((id) => d.dex.includes(id)).length
  ctx.textAlign = 'left'; ctx.fillStyle = INK; ctx.font = `900 30px ${SANS}`
  ctx.fillText(`COLLECT ${n} / 9`, 70, 1360)
  ctx.fillStyle = RED; ctx.font = `700 28px ${SANS}`
  ctx.fillText(d.isEn ? 'Fill your dex with friends →' : '친구 상으로 도감 채우기 →', 70, 1402)
  ctx.textAlign = 'right'; ctx.fillStyle = INK; ctx.font = `700 28px ${SANS}`
  ctx.fillText('kissinskin.net', PC_W - 70, 1360); ctx.fillText(`No. ${d.serial}`, PC_W - 70, 1402)
  // 바코드
  let bx = PC_W / 2 - 80
  for (let i = 0; i < 26; i++) { const w = (i * 7 + Number(d.serial[i % 4] || 1)) % 3 + 2; ctx.fillStyle = INK; ctx.fillRect(bx, 1330, w, 80 - (i % 5) * 6); bx += w + 4 }
  return cv
}

export const ALL_LOOKS = FORTUNE_LOOKS
