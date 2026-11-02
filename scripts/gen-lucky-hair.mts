// 럭키 메이크업 — 같은 얼굴(1번 모델)의 헤어 변형 + 룩 생성 (2026-11-02)
// 예전 럭키 사진이 달라 보였던 이유 = 룩마다 다른 머리 모양. 얼굴은 고정, 헤어 형태·밝기만 바꾼 민낯을 만들고
// 거기에 라이브와 같은 promptWholeFace(look) 를 입힌다.
//   npx tsx scripts/gen-lucky-hair.mts <출력폴더> --only=marriage,health   (있는 파일 건너뜀, 유료 장당 ≈ $0.17)
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { FORTUNE_LOOKS } from '../src/lib/fortune/looks'
import { promptWholeFace } from '../src/lib/makeup/styles'

const ROOT = resolve(import.meta.dirname, '..')
const OUT = process.argv[2]
if (!OUT) throw new Error('출력 폴더를 주세요')
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',')
const env: Record<string, string> = Object.fromEntries(readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
mkdirSync(OUT, { recursive: true })

const HAIR: Record<string, string> = {
  long: 'very long straight hair with a centre parting, falling over both shoulders down the chest',
  braid: 'a single thick loose side braid resting over one shoulder, centre parting',
  ponytail: 'a high sleek ponytail with the hair pulled back, the tail visible behind one shoulder',
  headband: 'long straight hair held back with a plain wide cream fabric headband',
  halfup: 'long hair in a half-up style with the top section tied back and the rest falling over the shoulders',
  tucked: 'chin-length hair neatly tucked behind both ears',
  lowbun: 'a sleek low bun at the nape with a clean centre parting, ears visible',
}
const LOOK_HAIR: Record<string, string> = {
  wealth: 'long', love: 'halfup', marriage: 'braid', reunion: 'long', career: 'lowbun',
  exam: 'tucked', health: 'ponytail', popularity: 'long', travel: 'headband',
}
const hairPrompt = (h: string) => `Change ONLY the hairstyle of this exact same young woman to ${HAIR[h]}, and make the hair a medium natural brown. Keep the face completely unchanged: identical identity, face shape, proportions, eyes, nose, mouth, jawline, skin, expression and gaze, with the same head size and position in the frame. She wears NO makeup. Keep the same white T-shirt, plain light-grey studio background and soft light. Photorealistic, sharp focus. No text, logos or watermarks.`

async function edit(input: Buffer, prompt: string) {
  const fd = new FormData()
  fd.append('model', 'gpt-image-2'); fd.append('image', new Blob([input], { type: 'image/png' }), 'in.png')
  fd.append('prompt', prompt); fd.append('size', '1024x1536'); fd.append('quality', 'high'); fd.append('n', '1')
  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const headers: Record<string, string> = {}
  let url = 'https://api.openai.com/v1/images/edits'
  if (base && env.CF_AIG_TOKEN) { url = `${base}/v1/images/edits`; headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}` }
  else { if (base) url = `${base}/v1/images/edits`; headers.Authorization = `Bearer ${env.OPENAI_API_KEY}` }
  const res = await fetch(url, { method: 'POST', headers, body: fd })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 200)}`)
  return Buffer.from(JSON.parse(text).data[0].b64_json, 'base64')
}

const looks = FORTUNE_LOOKS.filter((l) => !ONLY || ONLY.includes(l.id))
const hairs = [...new Set(looks.map((l) => LOOK_HAIR[l.id]))]
const master = await sharp(resolve(ROOT, 'scripts/assets/model-lucky-base.webp')).png().toBuffer()
await Promise.all(hairs.map(async (h) => {
  const p = resolve(OUT, `hair-${h}.webp`)
  if (existsSync(p)) return
  await sharp(await edit(master, hairPrompt(h))).webp({ quality: 92 }).toFile(p)
  console.log('hair ok', h)
}))
const queue = looks.filter((l) => !existsSync(resolve(OUT, `lucky-${l.id}.webp`)))
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const l = queue.shift()!
    const png = await sharp(resolve(OUT, `hair-${LOOK_HAIR[l.id]}.webp`)).png().toBuffer()
    try { await sharp(await edit(png, promptWholeFace(l))).webp({ quality: 88 }).toFile(resolve(OUT, `lucky-${l.id}.webp`)); console.log('ok', l.id) }
    catch (e) { console.error('FAIL', l.id, e); process.exitCode = 1 }
  }
}))
