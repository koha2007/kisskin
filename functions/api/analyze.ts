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
    const envKeys = Object.keys(env)
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

    const developerPrompt = `당신은 전문 메이크업 아티스트입니다.
사용자의 사진을 분석하고, 사용자가 선택한 피부 타입과 화장법에 맞는 전문 메이크업 스타일 컨설팅 보고서를 작성해주세요.

보고서는 다음 형식으로 작성해주세요:

## 🪞 피부 분석
사진을 기반으로 피부 톤, 얼굴형, 눈매, 골격 등 특징 분석

## 💄 ${makeupStyle} 메이크업 가이드
선택한 화장법에 맞는 구체적인 메이크업 방법을 단계별로 상세히 설명
- 베이스 메이크업 (${skinType} 피부 맞춤)
- 아이 메이크업
- 브로우
- 립 & 치크

## 🛍️ 추천 제품
각 단계에 맞는 한국 화장품 브랜드 제품 추천 (5~8개, 구체적인 제품명과 이유)

## ⚠️ 주의사항
${skinType} 피부 타입의 ${gender}이(가) ${makeupStyle} 메이크업 시 주의할 점과 지속력 팁

보고서는 한국어로 작성하고, 친근하면서도 전문적인 톤으로 작성해주세요.`

    const userPrompt = `성별: ${gender}
피부 타입: ${skinType}
화장법: ${makeupStyle}`

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
        },
        reasoning: {
          effort: 'medium',
        },
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

    // output에서 output_text 추출
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
