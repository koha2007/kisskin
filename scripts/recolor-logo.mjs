#!/usr/bin/env node
/**
 * 로고·아이콘 브랜드 컬러 재매핑.
 *
 * 로고 에셋은 전부 "단색 도형 + 흰 워드마크" 2색 구성이라,
 * 각 픽셀을 (구색 → 흰색) 축에 투영해 t 를 구하고 (새색 → 흰색) 축으로
 * 다시 얹으면 안티에일리어싱·알파가 그대로 보존된다.
 *
 *   node scripts/recolor-logo.mjs [--from e0745c] [--to b03e2d]
 */
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const args = process.argv.slice(2)
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? args[i + 1].replace('#', '') : def
}
const hex2rgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))

const FROM = hex2rgb(flag('from', 'e0745c')) // 현재 로고 살몬
const TO = hex2rgb(flag('to', 'b03e2d')) // 팔레트 primary-dark
const W = [255, 255, 255]

const PUBLIC = path.resolve('public')
const TARGETS = [
  'logo.png',
  'logo-sm.webp',
  'apple-touch-icon.png',
  ...[32, 72, 96, 128, 144, 152, 192, 384, 512].map((s) => `icons/icon-${s}x${s}.png`),
]
const ICO = 'favicon.ico'
const ICO_SIZES = [16, 32, 48, 64, 128]

// (FROM → W) 축의 제곱 길이. 투영 분모.
const axis = W.map((w, i) => w - FROM[i])
const axisLen2 = axis.reduce((a, v) => a + v * v, 0)

function remap(buf) {
  for (let p = 0; p < buf.length; p += 4) {
    if (buf[p + 3] === 0) continue // 완전 투명은 건드리지 않음
    let dot = 0
    for (let c = 0; c < 3; c++) dot += (buf[p + c] - FROM[c]) * axis[c]
    const t = Math.min(1, Math.max(0, dot / axisLen2))
    for (let c = 0; c < 3; c++) buf[p + c] = Math.round(TO[c] + t * (W[c] - TO[c]))
  }
  return buf
}

async function recolorFile(rel) {
  const file = path.join(PUBLIC, rel)
  const img = sharp(await readFile(file))
  const meta = await img.metadata()
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const out = sharp(remap(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
  const buf = rel.endsWith('.webp')
    ? await out.webp({ quality: 92, alphaQuality: 100 }).toBuffer()
    : await out.png({ compressionLevel: 9 }).toBuffer()
  await writeFile(file, buf)
  console.log(`  ✓ ${rel.padEnd(28)} ${meta.width}×${meta.height}`)
}

// favicon.ico 는 멀티사이즈 컨테이너라 마스터에서 다시 굽는다.
async function rebuildIco() {
  const master = await sharp(path.join(PUBLIC, 'icons/icon-512x512.png')).ensureAlpha()
  const pngs = await Promise.all(
    ICO_SIZES.map((s) => master.clone().resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()),
  )
  // ICONDIR(6) + ICONDIRENTRY(16×n) + PNG 페이로드
  const header = Buffer.alloc(6 + 16 * pngs.length)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(pngs.length, 4)
  let offset = header.length
  pngs.forEach((png, i) => {
    const e = 6 + 16 * i
    const s = ICO_SIZES[i]
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
  await writeFile(path.join(PUBLIC, ICO), Buffer.concat([header, ...pngs]))
  console.log(`  ✓ ${ICO.padEnd(28)} ${ICO_SIZES.join('/')}`)
}

const toHex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
console.log(`로고 재매핑 ${toHex(FROM)} → ${toHex(TO)}`)
for (const t of TARGETS) await recolorFile(t)
await rebuildIco()
console.log(`완료: ${TARGETS.length + 1}개 파일`)
