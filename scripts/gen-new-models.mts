// 2026-11-02 새 모델로 9룩·럭키 9종 재생성 — 라이브와 같은 경로(gpt-image-2 edits + promptWholeFace).
//   npx tsx scripts/gen-new-models.mts <출력폴더> [--only=id,id]   (있는 파일은 건너뜀, 유료 장당 ≈ $0.17)
// 샘플·검수는 public 밖 폴더에서 한 뒤 옮긴다(feedback_paid_bulk_generation_preflight).
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { MAKEUP_STYLES, promptWholeFace } from '../src/lib/makeup/styles'
import { FORTUNE_LOOKS } from '../src/lib/fortune/looks'

const ROOT = resolve(import.meta.dirname, '..')
const OUT = process.argv[2]
if (!OUT) throw new Error('출력 폴더를 주세요')
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',')
const env: Record<string, string> = Object.fromEntries(readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
mkdirSync(OUT, { recursive: true })

const jobs = [
  ...MAKEUP_STYLES.map((s) => ({ name: `makeup-${s.id}`, id: s.id, base: 'scripts/assets/model-makeup-base.webp', prompt: promptWholeFace(s) })),
  ...FORTUNE_LOOKS.map((l) => ({ name: `lucky-${l.id}`, id: l.id, base: 'scripts/assets/model-lucky-base.webp', prompt: promptWholeFace(l) })),
].filter((j) => (!ONLY || ONLY.includes(j.id)) && !existsSync(resolve(OUT, `${j.name}.webp`)))

let ok = 0, fail = 0
async function run(j: (typeof jobs)[number]) {
  const png = await sharp(resolve(ROOT, j.base)).png().toBuffer()
  const fd = new FormData()
  fd.append('model', 'gpt-image-2'); fd.append('image', new Blob([png], { type: 'image/png' }), 'before.png')
  fd.append('prompt', j.prompt); fd.append('size', '1024x1536'); fd.append('quality', 'high'); fd.append('n', '1')
  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const headers: Record<string, string> = {}
  let url = 'https://api.openai.com/v1/images/edits'
  if (base && env.CF_AIG_TOKEN) { url = `${base}/v1/images/edits`; headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}` }
  else { if (base) url = `${base}/v1/images/edits`; headers.Authorization = `Bearer ${env.OPENAI_API_KEY}` }
  const res = await fetch(url, { method: 'POST', headers, body: fd })
  const text = await res.text()
  if (!res.ok) { fail++; console.error('FAIL', j.name, res.status, text.slice(0, 200)); return }
  const b64 = JSON.parse(text)?.data?.[0]?.b64_json
  if (!b64) { fail++; console.error('FAIL no image', j.name); return }
  await sharp(Buffer.from(b64, 'base64')).webp({ quality: 88 }).toFile(resolve(OUT, `${j.name}.webp`))
  ok++; console.log('ok', j.name)
}
const queue = [...jobs]
await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await run(queue.shift()!) }))
console.log(`대상 ${jobs.length} · 성공 ${ok} · 실패 ${fail}`)
