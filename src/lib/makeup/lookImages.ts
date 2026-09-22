// 룩 카드용 비포/애프터 이미지 — 단일 소스 (스타일 선택 화면 + 홈 마퀴가 공유)
// ────────────────────────────────────────────────────────────────────
// scripts/gen-look-models.mjs 산출물. 애프터는 라이브 도구와 **동일한 경로**
// (gpt-image-2 + promptWholeFace)로 만든 실제 결과물이라 "우리 도구가 실제로 이렇게
// 바꿔준다"는 주장이 사실이다(§8).
//
// ⭐ 2026-09-22 — 9룩 전부 **같은 모델 한 명**이다(그전엔 룩마다 다른 모델 9명).
//   9칸의 일은 "룩을 비교하는 것"인데, 얼굴이 9개면 달라 보이는 게 메이크업 때문인지
//   사람 때문인지 구분되지 않는다. 얼굴을 고정하면 변수가 메이크업 하나만 남고,
//   사용자가 곧 겪을 일(자기 얼굴 하나 × 9룩)과 화면이 같은 모양이 된다.
//   지루해지지 않는 이유: 룩마다 헤어 컬러가 다르게 지정돼 있어 9칸이 저절로 달라진다.
//   ⚠ 다양성은 다른 자리(홈 히어로·룩 상세·결과 예시)에서 맡는다 — 여기로 되돌리지 말 것.
//   비포 원본은 casting/ (git 에 올리지 않는다). 얼굴 중심으로 2:3 크롭해서 쓴다.
//
// 재생성: set -a && . ./.dev.vars && set +a &&
//         node scripts/gen-look-models.mjs --before-dir=./casting --force
import type { MakeupStyleId } from './styles'

export interface LookImage {
  /** 민낯 원본 */
  before: string
  /** 그 원본에 해당 룩을 실제로 입힌 결과 */
  after: string
}

const DIR = '/styles/looks'

// 캐시 버스터 — 2026-09-22.
// 파일명이 고정(`blood-lip-after.webp`)이라 이미지를 바꿔도 이미 방문한 브라우저는
// `cache-control: public, max-age=14400`(4시간) 동안 옛 사진을 계속 쓴다. 실제로 9룩을
// 전부 갈아끼운 날 "반영이 안 된다"는 보고가 나왔다(서버는 새 파일, 브라우저가 옛 파일).
// **이미지를 재생성할 때마다 이 날짜를 올릴 것.** 그래야 기존 방문자도 즉시 새 사진을 본다.
const V = '20260922'
const src = (name: string) => `${DIR}/${name}.webp?v=${V}`

export const LOOK_IMAGES: Record<MakeupStyleId, LookImage> = {
  'natural-glow': { before: src('natural-glow-before'), after: src('natural-glow-after') },
  'cloud-skin': { before: src('cloud-skin-before'), after: src('cloud-skin-after') },
  'blood-lip': { before: src('blood-lip-before'), after: src('blood-lip-after') },
  'maximalist-eye': { before: src('maximalist-eye-before'), after: src('maximalist-eye-after') },
  'metallic-eye': { before: src('metallic-eye-before'), after: src('metallic-eye-after') },
  'bold-lip': { before: src('bold-lip-before'), after: src('bold-lip-after') },
  'blush-draping': { before: src('blush-draping-before'), after: src('blush-draping-after') },
  grunge: { before: src('grunge-before'), after: src('grunge-after') },
  'kpop-idol': { before: src('kpop-idol-before'), after: src('kpop-idol-after') },
}

export const lookImage = (id: MakeupStyleId): LookImage | undefined => LOOK_IMAGES[id]
