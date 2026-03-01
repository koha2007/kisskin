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
    const skinTypeInstruction = skinType === '잘 모름' ? '피부타입은 사진을 보고 판단해서' : skinType + ' 피부타입을'

    const femalePrompt = `너는 최고의 메이크업 아티스트야. 이 사진은 동일한 얼굴이 3×3 그리드로 배치된 것이야. 이 사람은 ${gender}이고 ${skinTypeInstruction} 반영해서 총 9가지 메이크업을 표현해줘.

[가장 중요한 규칙 - 반드시 지켜]
- 이미지에 글자, 텍스트, 라벨, 숫자, 영어, 한글, 워터마크, 캡션을 절대 절대 절대 넣지 마. 오직 얼굴과 메이크업만 보여줘. 텍스트가 포함되면 실패야.

[절대 규칙]
- 사람의 얼굴은 절대 바꾸지 말고 메이크업만 확실하게 분별할 수 있게 표현해
- 9칸 모두 얼굴 위치, 크기, 각도, 표정이 완전히 동일해야 해
- 이빨이 보이면 깨끗하고 하얗고 고르게 보정해줘
- 배경, 조명, 옷은 절대 변경하지 마 (2번 제외하고 머리카락도 변경하지 마)
- 총 9가지 메이크업 스타일을 확실하고 정확하게 자연스럽게 표현해줘
- 각 메이크업 스타일이 한눈에 구분될 만큼 확실하게 달라야 해
- 얼굴이 칸 안에 다 들어가게 생성하고 위, 아래, 좌, 우 여백 균등하게 생성해줘
- 그리드 칸 사이에 여백/테두리/구분선 없이 빈틈없이 딱 붙여

[9가지 메이크업 - 좌→우, 위→아래 순서]
1: 촉촉한 광채 피부, 부드러운 피치 블러셔, 누드 립
2: 뽀얀 구름 피부, 밝고 깨끗한 베이스, 최소한의 컬러, 머리카락을 밝은 색(애쉬 블론드/밀크 브라운)으로 변경. 옷은 원본 그대로 유지
3: 진하고 어두운 버건디/레드 립, 깔끔한 아이 메이크업
4: 화려한 컬러 아이섀도(보라/파랑/초록), 굵은 아이라인
5: 반짝이는 골드/실버 메탈릭 아이섀도, 글로시 눈매
6: 선명한 빨강/코랄 립스틱, 강렬한 입술 컬러
7: 광대뼈와 관자놀이까지 진하게 분홍/코랄 블러셔
8: 어두운 스모키 아이, 다크 베리/브라운 립, 매트 피부
9: 유리알 피부 광택, 그라데이션 핑크 립, 눈 안쪽 쉬머

핵심: 9가지 메이크업이 각각 확실히 다르게 보여야 해. 이미지 위에 어떤 글자도 렌더링하지 마.`

    const malePrompt = `너는 최고의 메이크업 아티스트야. 이 사진은 동일한 얼굴이 3×3 그리드로 배치된 것이야. 이 사람은 ${gender}이고 ${skinTypeInstruction} 반영해서 2026년 글로벌 트렌드 메이크업 9가지를 표현해줘.

[가장 중요한 규칙 - 반드시 지켜]
- 이미지에 글자, 텍스트, 라벨, 숫자, 영어, 한글, 워터마크, 캡션을 절대 절대 절대 넣지 마. 오직 얼굴과 메이크업만 보여줘. 텍스트가 포함되면 실패야.

[절대 규칙]
- 사람의 얼굴은 절대 바꾸지 말고 메이크업만 확실하게 분별할 수 있게 표현해
- 9칸 모두 얼굴 위치, 크기, 각도, 표정이 완전히 동일해야 해
- 이빨이 보이면 깨끗하고 하얗고 고르게 보정해줘
- 배경, 조명, 옷, 머리카락은 절대 변경하지 마
- 총 9가지 메이크업 스타일을 확실하고 정확하게 자연스럽게 표현해줘
- 각 메이크업 스타일이 한눈에 구분될 만큼 확실하게 달라야 해
- 얼굴이 칸 안에 다 들어가게 생성하고 위, 아래, 좌, 우 여백 균등하게 생성해줘
- 그리드 칸 사이에 여백/테두리/구분선 없이 빈틈없이 딱 붙여

[9가지 메이크업 - 좌→우, 위→아래 순서]
1: 피부 본연의 결을 드러내는 스킨케어 기반 베이스, 자연스럽고 살아있는 피부
2: 립 컬러가 자연스럽게 번진 듯한 색감, 입술 경계가 흐릿하고 부드러운 그라데이션
3: 코발트, 터콰이즈, 아이시 블루 등 파란색 계열 아이섀도, 프로스티드 텍스처
4: 어두운 톤의 스모키 아이, 세련된 그런지 스타일, 번진 듯한 아이라인
5: 창백하게 정돈된 피부 위에 딥한 레드 립, 강렬한 스모키 아이 조합
6: 진한 자두색, 강렬한 레드, 글로시 베리 등 고채도 립 컬러가 주인공
7: 하나의 컬러 계열로 눈, 입술, 볼을 통일, 매트와 새틴 텍스처 차이로 세련미
8: 크리스탈, 보석, 스터드 등으로 눈가를 장식하는 맥시멀리스트 아이 룩
9: 플로팅 라이너, 기하학적 형태, 예상치 못한 위치에 컬러를 배치하는 아방가르드 표현

핵심: 9가지 메이크업이 각각 확실히 다르게 보여야 해. 이미지 위에 어떤 글자도 렌더링하지 마.`

    formData.append('prompt', gender === '남성' ? malePrompt : femalePrompt)

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
