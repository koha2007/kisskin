interface Env {
  OPENAI_API_KEY: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { photo, gender, skinType, makeupStyle } = await request.json<{
      photo: string
      gender: string
      skinType: string
      makeupStyle: string
    }>()

    if (!photo || !gender || !skinType || !makeupStyle) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt = `당신은 전문 퍼스널 메이크업 컨설턴트입니다.
사용자의 얼굴 사진을 분석하고, 선택한 정보를 바탕으로 맞춤형 메이크업 컨설팅 보고서를 작성해주세요.

보고서는 다음 형식으로 작성해주세요:

## 🪞 피부 분석
사진을 기반으로 피부 톤, 얼굴형, 특징 분석

## 💄 ${makeupStyle} 메이크업 가이드
선택한 화장법에 맞는 구체적인 메이크업 방법을 단계별로 설명

## 🛍️ 추천 제품
각 단계에 맞는 한국 화장품 브랜드 제품 추천 (3~5개)

## ⚠️ 주의사항
${skinType} 피부 타입에 맞는 메이크업 시 주의할 점

보고서는 한국어로 작성하고, 친근하면서도 전문적인 톤으로 작성해주세요.`

    const userPrompt = `성별: ${gender}
피부 타입: ${skinType}
원하는 화장법: ${makeupStyle}

위 정보와 첨부된 사진을 분석하여 맞춤 메이크업 컨설팅 보고서를 작성해주세요.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: { url: photo, detail: 'low' },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      return new Response(JSON.stringify({ error: 'OpenAI API error', detail: errorData }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json<{
      choices: { message: { content: string } }[]
    }>()

    const report = data.choices?.[0]?.message?.content || '보고서를 생성할 수 없습니다.'

    return new Response(JSON.stringify({ report }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
