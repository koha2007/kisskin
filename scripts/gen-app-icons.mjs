#!/usr/bin/env node
/**
 * 웹 PWA + Expo 앱 아이콘 일괄 생성.
 *
 *   node scripts/gen-app-icons.mjs [--dry]
 *
 * 왜 스크립트로 두는가 — 예전엔 1회성 인라인 코드로 아이콘을 구웠는데, 나중에
 * "이 미커밋 변경이 뭐냐"를 아무도 되짚지 못했다. 재현 가능해야 한다.
 *
 * ── 핵심: 런처가 아이콘을 '잘라낸다'
 * 안드로이드/iOS 홈 화면은 아이콘을 원·스퀘어클로 마스킹한다. 로고가 캔버스를
 * 꽉 채우면 가장자리가 잘린다. 그런데 **로고를 그냥 줄이면 더 나빠졌다** —
 * 우리 로고는 핑크 원 안에 흰 스우시(부메랑)가 파고든 형태라, 흰 배경 위에
 * 놓으면 스우시와 배경이 이어져 원 윤곽이 사라진다. 원본에 있는 얇은 핑크
 * 테두리 선도 축소되면서 없어진다. 결과는 "원형도 아닌 애매한 덩어리"
 * (운영자 제보: 홈 화면에서 다른 앱 아이콘과 달리 원으로 안 보인다).
 *
 * 해결 = 로고는 운영자 시안(kissinskin_logo-033) 그대로 두되, **원을 그리는
 * 핑크 테두리선을 아이콘 크기에 비례해 다시 그린다.** 원본에도 그 선이 있지만
 * 1200px 에서 4~5px 이라 아이콘 크기로 줄이면 0.3px 가 되어 없어진다. 새로
 * 만드는 게 아니라 사라지지 않게 하는 것이다. 그러면 작은 크기에서도 원이
 * 분명하게 읽히면서 로고 원본의 인상이 유지된다.
 *
 * 크기는 대상별 '보이는 영역'에서 역산한다(로고 = 보이는 지름의 80%,
 * 운영자 시안의 비율). 보이는 영역이 다른 이유:
 *
 *   대상                     보이는 영역
 *   ──────────────────────────────────────────
 *   웹 maskable 아이콘        안쪽 80% 원   (maskable 규격)
 *   Expo adaptive-icon       안쪽 66.7% 원 (108dp 중 72dp)
 *   iOS 스퀘어클             거의 전체
 *   favicon                  마스크 없음 → 투명 배경 + 로고를 크게
 */
import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

const DRY = process.argv.includes('--dry')
const ROOT = path.resolve('.')
const SRC = path.join(ROOT, 'public/logo.png')
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 }
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 }
/** 브랜드 핑크 — 로고 도형 색과 같아야 테두리선이 로고의 일부로 보인다. */
const PINK = '#ef4da0'

/** 로고는 보이는 지름의 80%(운영자 시안 실측값). 테두리선은 로고 지름의 2.2%. */
const LOGO_OF_VISIBLE = 0.8
const RING_OF_LOGO = 0.022
/** 마스크가 없는 대상(favicon)에서 로고가 차지할 비율. */
const LOGO_UNMASKED = 0.92

/** [출력경로, 캔버스크기, 보이는영역비율, 배경] — visible=0 이면 마스크 없는 대상 */
const TARGETS = [
  // 웹 PWA — manifest.json 에 purpose:"any maskable" 로 선언된 8종
  ...[72, 96, 128, 144, 152, 192, 384, 512].map((s) => [`public/icons/icon-${s}x${s}.png`, s, 0.8, WHITE]),
  // iOS 홈 화면 — 스퀘어클 마스크. 투명은 검정으로 렌더되므로 흰 배경 필수.
  ['public/apple-touch-icon.png', 180, 1, WHITE],
  // 브라우저 탭 — 마스킹 없음. 다크 탭바에서 흰 사각형이 되지 않게 투명 유지.
  ['public/icons/icon-32x32.png', 32, 0, CLEAR],
  // Expo 앱
  ['kisskin-app/assets/adaptive-icon.png', 1024, 0.667, WHITE],
  ['kisskin-app/assets/icon.png', 1024, 1, WHITE],
]

/** favicon.ico 에 담을 크기들 — 멀티사이즈 컨테이너라 따로 굽는다. */
const ICO_SIZES = [16, 32, 48, 64, 128]

// 로고의 투명 여백을 걷어내 실제 도형만 남긴다(원본이 이미 타이트해도 안전).
const logoTight = await sharp(SRC).trim().toBuffer()
const logoMeta = await sharp(logoTight).metadata()

/** 로고 + 핑크 테두리선을 캔버스 가운데에 배치. */
async function render(canvas, visible, background) {
  const logoSize = Math.round(canvas * (visible ? visible * LOGO_OF_VISIBLE : LOGO_UNMASKED))
  const off = Math.round((canvas - logoSize) / 2)
  // 선 굵기는 최소 1px — 16px 파비콘에서도 원이 끊기지 않게.
  const ring = Math.max(1, Math.round(logoSize * RING_OF_LOGO))
  const ringSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${logoSize}" height="${logoSize}">` +
    `<circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${(logoSize - ring) / 2}" ` +
    `fill="none" stroke="${PINK}" stroke-width="${ring}"/></svg>`
  return sharp({ create: { width: canvas, height: canvas, channels: 4, background } })
    .composite([
      { input: await sharp(logoTight).resize(logoSize, logoSize, { fit: 'contain', background: CLEAR }).toBuffer(), top: off, left: off },
      { input: await sharp(Buffer.from(ringSvg)).png().toBuffer(), top: off, left: off },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/** ICONDIR(6) + ICONDIRENTRY(16×n) + PNG 페이로드 */
function packIco(pngs, sizes) {
  const header = Buffer.alloc(6 + 16 * pngs.length)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(pngs.length, 4)
  let offset = header.length
  pngs.forEach((png, i) => {
    const e = 6 + 16 * i
    const s = sizes[i]
    header.writeUInt8(s >= 256 ? 0 : s, e)
    header.writeUInt8(s >= 256 ? 0 : s, e + 1)
    header.writeUInt8(0, e + 2) // 팔레트 없음
    header.writeUInt8(0, e + 3)
    header.writeUInt16LE(1, e + 4) // color planes
    header.writeUInt16LE(32, e + 6) // bpp
    header.writeUInt32LE(png.length, e + 8)
    header.writeUInt32LE(offset, e + 12)
    offset += png.length
  })
  return Buffer.concat([header, ...pngs])
}

console.log(`원본 ${path.relative(ROOT, SRC)} — 트림 후 ${logoMeta.width}×${logoMeta.height}`)
console.log(DRY ? '(dry run — 파일을 쓰지 않는다)\n' : '')

for (const [rel, canvas, visible, background] of TARGETS) {
  const buf = await render(canvas, visible, background)
  if (!DRY) await writeFile(path.join(ROOT, rel), buf)
  const bg = background.alpha === 0 ? '투명' : '흰색'
  const pct = ((visible ? visible * LOGO_OF_VISIBLE : LOGO_UNMASKED) * 100).toFixed(0)
  console.log(`  ✓ ${rel.padEnd(42)} ${String(canvas).padStart(4)}px  로고 ${pct.padStart(2)}%   배경 ${bg}`)
}

// favicon.ico — 탭 아이콘이라 마스킹 없음. 투명 배경 + 로고를 크게.
const icoPngs = []
for (const s of ICO_SIZES) icoPngs.push(await render(s, 0, CLEAR))
if (!DRY) await writeFile(path.join(ROOT, 'public/favicon.ico'), packIco(icoPngs, ICO_SIZES))
console.log(`  ✓ ${'public/favicon.ico'.padEnd(42)} ${ICO_SIZES.join('/')}  로고 ${(LOGO_UNMASKED * 100).toFixed(0)}%   배경 투명`)

console.log(`\n완료: ${TARGETS.length + 1}개 파일`)
console.log('※ Expo 에셋(kisskin-app/assets/*)은 네이티브라 재빌드해야 반영된다.')
