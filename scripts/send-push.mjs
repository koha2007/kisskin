// 앱 푸시 발송기 — PUSH_TOKENS KV 를 순회하며 Expo Push API 로 알림을 쏜다.
//
// 흐름: Cloudflare KV(토큰 저장소) → 기기 언어별 문구 선택 → Expo Push API(100개씩 배치)
//       → DeviceNotRegistered 응답 토큰은 KV 에서 자동 삭제(죽은 기기 정리).
//
// 실행(GitHub Actions send-push.yml 이 호출):
//   CLOUDFLARE_API_TOKEN=... node scripts/send-push.mjs
//
// 환경변수:
//   CLOUDFLARE_API_TOKEN  (필수) Workers KV Storage:Edit 권한 토큰
//   TITLE_KO / BODY_KO    한국어 기기용 제목/내용
//   TITLE_EN / BODY_EN    영어 기기용 제목/내용 (없으면 KO 문구로 폴백, KO 도 없으면 그 언어는 스킵)
//   PUSH_URL              알림 탭 시 이동할 URL (기본: https://kissinskin.net/)
//   DRY_RUN               '1'이면 실제 발송 없이 대상만 출력
//
// 저장 형태(register-push-token.ts 와 동일): key = `token:<ExponentPushToken>`
//   value = JSON { platform, lang, updatedAt }

const KV_NAMESPACE_ID = 'f1e845e643b3461e959ad8a3ef827659' // wrangler.toml PUSH_TOKENS 와 동일해야 함
const CF_API = 'https://api.cloudflare.com/client/v4'
const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send'

const token = process.env.CLOUDFLARE_API_TOKEN
if (!token) {
  console.error('CLOUDFLARE_API_TOKEN 이 없습니다. 저장소 시크릿을 확인하세요.')
  process.exit(1)
}

const COPY = {
  ko: { title: process.env.TITLE_KO?.trim(), body: process.env.BODY_KO?.trim() },
  en: { title: process.env.TITLE_EN?.trim(), body: process.env.BODY_EN?.trim() },
}
// EN 문구가 비면 KO 로 폴백 (그 반대도) — 한쪽만 입력해도 전체 발송되게
if (!COPY.en.title && COPY.ko.title) COPY.en = COPY.ko
if (!COPY.ko.title && COPY.en.title) COPY.ko = COPY.en
if (!COPY.ko.title && !COPY.en.title) {
  console.error('TITLE_KO 또는 TITLE_EN 중 하나는 필수입니다.')
  process.exit(1)
}

const PUSH_URL = process.env.PUSH_URL?.trim() || 'https://kissinskin.net/'
const DRY_RUN = process.env.DRY_RUN === '1'

async function cf(path, init = {}) {
  const res = await fetch(`${CF_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) },
  })
  if (!res.ok) throw new Error(`Cloudflare API ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return res
}

// 토큰이 접근 가능한 계정에서 KV 네임스페이스가 실재하는 계정을 찾는다
async function findAccountId() {
  const { result: accounts } = await (await cf('/accounts')).json()
  if (!accounts?.length) throw new Error('API 토큰으로 접근 가능한 계정이 없습니다.')
  for (const acct of accounts) {
    const res = await fetch(`${CF_API}/accounts/${acct.id}/storage/kv/namespaces/${KV_NAMESPACE_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) return acct.id
  }
  throw new Error(`어느 계정에서도 KV 네임스페이스 ${KV_NAMESPACE_ID} 를 찾지 못했습니다.`)
}

// KV 의 token:* 키 전체 나열 (cursor 페이지네이션)
async function listTokenKeys(accountId) {
  const keys = []
  let cursor = ''
  do {
    const qs = new URLSearchParams({ prefix: 'token:', limit: '1000' })
    if (cursor) qs.set('cursor', cursor)
    const data = await (
      await cf(`/accounts/${accountId}/storage/kv/namespaces/${KV_NAMESPACE_ID}/keys?${qs}`)
    ).json()
    keys.push(...data.result.map((k) => k.name))
    cursor = data.result_info?.cursor || ''
  } while (cursor)
  return keys
}

async function readValue(accountId, key) {
  try {
    const res = await cf(
      `/accounts/${accountId}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`
    )
    return JSON.parse(await res.text())
  } catch {
    return {} // 값이 깨져 있어도 발송은 진행 (lang 만 en 폴백)
  }
}

async function deleteKey(accountId, key) {
  try {
    await cf(
      `/accounts/${accountId}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`,
      { method: 'DELETE' }
    )
    console.log(`  🧹 죽은 토큰 삭제: ${key.slice(0, 40)}...`)
  } catch (e) {
    console.warn(`  삭제 실패(무시): ${e.message}`)
  }
}

// 배열을 n개씩 자른다 (Expo Push API 는 요청당 최대 100개)
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

const accountId = await findAccountId()
console.log(`계정: ${accountId}`)

const keys = await listTokenKeys(accountId)
console.log(`등록 토큰: ${keys.length}개`)
if (keys.length === 0) {
  console.log('발송 대상이 없습니다. (앱 설치 후 알림 권한을 허용한 기기가 아직 없음)')
  process.exit(0)
}

// 값(언어/플랫폼)을 읽어 메시지 구성 — 동시 10개씩
const targets = []
for (const group of chunk(keys, 10)) {
  const metas = await Promise.all(group.map((k) => readValue(accountId, k)))
  group.forEach((key, i) => {
    const lang = metas[i].lang === 'ko' ? 'ko' : 'en'
    targets.push({ key, pushToken: key.slice('token:'.length), lang, platform: metas[i].platform || '?' })
  })
}

const byLang = { ko: targets.filter((t) => t.lang === 'ko').length, en: targets.filter((t) => t.lang === 'en').length }
console.log(`대상: ko ${byLang.ko}대 / en ${byLang.en}대 · 이동 URL: ${PUSH_URL}`)
console.log(`문구 ko: "${COPY.ko.title}" / en: "${COPY.en.title}"`)

if (DRY_RUN) {
  console.log('DRY_RUN=1 — 실제 발송 없이 종료합니다.')
  process.exit(0)
}

let sent = 0
let dead = 0
let failed = 0

for (const batch of chunk(targets, 100)) {
  const messages = batch.map((t) => ({
    to: t.pushToken,
    title: COPY[t.lang].title,
    body: COPY[t.lang].body || '',
    data: { url: PUSH_URL },
    sound: 'default',
    channelId: 'default', // App.tsx 에서 만든 안드로이드 채널명과 동일해야 알림이 뜬다
  }))

  const res = await fetch(EXPO_PUSH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  })
  if (!res.ok) {
    console.error(`Expo Push API ${res.status}: ${(await res.text()).slice(0, 300)}`)
    failed += batch.length
    continue
  }

  const { data: tickets = [] } = await res.json()
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i]
    if (ticket.status === 'ok') {
      sent++
    } else {
      failed++
      console.warn(`  ✗ ${batch[i].pushToken.slice(0, 30)}... → ${ticket.message || ticket.details?.error}`)
      // 앱 삭제 등으로 죽은 토큰은 KV 에서 정리해 다음 발송을 가볍게
      if (ticket.details?.error === 'DeviceNotRegistered') {
        dead++
        await deleteKey(accountId, batch[i].key)
      }
    }
  }
}

console.log(`\n완료: 발송 ${sent} · 실패 ${failed} (죽은 토큰 정리 ${dead})`)
if (sent === 0 && failed > 0) process.exit(1)
