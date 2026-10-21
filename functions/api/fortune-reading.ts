// ════════════════════════════════════════════════════════════════════
// 관상·사주 정밀 풀이 — AI 글 생성 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 결제: 무료 도구 무료권(tool 풀 — 뷰티 DNA 와 공유, 사용자 선택) 또는 1크레딧. 우선순위 없음(body.pay).
//   무료권 = 생성 전 claim, 실패 시 release. 크레딧 = 생성 전 차감(ref=reading:jobId 멱등),
//   실패 시 환불 없이 같은 jobId 재시도 = 추가 차감 없음(makeup-edit 와 같은 "결제 토큰" 모델).
// 개인정보: 사진·생년월일 원본은 받지 않는다. 이미 계산된 결과(기둥 한자·오행 수·동물상·관상 수치·점수)만.
//   서버·로그에 저장하지 않는다. (개인정보처리방침 3.1.1-2)
// 지시문은 **서버가** 만든다 — 클라이언트가 보낸 글을 그대로 AI 에 넣지 않는다(무료 AI 프록시 악용 방지).
// 2027 월별 흐름은 AI 가 지어내지 않게, 서버가 2027년 월주 × 일간 십성 관계를 계산해 근거로 준다.
// ⚠ 문구 규칙: 재미로 보는 결과 · 질병/수명/사고/손재 등 겁주는 말 금지 · 외모 비하·사람 평가 금지.
// ════════════════════════════════════════════════════════════════════
import { creditsConfigured, deductCredits, getBalance } from './_credits'
import { FREE_LIMITS, claimFreePass, getFreeUsed, resolveTier, verifyUser, type FreeClaim, type UsageStore } from './_freeUsage'
import { ELEMENTS, STEMS_HANJA, BRANCHES_HANJA, controls, generates, generatedBy, monthPillarOf, stemElement, type Element } from '../../src/lib/fortune/saju'

interface Env {
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
  CF_AIG_TOKEN?: string
  MAKEUP_USAGE?: UsageStore
  SUPABASE_SERVICE_ROLE_KEY?: string
  VITE_SUPABASE_URL?: string
}

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })

const LOOK_IDS = ['wealth', 'love', 'marriage', 'reunion', 'career', 'exam', 'health', 'popularity', 'travel'] as const
const ANIMAL_IDS = ['fox', 'cat', 'dog', 'rabbit', 'bear', 'deer', 'tiger', 'wolf', 'dino'] as const
const PALACE_KEYS = ['tilt', 'open', 'gap', 'L', 'A', 'nose', 'lip', 'mouth', 'fore', 'chin', 'brow'] as const
const isEl = (v: unknown): v is Element => typeof v === 'string' && (ELEMENTS as string[]).includes(v)

interface Body {
  lang?: 'ko' | 'en'
  pay?: 'free' | 'credit'
  jobId?: string
  dayStem?: number
  pillars?: { year?: string; month?: string; day?: string; hour?: string }
  counts?: Record<string, number>
  lacking?: string
  animal?: { id?: string; pct?: number }
  second?: { id?: string; pct?: number }
  z?: Record<string, number>
  scores?: { id?: string; score?: number }[]
}

/** 입력 검증 + 정리 — 모르는 값은 버린다 */
function clean(b: Body) {
  const lang = b.lang === 'en' ? 'en' : 'ko'
  const dayStem = Number.isInteger(b.dayStem) && b.dayStem! >= 0 && b.dayStem! <= 9 ? b.dayStem! : undefined
  const hz = /^[一-鿿]{2}$/
  const pillars = b.pillars && dayStem != null ? {
    year: hz.test(b.pillars.year || '') ? b.pillars.year : undefined,
    month: hz.test(b.pillars.month || '') ? b.pillars.month : undefined,
    day: hz.test(b.pillars.day || '') ? b.pillars.day : undefined,
    hour: hz.test(b.pillars.hour || '') ? b.pillars.hour : undefined,
  } : undefined
  const counts = b.counts && ELEMENTS.every((e) => Number.isInteger(b.counts![e]) && b.counts![e] >= 0 && b.counts![e] <= 8)
    ? Object.fromEntries(ELEMENTS.map((e) => [e, b.counts![e]])) as Record<Element, number> : undefined
  const lacking = isEl(b.lacking) ? b.lacking : undefined
  const okAnimal = (a?: { id?: string; pct?: number }) =>
    a && (ANIMAL_IDS as readonly string[]).includes(a.id || '') && Number.isFinite(a.pct) ? { id: a.id!, pct: Math.round(a.pct!) } : undefined
  const z = b.z ? Object.fromEntries(PALACE_KEYS.filter((k) => Number.isFinite(b.z![k])).map((k) => [k, Math.max(-3, Math.min(3, Math.round(b.z![k] * 10) / 10))])) : undefined
  const scores = (b.scores || []).filter((s) => (LOOK_IDS as readonly string[]).includes(s.id || '') && Number.isFinite(s.score))
    .slice(0, 9).map((s) => ({ id: s.id!, score: Math.round(s.score!) }))
  return { lang, dayStem, pillars, counts, lacking, animal: okAnimal(b.animal), second: okAnimal(b.second), z: z && Object.keys(z).length ? z : undefined, scores }
}

/**
 * 관상 6궁 — 이름·위치는 서버가 고정한다(샘플 1차에서 AI 가 "재백궁=눈", 없는 "부귀궁"을 지어냈다).
 * 수치(z)는 말로 바꿔 넘긴다(숫자를 주면 "길고 짧은" 같은 모순 문장이 나왔다).
 */
const PALACES: { ko: string; en: string; areaKo: string; areaEn: string; key: (typeof PALACE_KEYS)[number]; hiKo: string; loKo: string; hiEn: string; loEn: string }[] = [
  { ko: '관록궁', en: 'Career palace', areaKo: '이마', areaEn: 'forehead', key: 'fore', hiKo: '이마가 시원하게 높은 편', loKo: '이마가 아담한 편', hiEn: 'a tall, open forehead', loEn: 'a compact forehead' },
  { ko: '명궁', en: 'Life palace', areaKo: '미간', areaEn: 'space between the brows', key: 'brow', hiKo: '미간이 넓은 편', loKo: '미간이 좁은 편', hiEn: 'wide space between the brows', loEn: 'close-set brows' },
  { ko: '남녀궁', en: 'Love palace', areaKo: '눈 밑·눈', areaEn: 'under-eye & eyes', key: 'open', hiKo: '눈이 크고 둥근 편', loKo: '눈이 가늘고 길쭉한 편', hiEn: 'large, round eyes', loEn: 'narrow, elongated eyes' },
  { ko: '처첩궁', en: 'Spouse palace', areaKo: '눈꼬리', areaEn: 'outer eye corners', key: 'tilt', hiKo: '눈꼬리가 올라간 편', loKo: '눈꼬리가 내려간 편', hiEn: 'lifted outer eye corners', loEn: 'gently downturned eye corners' },
  { ko: '재백궁', en: 'Wealth palace', areaKo: '코', areaEn: 'nose', key: 'nose', hiKo: '콧방울이 넉넉한 편', loKo: '콧방울이 섬세한 편', hiEn: 'generous nose wings', loEn: 'a delicate nose' },
  { ko: '노복궁', en: 'Friendship palace', areaKo: '턱·입', areaEn: 'chin & mouth', key: 'mouth', hiKo: '입이 시원하고 넓은 편', loKo: '입이 아담한 편', hiEn: 'a wide, generous mouth', loEn: 'a petite mouth' },
]
const describe = (z: number, hi: string, lo: string, mid: string) => (z >= 0.5 ? hi : z <= -0.5 ? lo : mid)

const REL_KO: Record<string, string> = { same: '비겁(친구·경쟁)', output: '식상(표현·매력)', wealth: '재성(재물)', power: '관성(인정·직장)', resource: '인성(배움·도움)' }
function rel(me: Element, other: Element) {
  if (other === me) return 'same'
  if (other === generates(me)) return 'output'
  if (other === controls(me)) return 'wealth'
  if (other === generatedBy(me)) return 'resource'
  return 'power'
}

function buildPrompt(c: ReturnType<typeof clean>) {
  const en = c.lang === 'en'
  const me = c.dayStem != null ? stemElement(c.dayStem) : undefined
  const months = me ? Array.from({ length: 12 }, (_, i) => {
    const p = monthPillarOf(2027, i + 1)
    return `${i + 1}월 ${STEMS_HANJA[p.stem]}${BRANCHES_HANJA[p.branch]} — ${REL_KO[rel(me, stemElement(p.stem))]}`
  }) : []
  const facts = [
    c.animal && `동물상: ${c.animal.id} ${c.animal.pct}%${c.second ? `, 2위 ${c.second.id} ${c.second.pct}%` : ''}`,
    c.z && `관상 6궁 측정(이 순서·이 이름 그대로, 다른 궁을 지어내지 마라):\n${PALACES.map((p, i) => `${i + 1}. ${en ? p.en : p.ko} (${en ? p.areaEn : p.areaKo}) — ${describe(c.z![p.key] ?? 0, en ? p.hiEn : p.hiKo, en ? p.loEn : p.loKo, en ? 'about average' : '평균에 가까운 편')}`).join('\n')}`,
    c.pillars && `사주 기둥: 연 ${c.pillars.year ?? '?'} · 월 ${c.pillars.month ?? '?'} · 일 ${c.pillars.day ?? '?'} · 시 ${c.pillars.hour ?? '모름'}`,
    me && `일간 오행: ${me}`,
    c.counts && `오행 개수: ${ELEMENTS.map((e) => `${e} ${c.counts![e]}`).join(', ')}`,
    c.lacking && `가장 부족한 오행: ${c.lacking}`,
    c.scores.length && `운 점수(높은 순): ${c.scores.map((s) => `${s.id} ${s.score}`).join(', ')}`,
    months.length && `2027년(정미년) 월주와 일간의 십성 관계(이걸 근거로 월별 흐름을 써라):\n${months.join('\n')}`,
  ].filter(Boolean).join('\n')

  const system = (en
    ? 'You are a warm, witty Korean face-reading (gwansang) and saju (four pillars) storyteller AND a professional K-beauty makeup artist. Write in natural, friendly English.'
    : '너는 다정하고 재치 있는 관상·사주 풀이가이자 K-뷰티 메이크업 아티스트다. 자연스럽고 친근한 한국어(해요체)로 쓴다.') +
    ' Rules: (1) This is for fun — never claim scientific accuracy. (2) NEVER mention illness, lifespan, death, accidents, financial loss or misfortune; frame every point as a strength or as "this makes it even better". ' +
    '(3) Never judge appearance negatively or rate attractiveness or trustworthiness. (4) Ground every statement in the given data (face numbers, pillars, element counts, month relations) — do not invent other data. ' +
    '(5) Makeup advice must be concrete (placement, texture, shade family) and must not promise skin-care effects. No brand names. (6) Output ONLY valid JSON matching the schema.'

  const schema = `{
  "summary": "총평 3~4문장",
  "face": [ "2문장" ]  // 관상 6궁 측정이 있으면 그 순서대로 정확히 6개. 궁 이름은 쓰지 말고 바로 내용으로. 첫 문장=측정 표현을 근거로 한 장점(‘평균’이라는 단어 금지 — ‘균형 잡힌’처럼), 둘째 문장=그 궁을 살리는 메이크업 한마디. 측정 없으면 빈 배열
  "elements": "오행 해석 3~4문장(일간 성향 + 부족한 기운 채우는 법)",  // 사주 데이터 없으면 ""
  "fortunes": [ {"id": "운 id", "reading": "2문장", "makeup": "이 운을 올리는 메이크업 1~2문장"} ]  // TOP3 + 가장 낮은 운 1개 = 4개
  "year2027": [ {"month": 1, "theme": "한 줄(15자 안팎)"} ]  // 12개, 사주 데이터 없으면 빈 배열
  "makeupPlan": {"base": "", "eyes": "", "cheeks": "", "lips": "", "accent": "부족한 오행 포인트 색 활용"},
  "products": ["제품 종류 + 색감 4~5개 (브랜드명 없이, 예: 샴페인 골드 펄 하이라이터)"]
}`
  const user = (en ? 'Write the full reading in English. ' : '') + `데이터:\n${facts}\n\n출력 JSON 형식:\n${schema}`
  return { system, user }
}

async function callLLM(env: Env, system: string, user: string): Promise<unknown | null> {
  const body = JSON.stringify({
    model: 'gpt-4.1',
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    temperature: 0.8,
    max_tokens: 2500,
    response_format: { type: 'json_object' },
  })
  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const tries: { url: string; headers: Record<string, string> }[] = []
  if (base && env.CF_AIG_TOKEN) tries.push({ url: `${base}/v1/chat/completions`, headers: { 'cf-aig-authorization': `Bearer ${env.CF_AIG_TOKEN}` } })
  if (base && env.OPENAI_API_KEY) tries.push({ url: `${base}/v1/chat/completions`, headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` } })
  if (env.OPENAI_API_KEY) tries.push({ url: 'https://api.openai.com/v1/chat/completions', headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` } })
  for (const t of tries) {
    try {
      const res = await fetch(t.url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...t.headers }, body })
      if (!res.ok) continue
      const j = (await res.json()) as { choices?: { message?: { content?: string } }[] }
      const content = j.choices?.[0]?.message?.content
      if (content) return JSON.parse(content)
    } catch { /* 다음 경로 */ }
  }
  return null
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.OPENAI_API_KEY && !env.CF_AIG_TOKEN) return json({ error: 'not_configured' }, 500)
  let body: Body
  try { body = (await request.json()) as Body } catch { return json({ error: 'bad_json' }, 400) }
  const c = clean(body)
  if (!c.scores.length || (!c.z && !c.counts)) return json({ error: 'missing_fields' }, 400)

  const authHeader = request.headers.get('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'login_required' }, 401)
  const user = await verifyUser(env, authHeader.slice(7))
  if (!user) return json({ error: 'invalid_token' }, 401)

  const used = await getFreeUsed(env, 'tool', user)
  const picked = await resolveTier(body.pay, used, FREE_LIMITS.tool, async () =>
    creditsConfigured(env) && (await getBalance(env, user.id).catch(() => 0)) > 0)
  if (picked === 'free_pass_used') return json({ error: 'free_pass_used', freeLeft: 0 }, 409)
  if (picked === 'pay_required') return json({ error: 'pay_required' }, 409)

  const jobId = (body.jobId || '').slice(0, 100) || crypto.randomUUID()
  let claim: FreeClaim | null = null
  let balance: number | undefined
  if (picked === 'free') {
    claim = await claimFreePass(env, 'tool', user, 'reading', `reading:${jobId}`)
    if (!claim.ok) return claim.reason === 'used' ? json({ error: 'free_pass_used', freeLeft: 0 }, 409) : json({ error: 'free_pass_error' }, 503)
  } else {
    if (!creditsConfigured(env)) return json({ error: 'credits_unconfigured' }, 503)
    const d = await deductCredits(env, user.id, 1, `reading:${jobId}`)
    if (!d.success) {
      if (d.reason === 'insufficient' || d.reason === 'no_credits') return json({ error: 'insufficient_credits', balance: d.balance }, 402)
      return json({ error: 'credit_error' }, 503)
    }
    balance = d.balance
  }

  const { system, user: userMsg } = buildPrompt(c)
  const reading = await callLLM(env, system, userMsg)
  if (!reading || typeof reading !== 'object') {
    if (claim?.ok) await claim.release()
    return json({ error: 'llm_failed', retryable: true }, 502)
  }
  if (claim?.ok) await claim.commit()
  // 궁 이름·위치는 서버 고정값을 붙인다(AI 는 문장만)
  const r = reading as { face?: unknown }
  const lines = Array.isArray(r.face) ? (r.face as unknown[]) : []
  r.face = c.z ? PALACES.map((p, i) => {
    const v = lines[i]
    const text = typeof v === 'string' ? v : (v as { reading?: string } | undefined)?.reading ?? ''
    return { palace: c.lang === 'en' ? p.en : p.ko, area: c.lang === 'en' ? p.areaEn : p.areaKo, reading: text }
  }).filter((f) => f.reading) : []
  return json({
    reading,
    tier: picked,
    balance,
    freeLeft: picked === 'free' ? Math.max(0, FREE_LIMITS.tool - used - 1) : Math.max(0, FREE_LIMITS.tool - used),
  })
}
