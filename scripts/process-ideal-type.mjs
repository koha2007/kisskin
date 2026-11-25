// 이상형 그림 64장 → public/ideal-type/ (2026-11-25)
//   원본 1024×1536(위 15%·아래 20% 빈 종이) → 가운데 8:9(1024×1152) 자르기 → 768×864 webp
//   + OG 1200×630 콜라주(8유형, 남녀 번갈아)
//   node scripts/process-ideal-type.mjs
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const SRC = resolve(ROOT, 'tmp-ideal-type/set')
const OUT = resolve(ROOT, 'public/ideal-type')
mkdirSync(OUT, { recursive: true })

let n = 0
for (const f of readdirSync(SRC).filter((x) => x.endsWith('.webp'))) {
  await sharp(resolve(SRC, f)).extract({ left: 0, top: 154, width: 1024, height: 1152 }).resize(768, 864).webp({ quality: 80 }).toFile(resolve(OUT, f))
  n++
}
console.log('processed', n)

const TYPES = ['golden-retriever', 'black-cat', 'fox', 'bunny', 'teddy-bear', 'deer', 'wolf', 'dino']
const tiles = TYPES.map((t, i) => resolve(OUT, `${t}-${i % 2 ? 'f' : 'm'}-picnic.webp`))
if (tiles.every((p) => existsSync(p))) {
  const W = 300, H = 315
  const comps = await Promise.all(tiles.map(async (p, i) => ({ input: await sharp(p).resize(W, H, { fit: 'cover' }).toBuffer(), left: (i % 4) * W, top: Math.floor(i / 4) * H })))
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#f6eedc' } }).composite(comps).jpeg({ quality: 82 }).toFile(resolve(OUT, 'og.jpg'))
  console.log('og.jpg')
}
