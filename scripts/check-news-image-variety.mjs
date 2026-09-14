#!/usr/bin/env node
// 뉴스 무드컷 "반복 패턴" 사전 점검 — API 호출 없음(무료).
//
// 왜 (2026-09-14): 101장을 두 번 전량 생성(≈$13)했는데 둘 다 같은 사진이 반복됐다.
//   "프롬프트 문자열이 66개로 고유하다"만 보고 돌린 게 실수 — 사진에서 눈에 보이는 축
//   기준으로 세지 않았다. 이 스크립트는 **눈에 보이는 축**(피사체·앵글·색·바닥재) 기준으로
//   ① 축별 최다 편중 ② 완전히 같은 조합 ③ 목록에서 이웃한 카드끼리 피사체/색 겹침 을 센다.
//   backfill-news-images.mjs --all 같은 대량 생성 전에 반드시 이걸 먼저 본다.
//
// 사용: node scripts/check-news-image-variety.mjs
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { assignNewsImageAxes } from './_newsImagePrompt.mjs'

const src = readFileSync(resolve('src/lib/news/items.ts'), 'utf8')
const items = [...src.matchAll(/^ {2}\{\n {4}slug: '([^']+)',[\s\S]*?category:\s*'([^']*)'/gm)]
  .map((m) => ({ slug: m[1], category: m[2] }))
const axes = assignNewsImageAxes(items)
const rows = items.map((it) => ({ ...it, ...axes.get(it.slug) }))
const n = rows.length

const topShare = (key) => {
  const c = {}
  for (const r of rows) c[r[key]] = (c[r[key]] || 0) + 1
  const [val, cnt] = Object.entries(c).sort((a, b) => b[1] - a[1])[0]
  return { distinct: Object.keys(c).length, cnt, val }
}

console.log(`뉴스 ${n}개\n`)
for (const key of ['subject', 'angle', 'palette', 'surface', 'lighting']) {
  const t = topShare(key)
  console.log(`${key.padEnd(8)} 서로 다른 값 ${String(t.distinct).padStart(2)} · 최다 ${t.cnt}장 (${(t.cnt / n * 100).toFixed(0)}%) "${t.val.slice(0, 60)}"`)
}

// 피사체+색+앵글이 모두 같으면 사실상 같은 사진으로 보인다.
const combo = {}
for (const r of rows) (combo[`${r.subject}|${r.palette}|${r.angle}`] ??= []).push(r.slug)
const dupes = Object.values(combo).filter((v) => v.length > 1)
console.log(`\n피사체+색+앵글 완전 동일 묶음: ${dupes.length}개`)
for (const d of dupes) console.log(`  · ${d.join(', ')}`)

let adjSubject = 0, adjPalette = 0
for (let i = 1; i < n; i++) {
  if (rows[i].subject === rows[i - 1].subject) adjSubject++
  if (rows[i].palette === rows[i - 1].palette) adjPalette++
}
console.log(`이웃 카드끼리 같은 피사체: ${adjSubject}쌍 · 같은 포인트색: ${adjPalette}쌍`)

const bad = dupes.length > Math.ceil(n * 0.03) || adjSubject > Math.ceil(n * 0.05)
console.log(bad ? '\n⚠️ 반복 위험 — 풀을 늘리거나 조합을 손본 뒤 다시 점검할 것.' : '\n✅ 분포 OK — 그래도 전량 전에 샘플 컨택트시트로 눈 확인 필수.')
process.exit(bad ? 1 : 0)
