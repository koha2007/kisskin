interface Env {
  OPENAI_API_KEY: string
}

interface RequestBody {
  photo: string
  gender: string
  skinType: string
  photoRatio?: number
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
    const { photo, gender, skinType, photoRatio } = (await request.json()) as RequestBody

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

    // 사진 비율에 맞는 이미지 사이즈 결정
    const ratio = photoRatio || 1
    let imageSize = '1024x1024'
    if (ratio < 0.85) {
      imageSize = '1024x1536' // 세로 사진
    } else if (ratio > 1.15) {
      imageSize = '1536x1024' // 가로 사진
    }

    // 1. 이미지 생성 (gpt-image-1.5) - 9가지 메이크업 3x3 그리드
    const formData = new FormData()
    formData.append('image', imageBlob, 'photo.png')
    formData.append('model', 'gpt-image-1.5')
    formData.append('n', '1')
    formData.append('size', imageSize)
    formData.append('quality', 'auto')
    formData.append('background', 'auto')
    formData.append('moderation', 'auto')
    formData.append('input_fidelity', 'high')
    const skinDesc = skinType === '잘 모름' ? '피부타입을 사진을 보고 너가 판단해서' : `${skinType} 타입을 반영해서`
    formData.append('prompt', `너는 최고의 메이크업 아티스트야. 이 사람은 ${gender}이고 ${skinType === '잘 모름' ? '피부타입을 잘 모르는 상태' : skinType + ' 피부타입'}이야.
${skinDesc} 총 9가지 메이크업을 3x3 그리드로 생성해줘.

[최우선 규칙 - 얼굴 고정]
- 9칸 모두 원본 사진과 100% 동일한 얼굴이어야 해.
- 얼굴 위치, 크기, 각도, 방향, 표정이 9칸 전부 완전히 동일해야 해. 마치 같은 사진을 복사해서 메이크업만 바꾼 것처럼.
- 눈, 코, 입, 턱, 이마, 귀, 헤어라인의 픽셀 위치가 9칸 모두에서 정확히 같아야 해.
- 얼굴 형태, 이목구비, 피부색, 머리카락 스타일을 절대 변경하지 마.
- 오직 화장(아이섀도, 립스틱, 블러셔, 파운데이션 등)만 다르게 적용해.

[그리드 규칙]
- 그리드 칸 사이에 여백, 테두리, 구분선이 절대 없어야 해. 완전히 빈틈없이 딱 붙여.
- 바깥 여백(패딩)도 없이 이미지 가장자리까지 꽉 채워.
- 9칸 모두 정확히 동일한 크기로 균등하게 배치해.
- 각 칸에는 얼굴 사진만. 텍스트, 글자, 라벨, 숫자를 절대 넣지 마.

[프레이밍 규칙]
- 9칸 모두 원본 사진과 동일한 프레이밍(구도)을 유지해. 얼굴이 칸 안에서 동일한 위치, 동일한 크기로 보여야 해.
- 머리 꼭대기부터 턱까지 잘리지 않게 하고, 원본과 같은 여백을 유지해.

9가지 메이크업 (좌→우, 위→아래 순서):
1번: 자연스러운 광채 메이크업 (Natural Glow)
2번: 뽀얀 구름같은 클라우드 스킨 메이크업 (Cloud Skin)
3번: 진한 입술 강조 블러드 립 메이크업 (Blood Lip)
4번: 화려한 눈 강조 맥시멀리스트 아이 메이크업 (Maximalist Eye)
5번: 금속 광택 메탈릭 아이 메이크업 (Metallic Eye)
6번: 강렬한 입술 볼드 립 메이크업 (Bold Lip)
7번: 블러쉬 드레이핑 & 레이어링 메이크업 (Blush Draping & Layering)
8번: 어둡고 거친 그런지 메이크업 (Grunge Makeup)
9번: K-pop 아이돌 스타일 메이크업 (K-pop Idol Makeup)

핵심 요약: 원본 사진을 9번 복사한 뒤 각각 다른 메이크업만 입힌 것처럼 만들어. 얼굴 위치와 크기는 절대 변하면 안 돼.`)

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

{"summary":"피부 분석 요약 (2-3문장). 성별, 피부타입, 피부톤 분석을 포함.","products":[{"category":"카테고리","name":"제품명","brand":"브랜드명","price":"₩가격","reason":"추천 이유 1문장"}]}

규칙:
- products 배열에 6~8개 제품을 추천하세요
- category는 반드시 Skin, Eyes, Lips, Cheeks, Base 중 하나
- 전 세계에서 구매 가능한 글로벌 브랜드 화장품을 추천하세요 (예: MAC, NARS, Charlotte Tilbury, Fenty Beauty, Rare Beauty, Dior, YSL, Clinique 등)
- 가격은 미국 달러($)로 대략적인 정가를 표기하세요
- 피부타입에서 잘 모름이면 사진을 보고 판단해서 추천하세요
- summary에 성별, 피부타입, 톤 분석을 간략히 포함하세요`,
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
