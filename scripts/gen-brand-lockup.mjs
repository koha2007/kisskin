// ════════════════════════════════════════════════════════════════════
// 브랜드 록업(워터마크) 생성 — public/brand-lockup.png + scripts/assets/brand-lockup.png
// ────────────────────────────────────────────────────────────────────
// 왜(2026-09-22): 워터마크가 자리마다 제각각이었다.
//   · 메이크업 공유 카드  = 원형 로고 + 캔버스에 그린 'kissinskin' 텍스트
//   · 무료도구 결과 카드  = 'kissinskin.net' 텍스트만
//   · 뉴스 무드컷         = 흰 워드마크 + 배경 밝기별 틴팅(3분기)
// 운영자가 네이비 뱃지 록업 하나로 통일하기로 정해, 그 한 장을 여기서 만든다.
// 네이비 판이 깔리므로 배경이 밝든 어둡든 복잡하든 항상 읽힌다 → 틴팅 분기가 필요 없다.
//
// 재료(둘 다 리포 안에 있어 CI 에서도 동일하게 재생성된다):
//   원형 로고 = public/logo.png (1534²) — 고해상도라 그대로 축소해 쓴다.
//   워드마크  = scripts/assets/brand-wordmark-bold.webp (104×18, 흰 글자 + 알파)
//     운영자 참조 시안(scripts/assets/brand-lockup-source.webp)에서 잘라낸 것.
//     ⚠ 시안이 화면 캡처라 글자에 서브픽셀 색 번짐(청록/주황 테두리)이 있었다 →
//       "네이비에서 흰색 쪽으로 간 정도"를 알파로 환산하고 색은 순백으로 고정해 제거했다.
//       Pretendard 로 직접 렌더하지 않는 이유: 폰트가 CDN 에만 있어 CI 노드에 없다.
//   비율은 시안 실측(원 지름 D 기준): 간격 0.25D · 워드마크 높이 0.45D · 세로 중앙정렬.
//
// 재생성: node scripts/gen-brand-lockup.mjs
// ════════════════════════════════════════════════════════════════════
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const NAVY = '#070953' // --color-navy

// 시안의 3배. 실제 사용처(뉴스 168px·공유카드 ~280px)보다 크게 잡아 축소만 하게 한다.
const D = 120                          // 원형 로고 지름
const GAP = Math.round(D * 0.25)
const WM_H = Math.round(D * 0.45)

const wm = await sharp(resolve(ROOT, 'scripts/assets/brand-wordmark-bold.webp'))
  .resize({ height: WM_H, kernel: 'lanczos3' }).png().toBuffer()
const { width: wmW, height: wmH } = await sharp(wm).metadata()
const circle = await sharp(resolve(ROOT, 'public/logo.png'))
  .resize(D, D, { kernel: 'lanczos3', fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png().toBuffer()

const padX = Math.round(D * 0.33)
const padY = Math.round(D * 0.28)
const W = D + GAP + wmW + padX * 2
const H = D + padY * 2
const R = Math.round(H * 0.28)

const plate = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" rx="${R}" ry="${R}" fill="${NAVY}"/></svg>`,
)

const out = await sharp(plate)
  .composite([
    { input: circle, left: padX, top: padY },
    { input: wm, left: padX + D + GAP, top: padY + Math.round((D - wmH) / 2) },
  ])
  .png()
  .toBuffer()

// ⚠ .gitignore 가 public/ 밖의 *.png 를 전부 무시한다(24행). 그래서 스크립트용 사본은
//   기존 news-wordmark 와 같이 **webp** 로 떨군다 — png 로 두면 CI 체크아웃에 파일이 없어
//   뉴스 무드컷 워터마크가 통째로 깨진다.
await sharp(out).toFile(resolve(ROOT, 'public/brand-lockup.png'))
await sharp(out).webp({ lossless: true }).toFile(resolve(ROOT, 'scripts/assets/brand-lockup.webp'))
console.log(`brand-lockup.png ${W}×${H} (radius ${R}, 원 ${D}, 워드마크 ${wmW}×${wmH})`)
