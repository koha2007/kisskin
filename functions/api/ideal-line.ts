// AI 이상형 테스트 — 결과 카드의 "AI 한 줄" (2026-11-25, docs/IDEAL_TYPE_PLAN.md)
// 가입 없이 무료. 작은 텍스트 모델로 1명당 약 0.1원. 비용 가드:
//   · IP 하루 20회, 전체 하루 3,000회(KV). 저장소가 없거나 넘치면 202 + fallback → 화면은 미리 쓴 문장으로.
//   · 입력은 서버가 아는 값(유형 코드·성별·답 번호)만 받는다 → 프롬프트 주입 여지 없음.
import { IDEAL_TYPES, IDEAL_ORDER, type IdealTypeCode } from '../../src/lib/ideal-type/types'
import { IQ_QUESTIONS, decodeAnswers } from '../../src/lib/ideal-type/questions'
import type { UsageStore } from './_freeUsage'

interface Env { OPENAI_API_KEY?: string; OPENAI_BASE_URL?: string; CF_AIG_TOKEN?: string; MAKEUP_USAGE?: UsageStore }

const DAY_SEC = 60 * 60 * 24
const IP_LIMIT = 20
const ALL_LIMIT = 3000
const json = (obj: unknown, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  let body: { type?: string; g?: string; a?: string; lang?: string }
  try { body = await request.json() } catch { return json({ error: 'bad_json' }, 400) }
  const code = body.type as IdealTypeCode
  const answers = decodeAnswers(body.a)
  if (!(IDEAL_ORDER as string[]).includes(code) || !answers || (body.g !== 'm' && body.g !== 'f')) return json({ error: 'bad_input' }, 400)
  const en = body.lang === 'en'
  if (!env.MAKEUP_USAGE || (!env.OPENAI_API_KEY && !env.CF_AIG_TOKEN)) return json({ fallback: true }, 202)

  const day = new Date().toISOString().slice(0, 10)
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const ipKey = `iline:ip:${day}:${ip}`, allKey = `iline:all:${day}`
  const [ipN, allN] = await Promise.all([env.MAKEUP_USAGE.get(ipKey), env.MAKEUP_USAGE.get(allKey)])
  if (Number(ipN || 0) >= IP_LIMIT || Number(allN || 0) >= ALL_LIMIT) return json({ fallback: true }, 202)
  await Promise.all([
    env.MAKEUP_USAGE.put(ipKey, String(Number(ipN || 0) + 1), { expirationTtl: DAY_SEC }),
    env.MAKEUP_USAGE.put(allKey, String(Number(allN || 0) + 1), { expirationTtl: DAY_SEC }),
  ])

  const t = IDEAL_TYPES[code]
  const picks = answers.map((a, i) => { const q = IQ_QUESTIONS[i]; const op = q.options[a]; return `${en ? q.en : q.ko} → ${en ? op.en : op.ko}` }).join('\n')
  const system = en
    ? 'You write ONE short, warm, witty line (max 70 characters) for a shareable "ideal type" quiz card. Speak to the quiz taker in second person about what they fall for. No names of real people or celebrities, no appearance ratings, nothing sexual, no emojis, no hashtags, no quotes. Output only the line.'
    : '공유용 "이상형 테스트" 카드에 들어갈 한 줄(최대 32자)을 쓴다. 테스트한 사람에게 "당신은 ~에 약해요"처럼 다정하고 재치 있게 말한다. 실존 인물·연예인 이름 금지, 외모 평가 금지, 선정적 표현 금지, 이모지·해시태그·따옴표 금지. 한 줄만 출력.'
  const user = `${en ? 'Type' : '유형'}: ${en ? t.en : t.ko} (${en ? t.taglineEn : t.taglineKo})\n${en ? 'Answers' : '답'}:\n${picks}`

  const payload = JSON.stringify({ model: 'gpt-4.1-mini', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.9, max_tokens: 60 })
  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const tries: { url: string; headers: Record<string, string> }[] = []
  if (base && env.CF_AIG_TOKEN) tries.push({ url: `${base}/v1/chat/completions`, headers: { 'cf-aig-authorization': `Bearer ${env.CF_AIG_TOKEN}` } })
  if (env.OPENAI_API_KEY) tries.push({ url: 'https://api.openai.com/v1/chat/completions', headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` } })
  for (const tr of tries) {
    try {
      const res = await fetch(tr.url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...tr.headers }, body: payload })
      if (!res.ok) continue
      const j = (await res.json()) as { choices?: { message?: { content?: string } }[] }
      const line = (j.choices?.[0]?.message?.content || '').replace(/["“”'‘’#]/g, '').split('\n')[0].trim().slice(0, en ? 90 : 40)
      if (line) return json({ line })
    } catch { /* 다음 경로 */ }
  }
  return json({ fallback: true }, 202)
}
