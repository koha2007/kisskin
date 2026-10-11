// 메이크업 클래스 → JJ 사진 3장 (민낯 · 베이스 · 완성)
// ────────────────────────────────────────────────────────────────────
// 중간 단계 사진은 만들지 않는다 — scripts/class-steps-composite.py 가 부위 마스크로 합성한다.
// (2026-10-11 실측: 사진 모델로 단계마다 이어서 수정하면 장마다 피부가 주황·거칠게 쏠렸다.)
//   bare.png    민낯 — JJ 마스터를 세로 2:3 로 정규화(이후 모든 사진과 같은 렌더 질감)
//               --bare-master: 마스터가 이미 2:3 민낯(jj-hair-*.webp)이면 다시 고치지 않고 그대로 쓴다(얼굴 쏠림 1회 줄임, 비용 0)
//   base.png    베이스만 — '시작·베이스' 파트는 베이스가 수업 내용이라 민낯을 그대로 쓴다(비용 0)
//   final.png   이 편의 메이크업 완성 — lessons.json 의 chartPrompt(페이스 차트에 그린 그 메이크업)를 사진에 적용
// gpt-image-2 edits high 1024×1536 ≈ $0.22/장 → 편당 2~3장.
//
// 사용: node --env-file=.env scripts/gen-class-media.mjs <lesson-slug> [--master=scripts/assets/jj-master.webp] [--bare-master] [--out=dir] [--force]
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const slug = args.find((a) => !a.startsWith('--'))
const opt = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1] || d
const MASTER = resolve(opt('master', 'scripts/assets/jj-master.webp'))
const OUT = resolve(opt('out', `casting/class/${slug}`))
const FORCE = args.includes('--force'), BARE_MASTER = args.includes('--bare-master')
const KEY = process.env.OPENAI_API_KEY
if (!slug || !KEY) { console.error('usage: <lesson-slug> (OPENAI_API_KEY 필요)'); process.exit(1) }

const lesson = JSON.parse(readFileSync('src/lib/class/lessons.json', 'utf8')).find((l) => l.slug === slug)
if (!lesson) { console.error('lesson 없음:', slug); process.exit(1) }
const { CURRICULUM } = await import(new URL('../src/lib/class/curriculum.ts', import.meta.url).href)
const part = CURRICULUM.find((c) => c.slug === slug)?.part
mkdirSync(OUT, { recursive: true })

// 헤어는 '사진 그대로' — 마스터마다 헤어가 다르다(jj-hair-*: 헤어밴드·번·포니테일…). '긴 생머리'라고 쓰면 묶은 머리를 풀어 버린다.
const HAIR = 'Hair stays exactly as in the photo — the same hairstyle, the same dark brown colour, parting and strands — never grey, silver or lighter.'
const KEEP = `Keep IDENTICAL: her face, face shape, every facial feature, eye shape, nose, lip shape, moles and freckles; her calm neutral expression and gaze into the camera; the same head position, framing and crop; the white T-shirt and plain light background. ${HAIR}`
const RULES = 'Realistic beauty photograph, soft even studio light, natural skin texture (no plastic smoothing). No hands, no tools, no products, no text, no arrows.'
const MIME = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' }

async function edit(src, prompt, outPath) {
  if (existsSync(outPath) && !FORCE) { console.log('  skip (exists)', outPath); return }
  for (let attempt = 1; attempt <= 2; attempt++) {
    const fd = new FormData()
    fd.append('model', 'gpt-image-2'); fd.append('size', '1024x1536'); fd.append('quality', 'high'); fd.append('n', '1'); fd.append('prompt', prompt)
    fd.append('image', new Blob([readFileSync(src)], { type: MIME[extname(src)] || 'image/png' }), `ref${extname(src)}`)
    const r = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${KEY}` }, body: fd })
    const j = await r.json()
    if (r.ok) { writeFileSync(outPath, Buffer.from(j.data[0].b64_json, 'base64')); console.log('  ok', outPath); return }
    console.log(`  FAIL ${r.status} (try ${attempt})`, JSON.stringify(j).slice(0, 300))
  }
  throw new Error('edit failed')
}

const bare = `${OUT}/bare.png`, base = `${OUT}/base.png`, final = `${OUT}/final.png`
console.log(`[class-media] ${slug} (part=${part})`)
if (BARE_MASTER) { if (!existsSync(bare) || FORCE) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', MASTER, bare]) }
else await edit(MASTER, `This is a photo edit of the attached photo. It must remain the exact same woman.
${KEEP}
Completely bare face, no makeup at all. Reframe as a vertical 2:3 portrait: head and shoulders, face centred in the upper middle of the frame, a little space above the head.
${RULES}`, bare)

const baseIsLesson = part === 'start' || part === 'base'
if (baseIsLesson) { if (!existsSync(base) || FORCE) copyFileSync(bare, base) }
else await edit(bare, `This is a photo edit of the attached photo. It must remain the exact same woman in the exact same photo.
${KEEP}
Add ONLY a light, natural base makeup: even, fresh, skin-like complexion (thin foundation, a little concealer). Keep her natural skin tone — do not make it warmer, darker or more orange. No eye makeup, no blush, no lip colour, brows unchanged.
${RULES}`, base)

await edit(base, `This is a photo edit of the attached photo. It must remain the exact same woman in the exact same photo.
${KEEP}
${baseIsLesson ? 'Apply the base makeup described below.' : 'The skin and base stay exactly as they are — do NOT change skin colour, warmth or brightness.'} Apply this makeup so it is clearly visible but realistic and wearable:
${lesson.chartPrompt}
(That description was written for a face chart — apply only the makeup itself to her real face; ignore any mention of a chart, paper, pencil or drawing.)
${RULES}`, final)
console.log('done →', OUT)
