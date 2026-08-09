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
//
// 후보가 전부 막히면 **OpenAI 로 넘어간다**. 2026-08-09 에 이 경로가 유일한 생존로였다:
// 결제 정지로 유료 Gemini 키가 403, 새로 만든 무료 키는 전 모델 404/429.
// 한 벤더에 전부 매달아 둔 게 사고의 실체였으므로 폴백은 영구 구성으로 둔다.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

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

// ── OpenAI 폴백 ──────────────────────────────────────────────────────
// 그라운딩은 Responses API 의 `web_search` 툴로 대체한다(Gemini 의 google_search 대응).
// 게이트웨이가 아니라 api.openai.com 을 직접 쓴다 — GitHub Actions 는 지역차단이
// 없고, 중간 단계가 적을수록 발행 실패 지점이 줄어든다.
const OPENAI_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-4.1'

function openaiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY
  // 로컬 실행 편의 — CI 에서는 env 로 들어온다.
  for (const f of ['.dev.vars', '.env']) {
    try {
      for (const line of readFileSync(resolve(f), 'utf8').split('\n')) {
        const t = line.trim()
        if (!t || t.startsWith('#')) continue
        const i = t.indexOf('=')
        if (i > 0 && t.slice(0, i).trim() === 'OPENAI_API_KEY') {
          return t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
        }
      }
    } catch { /* 파일 없음 */ }
  }
  return undefined
}

async function openaiFallback(prompt, opts, skipped) {
  const key = openaiKey()
  if (!key) {
    throw new Error(
      `Gemini 전부 막힘(${skipped.join(', ') || 'no key'}) + OPENAI_API_KEY 없음 → 생성 불가.\n` +
        '  GitHub Actions 라면 리포 Secret 에 OPENAI_API_KEY 를 추가할 것. 배경은 GEMINI_HOLD.md',
    )
  }
  const body = {
    model: OPENAI_MODEL,
    // Gemini 프롬프트를 그대로 재사용하되, JSON 만 뱉도록 한 줄 못 박는다.
    // web_search 를 쓰면 모델이 설명 문장을 앞뒤로 붙이는 버릇이 있어 파싱이 깨진다.
    input:
      `${prompt}\n\n[출력 규칙] 위에서 요구한 JSON **하나만** 출력한다. 설명 문장, 인사말, 코드펜스 밖 텍스트 금지.\n` +
      '본문에 마크다운 링크나 URL 을 넣지 말 것 — 출처를 밝힐 땐 매체 이름만 쓴다(기존 글 스타일).\n' +
      '배열 개수·글자수 제약은 **주석에 적힌 개수**를 따른다. 예시에 몇 개가 적혀 있든 예시 개수를 흉내내지 말 것.',
    max_output_tokens: Math.max(opts.maxOutputTokens || 4096, 1024),
    temperature: opts.temperature ?? 0.7,
  }
  if (opts.grounded) body.tools = [{ type: 'web_search' }]

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text().catch(() => '')).slice(0, 500)}`)

  const data = await res.json()
  const text = (data.output || [])
    .flatMap((o) => (o.content || []).map((c) => c.text || ''))
    .join('')
    .trim()
  if (!text) throw new Error(`OpenAI 응답에 텍스트 없음: ${JSON.stringify(data).slice(0, 300)}`)

  const searched = (data.output || []).some((o) => o.type === 'web_search_call')
  console.log(`  · OpenAI ${OPENAI_MODEL} 사용${opts.grounded ? ` (웹검색 ${searched ? '수행' : '미수행'})` : ''}`)
  return stripCitations(text)
}

// web_search 는 프롬프트로 막아도 인용을 흘린다. 두 가지를 정리한다:
//   ① 마크다운 링크 → 링크 텍스트만 남긴다. 기존 뉴스 본문엔 링크가 없는 게 스타일이고,
//      매체 이름은 남아야 출처가 사라지지 않는다.
//   ② `utm_source=openai` — OpenAI 가 인용 URL 에 붙이는 추적 파라미터다.
//      우리가 통제하지 못하는 파라미터를 발행물에 실을 이유가 없다.
function stripCitations(s) {
  return s
    .replace(/\[([^\]\n]{1,80})\]\((https?:\/\/[^)\s]+)\)/g, '$1')
    .replace(/[?&]utm_source=openai\b/g, '')
}

/** 프롬프트를 넣으면 텍스트를 돌려준다. 되는 모델을 알아서 고른다. */
export async function callGeminiText(apiKey, prompt, opts = {}) {
  // 이미 통한 모델이 있으면 그것부터. 없으면 후보 순서대로.
  const order = resolved ? [resolved, ...CANDIDATES.filter((m) => m !== resolved)] : CANDIDATES
  const skipped = []

  for (const model of order) {
    if (!apiKey) break
    const res = await once(apiKey, model, prompt, opts)

    // 이 키로 이 모델을 못 쓰는 상태들 → 다음 후보로.
    //   404 막힌 모델 · 429 쿼터 0/소진 · 401·403 키 무효 또는 결제 정지
    if ([401, 403, 404, 429].includes(res.status)) {
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

  // Gemini 후보가 전부 막혔다 → OpenAI 로 넘어간다.
  // 2026-08-09 에 이 경로가 유일한 생존로였다: 결제 정지로 유료 키가 403,
  // 무료 키는 신규 프로젝트라 전 모델 404/429. 한 벤더에 매달린 게 사고의 실체였다.
  console.warn(`  ⚠ Gemini 사용 불가(${skipped.join(', ') || 'no key'}) — OpenAI 로 폴백`)
  return openaiFallback(prompt, opts, skipped)
}
