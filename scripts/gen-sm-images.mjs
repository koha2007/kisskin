// 홈 화면용 작은 이미지 — 2026-11-26 홈 점검: 88~230px 로 보이는 칸에 1024~1280px 원본(장당 90~170KB)을 쓰고 있었다.
// 빌드마다 아래 폴더 이미지를 가로 480px 로 줄여 public/sm/<같은 경로> 에 만든다(이미 최신이면 건너뜀, git 제외).
// 화면은 src/lib/smImage.ts 의 smImg() 로 /sm/... 를 쓰고, 없거나 실패하면 원본으로 되돌아간다(onError).
import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'

export const SM_DIRS = ['mood', 'looks/charts', 'ideal-type', 'ideal-type/samples', 'ideal-type/card', 'fortune/looks', 'hair/jj', 'paint/samples', 'styles/looks/hero', 'products', 'news', 'real']
const W = 480
let sharp
try { sharp = (await import('sharp')).default } catch (e) { console.warn('[sm] sharp 없음 — 건너뜀(화면은 원본 사용)', e?.message); process.exit(0) }

let made = 0, kept = 0, fail = 0
for (const d of SM_DIRS) {
  const src = join('public', d)
  if (!existsSync(src)) continue
  for (const f of readdirSync(src)) {
    const ext = extname(f).toLowerCase()
    if (!['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) continue
    const from = join(src, f), to = join('public/sm', d, f)
    if (existsSync(to) && statSync(to).mtimeMs >= statSync(from).mtimeMs) { kept++; continue }
    mkdirSync(dirname(to), { recursive: true })
    try {
      const img = sharp(from)
      const { width = 0 } = await img.metadata()
      if (width <= W) { copyFileSync(from, to) } else {
        const r = img.resize({ width: W })
        await (ext === '.webp' ? r.webp({ quality: 76 }) : ext === '.png' ? r.png({ compressionLevel: 9, palette: true }) : r.jpeg({ quality: 78, mozjpeg: true })).toFile(to)
      }
      made++
    } catch (e) { fail++; console.warn('[sm]', from, e?.message) }
  }
}
console.log(`[sm] made ${made}, up-to-date ${kept}, failed ${fail}`)
