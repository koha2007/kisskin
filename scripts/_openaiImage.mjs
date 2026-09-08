// OpenAI 이미지 생성 공용 호출부.
//
// 왜 이걸 쓰나 (2026-09-08):
//   · Gemini 이미지 경로(_geminiImage.mjs)는 두 겹으로 죽어 있다 —
//     ① 무료 티어에 이미지 쿼터가 없어 실키로도 429(quota exceeded).
//     ② gemini-3.1-flash-image 는 aspectRatio 필드에서 400(스키마 불일치, 실키 검증 안 됨).
//   · 반면 OpenAI 이미지는 이 리포가 이미 라이브에서 쓰고 있다(functions/api/makeup-edit.ts
//     의 gpt-image-2, scripts/gen-look-models.mjs). 텍스트 발행도 Gemini 막히면 OpenAI 로
//     폴백한다(_geminiText.mjs). 같은 안전줄에 이미지도 얹는다.
//
// 인터페이스는 _geminiImage.mjs 와 맞춰 뒀다(IMAGE_MODEL, generateImageB64) —
// 호출부(gen-products.mjs 의 genImage)가 import 한 줄만 바꾸면 되도록.

export const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
const IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY || 'medium' // low|medium|high|auto

// gpt-image-1 은 임의 비율을 못 받는다 — 고정 3종 중에서 고르고, 나머지는 sharp 가 크롭한다.
function sizeFor(aspectRatio) {
  const [w, h] = String(aspectRatio).split(':').map(Number)
  if (!w || !h || w === h) return '1024x1024'
  return h > w ? '1024x1536' : '1536x1024'
}

/**
 * 텍스트 프롬프트로 이미지 1장 생성. base64 문자열을 돌려주고,
 * 콘텐츠 필터에 막히면 undefined 를 돌려준다(호출부가 프롬프트 변주로 재시도).
 * 그 밖의 오류는 throw.
 */
export async function generateImageB64(apiKey, prompt, aspectRatio = '3:4') {
  if (!apiKey) throw new Error('OPENAI_API_KEY 없음 — 이미지 생성 불가')
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      size: sizeFor(aspectRatio),
      quality: IMAGE_QUALITY,
      n: 1,
    }),
  })

  if (!res.ok) {
    const body = (await res.text().catch(() => '')).slice(0, 300)
    // 프롬프트가 안전정책에 걸리면 400 + moderation_blocked. 같은 프롬프트 재시도는
    // 소용없으니 undefined 를 돌려 호출부가 인물/구도 변주로 다시 시도하게 한다.
    if (res.status === 400 && /moderation|safety|content[_ ]policy/i.test(body)) {
      console.warn(`  ↻ ${IMAGE_MODEL} moderation_blocked — 변주 재시도 유도`)
      return undefined
    }
    throw new Error(`${IMAGE_MODEL} ${res.status}: ${body}`)
  }

  const json = await res.json()
  return json?.data?.[0]?.b64_json
}

/** 위와 같되 Buffer 로 돌려준다. 이미지가 없으면 throw. */
export async function generateImageBuffer(apiKey, prompt, aspectRatio = '3:4') {
  const b64 = await generateImageB64(apiKey, prompt, aspectRatio)
  if (!b64) throw new Error(`${IMAGE_MODEL}: 이미지 없음 (콘텐츠 필터에 막혔을 수 있음)`)
  return Buffer.from(b64, 'base64')
}
