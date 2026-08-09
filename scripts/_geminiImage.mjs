// Gemini 이미지 생성 공용 호출부.
//
// 왜 모듈로 뺐나: `imagen-4.0-*` 3종이 2026-08-17 종료됐고(공식 지원종료 목록),
// 후속 `gemini-3.1-flash-image` 는 요청·응답 모양이 둘 다 달라 모델명만 바꾸면 깨진다.
// 같은 호출부를 gen-products / gen-mood-images / gen-look-models 세 곳이 각자 복사해
// 갖고 있었다 — 다음 모델 교체 때 또 세 곳을 찾아다니지 않으려고 여기 하나로 모았다.
//
//              imagen (구·삭제됨)                  gemini image (현)
//   엔드포인트  :predict                            :generateContent
//   요청        instances[].prompt                  contents[].parts[].text
//               parameters.sampleCount              generationConfig.responseModalities
//               parameters.aspectRatio              generationConfig.responseFormat.image.aspectRatio
//   응답        predictions[0].bytesBase64Encoded   candidates[].content.parts[].inlineData.data
//
// ⚠️ 이 코드는 **실키로 검증되지 않았다**(2026-08-09 결제 홀딩 중 작성 — 403 만 돌아옴).
//    일일 발행은 워크플로의 PRODUCT_IMAGES='0' 로 이 경로를 아예 타지 않으므로
//    틀렸더라도 글 발행은 멈추지 않는다. 검증은 키가 살아난 뒤 GEMINI_HOLD.md 절차대로.

export const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image'

/**
 * 텍스트 프롬프트로 이미지 1장 생성. base64 문자열을 돌려주고,
 * 안전필터에 걸려 이미지 파트가 없으면 undefined 를 돌려준다(호출부가 변주 재시도).
 */
export async function generateImageB64(apiKey, prompt, aspectRatio = '3:4') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`
  // 키는 쿼리스트링(?key=)이 아니라 헤더로 보낸다 — URL 은 로그·에러메시지에 그대로 찍힌다.
  const headers = { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }
  const contents = [{ parts: [{ text: prompt }] }]

  const call = (generationConfig) =>
    fetch(url, { method: 'POST', headers, body: JSON.stringify({ contents, generationConfig }) })

  let res = await call({
    responseModalities: ['TEXT', 'IMAGE'],
    responseFormat: { image: { aspectRatio, imageSize: '1K' } },
  })

  // 400 은 대개 "그 필드 모른다" 다. responseFormat 스키마는 모델 세대마다 바뀌어 왔으므로
  // 한 번은 그것 없이 재시도한다 — 비율은 잃지만 sharp 가 어차피 cover 로 크롭한다.
  // 이미지가 아예 안 나오는 것보다 크롭되는 편이 낫다.
  if (res.status === 400) {
    const first = (await res.text().catch(() => '')).slice(0, 200)
    console.warn(`  ↻ ${IMAGE_MODEL} 400 — responseFormat 없이 재시도: ${first}`)
    res = await call({ responseModalities: ['TEXT', 'IMAGE'] })
  }

  if (!res.ok) throw new Error(`${IMAGE_MODEL} ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`)

  const json = await res.json()
  const parts = json?.candidates?.[0]?.content?.parts || []
  // responseModalities 에 TEXT 가 있어 설명 텍스트 파트가 섞여 온다.
  // parts[0] 을 그냥 집으면 안 되고 inlineData 가 있는 파트를 찾아야 한다.
  return parts.find((p) => p?.inlineData?.data)?.inlineData?.data
}

/** 위와 같되 Buffer 로 돌려준다. 이미지가 없으면 throw. */
export async function generateImageBuffer(apiKey, prompt, aspectRatio = '3:4') {
  const b64 = await generateImageB64(apiKey, prompt, aspectRatio)
  if (!b64) throw new Error(`${IMAGE_MODEL}: 이미지 없음 (안전 필터에 걸렸을 수 있음)`)
  return Buffer.from(b64, 'base64')
}
