// 홈 시연 영상(CollectionDemo) 녹화 — 9룩 컬렉션 실제 화면을 가짜 세션 + API 모킹으로 처음부터 끝까지.
// ────────────────────────────────────────────────────────────────────
// 1) npm run build && npx vite preview --port 4173
// 2) node scripts/rec-collection-demo.mjs ko <outDir>   (en 도 같은 방법)
//    → <outDir>/*.webm + marks-<lang>.json(장면 시각). 결제창은 /api/checkout 을 복귀 주소로 돌려 건너뛴다.
// 3) 흰 로딩·새로고침 구간을 잘라 public/demo/collection-{ko,en}.mp4 (+ 생성 중 4/9 프레임 → .webp 포스터).
//    2026-10-17 컷(초, ko): 1.6-5.8 6.8-10.5 12.2-20.9 22.0-23.0 24.6-29.0 30.1-42.8
//    ffmpeg trim+concat → libx264 main crf30 25fps yuv420p +faststart. CollectionDemo 의 ?v= 도 올릴 것.
// 셀카 = casting/films/kpop/video/halfup-1.png (git 밖), 결과 = public/styles/looks/*-after.webp(LOOK_IMAGES).
import { chromium } from 'playwright'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const lang = process.argv[2] || 'ko'
const out = process.argv[3]
const ROOT = '/workspaces/kisskin'
const BASE = 'http://localhost:4173'
const REF = 'vrcltmhhbgnsmdeoxlck'
const SELFIE = path.join(ROOT, 'casting/films/kpop/video/halfup-1.png')
// 탭 표시(노란 체크)
const CHECK = 'data:image/png;base64,' + (await sharp(path.join(ROOT, 'casting/체크표시.png')).resize(140, 140, { fit: 'inside' }).png().toBuffer()).toString('base64')
const IDS = ['natural-glow', 'cloud-skin', 'blood-lip', 'maximalist-eye', 'metallic-eye', 'bold-lip', 'blush-draping', 'grunge', 'kpop-idol']
const V = '20261017'

const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'you@gmail.com', app_metadata: { provider: 'google' }, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' }
const sess = { access_token: 'demo', refresh_token: 'demo', token_type: 'bearer', expires_in: 3600000, expires_at: Math.floor(Date.now() / 1000) + 3600000, user }

const t0 = Date.now()
const marks = []
const mark = (name) => { marks.push([name, (Date.now() - t0) / 1000]); console.log(name, ((Date.now() - t0) / 1000).toFixed(2)) }

const b = await chromium.launch()
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 },
  recordVideo: { dir: out, size: { width: 390, height: 844 } },
  // 인스타 인앱 UA — '10장 모두 저장'이 다운로드 대신 10장 보기 화면을 연다(엔딩에 그 이미지를 쓴다)
  userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36 Instagram 350.0',
  locale: lang === 'en' ? 'en-US' : 'ko-KR',
})
await ctx.addInitScript(([REF, sess, lang]) => {
  localStorage.setItem(`sb-${REF}-auth-token`, JSON.stringify(sess))
  localStorage.setItem('kisskin_locale', lang)
  localStorage.setItem('kissinskin_cookie_consent', 'denied')
  localStorage.setItem('kissinskin_install_dismissed', String(Date.now()))
}, [REF, sess, lang])

let balance = 0
await ctx.route(/googletagmanager|google-analytics|clarity\.ms|doubleclick/, (r) => r.abort())
await ctx.route(`https://${REF}.supabase.co/**`, async (r) => {
  const u = r.request().url()
  if (u.includes('/rpc/get_credit_balance')) return r.fulfill({ json: balance })
  if (u.includes('/auth/v1/user')) return r.fulfill({ json: user })
  if (u.includes('/auth/v1/token')) return r.fulfill({ json: sess })
  return r.fulfill({ json: [] })
})
await ctx.route('**/api/checkout', (r) => r.fulfill({ json: { url: '/analysis/?collection=1' } }))
await ctx.route('**/api/collection-mail', async (r) => { await new Promise((s) => setTimeout(s, 1200)); return r.fulfill({ json: { to: 'you***@gmail.com' } }) })
let n = 0
await ctx.route('**/api/makeup-edit', async (r) => {
  const { styleId } = r.request().postDataJSON()
  const i = n++
  // 3개씩 동시에 — 실제처럼 조금씩 다른 시간에 끝나게
  await new Promise((s) => setTimeout(s, 1400 + (i % 3) * 450 + Math.floor(i / 3) * 120))
  balance = Math.max(0, balance - 1)
  return r.fulfill({ json: { image: `${BASE}/styles/looks/${styleId}-after.webp?v=${V}`, balance } })
})

const p = await ctx.newPage()

async function tap(locator, hold = 650) {
  const box = await locator.boundingBox()
  await p.evaluate(([x, y, w, h, src]) => {
    const im = document.createElement('img')
    im.src = src
    im.id = '__check'
    Object.assign(im.style, { position: 'fixed', left: `${x + w / 2 - 6}px`, top: `${y + h / 2 - 34}px`, width: '46px', zIndex: 99999, pointerEvents: 'none' })
    document.body.appendChild(im)
  }, [box.x, box.y, box.width, box.height, CHECK])
  await p.waitForTimeout(hold)
  await locator.click()
  await p.evaluate(() => document.getElementById('__check')?.remove())
}

await p.goto(`${BASE}/analysis/?collection=new`, { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
mark('upload')
await p.waitForTimeout(1300)
const album = p.getByRole('button', { name: lang === 'en' ? /Album/ : /앨범/ }).last()
const fc = p.waitForEvent('filechooser')
await tap(album)
await (await fc).setFiles(SELFIE)
await p.waitForTimeout(1600)
await tap(p.getByRole('button', { name: lang === 'en' ? /^Next/ : /^다음/ }))
await p.getByRole('button', { name: /\$4\.99/ }).waitFor()
await p.waitForTimeout(500)
mark('intro')
await p.waitForTimeout(2200)
balance = 9
await tap(p.getByRole('button', { name: /\$4\.99/ }), 800)
mark('checkout')
await p.waitForURL(/collection=1/)
await p.locator('text=/0 ?\\/ ?9/').first().waitFor({ timeout: 15000 }).catch(() => {})
mark('running')
await p.getByRole('button', { name: lang === 'en' ? /Save all 10/ : /10장 모두 저장/ }).waitFor({ timeout: 60000 })
mark('done')
await p.waitForFunction(() => !document.querySelector('button[disabled]')?.textContent?.includes('10'), null, { timeout: 30000 }).catch(() => {})
await p.waitForTimeout(1800)
await tap(p.getByRole('button', { name: lang === 'en' ? /Email all 10/ : /내 메일로 10장/ }))
await p.waitForTimeout(2600)
await tap(p.getByRole('button', { name: lang === 'en' ? /Save all 10/ : /10장 모두 저장/ }))
await p.waitForTimeout(300)
// 10장 보기 화면의 이미지로 엔딩(저장된 10장 넘겨보기)
const srcs = await p.$$eval('[role=dialog] img', (a) => a.map((i) => i.src))
const names = lang === 'en'
  ? ['Natural Glow', 'Cloud Skin', 'Blood Lip', 'Maximalist Eye', 'Metallic Eye', 'Bold Lip', 'Blush Draping', 'Grunge', 'K-Pop Idol']
  : ['내추럴 글로우', '클라우드 스킨', '블러드 립', '맥시멀리스트 아이', '메탈릭 아이', '볼드 립', '블러쉬 드레이핑', '그런지', 'K-pop 아이돌']
await p.evaluate(([lang]) => {
  const o = document.createElement('div')
  o.id = '__outro'
  o.innerHTML = `<p id="__t" style="font:800 19px 'Pretendard Variable',sans-serif;color:#fff;text-align:center;margin:26px 0 4px">${lang === 'en' ? '10 images saved' : '저장된 10장'}</p>
    <p id="__s" style="font:500 12px 'Pretendard Variable',sans-serif;color:rgba(255,255,255,.6);text-align:center;margin:0 0 14px"></p>
    <img id="__i" style="display:block;margin:0 auto;width:350px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.35)">`
  Object.assign(o.style, { position: 'fixed', inset: 0, zIndex: 99998, background: 'linear-gradient(180deg,#07093a,#140f4f)' })
  document.body.appendChild(o)
}, [lang])
mark('outro')
for (let i = 0; i < srcs.length; i++) {
  const sub = i === 0 ? (lang === 'en' ? '1 grid image' : '모아보기 1장') : (lang === 'en' ? `Look ${i}/9 · ${names[i - 1]}` : `낱장 ${i}/9 · ${names[i - 1]}`)
  await p.evaluate(([src, sub]) => { document.getElementById('__i').src = src; document.getElementById('__s').textContent = sub }, [srcs[i], sub])
  await p.waitForTimeout(i === 0 ? 3200 : i === 6 ? 1500 : 1000)
}
mark('end')
await p.close()
const vid = await p.video().path()
await ctx.close(); await b.close()
fs.writeFileSync(path.join(out, `marks-${lang}.json`), JSON.stringify({ vid, marks }))
console.log('video', vid)
