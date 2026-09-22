// 뉴스 무드컷에 kissinskin 브랜드 록업을 아래 모서리에 합성해 webp 로 저장한다.
//
// 왜 (2026-09-14): 운영자가 이미지에 브랜드를 넣기를 원했다. 제품 라벨에 넣는 방식(AI 가 글자를
//   그리기)은 철자 오류 위험 + 뉴스 기사 속 타사 제품이 우리 제품처럼 보이는 오해가 있어,
//   **모서리 워터마크**(B-1)로 정했다. API 비용 없음, 글자 정확.
//
// 2026-09-22 — 흰 워드마크 + 배경 밝기별 틴팅(3분기)에서 **네이비 뱃지 록업 한 장**으로 바꿨다.
//   왜: 워터마크가 자리마다 달랐다(공유 카드=원형로고+텍스트, 도구 카드='kissinskin.net').
//     운영자가 록업 하나로 통일하기로 정했다 → scripts/assets/brand-lockup.webp.
//   덤: 네이비 판이 깔리므로 배경이 밝든 어둡든 복잡하든 항상 읽힌다. 밝기를 재서 글자색을
//     고르던 3분기(크림 알약 / 네이비 글자 / 흰 글자+번짐)가 통째로 필요 없어졌다.
//   남긴 것: **자리 고르기**. 오른쪽 아래 / 왼쪽 아래 중 덜 복잡한 쪽에 놓는 건 여전히 유효하다
//     (얼굴이나 제품 위에 걸치면 뱃지가 사진을 가린다).
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const LOCKUP = resolve(dirname(fileURLToPath(import.meta.url)), 'assets/brand-lockup.webp')
const OUT_W = 960
const OUT_H = 1280
const MARK_W = 190
const MARGIN = 34
/** 자리를 고를 때 뱃지 주변까지 보고 판단하는 여유. */
const PAD = 8

export async function writeNewsWebp(imageBuffer, outPath) {
  const sharp = (await import('sharp')).default
  const base = await sharp(imageBuffer).resize(OUT_W, OUT_H, { fit: 'cover' }).png().toBuffer()

  const mark = await sharp(LOCKUP).resize({ width: MARK_W }).png().toBuffer()
  const { width: mw, height: mh } = await sharp(mark).metadata()
  const top = OUT_H - MARGIN - mh

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

  await sharp(base)
    .composite([{ input: mark, left, top }])
    .webp({ quality: 80 })
    .toFile(outPath)
}
