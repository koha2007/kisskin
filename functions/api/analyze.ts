interface Env {
  OPENAI_API_KEY: string
}

interface RequestBody {
  photo: string
  gender: string
  skinType: string
  makeupStyle: string
}

interface ResponseOutput {
  output: {
    type: string
    role?: string
    content?: { type: string; text: string }[]
  }[]
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

    const developerPrompt = `당신은 전문 메이크업 아티스트 입니다.
사용자의 사진과 선택한 정보를 분석하여 맞춤형 최신 메이크업 스타일 컨설팅 보고서를 작성해 주세요.
보고서에는 다음 내용을 포함해주세요.
1. 남자, 여자
2. 건성, 지성, 중성, 복합성
3. 내추럴, 글라스 스킨, 블러셔 중심, 톤온톤, 스모키, 딥 베리 립
친절하고 전문적인 메이크업 방법을 작성해주세요.
그리고 메이크업 방법을 소개해줄때, 화장품 소개까지 해주세요.`

    const userPrompt = `${gender}
${skinType}
${makeupStyle}
메이크업추천`

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.2',
        input: [
          {
            role: 'developer',
            content: [
              { type: 'input_text', text: developerPrompt },
            ],
          },
          {
            role: 'user',
            content: [
              { type: 'input_image', image_url: photo },
              { type: 'input_text', text: userPrompt },
            ],
          },
        ],
        text: {
          format: { type: 'text' },
          verbosity: 'medium',
        },
        reasoning: {
          effort: 'medium',
        },
        tools: [],
        store: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      return new Response(JSON.stringify({ error: 'OpenAI API error', detail: errorData }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = (await response.json()) as ResponseOutput

    let report = '보고서를 생성할 수 없습니다.'
    for (const item of data.output) {
      if (item.type === 'message' && item.content) {
        for (const block of item.content) {
          if (block.type === 'output_text') {
            report = block.text
            break
          }
        }
      }
    }

    return new Response(JSON.stringify({ report }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
