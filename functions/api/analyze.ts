// Makeup Analysis API v10 — 텍스트 리포트 전용 (메이크업은 온디바이스 MediaPipe)
// - 메이크업 이미지 생성(Gemini/OpenAI)은 완전히 제거됨. 룩은 브라우저(src/lib/makeup)에서
//   온디바이스로 합성한다 → Gemini ~117s 이미지 생성으로 인한 524 타임아웃 원천 해소.
// - 리포트(톤 분석/제품 추천): Gemini → AI Gateway gpt-4.1 → 직접 OpenAI (폴백)
// - AI Gateway BYOK: cf-aig-authorization 헤더 사용, 저장된 키 자동 주입

interface Env {
  OPENAI_API_KEY: string
  OPENAI_BASE_URL?: string       // AI Gateway URL (예: https://gateway.ai.cloudflare.com/v1/.../openai)
  CF_AIG_TOKEN?: string           // AI Gateway 인증 토큰
  GEMINI_API_KEY?: string
  GEMINI_REPORT_MODEL?: string
}

interface RequestBody {
  photo: string
  gender: string
  skinType?: string   // 선택사항(건너뛰기 가능). 빈 값이면 톤 기반 일반 조언
  lang?: string
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

// 기본 모델 만료일 경고 (환경변수로 모델 지정 시 불필요)
const DEFAULT_MODEL_EXPIRY = new Date('2026-09-30')
function checkModelExpiry(env: Env) {
  // 환경변수로 모델을 직접 관리 중이면 경고 스킵
  if (env.GEMINI_REPORT_MODEL) return
  const now = new Date()
  const daysLeft = Math.ceil((DEFAULT_MODEL_EXPIRY.getTime() - now.getTime()) / 86400000)
  if (daysLeft <= 14 && daysLeft > 0) {
    console.warn(`⚠️ [kisskin] Default Gemini report model expires in ${daysLeft} days. Set GEMINI_REPORT_MODEL env var to override.`)
  } else if (daysLeft <= 0) {
    console.error(`🚨 [kisskin] Default Gemini report model EXPIRED! Set GEMINI_REPORT_MODEL in Cloudflare env vars. See: https://ai.google.dev/gemini-api/docs/models`)
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
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          // gemini-2.5-flash의 thinking 토큰은 출력 예산(maxOutputTokens)을 공유한다.
          // 기본값으로 두면 thinking이 ~1.7~2k 토큰을 소비해 JSON 답변이 잘리고
          // (finishReason=MAX_TOKENS) 리포트의 ~50%가 파싱 불가가 됐다.
          // thinking을 끄고 JSON 응답을 강제해 잘림을 제거한다.
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: 'application/json',
        },
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
    const { photo, gender, skinType, lang } = (await request.json()) as RequestBody

    if (!photo || !gender) {  // 피부 타입은 선택사항
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

    // 리포트 폴백(Gateway/OpenAI)용 엔드포인트·인증. 메이크업 이미지 생성은 제거됨.
    const directUrl = 'https://api.openai.com'
    const gatewayUrl = env.OPENAI_BASE_URL?.replace(/\/$/, '')
    const authHeader = `Bearer ${env.OPENAI_API_KEY}`

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
{"analysis":{"gender":"","tone":"e.g. Warm Undertone (Light-Intermediate depth)","toneDetail":"3-4 sentences: undertone determination basis (visible vein color, jaw/neck observation), best-matching color families for foundation/lip/blush, specific colors to avoid and why (e.g. pure pink on olive skin creates gray cast)","advice":"3-4 sentences: personalized makeup strategy considering tone and visible age range. If the user provided a skin type, reflect it; if skin type is 'not provided', base advice on tone only and do NOT mention or guess skin type. Include base texture recommendation (dewy/satin/matte), coverage approach (sheer/medium/full), and key technique tips"},"products":[{"category":"","name":"","brand":"","price":"$","reason":"1-2 sentences explaining why this specific product suits THIS person's skin tone and the makeup looks"}]}

Rules:
- Exactly 7 products, one per category: Base, Primer, Eyes, Lips, Cheeks, Brow, Skin
- Global brands available internationally, realistic USD prices
- Each product reason must reference the person's specific skin characteristics (not generic)
- For deep skin tones: prioritize shade-inclusive brands with sufficient undertone range
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
{"analysis":{"gender":"","tone":"예: 웜 언더톤 (밝음-중간 깊이)","toneDetail":"3-4문장: 언더톤 판단 근거(혈관 색, 턱/목 관찰), 파운데이션/립/블러셔에 가장 잘 맞는 컬러 패밀리, 피해야 할 특정 색상과 이유(예: 올리브 피부에 순핑크 → 회색 캐스트)","advice":"3-4문장: 톤과 추정 연령대를 바탕으로 한 맞춤 메이크업 전략. 사용자가 피부 타입을 입력했으면 반영하고, '미입력'이면 톤 중심으로만 조언하며 피부 타입을 언급/추측하지 말 것. 베이스 텍스처(윤광/새틴/매트), 커버력(쉬어/미디엄/풀), 핵심 테크닉 팁 포함"},"products":[{"category":"","name":"","brand":"","price":"$","reason":"1-2문장: 이 사람의 피부톤과 메이크업 룩에 이 제품이 왜 맞는지 구체적으로"}]}

규칙:
- 정확히 7개 제품, 카테고리별 1개: Base, Primer, Eyes, Lips, Cheeks, Brow, Skin
- 글로벌 브랜드, 현실적 USD 가격
- 각 제품 reason은 이 사람의 구체적 피부 특성을 참조 (일반적 설명 금지)
- 깊은 피부톤: 셰이드 범위가 넓은 브랜드 우선
- 추정 연령대에 맞는 텍스처 추천 (크림 vs 파우더)`

    // 피부 타입: 입력 있으면 맞춤 반영, 없으면(선택사항 건너뜀) 톤 기반 일반 조언
    const reportUserText = skinType && skinType.trim()
      ? `${gender}\n사용자가 직접 입력한 피부 타입: ${skinType}`
      : `${gender}\n피부 타입: 미입력 (피부 타입을 언급하거나 추측하지 말고, 톤 중심으로 조언하세요)`

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
          // Gemini가 비었거나 (잘려서) 유효 JSON을 못 만들면 폴백으로 넘긴다.
          // 과거엔 잘린 텍스트도 non-empty라 success로 오인되어 폴백이 안 돌았다.
          if (result && extractReportJson(result)) return { data: result, error: '' }
          errors.push(result ? '[1.Gemini] invalid/truncated JSON' : '[1.Gemini] empty response')
          console.warn('[kisskin] Gemini report empty/invalid, falling back to Gateway/OpenAI')
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
    // 텍스트 리포트만 생성 (메이크업 이미지는 온디바이스) — 60s 타임아웃
    // ══════════════════════════════════════════════════════════
    const TIMEOUT_MS = 60_000
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Report timed out. Please try again.')), TIMEOUT_MS),
    )

    const reportResult = await Promise.race([
      generateReport(),
      timeoutPromise,
    ]) as Awaited<ReturnType<typeof generateReport>>

    const reportError = reportResult.error
    const report = extractReportJson(reportResult.data)

    // ══════════════════════════════════════════════════════════
    // 결과 반환 (report만)
    // ══════════════════════════════════════════════════════════
    if (!report) {
      const cf = (request as unknown as { cf?: { colo?: string } }).cf
      const colo = cf?.colo || 'unknown'
      console.error(`[analyze] Report failed (${colo}): ${reportError} [GEMINI_KEY:${env.GEMINI_API_KEY ? 'set' : 'MISSING'}|BASE_URL:${env.OPENAI_BASE_URL ? 'set' : 'MISSING'}|AIG_TOKEN:${env.CF_AIG_TOKEN ? 'set' : 'MISSING'}]`)
      return new Response(JSON.stringify({
        error: `API 오류 (${colo}): ${reportError.slice(0, 400) || '리포트 생성 실패'}`,
      }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ report }), {
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
