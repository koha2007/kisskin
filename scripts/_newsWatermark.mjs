// 뉴스·신제품 무드컷에 kissinskin 로고마크를 **오른쪽 위**에 합성해 webp 로 저장한다.
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
//
// 2026-09-30 — 운영자 지시로 **아래 모서리 → 오른쪽 위 고정**, 신제품(/products) 이미지에도 적용.
//   ① 오른쪽 아래는 기사 히어로의 "이미지는 AI 생성 연출컷" 라벨이 덮었다.
//   ② 왼쪽 위는 제품 상세 히어로의 카테고리 칩 자리다. → 남는 모서리 = 오른쪽 위.
//   ③ 자리를 매번 고르지 않고 고정한다(방송사 로고처럼 늘 같은 데 있어야 브랜드로 읽힌다).
//   ④ 위 여백 72px: 모바일 히어로·홈 카드는 4:5 로 잘려 위가 40px 사라진다 → 보이는 여백 32px.
//      허브 카드는 비율이 제각각이라 이미지 카드에 object-top 을 준다(HubShell).
//   기존 이미지 재적용 = scripts/restamp-watermarks.mjs(무료, 로컬 sharp).
//   ⚠ 자산은 반드시 webp — .gitignore 가 public/ 밖의 *.png 를 전부 무시해 CI 에서 사라진다.
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const LOGOMARK = resolve(dirname(fileURLToPath(import.meta.url)), 'assets/news-logomark.webp')
export const OUT_W = 960
export const OUT_H = 1280
/** 심볼 폭. 글자가 아니라 도형이라 작아도 알아볼 수 있다(워드마크는 168 이었다). */
const MARK_W = 96
const MARGIN_TOP = 72
const MARGIN_RIGHT = 40

/** 이미 OUT_W×OUT_H 로 맞춘 버퍼(또는 임의 크기)에 마크를 찍어 webp 로 쓴다. */
export async function stampMarkToWebp(baseBuffer, outPath) {
  const sharp = (await import('sharp')).default
  const { width } = await sharp(baseBuffer).metadata()
  const mark = await sharp(LOGOMARK).resize({ width: MARK_W }).png().toBuffer()
  const { width: mw } = await sharp(mark).metadata()
  const left = width - MARGIN_RIGHT - mw
  const top = MARGIN_TOP

  // 핑크 심볼 하나만. 배경이 핑크 계열일 때를 대비해 아주 옅은 흰 글로우만 뒤에 깐다
  // (알약 라벨처럼 형태가 생기지 않을 정도로만).
  const glow = await sharp(mark).blur(6).toBuffer()
  await sharp(baseBuffer)
    .composite([
      { input: glow, left, top, blend: 'over' },
      { input: mark, left, top },
    ])
    .webp({ quality: 80 })
    .toFile(outPath)
}

/** 생성 원본 → 960×1280 cover → 마크 → webp. 뉴스·신제품 공용. */
export async function writeMarkedWebp(imageBuffer, outPath) {
  const sharp = (await import('sharp')).default
  const base = await sharp(imageBuffer).resize(OUT_W, OUT_H, { fit: 'cover' }).png().toBuffer()
  await stampMarkToWebp(base, outPath)
}

export const writeNewsWebp = writeMarkedWebp
