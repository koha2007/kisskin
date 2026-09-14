// 뉴스 무드컷 전용 이미지 프롬프트 — 사람 없는 에디토리얼 정물.
//
// 왜 제품 카드(_productImagePrompt.mjs)와 분리했나 (2026-09-13):
// 뉴스 섹션 바로 위 제품소개 섹션이 이미 인물 포트레이트로 가득해서, 뉴스 카드까지
// 같은 인물 무드컷을 쓰면 화면이 사람 얼굴로 도배된다. 뉴스는 산업/무역 기사가 많아
// 실물 정물이 업계지 톤에도 맞는다. 제품 카드 쪽 buildImagePrompt 는 그대로 둔다.
//
// ⚠ v2 (2026-09-14) — 101장을 두 번 생성했는데 둘 다 "같은 사진 반복"이었다.
//   원인은 해시 버그만이 아니었다: 사진에서 **눈에 보이는** 축은 제품세트(6종) 하나뿐이고
//   배경·조명·지도는 거의 구분이 안 됐으며, 색 팔레트 문구가 전 장에 고정돼 있었다.
//   → 눈에 확 띄는 축(피사체·앵글·색·바닥재)을 각각 크게 늘리고, 피사체는 기사 카테고리별
//     풀에서 고른다. 고정 색 문구·고정 세계지도 모티프는 뺐다.
//   대량 생성 전엔 반드시 `node scripts/check-news-image-variety.mjs` 로 분포부터 볼 것.

const GLOBAL = [
  'a neat stack of plain unmarked kraft shipping boxes with a single unbranded serum bottle placed on top',
  'a vintage brass globe paperweight beside one elegant glass skincare bottle',
  'an open hard-shell carry-on suitcase neatly packed with unbranded travel-size skincare minis',
  'a long row of identical unbranded glass bottles on a clean stainless-steel factory conveyor, repeating rhythm',
  'a laboratory bench with glass beakers and test tubes holding creamy and gel cosmetic textures',
  'a minimal flagship-store display shelf with unbranded cosmetic products in neat rows, glowing shelf lights',
  'unbranded paper shopping bags with rope handles, one tipped over revealing tissue paper and a cream jar',
  'a miniature toy cargo ship carrying tiny cosmetic bottles stacked like shipping containers, playful scale',
  'an airplane window with soft sky light falling across a zipped travel cosmetic pouch on a tray table',
  'unbranded cosmetic boxes stacked into ascending towers like a rising bar chart',
  'a single luxurious cream jar displayed on a stone plinth like a museum exhibit',
  'assorted unbranded cosmetics arranged in a precise knolling grid',
]

const SKINCARE = [
  'a single golden serum droplet falling from a glass pipette, frozen mid-air',
  'a thick swirl of rich white face cream texture',
  'a smear of clear hydrating gel full of tiny air bubbles',
  'a frosted skincare bottle surrounded by fresh green centella leaves',
  'a milky essence bottle beside a bowl of fermented rice grains',
  'a neat row of small glass ampoule vials with amber liquid',
  'ice cubes melting around a cooling gel jar with condensation droplets',
  'a glossy honey-like dripping texture slowly falling off a spatula',
  'soaked cotton pads layered in a fan beside a toner bottle',
  'a pump bottle standing in a shallow pool of water with concentric ripples',
]

const BASE = [
  'an open cushion compact with its puff resting on the edge',
  'foundation swatch strokes in six different skin shades',
  'a sunscreen tube casting a sharp sunlight shadow',
  'a pressed powder compact crumbled into soft broken pieces',
  'a teardrop makeup sponge beside a pooled droplet of liquid foundation',
  'a fine mist cloud of setting spray caught in backlight',
  'a translucent primer gel spread thinly across a glass pane',
  'loose setting powder billowing from a fluffy brush',
]

const LIP = [
  'a row of unbranded lipstick bullets in graduated shades from nude to deep red',
  'a single bold lipstick swipe smeared across the surface',
  'glossy lip oil dripping slowly down from a doe-foot applicator',
  'a snapped lipstick bullet crumbled into pigment pieces',
  'several lip gloss tubes standing upright in shallow water',
  'small open lip balm pots showing their smooth textures',
  'a matte lipstick and a high-shine lip gloss side by side',
  'a lip tint wand releasing one saturated droplet',
]

const CHEEK = [
  'a blush compact shattered into a burst of pink powder',
  'a swirl of cream blush texture',
  'a fluffy blush brush releasing a soft cloud of pigment',
  'three blush pans in coral, rose and peach arranged in a line',
  'a blush stick with its creamy tip swatched across the surface',
  'a round powder puff dusted with rosy pigment',
]

const EYE = [
  'an eyeshadow palette with several pans crushed into loose pigment',
  'fine metallic glitter pigment scattered in a graphic arc',
  'a mascara wand with a single curl of formula',
  'one sharp graphic eyeliner stroke painted across the surface',
  'small open pots of loose shimmering pigment',
  'crumpled metallic foil pieces beside a shimmer eyeshadow pan',
  'a set of slim eye brushes fanned out beside a swatched shadow',
  'a smoky charcoal pigment smudge blended into a soft gradient',
]

const FRAGRANCE = [
  'a faceted perfume bottle throwing rainbow light refractions',
  'a perfume bottle nestled among dried flowers and wood shavings',
  'a fine perfume mist cloud caught in a beam of light',
  'three perfume bottles of different heights in silhouette',
  'a perfume bottle half-submerged in clear rippling water',
  'a perfume bottle beside citrus peel, vanilla pods and a sprig of herbs',
]

const HAIR = [
  'a hair oil droplet running down the teeth of a wooden comb',
  'a soft scalp massage brush beside a serum bottle',
  'shampoo and conditioner bottles standing in shallow water',
  'a silk hair ribbon draped around an amber hair oil bottle',
  'a wide-tooth comb and a hair mask jar with a creamy scoop',
  'a hair serum dropper releasing a glossy strand of oil',
]

const TREND = [
  'a backstage vanity table with scattered brushes, palettes and lipsticks',
  'a painterly chart of colorful pigment smears in a grid',
  'an overflowing makeup bag spilling colorful products',
  'a single bold cosmetic product on a tall pedestal against a seamless backdrop',
  ...LIP.slice(0, 2), ...EYE.slice(0, 2), ...CHEEK.slice(0, 2), ...BASE.slice(0, 2),
]

export const SUBJECTS_BY_CATEGORY = {
  global: GLOBAL, skincare: SKINCARE, base: BASE, lip: LIP, cheek: CHEEK,
  eye: EYE, fragrance: FRAGRANCE, hair: HAIR, trend: TREND,
}

export const ANGLES = [
  'shot straight top-down as a flat lay',
  'shot at eye level, straight-on',
  'an extreme macro close-up with very shallow depth of field',
  'shot from a three-quarter 45-degree angle',
  'shot from a low angle looking up, making the subject feel monumental',
  'a wide shot with the subject small and off-center in generous negative space',
  'a tight crop with the subject partly running out of frame',
]

// 색 — 힐다(콘텐츠 팔레트, src/index.css `.palette-hilda`) 톤으로 통일한다(운영자 지시 2026-09-14).
// 뉴스 페이지 자체가 힐다 영역이라 v2 첫 샘플의 보라·올리브·버건디가 페이지 톤과 부딪쳤다.
// 단, 전 장을 크림+버밀리언 하나로 칠하면 다시 "같은 사진"이 되므로 **바탕은 힐다 크림 공통,
// 포인트 색만 힐다 계열 안에서 돌린다**(버밀리언·딥네이비·도구 보조색 머스터드/세이지/틸/플럼…).
export const PALETTES = [
  'warm cream (#f5efe3) with vermilion red (#d8503c) accents',
  'warm cream (#f2ead9) with deep navy (#232a52) accents',
  'warm cream (#f5efe3) with muted mustard (#c79340) accents',
  'warm cream (#ede3d1) with soft sage green (#7e9b6a) accents',
  'warm cream (#f5efe3) with dusty teal (#4e9fa6) accents',
  'warm cream (#f2ead9) with muted plum (#8e6e9e) accents',
  'warm cream (#ede3d1) with brick terracotta (#b03e2d) accents',
  'warm cream (#f5efe3) with muted indigo (#4a5488) accents',
]

export const SURFACES = [
  'on warm ivory marble',
  'on warm travertine stone',
  'on a sheet of rippled shallow water',
  'on softly draped cream silk fabric',
  'on fine sculpted sand',
  'on frosted glass',
  'on stacked cream-paper geometric blocks',
  'on pale oak wood',
  'on warm speckled terrazzo',
  'on natural linen',
]

// 어두운 조명(스포트라이트·로우키)은 뺐다 — 카드 썸네일로 쓰기엔 너무 어둡고 힐다 톤(밝은 크림)과 안 맞았다.
export const LIGHTING = [
  'hard midday sunlight casting crisp palm-leaf shadows',
  'soft diffused window light',
  'a gentle glowing backlight creating a luminous rim',
  'gentle golden-hour light with long warm shadows',
  'clean bright high-key studio light',
  'soft morning light with delicate window-frame shadows',
]

export const hash = (s) => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193)
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16
  return h >>> 0
}
// 축마다 **다른 문자열을 해시** — 같은 h 에 오프셋만 더하면 축끼리 종속된다(2026-09-13 버그).
const pick = (arr, seed) => arr[hash(seed) % arr.length]

function rawAxes(item, variant) {
  const seed = `${item.slug}:${variant}`
  const subjects = SUBJECTS_BY_CATEGORY[item.category] || GLOBAL
  return {
    subject: pick(subjects, `${seed}:subject`),
    angle: pick(ANGLES, `${seed}:angle`),
    palette: pick(PALETTES, `${seed}:palette`),
    surface: pick(SURFACES, `${seed}:surface`),
    lighting: pick(LIGHTING, `${seed}:lighting`),
  }
}

// 목록에서 가까운 카드(그리드에서 한 화면에 같이 보이는 범위)끼리 피사체·색·앵글이 겹치지 않게.
// 색은 8종뿐이라 창을 좁게(4) — 6으로 두면 남는 선택지가 2개라 색이 기계적으로 순환한다.
const WINDOW = 6
const PALETTE_WINDOW = 4

/**
 * items = items.ts 순서(최신이 위). **아래(오래된 것)부터** 배정해서, 새 기사가 맨 위에
 * 추가돼도 기존 카드의 배정은 바뀌지 않는다. 각 카드는 바로 아래 WINDOW 장과
 * 피사체·색이 겹치지 않고, 바로 아래 2장과 앵글이 겹치지 않는 변주를 고른다.
 * retries[slug] = n → 콘텐츠 필터 재시도용으로 그 카드만 변주 시작점을 옮긴다.
 * @returns Map<slug, axes>
 */
export function assignNewsImageAxes(items, retries = {}) {
  const out = new Map()
  const placed = []
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i]
    const recent = placed.slice(-WINDOW)
    const base = (retries[item.slug] || 0) * 100
    let chosen
    for (let v = base; v < base + 60 && !chosen; v++) {
      const a = rawAxes(item, v)
      const clash = recent.some((r) => r.subject === a.subject)
        || recent.slice(-PALETTE_WINDOW).some((r) => r.palette === a.palette)
        || recent.slice(-2).some((r) => r.angle === a.angle)
      if (!clash) chosen = a
    }
    chosen ||= rawAxes(item, base)
    out.set(item.slug, chosen)
    placed.push(chosen)
  }
  return out
}

/** axes 는 assignNewsImageAxes 결과. 직접 넘기지 않으면 이웃 고려 없이 슬러그만으로 고른다. */
export function buildNewsImagePrompt(item, retry = 0, axes) {
  const a = axes || rawAxes(item, retry * 100)
  return [
    'A premium editorial still-life photograph for a beauty industry news article — absolutely NO people, no faces, no hands, no skin.',
    `Subject: ${a.subject}, ${a.surface}, ${a.angle}.`,
    `Color story: ${a.palette} — a light, airy, warm cream-toned frame with the accent color on the products or props.`,
    `Lighting: ${a.lighting}.`,
    'Style: bright high-end magazine still-life photography, intentional composition, rich real textures, subtle film grain, never dark or moody.',
    'All products and packaging are unbranded — absolutely no text, letters, numbers, labels, logos or watermark anywhere in the image.',
    'Vertical portrait orientation 3:4.',
  ].join(' ')
}
