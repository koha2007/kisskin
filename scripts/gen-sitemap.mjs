#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// sitemap.xml 자동 생성 — 뉴스·가이드·리뷰 "상세" URL 을 데이터에서 동기화
// ────────────────────────────────────────────────────────────────────
// 왜: 지금까지 public/sitemap.xml 을 손으로 관리해 코드와 어긋났다(예: 뉴스
//     30편인데 사이트맵엔 28편만). 자동 발행하려면 새 글이 반드시 사이트맵에
//     들어가야 색인되므로, 콘텐츠 상세 URL 을 데이터 기준으로 재생성한다.
//
// 방식(파일 수술 — SEO 회귀 위험 최소화):
//   1) 기존 sitemap.xml 을 읽어 정적/도구/허브 <url> 블록은 "그대로" 보존
//   2) 콘텐츠 상세( /news|guides|reviews/{slug}/ , /en/... )블록만 제거
//   3) items.ts / posts.ts + en 슬러그셋에서 {slug,date,featured} 추출해 재생성
//   4) </urlset> 앞에 삽입
//
// 순수 Node(정규식 파싱) — TS 런타임 불필요라 어떤 Node 버전/CF 빌드에서도 동작.
// 데이터가 기계 생성으로 바뀌어도 `slug: '...'` / `date: '...'` 형식만 지키면 됨.
// 빌드 첫 단계로 실행(package.json) → public/ 이 dist 로 복사되기 전에 최신화.
// ════════════════════════════════════════════════════════════════════
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SITE = 'https://kissinskin.net'
const SITEMAP = resolve('public/sitemap.xml')

// content type → { 데이터 파일, en 슬러그 파일+상수, URL base }
// enOnly* 는 "한국어 원본이 없는 영문 오리지널" 이 있는 타입만 채운다 — 아래 EN-ONLY 블록 참고.
const TYPES = [
  { base: 'news',     data: 'src/lib/news/items.ts',       enFile: 'src/lib/news/enSlugs.ts',       enConst: 'EN_NEWS_SLUGS' },
  { base: 'products', data: 'src/lib/products/items.ts',    enFile: 'src/lib/products/enSlugs.ts',    enConst: 'EN_PRODUCT_SLUGS' },
  { base: 'guides',   data: 'src/lib/guides/posts.ts',     enFile: 'src/lib/guides/enSlugs.ts',     enConst: 'EN_GUIDE_SLUGS',
    enData: 'src/lib/guides/posts.en.ts', enOnlyFile: 'src/lib/guides/enOnlySlugs.ts', enOnlyConst: 'EN_ONLY_GUIDE_SLUGS' },
  { base: 'reviews',  data: 'src/lib/reviews/posts.ts',    enFile: 'src/lib/reviews/enSlugs.ts',     enConst: 'EN_REVIEW_SLUGS' },
]

// 데이터 TS 에서 각 아이템의 {slug,date,featured} 추출.
// slug 는 아이템의 시작점 — 다음 slug 전까지를 한 아이템 슬라이스로 보고 date/featured 를 읽는다.
function parseContent(file) {
  const s = readFileSync(resolve(file), 'utf8')
  const marks = [...s.matchAll(/slug:\s*'([^']+)'/g)].map((m) => ({ slug: m[1], idx: m.index }))
  return marks.map((mk, i) => {
    const chunk = s.slice(mk.idx, i + 1 < marks.length ? marks[i + 1].idx : s.length)
    const d = chunk.match(/date:\s*'([^']+)'/)
    return { slug: mk.slug, date: d ? d[1] : null, featured: /featured:\s*true/.test(chunk) }
  })
}

// export const NAME = [ '...', '...' ] → Set<slug>
function parseSlugSet(file, name) {
  const s = readFileSync(resolve(file), 'utf8')
  const m = s.match(new RegExp(name + '\\s*=\\s*\\[([\\s\\S]*?)\\]'))
  if (!m) return new Set()
  return new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]))
}

const alt = (koLoc, enLoc) =>
  `<xhtml:link rel="alternate" hreflang="ko" href="${koLoc}" />` +
  `<xhtml:link rel="alternate" hreflang="en" href="${enLoc}" />` +
  `<xhtml:link rel="alternate" hreflang="x-default" href="${koLoc}" />`

function urlBlock(loc, lastmod, priority, alternates = '') {
  return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority>${alternates}</url>`
}

// ── 콘텐츠 블록 생성 ──
const blocks = []
const summary = {}
for (const t of TYPES) {
  const items = parseContent(t.data).filter((it) => it.slug && it.date)
  const enSet = parseSlugSet(t.enFile, t.enConst)
  items.sort((a, b) => (a.date < b.date ? 1 : -1)) // 최신순
  let ko = 0, en = 0
  for (const it of items) {
    const koLoc = `${SITE}/${t.base}/${it.slug}/`
    const hasEn = enSet.has(it.slug)
    if (hasEn) {
      const enLoc = `${SITE}/en/${t.base}/${it.slug}/`
      blocks.push(urlBlock(koLoc, it.date, it.featured ? '0.8' : '0.7', alt(koLoc, enLoc)))
      blocks.push(urlBlock(enLoc, it.date, '0.7', alt(koLoc, enLoc)))
      ko++; en++
    } else {
      blocks.push(urlBlock(koLoc, it.date, it.featured ? '0.8' : '0.7'))
      ko++
    }
  }

  // ── EN-ONLY: 한국어 원본이 없는 영문 오리지널 ──
  // 위 루프는 한국어 데이터(t.data)를 기준으로 돌기 때문에, 한국어 짝이 없는 글은 여기에
  // 아예 등장하지 않는다 → 따로 훑지 않으면 사이트맵에서 통째로 빠진다(실제로 빠져 있었다).
  // hreflang 은 붙이지 않는다 — 짝이 없으므로 ko/x-default 를 쓰면 404 를 가리키게 된다.
  if (t.enOnlyFile) {
    const enOnly = parseSlugSet(t.enOnlyFile, t.enOnlyConst)
    const bySlug = new Map(parseContent(t.enData).map((it) => [it.slug, it]))
    for (const slug of [...enOnly].sort()) {
      const it = bySlug.get(slug)
      if (!it || !it.date) {
        console.error(`[gen-sitemap] ${t.enOnlyConst} 의 '${slug}' 를 ${t.enData} 에서 찾지 못했습니다 — 중단`)
        process.exit(1)
      }
      blocks.push(urlBlock(`${SITE}/en/${t.base}/${slug}/`, it.date, it.featured ? '0.8' : '0.7'))
      en++
    }
  }

  summary[t.base] = { ko, en }
}

// ── 기존 sitemap 에서 콘텐츠 상세 블록만 제거하고 새 블록 삽입 ──
const DETAIL = /^\/(en\/)?(news|products|guides|reviews)\/[^/]+\/$/
let xml = readFileSync(SITEMAP, 'utf8')

let removed = 0
xml = xml.replace(/^[ \t]*<url>[\s\S]*?<\/url>[ \t]*\n?/gm, (block) => {
  const loc = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1] || ''
  if (DETAIL.test(loc.replace(SITE, ''))) { removed++; return '' }
  return block
})

// ── 정적/도구 URL 의 <lastmod> 를 git 커밋 날짜로 갱신 ──
// 왜: 이 블록들은 위에서 "그대로 보존"되기 때문에 손으로 적은 날짜가 그대로 굳는다.
//     2026-07-20 기준 홈이 2026-05-15, 도구 결과 31개가 5월 날짜였다 — 그날 실제로
//     레이아웃을 바꿨는데도 구글엔 "안 바뀐 페이지"로 보인다. lastmod 가 안 움직이면
//     사이트맵 재제출은 아무 일도 하지 않는다.
// 방식: URL → 그 라우트를 실제로 렌더하는 소스 경로들 → 그중 최신 커밋 날짜(%cs).
//     매 빌드마다 오늘 날짜를 찍지 않는다 — 그러면 lastmod 가 거짓말이 되고
//     구글이 이 신호를 통째로 무시하게 된다. 실제로 코드가 바뀐 날만 움직인다.
// 제외: pages/+Head.tsx · pages/+config.ts 같은 전역 파일은 매핑에 넣지 않는다.
//     넣으면 head 한 줄만 고쳐도 236개 URL 이 전부 오늘로 바뀌어 의미가 사라진다.
const TOOL_SOURCES = {
  'personal-color': ['src/pages/PersonalColorQuiz.tsx', 'src/pages/PersonalColorResult.tsx', 'src/lib/personal-color', 'src/lib/recommendations/personal-color.ts'],
  'face-shape':     ['src/pages/FaceShapeQuiz.tsx', 'src/pages/FaceShapeResult.tsx', 'src/lib/face-shape', 'src/lib/recommendations/face-shape.ts'],
  'makeup-mbti':    ['src/pages/MakeupMbtiQuiz.tsx', 'src/pages/MakeupMbtiResult.tsx', 'src/lib/makeup-mbti', 'src/lib/recommendations/makeup-mbti.ts'],
  'perfume-type':   ['src/pages/PerfumeTypeQuiz.tsx', 'src/pages/PerfumeTypeResult.tsx', 'src/lib/perfume-type', 'src/lib/recommendations/perfume-type.ts'],
}
// 도구 결과 카드(제품 카드 포함)는 이 공용 컴포넌트들이 만든다 → 4개 도구 전부에 물린다.
const RESULT_SHARED = ['src/components/result-grid']
const PATH_SOURCES = [
  { test: (p) => p === '/',                    files: ['pages/index'] },
  { test: (p) => p === '/analysis/',           files: ['pages/analysis', 'src/components/makeup'] },
  { test: (p) => p === '/tools/',              files: ['pages/tools/+Page.tsx', 'src/pages/ToolsHub.tsx'] },
  { test: (p) => p === '/news/',               files: ['src/pages/NewsHub.tsx'] },
  { test: (p) => p === '/guides/',             files: ['src/pages/GuidesHub.tsx'] },
  { test: (p) => p === '/reviews/',            files: ['src/pages/ReviewsHub.tsx'] },
  { test: (p) => p === '/products/',           files: ['src/pages/ProductsHub.tsx'] },
  { test: (p) => p === '/about/',              files: ['pages/about', 'src/pages/AboutPage.tsx'] },
  { test: (p) => p === '/about-makeup-ai/',    files: ['pages/about-makeup-ai', 'src/pages/AboutMakeupAi.tsx'] },
  { test: (p) => p === '/contact/',            files: ['src/pages/contact.tsx'] },
  { test: (p) => p === '/privacy/',            files: ['src/pages/privacy.tsx'] },
  { test: (p) => p === '/terms/',              files: ['src/pages/terms.tsx'] },
  { test: (p) => p === '/refund/',             files: ['src/pages/refund.tsx'] },
]

const gitDateCache = new Map()
function gitDate(files) {
  const key = files.join('|')
  if (gitDateCache.has(key)) return gitDateCache.get(key)
  let out = null
  try {
    const r = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], { encoding: 'utf8' }).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(r)) out = r
  } catch { /* 파일이 아직 없거나 git 이 없는 환경 — 기존 날짜를 그대로 둔다 */ }
  gitDateCache.set(key, out)
  return out
}

/** URL 경로 → 소스 파일 목록. 매핑이 없으면 null(=기존 lastmod 유지). */
function sourcesFor(path) {
  const p = path.startsWith('/en/') ? path.slice(3) : path === '/en/' ? '/' : path
  const tool = p.match(/^\/tools\/([a-z-]+)\/(?:[a-z0-9-]+\/)?$/)
  if (tool && TOOL_SOURCES[tool[1]]) return [...TOOL_SOURCES[tool[1]], ...RESULT_SHARED]
  const hit = PATH_SOURCES.find((e) => e.test(p))
  return hit ? hit.files : null
}

let bumped = 0
xml = xml.replace(/<loc>([^<]+)<\/loc>(\s*)<lastmod>([^<]+)<\/lastmod>/g, (m, loc, gap, old) => {
  const files = sourcesFor(loc.replace(SITE, ''))
  if (!files) return m
  const d = gitDate(files)
  if (!d || d === old) return m
  bumped++
  return `<loc>${loc}</loc>${gap}<lastmod>${d}</lastmod>`
})
console.log(`[gen-sitemap] 정적/도구 lastmod 갱신: ${bumped}개`)

if (!xml.includes('</urlset>')) {
  console.error('[gen-sitemap] </urlset> 를 찾지 못했습니다 — 중단'); process.exit(1)
}
xml = xml.replace('</urlset>', blocks.join('\n') + '\n</urlset>')
xml = xml.replace(/\n{3,}/g, '\n\n') // 제거 후 남은 빈 줄 정리

writeFileSync(SITEMAP, xml)

const total = blocks.length
console.log(`[gen-sitemap] 콘텐츠 상세 재생성: 제거 ${removed} → 추가 ${total}`)
for (const [k, v] of Object.entries(summary)) console.log(`  ${k}: ko ${v.ko} + en ${v.en}`)
const totalUrls = (xml.match(/<loc>/g) || []).length
console.log(`  전체 <url>: ${totalUrls}`)
