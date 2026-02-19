interface Env {
  OPENAI_API_KEY: string
}

interface RequestBody {
  photo: string
  gender: string
  skinType: string
  makeupStyle: string
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

    // Responses API + image_generation 도구 사용
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_image', image_url: photo },
              {
                type: 'input_text',
                text: `Retouch this exact photo. This is a PHOTO EDITING task, NOT a new image generation task.

DO NOT generate a new face. DO NOT redraw the person. Edit THIS photo only.

Task: Apply "${makeupStyle}" makeup to this exact photo as a retouch.
- Skin type: ${skinType}
- Gender: ${gender}

What to EDIT (cosmetics only):
- Lip color/gloss
- Eye shadow, eyeliner, mascara
- Blush/cheek color
- Foundation/skin tone evening
- Eyebrow shaping/color

What MUST stay pixel-identical (do NOT touch):
- Face shape, jawline, bone structure
- Eye shape, nose shape, mouth shape, ear shape
- Hair, hairstyle, hair color
- Skin texture, moles, freckles
- Background, clothing, accessories
- Camera angle, lighting, framing, composition
- Head position and body posture

Output a single retouched photo of this exact person with "${makeupStyle}" makeup applied. Keep the full head and hair visible, do not crop.`,
              },
            ],
          },
        ],
        tools: [
          {
            type: 'image_generation',
            quality: 'auto',
            size: '1024x1024',
            background: 'auto',
          },
        ],
        tool_choice: { type: 'image_generation' },
      }),
    })

    if (!res.ok) {
      const errorBody = await res.text()
      return new Response(JSON.stringify({
        error: `API 오류 (${res.status}): ${errorBody}`,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 응답에서 image_generation_call 추출
    const data = await res.json() as {
      output: { type: string; result?: string }[]
    }

    const imageResult = data.output?.find(
      (o) => o.type === 'image_generation_call' && o.result
    )

    if (!imageResult?.result) {
      return new Response(JSON.stringify({
        error: '이미지가 생성되지 않았습니다.',
        raw: JSON.stringify(data.output?.map((o) => o.type)),
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      image: `data:image/png;base64,${imageResult.result}`,
    }), {
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
