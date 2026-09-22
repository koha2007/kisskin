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
//   node scripts/gen-look-models.mjs --only=grunge --out-dir=/tmp/looks --force
//                                               # 운영 파일을 안 건드리고 검증만
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
// 기본 출력 = 운영에 걸리는 룩 카드. --out-dir 로 딴 데 뽑으면 라이브를 건드리지 않고
// 프롬프트만 검증할 수 있다(2026-09-22). 검증 없이 곧바로 운영 파일을 덮지 말 것.
const OUT_DIR = resolve(
  ROOT,
  process.argv.slice(2).find((a) => a.startsWith('--out-dir='))?.slice('--out-dir='.length)
    ?? 'public/styles/looks',
)

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

// ── 9명 캐스팅 (2026-09-22 개정) ─────────────────────────────────────
// 인종·피부톤만 지정했더니 **9명이 다 같은 사람처럼 나왔다.** 전부 갸름한 계란형에
// 20대 초중반, 같은 이목구비 비율, 같은 무표정 — 다양성 축이 "피부색 + 헤어"뿐이었다.
// AI 는 얼굴을 자유롭게 두면 "미의 평균"으로 수렴한다("10,000명 얼굴을 평균내면
// 대칭적이지만 기억에 남지 않는 얼굴 하나가 나온다"). 브랜드 가이드 없이 AI 크리에이티브를
// 쓴 브랜드는 브랜드 회상률이 35% 떨어졌다는 측정도 있다.
//
// 그래서 얼굴 밖 변수를 고정한 채(배경·의상·크롭) **얼굴 안 변수를 못 박는다**:
//   ① shape  — 우리 face-shape 도구의 5종을 배분(oval·round·square·oblong·heart).
//              모델이 확실히 달라 보이고, "우리가 분류하는 얼굴형이 다 여기 있다"는
//              제품 일관성도 생긴다.
//   ② age    — 20대 6 · 30대 3(후반 1명). 나이 포용은 매출로 증명돼 있다
//              (Laura Geller 'Own Your Age' MIV 105%↑, 60대+ 캠페인 매출 20%↑).
//              특히 "같은 나이대가 쓰는 걸 봐야 산다" — 자기 얼굴 미리보기 제품엔 더 직결.
//   ③ asym   — 완벽한 대칭은 시각적으로 잊힌다. 룩마다 비대칭 한 가지를 지정한다.
//   ④ skin   — 주근깨·점·주름·기미. 2026 캐스팅 기준은 완벽함이 아니라 "물음표를 남기는 얼굴".
//   ⑤ expr/angle — 표정과 고개 각도(±8도)를 변주한다. **시선은 전원 정면 고정**.
// ⚠ 다양성은 저절로 안 된다. 빼면 기본값("마르고 갸름한 20대")으로 되돌아간다.
const MODELS = {
  'natural-glow': {
    subject:
      'a Korean woman in her mid 20s with a neutral mid-tone complexion. FACE SHAPE: round — her face is '
      + 'as wide as it is long, with full cheeks and a soft jawline; do NOT slim it into an oval. '
      + 'FEATURES: monolid eyes that slope down slightly at the outer corners, a low rounded nose tip, '
      + 'medium-thickness lips, thick straight brows. ASYMMETRY: her left eye is slightly smaller than her right. '
      + 'SKIN: visible pores around the nose, a soft natural flush on both cheeks. '
      + 'HAIR: long layered hair in natural dark brown. '
      + 'EXPRESSION: a very faint closed-mouth smile, relaxed eyes. '
      + 'Head turned 5 degrees to her right, eyes looking straight into the camera',
    light: 'soft diffused frontal light',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  'cloud-skin': {
    subject:
      'an East Asian woman in her early 20s with a fair cool-toned complexion. FACE SHAPE: oval — fine bone '
      + 'structure, narrow shoulders, a long neck. FEATURES: inner double eyelids, a slim straight nose bridge, '
      + 'a thin upper lip, sparse brows. ASYMMETRY: her parting sits off-centre so the two sides of her forehead '
      + 'are exposed unevenly. SKIN: two or three healed acne marks on the forehead. '
      + 'HAIR: shoulder-length blunt lob in natural dark brown. '
      + 'EXPRESSION: completely neutral, lips parted just slightly. '
      + 'Head straight on, eyes looking straight into the camera',
    light: 'broad flat overcast daylight with no shadows',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  'blood-lip': {
    subject:
      'an East Asian woman in her mid 30s with a mid-tone complexion. FACE SHAPE: square — an angular jaw, '
      + 'wide cheekbones and a broad face; strong bone structure. FEATURES: sharply defined horizontally long '
      + 'eyes, thick straight brows, a straight nose, a crisp cupid\u2019s bow. ASYMMETRY: her chin sits very '
      + 'slightly to the left. SKIN: fine lines at the outer eyes and faint nasolabial folds — her mid-30s must '
      + 'read naturally; do NOT erase them. HAIR: jaw-length blunt bob in natural black. '
      + 'EXPRESSION: chin lifted very slightly, detached, looking straight ahead. '
      + 'Head turned 6 degrees to her left, eyes looking straight into the camera',
    light: 'a single directional light with a soft shadow falling on the opposite side of the face',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  'maximalist-eye': {
    subject:
      'a South Asian woman in her mid 20s with a warm brown complexion. FACE SHAPE: heart — a broad forehead, '
      + 'a pointed chin and prominent cheekbones. FEATURES: large deep-set eyes, thick bold natural brows, '
      + 'a nose with wide nostrils, full lips. ASYMMETRY: her two brows sit at noticeably different heights. '
      + 'SKIN: a few small moles on the forehead and chin. '
      + 'HAIR: long voluminous waves in natural dark brown-black. '
      + 'EXPRESSION: an intense focused gaze with tension in the eyes, mouth closed. '
      + 'Head straight on, eyes looking straight into the camera',
    light: 'frontal beauty-dish light with a crisp catchlight in the eyes',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  'metallic-eye': {
    subject:
      'a Black woman in her early 30s with deep brown skin and golden undertones. FACE SHAPE: oblong — a long '
      + 'face with high cheekbones and a long neck. FEATURES: almond eyes, a wide nose, full lips, dark brows. '
      + 'ASYMMETRY: one corner of her mouth sits higher than the other. SKIN: faint horizontal lines on the '
      + 'forehead, natural sheen on the cheeks. HAIR: shoulder-length voluminous curls in natural dark brown-black. '
      + 'EXPRESSION: calm and composed, no smile. '
      + 'Head turned 7 degrees to her right, eyes looking straight into the camera',
    light: 'slightly harder frontal light that catches crisp highlights on the skin',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  'bold-lip': {
    subject:
      'a Southeast Asian woman in her late 30s with a warm tan complexion. FACE SHAPE: round and wide — full '
      + 'cheeks, a rounded jawline, sturdy broad shoulders and a shortish neck. She carries more weight than a '
      + 'typical fashion model; do NOT make her slim. FEATURES: small round eyes, a low wide nose, full lips. '
      + 'ASYMMETRY: a dimple on one cheek only. SKIN: expression lines at the eyes and mouth, faint pigmentation '
      + 'on the cheekbones — her late 30s must read naturally. '
      + 'HAIR: long straight hair in dark brown with a few grey strands. '
      + 'EXPRESSION: a confident closed-mouth smile. '
      + 'Head straight on, eyes looking straight into the camera',
    light: 'clean bright frontal light',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  'blush-draping': {
    subject:
      'a Latina/Mediterranean woman in her mid 20s with an olive complexion. FACE SHAPE: heart — a broad '
      + 'forehead, a pointed chin, prominent cheekbones. FEATURES: an aquiline nose with a visible bridge curve, '
      + 'large dark eyes, thin lips, dark brows. ASYMMETRY: her nose bends very slightly to one side. '
      + 'SKIN: heavy freckling across the nose and both cheeks — do NOT remove it. '
      + 'HAIR: shoulder-length layers with light curtain bangs, natural brown. '
      + 'EXPRESSION: eyes opened wide as if mildly startled, mouth closed. '
      + 'Head turned 5 degrees to her left, eyes looking straight into the camera',
    light: 'slightly warm frontal light',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  grunge: {
    subject:
      'a white European woman in her late 20s with a very pale cool complexion and grey-brown eyes. '
      + 'FACE SHAPE: oblong — a long face with a narrow chin and an angular forehead. FEATURES: hooded eyes '
      + 'where the lid covers the crease, thin sparse brows, a long straight nose, thin lips. '
      + 'ASYMMETRY: her eyes are set wide apart and one lid is more hooded than the other. '
      + 'SKIN: very pale and thin enough that veins show at the neck and collarbone; freckles on the nose. '
      + 'HAIR: textured shag cut in natural dark ash brown. '
      + 'EXPRESSION: completely slack and indifferent, lips slightly parted. '
      + 'Head turned 8 degrees to her left, eyes looking straight into the camera',
    light: 'moody low-key light with real contrast',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  'kpop-idol': {
    subject:
      'a Korean woman in her early 20s with a fair complexion. FACE SHAPE: small oval — a small face with a '
      + 'delicate jawline. FEATURES: large double-lidded eyes, a small straight nose, full lips. '
      + 'ASYMMETRY: when she smiles only one eye creases more. SKIN: clear thin skin with a soft flush on the '
      + 'cheeks and fine pores on the nose. '
      + 'HAIR: long glossy hair with face-framing layers, natural dark brown. '
      + 'EXPRESSION: a bright smile that reaches the eyes, mouth closed. '
      + 'Head turned 5 degrees to her right, eyes looking straight into the camera',
    light: 'clean bright high-key light',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
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
    `A beauty portrait photograph of ${m.subject}.`,
    'Her face is completely bare: absolutely no makeup at all — no foundation, no lipstick, no eyeshadow, no eyeliner, no blush, no mascara.',
    'Clean natural skin with visible pores and real texture, natural untouched eyebrows, natural lip colour.',
    // ⚠ 이 문단이 "9명이 다 같은 사람" 을 막는다. MODELS 의 얼굴형·비대칭 지시가 아무리
    //   구체적이어도, 이 금지가 없으면 모델이 전부 갸름한 계란형 미인으로 수렴한다(실측).
    'CRITICAL — do not beautify: this is a distinctive real model, not a conventionally pretty face.',
    'Do NOT converge on the smooth average-attractive AI face. Follow the face shape, face width, jawline',
    'and feature proportions specified above exactly; do NOT slim the face into an oval by default.',
    'Do NOT make the face perfectly symmetrical — keep the asymmetry described above. Do NOT slim her body.',
    'Unretouched model-casting polaroid energy.',
    `Composition: head-and-shoulders beauty portrait, face fully visible and centred, vertical ${RATIO} frame.`,
    'Her eyes look straight into the camera in every case, even when her head is turned slightly.',
    'Wearing an oatmeal-beige ribbed crew-neck sleeveless top; only shoulders and neckline visible, no chest exposed.',
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
