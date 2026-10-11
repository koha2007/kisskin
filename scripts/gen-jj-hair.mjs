// JJ 헤어 마스터 — 같은 얼굴, 헤어만 다르게 (클래스 영상 출발 사진)
// ────────────────────────────────────────────────────────────────────
// 2026-10-11 운영자: 33편이 같은 사진이면 지루하다 + 메이크업 수업은 머리를 넘겨야 부위가 보인다.
// 마스터는 사람이 한 번 보고 고른다(얼굴이 모든 단계 사진의 출발점이라 자동 생성은 위험) →
// 고른 것을 scripts/assets/jj-hair-<style>.webp 로 두면 class-video 가 파트별로 골라 쓴다.
// gpt-image-2 edits high 1024×1536 ≈ $0.22/장.
// 사용: node --env-file=.env scripts/gen-jj-hair.mjs [--styles=headband,bun] [--n=2] [--out=casting/jj/hair]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'

const args = process.argv.slice(2)
const opt = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1] || d
const OUT = opt('out', 'casting/jj/hair'), N = +opt('n', 2), KEY = process.env.OPENAI_API_KEY
const MASTER = 'scripts/assets/jj-master.webp'

export const STYLES = {
  headband: 'All hair pulled straight back off the face with a soft plain cream fabric headband; forehead, hairline, temples and both ears fully visible; the long hair falls behind the shoulders.',
  bun: 'A sleek low bun at the nape of the neck, hair smoothly combed back from the face with a natural centre parting; jawline, both ears and the neck fully visible.',
  ponytail: 'A neat high ponytail, hair smoothly pulled up and back from the face; temples, ears and jawline fully visible; the ponytail is just visible behind her head.',
  halfup: 'Half-up hairstyle: the top section gathered loosely at the back of the head, the rest falling straight past the shoulders behind her; front strands tucked behind both ears so the cheeks and jawline are clear.',
  braid: 'One loose low side braid resting over her left shoulder (the right side of the image), hair combed back from the face; both cheeks and the jawline clear.',
  tucked: 'Hair down and long as now, but tucked neatly behind both ears and falling behind the shoulders, so the whole face, cheeks and jawline are clear.',
}

const prompt = (style) => `This is a photo edit of the attached photo. It must remain the exact same woman — only the hairstyle changes.
New hairstyle: ${STYLES[style]}
Hair colour stays exactly the same natural dark brown — never grey, silver, blonde or lighter, no highlights.
Keep IDENTICAL: her face, face shape, every facial feature, eye shape, eyebrows, nose, lip shape, moles and freckles, skin tone and texture; completely bare face with no makeup; her calm neutral expression and gaze straight into the camera; the white crew-neck T-shirt and the plain light-grey background.
Reframe as a vertical 2:3 portrait: head and shoulders, face centred in the upper middle of the frame, a little space above the head.
Realistic beauty photograph, soft even studio light, natural skin texture (no plastic smoothing). No hands, no accessories other than those named, no text.`

async function edit(style, i) {
  const out = `${OUT}/${style}-${i}.png`
  if (existsSync(out)) return console.log('  skip', out)
  for (let a = 1; a <= 2; a++) {
    const fd = new FormData()
    fd.append('model', 'gpt-image-2'); fd.append('size', '1024x1536'); fd.append('quality', 'high'); fd.append('n', '1'); fd.append('prompt', prompt(style))
    fd.append('image', new Blob([readFileSync(MASTER)], { type: 'image/webp' }), 'ref.webp')
    const r = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${KEY}` }, body: fd })
    const j = await r.json()
    if (r.ok) { writeFileSync(out, Buffer.from(j.data[0].b64_json, 'base64')); return console.log('  ok', out) }
    console.log(`  FAIL ${style}-${i} ${r.status}`, JSON.stringify(j).slice(0, 200))
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!KEY) { console.error('OPENAI_API_KEY 필요'); process.exit(1) }
  mkdirSync(OUT, { recursive: true })
  const styles = opt('styles', Object.keys(STYLES).join(',')).split(',')
  const jobs = styles.flatMap((s) => Array.from({ length: N }, (_, i) => [s, i + 1]))
  console.log(`[jj-hair] ${jobs.length}장 ≈ $${(jobs.length * 0.22).toFixed(2)}`)
  for (let k = 0; k < jobs.length; k += 4) await Promise.all(jobs.slice(k, k + 4).map(([s, i]) => edit(s, i)))
}
