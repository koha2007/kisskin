#!/usr/bin/env node
// 주간 다이제스트 메일 본문 만들기 — 지난 7일 동안 발행된 제품을 골라 JSON 으로 낸다.
// .github/workflows/weekly-digest.yml 이 이 출력을 그대로 /api/announce-products 에 POST 한다.
//
// 사용: node scripts/build-digest-payload.mjs [최대건수=8]
//   DRY_RUN=1  → 출력 JSON 에 "dryRun": true 를 실어 발송기가 수신자만 세게 한다.
//
// items.ts / items.en.ts 의 배열 부분은 순수 데이터(문자열·배열·불리언)라 대괄호
// 구간만 잘라 new Function 으로 평가한다. gen-products.mjs 가 매일 최신 항목을
// 배열 맨 앞에 넣으므로 newest-first 다.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const KO = resolve('src/lib/products/items.ts')
const EN = resolve('src/lib/products/items.en.ts')

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

const N = Math.max(1, Math.min(20, Number(process.argv[2]) || 8))
const WINDOW_MS = 7 * 24 * 3600 * 1000 + 12 * 3600 * 1000 // 7일 + 반나절 여유
const now = Date.now()

const pick = (it) => ({
  slug: it.slug,
  brand: it.brand,
  name: it.name,
  summary: it.summary,
  image: it.image,
  category: it.category,
})

const koAll = loadFeed(KO, 'PRODUCT_ITEMS')
const recentKo = koAll
  .filter((it) => {
    const d = Date.parse(`${it.date || ''}T00:00:00Z`)
    return Number.isFinite(d) && now - d <= WINDOW_MS
  })
  .slice(0, N)
  .map(pick)

const koSlugs = new Set(recentKo.map((p) => p.slug))
const productsEn = loadFeed(EN, 'PRODUCT_ITEMS_EN')
  .filter((it) => koSlugs.has(it.slug))
  .map(pick)

process.stdout.write(
  JSON.stringify({
    products: recentKo,
    productsEn,
    dryRun: process.env.DRY_RUN === '1',
  }),
)
