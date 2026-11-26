// AI 이상형 테스트 — "이상형 옆에 선 나" (2026-11-25, docs/IDEAL_TYPE_PLAN.md 3-5·3-6절)
// 내 셀카 1장 + 이상형 유형 그림(참고) → 사진풍으로 둘이 나란히 선 데이트 사진, 내 얼굴엔 데이트 메이크업.
//   · mode 'preview' = 맛보기: 가입 X, IP 하루 1장, 전체 하루 PREVIEW_CAP 장, quality low → 화면·이미지에 워터마크
//   · mode 'credit'  = 고화질: 로그인 + 크레딧 1개(ref=jobId 멱등, 같은 작업 5회까지 재시도)
// 프롬프트는 서버가 만든다(유형·성별·장소 코드만 받음) — 임의 이미지 생성기로 쓸 수 없다.
// 다른 사람 사진은 받지 않는다: 상대는 항상 AI 가상 인물(딥페이크 방지). 본인 사진 동의는 화면에서 받는다.
// 11/26 운영자: ① 내 얼굴 메이크업 = K-pop 아이돌 고정, 이상형 얼굴 = 동물상별 메이크업(IDEAL_MAKEUP) ② 장소 추가(10·20대 인기, SIDE_PLACES)
//   ③ kind 'solo' = 이상형 혼자 찍은 스튜디오 프로필 컷(셀카 없음, 배경은 하나로 통일). 가격·맛보기 규칙은 같다(맛보기 키는 따로).
// 결과는 클라이언트가 "AI 생성" 표시를 이미지 자체에 박는다(src/lib/aiStamp.ts, AI 기본법 31조).
import { IDEAL_MAKEUP, IDEAL_ORDER, IDEAL_TYPES, SIDE_PLACES, refPlace, type IdealTypeCode, type SidePlace } from '../../src/lib/ideal-type/types'
import { styleById } from '../../src/lib/makeup/styles'
import { creditsConfigured, deductCredits } from './_credits'
import { verifyUser, type UsageStore } from './_freeUsage'

interface Env {
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
  CF_AIG_TOKEN?: string
  MAKEUP_USAGE?: UsageStore
  SUPABASE_SERVICE_ROLE_KEY?: string
  VITE_SUPABASE_URL?: string
}

const PREVIEW_CAP = 40
const DAY_SEC = 26 * 60 * 60
const MAX_JOB_ATTEMPTS = 5
const JOB_TTL = 30 * 24 * 60 * 60

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

function dataUrlToBlob(dataUrl: string): Blob {
  const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: dataUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png' })
}

const SCENE: Record<SidePlace, string> = {
  picnic: 'a sunny picnic on the grass by the Han River in Seoul, a checkered blanket, the river and a bridge softly blurred behind them',
  lpbar: 'a cozy vinyl-record café in the evening, shelves of records and a warm lamp glow behind them, coffee cups on a small table (no alcohol)',
  exhibition: 'a bright modern art gallery with large colourful abstract paintings on white walls',
  amusement: 'an amusement park at dusk with a Ferris wheel, a carousel and string lights softly blurred behind them',
  popup: 'a trendy pop-up store in Seongsu-dong, Seoul — a playful, colourful installation with big graphic shapes and soft pastel lighting, a few visitors softly blurred behind them (no brand names, no readable signs)',
  photobooth: 'inside a Korean self photo booth: a plain pastel-pink backdrop, bright flat flash lighting, one of them wearing a cute headband prop, a playful pose like a small heart with their fingers — fun, youthful snapshot',
  hanbok: 'a Korean royal palace courtyard in Seoul (Gyeongbokgung-style wooden halls with colourful dancheong eaves) on a clear day; BOTH people wear rented modern hanbok in soft colours instead of their date outfits',
  hongdae: 'a lively Hongdae street in Seoul in the early evening — street buskers, neon and shop lights softly blurred behind them, youthful energy (no readable signs)',
  'winter-lights': 'a winter street in Seoul at night decorated with warm Christmas illumination — glowing light tunnels and a big lit tree softly blurred behind them; both wear warm winter coats and scarves',
}
// 단독 컷은 배경을 하나로 통일 — 스튜디오 촬영(11/26 운영자)
const STUDIO =
  'a professional photo studio: one seamless warm light-grey paper backdrop, soft large key light with gentle fill, ' +
  'subtle floor shadow, nothing else in the frame'

function partner(code: IdealTypeCode, g: 'm' | 'f'): string {
  const t = IDEAL_TYPES[code]
  return `an original, fictional Korean ${g === 'm' ? 'man' : 'woman'} in their late 20s with a "${t.en}" vibe: ${t.faceEn.join(', ').toLowerCase()}. ` +
    `Their makeup matches their "${t.en}" face type: ${IDEAL_MAKEUP[code][g]}`
}

export function buildSidePrompt(code: IdealTypeCode, g: 'm' | 'f', place: SidePlace): string {
  const t = IDEAL_TYPES[code]
  const look = styleById('kpop-idol')
  const own = refPlace(place) === place
  return (
    'Create ONE photorealistic, candid date photo of exactly two people standing side by side, framed from the knees up, ' +
    'both looking at the camera and smiling naturally, shoulders close, friendly and warm. Non-sexual, fully clothed, tasteful, modest outfits (no crop tops, no bare midriff, no cleavage).\n\n' +
    'PERSON 1 = the person in the FIRST image. Keep their identity EXACTLY: same face shape, eyes, eyebrows, nose, mouth, jawline, ' +
    'skin tone and texture, moles, hairstyle and hair colour — unmistakably the same individual, not a prettier or different person. ' +
    'Do not change their age or body type. Give PERSON 1 a stylish date outfit that suits the place. ' +
    `PERSON 1 wears K-pop idol makeup ("${look.subEn}"): ${look.prompt} ` +
    'The makeup must be clearly visible at a glance (like a K-pop idol on stage-off day), not a no-makeup look: dewy glass skin, ' +
    'an obvious glossy pink gradient lip, a soft pink flush and a little shimmer on the eyelids and under-eye. ' +
    "Do NOT change PERSON 1's hair. Keep real skin texture, no plastic smoothing.\n\n" +
    `PERSON 2 = ${partner(code, g)}. ` +
    `PERSON 2 wears ${t.fashionEn.join(', ').toLowerCase()} — take the outfit colours and mood from the SECOND image (an illustration)` +
    (own ? '' : ', adapted naturally to the place') + ', but render everything as a real photograph. ' +
    'PERSON 2 must not resemble any celebrity or real person. PERSON 1 and PERSON 2 have DIFFERENT makeup as described.\n\n' +
    `Place: ${SCENE[place]}. Natural light, 35mm lens, shallow depth of field, realistic colours. ` +
    'Portrait orientation. No text, letters, numbers, logos or watermark.'
  )
}

export function buildSoloPrompt(code: IdealTypeCode, g: 'm' | 'f'): string {
  const t = IDEAL_TYPES[code]
  return (
    'Create ONE photorealistic studio profile photo of exactly one person, framed from the waist up (head and shoulders large in the frame, face clearly the focus), ' +
    'body slightly angled, relaxed posture, looking at the camera with a natural, warm expression. Non-sexual, fully clothed, tasteful, modest outfits (no crop tops, no bare midriff, no cleavage).\n\n' +
    `The person = ${partner(code, g)}. ` +
    `They wear ${t.fashionEn.join(', ').toLowerCase()} — take the outfit, hairstyle, colours and mood from the image (an illustration), ` +
    'but render everything as a real high-end photograph with real skin texture and natural hair. ' +
    'They must not resemble any celebrity or real person.\n\n' +
    `Background: ${STUDIO}. 85mm lens, crisp focus on the eyes, clean editorial colour grading like a magazine profile shoot. ` +
    'Portrait orientation. No text, letters, numbers, logos or watermark.'
  )
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.OPENAI_API_KEY && !env.CF_AIG_TOKEN) return json({ error: 'not_configured' }, 500)
  if (!env.MAKEUP_USAGE) return json({ error: 'guard_unconfigured' }, 503)

  let body: { image?: string; type?: string; g?: string; place?: string; mode?: string; jobId?: string; kind?: string }
  try { body = await request.json() } catch { return json({ error: 'bad_json' }, 400) }
  const code = body.type as IdealTypeCode
  const solo = body.kind === 'solo'
  const place: SidePlace = solo ? 'picnic' : (body.place as SidePlace)
  const g = body.g === 'm' ? 'm' : body.g === 'f' ? 'f' : null
  if ((!solo && !body.image) || !(IDEAL_ORDER as string[]).includes(code) || !(SIDE_PLACES as string[]).includes(place) || !g) return json({ error: 'missing_fields' }, 400)
  if (body.image && body.image.length > 11_000_000) return json({ error: 'too_large' }, 413)
  const tag = solo ? 'solo' : 'side'
  const preview = body.mode !== 'credit'

  let balance: number | undefined
  if (preview) {
    const day = new Date().toISOString().slice(0, 10)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const ipKey = `${tag}:ip:${day}:${ip}`, allKey = `${tag}:all:${day}`
    if (await env.MAKEUP_USAGE.get(ipKey)) return json({ error: 'preview_used' }, 429)
    const all = parseInt((await env.MAKEUP_USAGE.get(allKey)) || '0', 10) || 0
    if (all >= PREVIEW_CAP) return json({ error: 'preview_cap' }, 429)
    // 호출 전에 잡는다 — 실패해도 되돌리지 않음(실패 무한 재시도 우회 차단)
    await env.MAKEUP_USAGE.put(ipKey, '1', { expirationTtl: DAY_SEC })
    await env.MAKEUP_USAGE.put(allKey, String(all + 1), { expirationTtl: DAY_SEC })
  } else {
    const auth = request.headers.get('Authorization') || ''
    if (!auth.startsWith('Bearer ')) return json({ error: 'login_required' }, 401)
    const user = await verifyUser(env, auth.slice(7))
    if (!user) return json({ error: 'invalid_token' }, 401)
    if (!creditsConfigured(env)) return json({ error: 'credits_unconfigured' }, 503)
    const jobId = (body.jobId || '').slice(0, 100)
    if (!jobId) return json({ error: 'missing_job' }, 400)
    const d = await deductCredits(env, user.id, 1, `ideal-${tag}:${jobId}`)
    if (!d.success) {
      if (d.reason === 'insufficient' || d.reason === 'no_credits') return json({ error: 'insufficient_credits', balance: d.balance }, 402)
      return json({ error: 'credit_error' }, 503)
    }
    balance = d.balance
    const attemptKey = `job:${user.id}:ideal-${tag}:${jobId}`
    const attempts = parseInt((await env.MAKEUP_USAGE.get(attemptKey)) || '0', 10) || 0
    if (attempts >= MAX_JOB_ATTEMPTS) return json({ error: 'job_attempts_exceeded' }, 429)
    await env.MAKEUP_USAGE.put(attemptKey, String(attempts + 1), { expirationTtl: JOB_TTL })
  }

  // 참고 그림(같은 사이트 정적 파일)
  let ref: Blob
  try {
    // 운영은 요청 주소의 출처 그대로. dev(vite 셔임)는 request.url 에 포트가 없어 localhost Origin 만 허용한다.
    let origin = new URL(request.url).origin
    const o = request.headers.get('Origin') || ''
    if (/^http:\/\/localhost(:\d+)?$/.test(o) && new URL(request.url).hostname === 'localhost') origin = o
    const r = await fetch(`${origin}/ideal-type/${code}-${g}-${refPlace(place)}.webp`)
    if (!r.ok) throw new Error('ref')
    ref = new Blob([await r.arrayBuffer()], { type: 'image/webp' })
  } catch { return json({ error: 'ref_missing', retryable: true }, 502) }

  const fd = new FormData()
  fd.append('model', 'gpt-image-2')
  if (!solo) fd.append('image[]', dataUrlToBlob(body.image!), 'me.png')
  fd.append('image[]', ref, 'ideal.webp')
  fd.append('prompt', solo ? buildSoloPrompt(code, g) : buildSidePrompt(code, g, place))
  fd.append('size', '1024x1536')
  fd.append('quality', preview ? 'low' : 'medium')
  fd.append('n', '1')

  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const headers: Record<string, string> = {}
  let url = 'https://api.openai.com/v1/images/edits'
  if (base && env.CF_AIG_TOKEN) { url = `${base}/v1/images/edits`; headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}` }
  else if (base) { url = `${base}/v1/images/edits`; headers.Authorization = `Bearer ${env.OPENAI_API_KEY}` }
  else headers.Authorization = `Bearer ${env.OPENAI_API_KEY}`

  try {
    const res = await fetch(url, { method: 'POST', headers, body: fd })
    const text = await res.text()
    if (!res.ok) return json({ error: 'generate_failed', status: res.status, retryable: true, ...(/moderation|safety/i.test(text) ? { moderation: true } : {}) }, 502)
    const b64 = JSON.parse(text)?.data?.[0]?.b64_json
    if (!b64) return json({ error: 'generate_failed', retryable: true }, 502)
    return json({ image: `data:image/png;base64,${b64}`, mode: preview ? 'preview' : 'credit', balance })
  } catch {
    return json({ error: 'generate_failed', retryable: true }, 502)
  }
}
