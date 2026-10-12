// 9룩 컬렉션 → 3×3 모아보기 한 장 (2026-10-12)
// ────────────────────────────────────────────────────────────────────
// 1080×1920(9:16) — 스토리·릴스·틱톡에 그대로 올리는 크기. 단일 룩 합성(composite.ts)과 같은
// 흰 종이 + 네이비 글자 + 로고 록업 문법.
//
// 왜 이런 구성인가(Lensa·Spotify Wrapped 벤치마크): 사람들은 앱이 아니라 **나**를 자랑하려고
// 올린다. 그래서 ① 맨얼굴(비포)은 넣지 않고 ② "나한테 제일 어울리는 건?" 질문 + 칸마다 번호를
// 달아 친구들이 번호로 댓글 투표하게 한다(댓글이 게시물을 더 퍼뜨린다). 브랜드는 아래 작게.
//
// 칸 = 3:4 세로. 결과는 셀카 비율을 따르므로(size=auto) 칸에는 cover 로 채우고, 얼굴이
// 위쪽에 있는 셀카가 많아 크롭 기준을 위로 올린다(FOCUS_Y). 전부 캔버스 로컬 연산 — 비용 0.
import type { MakeupStyle } from './styles'

const W = 1080
const H = 1920
const PAD = 36
const GAP = 12
const TILE_W = Math.floor((W - PAD * 2 - GAP * 2) / 3) // 328
const TILE_H = Math.round((TILE_W * 4) / 3)            // 437
const GRID_TOP = 330
const FOCUS_Y = 0.3

const FONT = '"Pretendard Variable", Pretendard, system-ui, sans-serif'
const INK = '#070953'
const MUTED = '#475569'
const PINK = '#c9304a' // primary-dark — 흰 바탕 위 글자는 원색 대신 진한 쪽(대비 규칙)

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}

export async function buildCollectionGrid(
  looks: { style: MakeupStyle; image: string }[],
  isEn: boolean,
): Promise<HTMLCanvasElement> {
  const imgs = await Promise.all(looks.map((l) => loadImage(l.image)))
  let logo: HTMLImageElement | null = null
  try { logo = await loadImage('/logo.png') } catch { /* 로고 없이도 그린다 */ }
  try { await Promise.all([document.fonts?.load(`800 64px "Pretendard Variable"`), document.fonts?.load(`500 32px "Pretendard Variable"`)]) } catch { /* 폴백 폰트로 그린다 */ }

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // ── 머리글 — 질문이 주인공
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = PINK
  ctx.font = `800 30px ${FONT}`
  ctx.fillText(isEn ? 'MY 9 LOOKS' : 'MY 9 LOOKS · 나의 9룩', W / 2, 118)
  ctx.fillStyle = INK
  ctx.font = `800 66px ${FONT}`
  ctx.fillText(isEn ? 'Which one suits me?' : '나한테 제일 어울리는 건?', W / 2, 198, W - PAD * 2)
  ctx.fillStyle = MUTED
  ctx.font = `500 32px ${FONT}`
  ctx.fillText(isEn ? 'Comment your pick by number 👇' : '번호로 댓글 남겨줘 👇', W / 2, 268)

  // ── 3×3 칸
  imgs.forEach((img, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = PAD + col * (TILE_W + GAP)
    const y = GRID_TOP + row * (TILE_H + GAP)

    ctx.save()
    roundRect(ctx, x, y, TILE_W, TILE_H, 18)
    ctx.clip()
    const scale = Math.max(TILE_W / img.naturalWidth, TILE_H / img.naturalHeight)
    const sw = TILE_W / scale
    const sh = TILE_H / scale
    const sx = (img.naturalWidth - sw) / 2
    const sy = (img.naturalHeight - sh) * FOCUS_Y
    ctx.drawImage(img, sx, sy, sw, sh, x, y, TILE_W, TILE_H)

    // 이름 띠 — 아래쪽 어둡게 깔고 흰 글자
    const g = ctx.createLinearGradient(0, y + TILE_H - 110, 0, y + TILE_H)
    g.addColorStop(0, 'rgba(7,9,40,0)')
    g.addColorStop(1, 'rgba(7,9,40,0.78)')
    ctx.fillStyle = g
    ctx.fillRect(x, y + TILE_H - 110, TILE_W, 110)
    ctx.restore()

    const name = isEn ? titleCase(looks[i].style.subEn.replace(/ MAKEUP$/i, '').replace(/ & LAYERING$/i, '')) : looks[i].style.nameKo.replace(/ 메이크업$/, '').replace(/ & 레이어링$/, '')
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 26px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(name, x + TILE_W / 2, y + TILE_H - 30, TILE_W - 24)

    // 번호 배지 — 댓글 투표용
    ctx.beginPath()
    ctx.arc(x + 34, y + 34, 22, 0, Math.PI * 2)
    ctx.fillStyle = INK
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = `800 24px ${FONT}`
    ctx.fillText(String(i + 1), x + 34, y + 35)
  })

  // ── 브랜드 록업 + AI 고지(EU AI Act — AI 로 만든 이미지임을 밝힌다)
  const gridBottom = GRID_TOP + TILE_H * 3 + GAP * 2
  const brandY = gridBottom + 95
  ctx.font = `800 38px ${FONT}`
  const textW = ctx.measureText('kissinskin').width
  const logoSize = 44
  const totalW = textW + (logo ? logoSize + 14 : 0)
  const bx = (W - totalW) / 2
  if (logo) ctx.drawImage(logo, bx, brandY - logoSize / 2, logoSize, logoSize)
  ctx.textAlign = 'left'
  ctx.fillStyle = INK
  ctx.fillText('kissinskin', bx + (logo ? logoSize + 14 : 0), brandY + 1)
  ctx.textAlign = 'center'
  ctx.fillStyle = MUTED
  ctx.font = `500 24px ${FONT}`
  ctx.fillText(isEn ? 'AI makeup on my own selfie · kissinskin.net' : '내 셀카로 만든 AI 메이크업 · kissinskin.net', W / 2, brandY + 62)

  return canvas
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
