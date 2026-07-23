// ════════════════════════════════════════════════════════════════════
// 결과 페이지 무드 이미지 생성 (퍼스널컬러 4 + 얼굴형 5 + 향수 6 = 15장)
// ────────────────────────────────────────────────────────────────────
// 왜: src/lib/*/moodImages.ts 의 OVERRIDE_IMAGES 가 네 도구 모두 비어 있어서,
//     결과 페이지에서 가장 큰 카드(MoodCard)가 색면 + 이모지 하나로 폴백되고 있었다.
//     메이크업 MBTI 는 유형별 추천 룩이 실제 결과 사진과 1:1 로 연결돼 해결됐지만
//     ("Metallic Eye" → /styles/looks/metallic-eye-after.webp), 나머지 세 도구는
//     대응하는 사진 자체가 없다. 그 15자리를 채운다.
//
// 정직성(§8): 여기 사진은 **무드/장식용**이다. 진단 결과물이 아니고 실제 고객 사진도
//     아니다. 그래서 얼굴을 앞세우지 않는다 — moodImages.ts 의 "얼굴 최소화" 지침을
//     따라 퍼스널컬러·향수는 정물/색면 무드로, 얼굴형만 윤곽이 필요하므로 인물로 간다.
//
// 사용:
//   set -a && . ./.dev.vars && set +a
//   node scripts/gen-mood-images.mjs --dry        # 프롬프트만 출력(과금 0)
//   node scripts/gen-mood-images.mjs              # 없는 것만 생성(재실행 안전)
//   node scripts/gen-mood-images.mjs --force      # 전부 다시 생성
//   node scripts/gen-mood-images.mjs --only=pc-spring
//
// 비용: Imagen 15장 1회. gpt-image-2 편집 단계가 없어 룩 생성보다 싸다.
//       한 번 만들면 리포에 커밋되어 끝 — 방문자 수와 무관하게 재생성되지 않는다.
// 산출물: public/mood/{slug}.webp (3:4)
// ════════════════════════════════════════════════════════════════════
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public/mood')
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'imagen-4.0-generate-001'

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const DRY = args.includes('--dry')
const ONLY = args.find((a) => a.startsWith('--only='))?.slice(7)

const EDITORIAL =
  'Editorial beauty advertising photography, soft natural light, realistic texture, sharp focus, shallow depth of field, vertical 3:4 frame. No text, no logos, no packaging labels.'

// ── 퍼스널 컬러 4계절 ──
// 얼굴 대신 그 계절의 팔레트가 주인공이다. 색이 곧 진단 내용이라 색을 정확히 지시한다.
const PERSONAL_COLOR = [
  {
    slug: 'pc-spring',
    label: '봄 웜',
    prompt:
      'A styled flat-lay of spring warm-toned beauty materials: coral and peach silk fabric draped in soft folds, ivory ribbon, a few fresh apricot blossoms, a warm golden-yellow ceramic dish, a sprig of fresh mint. Bright clear daylight, airy and fresh, warm undertones throughout.',
  },
  {
    slug: 'pc-summer',
    label: '여름 쿨',
    prompt:
      'A styled flat-lay of summer cool-toned beauty materials: dusty rose and lavender chiffon fabric, powder-blue glass, soft grey linen, a few hydrangea petals, cool mint accents. Diffused overcast light, hazy and soft, muted cool undertones throughout.',
  },
  {
    slug: 'pc-autumn',
    label: '가을 웜',
    prompt:
      'A styled flat-lay of autumn warm-toned beauty materials: brick red and camel suede, mustard wool, olive khaki linen, dried grasses, a few amber glass beads. Low warm afternoon light with long soft shadows, earthy and deep, rich warm undertones throughout.',
  },
  {
    slug: 'pc-winter',
    label: '겨울 쿨',
    prompt:
      'A styled flat-lay of winter cool-toned beauty materials: pure white satin, jet black velvet, an icy blue glass shard, a deep burgundy ribbon, a single silver chain. Crisp high-contrast light, clean and graphic, cool undertones with strong value contrast.',
  },
]

// ── 얼굴형 5종 ──
// 여기는 얼굴 윤곽 자체가 정보라 인물로 간다. 메이크업은 최소화해 윤곽이 읽히게 한다.
const FACE_SHAPE = [
  { slug: 'fs-oval', label: '계란형', face: 'a balanced oval face shape, gently rounded jawline and forehead of similar width' },
  { slug: 'fs-round', label: '둥근형', face: 'a soft round face shape, full cheeks and a softly curved jawline, width and length nearly equal' },
  { slug: 'fs-square', label: '각진형', face: 'a defined square face shape with a strong straight jawline and broad forehead' },
  { slug: 'fs-oblong', label: '긴형', face: 'an elongated oblong face shape, noticeably longer than it is wide, with a straight cheek line' },
  { slug: 'fs-heart', label: '하트형', face: 'a heart-shaped face outline, with a broader forehead and cheekbones that taper gently toward a slim chin' },
].map((f) => ({
  ...f,
  prompt: [
    `A minimal beauty portrait of a woman with ${f.face}, hair pulled fully back off the face, looking straight at the camera with a calm neutral expression.`,
    'Bare, natural skin with visible pores and real texture — only the lightest skin tint, no lipstick, no eyeshadow, no contouring, so the outline of the face reads clearly.',
    'Composition: head-and-shoulders, face centred and fully visible, front-facing, plain seamless neutral background.',
    'Even soft frontal lighting with no harsh shadow across the jaw.',
    EDITORIAL,
  ].join(' '),
}))

// ── 향수 타입 6종 ──
// 향은 눈에 보이지 않으므로 그 향이 떠오르게 하는 장면/정물로 간다. 얼굴 없음.
const PERFUME = [
  {
    slug: 'pt-floral',
    label: '플로럴',
    prompt:
      'A soft still life of fresh flowers: pale pink peonies and white jasmine, petals loosely scattered on a linen surface, one clear unlabelled glass bottle beside them. Morning light through a sheer curtain, romantic and airy, blush and cream palette.',
  },
  {
    slug: 'pt-citrus',
    label: '시트러스',
    prompt:
      'A bright still life of citrus: halved lemon, bergamot and grapefruit on a pale stone surface, water droplets and glossy zest visible, a sprig of fresh basil, one clear unlabelled glass bottle. Crisp sunlight with sharp clean shadows, energetic yellow-green palette.',
  },
  {
    slug: 'pt-woody',
    label: '우디',
    prompt:
      'A quiet still life of woody materials: cedar wood blocks, dried vetiver root, a piece of bark, moss on dark stone, one smoked glass unlabelled bottle. Dim directional light from one side, calm and grounded, deep brown and forest green palette.',
  },
  {
    slug: 'pt-amber',
    label: '앰버',
    prompt:
      'A warm still life of amber materials: raw amber resin, dried vanilla pods, benzoin crystals and a piece of dark labdanum on aged brass, one amber-glass unlabelled bottle. Low candle-warm light with a soft glow, sensual and dense, deep gold and burnt orange palette.',
  },
  {
    slug: 'pt-fresh',
    label: '프레시',
    prompt:
      'A clean still life of fresh aquatic materials: smooth wet pebbles, a sprig of eucalyptus, sea salt crystals, clear water rippling in a shallow white dish, one frosted unlabelled bottle. Bright cool daylight, minimal and weightless, white and pale blue palette.',
  },
  {
    slug: 'pt-gourmand',
    label: '구르망',
    prompt:
      'A cosy still life of gourmand materials: a broken piece of dark chocolate, a vanilla pod, caramel drizzling over a ceramic spoon, roasted tonka beans on a warm wooden board, one rounded unlabelled bottle. Soft warm indoor light, comforting and sweet, caramel and cocoa palette.',
  },
]

// ── 메이크업 MBTI 16종 (2026-07-23 추가) ──
// 왜 이제 와서: 무드 사진 15장을 만들 때 MBTI 만 빠져 있었다. 그래서 랜딩의 16타입
// 카드가 AI 메이크업 9룩 사진을 빌려 쓰고 있었고, 16개가 9장을 나눠 쓰니 서로 다른
// 유형이 같은 얼굴로 보였다(Natural Glow 하나를 ENFJ·ISTJ·ISTP 셋이 공유).
//
// 왜 인물이 아니라 정물인가:
//   ① 얼굴을 세우면 색이 묻힌다. 16장이 한 그리드에 깔리는 화면이라 유형을 가르는 건
//      색인데, 인물 16명이 늘어서면 얼굴이 주인공이 되고 색은 배경으로 밀린다.
//      퍼스널컬러를 계절 팔레트 정물로 만든 것과 같은 이유다.
//   ② 9룩 사진은 **우리 서비스가 실제로 만드는 결과물**이다. 얼굴 16장을 새로 생성하면
//      실제 결과가 아닌 이미지가 '결과 미리보기' 자리에 앉는다. 정물은 애초에 무드라
//      그 오해가 없다. 결과 페이지는 지금처럼 추천 룩 실제 사진을 계속 쓴다.
//   ③ MBTI 결과에는 제품 추천 카드(어필리에이트)가 붙는다. 유형 카드가 '이 유형의
//      아이템'을 보여주면 그 아래 제품 카드로 시선이 이어진다.
//
// 색은 groupColors.ts 의 4역할군을 따른다 — NT 틸 / NF 세이지 / SJ 인디고 / SP 머스터드.
// 16장을 나란히 놓았을 때 개별 유형보다 **그룹이 먼저 읽혀야** 한다(16Personalities 방식).
const MBTI_SURFACE = {
  NT: 'Set on a cool teal-grey stone surface with a slate-teal backdrop; analytical, graphic, precise.',
  NF: 'Set on a soft sage-green linen surface with a muted eucalyptus backdrop; poetic, hazy, gentle.',
  SJ: 'Set on a deep indigo matte surface with a navy-blue backdrop; orderly, composed, quietly formal.',
  SP: 'Set on a warm mustard-ochre textured surface with a golden tan backdrop; spontaneous, sunlit, playful.',
}

const MBTI = [
  // NT · 분석가 (틸)
  { slug: 'mb-intj', label: 'INTJ 메탈릭 전략가', group: 'NT', subject: 'A single open eyeshadow pan of gunmetal chrome pigment, a slim steel spatula and one sharply squared-off nude lipstick bullet, arranged at exact right angles with generous empty space between them.' },
  { slug: 'mb-intp', label: 'INTP 컬러 연금술사', group: 'NT', subject: 'Loose pigment powders in six different shades poured into small glass dishes, a few colours half-mixed on a mixing palette with a spatula mid-stroke, fine dust in the air.' },
  { slug: 'mb-entj', label: 'ENTJ 파워 레드', group: 'NT', subject: 'One bold true-red lipstick bullet standing upright and perfectly centred, its cap set down beside it, lit with a single hard directional light that throws one long clean shadow.' },
  { slug: 'mb-entp', label: 'ENTP 아이디어 런웨이', group: 'NT', subject: 'A worn black kohl pencil with a smudged swatch dragged across the surface, a cracked eyeshadow pan, and a crumpled square of tissue — deliberately imperfect and mid-experiment.' },

  // NF · 외교관 (세이지)
  { slug: 'mb-infj', label: 'INFJ 몽환 시인', group: 'NF', subject: 'An open peach-rose blush compact with a soft round powder puff resting on its edge, a few dried petals scattered nearby, everything slightly out of focus at the edges.' },
  { slug: 'mb-infp', label: 'INFP 별빛 화가', group: 'NF', subject: 'A small open pot of pearlescent shimmer pigment catching the light, fine glitter dust scattered in an arc across the surface like a small galaxy, one thin fan brush beside it.' },
  { slug: 'mb-enfj', label: 'ENFJ 뮤즈', group: 'NF', subject: 'One unlabelled glass dropper bottle of dewy skin tint with a single glossy drop suspended at the tip, a folded square of silk, and a wide soft brush laid flat.' },
  { slug: 'mb-enfp', label: 'ENFP 오늘의 팔레트', group: 'NF', subject: 'A wide open eyeshadow palette of twelve pastel and bright shades, several pans already dipped into and swirled, three brushes tossed casually across it.' },

  // SJ · 관리자 (인디고)
  { slug: 'mb-istj', label: 'ISTJ 정석 장인', group: 'SJ', subject: 'Three base-makeup items — a foundation bottle, a compact and a concealer tube — lined up in a precise row with identical spacing, all facing the same direction, nothing else in frame.' },
  { slug: 'mb-isfj', label: 'ISFJ 온기 수호자', group: 'SJ', subject: 'An open cushion compact with a plush air puff resting inside it, the surface of the cushion gently dimpled from use, a folded cream cotton cloth beneath.' },
  { slug: 'mb-estj', label: 'ESTJ 공식의 지휘자', group: 'SJ', subject: 'One deep burgundy lipstick standing upright beside its own reflection in a small square mirror lying flat, edges crisp, composition strictly symmetrical.' },
  { slug: 'mb-esfj', label: 'ESFJ 모임의 주연', group: 'SJ', subject: 'A coral-pink lip tint with the applicator laid beside a bright glossy swatch, fine gold glitter scattered around, a few small confetti-like foil flakes catching light.' },

  // SP · 탐험가 (머스터드)
  { slug: 'mb-istp', label: 'ISTP 미니멀 장인', group: 'SP', subject: 'Exactly two objects: one tinted lip balm stick with the cap off and one small flat brush, placed apart with a lot of empty surface around them.' },
  { slug: 'mb-isfp', label: 'ISFP 꾸안꾸 아티스트', group: 'SP', subject: 'A soft-focus loose powder jar with its sifter open, a light dusting of powder spilled in a soft cloud, a worn natural-hair brush resting in it.' },
  { slug: 'mb-estp', label: 'ESTP 포인트 러쉬', group: 'SP', subject: 'A liquid eyeliner pen with its tip drawing one bold decisive stroke across the surface, the stroke still glossy and wet, cap knocked over beside it.' },
  { slug: 'mb-esfp', label: 'ESFP 글로우 파티', group: 'SP', subject: 'Gold and champagne glitter scattered generously across the surface, one open highlighter compact reflecting light, a fan brush loaded with shimmer.' },
].map((m) => ({
  ...m,
  prompt: [
    `A styled beauty still life, no people and no faces: ${m.subject}`,
    MBTI_SURFACE[m.group],
    'Unlabelled, unbranded products only — plain surfaces, no text, no packaging design.',
    EDITORIAL,
  ].join(' '),
}))

// ── 무료 도구 허브 카드 5종 (2026-07-23 추가, 16:9) ──
// 왜 따로 만드나: ToolCard 의 이미지 틀이 `aspect-[16/9]` + `object-top` 이다.
// 여기에 3:4 인물 사진을 넣으면 위쪽 가로 띠만 남아 **다섯 장이 전부 "눈만 보이는
// 사진"** 이 됐다. 도구가 무엇인지 구분이 안 되는 상태였다.
// → 가로 프레임에 맞춰 처음부터 구성한 그림을 따로 만든다. 얼굴형도 인물 대신
//   정물로 간다 — 16:9 로 자르면 얼굴에서 턱선(진단 내용)이 반드시 잘리기 때문이다.
//   (결과·유형 카드는 3:4 라 얼굴형만 인물을 유지한다. 틀이 다르면 답도 다르다.)
const TOOL_CARDS = [
  {
    slug: 'tool-mbti',
    label: 'MBTI 카드',
    ratio: '16:9',
    prompt:
      'A wide horizontal flat-lay of an open eyeshadow palette with sixteen distinct shades in four color families — teal, sage green, indigo, mustard — arranged in a long row across the frame, three clean brushes laid diagonally beside it. Warm cream paper surface, soft daylight from the left, no people.',
  },
  {
    slug: 'tool-personal-color',
    label: '퍼스널컬러 카드',
    ratio: '16:9',
    prompt:
      'A wide horizontal still life of four fabric swatches laid side by side in a continuous band across the frame, in this exact left-to-right order: bright coral peach, soft dusty lavender, deep mustard ochre, cool burgundy with black. Each fabric gently folded, a few dried petals scattered on the seams. Warm cream surface, soft even daylight, no people.',
  },
  {
    slug: 'tool-face-shape',
    label: '얼굴형 카드',
    ratio: '16:9',
    prompt:
      'A wide horizontal still life about facial contouring: a small oval hand mirror lying flat on the left reflecting soft light, an open contour palette with light and deep shade pans in the middle, two angled contour brushes and a blending sponge on the right. Warm cream surface, soft directional daylight casting long gentle shadows, no people, no reflection of a face in the mirror.',
  },
  {
    slug: 'tool-perfume',
    label: '향수 카드',
    ratio: '16:9',
    prompt:
      'A wide horizontal still life of perfume materials arranged in a long line across the frame: fresh peony and jasmine petals on the left, a halved bergamot in the centre-left, one unlabelled clear glass perfume bottle in the centre, cedar wood blocks and dried vetiver on the right, amber resin at the far right. Warm cream surface, soft daylight, no people, no text on the bottle.',
  },
  {
    slug: 'tool-guide',
    label: 'K-뷰티 가이드 카드',
    ratio: '16:9',
    prompt:
      'A wide horizontal still life of a K-beauty routine laid out in a row: a cushion compact, a glass skin essence bottle, a gradient lip tint, a cream blush pot and one fan brush, all unlabelled, with an open blank notebook and a pen at the right end. Warm cream surface, soft morning daylight, calm and instructional, no people, no text.',
  },
]

const ALL = [
  ...PERSONAL_COLOR.map((x) => ({ ...x, tool: '퍼스널컬러' })),
  ...FACE_SHAPE.map((x) => ({ ...x, tool: '얼굴형' })),
  ...PERFUME.map((x) => ({ ...x, tool: '향수' })),
  ...MBTI.map((x) => ({ ...x, tool: 'MBTI' })),
  ...TOOL_CARDS.map((x) => ({ ...x, tool: '도구카드' })),
].map((x) => ({ ...x, prompt: x.prompt.includes(EDITORIAL) ? x.prompt : `${x.prompt} ${EDITORIAL}` }))

async function imagen(apiKey, prompt, aspectRatio = '3:4') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:predict?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio } }),
  })
  if (!res.ok) throw new Error(`imagen ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const j = await res.json()
  const b64 = j?.predictions?.[0]?.bytesBase64Encoded
  if (!b64) throw new Error('imagen: 이미지 없음 (안전 필터에 걸렸을 수 있음)')
  return Buffer.from(b64, 'base64')
}

async function main() {
  const targets = ALL.filter((x) => (ONLY ? x.slug === ONLY : true))
  if (!targets.length) throw new Error(`--only=${ONLY} 에 해당하는 항목 없음`)

  if (DRY) {
    for (const t of targets) {
      console.log(`\n──── ${t.slug} · ${t.tool} ${t.label} ────`)
      console.log(t.prompt)
    }
    console.log(`\n--dry: 과금 없음. 대상 ${targets.length}장. 실제 생성은 --dry 없이 실행.`)
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY 없음 — set -a && . ./.dev.vars && set +a')
  const sharp = (await import('sharp')).default
  mkdirSync(OUT_DIR, { recursive: true })

  let made = 0
  let skipped = 0
  for (const t of targets) {
    const out = resolve(OUT_DIR, `${t.slug}.webp`)
    if (existsSync(out) && !FORCE) {
      console.log(`· ${t.slug} 이미 있음 — 건너뜀`)
      skipped++
      continue
    }
    try {
      const raw = await imagen(apiKey, t.prompt, t.ratio ?? '3:4')
      // 렌더되는 비율과 같게 저장한다(레이아웃 시프트 방지).
      // 결과/유형 카드는 3:4 세로, 도구 허브 카드는 16:9 가로다.
      const [rw, rh] = t.ratio === '16:9' ? [1280, 720] : [900, 1200]
      const webp = await sharp(raw).resize(rw, rh, { fit: 'cover' }).webp({ quality: 82 }).toBuffer()
      writeFileSync(out, webp)
      console.log(`✓ ${t.slug} · ${t.tool} ${t.label}  (${Math.round(webp.length / 1024)}KB)`)
      made++
    } catch (e) {
      console.error(`✗ ${t.slug}: ${e.message}`)
    }
  }
  console.log(`\n생성 ${made}장 · 건너뜀 ${skipped}장 · 저장 위치 public/mood/`)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
