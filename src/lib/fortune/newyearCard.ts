// 2027 신년 부적 카드 · 오복 모아보기 — 캔버스 직접 그리기 (2026-10-22)
// ────────────────────────────────────────────────────────────────────
// 디자인 = A2 민화 팝 신년판: 붉은 바탕 + 노란 부적 종이(괴황지) + 붉은 붓글씨 한 글자,
//   먹선·오프셋 그림자 스티커, 붉은 양 민화 배지(public/fortune/badges/goat-2027.webp).
// 카드(1080×1920, 스토리)는 생년월일만으로 그린다(사진 없음 → 얼굴 가림 문제 없음).
// 모아보기(1080×1620, 2×3)는 오복 메이크업 5장 + 부적 칸 — 사진 위에는 이름표만 아래쪽에.
import { fonts, loadImg, rr, fitText, INK, CREAM, RED, YELLOW, SANS, BRUSH, HAND } from './card'
import { ONE_CHAR, YEAR_TYPES, BLESSING_TEXT, LUCKY, MONTH_THEME, zodiacLine, type NewYearCard } from './newyear'
import type { FortuneLookId } from './looks'

export const GOAT_BADGE = '/fortune/badges/goat-2027.webp'
const PAPER = '#f5d548', DEEP = '#a8231b'

function bg(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = RED; ctx.fillRect(0, 0, W, H)
  // 운문(구름) 점무늬 — 은은하게
  ctx.fillStyle = DEEP
  for (let y = 30; y < H; y += 90) for (let x = (y / 90) % 2 ? 45 : 0; x < W; x += 90) {
    ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill()
  }
}

function footer(ctx: CanvasRenderingContext2D, W: number, H: number, isEn: boolean) {
  ctx.fillStyle = INK; ctx.fillRect(0, H - 100, W, 100)
  ctx.fillStyle = CREAM; ctx.font = `900 30px ${SANS}`; ctx.textBaseline = 'alphabetic'
  ctx.save(); ctx.letterSpacing = '5px'
  ctx.textAlign = 'left'; ctx.fillText(isEn ? 'PAINT YOUR FORTUNE' : '얼굴에 운을 그리다', 84, H - 40)
  ctx.textAlign = 'right'; ctx.fillText('kissinskin.net', W - 84, H - 40)
  ctx.restore()
}

// ════════════════════════════════════════════════════════════════════
// 신년 부적 카드(무료) — 1080×1920
// ════════════════════════════════════════════════════════════════════
export async function renderNewYearCard(c: NewYearCard, isEn: boolean): Promise<HTMLCanvasElement> {
  const ch0 = ONE_CHAR[c.tenGod]
  await fonts([ch0.hanja, ch0.ko, ch0.en, ch0.lineKo, ch0.lineEn, zodiacLine(c.zodiac, isEn), YEAR_TYPES[c.group].ko, YEAR_TYPES[c.group].en, LUCKY[c.lucky].ko, LUCKY[c.lucky].makeupKo, LUCKY[c.lucky].makeupEn, '올해의한글자오복순위재물연애직업건강인복행운색좋은달쉬어가는월얼굴에운을그리다신년부적붉은양의해丁未年人壽官緣財'].join(''))
  const W = 1080, H = 1920
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  const ctx = cv.getContext('2d')!
  const goat = await loadImg(GOAT_BADGE)
  const ch = ONE_CHAR[c.tenGod], T = YEAR_TYPES[c.group], L = LUCKY[c.lucky]
  bg(ctx, W, H)

  // 머리줄
  ctx.textBaseline = 'alphabetic'; ctx.fillStyle = YELLOW; ctx.font = `900 30px ${SANS}`
  ctx.save(); ctx.letterSpacing = '8px'; ctx.textAlign = 'left'
  ctx.fillText(isEn ? '2027 · YEAR OF THE FIRE GOAT' : '2027 丁未年 · 붉은 양의 해', 84, 112); ctx.restore()
  ctx.fillStyle = CREAM; ctx.font = `700 26px ${SANS}`; ctx.textAlign = 'left'
  ctx.save(); ctx.letterSpacing = '6px'
  ctx.fillText(isEn ? 'KISSINSKIN LUCKY TALISMAN' : 'KISSINSKIN 신년 부적', 84, 156); ctx.restore()

  // 부적 종이
  const px = 84, py = 210, pw = W - 168, ph = 900
  ctx.fillStyle = INK; rr(ctx, px + 14, py + 14, pw, ph, 28); ctx.fill()
  ctx.fillStyle = PAPER; rr(ctx, px, py, pw, ph, 28); ctx.fill()
  ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke()
  // 종이 결
  ctx.save(); rr(ctx, px, py, pw, ph, 28); ctx.clip()
  ctx.globalAlpha = 0.07; ctx.fillStyle = '#7a5a28'
  for (let y = py; y < py + ph; y += 17) ctx.fillRect(px, y, pw, 5)
  ctx.restore()
  // 붉은 이중 테두리
  ctx.strokeStyle = RED; ctx.lineWidth = 8; rr(ctx, px + 34, py + 34, pw - 68, ph - 68, 12); ctx.stroke()
  ctx.lineWidth = 3; rr(ctx, px + 50, py + 50, pw - 100, ph - 100, 8); ctx.stroke()

  ctx.textAlign = 'center'; ctx.fillStyle = RED
  ctx.font = `900 30px ${SANS}`
  ctx.save(); ctx.letterSpacing = '10px'
  ctx.fillText(isEn ? 'MY WORD FOR 2027' : '올해의 한 글자', W / 2 - 60, py + 120); ctx.restore()
  // 한 글자 — 붓글씨, 살짝 번진 그림자
  ctx.save()
  ctx.font = `400 430px ${BRUSH}`; ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(168,35,27,.25)'; ctx.fillText(ch.hanja, W / 2 + 10, py + 420 + 10)
  ctx.fillStyle = RED; ctx.fillText(ch.hanja, W / 2, py + 420)
  ctx.restore()
  ctx.textBaseline = 'alphabetic'; ctx.fillStyle = INK
  ctx.font = `400 64px ${BRUSH}`; ctx.fillText(isEn ? ch.en : ch.ko, W / 2, py + 700)
  ctx.font = `700 50px ${HAND}`
  fitText(ctx, isEn ? ch.lineEn : ch.lineKo, pw - 160, (n) => `700 ${n}px ${HAND}`, 50, 30)
  ctx.fillText(isEn ? ch.lineEn : ch.lineKo, W / 2, py + 768)
  ctx.font = `700 28px ${SANS}`; ctx.globalAlpha = 0.7
  fitText(ctx, zodiacLine(c.zodiac, isEn), pw - 160, (n) => `700 ${n}px ${SANS}`, 28, 20)
  ctx.fillText(zodiacLine(c.zodiac, isEn), W / 2, py + 818); ctx.globalAlpha = 1

  // 붉은 양 배지(종이 오른쪽 위 모서리에 걸침 — 부적 글자는 가리지 않는다)
  if (goat) {
    ctx.save(); ctx.translate(W - 150, py + 70); ctx.rotate(0.12)
    ctx.drawImage(goat, -125, -125, 250, 250); ctx.restore()
  }

  // 신년 유형 스티커(종이 아래 가장자리에 걸침)
  ctx.save()
  const label = `${T.emoji} ${isEn ? T.en : T.ko}`
  ctx.translate(W / 2, py + ph + 6); ctx.rotate(-0.03)
  ctx.font = `900 58px ${SANS}`
  const sw = ctx.measureText(label).width + 90, sh = 110
  ctx.fillStyle = INK; rr(ctx, -sw / 2 + 10, -sh / 2 + 10, sw, sh, sh / 2); ctx.fill()
  ctx.fillStyle = CREAM; rr(ctx, -sw / 2, -sh / 2, sw, sh, sh / 2); ctx.fill()
  ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke()
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 4)
  ctx.restore()

  // 오복 순위
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillStyle = YELLOW; ctx.font = `900 28px ${SANS}`
  ctx.save(); ctx.letterSpacing = '6px'; ctx.fillText(isEn ? 'FIVE BLESSINGS · 2027' : '오복 순위 · 2027', 84, 1250); ctx.restore()
  const cw = (W - 168) / 5
  c.blessings.forEach((b, i) => {
    const bt = BLESSING_TEXT[b.id], cx = 84 + cw * i + cw / 2, cy = 1350, r = i === 0 ? 76 : 64
    ctx.beginPath(); ctx.arc(cx + 6, cy + 6, r, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill()
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = i === 0 ? YELLOW : CREAM; ctx.fill()
    ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke()
    ctx.fillStyle = i === 0 ? RED : INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.font = `400 ${i === 0 ? 84 : 66}px ${BRUSH}`; ctx.fillText(bt.hanja, cx, cy + 4)
    ctx.textBaseline = 'alphabetic'; ctx.fillStyle = CREAM
    ctx.font = `900 28px ${SANS}`; ctx.fillText(isEn ? bt.en : bt.ko, cx, cy + r + 46)
    ctx.font = `900 34px ${SANS}`; ctx.fillStyle = i === 0 ? YELLOW : CREAM; ctx.fillText(String(b.score), cx, cy + r + 86)
    if (i === 0) { ctx.save(); ctx.translate(cx + 58, cy - 62); ctx.rotate(0.2); ctx.font = '44px serif'; ctx.fillText('👑', 0, 0); ctx.restore() }
  })

  // 행운색 · 행운 메이크업
  const ly = 1530, lh = 120
  ctx.fillStyle = INK; rr(ctx, 84 + 8, ly + 8, W - 168, lh, 30); ctx.fill()
  ctx.fillStyle = CREAM; rr(ctx, 84, ly, W - 168, lh, 30); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke()
  ctx.beginPath(); ctx.arc(84 + 70, ly + lh / 2, 38, 0, Math.PI * 2); ctx.fillStyle = L.hex; ctx.fill(); ctx.lineWidth = 6; ctx.stroke()
  ctx.textAlign = 'left'; ctx.fillStyle = RED; ctx.font = `900 26px ${SANS}`
  ctx.fillText(isEn ? `LUCKY COLOUR · ${L.en.toUpperCase()}` : `행운색 · ${L.ko}`, 84 + 130, ly + 48)
  ctx.fillStyle = INK
  fitText(ctx, isEn ? L.makeupEn : L.makeupKo, W - 168 - 160, (n) => `800 ${n}px ${SANS}`, 36, 22)
  ctx.fillText(isEn ? L.makeupEn : L.makeupKo, 84 + 130, ly + 94)

  // 12달
  const my = 1690, mw = (W - 168 - 11 * 8) / 12
  for (let m = 1; m <= 12; m++) {
    const x = 84 + (m - 1) * (mw + 8), good = c.good.includes(m), rest = c.rest === m
    ctx.fillStyle = good ? YELLOW : rest ? 'transparent' : DEEP
    rr(ctx, x, my, mw, 86, 14); ctx.fill()
    ctx.lineWidth = 4; ctx.strokeStyle = good ? INK : CREAM
    if (rest) ctx.setLineDash([8, 6]); if (good || rest) ctx.stroke(); ctx.setLineDash([])
    ctx.textAlign = 'center'; ctx.fillStyle = good ? INK : CREAM
    ctx.font = `900 32px ${SANS}`; ctx.fillText(String(m), x + mw / 2, my + 42)
    ctx.font = `900 20px ${SANS}`; ctx.fillText(good ? '★' : rest ? (isEn ? 'REST' : '쉼') : '', x + mw / 2, my + 72)
  }
  ctx.textAlign = 'left'; ctx.fillStyle = CREAM; ctx.font = `700 24px ${SANS}`
  const goodTxt = isEn ? `Best months ${c.good.join(' · ')} · Slow down in ${c.rest}` : `좋은 달 ${c.good.join('·')}월 · 쉬어 가는 달 ${c.rest}월`
  ctx.fillText(goodTxt, 84, my - 18)
  ctx.textAlign = 'right'; ctx.fillText(`No. ${c.serial}`, W - 84, my - 18)

  footer(ctx, W, H, isEn)
  return cv
}

// ════════════════════════════════════════════════════════════════════
// 오복 모아보기 — 1080×1620(2×3): 메이크업 5장 + 부적 칸
// ════════════════════════════════════════════════════════════════════
function coverDraw(ctx: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number, focusY = 0.22) {
  const s = Math.max(w / im.naturalWidth, h / im.naturalHeight)
  const sw = w / s, sh = h / s
  const sx = (im.naturalWidth - sw) / 2
  const sy = Math.max(0, Math.min(im.naturalHeight - sh, im.naturalHeight * focusY - sh * focusY))
  ctx.drawImage(im, sx, sy, sw, sh, x, y, w, h)
}

export async function renderBlessingsBoard(c: NewYearCard, images: Partial<Record<FortuneLookId, string>>, isEn: boolean): Promise<HTMLCanvasElement> {
  const ch0 = ONE_CHAR[c.tenGod]
  await fonts([ch0.hanja, ch0.ko, ch0.en, YEAR_TYPES[c.group].ko, YEAR_TYPES[c.group].en, LUCKY[c.lucky].ko, MONTH_THEME[c.group].en, '나의오복메이크업아직붉은양의해丁未年人壽官緣財재물연애직업건강인복'].join(''))
  const W = 1080, H = 1620
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  const ctx = cv.getContext('2d')!
  bg(ctx, W, H)
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center'; ctx.fillStyle = YELLOW
  ctx.font = `900 28px ${SANS}`
  ctx.save(); ctx.letterSpacing = '8px'; ctx.fillText(isEn ? '2027 · YEAR OF THE FIRE GOAT' : '2027 丁未年 · 붉은 양의 해', W / 2, 80); ctx.restore()
  ctx.fillStyle = CREAM; ctx.font = `400 84px ${BRUSH}`
  ctx.fillText(isEn ? 'My Five Blessings' : '나의 오복 메이크업', W / 2, 172)

  const order = c.blessings.map((b) => b.id)
  const gx = 60, gy = 220, gap = 20, cw = (W - gx * 2 - gap) / 2, chh = (H - gy - 120 - gap * 2) / 3
  const imgs = await Promise.all(order.map((id) => (images[id] ? loadImg(images[id]!) : Promise.resolve(null))))
  const goat = await loadImg(GOAT_BADGE)
  for (let i = 0; i < 6; i++) {
    const x = gx + (i % 2) * (cw + gap), y = gy + Math.floor(i / 2) * (chh + gap)
    ctx.fillStyle = INK; rr(ctx, x + 8, y + 8, cw, chh, 26); ctx.fill()
    if (i < 5) {
      const id = order[i], bt = BLESSING_TEXT[id], im = imgs[i]
      ctx.save(); rr(ctx, x, y, cw, chh, 26); ctx.clip()
      if (im) coverDraw(ctx, im, x, y, cw, chh)
      else {
        ctx.fillStyle = DEEP; ctx.fillRect(x, y, cw, chh)
        ctx.fillStyle = 'rgba(246,238,220,.35)'; ctx.font = `400 200px ${BRUSH}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(bt.hanja, x + cw / 2, y + chh / 2 - 20); ctx.textBaseline = 'alphabetic'
      }
      // 이름표(아래쪽 — 얼굴 위에는 올리지 않는다)
      const fade = ctx.createLinearGradient(0, y + chh - 140, 0, y + chh)
      fade.addColorStop(0, 'rgba(27,27,31,0)'); fade.addColorStop(1, 'rgba(27,27,31,.85)')
      ctx.fillStyle = fade; ctx.fillRect(x, y + chh - 140, cw, 140)
      ctx.restore()
      rr(ctx, x, y, cw, chh, 26); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke()
      ctx.textAlign = 'left'; ctx.fillStyle = YELLOW; ctx.font = `400 58px ${BRUSH}`
      ctx.fillText(bt.hanja, x + 24, y + chh - 26)
      ctx.fillStyle = CREAM; ctx.font = `900 34px ${SANS}`
      ctx.fillText(isEn ? bt.en : bt.ko, x + 96, y + chh - 34)
      if (!im) { ctx.textAlign = 'right'; ctx.font = `700 24px ${SANS}`; ctx.fillText(isEn ? 'not yet' : '아직', x + cw - 24, y + chh - 34) }
    } else {
      ctx.fillStyle = PAPER; rr(ctx, x, y, cw, chh, 26); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke()
      ctx.strokeStyle = RED; ctx.lineWidth = 5; rr(ctx, x + 20, y + 20, cw - 40, chh - 40, 10); ctx.stroke()
      if (goat) ctx.drawImage(goat, x + cw / 2 - 110, y + 40, 220, 220)
      const ch = ONE_CHAR[c.tenGod]
      ctx.textAlign = 'center'; ctx.fillStyle = RED; ctx.font = `400 64px ${BRUSH}`
      ctx.fillText(`${ch.hanja} · ${isEn ? ch.en : ch.ko}`, x + cw / 2, y + 330)
      ctx.fillStyle = INK; ctx.font = `900 30px ${SANS}`
      ctx.fillText(`${YEAR_TYPES[c.group].emoji} ${isEn ? YEAR_TYPES[c.group].en : YEAR_TYPES[c.group].ko}`, x + cw / 2, y + 382)
      ctx.font = `700 24px ${SANS}`; ctx.globalAlpha = 0.7
      ctx.fillText(isEn ? MONTH_THEME[c.group].en : `${LUCKY[c.lucky].ko} · No. ${c.serial}`, x + cw / 2, y + 420); ctx.globalAlpha = 1
    }
  }
  footer(ctx, W, H, isEn)
  return cv
}
