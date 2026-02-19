interface Env {
  OPENAI_API_KEY: string
}

interface RequestBody {
  photo: string
  gender: string
  skinType: string
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
    const { photo, gender, skinType } = (await request.json()) as RequestBody

    if (!photo || !gender || !skinType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // base64 data URL → Blob 변환
    const base64Data = photo.split(',')[1]
    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }
    const imageBlob = new Blob([bytes], { type: 'image/png' })

    // 1. 이미지 생성 (gpt-image-1.5) - 6가지 메이크업 2x3 그리드
    const formData = new FormData()
    formData.append('image', imageBlob, 'photo.png')
    formData.append('model', 'gpt-image-1.5')
    formData.append('n', '1')
    formData.append('size', '1024x1024')
    formData.append('quality', 'auto')
    formData.append('background', 'auto')
    formData.append('moderation', 'auto')
    formData.append('input_fidelity', 'high')
    formData.append('prompt', `너는 최고의 메이크업 아티스트야. 이 사람은 ${gender}이고 ${skinType} 피부타입이야.
사용자가 사진을 넣으면 ${skinType} 타입을 반영해서
2026년 유행하는 메이크업과 기본메이크업 총 6가지로 2x3 그리드로 생성해줘.
단 사람의 얼굴은 절대 바꾸지 말고 메이크업만 확실하게 분별할 수 있게 표현해줘.
그리드 라인 표시해줘, 그리고 머리카락 화면에서 잘리지 않게 다 균등하게 생성해줘.
내추럴, 글라스 스킨, 블러셔 중심, 톤온톤, 스모키, 딥 베리 립 총 6가지 메이크업으로
다 다르게 확실한 메이크업 방식으로 생성해줘`)

    const imagePromise = fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
      body: formData,
    })

    // 2. 텍스트 보고서 (gpt-4.1) - 화장품 추천
    const reportPromise = fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: `당신은 전문 메이크업 아티스트 입니다.
사용자의 사진과 피부타입중 건성, 지성, 중성, 복합성 을 분석하여
맞춤형 화장품 추천을 해주세요.
제품명과 설명은 최대한 간소하게 해주세요.
보고서에는 다음과 같이 표현해주세요.
사진을 보고 톤앤톤도 아주 간략하게 설명해주세요.
성별
피부타입
피부타입에 따라서 관련된 화장품 제품 이름과 간략한 설명.`,
              },
            ],
          },
          {
            role: 'user',
            content: [
              { type: 'input_image', image_url: photo },
              {
                type: 'input_text',
                text: `${gender}\n${skinType}`,
              },
            ],
          },
        ],
        temperature: 1,
        max_output_tokens: 2048,
        top_p: 1,
      }),
    })

    // 병렬 실행
    const [imageRes, reportRes] = await Promise.all([imagePromise, reportPromise])

    // 이미지 응답 처리
    let imageData = ''
    if (imageRes.ok) {
      const imgJson = await imageRes.json() as {
        data: { b64_json?: string; url?: string }[]
      }
      const imgResult = imgJson.data?.[0]
      if (imgResult?.b64_json) {
        imageData = `data:image/png;base64,${imgResult.b64_json}`
      } else if (imgResult?.url) {
        const imgFetch = await fetch(imgResult.url)
        const imgBuf = await imgFetch.arrayBuffer()
        const imgBytes = new Uint8Array(imgBuf)
        let binary = ''
        for (let i = 0; i < imgBytes.length; i++) {
          binary += String.fromCharCode(imgBytes[i])
        }
        imageData = `data:image/png;base64,${btoa(binary)}`
      }
    }

    // 보고서 응답 처리
    let report = ''
    if (reportRes.ok) {
      const reportJson = await reportRes.json() as {
        output: { type: string; content?: { type: string; text?: string }[] }[]
      }
      const msg = reportJson.output?.find((o) => o.type === 'message')
      const textBlock = msg?.content?.find((c) => c.type === 'output_text')
      report = textBlock?.text || ''
    }

    if (!imageData && !report) {
      const errBody = !imageRes.ok ? await imageRes.text() : ''
      return new Response(JSON.stringify({
        error: `API 오류: ${errBody || '이미지와 보고서 모두 생성 실패'}`,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ image: imageData, report }), {
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
