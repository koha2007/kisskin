interface Env {
  OPENAI_API_KEY: string
}

interface RequestBody {
  photo: string
  gender: string
  skinType: string
  makeupStyle: string
}

interface OpenAIImageResponse {
  data: { b64_json: string; revised_prompt?: string }[]
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  const envKeys = Object.keys(env)

  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({
      error: 'API key not configured',
      debug: `Available env keys: [${envKeys.join(', ')}]`,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { photo, gender, skinType, makeupStyle } = (await request.json()) as RequestBody

    if (!photo || !gender || !skinType || !makeupStyle) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // base64 데이터 URL에서 순수 base64 추출
    const base64Match = photo.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!base64Match) {
      return new Response(JSON.stringify({ error: 'Invalid image format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const imageType = base64Match[1]
    const base64Data = base64Match[2]

    // base64 → binary → Blob
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const imageBlob = new Blob([bytes], { type: `image/${imageType}` })

    const prompt = `너는 최고의 메이크업 아티스트야. 2x2 그리드로, 어떤 메이크업인지 한국어 설명과 함께 첨부한 사진속 사람에게 최고로 잘 어울리는 "${makeupStyle}" 메이크업 스타일 4가지 변형을 생성해줘. 단 첨부한 사람의 얼굴은 절대 바꾸지 말고 기존 얼굴 그대로 유지하고 메이크업 스타일만 바꿔. 이 사람은 ${gender}이고 ${skinType} 피부타입이야. ${skinType} 피부에 맞는 제품감과 질감을 반영해줘.`

    // OpenAI images/edits API 호출 (multipart/form-data)
    const formData = new FormData()
    formData.append('image', imageBlob, `photo.${imageType}`)
    formData.append('prompt', prompt)
    formData.append('model', 'gpt-image-1')
    formData.append('n', '1')
    formData.append('size', '1024x1024')
    formData.append('quality', 'auto')
    formData.append('response_format', 'b64_json')

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      return new Response(JSON.stringify({ error: 'OpenAI API error', detail: errorData }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = (await response.json()) as OpenAIImageResponse

    const imageBase64 = data.data?.[0]?.b64_json
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: '이미지를 생성할 수 없습니다.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const resultImage = `data:image/png;base64,${imageBase64}`

    return new Response(JSON.stringify({ image: resultImage }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
