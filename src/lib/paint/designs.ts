// 페이스 페인팅 46종 — /face-paint/ (2026-11-11 2차 개편)
// ─────────────────────────────────────────────────────────────────
// 운영자 11/11(2차): "작은 무늬·얼굴 절반이 너무 단순. 글로벌 성공 사례로 다시, 시즌도 더 다양하게."
// 근거(조사 11/11):
//   · Pinterest Predicts 2026 — Glitchy Glam(weird makeup +115%), 외계 메이크업 +140%, 다크 로맨틱 +160%,
//     레이스 메이크업 +120%, 젤리 블러시 +130%, 맥시멀리즘(젬·그래픽 라이너·풀페이스)
//   · 코첼라 2025 — 진주·크리스탈 젬 매핑(눈썹뼈·눈 밑·광대), 젬 스티커 부스(Pley·Simihaze)
//   · 스티커 브랜드 — Starface 별 7,700만 개, 아이 스티커(Pley·Simihaze), 레이스(Face Lace)
//   · TikTok 할로윈 — 해골·코켓 광대·마리오네트·뱀파이어 / 크리스마스 — 캔디케인·아이스 프린세스 / 설날 — 금박·용
// 진단: 1차 무늬는 평면 클립아트 SVG → 성공 품목은 "실물 재질"(크롬·진주·홀로그램·레이스·젤리).
//   → 작은·절반 = gpt-image-1.5 투명 배경 스티커 원화(public/paint/stk/*.webp) + 그림자·눈동자 비우기 합성.
//   → 명화·시즌 = AI 로만(페인팅 모델에 예시 생성, public/paint/samples/*.webp).
//
// ⚠ 이 파일은 import 가 없어야 한다 — 샘플 생성 스크립트(node 타입 제거 실행)가 그대로 읽는다.
// 좌표 규칙: primary 무늬는 "사진의 오른쪽"(= 사람의 왼쪽) 얼굴에 붙는다. 바깥쪽 = +x.
//   origin = 기준점에 놓일 그림 안의 점(0~1 비율). mirror 가 있으면 사진 왼쪽에도 좌우 반전해 한 번 더.
//   flipArt = 원화가 반대 방향(바깥쪽이 왼쪽)으로 그려져 있음 → 그릴 때 뒤집는다.

export type PaintSize = 'small' | 'half' | 'full' | 'season'

export interface Placement {
  at: number[]
  mirror?: number[]
  /** 그림 폭 = 얼굴 폭 × w */
  w: number
  origin: [number, number]
  dx?: number
  dy?: number
  /** 기본 회전(도, 바깥쪽 끝이 위로 = 음수) */
  rot?: number
  flipArt?: boolean
}

export interface PaintDesign {
  id: string
  size: PaintSize
  ko: string
  en: string
  descKo: string
  descEn: string
  /** AI 에게 이 무늬가 무엇인지(영어) */
  prompt: string
  /** 작은·절반: 투명 배경 원화 */
  img?: string
  /** 작은·절반: SVG(가짜 주근깨처럼 점이 많은 것) */
  vb?: [number, number]
  svg?: string
  /** 'sticker' = 그림자(붙인 것) · 'paint' = 그림자 없이(칠한 것) */
  kind?: 'sticker' | 'paint'
  place?: Placement
  /** 명화·시즌: 예시 사진 */
  sample?: string
  monthKo?: string
  monthEn?: string
  /** 근거 한 줄(화면 배지) */
  tagKo?: string
  tagEn?: string
}

/** 늘 같은 점 배치(새로고침해도 주근깨가 바뀌지 않게) */
function rng(seed: number) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}
function freckleDots(seed: number, colors: string[], n: number, rMin: number, rMax: number, opMin: number, opMax: number) {
  const r = rng(seed); const out: string[] = []
  let k = 0
  while (out.length < n && k++ < n * 20) {
    const x = r() * 200, y = r() * 70
    const nose = x > 86 && x < 114 && y > 8 && y < 44
    const cheek = (x < 74 || x > 126) && y > 18 + Math.abs(x - 100) * 0.08 && y < 66 && Math.abs(x - 100) < 96
    if (!nose && !cheek) continue
    const rad = rMin + r() * (rMax - rMin), op = opMin + r() * (opMax - opMin)
    out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(2)}" fill="${colors[Math.floor(r() * colors.length)]}" opacity="${op.toFixed(2)}"/>`)
  }
  return out.join('')
}

const V = '20261111c'
const stk = (id: string) => `/paint/stk/${id}.webp?v=${V}`
const smp = (id: string) => `/paint/samples/${id}.webp?v=${V}`

// 사진 오른쪽(사람 왼쪽) landmark 와 그 반대편
const EYE_R = [362, 263, 386, 374]
const EYE_L = [133, 33, 159, 145]
const LOWER_R = [374, 380, 373]
const LOWER_L = [145, 153, 144]

export const PAINT_DESIGNS: PaintDesign[] = [
  // ───────── 작은 무늬 12 — 스티커·젬·라이너 ─────────
  {
    id: 'pearl-corner', size: 'small', ko: '진주 눈꼬리', en: 'Pearl Corners', descKo: '눈꼬리에서 올라가는 진주', descEn: 'Pearls rising from the eye corner',
    tagKo: '코첼라', tagEn: 'Coachella', kind: 'sticker', img: stk('pearl-corner'),
    prompt: 'an arc of graduated white pearls and tiny crystals glued from the outer corner of each eye sweeping up toward the temple',
    place: { at: [263], mirror: [33], w: 0.25, origin: [0.05, 0.72], dx: 0.005, rot: -18 },
  },
  {
    id: 'crystal-underline', size: 'small', ko: '눈 밑 크리스탈', en: 'Crystal Underline', descKo: '아래 속눈썹 따라 큐빅', descEn: 'Gems along the lower lashes',
    tagKo: '젬 매핑', tagEn: 'Gem mapping', kind: 'sticker', img: stk('crystal-underline'),
    prompt: 'a fine curved line of tiny clear iridescent rhinestones glued just under the lower lash line of each eye, larger toward the outer corner',
    place: { at: LOWER_R, mirror: LOWER_L, w: 0.24, origin: [0.45, 0.2], dy: 0.03 },
  },
  {
    id: 'freckles', size: 'small', ko: '가짜 주근깨', en: 'Faux Freckles', descKo: '콧등과 볼에 자연스러운 점', descEn: 'Soft dots across nose and cheeks',
    tagKo: '틱톡 페이스 아트', tagEn: 'TikTok face art', kind: 'paint', vb: [200, 70],
    svg: freckleDots(7, ['#7b4a2e', '#8a5634', '#6a3f27'], 90, 0.8, 1.9, 0.32, 0.6),
    prompt: 'soft natural-looking faux freckles in warm brown dotted across the bridge of the nose and the upper cheeks',
    place: { at: [5], w: 0.74, origin: [0.5, 0.31], dy: -0.075 },
  },
  {
    id: 'gold-freckles', size: 'small', ko: '금박 주근깨', en: 'Gold Leaf Freckles', descKo: '콧등·볼에 금박 조각', descEn: 'Gold flakes across nose and cheeks',
    tagKo: '설날 트렌드', tagEn: 'Lunar New Year', kind: 'paint', vb: [200, 70],
    svg: freckleDots(19, ['#d4a017', '#f2c94c', '#b8860b', '#ffe08a'], 120, 1.0, 2.5, 0.8, 1),
    prompt: 'tiny flakes of real gold leaf scattered like freckles across the bridge of the nose and both upper cheeks',
    place: { at: [5], w: 0.74, origin: [0.5, 0.31], dy: -0.075 },
  },
  {
    id: 'chrome-stars', size: 'small', ko: '크롬 별', en: 'Chrome Stars', descKo: '광대 위 은빛 별 스티커', descEn: 'Silver star stickers on the cheekbone',
    tagKo: '스타페이스', tagEn: 'Starface', kind: 'sticker', img: stk('chrome-stars'),
    prompt: 'three puffy liquid-chrome silver star stickers (one large, two small) on the upper cheekbone near the outer eye',
    place: { at: [346], w: 0.2, origin: [0.5, 0.5], dx: 0.0, dy: 0.04 },
  },
  {
    id: 'holo-hearts', size: 'small', ko: '홀로그램 하트', en: 'Holo Hearts', descKo: '볼에 무지갯빛 하트 셋', descEn: 'Three iridescent hearts on the cheek',
    tagKo: '스티커 뷰티', tagEn: 'Sticker beauty', kind: 'sticker', img: stk('holo-hearts'),
    prompt: 'three holographic iridescent heart stickers in pink, lilac and aqua foil on one cheek',
    place: { at: [280], w: 0.22, origin: [0.5, 0.5], dx: 0.0 },
  },
  {
    id: 'jelly-heart', size: 'small', ko: '젤리 하트 블러시', en: 'Jelly Heart Blush', descKo: '양 볼에 말랑한 하트', descEn: 'Glossy jelly hearts on both cheeks',
    tagKo: '젤리 블러시 +130%', tagEn: 'Jelly blush +130%', kind: 'sticker', img: stk('jelly-heart'),
    prompt: 'a glossy translucent rosy-pink jelly heart on the apple of each cheek, like a gummy candy with a wet highlight',
    place: { at: [280], mirror: [50], w: 0.13, origin: [0.5, 0.5], dx: 0.0 },
  },
  {
    id: 'coquette-bow', size: 'small', ko: '코켓 리본', en: 'Coquette Bow', descKo: '눈 밑 핑크 리본과 진주', descEn: 'A pink bow with pearls',
    tagKo: '코켓 무드', tagEn: 'Coquette', kind: 'sticker', img: stk('coquette-bow'),
    prompt: 'a small pale pink satin ribbon bow with three tiny dangling pearls placed on the cheekbone just below the outer corner of one eye',
    place: { at: [346], w: 0.17, origin: [0.5, 0.35], dx: -0.01, dy: 0.05 },
  },
  {
    id: 'floating-liner', size: 'small', ko: '떠 있는 라이너', en: 'Floating Liner', descKo: '쌍꺼풀 위 선 + 꼬리', descEn: 'Floating crease line + wing',
    tagKo: '그래픽 라이너', tagEn: 'Graphic liner', kind: 'paint', img: stk('floating-liner'),
    prompt: 'graphic eyeliner: a thin glossy black floating line drawn above each eye crease and a sharp black wing flicked out toward the temple',
    place: { at: EYE_R, mirror: EYE_L, w: 0.36, origin: [0.4, 1.8] },
  },
  {
    id: 'double-wing', size: 'small', ko: '더블 윙', en: 'Double Wing', descKo: '두 갈래로 뻗은 꼬리', descEn: 'Two stacked wings',
    tagKo: '그래픽 라이너', tagEn: 'Graphic liner', kind: 'paint', img: stk('double-wing'),
    prompt: 'glossy black eyeliner along the upper lash line of each eye ending in two parallel sharp wings stacked one above the other',
    place: { at: EYE_R, mirror: EYE_L, w: 0.34, origin: [0.36, 1.1] },
  },
  {
    id: 'neon-liner', size: 'small', ko: '네온 라이너', en: 'Neon Liner', descKo: '핑크·블루 형광 라인', descEn: 'Pink and blue neon lines',
    tagKo: '페스티벌', tagEn: 'Festival', kind: 'paint', img: stk('neon-liner'),
    prompt: 'neon graphic eyeliner: a hot-pink line and an electric-blue line along the upper lash line of each eye, kicking out into a sharp wing with three small neon dots',
    place: { at: EYE_R, mirror: EYE_L, w: 0.36, origin: [0.36, 1.0] },
  },
  {
    id: 'lace-corner', size: 'small', ko: '레이스 눈꼬리', en: 'Lace Corners', descKo: '눈꼬리에 검은 레이스', descEn: 'Black lace at the eye corners',
    tagKo: '레이스 +120%', tagEn: 'Lace +120%', kind: 'sticker', img: stk('lace-corner'),
    prompt: 'a delicate black floral lace appliqué glued at the outer corner of each eye, widening toward the temple',
    place: { at: [263], mirror: [33], w: 0.22, origin: [0.04, 0.35], dy: 0.0, rot: -16 },
  },

  // ───────── 얼굴 절반 8 ─────────
  {
    id: 'butterfly-eyes', size: 'half', ko: '나비 날개 눈', en: 'Butterfly Eyes', descKo: '두 눈을 감싸는 모르포 나비', descEn: 'Morpho wings around both eyes',
    tagKo: '틱톡 1위 할로윈', tagEn: '#1 on TikTok', kind: 'paint', img: stk('butterfly-wings'),
    prompt: 'a large iridescent blue morpho butterfly painted across the eye area: its body on the bridge of the nose, one pair of blue and black wings with white spots spreading over each eyelid, brow bone and temple',
    place: { at: [168, 6], w: 1.05, origin: [0.5, 0.52], dy: 0.01 },
  },
  {
    id: 'alien-holo', size: 'half', ko: '외계 홀로그램', en: 'Alien Holo', descKo: '눈가를 감싼 크롬 비늘', descEn: 'Chrome scales around the eye',
    tagKo: '외계 메이크업 +140%', tagEn: 'Alien makeup +140%', kind: 'sticker', img: stk('alien-holo'),
    prompt: 'a crescent of holographic chrome scales and tiny iridescent dots in silver, lilac and aqua framing the outer side of one eye from the brow bone around to the cheekbone',
    place: { at: EYE_R, w: 0.44, origin: [0.62, 0.52], dx: 0.0, flipArt: true },
  },
  {
    id: 'pearl-arch', size: 'half', ko: '진주 아치', en: 'Pearl Arch', descKo: '눈썹부터 광대까지 진주', descEn: 'Pearls from brow to cheekbone',
    tagKo: '젬 매핑', tagEn: 'Gem mapping', kind: 'sticker', img: stk('pearl-arch'),
    prompt: 'a long C-shaped line of graduated white pearls tracing around the outer side of one eye from the end of the brow down to the cheekbone',
    place: { at: EYE_R, w: 0.36, origin: [0.62, 0.5], dx: 0.01, flipArt: true },
  },
  {
    id: 'euphoria-crystals', size: 'half', ko: '유포리아 크리스탈', en: 'Euphoria Crystals', descKo: '눈꼬리 위로 쏟아지는 큐빅', descEn: 'Crystals sweeping up from the eyes',
    tagKo: '유포리아', tagEn: 'Euphoria', kind: 'sticker', img: stk('euphoria-crystals'),
    prompt: 'Euphoria-style face jewels: clear, pink, lilac and aqua rhinestones of mixed shapes and holographic glitter sweeping from under each eye up past the outer corner toward the temple',
    place: { at: LOWER_R, mirror: LOWER_L, w: 0.3, origin: [0.12, 0.75], dy: 0.03, dx: -0.02 },
  },
  {
    id: 'lace-mask', size: 'half', ko: '레이스 반가면', en: 'Lace Mask', descKo: '한쪽 눈을 감싼 레이스', descEn: 'Lace around one eye',
    tagKo: '다크 로맨틱 +160%', tagEn: 'Dark romantic +160%', kind: 'sticker', img: stk('lace-mask'),
    prompt: 'a black floral lace half-mask appliqué around one eye, extending up toward the temple',
    place: { at: EYE_R, w: 0.52, origin: [0.28, 0.48] },
  },
  {
    id: 'glitch', size: 'half', ko: '글리치', en: 'Glitch', descKo: '한쪽 볼에 픽셀 조각', descEn: 'Pixel blocks on one cheek',
    tagKo: '글리치 글램 +115%', tagEn: 'Glitchy glam +115%', kind: 'paint', img: stk('glitch'),
    prompt: 'asymmetric glitch-art face paint: a diagonal stack of pastel pink, cyan, lilac and white pixel squares and short bars on one temple and cheek, offset like a digital glitch',
    place: { at: [346], w: 0.25, origin: [0.45, 0.35], dx: 0.03, dy: 0.02 },
  },
  {
    id: 'galaxy-eye', size: 'half', ko: '은하수 눈가', en: 'Galaxy Eye', descKo: '보라·파랑 성운과 별', descEn: 'Violet-blue nebula and stars',
    tagKo: '엑스트라 셀레스티얼', tagEn: 'Extra Celestial', kind: 'paint', img: stk('galaxy-eye'),
    prompt: 'a galaxy painted around one eye: blended violet, deep blue and magenta nebula over the eyelid, brow bone and upper cheek with tiny white stars and sparkles; the eye itself stays clear',
    place: { at: EYE_R, w: 0.56, origin: [0.42, 0.5] },
  },
  {
    id: 'flower-vine', size: 'half', ko: '꽃 덩굴', en: 'Flower Vine', descKo: '관자놀이에서 볼까지 수채 꽃', descEn: 'Watercolour blossoms down the cheek',
    tagKo: '페스티벌', tagEn: 'Festival', kind: 'paint', img: stk('flower-vine'),
    prompt: 'a trailing vine of small watercolour pink blossoms, white daisies and green leaves painted from one temple down along the outer cheek',
    place: { at: [356], w: 0.22, origin: [0.5, 0.02], dx: -0.08, dy: -0.06 },
  },

  // ───────── 명화의 얼굴 8 — AI 로만 (브랜드 비전: 미술 × 메이크업) ─────────
  { id: 'starry-night', size: 'full', ko: '별이 빛나는 밤', en: 'Starry Night', descKo: '고흐의 밤하늘', descEn: 'Van Gogh’s night sky', sample: smp('starry-night'),
    prompt: 'a post-impressionist oil painting in thick visible brush strokes across the whole face, in the manner of Vincent van Gogh\'s The Starry Night: swirling cobalt and ultramarine night sky over forehead, eyelids and cheeks, glowing yellow stars and crescent moon on the cheekbones, a dark cypress silhouette rising along one side of the jaw. Lips painted deep blue with a yellow star highlight.' },
  { id: 'golden-klimt', size: 'full', ko: '클림트 금박', en: 'Golden Klimt', descKo: '금박 모자이크', descEn: 'Gold-leaf mosaic', sample: smp('golden-klimt'),
    prompt: 'in the manner of Gustav Klimt\'s golden period: gold leaf across the forehead, temples, cheeks and jaw, broken by mosaic spirals, small squares and circles in black, ivory, turquoise and coral. The centre of the face around the eyes and nose stays clean bare skin framed by the gold. Eyes lined in black, lips a solid coral red.' },
  { id: 'monet-lilies', size: 'full', ko: '모네 수련', en: 'Monet Water Lilies', descKo: '인상파 연못 빛', descEn: 'Impressionist pond light', sample: smp('monet-lilies'),
    prompt: 'in the manner of Claude Monet\'s Water Lilies: soft impressionist dabs of lilac, sage green, sky blue and blush pink across the whole face like light on a pond, floating green lily pads and pale pink water-lily blossoms on the cheeks and forehead, lips a soft lilac-pink.' },
  { id: 'great-wave', size: 'full', ko: '호쿠사이 파도', en: 'The Great Wave', descKo: '거대한 파도 판화', descEn: 'Woodblock wave', sample: smp('great-wave'),
    prompt: 'in the manner of Hokusai\'s woodblock print The Great Wave off Kanagawa: a cresting Prussian-blue wave with white claw-like foam sweeping from the jaw up across one cheek and over the forehead, a small snow-capped mountain on the other cheek, cream and pale blue tones, crisp woodblock line work. Lips Prussian blue.' },
  { id: 'mucha-nouveau', size: 'full', ko: '무하 아르누보', en: 'Mucha Art Nouveau', descKo: '금빛 장식 테두리', descEn: 'Golden ornamental frame', sample: smp('mucha-nouveau'),
    prompt: 'in the manner of Alphonse Mucha\'s Art Nouveau posters: an ornate golden halo of fine linework framing the face across the forehead and temples, flowing pastel floral garlands and whiplash curves along the cheeks and jaw in muted gold, sage, dusty rose and cream with fine dark outlines; soft rose lips.' },
  { id: 'primary-grid', size: 'full', ko: '몬드리안 격자', en: 'Primary Grid', descKo: '빨강·노랑·파랑 격자', descEn: 'Red, yellow, blue grid', sample: smp('primary-grid'),
    prompt: 'a geometric abstract painting in the manner of Piet Mondrian: straight thick black lines dividing the whole face into rectangles filled with flat matte primary red, yellow, blue and white, crossing over brows, cheeks, nose and chin. Lips part red, part blue along a black line.' },
  { id: 'monarch', size: 'full', ko: '제왕나비', en: 'Monarch Wings', descKo: '얼굴을 덮는 큰 나비', descEn: 'A giant butterfly', sample: smp('monarch'),
    prompt: 'a giant monarch butterfly painted across the whole face. Its body runs down the bridge of the nose, orange and black wings with white dots spread across the forehead, eyelids and both cheeks to the ears. Black lips with a thin orange line.' },
  { id: 'alien-chrome', size: 'full', ko: '외계 크롬', en: 'Alien Chrome', descKo: '홀로그램 은빛 얼굴', descEn: 'Holographic silver face', sample: smp('alien-chrome'),
    prompt: 'an otherworldly alien-glam face: iridescent holographic chrome sheen in silver, lilac and aqua washed over the forehead, cheekbones and nose, rows of tiny silver dots tracing the brow bones and cheekbones, metallic silver lids, small silver gems at the temples, liquid chrome lips.' },

  // ───────── 시즌 18 — AI 로만 (1년 달력) ─────────
  { id: 'lunar-dragon', size: 'season', monthKo: '1월', monthEn: 'Jan', ko: '설날 금박 용', en: 'Lunar Gold Dragon', descKo: '붉은 눈매와 금빛 용', descEn: 'Red eyes and a gold dragon', sample: smp('lunar-dragon'),
    prompt: 'a Lunar New Year look: a sinuous dragon with metallic gold-leaf scales and red accents painted from one temple down across that cheek, red eyeshadow winged out, gold flecks on the lids, a lacquered red lip.' },
  { id: 'valentine-hearts', size: 'season', monthKo: '2월', monthEn: 'Feb', ko: '발렌타인 하트', en: 'Valentine Hearts', descKo: '흘러내리는 붉은 하트', descEn: 'Falling red hearts', sample: smp('valentine-hearts'),
    prompt: 'heart-breaker Valentine glam: saturated hot pink and cherry red eyeshadow swept up to the temples in a bold wing; tiny hand-painted glossy red hearts in graduated sizes running from the outer corner of one eye down across that cheekbone; pink crystals on the inner corners; a high-shine vinyl cherry red lip.' },
  { id: 'white-day', size: 'season', monthKo: '3월', monthEn: 'Mar', ko: '화이트데이 진주 리본', en: 'Pearl & Bow', descKo: '진주와 핑크 리본', descEn: 'Pearls and pink bows', sample: smp('white-day'),
    prompt: 'a coquette White Day look: tiny pale pink satin bows and small white pearls placed along the cheekbones and at the outer eye corners, soft pink blush draped high, pearly lids, glossy pink lips.' },
  { id: 'cherry-blossom', size: 'season', monthKo: '4월', monthEn: 'Apr', ko: '벚꽃', en: 'Cherry Blossom', descKo: '이마에서 볼까지 벚꽃 가지', descEn: 'Blossom branch brow to cheek', sample: smp('cherry-blossom'),
    prompt: 'a painted cherry blossom branch: a fine dark brown branch growing from one temple across the forehead above the brow and down onto the opposite cheek, covered in clusters of soft pink and white five-petal sakura blossoms with darker pink centres, a few loose petals drifting across the cheeks; soft rosy pink wash on the eyelids; glossy petal-pink lips.' },
  { id: 'festival-gems', size: 'season', monthKo: '5월', monthEn: 'May', ko: '페스티벌 젬', en: 'Festival Gems', descKo: '눈썹뼈·광대 젬 매핑', descEn: 'Gem mapping on brow and cheek', sample: smp('festival-gems'),
    prompt: 'music-festival gem mapping: clusters of iridescent rhinestones and pearls along both brow bones, under the eyes and across the cheekbones, holographic glitter on the lids, glossy lips, dewy skin.' },
  { id: 'rainbow', size: 'season', monthKo: '6월', monthEn: 'Jun', ko: '레인보우', en: 'Rainbow', descKo: '볼을 가로지르는 무지개', descEn: 'A rainbow across the cheeks', sample: smp('rainbow'),
    prompt: 'a bold rainbow stripe of red, orange, yellow, green, blue and violet painted across both cheeks and over the bridge of the nose, with small silver glitter stars scattered above it; glossy clear lips.' },
  { id: 'mermaid', size: 'season', monthKo: '7월', monthEn: 'Jul', ko: '인어 비늘', en: 'Mermaid Scales', descKo: '청록 비늘과 진주', descEn: 'Teal scales and pearls', sample: smp('mermaid'),
    prompt: 'a summer mermaid look: iridescent turquoise, teal and violet scales painted from both temples down along the cheekbones, small pearls at the outer eye corners, aqua shimmer on the lids, glossy coral lips.' },
  { id: 'fireworks', size: 'season', monthKo: '8월', monthEn: 'Aug', ko: '불꽃놀이', en: 'Fireworks', descKo: '관자놀이에 터지는 네온', descEn: 'Neon bursts on the temple', sample: smp('fireworks'),
    prompt: 'neon fireworks painted on one side of the face: glowing pink, gold and electric-blue starbursts radiating over the temple and cheek with glitter sparks, a neon pink graphic wing on both eyes.' },
  { id: 'harvest-moon', size: 'season', monthKo: '9월', monthEn: 'Sep', ko: '추석 보름달', en: 'Harvest Moon', descKo: '보름달과 옥토끼', descEn: 'Full moon and a moon rabbit', sample: smp('harvest-moon'),
    prompt: 'a harvest full moon: a glowing golden full moon painted on one cheek with a small white rabbit silhouette inside it, a deep navy night-sky wash with tiny stars over that temple, warm gold shimmer lids.' },
  { id: 'halloween-skull', size: 'season', monthKo: '10월', monthEn: 'Oct', ko: '할로윈 해골', en: 'Halloween Skull', descKo: '흑백 해골, 피 없이', descEn: 'Black and white skull', sample: smp('halloween-skull'),
    prompt: 'a realistic black and white skeleton face paint with no floral or cultural decoration: white base, black hollows around the eyes, a black triangle on the nose tip, painted teeth lines across the lips and cheeks, shaded cheekbones. No blood.' },
  { id: 'coquette-clown', size: 'season', monthKo: '10월', monthEn: 'Oct', ko: '코켓 광대', en: 'Coquette Clown', descKo: '파스텔 다이아와 하트 코', descEn: 'Pastel diamonds, heart nose', sample: smp('coquette-clown'),
    prompt: 'a coquette clown: soft white face base, pastel pink diamond shapes painted vertically over each eye, a tiny pink heart on the tip of the nose, rosy round cheeks, a small black bow drawn at one outer eye corner, glossy pink lips.' },
  { id: 'marionette', size: 'season', monthKo: '10월', monthEn: 'Oct', ko: '마리오네트', en: 'Marionette', descKo: '도자기 인형 얼굴', descEn: 'Porcelain doll face', sample: smp('marionette'),
    prompt: 'a porcelain marionette doll: pale porcelain base, thin black lines painted from the corners of the mouth down to the jaw like a puppet\'s hinged jaw, rosy circle cheeks, doll lashes drawn on the lower lids, small red bow-shaped lips. No blood.' },
  { id: 'vamp-romantic', size: 'season', monthKo: '10월', monthEn: 'Oct', ko: '뱀파이어 로맨틱', en: 'Vamp Romantic', descKo: '와인빛 입술과 레이스', descEn: 'Wine lips and lace', sample: smp('vamp-romantic'),
    prompt: 'dark romantic vampire glam: smoky burgundy-black eyes, sharp dark brows, pale skin, deep wine-stained lips with a soft blotted edge, a black lace pattern painted on one temple. No blood, no fangs.' },
  { id: 'autumn-leaves', size: 'season', monthKo: '11월', monthEn: 'Nov', ko: '단풍', en: 'Autumn Leaves', descKo: '단풍·은행잎과 금박', descEn: 'Maple, ginkgo and gold leaf', sample: smp('autumn-leaves'),
    prompt: 'falling maple and ginkgo leaves painted in red, orange and gold across one temple and down the cheek with gold-leaf accents, warm copper eyeshadow, brick-red lips.' },
  { id: 'xmas-emerald', size: 'season', monthKo: '12월', monthEn: 'Dec', ko: '크리스마스 에메랄드', en: 'Christmas Emerald', descKo: '에메랄드 띠·금박·호랑가시', descEn: 'Emerald band, gold, holly', sample: smp('xmas-emerald'),
    prompt: 'a bold Christmas ornament look: a band of saturated emerald green painted from temple to temple across both eyelids and over the bridge of the nose, edged with metallic gold leaf; eyebrows brushed with gold leaf; a small sprig of painted holly leaves with glossy red berries on one cheekbone; scattered tiny gold flakes like falling snow; a glossy ruby red lip.' },
  { id: 'candy-cane', size: 'season', monthKo: '12월', monthEn: 'Dec', ko: '캔디케인', en: 'Candy Cane', descKo: '빨강·하양 줄무늬', descEn: 'Red and white stripes', sample: smp('candy-cane'),
    prompt: 'a candy cane look: red and white diagonal candy-cane stripes painted as a bold winged liner on both eyes and as a small curved cane on one cheekbone, rosy candy-cane blush, glossy red lips.' },
  { id: 'ice-princess', size: 'season', monthKo: '12월', monthEn: 'Dec', ko: '아이스 프린세스', en: 'Ice Princess', descKo: '눈꽃과 은빛 서리', descEn: 'Snowflakes and silver frost', sample: smp('ice-princess'),
    prompt: 'an ice princess look: frosty white and pale blue snowflakes painted from the brow bone around the outer eye and down the cheekbone on both sides, silver glitter frost, icy shimmer lids, cool pink lips.' },
  { id: 'new-year-gold', size: 'season', monthKo: '12월', monthEn: 'Dec', ko: '새해 골드', en: 'New Year Gold', descKo: '금빛 글리터와 별', descEn: 'Gold glitter and stars', sample: smp('new-year-gold'),
    prompt: 'a New Year\'s Eve look: gold glitter and small gold star sequins sweeping from the outer corner of both eyes up to the temples, gold confetti dots on the cheekbones, champagne shimmer lids, glossy nude lips.' },
]

export const paintById = (id: string): PaintDesign | undefined => PAINT_DESIGNS.find((d) => d.id === id)
export const isArOnly = (d: PaintDesign) => d.size === 'small' || d.size === 'half'

/** SVG 문서(가짜 주근깨) */
export function svgDoc(d: PaintDesign): string {
  const [w, h] = d.vb ?? [100, 100]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * 4}" height="${h * 4}">${d.svg ?? ''}</svg>`
}
/** 그림 주소(원화 또는 SVG data URL) */
export function artSrc(d: PaintDesign): string {
  if (d.img) return d.img
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgDoc(d))
}

// ── AI 지시문 ──
const IDENTITY =
  'IDENTITY LOCK: the result must be instantly recognisable as the SAME person. Keep bone structure, eye shape and size, nose, ' +
  'mouth shape, jawline, face width and length exactly. Do not make the person prettier, younger or slimmer. Keep the same hairstyle, ' +
  'hair colour, clothing, background, lighting, pose, expression, framing and aspect ratio. Hair stays in front of the paint. ' +
  'If the person wears or holds any accessory or prop, keep it exactly as it is. Do not add any new accessory, costume, text or watermark.'

/** 명화·시즌 — 원본 셀카에 그린다(11/3 r3 시험 통과 문구) */
export function promptFull(d: PaintDesign): string {
  const area = d.id === 'golden-klimt' ? 'covering most of the face and framing the eyes'
    : d.size === 'season' ? 'that reads boldly at a glance, well beyond the natural lip and eye zones'
    : 'COVERING THE ENTIRE FACE from hairline to chin, ear to ear'
  return `You are an avant-garde editorial makeup artist and face painter. Edit this selfie photo to apply the "${d.en}" face-paint look.\n\n${IDENTITY}\n\n` +
    `THIS IS NOT NATURAL MAKEUP. It is a fearless face-painting look ${area}. A timid, small or delicate result is a failure. Everything must be physically painted or applied on the skin.\n\n` +
    `THE LOOK: ${d.prompt}\n\nPhotorealistic: a real photograph of real body paint and cosmetics on real skin with visible skin texture and brush marks. Not an illustration, not a filter, not CGI.`
}

/** 작은·절반 — 무늬를 얹은 사진을 보내 같은 자리에 진짜 물감·젬으로 다시 칠한다 */
export function promptOverlay(ds: PaintDesign[]): string {
  const list = ds.map((d) => `- ${d.prompt}`).join('\n')
  return 'You are a professional face painter. This selfie has digital face-art stickers placed on the skin as a guide. ' +
    'Recreate every piece of that artwork as REAL face art applied by hand on the skin, keeping exactly the same designs, positions, sizes, ' +
    'angles and colours as the guide:\n' + list + '\n\n' +
    'Paint must follow the curves of the face and the real lighting, show skin texture and pores through it, and have a soft cosmetic sheen; ' +
    'pearls, rhinestones and chrome pieces become real adhesive face jewels that catch the light and cast tiny shadows; lace becomes real lace appliqué; ' +
    'glitter becomes real cosmetic glitter. Do not add any other makeup or design and do not move the artwork.\n\n' + IDENTITY +
    '\n\nPhotorealistic photograph. Not an illustration, not a sticker overlay, not a filter.'
}
