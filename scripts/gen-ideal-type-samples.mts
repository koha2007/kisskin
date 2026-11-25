// AI 이상형 테스트 — 그림 샘플 (2026-11-25, docs/IDEAL_TYPE_PLAN.md 0절 3번)
//   npx tsx scripts/gen-ideal-type-samples.mts [id...]   (없는 것만, gpt-image-2 high 장당 ≈ $0.165)
//   유료 대량 생성 점검 절차: 샘플 → 운영자 OK → 나머지 62장 → 개수 대조.
//   결과는 스크래치/검수용 폴더 tmp-ideal-type/ (커밋 X). 확정되면 public/ideal-type/ 로 옮긴다.
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const env: Record<string, string> = Object.fromEntries(readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const OUT = resolve(ROOT, process.env.IDEAL_OUT || 'tmp-ideal-type')
mkdirSync(OUT, { recursive: true })

// 공통 화풍 = 지금 결과 카드(크림 종이 + 마티스풍 컷페이퍼, 테라코타·머스터드·네이비)
const STYLE = 'Fine-art fashion poster illustration, gouache and cut-paper collage in the spirit of Henri Matisse, on warm cream paper texture. Limited palette: cream, terracotta, mustard yellow, deep navy, soft sage, with one accent color. Flat shapes, visible brush texture, elegant and modern, like a gallery print. Full-body single figure, standing naturally, whole person and the background painted together as ONE scene (not a cut-out, not a collage of separate photos). Leave calm empty space in the top 15% and bottom 20% of the image for text that will be added later. Not a photograph, not 3D, not anime. No text, no letters, no logos, no watermark. Fully clothed, non-sexual, friendly.'

const SAMPLES: Record<string, string> = {
  // 강아지상(Golden Retriever) × 남 × Q1 한강 피크닉
  'golden-retriever-m-picnic': 'A young Korean man in his late 20s with a "golden retriever" vibe: gentle slightly down-turned eyes, a big warm open smile, soft wavy hair. Outfit: cream cable-knit sweater, light-wash straight denim, white sneakers, a canvas tote. Scene: a sunny riverside picnic by the Han River in Seoul — a checkered blanket, a small basket, bridges and the city skyline softly in the distance, late-afternoon golden light.',
}

const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SAMPLES)
for (const id of ids) {
  const out = resolve(OUT, `${id}.webp`)
  if (existsSync(out)) { console.log('skip', id); continue }
  const prompt = `${SAMPLES[id]}\n\n${STYLE}`
  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  let url = 'https://api.openai.com/v1/images/generations'
  if (base && env.CF_AIG_TOKEN) { url = `${base}/v1/images/generations`; headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}` }
  else { if (base) url = `${base}/v1/images/generations`; headers.Authorization = `Bearer ${env.OPENAI_API_KEY}` }
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ model: 'gpt-image-2', prompt, size: '1024x1536', quality: 'high', n: 1 }) })
  const text = await res.text()
  if (!res.ok) { console.error('FAIL', id, res.status, text.slice(0, 300)); process.exitCode = 1; continue }
  await sharp(Buffer.from(JSON.parse(text).data[0].b64_json, 'base64')).webp({ quality: 88 }).toFile(out)
  console.log('ok', id, out)
}
