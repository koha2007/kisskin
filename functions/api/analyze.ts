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
                text: `너는 최고의 전문 메이크업 아티스트야. 총 6가지의 메이크업이 있어.
내추럴메이크업, 글라스스킨메이크업, 블러셔중심메이크업, 톤온톤메이크업, 스모키메이크업, 딥베리립메이크업.
이 사람은 ${gender}이고 ${skinType} 피부타입이야.
"${makeupStyle}"메이크업을 선택했어.
2x2 그리드로, "${makeupStyle}"메이크업 방식을 4가지로 생성해줘. 단 첨부한 사람의 얼굴은 절대 바꾸지 말고 기존 얼굴 그대로 유지하고 메이크업만 바꿔.`,
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
