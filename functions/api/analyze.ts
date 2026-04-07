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

// 지연 함수
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Exponential backoff retry가 포함된 fetch 래퍼
// 429(Rate Limit), 503(Service Unavailable) 에러 시 자동 재시도
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<Response> {
  let lastResponse: Response | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options)
    if (res.status !== 429 && res.status !== 503) return res
    lastResponse = res
    if (attempt < maxRetries) {
      // Retry-After 헤더가 있으면 사용, 없으면 exponential backoff
      const retryAfter = res.headers.get('Retry-After')
      const delay = retryAfter
        ? Math.min(parseInt(retryAfter, 10) * 1000 || baseDelay, 30000)
        : baseDelay * Math.pow(2, attempt) + Math.random() * 500
      console.warn(`[kisskin] ${res.status} retry ${attempt + 1}/${maxRetries}, waiting ${Math.round(delay)}ms`)
      await sleep(delay)
    }
  }
  return lastResponse!
}

// 지역 차단 체크
function isRegionBlocked(text: string): boolean {
  return text.includes('unsupported_country_region_territory')
}

// 기본 모델 만료일 경고 (환경변수로 모델 지정 시 불필요)
const DEFAULT_MODEL_EXPIRY = new Date('2026-09-30')
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

  const res = await fetchWithRetry(
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
        generationConfig: { temperature: 0.7, maxOutputTokens: 3000 },
      }),
    },
  )
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error(`[kisskin] Gemini report ${model} failed (${res.status}): ${errText.slice(0, 200)}`)
    return ''
  }
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
      const res = await fetchWithRetry(
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
        2,   // 이미지 생성은 maxRetries=2 (시간 절약)
        2000, // 이미지 모델은 기본 대기 2초
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

    // base64 이미지 크기 검증 (20MB 초과 시 거부 → Gemini 400 에러 방지)
    const photoBase64 = photo.split(',')[1] || ''
    const estimatedBytes = photoBase64.length * 0.75
    if (estimatedBytes > 20 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: '이미지가 너무 큽니다 (20MB 이하로 줄여주세요)' }), {
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

    const malePrompt = `너는 최고의 메이크업 아티스트야. 이 남성 사진에 ${skinTypeInstruction} 반영해서 총 9가지 남성 메이크업으로 표현해줘.

🚨🚨🚨 최우선 규칙 — 얼굴 보존 (절대 위반 불가) 🚨🚨🚨
- 9개 셀 모두 100% 동일한 사람이어야 함. 원본 사진과 완전히 같은 사람
- 원본 사진의 얼굴을 그대로 두고 그 위에 화장품만 덧입혀라. 얼굴을 새로 생성하거나 변형하지 마
- 절대 변경 금지: 눈 크기/모양/쌍꺼풀, 코, 입 모양/크기, 턱선/광대뼈/얼굴윤곽, 이마/헤어라인, 귀, 얼굴 비율, 주름/점/흉터/수염
- 피부색/밝기/톤 변경 금지 (2번 스킨케어 베이스의 윤광 효과 제외). 원래 피부톤 그대로
- 얼굴 위치, 크기, 각도, 표정 모두 원본과 동일
- 수염/턱수염이 있으면 그대로 유지

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
- 9개 스타일이 썸네일에서도 즉시 구별되어야 함. 각 스타일 간 차이가 확실하고 눈에 띄게
- 화장법을 자연스럽고 이쁘게 해줘

[9가지 남성 메이크업 - 좌→우, 위→아래]
1: 내추럴 소프트포커스 스킨 (No-Makeup Makeup) - 피부결을 매끄럽고 깨끗하게 보정. 눈썹 자연스럽게 정돈. 투명 립밤만. 모공·잡티가 소프트하게 보정된 "원래 피부 좋은 사람" 느낌
2: 스킨케어 하이브리드 베이스 - 촉촉한 윤광 피부. 이마·코끝·광대에 건강한 수분 광택. 1번과 확실히 다르게 피부가 촉촉하게 빛나야 함. 립은 무색 립밤
3: 디퓨즈드 립 (Blurred Lip) - 입술에 자연스러운 코랄/로즈 틴트를 확실하게 표현. 입술 안쪽이 진하고 바깥으로 갈수록 흐려지는 그라데이션. 입술 색이 사진에서 확실히 눈에 띄어야 함. 피부는 깨끗한 세미매트
4: 그런지 / 스모키 아이 - 눈두덩에 브라운+다크카키를 블렌딩해서 눈매에 깊이감. 눈 아래 언더라인도 살짝 스모키하게. 립은 자연스러운 누드톤. 강렬한 눈매가 포인트
5: 톤인톤 모노크롬 메이크업 - 테라코타/피치 한 가지 톤으로 눈두덩·볼·입술을 통일감 있게. 각 부위에 같은 컬러가 확실히 보여야 함. 따뜻한 톤이 얼굴 전체에 감도는 무드
6: 유틸리티 메이크업 (기능성 남성 전용) - 잡티·다크서클 완벽 커버. 눈썹을 또렷하고 선명하게 정돈. 입술은 건강한 코랄 틴트. 면접/비즈니스에 적합한 깔끔하고 신뢰감 있는 룩
7: 블루 & 컬러 포인트 아이 - 눈두덩에 네이비/블루 컬러를 확실하게 포인트로. 파란색이 눈에 띄어야 함. 다른 스타일과 확연히 다른 컬러감. 립은 자연스러운 누드
8: 뱀파이어 로맨틱 - 눈두덩에 버건디/와인 컬러. 입술은 진한 로제/다크레드 틴트. 전체적으로 어둡고 붉은 무드. 창백한 피부 위에 붉은 색감이 대비되는 세련된 다크 로맨틱
9: K-팝 아이돌 메이크업 - 유리알 글로우 베이스. 눈두덩에 핑크+피치 쉬머를 확실하게. 코랄핑크 립 틴트. 쉬머 하이라이트. 머리색 변경(애쉬블론드/실버그레이/밀크브라운). 옷 원본 유지

이 사진을 3x3 그리드로 균등하게 9등분해줘. 사진 해상도 높여줘. 다시 한번 강조: 텍스트 절대 금지. 사람의 얼굴은 절대 바꾸지 말고 메이크업만 확실하게 분별할 수 있게 표현해줘. 총 9가지 메이크업 스타일 확실하고 정확하게 자연스럽게 표현해줘.`

    const imagePrompt = gender === '남성' ? malePrompt : femalePrompt

    // ── 리포트 시스템 프롬프트 ──
    const isEn = lang === 'en'
    const reportSystemPrompt = isEn
      ? `You are a professional makeup consultant with expertise in dermatological color science and K-beauty formulation.

## Analysis Framework
When analyzing the photo, apply these evidence-based principles:

**Skin Tone Assessment (CIE L*a*b* based)**
- Estimate tone depth: Very Light / Light / Intermediate / Tan / Brown / Dark (conceptually based on ITA° scale)
- Determine undertone by observing redness (a* axis: warm/cool/neutral) and yellowness (b* axis: golden/olive/pink) separately
- Reference point: jawline-to-neck boundary (minimizes redness/pigmentation bias from cheek area)

**Skin Condition Evaluation**
- Assess visible conditions: sebum/oiliness, dryness, pores, pigmentation irregularities, redness/rosacea tendency, fine lines
- Consider age-appropriate factors: teens (acne-prone, avoid comedogenic), 20-30s (hydration balance), 40s+ (optical blur for texture, cream-based textures, minimize powder)

**Undertone-Based Color Matching**
- Warm undertone (high b*): yellow/golden/peach-based foundations; avoid pure pink bases that create grayish cast
- Cool undertone (high a*): pink/rose-based colors; localized green correction for redness
- Olive undertone: neutral+yellow axis priority; never overcorrect with pink (causes ashiness)
- Deep skin tones: iron oxide-rich formulas over TiO2-heavy ones (prevents white cast/ashiness); tinted setting powder over translucent

**Product Selection Science**
- Foundation darkening: sebum is the primary cause — recommend oil-control primers for T-zone, thin layering
- Flash/photo settings: avoid heavy TiO2/ZnO powders (light scattering causes flashback)
- Sensitive skin: prioritize fragrance-free, MI/MCI-free, formaldehyde-releaser-free formulas
- SPF consideration: tinted sunscreens with iron oxides provide visible light protection (beneficial for melasma/PIH-prone skin)

## Response Format
Respond ONLY with JSON (no code fences, no markdown):
{"analysis":{"gender":"","skinType":"e.g. Combination","skinTypeDetail":"3-4 sentences: skin characteristics observed from photo, specific concerns by zone (T-zone vs cheeks), strengths to maintain, and evidence-based care priorities","tone":"e.g. Warm Undertone (Light-Intermediate depth)","toneDetail":"3-4 sentences: undertone determination basis (visible vein color, jaw/neck observation), best-matching color families for foundation/lip/blush, specific colors to avoid and why (e.g. pure pink on olive skin creates gray cast)","advice":"3-4 sentences: personalized makeup strategy considering skin type + tone + visible age range + conditions. Include base texture recommendation (dewy/satin/matte), coverage approach (sheer/medium/full), and key technique tips"},"products":[{"category":"","name":"","brand":"","price":"$","reason":"1-2 sentences explaining why this specific product suits THIS person's skin tone, type, and concerns"}]}

Rules:
- Exactly 7 products, one per category: Base, Primer, Eyes, Lips, Cheeks, Brow, Skin
- Global brands available internationally, realistic USD prices
- Each product reason must reference the person's specific skin characteristics (not generic)
- For deep skin tones: prioritize shade-inclusive brands with sufficient undertone range
- If skin type is unknown, assess from photo (pore visibility, shine, texture)
- Consider the person's apparent age when recommending textures (cream vs powder)`
      : `당신은 피부과학적 색채 이론과 K-뷰티 포뮬레이션에 전문성을 갖춘 프로페셔널 메이크업 컨설턴트입니다.

## 분석 프레임워크
사진 분석 시 다음 근거 기반 원칙을 적용하세요:

**피부톤 평가 (CIE L*a*b* 기반)**
- 톤 깊이 추정: 매우 밝음 / 밝음 / 중간 / 탠 / 브라운 / 다크 (ITA° 스케일 개념 기반)
- 언더톤은 붉음(a* 축: 웜/쿨/뉴트럴)과 황색(b* 축: 골든/올리브/핑크)을 분리하여 판단
- 기준점: 턱선~목 경계 (볼 부위의 홍조/색소침착 편향을 최소화)

**피부 컨디션 평가**
- 가시적 상태 평가: 피지/유분, 건조함, 모공, 색소 불균일, 홍조/민감 경향, 잔주름
- 연령 맞춤 고려: 10대(여드름 주의, 비면포성), 20-30대(수분 균형), 40대+(광학 블러 활용, 크림 베이스, 파우더 최소화)

**언더톤 기반 색상 매칭**
- 웜 언더톤(높은 b*): 황색/골드/피치 베이스 파운데이션. 순수 핑크 베이스는 회색 캐스트 유발하므로 회피
- 쿨 언더톤(높은 a*): 핑크/로즈 계열. 홍조 부위는 그린 코렉터로 국소 보정
- 올리브 언더톤: 뉴트럴+옐로 축 우선. 핑크로 과보정하면 탁해짐(잿빛)
- 깊은 피부톤: TiO2 과다 제품보다 산화철(iron oxide) 기반 포뮬러 우선(백탁/잿빛 방지). 무색 세팅 파우더 대신 틴티드 파우더

**제품 선택의 과학**
- 파운데이션 다크닝: 피지가 주요 원인 → T존 오일 컨트롤 프라이머 + 얇은 레이어링 권장
- 촬영/플래시: TiO2/ZnO 과다 파우더 회피(빛 산란으로 플래시백 유발)
- 민감 피부: 무향료, MI/MCI 무첨가, 포름알데히드 방출 보존제 무첨가 포뮬러 우선
- 자외선 차단: 산화철 함유 틴티드 선스크린은 가시광선 차단 효과(멜라스마/PIH 피부에 유리)

## 응답 형식
JSON만 응답 (코드펜스, 마크다운 없이):
{"analysis":{"gender":"","skinType":"예: 복합성","skinTypeDetail":"3-4문장: 사진에서 관찰된 피부 특성, 존별 상태(T존 vs 볼), 유지해야 할 강점, 근거 기반 관리 우선순위","tone":"예: 웜 언더톤 (밝음-중간 깊이)","toneDetail":"3-4문장: 언더톤 판단 근거(혈관 색, 턱/목 관찰), 파운데이션/립/블러셔에 가장 잘 맞는 컬러 패밀리, 피해야 할 특정 색상과 이유(예: 올리브 피부에 순핑크 → 회색 캐스트)","advice":"3-4문장: 피부타입+톤+추정 연령대+컨디션을 종합한 맞춤 메이크업 전략. 베이스 텍스처(윤광/새틴/매트), 커버력(쉬어/미디엄/풀), 핵심 테크닉 팁 포함"},"products":[{"category":"","name":"","brand":"","price":"$","reason":"1-2문장: 이 사람의 피부톤·타입·고민에 이 제품이 왜 맞는지 구체적으로"}]}

규칙:
- 정확히 7개 제품, 카테고리별 1개: Base, Primer, Eyes, Lips, Cheeks, Brow, Skin
- 글로벌 브랜드, 현실적 USD 가격
- 각 제품 reason은 이 사람의 구체적 피부 특성을 참조 (일반적 설명 금지)
- 깊은 피부톤: 셰이드 범위가 넓은 브랜드 우선
- 피부타입 모르면 사진에서 판단 (모공 가시성, 유분, 질감)
- 추정 연령대에 맞는 텍스처 추천 (크림 vs 파우더)`

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
    async function generateReport(): Promise<{ data: string; error: string }> {
      const errors: string[] = []

      // 1차: Gemini (저렴, 지역 제한 없음)
      if (env.GEMINI_API_KEY) {
        try {
          console.log('[kisskin] Trying Gemini report (1st)')
          const result = await generateReportWithGemini(env.GEMINI_API_KEY, photo, reportSystemPrompt, reportUserText, env.GEMINI_REPORT_MODEL)
          if (result) return { data: result, error: '' }
          errors.push('[1.Gemini] empty response')
          console.warn('[kisskin] Gemini report empty, falling back to OpenAI')
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          errors.push(`[1.Gemini] ${msg}`)
          console.warn(`[kisskin] Gemini report failed: ${msg}`)
        }
      } else {
        errors.push('[1.Gemini] GEMINI_API_KEY not set')
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
        max_tokens: 3000,
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
            if (content) return { data: content, error: '' }
            errors.push('[2.Gateway] empty content')
          } else {
            const errText = await res.text().catch(() => '')
            errors.push(`[2.Gateway] ${res.status}:${errText.slice(0, 100)}`)
          }
        } catch (e) {
          errors.push(`[2.Gateway] ${e instanceof Error ? e.message : String(e)}`)
        }
      } else {
        errors.push('[2.Gateway] no gatewayUrl')
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
          if (content) return { data: content, error: '' }
          errors.push('[3.OpenAI] empty content')
        } else {
          const errText = await res.text().catch(() => '')
          errors.push(`[3.OpenAI] ${res.status}:${errText.slice(0, 100)}`)
        }
      } catch (e) {
        errors.push(`[3.OpenAI] ${e instanceof Error ? e.message : String(e)}`)
      }

      return { data: '', error: errors.join(' | ') || 'All report methods failed' }
    }

    // ══════════════════════════════════════════════════════════
    // 병렬 실행
    // ══════════════════════════════════════════════════════════
    // 90-second timeout to prevent indefinite hangs
    const TIMEOUT_MS = 90_000
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Analysis timed out. Please try again.')), TIMEOUT_MS),
    )

    const [imageResult, reportResult] = await Promise.race([
      Promise.all([generateImage(), generateReport()]),
      timeoutPromise,
    ]) as [Awaited<ReturnType<typeof generateImage>>, Awaited<ReturnType<typeof generateReport>>]

    const imageData = imageResult.data
    const imageError = imageResult.error
    const reportError = reportResult.error
    const report = extractReportJson(reportResult.data)

    // ══════════════════════════════════════════════════════════
    // 결과 반환
    // ══════════════════════════════════════════════════════════
    if (!imageData && !report) {
      const cf = (request as unknown as { cf?: { colo?: string } }).cf
      const colo = cf?.colo || 'unknown'

      const allErrors = [imageError, reportError].filter(Boolean).join(' || ')
      const envDebug = `[GEMINI_KEY:${env.GEMINI_API_KEY ? 'set(' + env.GEMINI_API_KEY.slice(-4) + ')' : 'MISSING'}|BASE_URL:${env.OPENAI_BASE_URL ? 'set' : 'MISSING'}|AIG_TOKEN:${env.CF_AIG_TOKEN ? 'set' : 'MISSING'}|IMG_MODELS:${env.GEMINI_IMAGE_MODELS || 'default'}]`
      return new Response(JSON.stringify({
        error: `API 오류 (${colo}): ${allErrors.slice(0, 400) || '이미지와 보고서 모두 생성 실패'} ${envDebug}`,
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
