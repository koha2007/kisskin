#!/usr/bin/env node
// 일반 배포(main push) 때 바뀐 페이지만 네이버·Bing 에 색인 요청 (2026-11-02)
// ──────────────────────────────────────────────
//   node scripts/indexnow-deploy.mjs <이전 SHA> <새 SHA> [--dry]
// 변경 파일 → 공개 URL 로 바꿔 scripts/indexnow.mjs 에 넘긴다.
//   · 사이트맵에 새로 생긴 URL 은 항상 포함(맨 앞 — 배포 확인에도 쓴다)
//   · 코드만 바뀌어 화면이 그대로인 커밋(functions·scripts·.github·docs)은 제출하지 않는다
//   · 자동 발행 글은 weekly-content.yml 이 이미 제출한다(content 데이터는 여기서 다루지 않음)
// 구글은 IndexNow 미지원 — 사이트맵과 서치콘솔 URL 검사로만 간다.
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const [before, after] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const DRY = process.argv.includes('--dry')
const SITE = 'https://kissinskin.net'
const MAX = 100

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' })
const LOOKS = ['natural-glow', 'spring-blush', 'summer-glow', 'autumn-berry', 'winter-frost', 'cloud-skin', 'blood-lip', 'maximalist-eye', 'kpop-idol']
const LUCKY = ['wealth', 'love', 'marriage', 'reunion', 'career', 'exam', 'health', 'popularity', 'travel']
const TOOLS = ['personal-color', 'face-shape', 'makeup-mbti', 'perfume-type', 'beauty-dna', 'today-fortune']
const CORE = ['/', '/makeup/', '/lucky-makeup/', '/looks/', '/tools/']
const looks = LOOKS.map((i) => `/looks/${i}/`)
const lucky = LUCKY.map((i) => `/lucky-makeup/${i}/`)

// [변경 파일 판별, 다시 알릴 경로] — 경로는 한국어 기준, 영문은 아래에서 함께 넣는다.
const RULES = [
  [/^src\/index\.css$|^pages\/\+(Layout|Head|config)|^src\/components\/ToolsLayout|^src\/i18n\/|^index\.html$|^public\/fonts\//, CORE],
  [/^src\/HomePage|^src\/components\/home\/|^pages\/index\//, ['/']],
  [/^src\/pages\/AiMakeupPage|^pages\/(en\/)?makeup\/|^src\/lib\/makeup\/(generateLook|MakeupPageHead)/, ['/makeup/']],
  [/^src\/lib\/makeup\/styles|^src\/lib\/makeup\/lookImages|^public\/styles\/looks\//, ['/', '/makeup/', '/looks/', ...looks]],
  [/^src\/pages\/LooksHub|^pages\/(en\/)?looks\/\+/, ['/looks/']],
  [/^src\/pages\/LookHowTo|^src\/lib\/looks\/|^pages\/(en\/)?looks\/@id|^public\/looks\/charts\//, ['/looks/', ...looks]],
  [/^src\/pages\/FortuneMakeup|^pages\/(en\/)?lucky-makeup\/\+/, ['/lucky-makeup/']],
  [/^src\/lib\/fortune\/|^public\/fortune\/|^src\/pages\/LuckyLookHowTo|^pages\/(en\/)?lucky-makeup\/@id/, ['/lucky-makeup/', ...lucky]],
  [/^src\/pages\/ToolsHub|^pages\/(en\/)?tools\/\+/, ['/tools/']],
  [/^src\/pages\/PersonalColor|^src\/lib\/personal-color|^src\/lib\/recommendations\/personal-color/, ['/tools/personal-color/']],
  [/^src\/pages\/FaceShape|^src\/lib\/face-shape|^src\/lib\/recommendations\/face-shape/, ['/tools/face-shape/']],
  [/^src\/pages\/MakeupMbti|^src\/lib\/makeup-mbti|^src\/lib\/recommendations\/makeup-mbti/, ['/tools/makeup-mbti/']],
  [/^src\/pages\/PerfumeType|^src\/lib\/perfume-type|^src\/lib\/recommendations\/perfume-type/, ['/tools/perfume-type/']],
  [/^src\/pages\/BeautyDna|^src\/lib\/beauty-dna|^src\/components\/beauty-dna/, ['/tools/beauty-dna/']],
  [/^src\/pages\/TodayFortune/, ['/tools/today-fortune/']],
  [/^src\/components\/result-grid\//, TOOLS.slice(0, 4).map((t) => `/tools/${t}/`)],
  [/^src\/pages\/AboutPage|^pages\/(en\/)?about\//, ['/about/']],
  [/^src\/pages\/AboutMakeupAi|^pages\/(en\/)?about-makeup-ai\//, ['/about-makeup-ai/']],
  [/^src\/pages\/contact|^pages\/(en\/)?contact\//, ['/contact/']],
  [/^src\/pages\/privacy|^pages\/(en\/)?privacy\//, ['/privacy/']],
  [/^src\/pages\/terms|^pages\/(en\/)?terms\//, ['/terms/']],
  [/^src\/pages\/refund|^pages\/(en\/)?refund\//, ['/refund/']],
  [/^src\/pages\/ClassHub|^pages\/(en\/)?class\/\+/, ['/class/']],
  [/^src\/pages\/NewsHub/, ['/news/']], [/^src\/pages\/GuidesHub/, ['/guides/']],
  [/^src\/pages\/ReviewsHub/, ['/reviews/']], [/^src\/pages\/ProductsHub/, ['/products/']],
]

let files
let sitemapNew = []
try {
  files = git('diff', '--name-only', before, after).split('\n').filter(Boolean)
  sitemapNew = git('diff', '-U0', before, after, '--', 'public/sitemap.xml').split('\n')
    .map((l) => l.match(/^\+\s*<loc>([^<]+)<\/loc>/)?.[1]).filter(Boolean)
} catch {
  console.log('이전 커밋과 비교할 수 없어 핵심 페이지만 제출합니다.')
  files = ['index.html']
}

const paths = new Set()
for (const f of files) for (const [re, ps] of RULES) if (re.test(f)) ps.forEach((p) => paths.add(p))
const urls = [...sitemapNew]
for (const p of paths) urls.push(SITE + p, SITE + '/en' + p)
const list = [...new Set(urls)].slice(0, MAX)

console.log(`변경 파일 ${files.length}개 · 제출 대상 ${list.length}개 URL`)
if (!list.length) { console.log('공개 페이지 변경 없음 — 제출하지 않습니다.'); process.exit(0) }
if (DRY) { list.forEach((u) => console.log('  ' + u)); process.exit(0) }

const script = resolve(dirname(fileURLToPath(import.meta.url)), 'indexnow.mjs')
process.exit(spawnSync('node', [script, '--wait', ...list], { stdio: 'inherit' }).status ?? 1)
