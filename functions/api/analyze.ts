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
                text: `You are the world's best professional makeup artist. Your task is to apply makeup ONLY to the person in the attached photo.

CRITICAL RULES - YOU MUST FOLLOW:
1. NEVER change the person's face shape, bone structure, eyes, nose, mouth, ears, or any facial features. The face must remain 100% identical to the original photo.
2. NEVER change the person's hair, hairstyle, or hair color.
3. ONLY modify: foundation, eye shadow, eyeliner, mascara, blush, lip color, contouring/highlighting.
4. The entire head, hair, and neck must be fully visible - do NOT crop any part of the head or hair.
5. Keep the same camera angle and framing as the original photo.

Person info: ${gender}, ${skinType} skin type.
Selected makeup style: "${makeupStyle}"

Generate a 2x2 grid showing 4 different variations of "${makeupStyle}" makeup applied to this EXACT same person. Each variation should differ in intensity or color tone, but the person's face must remain perfectly identical across all 4 images.`,
              },
            ],
          },
        ],
        tools: [
          {
            type: 'image_generation',
            quality: 'auto',
            size: '1024x1536',
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
