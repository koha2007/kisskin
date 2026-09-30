// 기존 뉴스·신제품 이미지에 로고마크를 오른쪽 위로 다시 찍는다. **API 호출 없음 = 비용 0** (로컬 sharp).
//
// 2026-09-30 운영자 지시: 마크를 위쪽으로 + 신제품 이미지에도 전부.
//   · 뉴스(public/news): 워터마크 없는 원본을 남겨 두지 않았다. 아래 모서리에 옛 마크
//     (워드마크 글자 / 핑크 심볼)가 이미 박혀 있으므로 **아래 띠를 잘라내고 cover 로 다시 채운 뒤**
//     위에 찍는다. 옛 마크는 아래 32px 여백 + 최대 ~110px 높이 → 아래 KEEP_H 밖이 전부 걷힌다.
//     대가: 12.5% 확대(좌우 각 ~69px 잘림, 살짝 부드러워짐).
//   · 신제품(public/products): 마크가 없었다 → 그대로 찍기만 한다.
//
// 사용:
//   node scripts/restamp-watermarks.mjs --sample <outDir>   # 몇 장만 outDir 에 써서 눈으로 확인
//   node scripts/restamp-watermarks.mjs                      # 전량 제자리 덮어쓰기
// ⚠ 한 번만 돌릴 것. 뉴스는 돌릴 때마다 아래 띠를 또 잘라낸다(이미 위에 찍힌 파일은 건너뛴다 — DONE 목록).
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { stampMarkToWebp, OUT_W, OUT_H } from './_newsWatermark.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const NEWS = resolve(ROOT, 'public/news')
const PRODUCTS = resolve(ROOT, 'public/products')
const DONE = resolve(ROOT, 'scripts/assets/restamped-2026-09-30.json')
/** 뉴스에서 남길 위쪽 높이. 옛 마크 영역(≈1130 아래)을 확실히 벗어난다. */
const KEEP_H = 1120

const args = process.argv.slice(2)
const sampleDir = args[0] === '--sample' ? resolve(args[1] || '.') : null

const done = new Set(existsSync(DONE) ? JSON.parse(readFileSync(DONE, 'utf8')) : [])

async function restampNews(file, outPath) {
  const buf = await sharp(file)
    .extract({ left: 0, top: 0, width: OUT_W, height: KEEP_H })
    .resize(OUT_W, OUT_H, { fit: 'cover' })
    .png()
    .toBuffer()
  await stampMarkToWebp(buf, outPath)
}

async function restampProduct(file, outPath) {
  // 원본 버퍼로 읽어 둔다(제자리 덮어쓰기라 입력·출력이 같은 파일).
  const buf = await sharp(readFileSync(file)).png().toBuffer()
  await stampMarkToWebp(buf, outPath)
}

const jobs = [
  ...readdirSync(NEWS).filter((f) => f.endsWith('.webp')).map((f) => ({ kind: 'news', key: `news/${f}`, file: resolve(NEWS, f) })),
  ...readdirSync(PRODUCTS).filter((f) => f.endsWith('.webp')).map((f) => ({ kind: 'products', key: `products/${f}`, file: resolve(PRODUCTS, f) })),
]

let picked = jobs.filter((j) => !done.has(j.key))
if (sampleDir) {
  mkdirSync(sampleDir, { recursive: true })
  const news = picked.filter((j) => j.kind === 'news')
  const prods = picked.filter((j) => j.kind === 'products')
  const every = (arr, n) => arr.filter((_, i) => i % Math.max(1, Math.floor(arr.length / n)) === 0).slice(0, n)
  picked = [...every(news, 6), ...every(prods, 4)]
}

let n = 0
for (const j of picked) {
  const outPath = sampleDir ? resolve(sampleDir, j.key.replace('/', '__')) : j.file
  if (j.kind === 'news') await restampNews(j.file, outPath)
  else await restampProduct(j.file, outPath)
  if (!sampleDir) done.add(j.key)
  n++
}
if (!sampleDir) writeFileSync(DONE, JSON.stringify([...done].sort(), null, 1) + '\n')
console.log(`${sampleDir ? 'sample' : 'restamped'}: ${n} (news ${picked.filter((j) => j.kind === 'news').length}, products ${picked.filter((j) => j.kind === 'products').length})`)
