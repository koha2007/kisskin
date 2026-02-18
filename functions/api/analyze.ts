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

interface ImageResponse {
  data: { b64_json: string }[]
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

    // === 1) 텍스트 보고서 (gpt-5.2) ===
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

    // === 2) 메이크업 이미지 생성 (gpt-image-1) ===
    // base64 → Blob 변환
    const base64Match = photo.match(/^data:image\/(\w+);base64,(.+)$/)
    let imageBlob: Blob | null = null
    let imageType = 'png'
    if (base64Match) {
      imageType = base64Match[1]
      const base64Data = base64Match[2]
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      imageBlob = new Blob([bytes], { type: `image/${imageType}` })
    }

    const imagePrompt = `너는 최고의 전문 메이크업 아티스트야. 총 6가지의 메이크업 스타일(내추럴, 글라스 스킨, 블러셔 중심, 톤온톤, 스모키, 딥 베리 립)이 있어. 사용자가 "${makeupStyle}" 메이크업을 선택했어. 2x2 그리드로 첨부한 사진속 사람에게 최고로 잘 어울리는 전문 "${makeupStyle}" 메이크업 스타일 4가지 단계로 생성해줘. 이 사람은 ${gender}이고 ${skinType} 피부타입이야. 단 첨부한 사람의 얼굴은 절대 바꾸지 말고 기존 얼굴 그대로 유지하고 헤어 스타일만 바꿔.`

    // 두 API 동시 호출
    const reportPromise = fetch('https://api.openai.com/v1/responses', {
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
            content: [{ type: 'input_text', text: developerPrompt }],
          },
          {
            role: 'user',
            content: [
              { type: 'input_image', image_url: photo },
              { type: 'input_text', text: userPrompt },
            ],
          },
        ],
        text: { format: { type: 'text' }, verbosity: 'medium' },
        reasoning: { effort: 'medium' },
        tools: [],
        store: true,
      }),
    })

    let imagePromise: Promise<Response> | null = null
    if (imageBlob) {
      const formData = new FormData()
      formData.append('image', imageBlob, `photo.${imageType}`)
      formData.append('prompt', imagePrompt)
      formData.append('model', 'gpt-image-1')
      formData.append('n', '1')
      formData.append('size', '1024x1024')
      formData.append('quality', 'auto')
      formData.append('response_format', 'b64_json')

      imagePromise = fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
        body: formData,
      })
    }

    // 결과 수집
    const [reportRes, imageRes] = await Promise.all([
      reportPromise,
      imagePromise || Promise.resolve(null),
    ])

    // 텍스트 보고서 파싱
    let report = '보고서를 생성할 수 없습니다.'
    if (reportRes.ok) {
      const data = (await reportRes.json()) as ResponseOutput
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
    }

    // 이미지 파싱
    let image: string | null = null
    if (imageRes && imageRes.ok) {
      const imgData = (await imageRes.json()) as ImageResponse
      const b64 = imgData.data?.[0]?.b64_json
      if (b64) {
        image = `data:image/png;base64,${b64}`
      }
    }

    return new Response(JSON.stringify({ report, image }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
