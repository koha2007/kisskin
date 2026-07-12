// ════════════════════════════════════════════════════════════════════
// 룩 카드용 비포/애프터 모델 이미지 생성 (9룩 × 1명씩)
// ────────────────────────────────────────────────────────────────────
// 왜: 스타일 선택 화면(MakeupStyleSelect)의 9칸이 무드 그라데이션뿐이라 "이 룩이
//     실제로 어떤 얼굴이 되는지" 를 못 보여준다. 홈 마퀴의 기존 룩 이미지는 디테일·
//     색감·각도가 /products 의 Imagen 컷보다 떨어진다(운영자 판단) → 같은 Imagen
//     레시피로 다시 만든다.
//
// 정직성(§8): 애프터는 **라이브 도구와 똑같은 경로**로 만든다.
//   비포(Imagen 민낯 모델) → gpt-image-2 /v1/images/edits + promptWholeFace(style)
//   즉 화면에 걸리는 애프터는 "우리 도구가 그 비포에 실제로 만들어낸 결과" 다.
//   프롬프트는 src/lib/makeup/styles.ts 를 esbuild 로 그대로 가져와 쓴다(복붙 금지 —
//   프롬프트가 갈라지면 데모와 실제 결과가 달라진다).
//
// 사용:
//   set -a && . ./.dev.vars && set +a
//   node scripts/gen-look-models.mjs            # 없는 것만 생성(재실행 안전)
//   node scripts/gen-look-models.mjs --force    # 전부 다시 생성
//   node scripts/gen-look-models.mjs --only=blood-lip
//   node scripts/gen-look-models.mjs --dry      # 프롬프트만 출력(과금 0)
//
// 비용(대략): Imagen 9장 + gpt-image-2(medium) 9장 ≈ $1.1. --dry 로 먼저 확인할 것.
// 산출물: public/styles/looks/{styleId}-before.webp, {styleId}-after.webp
// ════════════════════════════════════════════════════════════════════
import { mkdirSync, existsSync, writeFileSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public/styles/looks')

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'imagen-4.0-generate-001'
const EDIT_MODEL = 'gpt-image-2'

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const DRY = args.includes('--dry')
const ONLY = args.find((a) => a.startsWith('--only='))?.slice(7)

// ── 프로덕션 스타일 정의를 그대로 가져온다(프롬프트 단일 소스) ──
async function loadStyles() {
  const esbuild = (await import('esbuild')).default
  const tmp = resolve(ROOT, 'node_modules/.cache/kisskin-styles.mjs')
  mkdirSync(dirname(tmp), { recursive: true })
  await esbuild.build({
    entryPoints: [resolve(ROOT, 'src/lib/makeup/styles.ts')],
    outfile: tmp,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
  })
  const mod = await import(`file://${tmp}?t=${Date.now()}`)
  rmSync(tmp, { force: true })
  return { MAKEUP_STYLES: mod.MAKEUP_STYLES, promptWholeFace: mod.promptWholeFace }
}

// ── 9명: 룩마다 다른 모델. 글로벌 전환(§8 개정) → 인종 제한 없음. ──
// 룩의 무드에 맞는 인물/구도를 짝지어 카드가 다양하게 보이도록 한다.
const MODELS = {
  'natural-glow': {
    subject: 'a young Korean woman in her early 20s with a soft heart-shaped face and long straight black hair',
    light: 'soft diffused morning window light',
    backdrop: 'clean warm ivory studio wall',
  },
  'cloud-skin': {
    subject: 'a young East Asian woman in her mid 20s with a round face and a sleek low bun',
    light: 'flat cloudy-day daylight, very even and shadowless',
    backdrop: 'pale grey seamless studio backdrop',
  },
  'blood-lip': {
    subject: 'a young Korean woman in her mid 20s with a sharp jawline and blunt-cut shoulder-length dark hair',
    light: 'dramatic single-source light with deep falloff',
    backdrop: 'deep charcoal studio background',
  },
  'maximalist-eye': {
    subject: 'a young Latina woman in her early 20s with wavy brown hair and expressive brows',
    light: 'colourful gelled studio light with a subtle purple rim',
    backdrop: 'dark plum gradient backdrop',
  },
  'metallic-eye': {
    subject: 'a young Black woman in her mid 20s with deep brown skin and short natural curls',
    light: 'crisp specular light that catches highlights on the skin',
    backdrop: 'cool graphite studio background',
  },
  'bold-lip': {
    subject: 'a young Southeast Asian woman in her late 20s with a long bob and centre part',
    light: 'clean beauty-dish light straight on',
    backdrop: 'soft blush pink seamless backdrop',
  },
  'blush-draping': {
    subject: 'a young South Asian woman in her early 20s with long dark wavy hair',
    light: 'warm golden-hour side light',
    backdrop: 'sunlit peach wall with soft shadow',
  },
  grunge: {
    subject: 'a young white woman in her early 20s with messy shoulder-length hair and freckles',
    light: 'moody low-key light with hard shadows',
    backdrop: 'dark textured concrete wall',
  },
  'kpop-idol': {
    subject: 'a young Korean woman in her early 20s with straight black hair and see-through bangs',
    light: 'bright glossy K-pop stage lighting, glowing and clean',
    backdrop: 'pastel lilac gradient backdrop',
  },
}

// 비포 = 완전 민낯. (제품 컷을 비포로 쓸 수 없는 이유가 이것 — 이미 메이크업이 올라가 있다.)
// gen-products.mjs 의 사진 레시피(에디토리얼 뷰티 + 모공 보이는 실제 피부결)를 따른다.
function beforePrompt(m) {
  return [
    `A beauty portrait photograph of ${m.subject}, looking straight at the camera with a calm, relaxed expression.`,
    'Her face is completely bare: absolutely no makeup at all — no foundation, no lipstick, no eyeshadow, no eyeliner, no blush, no mascara.',
    'Clean natural skin with visible pores and real texture, natural untouched eyebrows, natural lip colour.',
    'Composition: head-and-shoulders beauty portrait, face fully visible and centred, front-facing, vertical 3:4 frame.',
    `Lighting: ${m.light}. Background: ${m.backdrop}.`,
    'Editorial beauty advertising photography, realistic skin texture with visible pores, natural retouching, sharp focus on the face, shallow depth of field.',
    'Show only the person — no product packaging, no tubes, no bottles, no text.',
  ].join(' ')
}

async function imagen(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:predict?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '3:4' } }),
  })
  if (!res.ok) throw new Error(`imagen ${res.status}: ${(await res.text()).slice(0, 160)}`)
  const j = await res.json()
  return j?.predictions?.[0]?.bytesBase64Encoded
}

// 라이브 Worker(functions/api/makeup-edit.ts)와 동일한 호출 — 같은 모델·같은 프롬프트.
async function makeupEdit(apiKey, pngBuf, prompt) {
  const fd = new FormData()
  fd.append('model', EDIT_MODEL)
  fd.append('image', new Blob([pngBuf], { type: 'image/png' }), 'image.png')
  fd.append('prompt', prompt)
  fd.append('size', 'auto')
  fd.append('quality', 'medium')
  fd.append('n', '1')
  const res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd,
  })
  if (!res.ok) throw new Error(`openai ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const j = await res.json()
  const b64 = j?.data?.[0]?.b64_json
  if (!b64) throw new Error('openai: 이미지 없음')
  return Buffer.from(b64, 'base64')
}

async function main() {
  const { MAKEUP_STYLES, promptWholeFace } = await loadStyles()
  const geminiKey = process.env.GEMINI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  const sharp = (await import('sharp')).default

  const styles = MAKEUP_STYLES.filter((s) => (ONLY ? s.id === ONLY : true))
  if (!styles.length) throw new Error(`--only=${ONLY} 에 해당하는 스타일 없음`)

  if (DRY) {
    for (const s of styles) {
      const m = MODELS[s.id]
      console.log(`\n──── ${s.id} (${s.nameKo}) ────`)
      console.log('[BEFORE / Imagen]\n' + beforePrompt(m))
      console.log('\n[AFTER / gpt-image-2]\n' + promptWholeFace(s).slice(0, 400) + ' …')
    }
    console.log('\n--dry: 과금 없음. 실제 생성은 --dry 없이 실행.')
    return
  }
  if (!geminiKey) throw new Error('GEMINI_API_KEY 없음')
  if (!openaiKey) throw new Error('OPENAI_API_KEY 없음')

  mkdirSync(OUT_DIR, { recursive: true })
  let made = 0

  for (const s of styles) {
    const m = MODELS[s.id]
    if (!m) { console.warn(`⚠ ${s.id}: 모델 정의 없음 — 건너뜀`); continue }
    const beforePath = resolve(OUT_DIR, `${s.id}-before.webp`)
    const afterPath = resolve(OUT_DIR, `${s.id}-after.webp`)
    if (!FORCE && existsSync(beforePath) && existsSync(afterPath)) {
      console.log(`· ${s.id}: 이미 있음 — 건너뜀 (--force 로 재생성)`)
      continue
    }

    // 1) 비포 — Imagen 민낯 모델. 안전필터로 빈 응답이 오면 재시도.
    console.log(`▶ ${s.id} (${s.nameKo}) — 비포 생성…`)
    let b64
    for (let i = 0; i < 3 && !b64; i++) {
      b64 = await imagen(geminiKey, beforePrompt(m))
      if (!b64) console.warn(`  ↻ 빈 응답 — 재시도 ${i + 1}`)
    }
    if (!b64) { console.error(`  ✖ ${s.id}: 비포 생성 실패 — 건너뜀`); continue }
    const beforeRaw = Buffer.from(b64, 'base64')
    await sharp(beforeRaw).resize(960, 1280, { fit: 'cover' }).webp({ quality: 82 }).toFile(beforePath)

    // 2) 애프터 — 라이브와 동일한 gpt-image-2 whole-face 편집.
    console.log(`  … 애프터 생성(gpt-image-2)…`)
    const pngIn = await sharp(beforeRaw).resize(960, 1280, { fit: 'cover' }).png().toBuffer()
    try {
      const afterRaw = await makeupEdit(openaiKey, pngIn, promptWholeFace(s))
      await sharp(afterRaw).resize(960, 1280, { fit: 'cover' }).webp({ quality: 82 }).toFile(afterPath)
    } catch (e) {
      console.error(`  ✖ ${s.id}: 애프터 실패 — ${e.message}`)
      continue
    }
    made++
    console.log(`  ✅ ${s.id}: before+after 저장`)
  }

  writeFileSync(
    resolve(OUT_DIR, 'README.md'),
    '# 룩 카드 비포/애프터\n\n' +
      '`scripts/gen-look-models.mjs` 산출물. 비포=Imagen 민낯 모델, ' +
      '애프터=비포를 라이브와 동일한 gpt-image-2 + promptWholeFace() 로 편집한 실제 결과.\n' +
      '재생성: `set -a && . ./.dev.vars && set +a && node scripts/gen-look-models.mjs --force`\n',
  )
  console.log(`\n완료: ${made}룩 생성 → ${OUT_DIR}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
