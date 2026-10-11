// 메이크업 클래스 → 단계 전환 영상(Kling v3 Pro, 시작/끝 프레임)
// ────────────────────────────────────────────────────────────────────
// gen-class-media.mjs 가 만든 step-0..N 사진을 9:16 로 맞춘 뒤, (k-1 → k) 쌍마다 3초 클립을 만든다.
// 손·도구 없이 "화장이 서서히 올라오는" 변신만 — AI 영상은 손과 브러시 접촉에 약하다.
// fal.ai kling v3 pro i2v ≈ $0.14/s → 3초 × N개. generate_audio=false 필수.
//
// 사용: node --env-file=.env scripts/gen-class-video.mjs <lesson-slug> [--dir=casting/class/<slug>] [--only=k,k]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const slug = args.find((a) => !a.startsWith('--'))
const opt = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1] || d
const DIR = opt('dir', `casting/class/${slug}`)
const ONLY = opt('only', '') ? opt('only').split(',').map(Number) : null
const FAL = process.env.FAL_KEY
const lesson = JSON.parse(readFileSync('src/lib/class/lessons.json', 'utf8')).find((l) => l.slug === slug)
if (!lesson || !FAL) { console.error('lesson/FAL_KEY 없음'); process.exit(1) }
const auth = { Authorization: `Key ${FAL}` }

// 2:3 → 9:16 (가운데 크롭, 1080×1920) jpg — Kling 입력도 이 비율이라야 출력이 세로로 나온다
function to916(k) {
  const out = `${DIR}/step-${k}-9x16.jpg`
  if (!existsSync(out)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${DIR}/step-${k}.png`, '-vf', 'scale=-2:1920:flags=lanczos,crop=1080:1920', '-q:v', '2', out])
  return out
}

async function upload(path) {
  const init = await fetch('https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3', {
    method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_type: 'image/jpeg', file_name: path.split('/').pop() }),
  }).then((r) => r.json())
  if (!init.upload_url) throw new Error('upload init: ' + JSON.stringify(init).slice(0, 200))
  const put = await fetch(init.upload_url, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: readFileSync(path) })
  if (!put.ok) throw new Error('upload put ' + put.status)
  return init.file_url
}

const MOTION = {
  skin: 'her skin gradually becomes smoother, more even and softly luminous',
  brows: 'her eyebrows gradually fill in with soft hair-like definition',
  eyes: 'soft eyeshadow, a thin lash-line liner and mascara gradually appear on her eyes',
  cheeks: 'a soft blush gradually blooms on her cheeks with a gentle highlight on the cheekbones',
  lips: 'her lips gradually take on a soft rosy colour',
}
const NEG = 'hands, fingers, brush, sponge, tools, products, blur, distort, low quality, different person, face changing, morphing face, grey hair, silver hair, text, watermark, talking'
const ENDPOINT = 'https://queue.fal.run/fal-ai/kling-video/v3/pro/image-to-video'

const jobs = []
for (const [i, s] of lesson.steps.entries()) {
  const k = i + 1
  if (ONLY && !ONLY.includes(k)) continue
  const outMp4 = `${DIR}/clip-${k}.mp4`
  if (existsSync(outMp4)) { console.log(`clip ${k} exists`); continue }
  const [a, b] = [await upload(to916(k - 1)), await upload(to916(k))]
  const body = {
    start_image_url: a, end_image_url: b, duration: '3', generate_audio: false, cfg_scale: 0.5, negative_prompt: NEG,
    prompt: `Static camera, front-facing beauty portrait on a plain light background. She stays still and looks calmly into the camera, breathing softly, one slow natural blink. Over the clip, ${MOTION[s.area] || 'the makeup gradually appears'} — as if painted by invisible hands, no hands or tools ever appear. Keep the woman's face, identity, hair and features exactly the same throughout. Photorealistic, soft studio light. No speech, no text.`,
  }
  const q = await fetch(ENDPOINT, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json())
  if (!q.status_url) { console.log(`clip ${k} queue FAIL`, JSON.stringify(q).slice(0, 300)); continue }
  console.log(`clip ${k} queued`, q.request_id)
  jobs.push({ k, q, outMp4 })
}

await Promise.all(jobs.map(async ({ k, q, outMp4 }) => {
  for (;;) {
    await new Promise((r) => setTimeout(r, 10000))
    const st = await fetch(q.status_url, { headers: auth }).then((r) => r.json())
    if (st.status === 'COMPLETED') break
    if (st.status !== 'IN_QUEUE' && st.status !== 'IN_PROGRESS') throw new Error(`clip ${k} ${JSON.stringify(st).slice(0, 200)}`)
  }
  const res = await fetch(q.response_url, { headers: auth }).then((r) => r.json())
  const url = res.video?.url
  if (!url) throw new Error(`clip ${k} no video ${JSON.stringify(res).slice(0, 200)}`)
  writeFileSync(outMp4, Buffer.from(await (await fetch(url)).arrayBuffer()))
  console.log(`clip ${k} ✓`)
}))
console.log('done')
