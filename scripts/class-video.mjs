// 메이크업 클래스 → JJ 변신 영상 한 편 전체 (주간 자동발행 weekly-content.yml 에서 호출)
// ────────────────────────────────────────────────────────────────────
// 1) gen-class-media.mjs      JJ 사진 2장(베이스·완성) — 민낯=헤어 마스터 그대로  gpt-image-2 ≈ $0.22~0.44
// 2) class-steps-composite.py 단계 사진(부위 마스크 합성)                 비용 0
// 3) gen-class-video.mjs      단계 사이 전환 클립(Kling v3 Pro 3초 × 단계) ≈ $0.42/단계
// 4) build-class-video.py     한/영 틱톡용 1080p + 웹용 720p + 포스터      비용 0
// 5) lessons.json 에 video: { seconds } 기록 → 클래스 페이지에 영상이 뜬다
// 틱톡용 원본은 out/class-video/ 에 모은다(워크플로가 Actions 아티팩트로 올림 — 리포에는 안 넣는다).
//
// 대상: 인자로 slug 를 주면 그 편, 없으면 영상이 없는 가장 최근 편 하나.
// '시작하기' 파트(1~4편)는 도구·개념 편이 섞여 있어 자동 대상에서 뺀다(1편은 손으로 만들었다).
// 사용: node --env-file=.env scripts/class-video.mjs [slug]
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const LESSONS = 'src/lib/class/lessons.json'
const { CURRICULUM } = await import(new URL('../src/lib/class/curriculum.ts', import.meta.url).href)
const lessons = JSON.parse(readFileSync(LESSONS, 'utf8'))
const partOf = (slug) => CURRICULUM.find((c) => c.slug === slug)?.part

const slug = process.argv[2] || [...lessons].reverse().find((l) => !l.video && partOf(l.slug) !== 'start')?.slug
if (!slug) { console.log('[class-video] 영상 만들 편 없음'); process.exit(0) }
if (!process.env.OPENAI_API_KEY || !process.env.FAL_KEY) { console.error('[class-video] OPENAI_API_KEY / FAL_KEY 필요'); process.exit(1) }

// JJ 헤어 마스터(2026-10-11 운영자 확정) — 메이크업 수업은 머리를 넘겨야 부위가 보이고, 33편이 같은 사진이면 지루하다.
// 얼굴은 하나(scripts/gen-jj-hair.mjs 로 만들고 사람이 골랐다), 파트마다 2종을 편 번호로 번갈아 → 연달아 같은 헤어가 안 나온다.
const HAIR_BY_PART = {
  start: ['headband', 'tucked'], base: ['headband', 'bun'], brows: ['halfup', 'headband'], eyes: ['ponytail', 'halfup'],
  cheeks: ['bun', 'braid'], lips: ['braid', 'tucked'], everyday: ['tucked', 'ponytail'],
}
const hairOf = {}  // 커리큘럼 순서대로 — 앞 편과 겹치면(파트 경계) 다른 하나
for (const [i, c] of CURRICULUM.entries()) {
  const [a, b] = HAIR_BY_PART[c.part] || HAIR_BY_PART.everyday, h = c.n % 2 ? b : a
  hairOf[c.slug] = i && hairOf[CURRICULUM[i - 1].slug] === h ? (h === a ? b : a) : h
}
const cur = CURRICULUM.find((c) => c.slug === slug)
const hair = hairOf[slug] || 'tucked'
const dir = `casting/class/${slug}`
const run = (cmd, args) => { console.log(`\n$ ${cmd} ${args.join(' ')}`); execFileSync(cmd, args, { stdio: 'inherit', env: process.env }) }
console.log(`[class-video] ${slug} (part=${cur?.part}, hair=${hair})`)
run('node', ['scripts/gen-class-media.mjs', slug, `--out=${dir}`, `--master=scripts/assets/jj-hair-${hair}.webp`, '--bare-master'])
run('python3', ['scripts/class-steps-composite.py', slug, `--dir=${dir}`])
run('node', ['scripts/gen-class-video.mjs', slug, `--dir=${dir}`])
run('python3', ['scripts/build-class-video.py', slug, `--dir=${dir}`])

// 훅 1.6초 + 단계당 3초 + 완성 1초 + 엔딩 2.4초 (build-class-video.py 와 같은 타임라인)
const fresh = JSON.parse(readFileSync(LESSONS, 'utf8'))
const l = fresh.find((x) => x.slug === slug)
l.video = { seconds: Math.round(1.6 + 3 * l.steps.length + 3 + 2.4) }  // 훅 + 단계 + 완성(핀 0.8 + 얼굴만 2.2) + 엔딩
writeFileSync(LESSONS, JSON.stringify(fresh, null, 2) + '\n')

mkdirSync('out/class-video', { recursive: true })
for (const f of readdirSync(dir).filter((f) => f.endsWith('-tiktok.mp4'))) copyFileSync(`${dir}/${f}`, `out/class-video/${f}`)
console.log(`[class-video] ✅ ${slug} — ${l.video.seconds}초 · public/class/video/${slug}-{ko,en}.mp4 · out/class-video/`)
