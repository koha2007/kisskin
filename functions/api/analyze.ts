// Makeup Analysis API v8 — Gemini 우선, AI Gateway 폴백 (지역 차단 우회)
// - 이미지: Gemini → AI Gateway gpt-image-1.5 → AI Gateway gpt-4o
// - 리포트: Gemini → AI Gateway gpt-4.1 → 직접 OpenAI (폴백)
// - AI Gateway BYOK: cf-aig-authorization 헤더 사용, 저장된 키 자동 주입
interface Env {
  OPENAI_API_KEY: string
  OPENAI_BASE_URL?: string       // AI Gateway URL (예: https://gateway.ai.cloudflare.com/v1/.../openai)
  CF_AIG_TOKEN?: string           // AI Gateway 인증 토큰
  GEMINI_API_KEY?: string
  GEMINI_IMAGE_MODELS?: string
  GEMINI_REPORT_MODEL?: string
}

interface RequestBody {
  photo: string
  gridPhoto?: string
  gridSize?: string
  gender: string
  skinType: string
  lang?: string
}

// base64 data URL → Blob 변환
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',')
  const mimeMatch = parts[0].match(/:(.*?);/)
  const mime = mimeMatch?.[1] || 'image/jpeg'
  const binary = atob(parts[1])
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

// 지역 차단 체크
function isRegionBlocked(text: string): boolean {
  return text.includes('unsupported_country_region_territory')
}

// 기본 모델 만료일 경고 (환경변수로 모델 지정 시 불필요)
const DEFAULT_MODEL_EXPIRY = new Date('2026-06-17')
function checkModelExpiry(env: Env) {
  // 환경변수로 모델을 직접 관리 중이면 경고 스킵
  if (env.GEMINI_IMAGE_MODELS || env.GEMINI_REPORT_MODEL) return
  const now = new Date()
  const daysLeft = Math.ceil((DEFAULT_MODEL_EXPIRY.getTime() - now.getTime()) / 86400000)
  if (daysLeft <= 14 && daysLeft > 0) {
    console.warn(`⚠️ [kisskin] Default Gemini models expire in ${daysLeft} days. Set GEMINI_IMAGE_MODELS / GEMINI_REPORT_MODEL env vars to override.`)
  } else if (daysLeft <= 0) {
    console.error(`🚨 [kisskin] Default Gemini models EXPIRED! Set GEMINI_IMAGE_MODELS / GEMINI_REPORT_MODEL in Cloudflare env vars. See: https://ai.google.dev/gemini-api/docs/models`)
  }
}

// Gemini API로 리포트 생성 (지역 제한 없음)
async function generateReportWithGemini(
  apiKey: string,
  photoDataUrl: string,
  systemPrompt: string,
  userText: string,
  reportModel?: string,
): Promise<string> {
  const model = reportModel || 'gemini-2.5-flash'
  const base64 = photoDataUrl.split(',')[1]
  const mimeMatch = photoDataUrl.match(/^data:(.+?);/)
  const mimeType = mimeMatch?.[1] || 'image/jpeg'

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: userText },
          ],
        }],
        generationConfig: { temperature: 1.0, maxOutputTokens: 2048 },
      }),
    },
  )
  if (!res.ok) return ''
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  return json.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// Gemini API로 이미지 생성 (지역 제한 없음, 3차 폴백)
async function generateImageWithGemini(
  apiKey: string,
  imageDataUrl: string,
  prompt: string,
  imageModels?: string,
): Promise<string> {
  const base64 = imageDataUrl.split(',')[1]
  const mimeMatch = imageDataUrl.match(/^data:(.+?);/)
  const mimeType = mimeMatch?.[1] || 'image/jpeg'

  const models = imageModels
    ? imageModels.split(',').map(m => m.trim())
    : ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview']

  const errors: string[] = []
  for (const model of models) {
    try {
      console.log(`[kisskin] Trying Gemini image model: ${model}`)
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { inlineData: { mimeType, data: base64 } },
                { text: prompt },
              ],
            }],
            generationConfig: {
              responseModalities: ['IMAGE', 'TEXT'],
            },
          }),
        },
      )
      if (!res.ok) {
        const errText = await res.text()
        console.error(`[kisskin] Gemini ${model} failed (${res.status}): ${errText.slice(0, 300)}`)
        errors.push(`${model}:${res.status}:${errText.slice(0, 100)}`)
        continue
      }
      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[]
      }
      const imgPart = json.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data)
      if (imgPart?.inlineData?.data) {
        const mime = imgPart.inlineData.mimeType || 'image/png'
        console.log(`[kisskin] Gemini ${model} success`)
        return `data:${mime};base64,${imgPart.inlineData.data}`
      }
      console.warn(`[kisskin] Gemini ${model} returned OK but no image data`)
      errors.push(`${model}:ok-but-no-image`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`[kisskin] Gemini ${model} exception: ${msg}`)
      errors.push(`${model}:exception:${msg}`)
    }
  }
  // 빈 문자열 대신 에러 정보를 포함하여 디버깅 가능하게
  return errors.length > 0 ? `__GEMINI_ERROR__:${errors.join('|')}` : ''
}

// JSON 추출 및 검증 (Gemini/OpenAI 응답 모두 호환)
function extractReportJson(raw: string): string {
  if (!raw) return ''

  // 여러 패턴으로 JSON 추출 시도
  const candidates: string[] = []

  // 1. ```json ... ``` 코드펜스
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) candidates.push(fenceMatch[1].trim())

  // 2. { ... } 중괄호 블록 직접 추출
  const braceMatch = raw.match(/\{[\s\S]*\}/)
  if (braceMatch) candidates.push(braceMatch[0].trim())

  // 3. 원본 그대로
  candidates.push(raw.trim())

  for (const jsonStr of candidates) {
    try {
      const parsed = JSON.parse(jsonStr)
      if (parsed && Array.isArray(parsed.products)) {
        // analysis 객체가 있으면 toneDetail 등 확인
        if (parsed.analysis || typeof parsed.summary === 'string') {
          return JSON.stringify(parsed)
        }
      }
    } catch { /* 다음 후보 시도 */ }
  }

  console.warn('[kisskin] Failed to extract JSON from report, returning raw')
  return raw
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  checkModelExpiry(env)

  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { photo, gridPhoto, gridSize, gender, skinType, lang } = (await request.json()) as RequestBody

    if (!photo || !gender || !skinType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    const imageSource = gridPhoto || photo
    const imageSize = gridSize || '1024x1024'
    const skinTypeInstruction = skinType === '잘 모름' ? '피부타입은 사진을 보고 판단해서' : skinType + ' 피부타입을'
    const directUrl = 'https://api.openai.com'
    const gatewayUrl = env.OPENAI_BASE_URL?.replace(/\/$/, '')
    const authHeader = `Bearer ${env.OPENAI_API_KEY}`

    const femalePrompt = `너는 최고의 메이크업 아티스트야. 이 사진은 동일한 얼굴이 3×3 그리드로 배치된 것이야. 이 사람은 ${gender}이고 ${skinTypeInstruction} 반영해서 총 9가지 메이크업을 표현해줘.

[가장 중요한 규칙 - 반드시 지켜]
- 이미지에 글자, 텍스트, 라벨, 숫자, 영어, 한글, 워터마크, 캡션을 절대 절대 절대 넣지 마. 오직 얼굴과 메이크업만 보여줘. 텍스트가 포함되면 실패야.

[절대 규칙 - 얼굴 보존이 최우선]
- 이것은 가장 중요한 규칙이야: 사용자의 얼굴을 절대 절대 절대 변경하지 마! 얼굴 형태, 이목구비(눈, 코, 입, 귀), 피부색, 얼굴 윤곽, 눈코입 위치와 크기, 얼굴 비율, 턱선, 광대뼈, 이마 형태를 원본과 100% 동일하게 유지해야 해
- 다른 사람의 얼굴로 바뀌거나 얼굴 특징이 조금이라도 달라지면 완전한 실패야. 원본 사진의 사람과 동일 인물이어야 해
- 변경하는 것은 오직 메이크업(아이섀도, 립스틱, 블러셔, 아이라인, 하이라이터 등)뿐이야. 피부 위에 올리는 화장품만 바꿔
- 9칸 모두 얼굴 위치, 크기, 각도, 표정이 완전히 동일해야 해
- 이빨이 보이면 깨끗하고 하얗고 고르게 보정해줘
- 배경, 조명, 옷은 절대 변경하지 마
- 머리카락 색상은 2번(클라우드 스킨)에서만 변경해. 나머지 1,3,4,5,6,7,8,9번은 머리카락 색상을 절대 절대 바꾸지 마. 원본 머리카락 색 그대로 유지해야 해
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

핵심: 사용자의 얼굴은 절대 변경하지 마! 원본과 동일한 사람이어야 해! 메이크업만 다르게! 9가지 메이크업이 각각 확실히 다르게 보여야 해. 머리카락 색 변경은 오직 2번에서만! 1,3,4,5,6,7,8,9번 머리카락은 원본과 동일하게. 이미지 위에 어떤 글자도 렌더링하지 마.`

    const malePrompt = `너는 최고의 메이크업 아티스트야. 이 사진은 동일한 얼굴이 3×3 그리드로 배치된 것이야. 이 사람은 ${gender}이고 ${skinTypeInstruction} 반영해서 2026년 남성 트렌드 메이크업 9가지를 표현해줘.

[가장 중요한 규칙 - 반드시 지켜]
- 이미지에 글자, 텍스트, 라벨, 숫자, 영어, 한글, 워터마크, 캡션을 절대 절대 절대 넣지 마. 오직 얼굴과 메이크업만 보여줘. 텍스트가 포함되면 실패야.

[절대 규칙 - 얼굴·피부색·액세서리 보존이 최우선]
- 이것은 가장 중요한 규칙이야: 사용자의 얼굴을 절대 절대 절대 변경하지 마! 얼굴 형태, 이목구비(눈, 코, 입, 귀), 피부색, 피부 밝기, 인종, 얼굴 윤곽, 눈코입 위치와 크기, 얼굴 비율, 턱선, 광대뼈, 이마 형태를 원본과 100% 동일하게 유지해야 해
- 다른 사람의 얼굴로 바뀌거나 얼굴 특징이 조금이라도 달라지면 완전한 실패야. 원본 사진의 사람과 동일 인물이어야 해
- 피부색이 어두워지거나 밝아지거나 다른 인종처럼 보이면 완전한 실패야. 9칸 모두 원본과 동일한 피부색이어야 해
- 모자, 안경, 귀걸이 등 액세서리의 색상과 형태를 절대 변경하지 마. 원본 그대로 유지해
- 변경하는 것은 오직 메이크업(아이섀도, 립스틱, 블러셔, 아이라인, 하이라이터, 컨투어링 등)뿐이야. 피부 위에 올리는 화장품만 바꿔
- 모든 스타일에서 피부를 깨끗하고 맑게 보정하되, 원본 피부색 톤은 반드시 유지해
- 9칸 모두 얼굴 위치, 크기, 각도, 표정이 완전히 동일해야 해
- 이빨이 보이면 깨끗하고 하얗고 고르게 보정해줘
- 배경, 조명, 옷은 절대 변경하지 마
- 머리카락 색상은 9번(K-팝 아이돌)에서만 변경해. 나머지 1,2,3,4,5,6,7,8번은 머리카락 색상을 절대 절대 바꾸지 마
- 각 메이크업 스타일의 컬러, 질감, 강도가 한눈에 확실히 구분되어야 해. 비슷해 보이면 실패야!
- 얼굴이 칸 안에 다 들어가게 생성하고 위, 아래, 좌, 우 여백 균등하게 생성해줘
- 그리드 칸 사이에 여백/테두리/구분선 없이 빈틈없이 딱 붙여

[메이크업 표현 스타일 - 중요]
- 남성 메이크업은 화사하고 세련되게 표현해. 무겁거나 두껍게 보이면 안 돼
- 아이라인을 굵고 진하게 그리지 마! 얇고 자연스러운 라인으로 표현해. 진한 검은 아이라인은 절대 안 돼
- 아이섀도는 블렌딩을 부드럽게, 경계가 자연스럽게 녹아들게 표현해
- 전체적으로 깨끗하고 화사한 피부 베이스 위에 포인트 메이크업을 더하는 방식으로
- 2026년 남성 뷰티 트렌드: 자연스럽지만 확실히 다른, 세련된 느낌

[9가지 남성 메이크업 - 좌→우, 위→아래 순서]
1: 내추럴 소프트포커스 - 피부 결점을 자연스럽게 보정한 깨끗한 민낯 느낌. 매트하면서 화사한 피부, 눈썹 깔끔히 정리, 입술에 투명한 보습감. 컬러 메이크업 없이 피부 자체가 빛나게
2: 스킨케어 글로우 베이스 - 유리알처럼 반짝이는 촉촉한 윤광 피부. 하이라이터로 광대뼈·코끝·이마에 자연스러운 물광. 투명하고 건강한 글로우, 입술도 촉촉하게
3: 디퓨즈드 립 - 입술 안쪽부터 자연스러운 로즈/코랄 컬러가 바깥으로 부드럽게 번지는 그라데이션 립. 입술 색이 화사하게 눈에 띄어야 해. 피부는 깨끗하고 맑게
4: 소프트 스모키 아이 - 눈두덩이에 브라운+토프 계열을 부드럽게 블렌딩. 언더라인에 살짝 그림자. 세련되고 깊이감 있는 눈매. 아이라인은 얇게만. 입술은 자연스러운 베리톤
5: 톤인톤 모노크롬 - 따뜻한 테라코타/피치 하나의 색으로 아이섀도·블러셔·립을 부드럽게 통일. 컬러가 자연스럽지만 확실히 보이게. 화사하고 조화로운 느낌
6: 컨투어 & 스컬프팅 - 자연스러운 음영으로 얼굴 윤곽을 살린 세련된 컨투어링. 턱선·코·광대뼈에 부드러운 쉐딩, 하이라이터로 입체감. 눈썹 선명하게 정리. 깔끔하고 조각 같은 느낌
7: 컬러 포인트 아이 - 눈두덩이에 부드러운 블루/네이비 아이섀도를 자연스럽게 블렌딩. 내추럴한 쉬머 포인트. 아이라인 없이 컬러만으로 표현. 피부색 원본 유지
8: 뱀파이어 로맨틱 - 눈두덩이에 버건디+로즈를 부드럽게 그라데이션. 입술은 와인/다크로즈 컬러로 세련되게. 신비로우면서 고급스러운 분위기. 피부색 원본 유지
9: K-팝 아이돌 - 완벽한 글로우 베이스, 눈두덩이에 핑크+피치 쉬머를 화사하게, 선명한 애교살 하이라이트, 코랄핑크 그라데이션 립, 눈썹 정교하게 정리. 머리카락을 트렌디한 색(애쉬 블론드/실버그레이/밀크브라운 중 택1)으로 변경. 옷은 원본 그대로 유지

핵심: 사용자의 얼굴은 절대 변경하지 마! 원본과 동일한 사람이어야 해! 메이크업만 다르게! 아이라인을 굵고 진하게 그리지 마 - 얇고 자연스럽게! 모든 메이크업은 화사하고 세련되게 표현해! 9칸 모두 원본과 동일한 얼굴·피부색·모자·옷·액세서리를 유지해야 해! 머리카락 색 변경은 오직 9번에서만! 이미지 위에 어떤 글자도 렌더링하지 마.`

    const imagePrompt = gender === '남성' ? malePrompt : femalePrompt

    // ── 리포트 시스템 프롬프트 ──
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

    const reportUserText = `${gender}\n${skinType}`

    // ══════════════════════════════════════════════════════════
    // 이미지 생성 함수: Gemini 우선 → OpenAI 폴백 (비용 절감)
    // ══════════════════════════════════════════════════════════
    async function generateImage(): Promise<{ data: string; error: string }> {
      const errors: string[] = []

      // 1차: Gemini 이미지 생성 (저렴, 지역 제한 없음)
      const geminiKey = env.GEMINI_API_KEY
      if (geminiKey) {
        try {
          console.log('[kisskin] Trying Gemini image generation (1st)')
          const geminiResult = await generateImageWithGemini(geminiKey, imageSource, imagePrompt, env.GEMINI_IMAGE_MODELS)
          if (geminiResult && !geminiResult.startsWith('__GEMINI_ERROR__')) {
            return { data: geminiResult, error: '' }
          }
          const detail = geminiResult?.replace('__GEMINI_ERROR__:', '') || 'no data'
          errors.push(`[1.Gemini] ${detail.slice(0, 150)}`)
          console.warn(`[kisskin] Gemini failed: ${detail.slice(0, 100)}`)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          errors.push(`[1.Gemini] exception: ${msg.slice(0, 100)}`)
        }
      } else {
        errors.push('[1.Gemini] NO_KEY')
      }

      // 2차: AI Gateway - gpt-image-1.5 (BYOK, 지역 차단 우회)
      if (gatewayUrl) {
        try {
          console.log('[kisskin] Trying Gateway gpt-image-1.5 (2nd)')
          const form = new FormData()
          form.append('image', dataUrlToBlob(imageSource), 'photo.jpg')
          form.append('prompt', imagePrompt)
          form.append('model', 'gpt-image-1.5')
          form.append('n', '1')
          form.append('size', imageSize)
          form.append('quality', 'auto')
          form.append('input_fidelity', 'high')
          form.append('moderation', 'auto')

          const gwHeaders: Record<string, string> = {}
          if (env.CF_AIG_TOKEN) {
            gwHeaders['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}`
          } else {
            gwHeaders['Authorization'] = authHeader
          }

          const res = await fetch(`${gatewayUrl}/v1/images/edits`, {
            method: 'POST',
            headers: gwHeaders,
            body: form,
          })

          if (res.ok) {
            const json = (await res.json()) as { data?: { b64_json?: string }[] }
            const b64 = json.data?.[0]?.b64_json
            if (b64) return { data: `data:image/png;base64,${b64}`, error: '' }
          }

          const txt = await res.text()
          errors.push(`[2.Gateway-img] ${res.status}: ${txt.slice(0, 100)}`)
        } catch (e) {
          errors.push(`[2.Gateway-img] ${e instanceof Error ? e.message : String(e)}`)
        }

        // 3차: AI Gateway - gpt-4o responses API (최후 폴백)
        try {
          console.log('[kisskin] Trying Gateway gpt-4o responses (3rd)')
          const gwHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
          if (env.CF_AIG_TOKEN) {
            gwHeaders['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}`
          } else {
            gwHeaders['Authorization'] = authHeader
          }

          const body = JSON.stringify({
            model: 'gpt-4o',
            input: [{
              role: 'user',
              content: [
                { type: 'input_image', image_url: imageSource },
                { type: 'input_text', text: imagePrompt },
              ],
            }],
            tools: [{
              type: 'image_generation',
              quality: 'high',
              size: imageSize,
              background: 'auto',
            }],
          })

          const res = await fetch(`${gatewayUrl}/v1/responses`, {
            method: 'POST',
            headers: gwHeaders,
            body,
          })

          if (res.ok) {
            const json = (await res.json()) as {
              output?: { type: string; result?: string }[]
            }
            const imgOutput = json.output?.find((o) => o.type === 'image_generation_call')
            if (imgOutput?.result) {
              return { data: `data:image/png;base64,${imgOutput.result}`, error: '' }
            }
          }
          const txt = await res.text()
          errors.push(`[3.Gateway-4o] ${res.status}: ${txt.slice(0, 100)}`)
        } catch (e) {
          errors.push(`[3.Gateway-4o] ${e instanceof Error ? e.message : String(e)}`)
        }
      } else {
        // Gateway 없으면 직접 OpenAI 시도 (지역 차단될 수 있음)
        try {
          console.log('[kisskin] Trying OpenAI direct (2nd, no gateway)')
          const form = new FormData()
          form.append('image', dataUrlToBlob(imageSource), 'photo.jpg')
          form.append('prompt', imagePrompt)
          form.append('model', 'gpt-image-1.5')
          form.append('n', '1')
          form.append('size', imageSize)
          form.append('quality', 'auto')
          form.append('input_fidelity', 'high')
          form.append('moderation', 'auto')

          const res = await fetch(`${directUrl}/v1/images/edits`, {
            method: 'POST',
            headers: { 'Authorization': authHeader },
            body: form,
          })

          if (res.ok) {
            const json = (await res.json()) as { data?: { b64_json?: string }[] }
            const b64 = json.data?.[0]?.b64_json
            if (b64) return { data: `data:image/png;base64,${b64}`, error: '' }
          }
          const txt = await res.text()
          errors.push(`[2.OpenAI] ${res.status}: ${txt.slice(0, 100)}`)
        } catch (e) {
          errors.push(`[2.OpenAI] ${e instanceof Error ? e.message : String(e)}`)
        }
      }

      return { data: '', error: errors.join(' | ') || 'All methods failed' }
    }

    // ══════════════════════════════════════════════════════════
    // 리포트 생성 함수: Gemini 우선 → OpenAI 폴백 (비용 절감)
    // ══════════════════════════════════════════════════════════
    async function generateReport(): Promise<string> {
      // 1차: Gemini (저렴, 지역 제한 없음)
      if (env.GEMINI_API_KEY) {
        try {
          console.log('[kisskin] Trying Gemini report (1st)')
          const result = await generateReportWithGemini(env.GEMINI_API_KEY, photo, reportSystemPrompt, reportUserText, env.GEMINI_REPORT_MODEL)
          if (result) return result
          console.warn('[kisskin] Gemini report empty, falling back to OpenAI')
        } catch (e) {
          console.warn(`[kisskin] Gemini report failed: ${e instanceof Error ? e.message : String(e)}`)
        }
      }

      // 2차: AI Gateway (BYOK, 지역 차단 우회)
      const reportBody = JSON.stringify({
        model: 'gpt-4.1',
        messages: [
          { role: 'system', content: reportSystemPrompt },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: photo } },
              { type: 'text', text: reportUserText },
            ],
          },
        ],
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
      })

      if (gatewayUrl) {
        try {
          console.log('[kisskin] Trying Gateway report (2nd)')
          const gwHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
          if (env.CF_AIG_TOKEN) {
            gwHeaders['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}`
          } else {
            gwHeaders['Authorization'] = authHeader
          }
          const res = await fetch(`${gatewayUrl}/v1/chat/completions`, {
            method: 'POST', headers: gwHeaders, body: reportBody,
          })
          if (res.ok) {
            const json = (await res.json()) as {
              choices?: { message?: { content?: string } }[]
            }
            const content = json.choices?.[0]?.message?.content || ''
            if (content) return content
          }
        } catch { /* 폴백 */ }
      }

      // 3차: 직접 OpenAI (최후 폴백, 지역 차단될 수 있음)
      try {
        console.log('[kisskin] Trying OpenAI direct report (3rd)')
        const res = await fetch(`${directUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
          body: reportBody,
        })
        if (res.ok) {
          const json = (await res.json()) as {
            choices?: { message?: { content?: string } }[]
          }
          const content = json.choices?.[0]?.message?.content || ''
          if (content) return content
        }
      } catch { /* 폴백 */ }

      return ''
    }

    // ══════════════════════════════════════════════════════════
    // 병렬 실행
    // ══════════════════════════════════════════════════════════
    const [imageResult, reportRaw] = await Promise.all([
      generateImage(),
      generateReport(),
    ])

    const imageData = imageResult.data
    const imageError = imageResult.error
    const report = extractReportJson(reportRaw)

    // ══════════════════════════════════════════════════════════
    // 결과 반환
    // ══════════════════════════════════════════════════════════
    if (!imageData && !report) {
      const cf = (request as unknown as { cf?: { colo?: string } }).cf
      const colo = cf?.colo || 'unknown'

      const envDebug = `[GEMINI_KEY:${env.GEMINI_API_KEY ? 'set(' + env.GEMINI_API_KEY.slice(-4) + ')' : 'MISSING'}|BASE_URL:${env.OPENAI_BASE_URL ? 'set' : 'MISSING'}|AIG_TOKEN:${env.CF_AIG_TOKEN ? 'set' : 'MISSING'}|IMG_MODELS:${env.GEMINI_IMAGE_MODELS || 'default'}]`
      return new Response(JSON.stringify({
        error: `API 오류 (${colo}): ${imageError.slice(0, 300) || '이미지와 보고서 모두 생성 실패'} ${envDebug}`,
      }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ image: imageData, report }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({
      error: `서버 오류: ${e instanceof Error ? e.message : String(e)}`,
    }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
