// Gemini 텍스트 생성 공용 호출부 — **되는 모델을 스스로 찾는다**.
//
// 왜 이렇게까지 하나. 2026-08-09 하루에 모델 문제로 두 번 깨졌다:
//   ① `gemini-2.5-flash` → 404 "no longer available to new users"
//      (기존 프로젝트만 유예. 새로 만든 프로젝트 키는 거부)
//   ② `gemini-3.6-flash` → 429 첫 호출부터 쿼터 초과
//      (2025-12 이후 무료 티어가 대폭 축소돼 3.x 는 사실상 유료 전용)
// 모델명을 하나 박아두면 구글이 정책을 바꿀 때마다 발행이 멈추고, 고치려면
// 워크플로를 돌려 로그를 봐야 해서 왕복이 하루씩 걸린다.
//
// 그래서 후보를 좋은 순서로 세워 두고 위에서부터 시도한다.
//   · 404(모델 없음/차단) · 429(쿼터 없음) → 다음 후보로
//   · 그 외 오류 → 진짜 문제이므로 그대로 throw
// 유료 키면 첫 후보에서 바로 끝나고, 무료 키면 쿼터가 남은 세대까지 내려간다.
// 한 번 통한 모델은 프로세스 내에서 재사용하므로 매 호출마다 다시 훑지 않는다.
//
// 모델을 고정하고 싶으면 GEMINI_TEXT_MODELS 로 콤마 목록을 넘기면 된다.

export const TEXT_CANDIDATES = (
  process.env.GEMINI_TEXT_MODELS ||
  // 품질 좋은 순. 뒤로 갈수록 구세대지만 무료 티어 쿼터가 남아 있을 확률이 높다.
  'gemini-3.6-flash,gemini-3.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const CANDIDATES = TEXT_CANDIDATES

let resolved = null // 이번 실행에서 실제로 통한 모델

export const usedModel = () => resolved || CANDIDATES[0]

// thinking 을 낮게 눌러야 JSON 이 안 잘린다(thinking 토큰이 출력 예산을 나눠 먹는다 —
// analyze.ts 의 truncation fix 와 같은 원리). 파라미터 이름이 세대마다 다르다:
//   2.x → thinkingConfig.thinkingBudget = 0
//   3.x → thinkingConfig.thinkingLevel = 'minimal'|'low'|'medium'|'high'
// 서로의 이름을 모르므로 세대를 보고 고르고, 그래도 400 이면 빼고 재시도한다.
function thinkingFor(model) {
  return /^gemini-(?:[3-9]|\d\d)/.test(model)
    ? { thinkingConfig: { thinkingLevel: 'low' } }
    : { thinkingConfig: { thinkingBudget: 0 } }
}

async function once(apiKey, model, prompt, opts) {
  const { temperature = 0.7, maxOutputTokens = 4096, grounded = false, lowThinking = false } = opts
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens, ...(lowThinking ? thinkingFor(model) : {}) },
  }
  if (grounded) body.tools = [{ google_search: {} }]

  const post = () =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    })

  let res = await post()
  if (res.status === 400 && lowThinking) {
    // thinking 필드 이름을 또 틀렸을 가능성. 한 번은 빼고 재시도한다 —
    // 잘릴 위험은 생기지만 아예 발행 못 하는 것보단 낫고, 잘리면 상위가 재시도한다.
    console.warn(`  ↻ ${model} 400 — thinking 파라미터 빼고 재시도: ${(await res.text().catch(() => '')).slice(0, 160)}`)
    delete body.generationConfig.thinkingConfig
    res = await post()
  }
  return res
}

/** 프롬프트를 넣으면 텍스트를 돌려준다. 되는 모델을 알아서 고른다. */
export async function callGeminiText(apiKey, prompt, opts = {}) {
  // 이미 통한 모델이 있으면 그것부터. 없으면 후보 순서대로.
  const order = resolved ? [resolved, ...CANDIDATES.filter((m) => m !== resolved)] : CANDIDATES
  const skipped = []

  for (const model of order) {
    const res = await once(apiKey, model, prompt, opts)

    // 404 = 이 키로 못 쓰는 모델 · 429 = 이 모델에 남은 쿼터 없음 → 다음 후보
    if (res.status === 404 || res.status === 429) {
      skipped.push(`${model}(${res.status})`)
      if (resolved === model) resolved = null // 쓰던 모델이 도중에 막힌 경우
      continue
    }
    if (!res.ok) {
      throw new Error(`Gemini ${res.status} [${model}]: ${(await res.text().catch(() => '')).slice(0, 500)}`)
    }

    const data = await res.json()
    const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
    if (!text) throw new Error(`Gemini 응답에 텍스트 없음 [${model}]: ${JSON.stringify(data).slice(0, 300)}`)

    if (resolved !== model) {
      console.log(`  · 모델 ${model} 사용${skipped.length ? ` (건너뜀: ${skipped.join(', ')})` : ''}`)
      resolved = model
    }
    return text
  }

  throw new Error(
    `쓸 수 있는 모델이 없음 — 후보 전부 404/429: ${skipped.join(', ')}\n` +
      '  404=이 키로 막힌 모델 · 429=무료 티어 쿼터 0 또는 일일 한도 소진.\n' +
      '  `node scripts/gemini-preflight.mjs` 로 사용 가능 목록 확인 후 GEMINI_TEXT_MODELS 로 지정할 것.',
  )
}
