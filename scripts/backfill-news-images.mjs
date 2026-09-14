#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// 뉴스 카드 무드컷을 채우거나(신규) 다시 그린다(--all).
// ────────────────────────────────────────────────────────────────────
// 왜: gen-news.mjs 는 2026-09-10 부터 이미지 생성이 있었지만 인물 포트레이트였다.
//     바로 위 제품소개 섹션도 인물 컷이라 화면이 사람 얼굴로 도배됐다(2026-09-13).
//     그래서 뉴스는 `_newsImagePrompt.mjs`(사람 없는 "제품+글로벌 무역" 정물 컨셉)로
//     전면 교체했다 — 제품 카드(_productImagePrompt.mjs)는 그대로 인물 컷 유지.
//
// 방식:
//   1) items.ts 에서 대상 블록을 고른다 — 기본은 `image:` 없는 것만, --all 이면 전부.
//   2) `_newsImagePrompt.buildNewsImagePrompt` (슬러그 해시로 정물 구성을 고름)
//      → `_openaiImage`(gpt-image-1) → sharp webp → public/news/{slug}.webp.
//   3) `image:` 줄이 아직 없는 블록에만 items.ts / items.en.ts 에 삽입한다.
//      (--all 로 기존 이미지를 다시 그릴 땐 경로가 같은 파일명이라 삽입할 게 없다.)
//
// 사용:
//   OPENAI_API_KEY=... node scripts/backfill-news-images.mjs [옵션]
//     --dry            대상 목록만 출력하고 종료(API 호출 없음)
//     --all            image: 있는 것도 포함해 전부 다시 그린다(파일만 덮어씀)
//     --limit N        앞에서 N 개만 처리(먼저 소량으로 확인할 때)
//     --only a,b,c     지정한 slug 만 처리
//     --sample-dir D   public/ 대신 D 에 PNG 로 저장, items.ts 는 건드리지 않음(샘플 검수용)
//     --yes            6장 이상 실제 생성할 때 필수(예상 비용을 보고 확인했다는 표시)
//
// ⚠ 대량 생성 전 순서(2026-09-14, 207장·≈$13 날린 뒤 정한 규칙):
//   ① node scripts/check-news-image-variety.mjs  (무료 분포 점검)
//   ② --sample-dir 로 6~12장 → 컨택트시트로 운영자 확인
//   ③ 그다음에만 --all --yes
// ════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildNewsImagePrompt, assignNewsImageAxes } from './_newsImagePrompt.mjs'
import { IMAGE_MODEL, generateImageB64 } from './_openaiImage.mjs'
import { writeNewsWebp } from './_newsWatermark.mjs'

const ITEMS_KO = resolve('src/lib/news/items.ts')
const ITEMS_EN = resolve('src/lib/news/items.en.ts')
const IMG_DIR = resolve('public/news')

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry')
const ALL = argv.includes('--all')
const LIMIT = (() => { const i = argv.indexOf('--limit'); return i >= 0 ? Math.max(1, Number(argv[i + 1]) || 0) : Infinity })()
const YES = argv.includes('--yes')
const SAMPLE_DIR = (() => { const i = argv.indexOf('--sample-dir'); return i >= 0 ? resolve(argv[i + 1]) : null })()
const COST_PER_IMAGE = 0.063 // gpt-image-1 medium 1024x1536 (OPENAI_IMAGE_QUALITY 기본값)
const ONLY = (() => { const i = argv.indexOf('--only'); return i >= 0 ? new Set((argv[i + 1] || '').split(',').map((s) => s.trim()).filter(Boolean)) : null })()

function loadEnv(key) {
  if (process.env[key]) return process.env[key]
  for (const f of ['.dev.vars', '.env']) {
    try {
      for (const line of readFileSync(resolve(f), 'utf8').split('\n')) {
        const t = line.trim()
        if (!t || t.startsWith('#') || !t.includes('=')) continue
        const i = t.indexOf('=')
        if (t.slice(0, i).trim() === key) return t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
      }
    } catch { /* missing */ }
  }
  return undefined
}

// ── items 파일에서 각 기사 블록을 잘라낸다 (backfill-product-images.mjs 와 같은 방식) ──
function parseBlocks(file) {
  const s = readFileSync(file, 'utf8')
  const marks = [...s.matchAll(/^ {2}\{\n {4}slug: '([^']+)',/gm)].map((m) => ({ slug: m[1], idx: m.index }))
  return marks.map((mk, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].idx : s.length
    const chunk = s.slice(mk.idx, end)
    return {
      slug: mk.slug,
      chunk,
      hasImage: /\n {4}image:\s*'/.test(chunk),
      category: (chunk.match(/category:\s*'([^']*)'/) || [])[1] || '',
      title: (chunk.match(/title:\s*'((?:[^'\\]|\\.)*)'/) || [])[1] || '',
    }
  })
}

// ── 이미지 1장: 변주 3회 재시도 → sharp webp ──
// allBlocks = items.ts 전체 순서 — 이웃 카드와 피사체·색이 겹치지 않게 배정하려면 전체가 필요하다.
async function genImage(openaiKey, block, allBlocks) {
  const { slug } = block
  let b64
  for (let retry = 0; retry < 3 && !b64; retry++) {
    const axes = assignNewsImageAxes(allBlocks, { [slug]: retry }).get(slug)
    b64 = await generateImageB64(openaiKey, buildNewsImagePrompt(block, retry, axes), '3:4')
    if (!b64) console.warn(`    ↻ ${IMAGE_MODEL} 빈 응답(콘텐츠 필터 추정) — 변주 ${retry + 1} 재시도`)
  }
  if (!b64) throw new Error(`${IMAGE_MODEL}: 이미지 바이트 없음(변주 3회 모두 차단)`)
  if (SAMPLE_DIR) {
    mkdirSync(SAMPLE_DIR, { recursive: true })
    writeFileSync(resolve(SAMPLE_DIR, `${slug}.png`), Buffer.from(b64, 'base64'))
    return `${SAMPLE_DIR}/${slug}.png`
  }
  mkdirSync(IMG_DIR, { recursive: true })
  const outPath = resolve(IMG_DIR, `${slug}.webp`)
  await writeNewsWebp(Buffer.from(b64, 'base64'), outPath)
  return `/news/${slug}.webp`
}

// ── items 파일 블록에 `image:` 줄 삽입 (tags 다음 줄, gen-news.mjs serialize() 와 같은 위치) ──
function insertImageLine(file, slug, imagePath) {
  const src = readFileSync(file, 'utf8')
  const re = new RegExp(`(\\n {2}\\{\\n {4}slug: '${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]*?\\n {4}tags: \\[[^\\]]*\\],)`)
  const m = src.match(re)
  if (!m) return { ok: false, reason: '블록/tags 앵커 없음' }
  if (/\n {4}image:\s*'/.test(m[1])) return { ok: false, reason: '이미 image 있음' }
  const next = src.replace(re, `$1\n    image: '${imagePath}',`)
  if (next === src) return { ok: false, reason: '치환 실패' }
  writeFileSync(file, next)
  return { ok: true }
}

async function main() {
  const openaiKey = loadEnv('OPENAI_API_KEY')
  if (!DRY && !openaiKey) { console.error('OPENAI_API_KEY 없음 — 이미지 생성 불가'); process.exit(1) }

  const koBlocks = parseBlocks(ITEMS_KO)
  const enSlugs = new Set(parseBlocks(ITEMS_EN).map((b) => b.slug))

  let targets = ALL ? koBlocks : koBlocks.filter((b) => !b.hasImage)
  if (ONLY) targets = targets.filter((b) => ONLY.has(b.slug))
  targets = targets.slice(0, LIMIT)

  console.log(`대상: ${ALL ? '전체(--all)' : '무드컷 없는 뉴스만'} ${targets.length}개${DRY ? ' (--dry)' : ''}\n`)
  for (const b of targets) console.log(`  · [${b.category}] ${b.slug}  ${b.title}`)
  console.log(`\n예상 비용: ${targets.length}장 × $${COST_PER_IMAGE} ≈ $${(targets.length * COST_PER_IMAGE).toFixed(2)}${SAMPLE_DIR ? ` (샘플 → ${SAMPLE_DIR})` : ''}`)
  if (DRY) { console.log('\n--dry: 여기까지. API 호출 없음.'); return }
  if (targets.length > 5 && !YES) {
    console.error('\n⛔ 6장 이상은 --yes 필요. 먼저 check-news-image-variety.mjs 와 --sample-dir 샘플 검수를 거쳤는지 확인하세요.')
    process.exit(1)
  }
  console.log('')

  let ok = 0, fail = 0
  for (const b of targets) {
    try {
      console.log(`▶ [${b.category}] ${b.slug}`)
      const imagePath = await genImage(openaiKey, b, koBlocks)
      let koNote = SAMPLE_DIR ? '(샘플 — public/items.ts 변경 없음)' : '(이미 image 있음 — 파일만 갱신)'
      if (!b.hasImage && !SAMPLE_DIR) {
        const koRes = insertImageLine(ITEMS_KO, b.slug, imagePath)
        if (!koRes.ok) throw new Error(`KO 삽입 실패: ${koRes.reason}`)
        koNote = 'KO 삽입'
        if (enSlugs.has(b.slug)) {
          const enRes = insertImageLine(ITEMS_EN, b.slug, imagePath)
          koNote += enRes.ok ? ' · EN 삽입' : ` · EN 삽입 실패: ${enRes.reason}`
        }
      }
      console.log(`    ✅ ${imagePath}  · ${koNote}`)
      ok++
    } catch (e) {
      console.warn(`    ❌ ${e.message}`)
      fail++
    }
  }

  console.log(`\n완료: 성공 ${ok} · 실패 ${fail}.`)
  console.log('변경 확인 후 커밋하세요. (실패분은 다시 실행하면 이어서 처리됩니다)')
}

main()
