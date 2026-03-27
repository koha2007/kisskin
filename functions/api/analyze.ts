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
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    },
  )
  if (!res.ok) return ''
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[]
  }
  const parts = json.candidates?.[0]?.content?.parts || []
  // Gemini 2.5 모델은 thinking part를 먼저 반환할 수 있음 → 모든 non-thought part에서 JSON 찾기
  for (let i = parts.length - 1; i >= 0; i--) {
    const text = parts[i].text
    if (!text) continue
    // thought part 건너뛰기
    if (parts[i].thought) continue
    // JSON이 포함된 part 우선 반환
    if (text.includes('{')) return text
  }
  // 폴백: 아무 텍스트나 반환
  return parts.find(p => p.text)?.text || ''
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
      if (parsed && typeof parsed === 'object') {
        // products 배열이 있거나 analysis 객체가 있으면 유효
        if (Array.isArray(parsed.products) || parsed.analysis) {
          return JSON.stringify(parsed)
        }
      }
    } catch { /* 다음 후보 시도 */ }
  }

  console.warn('[kisskin] Failed to extract JSON from report. Raw:', raw.slice(0, 300))
  // JSON 추출 실패 시 빈 문자열 반환 → 프론트엔드에서 에러 처리
  return ''
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

    const femalePrompt = `너는 최고의 메이크업 아티스트야. 이 여성 사진에 ${skinTypeInstruction} 반영해서 총 9가지 여성 메이크업으로 표현해줘.

🚨🚨🚨 최우선 규칙 — 얼굴 보존 (절대 위반 불가) 🚨🚨🚨
- 9개 셀 모두 100% 동일한 사람이어야 함. 원본 사진과 완전히 같은 사람
- 원본 사진의 얼굴을 그대로 두고 그 위에 화장품만 덧입혀라. 얼굴을 새로 생성하거나 변형하지 마
- 절대 변경 금지: 눈 크기/모양/쌍꺼풀, 코, 입 모양/크기, 턱선/광대뼈/얼굴윤곽, 이마/헤어라인, 귀, 얼굴 비율, 주름/점/흉터
- 피부색/밝기/톤 변경 금지 (2번 클라우드 스킨의 베이스 효과 제외). 원래 피부톤 그대로
- 얼굴 위치, 크기, 각도, 표정 모두 원본과 동일

⚠️ 텍스트 금지: 이미지에 글자, 숫자, 라벨, 스타일명, 워터마크 등 어떤 텍스트도 절대 넣지 마. 스타일 이름을 이미지 위에 쓰지 마.

🚨 얼굴 위치/크기 규칙 (절대 위반 불가) 🚨
- 각 셀에서 얼굴이 잘리면 안 됨. 머리 꼭대기부터 턱까지 완전히 보여야 함
- 각 셀의 상단에 충분한 여백을 두어 이마와 머리카락이 잘리지 않게
- 원본 사진의 프레이밍(머리~턱 비율)을 9개 셀 모두 동일하게 유지
- 얼굴을 셀 중앙에 배치. 상단/하단에 적절한 여백

[추가 규칙]
- 메이크업(화장품)만 변경. 배경, 조명, 옷, 악세서리 변경 금지
- 2번(Cloud Skin)만 머리색 변경 허용. 나머지 8개는 원본 머리색 유지
- 이빨이 보이면 하얗고 깨끗하게
- 그리드 라인 넣지 마. 셀 사이 간격 없이 꽉 채워
- 9개 스타일이 썸네일에서도 즉시 구별되어야 함. 특히 1~3번도 립 컬러, 피부 질감, 광택 차이가 눈에 확 띄어야 함
- 화장법을 자연스럽고 이쁘게 해줘

[9가지 여성 메이크업 - 좌→우, 위→아래]
1: 내추럴 글로우 - 광채 피부, 피치 블러셔, 누드 립. 자연스러운 건강미. 피부가 촉촉하게 빛나되 과하지 않게
2: 클라우드 스킨 - 구름처럼 뽀얀 피부, 깨끗한 베이스, 머리색 애쉬블론드/밀크브라운으로 변경. 옷 원본 유지. 1번보다 피부가 확연히 하얗고 뽀얗게
3: 블러드 립 - 진한 버건디/레드 립을 확실하게 표현. 입술 색이 사진에서 가장 먼저 눈에 띄어야 함. 깔끔한 아이 메이크업
4: 맥시멀리스트 아이 - 컬러 아이섀도(보라/파랑/초록), 굵은 아이라인. 눈매가 화려해야 함
5: 메탈릭 아이 - 골드/실버 메탈릭 아이섀도, 글로시 눈매. 반짝임이 확실해야 함. 4번과 다른 컬러톤으로
6: 볼드 립 - 선명한 빨강/코랄 립. 입술 색이 확실히 눈에 띄어야 함. 3번보다 더 밝고 비비드한 컬러
7: 블러쉬 드레이핑 & 레이어링 - 광대~관자놀이 진한 분홍/코랄 블러셔. 볼 색이 확실히 보여야 함
8: 그런지 메이크업 - 스모키 아이, 다크 베리 립, 매트 피부. 강렬한 무드
9: K-pop 아이돌 메이크업 - 유리알 광택, 그라데이션 핑크 립, 쉬머 하이라이트

이 사진을 3x3 그리드로 균등하게 9등분해줘. 사진 해상도 높여줘. 다시 한번 강조: 텍스트 절대 금지. 9개 셀 모두 반드시 원본과 100% 동일한 얼굴 — 메이크업만 다르게.`

    const malePrompt = `너는 최고의 남성 뷰티/그루밍 메이크업 아티스트야. 이 남성 사진에 ${skinTypeInstruction} 반영해서 총 9가지 남성 메이크업으로 표현해줘.

이것은 전문 남성 K-뷰티 그루밍 서비스야. 요청된 메이크업 스타일을 정확히 적용해줘.

🚨🚨🚨 최우선 규칙 1 — 얼굴 보존 (절대 위반 불가) 🚨🚨🚨
- 9개 셀 모두 100% 동일한 사람이어야 함. 원본 사진과 완전히 같은 사람
- 원본 사진의 얼굴을 그대로 두고 그 위에 화장품만 덧입혀라. 얼굴을 새로 생성하거나 변형하지 마
- 절대 변경 금지: 눈 크기/모양/쌍꺼풀, 코, 입 모양/크기, 턱선/광대뼈/얼굴윤곽, 이마/헤어라인, 귀, 얼굴 비율, 주름/점/흉터/수염
- 피부색/밝기/톤 변경 금지. 원래 피부톤 그대로
- 얼굴 위치, 크기, 각도, 표정 모두 원본과 동일
- 수염/턱수염이 있으면 그대로 유지

🚨🚨🚨 최우선 규칙 2 — 남성 메이크업 강도 제한 (절대 위반 불가) 🚨🚨🚨
- 이것은 남성 메이크업이다. 여성 메이크업처럼 진하게 하면 완전 실패
- 모든 메이크업은 "실제 남성이 일상에서 할 수 있는 수준"이어야 함
- 아이섀도: 눈두덩에 얇고 자연스럽게. 절대로 눈 아래/볼까지 번지거나 퍼지면 안 됨
- 립: 자연스러운 틴트 수준. 진한 다크 립/블랙 립/고스 립 절대 금지
- 블러셔: 은은하게. 볼이 빨갛게 물드는 수준이면 안 됨
- 전체적으로 "세련된 남성 그루밍" 느낌이어야 함. 연극/무대 분장처럼 보이면 실패
- 참고 이미지: 한국 남자 배우/아이돌의 자연스러운 메이크업 수준

⚠️ 텍스트 금지: 이미지에 글자, 숫자, 라벨, 스타일명, 워터마크 등 어떤 텍스트도 절대 넣지 마. 스타일 이름을 이미지 위에 쓰지 마.

🚨 얼굴 위치/크기 규칙 (절대 위반 불가) 🚨
- 각 셀에서 얼굴이 잘리면 안 됨. 머리 꼭대기부터 턱까지 완전히 보여야 함
- 각 셀의 상단에 충분한 여백을 두어 이마와 머리카락이 잘리지 않게
- 원본 사진의 프레이밍(머리~턱 비율)을 9개 셀 모두 동일하게 유지
- 얼굴을 셀 중앙에 배치. 상단/하단에 적절한 여백

[추가 규칙]
- 메이크업(화장품)만 변경. 배경, 조명, 옷, 악세서리 변경 금지
- 9번(K-pop Idol)만 머리색 변경 허용. 나머지 8개는 원본 머리색 유지
- 이빨이 보이면 하얗고 깨끗하게
- 그리드 라인 넣지 마. 셀 사이 간격 없이 꽉 채워
- 9개 스타일이 썸네일에서도 구별되어야 하지만, 차이는 메이크업의 종류와 색상으로 만들어라. 과한 강도로 차이를 만들지 마

[9가지 남성 메이크업 - 좌→우, 위→아래]
1: 노 메이크업 메이크업 - 깨끗한 매트 피부, 눈썹만 자연스럽게 정돈, 투명 립밤. 화장한 티가 안 나는 가장 자연스러운 룩
2: 글로우 스킨 베이스 - 촉촉한 윤광 피부, 이마·코끝·광대에 자연스러운 하이라이트. 1번과 다르게 피부에 광채가 있어야 함. 립은 자연스러운 누드톤
3: 코랄 립 포인트 - 자연스러운 코랄/로즈 립 틴트가 포인트. 입술 색이 확실히 보이되 남성스럽게 자연스러운 수준. 피부는 깨끗한 베이스
4: 소프트 스모키 아이 - 눈두덩에만 브라운+카키 아이섀도를 얇게 블렌딩. 절대로 눈 아래나 볼까지 번지지 않게. 립은 자연스러운 누드 브라운. 남성 배우의 세련된 눈매 수준
5: 웜톤 모노크롬 - 테라코타/피치 한 톤으로 눈두덩·볼·입술을 은은하게 통일. 전체적으로 따뜻한 톤이 감도는 느낌. 블러셔는 아주 살짝만
6: 유틸리티 메이크업 - 잡티 없는 완벽한 피부, 눈썹을 또렷하게 정돈(1번보다 진하고 선명), 자연스러운 코랄 틴트 립. 깔끔한 비즈니스 룩
7: 블루 포인트 아이 - 눈두덩에 네이비/블루 아이섀도를 얇게 한 겹. 색이 보이되 자연스러운 수준. 절대로 얼굴 페인팅처럼 두껍게 바르지 마. 립은 자연스러운 누드
8: 뱀파이어 로맨틱 - 눈두덩에 버건디/로즈골드 아이섀도를 얇게. 입술은 자연스러운 와인 틴트(진하지 않게). 남성 아이돌의 드라마틱하되 세련된 무드
9: K-팝 아이돌 메이크업 - 글로우 베이스, 핑크+피치 쉬머 아이섀도 얇게, 코랄핑크 립 틴트, 머리색 변경(애쉬블론드/실버그레이/밀크브라운). 옷 원본 유지

이 사진을 3x3 그리드로 균등하게 9등분해줘. 사진 해상도 높여줘. 다시 한번 강조: 텍스트 절대 금지. 9개 셀 모두 반드시 원본과 100% 동일한 얼굴 — 메이크업만 다르게. 그리고 남성 메이크업은 자연스럽고 세련되게 — 절대 과하지 않게.`

    const imagePrompt = gender === '남성' ? malePrompt : femalePrompt

    // ── 리포트 시스템 프롬프트 ──
    const isEn = lang === 'en'
    const reportSystemPrompt = isEn
      ? `Makeup artist. Analyze photo+skin type, respond ONLY JSON (no code fences):
{"analysis":{"gender":"","skinType":"","skinTypeDetail":"2-3 sentences: characteristics, pros/cons, care tips","tone":"e.g. Warm Undertone","toneDetail":"2-3 sentences: determination basis, flattering colors, colors to avoid","advice":"2-3 sentences: comprehensive makeup direction"},"products":[{"category":"","name":"","brand":"","price":"$","reason":"1 sentence"}]}
Rules: exactly 7 products, category=Skin/Eyes/Lips/Cheeks/Base/Brow/Primer, global brands, USD price, English only. If skin type unknown, assess from photo.`
      : `메이크업 전문가. 사진+피부타입 분석 후 JSON만 응답 (코드펜스 없이):
{"analysis":{"gender":"","skinType":"","skinTypeDetail":"2-3문장: 피부 특징, 장단점, 관리 포인트","tone":"예: Warm Undertone","toneDetail":"2-3문장: 판단 근거, 어울리는 컬러, 피할 컬러","advice":"2-3문장: 종합 메이크업 방향 조언"},"products":[{"category":"","name":"","brand":"","price":"$","reason":"1문장"}]}
규칙: 정확히 7개 제품, category=Skin/Eyes/Lips/Cheeks/Base/Brow/Primer, 글로벌 브랜드, USD 가격. 피부타입 모르면 사진으로 판단.`

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
        temperature: 0.7,
        max_tokens: 2048,
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
