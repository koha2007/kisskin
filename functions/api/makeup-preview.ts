// 가입 전 미리보기 1장 (2026-11-17)
// ────────────────────────────────────────────────────────────────────
// 운영자 11/17 "왜 결제를 안 하나" 점검: /analysis/ 121명 → 로그인 화면 75명(평균 12초) → 가입 23명.
// 결과를 하나도 못 본 채 가입부터 요구해서 대부분 떠났다. Remini 처럼 "먼저 보여 주고, 저장은 가입"으로 바꾼다.
//
// 익명 무료는 예전에 IP·지문 로테이션으로 무한 우회됐다(makeup-edit.ts 주석). 그래서 이 미리보기는
//   · 프롬프트를 서버가 만든다(9룩 styleId 만 받음) — 임의 이미지 생성기로 쓸 수 없다
//   · quality=low (장당 ~$0.01~0.02) — 화면에선 워터마크를 얹어 "미리보기"로만 보인다
//   · IP 하루 1장 + 전체 하루 PREVIEW_DAILY_CAP 장 — 로테이션해도 하루 비용 상한이 고정된다
//   · 저장소(KV)가 없으면 호출하지 않는다(fail-closed)
// 가입하면 같은 셀카·같은 룩으로 무료권 1장(medium)을 정식으로 만든다 — 기존 흐름 그대로.
import { MAKEUP_STYLES, promptWholeFace, type MakeupStyleId } from '../../src/lib/makeup/styles'
import type { UsageStore } from './_freeUsage'

interface Env {
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
  CF_AIG_TOKEN?: string
  MAKEUP_USAGE?: UsageStore
}

/** 하루 전체 상한 — low 장당 ~$0.02 기준 하루 최대 ~$1 */
const PREVIEW_DAILY_CAP = 50
const DAY_SEC = 26 * 60 * 60

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

function dataUrlToBlob(dataUrl: string): Blob {
  const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: 'image/png' })
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.OPENAI_API_KEY && !env.CF_AIG_TOKEN) return json({ error: 'not_configured' }, 500)
  if (!env.MAKEUP_USAGE) return json({ error: 'guard_unconfigured' }, 503)

  let body: { image?: string; styleId?: string; size?: string }
  try { body = await request.json() } catch { return json({ error: 'bad_json' }, 400) }
  const style = MAKEUP_STYLES.find((s) => s.id === (body.styleId as MakeupStyleId))
  if (!body.image || !style) return json({ error: 'missing_fields' }, 400)
  // 셀카 1장 크기 상한(~8MB base64) — 큰 요청으로 비용·시간을 끌지 못하게
  if (body.image.length > 11_000_000) return json({ error: 'too_large' }, 413)

  const day = new Date().toISOString().slice(0, 10)
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const ipKey = `preview:ip:${day}:${ip}`
  const allKey = `preview:all:${day}`
  if (await env.MAKEUP_USAGE.get(ipKey)) return json({ error: 'preview_used' }, 429)
  const all = parseInt((await env.MAKEUP_USAGE.get(allKey)) || '0', 10) || 0
  if (all >= PREVIEW_DAILY_CAP) return json({ error: 'preview_cap' }, 429)
  // 호출 "전"에 잡는다 — 실패해도 되돌리지 않는다(실패를 무한 재시도하는 우회 차단).
  await env.MAKEUP_USAGE.put(ipKey, '1', { expirationTtl: DAY_SEC })
  await env.MAKEUP_USAGE.put(allKey, String(all + 1), { expirationTtl: DAY_SEC })

  const fd = new FormData()
  fd.append('model', 'gpt-image-2')
  fd.append('image', dataUrlToBlob(body.image), 'image.png')
  fd.append('prompt', promptWholeFace(style))
  fd.append('size', body.size && /^(auto|\d+x\d+)$/.test(body.size) ? body.size : 'auto')
  fd.append('quality', 'low')
  fd.append('n', '1')

  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const headers: Record<string, string> = {}
  let url = 'https://api.openai.com/v1/images/edits'
  if (base && env.CF_AIG_TOKEN) { url = `${base}/v1/images/edits`; headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}` }
  else if (base) { url = `${base}/v1/images/edits`; headers.Authorization = `Bearer ${env.OPENAI_API_KEY}` }
  else headers.Authorization = `Bearer ${env.OPENAI_API_KEY}`

  try {
    const res = await fetch(url, { method: 'POST', headers, body: fd })
    const data = (await res.json().catch(() => ({}))) as { data?: { b64_json?: string }[] }
    const b64 = data.data?.[0]?.b64_json
    if (!res.ok || !b64) return json({ error: 'generate_failed' }, 502)
    return json({ image: `data:image/png;base64,${b64}`, styleId: style.id })
  } catch {
    return json({ error: 'generate_failed' }, 502)
  }
}
