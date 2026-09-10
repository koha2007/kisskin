// ════════════════════════════════════════════════════════════════════
// "나만의 메이크업 찾았다" — 베이스 민낯 모델 5장 (얼굴형별)
// ────────────────────────────────────────────────────────────────────
// P1 의 모델 얼굴 생성은 이 베이스 위에 4종 결과 메이크업만 올린다
// (functions/api/dna-portrait.ts). 베이스는 조합과 무관하게 5장이면 끝 —
// 그래서 여기서 한 번 만들어 커밋하고, 런타임엔 재생성하지 않는다.
//
// 사용:
//   set -a && . ./.dev.vars && set +a
//   node scripts/gen-dna-portraits.mjs           # 없는 것만
//   node scripts/gen-dna-portraits.mjs --force   # 전부 다시
//   node scripts/gen-dna-portraits.mjs --dry     # 프롬프트만(과금 0)
//
// 비용: Imagen 5장 ≈ $0.2. 산출물: public/dna/base-<shape>.webp (960×1440, 3:4)
// ════════════════════════════════════════════════════════════════════
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { IMAGE_MODEL, generateImageB64 } from './_geminiImage.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public/dna')

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const DRY = args.includes('--dry')

// 얼굴형별 모델 — 인종 제한 없음(§8 개정). 얼굴형 특징이 또렷하게 읽히도록 각각 다른 인물.
const MODELS = {
  oval: {
    subject: 'a woman in her mid 20s with a balanced oval face, smooth jawline and long straight dark hair pulled back',
    backdrop: 'clean warm ivory studio wall',
  },
  round: {
    subject: 'a woman in her early 20s with a soft round face, full cheeks and a sleek low bun',
    backdrop: 'pale grey seamless studio backdrop',
  },
  square: {
    subject: 'a woman in her late 20s with a defined square face, strong angular jaw and blunt-cut shoulder-length hair',
    backdrop: 'cool graphite studio background',
  },
  oblong: {
    subject: 'a woman in her mid 20s with a long oblong face, high forehead and long soft waves framing the face',
    backdrop: 'soft taupe studio wall',
  },
  heart: {
    subject: 'a woman in her early 20s with a heart-shaped face, wide forehead, narrow pointed chin and a centre-parted lob',
    backdrop: 'soft blush pink seamless backdrop',
  },
}

// 완전 민낯. gen-look-models.mjs 의 beforePrompt 와 같은 레시피(에디토리얼 + 실제 피부결).
function barePrompt(m) {
  return [
    `A beauty portrait photograph of ${m.subject}, looking straight at the camera with a calm, relaxed, neutral expression.`,
    'Her face is completely bare: absolutely no makeup at all — no foundation, no lipstick, no eyeshadow, no eyeliner, no blush, no mascara.',
    'Clean natural skin with visible pores and real texture, natural untouched eyebrows, natural lip colour.',
    'Composition: head-and-shoulders beauty portrait, face fully visible and centred, front-facing, vertical 3:4 frame, even framing with room above the head.',
    'Lighting: soft diffused even studio light, no harsh shadows on the face.',
    `Background: ${m.backdrop}.`,
    'Editorial beauty advertising photography, realistic skin texture with visible pores, natural retouching, sharp focus on the face, shallow depth of field.',
    'Show only the person — no product packaging, no tubes, no bottles, no text, no props.',
  ].join(' ')
}

async function main() {
  const shapes = Object.keys(MODELS)

  if (DRY) {
    for (const s of shapes) {
      console.log(`\n──── base-${s} ────\n` + barePrompt(MODELS[s]))
    }
    console.log('\n--dry: 과금 없음.')
    return
  }

  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) throw new Error('GEMINI_API_KEY 없음 (set -a && . ./.dev.vars && set +a)')
  const sharp = (await import('sharp')).default

  mkdirSync(OUT_DIR, { recursive: true })
  let made = 0

  for (const s of shapes) {
    const out = resolve(OUT_DIR, `base-${s}.webp`)
    if (!FORCE && existsSync(out)) {
      console.log(`· base-${s}: 이미 있음 — 건너뜀 (--force 로 재생성)`)
      continue
    }
    console.log(`▶ base-${s} 생성(${IMAGE_MODEL})…`)
    let b64
    for (let i = 0; i < 3 && !b64; i++) {
      b64 = await generateImageB64(geminiKey, barePrompt(MODELS[s]), '3:4')
      if (!b64) console.warn(`  ↻ 빈 응답 — 재시도 ${i + 1}`)
    }
    if (!b64) { console.error(`  ✖ base-${s}: 생성 실패`); continue }
    await sharp(Buffer.from(b64, 'base64')).resize(960, 1440, { fit: 'cover' }).webp({ quality: 84 }).toFile(out)
    made++
    console.log(`  ✅ base-${s}.webp`)
  }

  writeFileSync(
    resolve(OUT_DIR, 'README.md'),
    '# 나만의 메이크업 찾았다 — 베이스 민낯 모델\n\n' +
      '`scripts/gen-dna-portraits.mjs` 산출물. 얼굴형(oval/round/square/oblong/heart)별 민낯 모델 1장.\n' +
      'P1 의 `functions/api/dna-portrait.ts` 가 이 위에 4종 결과 메이크업을 올린다.\n' +
      '재생성: `set -a && . ./.dev.vars && set +a && node scripts/gen-dna-portraits.mjs --force`\n',
  )
  console.log(`\n완료: ${made}장 → ${OUT_DIR}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
