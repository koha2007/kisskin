// ════════════════════════════════════════════════════════════════════
// 관상 메이크업 9종 예시 이미지 생성 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 정직성(§8): 9룩(gen-look-models.mjs)과 같은 원칙 — 애프터는 **라이브 도구와 똑같은 경로**
//   (gpt-image-2 /v1/images/edits + promptWholeFace(look))로 만든다. 지시문은
//   src/lib/fortune/looks.ts · src/lib/makeup/styles.ts 를 그대로 import (복붙 금지).
// 비포 = 9룩과 같은 모델 한 명(public/styles/looks/natural-glow-before.webp) — 화면 일관성.
//
// 사용(유료 — 샘플 먼저: feedback_paid_bulk_generation_preflight):
//   npx tsx scripts/gen-fortune-looks.mts --dry               # 프롬프트만(과금 0)
//   npx tsx scripts/gen-fortune-looks.mts --only=wealth       # 샘플 1장 (쉼표로 여러 개: --only=career,love)
//   npx tsx scripts/gen-fortune-looks.mts                     # 없는 것만 생성
//   npx tsx scripts/gen-fortune-looks.mts --force             # 전부 다시
// 비용: gpt-image-2 medium 1장 ≈ $0.05~0.07 → 9장 ≈ $0.6
// 산출물: public/fortune/looks/{id}-after.webp (1024×1536, 비포와 같은 크기)
// ════════════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { FORTUNE_LOOKS } from '../src/lib/fortune/looks'
import { promptWholeFace } from '../src/lib/makeup/styles'

const ROOT = resolve(import.meta.dirname, '..')
const BEFORE = resolve(ROOT, 'public/styles/looks/natural-glow-before.webp')
// 2026-10-24 운영자: 9룩과 겉모습이 같아 보인다 → 같은 얼굴(JJ)의 헤어 6종을 운 분위기에 맞춰 섞는다.
// 없는 운(재물·재회·인복)은 위 BEFORE(긴 생머리) 그대로. 지시문이 헤어 "형태"는 고정·염색만 하므로 머리 모양이 유지된다.
const JJ = (h: string) => resolve(ROOT, `scripts/assets/jj-hair-${h}.webp`)
const BEFORE_BY_ID: Record<string, string> = {
  career: JJ('bun'), exam: JJ('tucked'), love: JJ('halfup'),
  marriage: JJ('braid'), health: JJ('ponytail'), travel: JJ('headband'),
}
const OUT = resolve(ROOT, 'public/fortune/looks')
const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const FORCE = args.includes('--force')
const ONLY = args.find((a) => a.startsWith('--only='))?.slice(7).split(',')

const env: Record<string, string> = Object.fromEntries(
  readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }),
)

mkdirSync(OUT, { recursive: true })

for (const look of FORTUNE_LOOKS) {
  if (ONLY && !ONLY.includes(look.id)) continue
  const before = BEFORE_BY_ID[look.id] ?? BEFORE
  const out = resolve(OUT, `${look.id}-after.webp`)
  if (existsSync(out) && !FORCE) { console.log('skip (exists)', look.id); continue }
  const prompt = promptWholeFace(look)
  if (DRY) { console.log(`\n── ${look.id} (${before})\n${prompt}`); continue }
  const beforePng = await sharp(before).png().toBuffer()
  const { width = 1024, height = 1536 } = await sharp(before).metadata()

  const fd = new FormData()
  fd.append('model', 'gpt-image-2')
  fd.append('image', new Blob([beforePng], { type: 'image/png' }), 'before.png')
  fd.append('prompt', prompt)
  fd.append('size', '1024x1536')
  fd.append('quality', 'medium')
  fd.append('n', '1')
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
  await sharp(Buffer.from(b64, 'base64')).resize(width, height, { fit: 'cover' }).webp({ quality: 82 }).toFile(out)
  console.log('ok', look.id, `${((Date.now() - t0) / 1000).toFixed(0)}s`)
}
