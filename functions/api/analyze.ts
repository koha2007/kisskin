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
                text: `당신은 전문 메이크업 아티스트 입니다.
사용자의 사진과 피부타입중 건성, 지성, 중성, 복합성 을 분석하여
맞춤형 화장품 추천을 해주세요.
제품명과 설명은 최대한 간소하게 해주세요.
보고서에는 다음과 같이 표현해주세요.
사진을 보고 톤앤톤도 아주 간략하게 설명해주세요.
성별
피부타입
피부타입에 따라서 관련된 화장품 제품 이름과 간략한 설명.
피부타입에서 잘 모름을 선택하면 너가 사진보고 알아서 판단해서 설명해줘`,
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
