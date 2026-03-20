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
      if (parsed && typeof parsed === 'object') {
        // products 배열이 있거나 analysis 객체가 있으면 유효
        if (Array.isArray(parsed.products) || parsed.analysis) {
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

    const femalePrompt = `Professional makeup artist. Apply 9 different makeup styles to the SAME face in a 3×3 grid. ${gender}, ${skinTypeInstruction} 반영.

[ABSOLUTE RULES - VIOLATION = FAILURE]
- NO text/labels/numbers/watermarks anywhere
- FACE MUST BE 100% IDENTICAL in all 9 cells: same eyes, nose, lips, jawline, skin color, face shape, facial proportions. The person must look like the EXACT SAME person in every cell. If the face looks different, it is a complete failure
- DO NOT change skin color or brightness. Keep original skin tone exactly
- ONLY change makeup (cosmetics). DO NOT change background, lighting, clothes, accessories
- Hair color change ONLY in cell 2 (Cloud Skin). All other 8 cells keep original hair color
- All 9 cells must have identical face position, size, angle, expression
- If teeth are visible, make them white and clean
- Each style must be clearly distinguishable at a glance
- No gaps or grid lines between cells

[9가지 메이크업 - 좌→우, 위→아래]
1: Natural Glow - 광채 피부, 피치 블러셔, 누드 립
2: Cloud Skin - 구름 피부, 깨끗한 베이스, 머리색 애쉬블론드/밀크브라운으로 변경. 옷 원본 유지
3: Blood Lip - 진한 버건디/레드 립, 깔끔한 아이
4: Maximalist Eye - 컬러 아이섀도(보라/파랑/초록), 굵은 아이라인
5: Metallic Eye - 골드/실버 메탈릭 아이섀도, 글로시 눈매
6: Bold Lip - 선명한 빨강/코랄 립
7: Blush Draping - 광대~관자놀이 진한 분홍/코랄 블러셔
8: Grunge Makeup - 스모키 아이, 다크 베리 립, 매트 피부
9: K-pop Idol - 유리알 광택, 그라데이션 핑크 립, 쉬머

CRITICAL: The face must be IDENTICAL in all 9 cells - same person! Only makeup changes! Hair color only in cell 2! No text!`

    const malePrompt = `Professional makeup artist. Apply 9 different male makeup styles to the SAME face in a 3×3 grid. ${gender}, ${skinTypeInstruction} 반영.

[ABSOLUTE RULES - VIOLATION = FAILURE]
- NO text/labels/numbers/watermarks anywhere
- FACE MUST BE 100% IDENTICAL in all 9 cells: same eyes, nose, lips, jawline, skin color, ethnicity, face shape, facial proportions. The person must look like the EXACT SAME person in every cell. If the face looks different, it is a complete failure
- DO NOT change skin color or brightness. Keep original skin tone exactly. Keep accessories (hat/glasses/earrings)
- ONLY change makeup (cosmetics). DO NOT change background, lighting, clothes
- Hair color change ONLY in cell 9 (K-pop Idol). All other 8 cells keep original hair color
- All 9 cells must have identical face position, size, angle, expression. Clean skin but keep original tone
- If teeth are visible, make them white and clean
- Each of the 9 styles MUST be clearly distinguishable! Lip color, eyeshadow, blush must be visible. Subtle/bland = failure
- No gaps or grid lines between cells

[9가지 남성 메이크업 - 좌→우, 위→아래]
1: No-Makeup Makeup - 깨끗한 매트 피부, 눈썹 정돈, 투명 보습 립밤. 가장 자연스러운 룩
2: Skincare Hybrid Base - 촉촉한 윤광 글로우 피부, 이슬 맺힌 듯한 광채. 1번보다 확연히 빛나는 피부
3: Blurred Lip - 선명한 로즈/코랄 립 컬러를 확실하게 바르기. 입술 색이 눈에 확 띄어야 함. 깨끗한 피부
4: Grunge / Smoky Eye - 눈 주위에 차콜+카키+다크브라운 아이섀도를 넓고 진하게 블렌딩. 다크 베리 매트 립. 눈매가 강렬해야 함
5: Monochrome - 테라코타/피치 한 가지 톤으로 아이섀도·블러셔·립을 통일. 세 부위 모두 컬러가 확실히 보여야 함
6: Utility Makeup - 완벽한 컨실러 커버, 또렷한 눈썹, 자연스러운 코랄 틴트 립. 깔끔한 비즈니스 룩
7: Blue & Color Point Eye - 눈두덩에 선명한 블루/네이비 아이섀도를 확실하게 바르기. 파란색이 눈에 확 띄어야 함
8: Vampire Romantic - 눈 주위 버건디+로즈골드 그라데이션 아이섀도를 진하게. 짙은 와인/다크레드 립. 드라마틱하고 강렬한 무드
9: K-pop Idol - 글로우 베이스, 핑크+피치 쉬머 아이섀도, 선명한 코랄핑크 립, 머리색 변경(애쉬블론드/실버그레이/밀크브라운). 옷 원본 유지

CRITICAL: The face must be IDENTICAL in all 9 cells - same person! Only makeup changes! Hair color only in cell 9! No text! Each style must be visually distinct!`

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
