#!/usr/bin/env node
// 홈 "메이크업 제품 · 뉴스" 카드용 가벼운 목록 — 2026-10-10 전체 점검.
// 홈이 카드 4장씩만 보여주면서 news/products 피드 **전체(본문 포함, 원본 730KB)** 를 번들로 받고
// 있었다(홈 JS 압축 473KB 의 절반). 최신 4건의 카드 필드만 JSON 으로 뽑아 홈은 이것만 읽는다.
// `npm run build` 첫 단계에서 매번 다시 만든다(Cloudflare 빌드 = 항상 최신). 커밋된 파일은 로컬 dev 용.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

function loadFeed(file, exportName) {
  const src = readFileSync(resolve(file), 'utf8')
  const anchor = src.indexOf(`export const ${exportName}`)
  if (anchor < 0) throw new Error(`${exportName} 를 ${file} 에서 못 찾음`)
  const open = src.indexOf('[', anchor)
  const fnIdx = src.indexOf('export function', open)
  const close = src.lastIndexOf('\n]', fnIdx > 0 ? fnIdx : src.length)
  return new Function(`return ${src.slice(open, close + 2)}`)()
}
const latest = (xs, pick) => [...xs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4).map(pick)
const prod = (p) => ({ slug: p.slug, brand: p.brand, name: p.name, category: p.category, image: p.image ?? null, date: p.date })
const news = (n) => ({ slug: n.slug, title: n.title, category: n.category, image: n.image ?? null, date: n.date })

const out = {
  products: {
    ko: latest(loadFeed('src/lib/products/items.ts', 'PRODUCT_ITEMS'), prod),
    en: latest(loadFeed('src/lib/products/items.en.ts', 'PRODUCT_ITEMS_EN'), prod),
  },
  news: {
    ko: latest(loadFeed('src/lib/news/items.ts', 'NEWS_ITEMS'), news),
    en: latest(loadFeed('src/lib/news/items.en.ts', 'NEWS_ITEMS_EN'), news),
  },
}
mkdirSync(resolve('src/lib/home'), { recursive: true })
writeFileSync(resolve('src/lib/home/latestCards.json'), JSON.stringify(out, null, 2) + '\n')
console.log(`[gen-home-cards] 제품 ${out.products.ko.length}/${out.products.en.length} · 뉴스 ${out.news.ko.length}/${out.news.en.length}`)
