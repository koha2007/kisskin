#!/usr/bin/env node
// 주간 다이제스트 메일 본문 만들기 — 지난 7일 동안 발행된 제품과 뉴스를 골라 JSON 으로 낸다.
// .github/workflows/weekly-digest.yml 이 이 출력을 그대로 /api/announce-products 에 POST 한다.
//
// 사용: node scripts/build-digest-payload.mjs [제품 최대건수=8] [뉴스 최대건수=제품과 동일]
//   DRY_RUN=1  → 출력 JSON 에 "dryRun": true 를 실어 발송기가 수신자만 세게 한다.
//
// 2026-09-19: 발행을 주 1회(뉴스 1 + 제품 1)로 낮추면서 메일도 제품만으론 얇아졌다.
// 그래서 같은 주에 나간 뉴스 1건을 함께 싣는다.
//
// items.ts / items.en.ts 의 배열 부분은 순수 데이터(문자열·배열·불리언)라 대괄호
// 구간만 잘라 new Function 으로 평가한다. gen-products.mjs 가 최신 항목을
// 배열 맨 앞에 넣으므로 newest-first 다.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadFeed(file, exportName) {
  const src = readFileSync(file, 'utf8')
  const anchor = src.indexOf(`export const ${exportName}`)
  if (anchor < 0) throw new Error(`${exportName} 를 ${file} 에서 못 찾음`)
  const open = src.indexOf('[', anchor)
  const fnIdx = src.indexOf('export function', open)
  const close = src.lastIndexOf('\n]', fnIdx > 0 ? fnIdx : src.length)
  if (open < 0 || close < 0) throw new Error(`${file} 배열 경계 파싱 실패`)
  const literal = src.slice(open, close + 2) // "[ ... \n]"
  return new Function(`return ${literal}`)()
}

const clamp = (v, def) => Math.max(1, Math.min(20, Number(v) || def))
const N_PRODUCTS = clamp(process.argv[2], 8)
const N_NEWS = clamp(process.argv[3], N_PRODUCTS)
const WINDOW_MS = 7 * 24 * 3600 * 1000 + 12 * 3600 * 1000 // 7일 + 반나절 여유
const now = Date.now()

const recent = (items, n) =>
  items
    .filter((it) => {
      const d = Date.parse(`${it.date || ''}T00:00:00Z`)
      return Number.isFinite(d) && now - d <= WINDOW_MS
    })
    .slice(0, n)

const pickProduct = (it) => ({
  slug: it.slug,
  brand: it.brand,
  name: it.name,
  summary: it.summary,
  image: it.image,
  category: it.category,
})

// 뉴스엔 brand 가 없다 — 발송기(normItems)가 brand 를 빈 문자열로 받아 제목만 쓴다.
const pickNews = (it) => ({
  slug: it.slug,
  brand: '',
  name: it.title,
  summary: it.summary,
  image: it.image,
  category: it.category,
})

// EN 피드는 KO 에서 고른 것과 같은 slug 만 남긴다(번역 누락분은 자연히 빠진다).
function sameSlugs(koPicked, enAll, pick) {
  const slugs = new Set(koPicked.map((p) => p.slug))
  return enAll.filter((it) => slugs.has(it.slug)).map(pick)
}

const productsKoAll = recent(loadFeed(resolve('src/lib/products/items.ts'), 'PRODUCT_ITEMS'), N_PRODUCTS)
const newsKoAll = recent(loadFeed(resolve('src/lib/news/items.ts'), 'NEWS_ITEMS'), N_NEWS)

const products = productsKoAll.map(pickProduct)
const news = newsKoAll.map(pickNews)

process.stdout.write(
  JSON.stringify({
    products,
    productsEn: sameSlugs(products, loadFeed(resolve('src/lib/products/items.en.ts'), 'PRODUCT_ITEMS_EN'), pickProduct),
    news,
    newsEn: sameSlugs(news, loadFeed(resolve('src/lib/news/items.en.ts'), 'NEWS_ITEMS_EN'), pickNews),
    dryRun: process.env.DRY_RUN === '1',
  }),
)
