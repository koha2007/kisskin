// 뉴스 무드컷 전용 이미지 프롬프트 — "글로벌 K-뷰티 산업 트렌드" 컨셉.
//
// 왜 제품 카드(_productImagePrompt.mjs)와 분리했나 (2026-09-13):
// 뉴스 섹션 바로 위 제품소개 섹션이 이미 인물 포트레이트로 가득해서, 뉴스 카드까지
// 같은 인물 무드컷을 쓰면 화면이 사람 얼굴로 도배돼 시각적으로 겹친다. 뉴스는 대부분
// (55/101) 수출·MOU·M&A 같은 산업/무역 기사라 "누군가의 메이크업 얼굴"보다
// 실물 정물(제품+글로벌 무역 모티프)이 업계지(WWD Beauty 등) 톤에도 더 맞는다.
// → 카테고리별 장면(imageScene) 대신 슬러그 해시로 뽑는 정물 구성 하나로 전체를
//   통일한다. 제품 카드 쪽 buildImagePrompt/CAT_APPLIED 는 그대로 둔다.

export const PRODUCT_SETS = [
  'a tall matte navy bottle with a glossy black cap, a soft blush-pink round jar, and a small glass dropper bottle with clear serum',
  'two frosted cream jars of different heights stacked beside a slim rose-gold tube',
  'a matte black cylindrical bottle, a pale peach cushion compact, and a glass dropper bottle with golden liquid',
  'three cream-colored jars of ascending size arranged in a soft diagonal line',
  'a deep navy glass bottle with a dropper, a blush-pink squeeze tube, and a small round compact',
  'a cluster of five miniature cosmetic bottles in navy, blush and cream, of varying heights',
]

export const MAP_STYLES = [
  'a faint hand-drawn world-map outline etched softly into the wall behind, continents barely visible',
  'a subtle dotted flight-path pattern arcing across the background wall, suggesting international shipping routes',
  'a soft engraved world map fading into the corner of the backdrop, mostly negative space',
  'a delicate line-art globe silhouette glowing softly in the background, off to one side',
  'faint longitude/latitude grid lines etched into the backdrop, evoking global trade',
  'a subtle world-map outline embossed into the surface the products sit on, catching soft light',
]

export const BACKDROPS = [
  'a warm cream studio backdrop',
  'a soft blush-pink gradient backdrop',
  'a pale greige seamless backdrop',
  'a muted sand-toned backdrop',
  'a soft dove-grey backdrop with a hint of pink',
  'a warm ivory backdrop with a subtle vignette',
]

export const LIGHTING = [
  'clean bright studio lighting with a soft glossy reflection on the surface',
  'warm directional light from the upper left, soft shadows trailing to the right',
  'diffused overcast-style studio light, even and soft',
  'a single soft key light creating a gentle gradient shadow',
  'bright airy lighting with a subtle rim light on each product edge',
  'soft top-down light with delicate reflections pooling beneath each object',
]

export const hash = (s) => { let h = 5381; for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return h }
// ⚠ 예전엔 pick(arr, h, salt) => arr[(h+salt) % arr.length] 로 네 축을 전부 같은 h 에서
// +0/+1/+2/+3 만 갈랐다. 배열 길이가 전부 6이라 (h+salt)%6 은 h%6 하나로 완전히 종속돼
// 4축이 사실상 한 몸으로 움직였다 — 101장인데 실제로는 6가지 조합만 나온 원인
// (2026-09-14 발견). 축마다 **다른 문자열을 해시**해서 서로 독립시킨다.
const pick = (arr, seed) => arr[hash(seed) % arr.length]

/** 같은 슬러그 → 항상 같은 그림(재현 가능). retry 를 더하면 변주가 바뀐다. */
export function buildNewsImagePrompt(item, retry = 0) {
  const seed = `${item.slug}:${retry}`
  const products = pick(PRODUCT_SETS, `${seed}:products`)
  const map = pick(MAP_STYLES, `${seed}:map`)
  const backdrop = pick(BACKDROPS, `${seed}:backdrop`)
  const lighting = pick(LIGHTING, `${seed}:lighting`)
  return [
    'A minimal, elegant editorial still-life photograph representing global K-beauty industry news and market trends — absolutely NO people, no faces, no hands, no skin.',
    `Composition: ${products}, arranged on ${backdrop}, with ${map}.`,
    `Lighting: ${lighting}. Sophisticated, calm, premium mood.`,
    'Color palette: deep navy blue, soft blush pink, and warm cream — a cohesive premium beauty brand identity.',
    'Style: high-end beauty industry trade-press editorial photography, minimal, spacious negative space, shallow depth of field.',
    'All products are unbranded — absolutely no text, letters, numbers, logos or watermark anywhere in the image.',
    'Vertical portrait orientation 3:4.',
  ].join(' ')
}
