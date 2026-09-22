// 뉴스 무드컷에 kissinskin 워드마크를 아래 모서리에 합성해 webp 로 저장한다.
//
// 왜 (2026-09-14): 운영자가 이미지에 브랜드를 넣기를 원했다. 제품 라벨에 넣는 방식(AI 가 글자를
//   그리기)은 철자 오류 위험 + 뉴스 기사 속 타사 제품이 우리 제품처럼 보이는 오해가 있어,
//   **모서리 워터마크**(B-1)로 정했다. API 비용 없음, 글자 정확.
// 워드마크 = `public/logo.png` 의 흰 글자만 뽑아 둔 `scripts/assets/news-wordmark.webp`
//   (폰트 파일에 의존하지 않아 CI 에서도 똑같이 나온다).
//
// 읽히게 하는 규칙:
//   ① 자리 = 오른쪽 아래 / 왼쪽 아래 중 덜 복잡한 쪽(밝기 표준편차 합이 작은 쪽).
//   ② 바탕이 확실히 밝으면 힐다 딥네이비 글자, 확실히 어두우면 흰 글자(+옅은 번짐).
//   ③ 바탕이 중간 밝기이거나 복잡하면(제품 위에 걸침) 힐다 크림 알약 라벨을 깔고 네이비 글자.
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const WORDMARK = resolve(dirname(fileURLToPath(import.meta.url)), 'assets/news-wordmark.webp')
const OUT_W = 960
const OUT_H = 1280
const MARK_W = 168
const MARGIN = 34
const PAD = 8

const NAVY = { r: 0x23, g: 0x2a, b: 0x52 } // 힐다 --color-navy
const CREAM = { r: 0xf5, g: 0xef, b: 0xe3 } // 힐다 --color-background-light

export async function writeNewsWebp(imageBuffer, outPath) {
  const sharp = (await import('sharp')).default
  const base = await sharp(imageBuffer).resize(OUT_W, OUT_H, { fit: 'cover' }).png().toBuffer()

  const mark = await sharp(WORDMARK).resize({ width: MARK_W }).png().toBuffer()
  const { width: mw, height: mh } = await sharp(mark).metadata()
  const top = OUT_H - MARGIN - mh

  const spots = []
  for (const left of [OUT_W - MARGIN - mw, MARGIN]) {
    // ⚠ extract() 뒤에 바로 .stats() 를 부르면 잘라낸 영역이 아니라 **원본 전체** 통계가 나온다 → 버퍼로 한 번 떨군다.
    const crop = await sharp(base).extract({ left: left - PAD, top: top - PAD, width: mw + PAD * 2, height: mh + PAD * 2 }).png().toBuffer()
    const { channels } = await sharp(crop).stats()
    const busy = channels.slice(0, 3).reduce((a, c) => a + c.stdev, 0)
    const lum = 0.2126 * channels[0].mean + 0.7152 * channels[1].mean + 0.0722 * channels[2].mean
    spots.push({ left, busy, lum })
  }
  const { left, busy, lum } = spots.sort((a, b) => a.busy - b.busy)[0]

  const tint = (color, alpha) => sharp({ create: { width: mw, height: mh, channels: 4, background: { ...color, alpha } } })
    .composite([{ input: mark, blend: 'dest-in' }])
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer()

  const layers = []
  const at = { left: left - PAD, top: top - PAD }
  if (busy > 45 || (lum > 95 && lum < 175)) {
    const w = mw + PAD * 2 + 12
    const h = mh + PAD * 2
    const pill = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${h / 2}" fill="rgb(${CREAM.r},${CREAM.g},${CREAM.b})" fill-opacity="0.88"/></svg>`)
    layers.push({ input: pill, left: at.left - 6, top: at.top }, { input: await tint(NAVY, 0.9), ...at })
  } else if (lum >= 175) {
    layers.push({ input: await sharp(await tint(CREAM, 0.7)).blur(3).toBuffer(), ...at }, { input: await tint(NAVY, 0.8), ...at })
  } else {
    layers.push({ input: await sharp(await tint({ r: 0, g: 0, b: 0 }, 0.35)).blur(3).toBuffer(), ...at }, { input: await tint({ r: 255, g: 255, b: 255 }, 0.92), ...at })
  }

  await sharp(base).composite(layers).webp({ quality: 80 }).toFile(outPath)
}
