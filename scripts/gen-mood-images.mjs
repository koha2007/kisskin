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

const ALL = [
  ...PERSONAL_COLOR.map((x) => ({ ...x, tool: '퍼스널컬러' })),
  ...FACE_SHAPE.map((x) => ({ ...x, tool: '얼굴형' })),
  ...PERFUME.map((x) => ({ ...x, tool: '향수' })),
].map((x) => ({ ...x, prompt: x.prompt.includes(EDITORIAL) ? x.prompt : `${x.prompt} ${EDITORIAL}` }))

async function imagen(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:predict?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '3:4' } }),
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
      const raw = await imagen(apiKey, t.prompt)
      // 결과 카드가 3:4 로 렌더되므로 같은 비율로 맞춰 저장한다(레이아웃 시프트 방지).
      const webp = await sharp(raw).resize(900, 1200, { fit: 'cover' }).webp({ quality: 82 }).toBuffer()
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
