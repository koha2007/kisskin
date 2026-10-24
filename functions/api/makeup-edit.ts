// ════════════════════════════════════════════════════════════════════
// AI 메이크업 인페인팅 Worker (FREE_PIVOT_PLAN P1-3)
// ────────────────────────────────────────────────────────────────────
// gpt-image-2 /v1/images/edits 호출 (Cloudflare AI Gateway 경유, cf-aig-authorization
// 키 주입 방식 유지).
//   • whole-face(옛 9룩 방식, 2026-07-05 복원): mask 없이 사진 전체를 프롬프트로
//     재생성한다. 얼굴 보존은 프롬프트 FACE_LOCK 프리앰블에 위임(얼굴 변형 리스크 감수).
//   • 부분 편집(Stage 2, MediaPipe 마스크): mask 가 오면 그 영역만 재생성하고
//     "마스크 밖 원본 합성"·glow 레이어는 클라이언트가 처리한다. (코드 보존 — 재사용 대비)
//
// 비용 가드 (fail-closed): 계정(user_id·이메일)당 무료 N회(_freeUsage.ts). 저장소(env.MAKEUP_USAGE,
// KV류)가 없으면 OpenAI 를 호출하지 않고 503 → 무방비 과금 노출을 원천 차단.
//
// 크레딧 차감 (P1-5 3단계, "결제 토큰" 모델):
//   무료 소진 → 로그인 필수 → 차감(ref=jobId 멱등) 성공해야 OpenAI 호출.
//   • 차감 먼저 → "차감 안 됨보다 생성 안 됨"(이중과금 방지 우선).
//   • OpenAI 일시 실패 시 환불 안 함 → 같은 jobId 재시도 = 멱등(재청구 X) + 무료 재호출.
//   • 잔액 부족 → 402, OpenAI 호출 안 함.
//   service_role 키로만 차감(클라이언트 절대 불가). 토큰 검증은 /auth/v1/user.
//
// 설정: gpt-image-2, medium quality. (input_fidelity 미지원 모델이라 전송 안 함.)
// ════════════════════════════════════════════════════════════════════
import { creditsConfigured, deductCredits, getBalance } from './_credits'
import { FREE_LIMITS, claimFreePass, getFreeUsed, resolveTier, verifyUser, type FreeClaim, type UsageStore } from './_freeUsage'
interface Env {
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
  CF_AIG_TOKEN?: string
  /** 프로덕션: Cloudflare KV 바인딩 / dev: 파일백드 셔임(vite.config). 없으면 fail-closed. */
  MAKEUP_USAGE?: UsageStore
  // ── 크레딧(P1-5 3단계) — _credits.ts/CreditsEnv 와 호환 ──
  SUPABASE_SERVICE_ROLE_KEY?: string
  VITE_SUPABASE_URL?: string
}

// 계정당 무료 장수 — 가입 무료권 2장 = 2026 메이크업 1장 + 럭키 메이크업 1장(_freeUsage.ts, 풀이 따로).
// 9룩 컬렉션·럭키 9장 묶음은 항상 크레딧.

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })

function dataUrlToBlob(dataUrl: string, type = 'image/png'): Blob {
  const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type })
}

interface Body {
  image?: string   // dataURL(png) — fitToSupported 결과
  mask?: string    // dataURL(png) — 편집부=투명(toOpenAIMask)
  prompt?: string
  styleId?: string
  fingerprint?: string
  jobId?: string   // 차감 멱등 키(생성 작업 id). 같은 작업 재시도 시 이중차감 방지.
  pay?: 'free' | 'credit'   // 사용자가 고른 결제수단(가입 무료권/크레딧). 미지정=예전 클라이언트 호환
  size?: string    // 'auto'(기본, 원본 비율 유지) | '1024x1024' | '1536x1024' | '1024x1536'
  // ── 선택 오버라이드(미지정 시 기존 기본값 유지 → 프로덕션 동작 불변) ──
  inputFidelity?: string // 'high'(기본) | 'low'. low = 마스크영역 더 자유롭게 재생성(메이크업 강하게)
  quality?: string       // 'medium'(기본) | 'low' | 'high'
  /** 9룩 컬렉션 생성 — 무료 1회를 건드리지 않고 항상 크레딧 차감(_packs.ts collection 참고) */
  collection?: boolean
  /** 무료권 풀 — 'lucky' = 럭키 메이크업(따로 1장). 미지정 = 2026 메이크업(makeup 풀) */
  pool?: 'makeup' | 'lucky'
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.OPENAI_API_KEY && !env.CF_AIG_TOKEN) return json({ error: 'not_configured' }, 500)

  let body: Body
  try { body = (await request.json()) as Body } catch { return json({ error: 'bad_json' }, 400) }
  const { image, mask, prompt } = body
  // whole-face 복원: mask 는 선택. 없으면 사진 전체를 편집한다.
  if (!image || !prompt) return json({ error: 'missing_fields' }, 400)

  // ── 로그인 필수 (무료 1회도 로그인 게이트) ──
  // 익명 무료는 IP·지문 로테이션(모바일 셀룰러/인앱 웹뷰 localStorage 초기화)으로
  // 무한 우회가 가능했다. 그래서 무료 판정 신원을 user_id 로 고정한다. 진단 도구는
  // 무로그인 유지, 생성당 실제 비용(~$0.085)이 나가는 AI 메이크업만 로그인 뒤로 게이트.
  const authHeader = request.headers.get('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'login_required', message: '로그인하면 AI 메이크업을 무료 1회 체험할 수 있어요.' }, 401)
  }
  const user = await verifyUser(env, authHeader.slice(7))
  if (!user) {
    return json({ error: 'invalid_token', message: '로그인이 만료됐어요. 다시 로그인해 주세요.' }, 401)
  }

  // ── 비용 가드 (fail-closed) ──
  if (!env.MAKEUP_USAGE) {
    // 저장소 없으면 무료 판정 불가 → OpenAI 호출 안 함(과금 노출 차단).
    return json({ error: 'guard_unconfigured', message: '사용량 저장소가 설정되지 않았습니다.' }, 503)
  }
  // 무료 판정 신원 = user_id (계정당 무료 FREE_LIMIT회). IP·지문을 섞지 않으므로
  // 셀룰러 IP 로테이션·웹뷰 저장소 초기화로 무료를 리셋하는 우회가 불가능하다.
  // 탈퇴 후 같은 이메일 재가입도 소진 상태 유지(이메일 해시 키 병행).
  const userId = user.id
  const pool = body.pool === 'lucky' ? 'lucky' : 'makeup'
  const FREE_LIMIT = FREE_LIMITS[pool]
  const used = await getFreeUsed(env, pool, user)

  // ── 결제 경로 판정: 사용자가 고른 pay 그대로(_freeUsage.resolveTier) ──
  // 무료권/크레딧은 사용자가 고른다(body.pay) — 우선순위 없음. 9룩 컬렉션은 항상 크레딧.
  const picked = body.collection ? 'credit' : await resolveTier(body.pay, used, FREE_LIMIT, async () =>
    creditsConfigured(env) && (await getBalance(env, user.id).catch(() => 0)) > 0)
  if (picked === 'free_pass_used') {
    return json({ error: 'free_pass_used', message: '무료권을 이미 사용했어요. 크레딧으로 만들 수 있어요.', freeLeft: 0 }, 409)
  }
  if (picked === 'pay_required') {
    return json({ error: 'pay_required', message: '새로고침 후 무료권과 크레딧 중 무엇을 쓸지 골라 주세요.' }, 409)
  }
  const tier: 'free' | 'credit' = picked
  let creditBalance = 0

  // 무료권: 생성 "전"에 장부에서 원자적으로 잡는다(동시 두 번 눌러도 한 장). 실패하면 아래에서 풀어 준다.
  let claim: FreeClaim | null = null
  if (tier === 'free') {
    claim = await claimFreePass(env, pool, user, pool, (body.jobId || '').slice(0, 100) || `${user.id}:free:${crypto.randomUUID()}`)
    if (!claim.ok) {
      return claim.reason === 'used'
        ? json({ error: 'free_pass_used', message: '무료권을 이미 사용했어요. 크레딧으로 만들 수 있어요.', freeLeft: 0 }, 409)
        : json({ error: 'free_pass_error', message: '무료권 확인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.' }, 503)
    }
  }
  const releaseFree = async (r: Response) => { if (claim?.ok) await claim.release(); return r }

  if (tier === 'credit') {
    // 크레딧 시스템 미설정 → fail-safe(무료로 내주지 않음)
    if (!creditsConfigured(env)) {
      return json({ error: 'credits_unconfigured', message: '크레딧 서비스가 아직 준비 중이에요.' }, 503)
    }

    // 차감 먼저(ref=jobId 멱등). OpenAI 호출 전에 결제 확정.
    // ⚠ jobId 가 없으면 ref 는 반드시 매 요청 고유해야 한다. 고정 문자열(예전의
    //    `${userId}:nojob`)을 쓰면 deduct_credits 의 ref 멱등성(0002 마이그레이션)에
    //    걸려 첫 차감 이후 모든 no-job 요청이 "이미 결제됨"으로 통과 → 무한 무료 생성.
    const jobId = (body.jobId || '').slice(0, 100)
    const ref = jobId || `${userId}:nojob:${crypto.randomUUID()}`
    const deduct = await deductCredits(env, userId, 1, ref)
    if (!deduct.success) {
      if (deduct.reason === 'insufficient' || deduct.reason === 'no_credits') {
        return json({ error: 'insufficient_credits', message: '크레딧이 부족해요. 충전 후 다시 시도해 주세요.', balance: deduct.balance }, 402)
      }
      // rpc 오류 등 모호 → fail-safe: 생성 안 함(이중과금/무료제공 둘 다 방지)
      return json({ error: 'credit_error', message: '크레딧 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.' }, 503)
    }
    creditBalance = deduct.balance
  }

  // ── OpenAI images/edits (AI Gateway 우선) ──
  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const fd = new FormData()
  fd.append('model', 'gpt-image-2')
  fd.append('image', dataUrlToBlob(image), 'image.png')
  // mask 있으면 부분 편집(Stage 2), 없으면 whole-face 편집(옛 9룩 방식).
  if (mask) fd.append('mask', dataUrlToBlob(mask), 'mask.png')
  fd.append('prompt', prompt)
  // size='auto' → 출력이 입력 사진의 방향/비율을 따른다(운영자 요구: 원본 비율 유지).
  // 명시적 WxH 도 허용, 그 외/누락은 auto 로 폴백.
  fd.append('size', body.size === 'auto' || (body.size && /^\d+x\d+$/.test(body.size)) ? body.size : 'auto')
  fd.append('quality', ['low', 'medium', 'high'].includes(body.quality || '') ? body.quality! : 'medium')
  // ⚠️ gpt-image-2 는 input_fidelity 파라미터를 지원하지 않는다(보내면 400
  //    invalid_input_fidelity_model → 생성 전부 실패). 그래서 넣지 않는다.
  //    얼굴 보존은 프롬프트 FACE_LOCK 에 의존한다(테스트상 gpt-image-2 는 fidelity
  //    없이도 원본 얼굴을 잘 보존함).
  fd.append('n', '1')

  let url: string
  const headers: Record<string, string> = {}
  if (base && env.CF_AIG_TOKEN) {
    url = `${base}/v1/images/edits`
    headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}`
  } else if (base) {
    url = `${base}/v1/images/edits`
    headers['Authorization'] = `Bearer ${env.OPENAI_API_KEY}`
  } else {
    url = 'https://api.openai.com/v1/images/edits'
    headers['Authorization'] = `Bearer ${env.OPENAI_API_KEY}`
  }

  // OpenAI 실패 = retryable. credit tier 면 차감은 유지(결제 토큰) → 같은 jobId
  // 재시도 시 멱등(재청구 X) + OpenAI 무료 재호출. free tier 는 KV 미증가(아래).
  let res: Response
  try {
    res = await fetch(url, { method: 'POST', headers, body: fd })
  } catch (e) {
    return releaseFree(json({ error: 'upstream_fetch', message: e instanceof Error ? e.message : String(e), retryable: true }, 502))
  }
  const text = await res.text()
  if (!res.ok) return releaseFree(json({ error: 'openai', status: res.status, detail: text.slice(0, 300), retryable: true }, 502))

  let b64: string | undefined
  try { b64 = JSON.parse(text)?.data?.[0]?.b64_json } catch { return releaseFree(json({ error: 'bad_openai_json', retryable: true }, 502)) }
  if (!b64) return releaseFree(json({ error: 'no_image', retryable: true }, 502))

  const image_out = `data:image/png;base64,${b64}`

  if (tier === 'free') {
    // 무료: 성공 시에만 사용량 증가(실패 호출은 무료 소진 안 시킴).
    if (claim?.ok) await claim.commit()
    return json({ image: image_out, tier: 'free', used: used + 1, free: FREE_LIMIT, freeLeft: Math.max(0, FREE_LIMIT - used - 1) })
  }

  // 크레딧: 이미 차감 완료(KV 무관). 남은 잔액 반환(UI 표시용).
  return json({ image: image_out, tier: 'credit', balance: creditBalance, freeLeft: Math.max(0, FREE_LIMIT - used) })
}
