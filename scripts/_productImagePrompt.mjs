// 제품 카드 무드컷용 이미지 프롬프트 빌더 — gen-products.mjs 와 backfill-product-images.mjs
// 가 **같은 프롬프트**를 쓰도록 여기 하나로 모았다. 예전엔 gen-products.mjs 안에만
// 있어서, 나중에 백필 스크립트가 자기 복사본을 들고 있다 서로 어긋날 위험이 있었다.
//
// 규칙: 같은 슬러그 → 항상 같은 그림(재실행해도 재현 가능). 구도/조명/배경/인물은
// 슬러그 해시로 고른다. retry 를 더하면 안전필터 회피용으로 변주가 바뀐다.

// 카테고리별 폴백 장면. 평소엔 모델이 제품 실물(컬러·제형·마무리)에 맞춰 써 주는
// imageScene 을 쓰고, 그게 없을 때만 여기로 떨어진다.
export const CAT_APPLIED = {
  lip: 'a beauty portrait of a young woman wearing a fresh, dewy lip tint',
  eye: 'a beauty portrait of a young woman wearing soft shimmery eyeshadow and delicate eyeliner',
  cheek: 'a beauty portrait of a young woman with soft, diffused blush across the cheeks',
  base: 'a beauty portrait of a young woman with flawless, glowing base makeup and natural skin texture',
  skincare: 'a beauty portrait of a young woman with glowing, deeply hydrated, healthy skin',
  fragrance: "a soft-focus portrait of a young woman's face, neck and collarbone, romantic airy fragrance-ad mood",
  hair: 'a portrait of a young woman with glossy, healthy, smooth hair catching soft light',
  trend: 'an editorial beauty portrait of a young woman wearing a fresh, of-the-moment makeup look',
  global: 'an editorial beauty portrait of a young woman wearing a fresh, of-the-moment makeup look',
}

// 이미지가 매번 똑같아지지 않도록 구도/조명/배경/분위기를 슬러그 해시로 고른다.
export const FRAMING = [
  'head-and-shoulders portrait, straight-on, eyes to camera',
  'three-quarter angle portrait, chin slightly lowered, gaze off-camera',
  'tight face crop from brow to chin, filling the frame',
  'side profile turning toward camera, soft over-the-shoulder pose',
  'upper-body portrait with one hand resting near the jawline',
  'slightly-from-above selfie angle, relaxed candid expression',
]
export const LIGHTING = [
  'soft diffused daylight from a window',
  'warm golden-hour sunlight with gentle lens flare',
  'clean bright studio beauty lighting with a catchlight in the eyes',
  'cool overcast light with soft, even shadows',
  'dreamy backlight with a bright halo around the hair',
  'moody low-key light with a single soft key from the side',
]
export const BACKDROP = [
  'seamless off-white studio backdrop',
  'muted beige paper backdrop',
  'blurred green outdoor foliage',
  'soft grey gradient backdrop',
  'blurred warm interior with bokeh',
  'pale pastel pink backdrop',
]
// 국내 인기 제품엔 한국인 모델. 글로벌 제품은 인종을 섞는다.
// (이미지 모델은 인종 지시를 곧잘 흘려버려서 프롬프트 끝에서 한 번 더 못 박는다.)
export const SUBJECT_KR = [
  'a young Korean woman in her early twenties',
  'a young Korean woman with long straight black hair',
  'a young Korean woman with a soft brown bob',
  'a young Korean woman with her hair tied back',
  'a young Korean man with clean, groomed brows',
  'a young Korean man with clear skin and short dark hair, clean-shaven',
  'a young Korean woman with wavy shoulder-length hair',
]
export const SUBJECT_GLOBAL = [
  'a young Korean woman with long black hair',
  'a young Korean man with short dark hair and clear skin, clean-shaven',
  'a young Black woman with deep brown skin and short curls',
  'a young Black man with deep brown skin and a short fade, clean-shaven',
  'a young white woman with freckles and auburn hair',
  'a young Latina woman with wavy dark hair',
  'a young Latino man with wavy dark hair, clean-shaven',
  'a young South Asian woman with warm brown skin',
  'a young East Asian woman with a sleek ponytail',
  'a young East Asian man with a sleek undercut, clean-shaven',
]

export const hash = (s) => { let h = 5381; for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return h }
export const pick = (arr, h, salt) => arr[(h + salt) % arr.length]

// 제품마다 완전히 다른 그림이 나오도록: 모델이 써 준 제품별 장면(imageScene)
// + 슬러그 해시로 고른 구도·조명·배경·인물. 카드 비율(4:5)에 맞춰 세로 3:4.
export function buildImagePrompt(item, retry = 0) {
  const h = hash(item.slug) + retry
  const scene = item.imageScene?.trim() || CAT_APPLIED[item.category] || CAT_APPLIED.trend
  const pool = item.market === 'global' ? SUBJECT_GLOBAL : SUBJECT_KR
  // 남성 모델은 립/치크 제품 컷엔 어울리지 않으니 헤어·스킨케어·향수에서만 허용.
  // 단 뉴스 무드컷(allowMen)은 특정 제품이 아니라 산업 트렌드라 남녀를 모두 섞는다.
  const subjects = item.gender === 'male'
    ? pool.filter((s) => s.includes(' man '))
    : item.gender === 'female'
      ? pool.filter((s) => !s.includes(' man '))
      : item.allowMen || ['hair', 'skincare', 'fragrance'].includes(item.category)
        ? pool
        : pool.filter((s) => !s.includes(' man '))
  const subject = pick(subjects, h, 0)
  const framing = pick(FRAMING, h, 1)
  const lighting = pick(LIGHTING, h, 2)
  const backdrop = pick(BACKDROP, h, 3)
  return [
    `A beauty portrait photograph of ${subject} ${scene}.`,
    `Composition: ${framing}.`,
    `Lighting: ${lighting}. Background: ${backdrop}.`,
    'Editorial beauty advertising photography, realistic skin texture with visible pores, natural retouching, sharp focus on the face, shallow depth of field.',
    'The makeup is fully blended and finished, as actually worn — no swatches, streaks, stripes or unblended patches of product on the skin.',
    'Show only the person — no product packaging, no tubes, no bottles.',
    'Absolutely no text, letters, numbers, logos or watermark anywhere.',
    `Important: the model is ${subject}. Vertical portrait 3:4.`,
  ].join(' ')
}
