// ════════════════════════════════════════════════════════════════════
// 럭키 메이크업 9종 페이스 차트 (2026-10-24)
// ────────────────────────────────────────────────────────────────────
// 운영자 10/22: "메이크업 따라하기는 /looks/ 9룩 방식 그대로, 같은 여자로".
// → 9룩 차트와 **같은 빈 도안**(public/looks/charts/blank.webp)에 럭키 룩 메이크업만 칠한다.
//   같은 도안이라 CHART_CROP·CHART_ZONE(src/lib/looks/howto.ts) 좌표를 그대로 쓴다.
// 칠할 내용은 src/lib/fortune/howto.ts 단계(제목·스와치)에서 만든다(복붙 금지).
//
// 사용(유료 — 샘플 먼저: feedback_paid_bulk_generation_preflight):
//   npx tsx scripts/gen-lucky-charts.mts --dry            # 프롬프트만(과금 0)
//   npx tsx scripts/gen-lucky-charts.mts --only=wealth    # 샘플 1장
//   npx tsx scripts/gen-lucky-charts.mts                  # 없는 것만
// 비용: gpt-image-2 high 1024×1536 ≈ $0.22/장 → 9장 ≈ $2
// 산출물: public/fortune/charts/{id}.webp
// ════════════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { FORTUNE_LOOKS } from '../src/lib/fortune/looks'
import { LUCKY_HOWTO } from '../src/lib/fortune/howto'

const ROOT = resolve(import.meta.dirname, '..')
const BLANK = resolve(ROOT, 'public/looks/charts/blank.webp')
const OUT = resolve(ROOT, 'public/fortune/charts')
const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const FORCE = args.includes('--force')
const ONLY = args.find((a) => a.startsWith('--only='))?.slice(7)

const env: Record<string, string> = Object.fromEntries(
  readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }),
)

const makeupOf = (id: keyof typeof LUCKY_HOWTO) =>
  LUCKY_HOWTO[id].steps.map((s) => `${s.titleEn} (colours ${s.swatches.join(', ')})`).join('; ')

mkdirSync(OUT, { recursive: true })
const blankPng = await sharp(BLANK).png().toBuffer()

for (const look of FORTUNE_LOOKS) {
  if (ONLY && look.id !== ONLY) continue
  const out = resolve(OUT, `${look.id}.webp`)
  if (existsSync(out) && !FORCE) { console.log('skip (exists)', look.id); continue }
  const prompt =
    `Paint makeup onto this exact face chart as a makeup artist would, using real makeup textures (powder, cream, pigment, shimmer) applied on the paper. ` +
    `The look: ${look.descEn}. Finished makeup, all at once: ${makeupOf(look.id)}. Make each part clearly visible at a glance. ` +
    // 2026-10-24 travel 이 2번 연속 '단계별 4칸 그림'으로 나왔다 → 한 얼굴·완성본만 그리라고 못 박는다.
    'Show ONLY ONE face — the single finished look on the original chart. Never a step-by-step sequence, never several faces, never split the image into panels or a grid. ' +
    'Keep the line art, face, pose, framing and paper exactly the same — only add the makeup color on the face and neck. Do not draw hands, tools, products or any other object. No text, no letters, no numbers, no arrows, no logos.'
  if (DRY) { console.log(`\n── ${look.id}\n${prompt}`); continue }

  const fd = new FormData()
  fd.append('model', 'gpt-image-2')
  fd.append('size', '1024x1536')
  fd.append('quality', 'high')
  fd.append('image', new Blob([blankPng], { type: 'image/png' }), 'blank.png')
  fd.append('prompt', prompt)
  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const headers: Record<string, string> = {}
  let url = 'https://api.openai.com/v1/images/edits'
  if (base && env.CF_AIG_TOKEN) { url = `${base}/v1/images/edits`; headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}` }
  else { if (base) url = `${base}/v1/images/edits`; headers.Authorization = `Bearer ${env.OPENAI_API_KEY}` }

  const t0 = Date.now()
  const res = await fetch(url, { method: 'POST', headers, body: fd })
  const text = await res.text()
  if (!res.ok) { console.error('FAIL', look.id, res.status, text.slice(0, 300)); process.exitCode = 1; continue }
  const b64 = JSON.parse(text)?.data?.[0]?.b64_json
  if (!b64) { console.error('FAIL no image', look.id); process.exitCode = 1; continue }
  await sharp(Buffer.from(b64, 'base64')).webp({ quality: 84 }).toFile(out)
  console.log('ok', look.id, `${((Date.now() - t0) / 1000).toFixed(0)}s`)
}
