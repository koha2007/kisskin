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
// 비포를 직접 캐스팅하는 경우(2026-09-22):
//   Gemini 로 비포를 뽑으면 인물 통제가 어렵고 무료티어 429 도 잦다. 그래서 운영자가
//   OpenAI Playground 등에서 **민낯 9장만** 직접 뽑아 폴더에 넣고 --before-dir 로 넘기면,
//   이 스크립트가 애프터만 라이브와 동일 경로로 생성한다. (정직성 §8 은 그대로 유지된다 —
//   손대는 건 비포 캐스팅뿐이고, 애프터는 여전히 도구가 만든다.)
//   ⚠ 애프터를 사이트에서 저장해 쓰면 안 된다. 그 저장 버튼은 공유용 카드
//     (src/lib/makeup/composite.ts, 1080×1920 + 흰 테두리·제목·로고)를 뱉는다.
//
// 사용:
//   set -a && . ./.dev.vars && set +a
//   node scripts/gen-look-models.mjs            # 없는 것만 생성(재실행 안전)
//   node scripts/gen-look-models.mjs --force    # 전부 다시 생성
//   node scripts/gen-look-models.mjs --only=blood-lip
//   node scripts/gen-look-models.mjs --dry      # 프롬프트만 출력(과금 0)
//   node scripts/gen-look-models.mjs --before-dir=./casting --force
//                                               # 민낯은 폴더에서, 애프터만 생성
//   node scripts/gen-look-models.mjs --before-dir=./casting --dry
//                                               # 어떤 파일이 어느 룩에 붙는지만 확인(과금 0)
//
// 비용(대략): Imagen 9장 + gpt-image-2(medium) 9장 ≈ $1.1.
//   --before-dir 를 쓰면 Imagen 몫이 빠져 절반 이하. --dry 로 먼저 확인할 것.
// 산출물: public/styles/looks/{styleId}-before.webp, {styleId}-after.webp
//   비포·애프터는 **항상 같은 픽셀 크기**로 저장된다(슬라이더가 두 장을 겹쳐 놓기 때문).
// ════════════════════════════════════════════════════════════════════
import { mkdirSync, existsSync, writeFileSync, rmSync, readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { IMAGE_MODEL, generateImageB64 } from './_geminiImage.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public/styles/looks')

const EDIT_MODEL = 'gpt-image-2'

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const DRY = args.includes('--dry')
const ONLY = args.find((a) => a.startsWith('--only='))?.slice(7)
/** 민낯을 직접 캐스팅해 넣는 폴더. 주면 Gemini 비포 생성을 건너뛴다. */
const BEFORE_DIR = args.find((a) => a.startsWith('--before-dir='))?.slice('--before-dir='.length)

// ── 출력 규격 ────────────────────────────────────────────────────────
// 2026-09-22: 960×1280(3:4) 고정 + fit:'cover' 였다. 운영자가 캐스팅한 민낯이
//   1024×1536(2:3) 이라 그대로 넣으면 세로 11% 가 잘려 정수리와 쇄골이 날아갔다.
//   → 기본 규격을 2:3 으로 맞추고, --ratio 로 바꿀 수 있게 열어 둔다.
//   비포는 항상 contain(레터박스 없이 딱 맞으면 무손실) 이 아니라 cover 를 쓰되,
//   입력이 목표 비율과 같으면 잘림이 0 이므로 규격만 맞추면 손실이 없다.
const RATIO = args.find((a) => a.startsWith('--ratio='))?.slice(8) || '2:3'
const [RW, RH] = RATIO.split(':').map(Number)
if (!RW || !RH) throw new Error(`--ratio=${RATIO} 형식 오류 (예: 2:3, 3:4)`)
const OUT_W = 1024
const OUT_H = Math.round((OUT_W * RH) / RW)
/** Gemini 비포 생성에 넘길 비율 문자열 — 출력 규격과 같은 값을 쓴다. */
const GEN_RATIO = `${RW}:${RH}`

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
    // 짧은 곱슬 + 실버는 "백발"로 읽혔다 → 길고 매끈한 헤어로 바꿔 염색 컬러가 드러나게.
    subject: 'a young Black woman in her mid 20s with deep brown skin and long sleek shoulder-length hair',
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

// ── --before-dir: 캐스팅한 민낯 파일을 룩에 붙이기 ──────────────────
// 운영자 파일명은 정해진 규칙이 없다(실제 예: "8. 그런지 메이크업 (GRUNGE MAKEUP)02.png",
// "1-natural-glow-before.png"). 그래서 셋 중 하나만 맞으면 잡는다.
//   ① 파일명에 styleId 가 들어간다        → "natural-glow", "naturalglow"
//   ② 파일명에 subEn 이 들어간다          → "NATURAL GLOW", "GRUNGE MAKEUP"
//   ③ 파일명이 룩 순번으로 시작한다       → "8. …", "8-…", "08_…"
// 한 룩에 여러 장이 걸리면 아래 우선순위로 한 장을 고르고 나머지는 알려준다.
//
// ⚠ "애프터를 비포로 집어가는" 사고를 막는 게 이 함수의 최우선 임무다.
//   public/styles/looks 를 그대로 --before-dir 로 넘기면 한 룩에 -before/-after 두 장이
//   걸리는데, 단순 이름순이면 'after' < 'before' 라 **애프터가 뽑힌다**. 그러면 이미 화장한
//   얼굴 위에 또 화장을 얹은 결과가 비포/애프터로 저장된다(2026-09-22 실측).
//   → 이름에 'after' 가 있으면 후보에서 제외하고, 'before' 가 있으면 먼저 쓴다.
const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp'])
const squash = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const isAfter = (f) => /after/i.test(basename(f, extname(f)))
const isBefore = (f) => /before/i.test(basename(f, extname(f)))

function indexBeforeDir(dir, styles, order) {
  let all
  try {
    all = readdirSync(dir).filter((f) => IMG_EXT.has(extname(f).toLowerCase())).sort()
  } catch (e) {
    throw new Error(`--before-dir=${dir} 를 읽을 수 없음: ${e.message}`)
  }
  // 애프터는 후보에서 통째로 뺀다(위 ⚠ 참조).
  const skippedAfter = all.filter(isAfter)
  const files = all.filter((f) => !isAfter(f))
  if (!files.length) {
    throw new Error(
      `--before-dir=${dir} 에 쓸 수 있는 민낯 이미지가 없음` +
        (skippedAfter.length ? ` (이름에 'after' 가 든 ${skippedAfter.length}장은 비포로 쓸 수 없어 제외했다)` : ''),
    )
  }

  const picked = new Map()
  const extras = new Map()
  for (const style of styles) {
    const idx = order.indexOf(style.id) + 1
    const hits = files.filter((f) => {
      const s = squash(basename(f, extname(f)))
      if (s.includes(squash(style.id))) return true
      if (s.includes(squash(style.subEn))) return true
      // 순번 접두 — "8something" 은 잡고 "80something"·"18something" 은 거르기 위해
      // 원본 파일명에서 앞자리 숫자를 그대로 떼어 비교한다.
      const lead = basename(f, extname(f)).match(/^0*(\d{1,2})\b/)
      return lead ? Number(lead[1]) === idx : false
    })
    if (hits.length) {
      // 'before' 가 이름에 있는 쪽을 먼저 쓴다 — 나머지는 이름순.
      hits.sort((a, b) => Number(isBefore(b)) - Number(isBefore(a)))
      picked.set(style.id, resolve(dir, hits[0]))
      if (hits.length > 1) extras.set(style.id, hits.slice(1))
    }
  }
  return { picked, extras, files, skippedAfter }
}

// 비포 = 완전 민낯. (제품 컷을 비포로 쓸 수 없는 이유가 이것 — 이미 메이크업이 올라가 있다.)
// gen-products.mjs 의 사진 레시피(에디토리얼 뷰티 + 모공 보이는 실제 피부결)를 따른다.
function beforePrompt(m) {
  return [
    `A beauty portrait photograph of ${m.subject}, looking straight at the camera with a calm, relaxed expression.`,
    'Her face is completely bare: absolutely no makeup at all — no foundation, no lipstick, no eyeshadow, no eyeliner, no blush, no mascara.',
    'Clean natural skin with visible pores and real texture, natural untouched eyebrows, natural lip colour.',
    `Composition: head-and-shoulders beauty portrait, face fully visible and centred, front-facing, vertical ${RATIO} frame.`,
    `Lighting: ${m.light}. Background: ${m.backdrop}.`,
    'Editorial beauty advertising photography, realistic skin texture with visible pores, natural retouching, sharp focus on the face, shallow depth of field.',
    'Show only the person — no product packaging, no tubes, no bottles, no text.',
  ].join(' ')
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

  const order = MAKEUP_STYLES.map((s) => s.id)
  const styles = MAKEUP_STYLES.filter((s) => (ONLY ? s.id === ONLY : true))
  if (!styles.length) throw new Error(`--only=${ONLY} 에 해당하는 스타일 없음`)

  // 캐스팅 폴더를 쓰면 먼저 매칭 결과를 보여준다 — 엉뚱한 얼굴에 룩이 붙는 사고를 막는다.
  let casting = null
  if (BEFORE_DIR) {
    casting = indexBeforeDir(resolve(process.cwd(), BEFORE_DIR), styles, order)
    console.log(`\n── --before-dir 매칭 (민낯 후보 ${casting.files.length}개 파일) ──`)
    if (casting.skippedAfter.length) {
      console.log(`  (이름에 'after' 가 든 ${casting.skippedAfter.length}장은 비포로 쓸 수 없어 제외)`)
    }
    for (const s of styles) {
      const p = casting.picked.get(s.id)
      console.log(p ? `  ✔ ${s.id.padEnd(15)} ← ${basename(p)}` : `  ✖ ${s.id.padEnd(15)} ← 없음`)
      for (const x of casting.extras.get(s.id) || []) console.log(`      (후보 더 있음, 안 씀: ${x})`)
    }
    const missing = styles.filter((s) => !casting.picked.has(s.id))
    if (missing.length) {
      console.log(
        `\n⚠ ${missing.length}개 룩에 민낯 파일이 없다. 파일명에 룩 이름(예: grunge / GRUNGE MAKEUP)이나\n` +
          '  룩 순번(예: "8. …")을 넣으면 붙는다. 없는 룩은 Gemini 로 비포를 만든다.',
      )
    }
  }

  if (DRY) {
    for (const s of styles) {
      const m = MODELS[s.id]
      const p = casting?.picked.get(s.id)
      console.log(`\n──── ${s.id} (${s.nameKo}) ────`)
      if (p) console.log(`[BEFORE / 캐스팅 파일] ${p}`)
      else console.log('[BEFORE / Imagen]\n' + beforePrompt(m))
      console.log('\n[AFTER / gpt-image-2]\n' + promptWholeFace(s).slice(0, 400) + ' …')
    }
    console.log(`\n출력 규격: ${OUT_W}×${OUT_H} (${RATIO})`)
    console.log('--dry: 과금 없음. 실제 생성은 --dry 없이 실행.')
    return
  }
  // 캐스팅 파일이 전부 갖춰졌으면 Gemini 는 쓰지 않는다 → 키도 요구하지 않는다.
  const needsGemini = styles.some((s) => !casting?.picked.has(s.id))
  if (needsGemini && !geminiKey) throw new Error('GEMINI_API_KEY 없음')
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

    // 1) 비포 — 캐스팅 파일이 있으면 그걸 쓰고, 없으면 Gemini 로 민낯 생성.
    let beforeRaw
    const castPath = casting?.picked.get(s.id)
    if (castPath) {
      console.log(`▶ ${s.id} (${s.nameKo}) — 비포: ${basename(castPath)}`)
      beforeRaw = readFileSync(castPath)
    } else {
      console.log(`▶ ${s.id} (${s.nameKo}) — 비포 생성(${IMAGE_MODEL})…`)
      let b64
      for (let i = 0; i < 3 && !b64; i++) {
        b64 = await generateImageB64(geminiKey, beforePrompt(m), GEN_RATIO)
        if (!b64) console.warn(`  ↻ 빈 응답 — 재시도 ${i + 1}`)
      }
      if (!b64) { console.error(`  ✖ ${s.id}: 비포 생성 실패 — 건너뜀`); continue }
      beforeRaw = Buffer.from(b64, 'base64')
    }

    // 입력이 목표 비율과 다르면 잘린다 — 캐스팅 파일은 사람이 고른 것이라 조용히 자르지 않고 알린다.
    if (castPath) {
      const meta = await sharp(beforeRaw).metadata()
      const got = meta.width / meta.height
      if (Math.abs(got - OUT_W / OUT_H) > 0.01) {
        console.warn(
          `  ⚠ 비율 불일치: 원본 ${meta.width}×${meta.height} → ${OUT_W}×${OUT_H} 로 잘린다. ` +
            `잘림 없이 쓰려면 --ratio=${meta.width}:${meta.height} 또는 원본을 ${RATIO} 로 다시 뽑을 것.`,
        )
      }
    }

    const beforePng = await sharp(beforeRaw).resize(OUT_W, OUT_H, { fit: 'cover' }).png().toBuffer()
    await sharp(beforePng).webp({ quality: 82 }).toFile(beforePath)

    // 2) 애프터 — 라이브와 동일한 gpt-image-2 whole-face 편집.
    //    입력은 위에서 규격을 맞춘 비포 그 자체다. gpt-image 가 다른 크기로 돌려줘도
    //    같은 규격으로 되맞춘다 — 비포/애프터 픽셀 크기가 다르면 슬라이더가 어긋난다.
    console.log(`  … 애프터 생성(gpt-image-2)…`)
    try {
      const afterRaw = await makeupEdit(openaiKey, beforePng, promptWholeFace(s))
      await sharp(afterRaw).resize(OUT_W, OUT_H, { fit: 'cover' }).webp({ quality: 82 }).toFile(afterPath)
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
      '`scripts/gen-look-models.mjs` 산출물. 비포=Imagen 민낯 모델(또는 `--before-dir` 로 넘긴 캐스팅 파일), ' +
      '애프터=비포를 라이브와 동일한 gpt-image-2 + promptWholeFace() 로 편집한 실제 결과.\n' +
      `규격 ${OUT_W}×${OUT_H} (${RATIO}), 비포/애프터 동일 크기.\n\n` +
      '재생성: `set -a && . ./.dev.vars && set +a && node scripts/gen-look-models.mjs --force`\n' +
      '민낯을 직접 캐스팅했다면: `node scripts/gen-look-models.mjs --before-dir=./casting --force`\n\n' +
      '⚠ 애프터를 사이트 결과 화면에서 저장해 쓰지 말 것 — 그 저장 버튼은 공유용 카드' +
      '(1080×1920 + 흰 테두리·제목·로고, `src/lib/makeup/composite.ts`)를 만든다. 여기 필요한 건 원본 사진이다.\n',
  )
  console.log(`\n완료: ${made}룩 생성 → ${OUT_DIR}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
