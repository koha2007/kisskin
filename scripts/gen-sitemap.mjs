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
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SITE = 'https://kissinskin.net'
const SITEMAP = resolve('public/sitemap.xml')

// content type → { 데이터 파일, en 슬러그 파일+상수, URL base }
const TYPES = [
  { base: 'news',     data: 'src/lib/news/items.ts',       enFile: 'src/lib/news/enSlugs.ts',       enConst: 'EN_NEWS_SLUGS' },
  { base: 'products', data: 'src/lib/products/items.ts',    enFile: 'src/lib/products/enSlugs.ts',    enConst: 'EN_PRODUCT_SLUGS' },
  { base: 'guides',   data: 'src/lib/guides/posts.ts',     enFile: 'src/lib/guides/enSlugs.ts',     enConst: 'EN_GUIDE_SLUGS' },
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
