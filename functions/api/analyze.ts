// OpenAI Makeup Analysis API v2
interface Env {
  OPENAI_API_KEY: string
}

interface RequestBody {
  photo: string
  gridPhoto?: string
  gridSize?: string
  gender: string
  skinType: string
  lang?: string
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
    const { photo, gridPhoto, gridSize, gender, skinType, lang } = (await request.json()) as RequestBody

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

    const malePrompt = `너는 최고의 메이크업 아티스트야. 이 사진은 동일한 얼굴이 3×3 그리드로 배치된 것이야. 이 사람은 ${gender}이고 ${skinTypeInstruction} 반영해서 2026년 남성 트렌드 메이크업 9가지를 표현해줘.

[가장 중요한 규칙 - 반드시 지켜]
- 이미지에 글자, 텍스트, 라벨, 숫자, 영어, 한글, 워터마크, 캡션을 절대 절대 절대 넣지 마. 오직 얼굴과 메이크업만 보여줘. 텍스트가 포함되면 실패야.

[절대 규칙]
- 사람의 얼굴은 절대 바꾸지 말고 메이크업만 확실하게 분별할 수 있게 표현해
- 9칸 모두 얼굴 위치, 크기, 각도, 표정이 완전히 동일해야 해
- 이빨이 보이면 깨끗하고 하얗고 고르게 보정해줘
- 배경, 조명, 옷은 절대 변경하지 마 (9번 제외하고 머리카락도 변경하지 마)
- 각 메이크업 스타일의 컬러, 질감, 강도가 한눈에 확실히 구분되어야 해. 비슷해 보이면 실패야!
- 얼굴이 칸 안에 다 들어가게 생성하고 위, 아래, 좌, 우 여백 균등하게 생성해줘
- 그리드 칸 사이에 여백/테두리/구분선 없이 빈틈없이 딱 붙여

[9가지 남성 메이크업 - 좌→우, 위→아래 순서 / 각 스타일을 과감하고 확실하게 표현해]
1: 내추럴 소프트포커스 - 피부 결점만 가볍게 보정한 민낯 느낌. 매트한 피부, 눈썹만 깔끔히 정리. 컬러 메이크업 없음
2: 스킨케어 하이브리드 베이스 - 유리알처럼 반짝이는 극강 윤광 피부. 하이라이터로 광대뼈·코끝·이마 중앙에 눈에 띄는 물광 강조. 촉촉하고 투명한 글로우
3: 디퓨즈드 립 - 입술 안쪽에 진한 로즈레드 컬러를 넣고 바깥으로 자연스럽게 번지게. 입술 색이 확실히 눈에 띄어야 해. 피부는 깨끗하게
4: 그런지 스모키 아이 - 눈 주변 전체를 블랙+다크브라운으로 진하고 거칠게 스머지. 언더아이까지 어둡게. 날카롭고 반항적인 느낌. 입술은 어두운 베리톤
5: 톤인톤 모노크롬 - 따뜻한 테라코타/브론즈 하나의 색으로 아이섀도·블러셔·립 전부 통일. 컬러가 확실히 보이게 진하게 표현
6: 유틸리티 메이크업 - 남성적이고 강인한 느낌. 얼굴 윤곽을 날카롭게 컨투어링, 턱선·코·광대뼈에 진한 쉐딩, 눈썹 굵고 선명하게. 조각 같은 얼굴
7: 블루 컬러 포인트 아이 - 선명한 일렉트릭 블루 아이섀도를 눈두덩이 전체에. 은은한 실버 글리터 포인트. 과감하고 미래적인 느낌
8: 뱀파이어 로맨틱 - 피부를 매우 창백하게 하얗게. 눈 주변은 딥 버건디+블랙으로 강렬한 스모키. 입술은 짙은 다크레드/와인색. 어둡고 신비로운 분위기
9: K-팝 아이돌 - 완벽한 글로우 베이스, 반짝이는 핑크+피치 아이섀도, 선명한 애교살 하이라이트, 코랄핑크 그라데이션 립, 눈썹 정교하게 정리. 머리카락을 트렌디한 색(애쉬 블론드/실버그레이/밀크브라운 중 택1)으로 변경. 옷은 원본 그대로 유지. 화사하고 깨끗한 아이돌 풀메이크업

핵심: 9가지 메이크업이 각각 확실히 다르게 보여야 해! 특히 1번(민낯)과 2번(물광)은 피부 질감으로, 3번은 립 컬러로, 4번과 8번은 아이 메이크업 스타일로, 5번은 통일 컬러로, 6번은 컨투어링으로, 7번은 블루 컬러로 차이를 확실하게 내야 해. 이미지 위에 어떤 글자도 렌더링하지 마.`

    formData.append('prompt', gender === '남성' ? malePrompt : femalePrompt)

    const imagePromise = fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
      body: formData,
    })

    // 2. 텍스트 보고서 (gpt-4.1) - 화장품 추천
    const isEn = lang === 'en'
    const reportSystemPrompt = isEn
      ? `You are a professional makeup artist and cosmetics expert.
Analyze the user's photo and skin type, then recommend personalized cosmetics.

Respond ONLY with the JSON format below. Do not include any text outside of JSON. Do not use code fences (\`\`\`).

{"analysis":{"gender":"gender","skinType":"skin type","skinTypeDetail":"Detailed description of skin type in 2-3 sentences","tone":"Tone name (e.g., Warm Undertone)","toneDetail":"Detailed tone analysis including flattering color families and colors to avoid. 2-3 sentences","advice":"Comprehensive makeup advice in 1-2 sentences"},"products":[{"category":"category","name":"product name","brand":"brand name","price":"$price","reason":"recommendation reason in 1 sentence"}]}

Rules:
- All text fields must be written in English
- analysis.skinTypeDetail: Describe characteristics, pros/cons, and care tips for this skin type
- analysis.toneDetail: Explain warm/cool/neutral determination basis, specifically list flattering colors and colors to avoid
- analysis.advice: Provide comprehensive makeup direction advice for this person
- Recommend 6-8 products in the products array
- category must be one of: Skin, Eyes, Lips, Cheeks, Base
- Recommend globally available cosmetics brands (e.g., MAC, NARS, Charlotte Tilbury, Fenty Beauty, Rare Beauty, Dior, YSL, Clinique, etc.)
- Prices should be approximate retail price in US dollars ($)
- If skin type is unknown, assess from the photo and recommend accordingly`
      : `당신은 전문 메이크업 아티스트이자 화장품 전문가입니다.
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
- 피부타입에서 잘 모름이면 사진을 보고 판단해서 추천하세요`

    const reportPromise = fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content: reportSystemPrompt,
          },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: photo } },
              { type: 'text', text: `${gender}\n${skinType}` },
            ],
          },
        ],
        temperature: 1,
        max_tokens: 2048,
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
        choices?: { message?: { content?: string } }[]
      }
      report = reportJson.choices?.[0]?.message?.content || ''

      // JSON 추출 및 검증
      if (report) {
        try {
          const jsonMatch = report.match(/```(?:json)?\s*([\s\S]*?)```/)
          const jsonStr = jsonMatch ? jsonMatch[1].trim() : report.trim()
          const parsed = JSON.parse(jsonStr)
          if (parsed && Array.isArray(parsed.products) && (parsed.analysis || typeof parsed.summary === 'string')) {
            report = JSON.stringify(parsed)
          }
        } catch {
          // JSON 파싱 실패 시 원본 텍스트 유지 (마크다운 폴백)
        }
      }
    }

    if (!imageData && !report) {
      const errBody = !imageRes.ok ? await imageRes.text() : ''
      const cf = (request as unknown as { cf?: { colo?: string } }).cf
      const colo = cf?.colo || 'unknown'
      return new Response(JSON.stringify({
        error: `API 오류 (${colo}): ${errBody || '이미지와 보고서 모두 생성 실패'}`,
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
