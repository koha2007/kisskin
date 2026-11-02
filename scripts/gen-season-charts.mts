// 계절 룩 4종 페이스 차트 (2026-11-02) — 9룩 차트와 같은 빈 도안. 문구는 LOOK_HOWTO 단일 소스.
//   npx tsx scripts/gen-season-charts.mts   (없는 것만, 유료 장당 ≈ $0.17~0.22)
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { LOOK_HOWTO } from '../src/lib/looks/howto'
import { styleById, type MakeupStyleId } from '../src/lib/makeup/styles'

const ROOT = resolve(import.meta.dirname, '..')
const env: Record<string, string> = Object.fromEntries(readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const png = await sharp(resolve(ROOT, 'public/looks/charts/blank.webp')).png().toBuffer()
const IDS: MakeupStyleId[] = ['spring-blush', 'summer-glow', 'autumn-berry', 'winter-frost']
await Promise.all(IDS.map(async (id) => {
  const out = resolve(ROOT, `public/looks/charts/${id}.webp`)
  if (existsSync(out)) { console.log('skip', id); return }
  const made = LOOK_HOWTO[id].steps.map((s) => `${s.titleEn} (colours ${s.swatches.join(', ')})`).join('; ')
  const prompt = `Paint makeup onto this exact face chart as a makeup artist would, using real makeup textures (powder, cream, pigment, shimmer) applied on the paper. The look: ${styleById(id).descEn}. Finished makeup, all at once: ${made}. Make each part clearly visible at a glance. Show ONLY ONE face — the single finished look on the original chart. Never a step-by-step sequence, never several faces, never split the image into panels or a grid. Keep the line art, face, pose, framing and paper exactly the same — only add the makeup color on the face and neck. Do not draw hands, tools, products or any other object. No text, no letters, no labels.`
  const fd = new FormData()
  fd.append('model', 'gpt-image-2'); fd.append('size', '1024x1536'); fd.append('quality', 'high')
  fd.append('image', new Blob([png], { type: 'image/png' }), 'blank.png'); fd.append('prompt', prompt)
  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const headers: Record<string, string> = {}
  let url = 'https://api.openai.com/v1/images/edits'
  if (base && env.CF_AIG_TOKEN) { url = `${base}/v1/images/edits`; headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}` }
  else { if (base) url = `${base}/v1/images/edits`; headers.Authorization = `Bearer ${env.OPENAI_API_KEY}` }
  const res = await fetch(url, { method: 'POST', headers, body: fd })
  const text = await res.text()
  if (!res.ok) { console.error('FAIL', id, res.status, text.slice(0, 200)); process.exitCode = 1; return }
  await sharp(Buffer.from(JSON.parse(text).data[0].b64_json, 'base64')).webp({ quality: 85 }).toFile(out)
  console.log('ok', id)
}))
