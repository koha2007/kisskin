interface Env {
  OPENAI_API_KEY: string
}

interface RequestBody {
  photo: string
  gridPhoto?: string
  gridSize?: string
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
    const { photo, gridPhoto, gridSize, gender, skinType } = (await request.json()) as RequestBody

    if (!photo || !gender || !skinType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 이미지 생성용: 프론트에서 만든 3x3 타일 그리드 사용 (없으면 원본 사용)
    const imageSource = gridPhoto || photo
    const mimeMatch = imageSource.match(/^data:(.+?);/)
    const mimeType = mimeMatch?.[1] || 'image/png'
    const base64Data = imageSource.split(',')[1]
    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }
    const imageBlob = new Blob([bytes], { type: mimeType })
    const ext = mimeType === 'image/jpeg' ? 'photo.jpg' : 'photo.png'

    // 프론트에서 전달된 그리드 사이즈 사용 (원본 비율 유지)
    const imageSize = gridSize || '1024x1024'

    // 1. 이미지 생성 (gpt-image-1.5) - 9가지 메이크업 3x3 그리드
    const formData = new FormData()
    formData.append('image', imageBlob, ext)
    formData.append('model', 'gpt-image-1.5')
    formData.append('n', '1')
    formData.append('size', imageSize)
    formData.append('quality', 'high')
    formData.append('background', 'auto')
    formData.append('moderation', 'auto')
    formData.append('input_fidelity', 'high')
    formData.append('prompt', `This image is a 3×3 grid of the SAME face repeated 9 times. This person is ${gender}, skin type: ${skinType}.

YOUR TASK: Apply a different makeup look to each of the 9 cells. Do NOT change ANYTHING else.

[ABSOLUTE RULES]
- Keep the face position, size, angle, expression EXACTLY as in the input for ALL 9 cells
- Keep the background, lighting, hair EXACTLY as in the input
- ONLY change makeup colors: eyeshadow, lipstick, blush, foundation tone
- If teeth are visible, make them look clean, bright white, and evenly aligned in ALL 9 cells
- Do NOT move, resize, zoom, or crop any face
- ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO LABELS anywhere in the image. Zero text of any kind.
- No gaps, borders, or margins between cells. Seamless edge-to-edge grid

[9 MAKEUP STYLES - left to right, top to bottom]
1: Natural Glow - subtle dewy skin, soft peachy tones
2: Cloud Skin - bright milky-white flawless base
3: Blood Lip - deep dark red lips, minimal eye makeup
4: Maximalist Eye - dramatic colorful eyeshadow, bold eyeliner
5: Metallic Eye - shimmery metallic silver/gold eyeshadow
6: Bold Lip - vibrant bright red/orange lips
7: Blush Draping & Layering - heavy blush across cheeks and temples
8: Grunge Makeup - dark smoky eyes, dark lips, edgy look
9: K-pop Idol - glass skin, gradient lips, subtle shimmer eyes

The input already has the correct grid layout. Just recolor the makeup in each cell. NO TEXT ANYWHERE.`)

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
                text: `당신은 전문 메이크업 아티스트이자 화장품 전문가입니다.
사용자의 사진과 피부타입을 분석하여 맞춤형 화장품을 추천해주세요.

반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 텍스트는 절대 포함하지 마세요. 코드펜스(\`\`\`)도 쓰지 마세요.

{"analysis":{"gender":"성별","skinType":"피부타입","skinTypeDetail":"피부타입에 대한 상세 설명 2-3문장","tone":"톤 이름 (예: Warm Undertone)","toneDetail":"톤앤톤에 대한 상세 설명. 어울리는 컬러 계열과 피해야 할 컬러 포함. 2-3문장","advice":"종합적인 메이크업 조언 1-2문장"},"products":[{"category":"카테고리","name":"제품명","brand":"브랜드명","price":"$가격","reason":"추천 이유 1문장"}]}

규칙:
- analysis.skinTypeDetail: 피부타입의 특징, 장단점, 관리 포인트를 설명
- analysis.toneDetail: 웜톤/쿨톤/뉴트럴 판단 근거, 어울리는 컬러와 피할 컬러를 구체적으로 설명
- analysis.advice: 이 사람에게 맞는 메이크업 방향을 종합 조언
- products 배열에 6~8개 제품을 추천하세요
- category는 반드시 Skin, Eyes, Lips, Cheeks, Base 중 하나
- 전 세계에서 구매 가능한 글로벌 브랜드 화장품을 추천하세요 (예: MAC, NARS, Charlotte Tilbury, Fenty Beauty, Rare Beauty, Dior, YSL, Clinique 등)
- 가격은 미국 달러($)로 대략적인 정가를 표기하세요
- 피부타입에서 잘 모름이면 사진을 보고 판단해서 추천하세요`,
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

      // JSON 추출 및 검증
      if (report) {
        try {
          const jsonMatch = report.match(/```(?:json)?\s*([\s\S]*?)```/)
          const jsonStr = jsonMatch ? jsonMatch[1].trim() : report.trim()
          const parsed = JSON.parse(jsonStr)
          if (parsed && typeof parsed.summary === 'string' && Array.isArray(parsed.products)) {
            report = JSON.stringify(parsed)
          }
        } catch {
          // JSON 파싱 실패 시 원본 텍스트 유지 (마크다운 폴백)
        }
      }
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
