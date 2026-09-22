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

// ── 9명 캐스팅 (2026-09-22 저녁 재개정) ───────────────────────────
// 1차(오전)는 "평균 미인으로 수렴하는 것"을 막으려고 반대쪽 끝까지 갔다 — 무서운 눈빛,
// 놀란 표정, 넋 나간 표정을 **프롬프트로 직접 지시했다**. 운영자 검수에서 4·5·6·7·8 이
// 전부 걸렸고(무섭다 / 남자 같다 / 아줌마 같다 / 이상하다), 원인은 캐스팅이 아니라
// 그 지시문이었다. 룩 카드는 "나도 저렇게 되고 싶다" 를 파는 자리인데 모델이 무서우면
// 그 룩은 안 팔린다.
//
// 재개정의 기준(운영자 지시): **그 메이크업이 가장 잘 사는 "대표 미인형" 얼굴** +
// 완전 생얼. 단 "미인" 한 단어만 주면 1차에서 겪은 그 수렴(9명이 다 같은 사람)이 그대로
// 돌아온다. 그래서 미인형으로 올리되 **얼굴 안 변수는 계속 못 박는다**:
//   ① shape  — face-shape 도구의 5종을 배분(oval·round·square·oblong·heart).
//              9명이 확실히 달라 보이고, "우리가 분류하는 얼굴형이 다 여기 있다" 는
//              제품 일관성도 생긴다.
//   ② 문화권 — 룩마다 그 룩이 가장 잘 사는 곳으로 배정한다(다양성이 장식이 아니라 근거가
//              된다). 구글 유입의 42% 가 영어권이라 9명 전원 동아시아는 그 자체로 손해다.
//   ③ age    — 20대 6 · 30대 3. 나이 포용은 매출로 증명돼 있고("같은 나이대가 쓰는 걸 봐야
//              산다"), 자기 얼굴 미리보기 제품엔 더 직결된다. 다만 **지쳐 보이게 만들지
//              않는다** — 1차의 '흰머리 + 기미 + 팔자주름' 조합이 30대 후반을 40대 중반으로
//              읽히게 만들었다(운영자 지적 "아줌마 같다"). 나이는 뼈대와 눈매로 읽히게 한다.
//   ④ asym   — 완벽한 대칭은 기억에 안 남는다. 룩마다 **약한** 비대칭 하나씩.
//   ⑤ expr   — 전원 편안한 표정(옅은 미소 또는 힘 뺀 무표정). 시선은 전원 정면 고정,
//              고개 각도만 ±8도로 변주. ⚠ 'intense / startled / slack' 같은 지시 금지 —
//              1차에서 걸린 세 장이 정확히 그 세 단어였다.
// ⚠ 다양성·얼굴형을 빼면 기본값("마르고 갸름한 20대") 으로 되돌아간다. 지우지 말 것.
const MODELS = {
  // 1 · 물광 — 촉촉함이 가장 잘 보이는 건 볼이 도톰하고 피부결이 고운 얼굴.
  'natural-glow': {
    subject:
      'a beautiful Korean woman in her mid 20s with a warm neutral complexion. FACE SHAPE: round — full '
      + 'cheeks and a soft rounded jawline; do NOT slim it into an oval. FEATURES: large softly rounded eyes '
      + 'with a subtle inner double eyelid, a small rounded nose tip, naturally full lips. '
      + 'ASYMMETRY: her left eye is very slightly smaller than her right. '
      + 'SKIN: dewy and healthy with fine visible pores and a soft natural flush on the cheeks. '
      + 'HAIR: long softly layered hair in natural dark brown. '
      + 'EXPRESSION: relaxed and warm, a very faint closed-mouth smile. '
      + 'Head turned 5 degrees to her right, eyes looking straight into the camera',
    light: 'soft diffused frontal light',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  // 2 · 클라우드 스킨 — 뽀얀 무결점 베이스가 사는 건 얇고 투명한 피부.
  'cloud-skin': {
    subject:
      'a beautiful East Asian woman in her early 20s with a fair cool-toned complexion. FACE SHAPE: oval — '
      + 'fine delicate bone structure, narrow shoulders, a long neck. FEATURES: gently tapered eyes with inner '
      + 'double eyelids, a slim straight nose bridge, a softly defined cupid\u2019s bow. '
      + 'ASYMMETRY: her hair parting sits slightly off-centre. '
      + 'SKIN: thin porcelain-clear skin, luminous, with fine pores visible on the nose. '
      + 'HAIR: shoulder-length blunt lob in natural dark brown. '
      + 'EXPRESSION: calm and serene, lips softly closed, eyes relaxed. '
      + 'Head straight on, eyes looking straight into the camera',
    light: 'broad flat overcast daylight with no shadows',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  // 3 · 블러드 립 — 강한 레드가 가장 잘 사는 건 또렷한 이목구비와 각진 턱선.
  'blood-lip': {
    subject:
      'a striking East Asian woman in her early 30s with a mid-tone complexion. FACE SHAPE: square — a clean '
      + 'angular jaw and wide cheekbones; strong elegant bone structure. FEATURES: sharply defined horizontally '
      + 'long eyes, straight brows, a straight nose, a crisp well-drawn lip line. '
      + 'ASYMMETRY: her chin sits very slightly to the left. '
      + 'SKIN: smooth and even with real texture; her early 30s reads in the bone structure and the eyes, '
      + 'not in wrinkles or pigmentation. HAIR: jaw-length blunt bob in glossy natural black. '
      + 'EXPRESSION: composed and confident, chin level, lips softly closed — poised, never stern. '
      + 'Head turned 6 degrees to her left, eyes looking straight into the camera',
    light: 'a single soft directional light with a gentle shadow on the opposite side of the face',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  // 4 · 맥시멀 아이 — 눈이 캔버스인 룩. 크고 깊은 눈매가 대표형이다.
  //    1차 실패 원인: 'intense focused gaze with tension in the eyes' → 무서운 인상.
  'maximalist-eye': {
    subject:
      'a beautiful South Asian woman in her mid 20s with a warm glowing brown complexion. FACE SHAPE: heart — '
      + 'a broad forehead, high cheekbones and a softly pointed chin. FEATURES: large deep-set expressive eyes '
      + 'with a naturally deep eyelid crease, elegant full brows, a straight nose, full lips. '
      + 'ASYMMETRY: her two brows sit at slightly different heights. '
      + 'SKIN: radiant and even with a natural sheen on the cheekbones. '
      + 'HAIR: long voluminous glossy waves in natural dark brown-black. '
      + 'EXPRESSION: soft and open, eyes relaxed with no tension in the brow, a barely-there closed-mouth smile. '
      + 'Head straight on, eyes looking straight into the camera',
    light: 'soft frontal beauty-dish light with a gentle catchlight in the eyes',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  // 5 · 메탈릭 아이 — 펄이 가장 아름답게 튀는 건 깊은 피부톤.
  //    1차 실패 원인: 짧은 컬 보브 + 단단한 정면광 + 무표정이 겹쳐 남성적으로 읽혔다.
  //    → 길이를 명시하고(어깨 아래), 빛을 부드럽게, 옅은 미소를 넣는다.
  'metallic-eye': {
    subject:
      'a beautiful Black woman in her late 20s with deep brown skin and warm golden undertones. '
      + 'FACE SHAPE: oblong — a long elegant face with high cheekbones and a long neck. '
      + 'FEATURES: large almond eyes with long lashes, a softly rounded nose, beautifully full lips, '
      + 'softly arched brows and a delicate jawline — clearly feminine. '
      + 'ASYMMETRY: one corner of her mouth lifts slightly more than the other. '
      + 'SKIN: smooth with a natural luminous sheen on the cheekbones. '
      + 'HAIR: long voluminous natural curls falling well BELOW the shoulders in dark brown-black — '
      + 'definitely not a short crop and not a jaw-length bob. '
      + 'EXPRESSION: warm and relaxed with a soft closed-mouth smile. '
      + 'Head turned 7 degrees to her right, eyes looking straight into the camera',
    light: 'soft wrapped frontal light that keeps the jawline gentle',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  // 6 · 볼드 립 — 또렷한 입술이 주인공. 30대 초반으로 내리고 '지쳐 보이는' 요소를 뺀다.
  //    1차 실패 원인: 30대 후반 + 흰머리 + 기미 + 팔자주름 + 넓은 어깨 = "아줌마 같다".
  //    나이·문화권·둥근 얼굴은 유지한다(20대 일색이 되면 이 룩을 실제로 사는 층이 사라진다).
  'bold-lip': {
    subject:
      'a beautiful Southeast Asian woman in her early 30s with a warm golden tan complexion. '
      + 'FACE SHAPE: round — full cheeks and a soft rounded jawline, a naturally wider face; '
      + 'do NOT slim it into an oval. FEATURES: warm almond eyes, a softly rounded nose, '
      + 'naturally full well-shaped lips — her mouth is the most striking thing about her. '
      + 'ASYMMETRY: a dimple on one cheek only. '
      + 'SKIN: healthy, even and glowing with real texture — no grey hairs, no pigmentation patches, '
      + 'no emphasised nasolabial folds. Her early 30s reads as confidence, not fatigue. '
      + 'HAIR: long straight glossy hair in rich natural dark brown. '
      + 'EXPRESSION: a confident, genuinely warm closed-mouth smile. '
      + 'Head straight on, eyes looking straight into the camera',
    light: 'clean bright frontal light',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  // 7 · 블러쉬 드레이핑 — 광대를 타고 올라가는 룩이라 광대가 예쁜 얼굴이 대표형.
  //    1차 실패 원인: 'eyes opened wide as if mildly startled' → 놀란 얼굴.
  'blush-draping': {
    subject:
      'a beautiful Latina/Mediterranean woman in her mid 20s with a warm olive complexion. FACE SHAPE: heart — '
      + 'a broad forehead, a softly pointed chin and beautifully prominent cheekbones. '
      + 'FEATURES: large dark almond eyes with long lashes, a straight elegant nose, softly full lips, '
      + 'naturally defined brows. ASYMMETRY: one cheekbone catches the light slightly more than the other. '
      + 'SKIN: a light scatter of freckles across the nose and cheekbones — keep them, they are part of her '
      + 'beauty; otherwise smooth and glowing. '
      + 'HAIR: shoulder-length soft layers with light curtain bangs, natural warm brown. '
      + 'EXPRESSION: relaxed and gently smiling with the eyes, mouth softly closed. '
      + 'Head turned 5 degrees to her left, eyes looking straight into the camera',
    light: 'slightly warm soft frontal light',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  // 8 · 그런지 — 창백하고 서늘한 시크함. 1차 실패 원인: 'completely slack and indifferent'
  //    + 마른 몸 + 헝클어진 머리 → "표정이 이상하다". 쿨한 것과 넋 나간 건 다르다.
  grunge: {
    subject:
      'a beautiful white European woman in her late 20s with a very fair cool complexion and grey-green eyes. '
      + 'FACE SHAPE: oblong — a long face with an elegant narrow chin and high forehead. '
      + 'FEATURES: cool hooded eyes with a strong lash line, a long straight nose, a defined lip line, '
      + 'softly full brows. ASYMMETRY: one eyelid is a little more hooded than the other. '
      + 'SKIN: very fair and fine with a light scatter of freckles across the nose; healthy, not gaunt. '
      + 'HAIR: a well-cut textured shag with curtain bangs in cool natural dark brown — styled, not messy. '
      + 'EXPRESSION: cool and self-possessed, lips softly closed, gaze steady and calm — aloof, never vacant. '
      + 'Head turned 8 degrees to her left, eyes looking straight into the camera',
    light: 'soft directional light with gentle contrast',
    backdrop: 'flat matte warm grey studio wall, colour #D6D3CE',
  },
  // 9 · K-팝 아이돌 — 운영자 검수 통과(9번). 그대로 둔다.
  'kpop-idol': {
    subject:
      'a beautiful Korean woman in her early 20s with a fair luminous complexion. FACE SHAPE: small oval — '
      + 'a small face with a delicate jawline. FEATURES: large double-lidded eyes, a small straight nose, '
      + 'full lips. ASYMMETRY: when she smiles only one eye creases more. '
      + 'SKIN: clear thin skin with a soft flush on the cheeks and fine pores on the nose. '
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
    // 비포의 일은 "애프터가 얼마나 달라졌는지" 를 증명하는 것이다. 그래서 화장기를 지우는
    // 정도가 아니라 **눈썹까지 손대지 않은 상태**로 못 박는다(운영자 지시 2026-09-22).
    // ⚠ 다만 눈썹을 아예 없애지는 않는다 — 라이브 애프터 경로(promptWholeFace)는 얼굴을
    //   보존하라는 지시가 강해서, 비포에 눈썹이 없으면 **애프터에도 눈썹이 안 생긴다.**
    //   '숱이 옅고 다듬지 않은 자연 눈썹' 이 비포/애프터 둘 다 사는 유일한 지점이다.
    'Her face is completely bare: absolutely no makeup at all — no foundation, no concealer, no lipstick,',
    'no eyeshadow, no eyeliner, no blush, no mascara, no lash curling, no contouring, no highlighter.',
    'Her eyebrows are completely untouched: sparse, uneven and NOT groomed, plucked, shaped, trimmed, tinted',
    'or filled in — thin and patchy with gaps where the hairs are naturally missing, yet still clearly present.',
    'Natural bare lip colour, natural lashes, clean skin with visible pores and real texture, no filter.',
    // ⚠ 이 문단이 "9명이 다 같은 사람" 을 막는다. 2026-09-22 오전판은 이걸 "미인으로 만들지
    //   말라" 로 풀었다가 무섭고 이상한 얼굴들이 나왔다(운영자 검수에서 5장 반려).
    //   미인형은 허용하되, **수렴을 막는 일은 얼굴형·이목구비 지시에 맡긴다.**
    'She is a conventionally beautiful editorial beauty model — the kind of face this makeup look is made for.',
    'CRITICAL — she must be clearly her own person, not a generic AI beauty: follow the face shape, face width,',
    'jawline and feature proportions specified above exactly; do NOT slim every face into the same oval and do',
    'NOT give every model the same eyes, nose and lips. Keep the small asymmetry described above.',
    'Beautiful but unretouched — model-casting polaroid energy, real skin, no beauty filter.',
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
