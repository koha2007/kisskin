// /api/subscribe 분기 테스트 + 결과 메일 조판 미리보기.
//
// 왜 이게 있나(2026-09-22): 이 엔드포인트 하나가 ①구독 신청 ②구독 확인 ③**결과 메일**
// 세 가지를 갈라서 처리한다. 분기를 잘못 타면 "결과를 보내드릴게요" 라고 해놓고 확인 메일만
// 나가거나(거짓말), 이미 구독 중인 사람에게 결과가 영영 안 간다. 라이브에서 메일을 실제로
// 쏴 보며 확인할 수 있는 일이 아니라, Supabase 와 Resend 를 stub 으로 갈아끼우고 잰다.
//
//   node scripts/test-subscribe.mjs              분기 테스트
//   node scripts/test-subscribe.mjs --preview .  결과 메일 HTML 3종을 그 폴더에 쓴다
//
// ⚠ 실제 메일은 한 통도 나가지 않는다(fetch 를 통째로 가로챈다).

import { build } from 'esbuild'
import { writeFileSync } from 'node:fs'

const r = await build({
  entryPoints: ['functions/api/subscribe.ts'],
  bundle: true,
  format: 'esm',
  write: false,
  platform: 'neutral',
})
const mod = await import('data:text/javascript;base64,' + Buffer.from(r.outputFiles[0].text).toString('base64'))

const env = {
  VITE_SUPABASE_URL: 'https://db.test',
  SUPABASE_SERVICE_ROLE_KEY: 'k',
  RESEND_API_KEY: 'rk',
  EMAIL_OPTOUT_SECRET: 's3cret',
}

const RESULT = {
  tool: 'face-shape',
  code: 'oval',
  label: '얼굴형',
  name: '계란형',
  tagline: '가장 균형 잡힌 이상적 얼굴형',
  emoji: '🥚',
  path: '/tools/face-shape/oval/',
  image: '/mood/fs-oval.webp',
  facts: ['얼굴 세로 길이가 가로의 약 1.5배', '이마 > 광대 > 턱 순으로 자연스럽게 좁아짐'],
}

let failed = 0
const ok = (label, cond, extra = '') => {
  if (!cond) failed++
  console.log(`${cond ? '✅' : '❌'} ${label}${extra ? ' — ' + extra : ''}`)
}
const ago = (ms) => new Date(Date.now() - ms).toISOString()

/** Supabase(REST) 와 Resend 를 가로챈다. row = email_subscriber 에 이미 있는 행. */
function stub(row) {
  const calls = { writes: [], mail: null }
  globalThis.fetch = async (url, init = {}) => {
    if (String(url).startsWith('https://api.resend.com')) {
      calls.mail = JSON.parse(init.body)
      return new Response('{"id":"1"}', { status: 200 })
    }
    if (!init.method || init.method === 'GET') {
      return new Response(JSON.stringify(row ? [row] : []), { status: 200 })
    }
    calls.writes.push({ method: init.method, body: init.body && JSON.parse(init.body) })
    return new Response(null, { status: 204 })
  }
  return calls
}

const post = (body) =>
  mod.onRequestPost({
    request: new Request('https://kissinskin.net/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    env,
  })

// ── 1. 페이로드 검증 — 이 메일은 우리 도메인에서 나간다 ────────────────
for (const [label, raw] of [
  ['외부 링크', { tool: 'x', code: 'a', name: 'n', path: 'https://evil.com/' }],
  ['스킴 상대 경로', { tool: 'x', code: 'a', name: 'n', path: '//evil.com/tools/x/' }],
  ['경로 탈출', { tool: '../../etc', code: 'a', name: 'n', path: '/tools/x/' }],
  ['이름 없음', { tool: 'x', code: 'a', name: '', path: '/tools/x/' }],
]) {
  ok(`거부: ${label}`, mod.sanitizeResult(raw) === null)
}
{
  const injected = mod.sanitizeResult({
    tool: 'face-shape',
    code: 'oval',
    label: '<script>x</script>',
    name: '"><img src=x onerror=alert(1)>',
    tagline: 'a',
    emoji: '🥚',
    path: '/tools/face-shape/oval/',
  })
  const html = mod.resultMail('ko', injected, null, null).html
  // 엔티티 안에 남은 'script' 글자는 무해하다 — **태그가 생겼는지**로 판정한다.
  const tags = (html.match(/<(script|img|iframe)\b/gi) || [])
  ok('주입 문자열은 태그가 되지 않는다', tags.length === 0, tags.join(','))
}

// ── 2. 분기 ────────────────────────────────────────────────────────
{
  const c = stub(null)
  const d = await (await post({ email: 'new@x.com', locale: 'ko', source: 'face-shape', result: RESULT })).json()
  ok('신규 + 결과 → pending', d.status === 'pending', JSON.stringify(d))
  ok('  결과가 메일에 담김', /계란형/.test(c.mail?.html ?? ''))
  ok('  구독 확인 버튼이 같은 메일에', /api\/subscribe\?e=/.test(c.mail?.html ?? ''))
  ok('  수신거부 링크 없음(아직 구독 아님)', !/email-optout/.test(c.mail?.html ?? ''))
  ok('  Resend 태그 result_mail', !!c.mail?.tags?.some((t) => t.value === 'result_mail'))
}
{
  const c = stub({ email: 'ok@x.com', locale: 'ko', confirmed_at: ago(9e8), confirm_sent_at: ago(9e8) })
  const d = await (await post({ email: 'ok@x.com', locale: 'ko', source: 'face-shape', result: RESULT })).json()
  ok('구독 중 + 결과 → sent', d.status === 'sent', JSON.stringify(d))
  ok('  확인 버튼 없음', !/api\/subscribe\?e=/.test(c.mail?.html ?? ''))
  ok('  수신거부 링크 있음', /email-optout/.test(c.mail?.html ?? ''))
  ok('  구독을 만든 source 를 덮어쓰지 않음', c.writes.every((w) => !('source' in (w.body ?? {}))))
}
{
  const c = stub({ email: 'ok@x.com', locale: 'ko', confirmed_at: ago(9e8), confirm_sent_at: ago(9e8) })
  const d = await (await post({ email: 'ok@x.com', locale: 'ko', source: 'home' })).json()
  ok('구독 중 + 결과 없음 → already, 메일 없음', d.status === 'already' && c.mail === null)
}
{
  const c = stub({ email: 'r@x.com', locale: 'ko', confirmed_at: null, confirm_sent_at: ago(3 * 60 * 1000) })
  const d = await (await post({ email: 'r@x.com', locale: 'ko', source: 'face-shape', result: RESULT })).json()
  ok('쿨다운 안 → recent, 메일 없음', d.status === 'recent' && c.mail === null)
}
{
  const c = stub({ email: 'r@x.com', locale: 'ko', confirmed_at: null, confirm_sent_at: ago(20 * 60 * 1000) })
  const d = await (await post({ email: 'r@x.com', locale: 'ko', source: 'face-shape', result: RESULT })).json()
  ok('쿨다운 만료 → 다시 발송', d.status === 'pending' && !!c.mail)
}
{
  const c = stub(null)
  const res = await post({ email: 'new@x.com', locale: 'ko', source: 'x', result: { tool: 'x', path: 'https://evil.com/' } })
  // 화면이 "결과를 보내드릴게요" 라고 말했으므로, 조용히 확인 메일로 떨어뜨리면 거짓이 된다.
  ok('깨진 result → 400, 메일 없음', res.status === 400 && c.mail === null)
}
{
  const c = stub(null)
  await post({ email: 'en@x.com', locale: 'en', source: 'face-shape', result: { ...RESULT, path: '/en/tools/face-shape/oval/' } })
  ok('영문 로케일 → 영문 메일', /here is your result/.test(c.mail?.subject ?? ''))
}
{
  const c = stub(null)
  const d = await (await post({ email: 'plain@x.com', locale: 'ko', source: 'home' })).json()
  ok('회귀: 결과 없는 신청 → 기존 확인 메일', d.status === 'pending' && /구독 확인/.test(`${c.mail?.subject}${c.mail?.html}`))
}

// ── 3. 미리보기 HTML ───────────────────────────────────────────────
const outDir = process.argv.includes('--preview') ? process.argv[process.argv.indexOf('--preview') + 1] : null
if (outDir) {
  const cases = [
    ['ko-new-personal-color', 'ko', {
      tool: 'personal-color', code: 'autumn', label: '퍼스널컬러', name: '가을 웜톤',
      tagline: '가을 숲처럼 깊고 풍부한 무드', emoji: '🍂', path: '/tools/personal-color/autumn-warm/',
      image: '/mood/pc-autumn.webp',
      swatches: [
        { label: '브릭', hex: '#b5563a' }, { label: '카멜', hex: '#c08a52' },
        { label: '머스타드', hex: '#cf9f3b' }, { label: '카키', hex: '#7c7a4d' },
        { label: '딥브라운', hex: '#6e4a32' },
      ],
    }, 'confirm'],
    ['ko-subscriber-face-shape', 'ko', { ...RESULT, facts: [...RESULT.facts, '턱 끝이 부드럽게 둥글거나 완만한 V'] }, 'optout'],
    ['en-new-makeup-mbti', 'en', {
      tool: 'makeup-mbti', code: 'infp', label: 'Makeup MBTI', name: 'The Stargazer (INFP)',
      tagline: 'Pastel glitter and dreamy fantasy', emoji: '✨', path: '/en/tools/makeup-mbti/stargazer/',
      image: '/mood/mb-infp.webp',
      bars: [
        { left: 'Intimate', right: 'Expressive', value: 38 }, { left: 'Signature', right: 'Novel', value: 72 },
        { left: 'Structure', right: 'Feel', value: 81 }, { left: 'Journal', right: 'Playful', value: 64 },
      ],
    }, 'confirm'],
  ]
  for (const [name, lang, raw, kind] of cases) {
    const clean = mod.sanitizeResult(raw)
    const { html } = mod.resultMail(
      lang, clean,
      kind === 'confirm' ? 'https://kissinskin.net/api/subscribe?e=a%40b.com&t=sig' : null,
      kind === 'optout' ? 'https://kissinskin.net/api/email-optout?e=a&t=b' : null,
    )
    writeFileSync(`${outDir}/mail-${name}.html`, html)
    console.log(`📄 ${outDir}/mail-${name}.html`)
  }
}

console.log(failed ? `\n${failed}건 실패` : '\n전부 통과')
process.exit(failed ? 1 : 0)
