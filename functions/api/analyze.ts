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
${skinType} 타입을 반영해서 총 6가지 메이크업을 2x3 그리드로 생성해줘.

반드시 지켜야 할 규칙:
1. 사람의 얼굴은 절대 바꾸지 말고 메이크업만 바꿔.
2. 각 칸마다 머리 꼭대기부터 턱까지 얼굴 전체와 머리카락이 절대 잘리지 않게 충분한 여백을 두고 생성해.
3. 각 칸 하단에 메이크업 이름을 크고 선명한 흰색 텍스트로 반드시 표시해줘.
4. 그리드 라인을 명확하게 표시해줘.
5. 6칸 모두 동일한 크기로 균등하게 배치해줘.

6가지 메이크업과 각 칸에 표시할 이름:
1번 칸: "내추럴" - 자연스러운 내추럴 메이크업
2번 칸: "글라스 스킨" - 촉촉한 광채 글라스 스킨 메이크업
3번 칸: "블러셔 중심" - 혈색감 강조 블러셔 중심 메이크업
4번 칸: "톤온톤" - 통일감 있는 톤온톤 메이크업
5번 칸: "스모키" - 강렬한 스모키 메이크업
6번 칸: "딥 베리 립" - 진한 베리톤 딥 베리 립 메이크업

각 메이크업이 확실하게 구분되도록 다 다르게 표현해줘.`)

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
