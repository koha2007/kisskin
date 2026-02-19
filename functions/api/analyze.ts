interface Env {
  OPENAI_API_KEY: string
}

interface RequestBody {
  photo: string
  gender: string
  skinType: string
  makeupStyle: string
}

interface ImageResponse {
  data: { b64_json?: string; url?: string }[]
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
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

    // base64 data URL → Blob 변환
    const base64Match = photo.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!base64Match) {
      return new Response(JSON.stringify({ error: 'Invalid image format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const imageType = base64Match[1]
    const mimeType = imageType === 'jpg' ? 'image/jpeg' : `image/${imageType}`
    const base64Data = base64Match[2]
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const imageBlob = new Blob([bytes], { type: mimeType })

    const imagePrompt = `너는 최고의 전문 메이크업 아티스트야. 총 6가지의 메이크업이 있어.
내추럴메이크업, 글라스스킨메이크업, 블러셔중심메이크업, 톤온톤메이크업, 스모키메이크업, 딥베리립메이크업.
사진 첨부한 사람이 한번에 한개만 선택할수 있어. 선택된 메이크업 방식으로 "${makeupStyle}"메이크업을 선택했어.
이 사람은 ${gender}이고 ${skinType} 피부타입이야.
2x2 그리드로, "${makeupStyle}"메이크업 방식을 4가지로 생성해줘. 단 첨부한 사람의 얼굴은 절대 바꾸지 말고 기존 얼굴 그대로 유지하고 메이크업만 바꿔.`

    // 메이크업 이미지 생성 (gpt-image-1)
    const formData = new FormData()
    formData.append('image', imageBlob, `photo.${imageType === 'jpg' ? 'jpeg' : imageType}`)
    formData.append('prompt', imagePrompt)
    formData.append('model', 'gpt-image-1')
    formData.append('n', '1')
    formData.append('size', '1024x1024')
    formData.append('response_format', 'b64_json')

    const imageRes = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
      body: formData,
    })

    if (!imageRes.ok) {
      const errorBody = await imageRes.text()
      return new Response(JSON.stringify({
        error: `이미지 생성 실패 (${imageRes.status}): ${errorBody}`,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const imgData = (await imageRes.json()) as ImageResponse
    const b64 = imgData.data?.[0]?.b64_json
    if (!b64) {
      return new Response(JSON.stringify({
        error: '이미지 응답에 데이터가 없습니다.',
        raw: JSON.stringify(imgData),
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ image: `data:image/png;base64,${b64}` }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({
      error: `서버 오류: ${e instanceof Error ? e.message : String(e)}`,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
