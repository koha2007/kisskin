// 뉴스 무드컷에 kissinskin 로고마크를 아래 모서리에 합성해 webp 로 저장한다.
//
// 왜 (2026-09-14): 운영자가 이미지에 브랜드를 넣기를 원했다. 제품 라벨에 넣는 방식(AI 가 글자를
//   그리기)은 철자 오류 위험 + 뉴스 기사 속 타사 제품이 우리 제품처럼 보이는 오해가 있어,
//   **모서리 워터마크**(B-1)로 정했다. API 비용 없음, 글자 정확.
//
// 2026-09-22 — 운영자 지시로 **워드마크(흰 글자) → 로고마크(핑크 심볼)** 로 교체.
//   이전엔 상황(밝기·복잡도)에 따라 네이비 글자 / 흰 글자 / 크림 알약 라벨 세 갈래로 갈렸는데,
//   ① 알약 라벨이 사진 위에 이물질처럼 얹혔고 ② 글자라 작게 넣으면 안 읽혔다.
//   로고마크는 **브랜드 핑크 한 색**이라 밝기 분기 자체가 필요 없다 — 어떤 배경에서도
//   색으로 구분된다. 네이비 바탕·알약을 전부 걷어내고 심볼만 얹는다.
//   자리 고르기(덜 복잡한 모서리)는 그대로 유지한다.
//   ⚠ 자산은 반드시 webp — .gitignore 가 public/ 밖의 *.png 를 전부 무시해 CI 에서 사라진다.
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const LOGOMARK = resolve(dirname(fileURLToPath(import.meta.url)), 'assets/news-logomark.webp')
const OUT_W = 960
const OUT_H = 1280
/** 심볼 폭. 글자가 아니라 도형이라 작아도 알아볼 수 있다(워드마크는 168 이었다). */
const MARK_W = 96
const MARGIN = 32
const PAD = 8

export async function writeNewsWebp(imageBuffer, outPath) {
  const sharp = (await import('sharp')).default
  const base = await sharp(imageBuffer).resize(OUT_W, OUT_H, { fit: 'cover' }).png().toBuffer()

  const mark = await sharp(LOGOMARK).resize({ width: MARK_W }).png().toBuffer()
  const { width: mw, height: mh } = await sharp(mark).metadata()
  const top = OUT_H - MARGIN - mh

  // 자리 = 오른쪽 아래 / 왼쪽 아래 중 **덜 복잡한** 쪽. 피사체 위에 얹히는 걸 피한다.
  const spots = []
  for (const left of [OUT_W - MARGIN - mw, MARGIN]) {
    // ⚠ extract() 뒤에 바로 .stats() 를 부르면 잘라낸 영역이 아니라 **원본 전체** 통계가 나온다 → 버퍼로 한 번 떨군다.
    const crop = await sharp(base)
      .extract({ left: left - PAD, top: top - PAD, width: mw + PAD * 2, height: mh + PAD * 2 })
      .png()
      .toBuffer()
    const { channels } = await sharp(crop).stats()
    const busy = channels.slice(0, 3).reduce((a, c) => a + c.stdev, 0)
    spots.push({ left, busy })
  }
  const { left } = spots.sort((a, b) => a.busy - b.busy)[0]

  // 핑크 심볼 하나만. 배경이 핑크 계열일 때를 대비해 아주 옅은 흰 글로우만 뒤에 깐다
  // (알약 라벨처럼 형태가 생기지 않을 정도로만).
  const glow = await sharp(mark).blur(6).toBuffer()
  await sharp(base)
    .composite([
      { input: glow, left, top, blend: 'over' },
      { input: mark, left, top },
    ])
    .webp({ quality: 80 })
    .toFile(outPath)
}
