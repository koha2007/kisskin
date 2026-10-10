#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 사이트 전체 자동 점검 — 2026-10-10 운영자 요청("PC 꺼져 있어도 2주마다 자동으로")
// ────────────────────────────────────────────────────────────────────
// .github/workflows/site-audit.yml 이 2주마다 돌린다. 문제가 있으면 exit 1 → 워크플로가 빨간색 →
// GitHub 이 운영자 메일로 알린다. 고치지는 않는다(찾기만). 보고서 = site-audit-report.md + 잡 요약.
//
// 점검 항목 — 2026-07-14 · 09-22 · 10-10 점검에서 **실제로 걸렸던 것들**을 기계화했다:
//   [정적: npm run build 후 dist/client 실측]
//    1 사이트맵 URL 이 실제로 프리렌더됐나(404)          2 hreflang 대상이 실존하나
//    3 내부 링크 · 이미지가 깨졌나                        4 영문 페이지가 한국어 경로로 새나
//    5 <title>/description/canonical 1개씩 · 자기 자신 · JSON-LD 파싱   6 제목 중복
//    7 얇은 페이지(본문 900자 미만)                        8 영문 페이지 한글 노출(경고)
//    9 자동 발행 뉴스·제품 중복(같은 소식/제품이 주소만 바꿔 여러 번 — 10/10 에 16건 나왔던 것)
//   [렌더: 실제 브라우저]  10 주요 페이지 × PC/모바일 콘솔 오류 · 실패 요청 · 가로 넘침
//   [라이브]              11 주요 주소 응답 코드 · 리디렉트 · 제휴 함수
//   명도대비는 별도 스텝(scripts/audit-contrast.mjs).
//
// 사용: npm run build && node scripts/site-audit.mjs [--no-render] [--no-live]
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createServer } from 'node:http'
import { findDupTitle, findDupProduct } from './_dedupe.mjs'

const D = resolve('dist/client')
const SITE = 'https://kissinskin.net'
const args = new Set(process.argv.slice(2))
const errors = []   // 실패 → exit 1
const warns = []    // 보고만
const ok = []       // 통과 항목 이름
const E = (area, msg) => errors.push(`**${area}** — ${msg}`)
const W = (area, msg) => warns.push(`**${area}** — ${msg}`)
const sample = (xs, n = 6) => xs.slice(0, n).join(', ') + (xs.length > n ? ` … 외 ${xs.length - n}` : '')

if (!existsSync(D)) { console.error('dist/client 없음 — 먼저 npm run build'); process.exit(2) }

// ── 파일 목록 ──
const files = []
;(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p) } })(D)
const rel = (p) => '/' + p.slice(D.length + 1).split('\\').join('/')
const staticSet = new Set(files.map(rel))
const pages = new Map()
for (const f of files) if (f.endsWith('/index.html') || f === join(D, 'index.html')) {
  const r = rel(f).replace(/index\.html$/, '')
  pages.set(r, readFileSync(f, 'utf8'))
}
const routes = JSON.parse(readFileSync(join(D, '_routes.json'), 'utf8'))
const exists = (p) => {
  p = decodeURI(p.split('#')[0].split('?')[0])
  if (!p) return true
  if (pages.has(p) || staticSet.has(p) || pages.has(p + '/')) return true
  return routes.include.some((inc) => (inc.endsWith('*') ? p.startsWith(inc.slice(0, -1)) : p === inc))
}
const noindex = new Set([...pages].filter(([, h]) => /<meta[^>]+name="robots"[^>]+noindex/.test(h)).map(([u]) => u))
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const stripBody = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')

// 1 사이트맵
const sm = readFileSync(resolve('public/sitemap.xml'), 'utf8')
const smUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, ''))
const sm404 = smUrls.filter((u) => !pages.has(u))
sm404.length ? E('사이트맵', `프리렌더 안 된 URL ${sm404.length}개: ${sample(sm404)}`) : ok.push(`사이트맵 ${smUrls.length}개 전부 존재`)

// 2~8 페이지별
const hrefMiss = new Set(), broken = new Map(), badImg = new Map(), leak = new Map(), head = [], hangul = [], thin = []
const titles = new Map()
for (const [u, h] of pages) {
  for (const m of h.matchAll(/hreflang="[^"]+" href="([^"]+)"/gi)) { const t = m[1].replace(SITE, ''); if (!pages.has(t)) hrefMiss.add(`${u} → ${t}`) }
  const body = stripBody(h)
  for (const m of body.matchAll(/<a [^>]*href="(\/[^"]*)"/g)) { const l = unesc(m[1]); if (!exists(l)) broken.set(l, u) }
  for (const m of body.matchAll(/<img [^>]*src="(\/[^"]+)"/g)) if (!exists(m[1])) badImg.set(m[1], u)
  if (u.startsWith('/en/')) {
    for (const m of body.matchAll(/<a [^>]*href="(\/(?:tools|guides|news|reviews|products|looks|class)\/[^"]*)"/g)) leak.set(m[1], u)
    const n = (body.replace(/<[^>]+>/g, ' ').match(/[\uac00-\ud7a3]/g) || []).length
    if (n > 60) hangul.push(`${u}(${n})`)
  }
  if (noindex.has(u)) continue
  const headPart = h.split('</head>')[0]
  const t = [...headPart.matchAll(/<title>([\s\S]*?)<\/title>/g)], d = [...headPart.matchAll(/<meta name="description" content="([^"]*)"/g)]
  const c = [...headPart.matchAll(/<link rel="canonical" href="([^"]+)"/g)]
  if (t.length !== 1) head.push(`${u} title×${t.length}`)
  else { const k = unesc(t[0][1]); titles.set(k, [...(titles.get(k) || []), u]) }
  if (d.length !== 1) head.push(`${u} description×${d.length}`)
  if (c.length !== 1) head.push(`${u} canonical×${c.length}`)
  else if (c[0][1].replace(SITE, '') !== u) head.push(`${u} canonical→${c[0][1]}`)
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1].includes('&quot;') ? unesc(m[1]) : m[1]) } catch { head.push(`${u} JSON-LD 파싱 오류`) }
  }
  const txt = body.replace(/<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  if (txt.length < 900) thin.push(`${u}(${txt.length}자)`)
}
hrefMiss.size ? E('hreflang', `없는 대상 ${hrefMiss.size}개: ${sample([...hrefMiss])}`) : ok.push('hreflang 대상 전부 존재')
broken.size ? E('깨진 링크', `${broken.size}개: ${sample([...broken].map(([l, u]) => `${l} (${u})`))}`) : ok.push('내부 링크 깨짐 0')
badImg.size ? E('깨진 이미지', `${badImg.size}개: ${sample([...badImg].map(([l, u]) => `${l} (${u})`))}`) : ok.push('이미지 깨짐 0')
leak.size ? E('영문→한국어 경로 유출', `${leak.size}개: ${sample([...leak].map(([l, u]) => `${l} (${u})`))}`) : ok.push('영문 페이지 한국어 경로 유출 0')
head.length ? E('head', `${head.length}건: ${sample(head)}`) : ok.push('title·description·canonical·JSON-LD 정상')
const dupT = [...titles].filter(([, us]) => us.length > 1)
dupT.length ? E('제목 중복', `${dupT.length}개: ${sample(dupT.map(([t, us]) => `"${t.slice(0, 40)}" ${us.join(' · ')}`), 4)}`) : ok.push('페이지 제목 중복 0')
thin.length ? W('얇은 페이지', `본문 900자 미만 ${thin.length}개: ${sample(thin)}`) : ok.push('얇은 페이지 0')
hangul.length ? W('영문 페이지 한글', `한글 60자 넘는 영문 페이지 ${hangul.length}개: ${sample(hangul)}`) : ok.push('영문 페이지 한글 노출 정상')

// 9 자동 발행 중복
function loadFeed(file, name) {
  const src = readFileSync(resolve(file), 'utf8')
  const a = src.indexOf(`export const ${name}`), o = src.indexOf('[', a)
  const fn = src.indexOf('export function', o), c = src.lastIndexOf('\n]', fn > 0 ? fn : src.length)
  return new Function(`return ${src.slice(o, c + 2)}`)()
}
const news = loadFeed('src/lib/news/items.ts', 'NEWS_ITEMS').sort((a, b) => (a.date < b.date ? -1 : 1))
const dupNews = []
news.forEach((n, i) => { const d = findDupTitle(n.title, news.slice(0, i).map((x) => x.title)); if (d) dupNews.push(`"${n.title.slice(0, 30)}"(${n.date}) ≈ "${d.title.slice(0, 30)}"`) })
dupNews.length ? E('뉴스 중복 발행', `${dupNews.length}건: ${sample(dupNews, 4)} — 원본으로 301(public/_redirects) 후 데이터 삭제`) : ok.push(`뉴스 ${news.length}건 중복 0`)
const prods = loadFeed('src/lib/products/items.ts', 'PRODUCT_ITEMS').sort((a, b) => (a.date < b.date ? -1 : 1))
const dupProd = []
prods.forEach((p, i) => { const d = findDupProduct(p.brand, p.name, prods.slice(0, i)); if (d) dupProd.push(`${p.brand} ${p.name}(${p.date}) ≈ ${d.name}`) })
// 같은 브랜드의 다른 제품(향수 vs 핸드크림)은 사람이 판단 — 경고로만
dupProd.length ? W('제품 중복 의심', `${dupProd.length}건: ${sample(dupProd, 4)}`) : ok.push(`제품 ${prods.length}건 중복 0`)

// 10 렌더
if (!args.has('--no-render')) {
  const { chromium } = await import('playwright')
  const mime = { html: 'text/html; charset=utf-8', js: 'text/javascript', css: 'text/css', json: 'application/json', webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', woff2: 'font/woff2', txt: 'text/plain', xml: 'application/xml', ico: 'image/x-icon' }
  const srv = createServer((req, res) => {
    let p = decodeURI(req.url.split('?')[0])
    if (p.endsWith('/')) p += 'index.html'
    const f = join(D, p)
    if (!f.startsWith(D) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end() }
    res.writeHead(200, { 'content-type': mime[f.split('.').pop()] || 'application/octet-stream' }); res.end(readFileSync(f))
  }).listen(4199)
  const latest = (dir) => [...pages.keys()].filter((u) => u.startsWith(`/${dir}/`) && u.split('/').length === 4).sort()[0]
  const urls = ['/', '/en/', '/tools/', '/tools/personal-color/', '/tools/face-shape/', '/tools/face-shape/round/', '/tools/makeup-mbti/', '/tools/perfume-type/',
    '/tools/beauty-dna/', '/looks/', '/looks/kpop-idol/', '/class/', '/news/', '/products/', '/about/', '/analysis/',
    '/en/class/', '/en/tools/face-shape/heart/', '/en/looks/', latest('news'), latest('products'), [...pages.keys()].find((u) => /^\/class\/[^/]+\/$/.test(u))].filter(Boolean)
  const b = await chromium.launch()
  const probs = []
  for (const [w, h] of [[1280, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } })
    for (const u of urls) {
      const p = await ctx.newPage(); const errs = []; const fails = []
      p.on('pageerror', (e) => errs.push(e.message.slice(0, 90)))
      p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|supabase|googletagmanager|clarity/i.test(m.text())) errs.push(m.text().slice(0, 90)) })
      p.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith('http://localhost:4199') && !r.url().includes('/api/')) fails.push(`${r.status()} ${r.url().slice(21)}`) })
      try { await p.goto(`http://localhost:4199${u}`, { waitUntil: 'networkidle', timeout: 30000 }) } catch (e) { errs.push('열기 실패 ' + e.message.slice(0, 50)) }
      await p.waitForTimeout(300)
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth).catch(() => 0)
      if (errs.length || fails.length || ov > 1) probs.push(`${u} @${w}px ${ov > 1 ? `가로넘침 ${ov}px ` : ''}${errs.slice(0, 2).join(' / ')} ${fails.slice(0, 2).join(' ')}`.trim())
      await p.close()
    }
    await ctx.close()
  }
  await b.close(); srv.close()
  probs.length ? E('렌더', `${probs.length}건: ${sample(probs, 5)}`) : ok.push(`렌더 ${urls.length}페이지 × PC/모바일 오류·넘침 0`)
}

// 11 라이브
if (!args.has('--no-live')) {
  const red = readFileSync(resolve('public/_redirects'), 'utf8').split('\n').find((l) => /^\/(news|products)\/\S+\/\s/.test(l))
  const checks = [['/', 200], ['/en/', 200], ['/class/', 200], ['/tools/face-shape/', 200], ['/looks/', 200], ['/sitemap.xml', 200], ['/robots.txt', 200],
    ['/api/go/yesstyle?q=cushion', 302], ['/blog/', 410], ...(red ? [[red.split(/\s+/)[0], 301]] : [])]
  const bad = []
  for (const [p, want] of checks) {
    try {
      const r = await fetch(SITE + p, { redirect: 'manual', headers: { 'user-agent': 'kissinskin-site-audit' } })
      if (r.status !== want) bad.push(`${p} ${r.status}(기대 ${want})`)
    } catch (e) { bad.push(`${p} 연결 실패 ${e.message.slice(0, 40)}`) }
  }
  // 라이브 사이트맵이 지금 빌드와 크게 다르면 배포가 밀린 것
  try {
    const live = await (await fetch(`${SITE}/sitemap.xml`)).text()
    const n = (live.match(/<loc>/g) || []).length
    if (Math.abs(n - smUrls.length) > 20) W('라이브 사이트맵', `라이브 ${n}개 vs 빌드 ${smUrls.length}개 — 배포가 밀렸는지 확인`)
  } catch { /* 위에서 이미 잡힘 */ }
  bad.length ? E('라이브', bad.join(' · ')) : ok.push(`라이브 주소 ${checks.length}개 응답 정상`)
}

// ── 보고서 ──
const now = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ')
const md = [
  `# kissinskin 자동 점검 — ${now} KST`,
  '',
  errors.length ? `## ❌ 문제 ${errors.length}건` : '## ✅ 문제 없음',
  ...errors.map((x) => `- ${x}`),
  ...(warns.length ? ['', `## ⚠️ 경고 ${warns.length}건 (실패로 치지 않음)`, ...warns.map((x) => `- ${x}`)] : []),
  '', `## 통과 ${ok.length}항목`, ...ok.map((x) => `- ${x}`),
  '', `페이지 ${pages.size}개 · 사이트맵 ${smUrls.length}개 · 점검 스크립트 scripts/site-audit.mjs`,
].join('\n')
writeFileSync('site-audit-report.md', md + '\n')
console.log(md)
if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n', { flag: 'a' })
process.exit(errors.length ? 1 : 0)
