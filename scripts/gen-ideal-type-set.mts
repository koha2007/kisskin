// AI 이상형 테스트 — 무료 그림 64장 (2026-11-25, docs/IDEAL_TYPE_PLAN.md 0절 · 화풍 B안)
//   8유형 × 남·여 × Q1 장소 4 = 64장. 같은 사람이 4곳에 나오도록:
//   ① 기준 16장 = 한강 피크닉(generations) → ② 나머지 48장 = 기준 그림을 넣은 edits(같은 사람·옷, 장소만 바꿈)
//   npx tsx scripts/gen-ideal-type-set.mts            (없는 것만, gpt-image-2 high 장당 ≈ $0.165~0.18)
//   결과: tmp-ideal-type/set/{type}-{m|f}-{place}.webp (검수 뒤 public/ideal-type/ 로 옮김)
//   인물은 모두 한국인 — 동물 유형을 특정 인종에 짝지으면 고정관념이 될 수 있어서(11/25).
import { existsSync, mkdirSync, readFileSync, copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const env: Record<string, string> = Object.fromEntries(readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const OUT = resolve(ROOT, 'tmp-ideal-type/set')
mkdirSync(OUT, { recursive: true })

const STYLE = 'Bold cut-paper collage poster in the spirit of Henri Matisse\'s late cut-outs, combined with risograph print grain and visible gouache brush texture. Built from layered, scissor-cut and slightly torn paper shapes with visible edges and tiny misregistration, like a real handmade print, not digital. The figure is drawn simply and graphically (simplified features, a few confident lines), charming and stylish, never hyper-detailed or glossy. Limited palette: warm cream paper, deep navy, terracotta, and ONE signature type color used boldly. Whole figure from head to shoes, and background, composed as one poster. IMPORTANT layout: keep the top 15% and the bottom 20% of the image as calm plain cream paper (nothing important there, feet end above the bottom 20%), for text added later. Not a photograph, not 3D, not anime. No text, no letters, no numbers, no signs, no logos, no watermark. Fully clothed, non-sexual, friendly.'

type G = 'm' | 'f'
interface TypeDef { color: string; motif: string; face: string; outfit: Record<G, string> }
const TYPES: Record<string, TypeDef> = {
  'golden-retriever': { color: 'golden mustard yellow', motif: 'a small golden retriever', face: 'gentle down-turned eyes, a big warm open smile, soft wavy hair', outfit: { m: 'cream cable-knit sweater, light-wash denim, white sneakers, canvas tote', f: 'cream cable-knit cardigan over a white tee, light-wash denim, white sneakers, canvas tote' } },
  'black-cat': { color: 'inky black with a plum undertone', motif: 'a small sleek black cat', face: 'upturned cat-like eyes, calm cool expression with a faint smile, sleek hair', outfit: { m: 'black minimal knit, black wide trousers, black loafers', f: 'black minimal knit dress, black ankle boots, small black shoulder bag' } },
  fox: { color: 'burnt terracotta orange', motif: 'a small fox', face: 'narrow elegant eyes, sharp jawline, a knowing smile', outfit: { m: 'beige trench coat over a shirt, slim trousers, brown loafers', f: 'beige trench coat, silk blouse, straight trousers, brown loafers' } },
  bunny: { color: 'blush pink', motif: 'a small white bunny', face: 'big round eyes, a sweet smile showing front teeth, soft bangs', outfit: { m: 'pastel blue cardigan, white collared shirt, cream chinos, white sneakers', f: 'pastel pink cardigan, white collared blouse, pleated skirt, Mary Jane shoes' } },
  'teddy-bear': { color: 'warm cocoa brown', motif: 'a small teddy bear', face: 'round soft face, gentle sleepy eyes, cozy smile', outfit: { m: 'oversized brown corduroy jacket, wide cream trousers, chunky shoes', f: 'oversized brown fleece jacket, wide cream trousers, chunky shoes' } },
  deer: { color: 'soft sage green', motif: 'a small deer', face: 'big clear doe eyes, long neck, serene expression', outfit: { m: 'loose white linen shirt, sage linen trousers, leather sandals', f: 'loose white linen shirt dress, sage cardigan, leather flats' } },
  wolf: { color: 'deep crimson red', motif: 'a small wolf', face: 'strong thick brows, angular jaw, intense steady gaze', outfit: { m: 'black leather jacket, grey hoodie, cargo trousers, combat boots', f: 'black leather jacket, grey crop hoodie, cargo trousers, combat boots' } },
  dino: { color: 'bright teal green', motif: 'a small friendly dinosaur', face: 'bold clear features, wide bright grin, sporty short hair', outfit: { m: 'technical windbreaker, track pants, trail sneakers, cap', f: 'technical windbreaker, leggings with shorts, trail sneakers, cap' } },
}
const PLACES: Record<string, string> = {
  picnic: 'a picnic by the Han River in Seoul suggested with a few big cut-paper shapes — a checkered blanket, a river band, a simple bridge silhouette and N Seoul Tower',
  lpbar: 'a cozy LP bar at night — shelves of vinyl records, a turntable, a warm lamp glow, a small bar table',
  exhibition: 'a bright art gallery — large abstract cut-paper artworks on white walls, a gallery bench',
  amusement: 'an amusement park at dusk — a Ferris wheel, a carousel and string lights',
}
const person = (t: TypeDef, g: G, typeName: string) => `A young Korean ${g === 'm' ? 'man' : 'woman'} in their late 20s with a "${typeName.replace('-', ' ')}" vibe: ${t.face}. Outfit: ${t.outfit[g]}.`

function endpoint(path: string) {
  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const headers: Record<string, string> = {}
  let url = `https://api.openai.com/v1/images/${path}`
  if (base && env.CF_AIG_TOKEN) { url = `${base}/v1/images/${path}`; headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}` }
  else { if (base) url = `${base}/v1/images/${path}`; headers.Authorization = `Bearer ${env.OPENAI_API_KEY}` }
  return { url, headers }
}

async function save(text: string, out: string) {
  await sharp(Buffer.from(JSON.parse(text).data[0].b64_json, 'base64')).webp({ quality: 88 }).toFile(out)
}

async function generate(id: string, prompt: string) {
  const { url, headers } = endpoint('generations')
  headers['Content-Type'] = 'application/json'
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ model: 'gpt-image-2', prompt, size: '1024x1536', quality: 'high', n: 1 }) })
  const text = await res.text()
  if (!res.ok) throw new Error(`${id} ${res.status} ${text.slice(0, 200)}`)
  await save(text, resolve(OUT, `${id}.webp`))
}

async function edit(id: string, basePath: string, prompt: string) {
  const { url, headers } = endpoint('edits')
  const png = await sharp(basePath).png().toBuffer()
  const fd = new FormData()
  fd.append('model', 'gpt-image-2'); fd.append('size', '1024x1536'); fd.append('quality', 'high')
  fd.append('image', new Blob([png], { type: 'image/png' }), 'base.png'); fd.append('prompt', prompt)
  const res = await fetch(url, { method: 'POST', headers, body: fd })
  const text = await res.text()
  if (!res.ok) throw new Error(`${id} ${res.status} ${text.slice(0, 200)}`)
  await save(text, resolve(OUT, `${id}.webp`))
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const x = items[i++]; try { await fn(x) } catch (e) { console.error('FAIL', (e as Error).message); process.exitCode = 1 } } }))
}

// 이미 승인한 B안 샘플(강아지상 남 × 한강)을 기준 그림으로 재사용
const approved = resolve(ROOT, 'tmp-ideal-type/golden-retriever-m-picnic-b.webp')
if (existsSync(approved) && !existsSync(resolve(OUT, 'golden-retriever-m-picnic.webp'))) copyFileSync(approved, resolve(OUT, 'golden-retriever-m-picnic.webp'))

const combos = Object.keys(TYPES).flatMap((t) => (['m', 'f'] as G[]).map((g) => ({ t, g })))
const phase = process.argv[2] || 'all'

if (phase === 'base' || phase === 'all') {
  await pool(combos.filter(({ t, g }) => !existsSync(resolve(OUT, `${t}-${g}-picnic.webp`))), 4, async ({ t, g }) => {
    const def = TYPES[t]
    await generate(`${t}-${g}-picnic`, `${person(def, g, t)} Scene: ${PLACES.picnic}. Signature type color: ${def.color} (a big bold paper shape behind the figure). Hidden type motif: ${def.motif} as a cut-paper silhouette somewhere in the scene.\n\n${STYLE}`)
    console.log('ok base', t, g)
  })
}
if (phase === 'places' || phase === 'all') {
  const jobs = combos.flatMap((c) => ['lpbar', 'exhibition', 'amusement'].map((p) => ({ ...c, p }))).filter(({ t, g, p }) => !existsSync(resolve(OUT, `${t}-${g}-${p}.webp`)) && existsSync(resolve(OUT, `${t}-${g}-picnic.webp`)))
  await pool(jobs, 4, async ({ t, g, p }) => {
    const def = TYPES[t]
    await edit(`${t}-${g}-${p}`, resolve(OUT, `${t}-${g}-picnic.webp`), `Make a new poster in exactly the same art style, featuring the SAME person (same face, hair and outfit) from this image, now in a new scene: ${PLACES[p]}. Keep the signature type color (${def.color}) as one big bold paper shape, and hide ${def.motif} as a small cut-paper silhouette in the scene. Different natural pose fitting the place.\n\n${STYLE}`)
    console.log('ok place', t, g, p)
  })
}
