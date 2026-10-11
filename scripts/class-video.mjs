// 메이크업 클래스 → JJ 변신 영상 한 편 전체 (주간 자동발행 weekly-content.yml 에서 호출)
// ────────────────────────────────────────────────────────────────────
// 1) gen-class-media.mjs      JJ 사진 3장(민낯·베이스·완성)                gpt-image-2 ≈ $0.44~0.66
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

const dir = `casting/class/${slug}`
const run = (cmd, args) => { console.log(`\n$ ${cmd} ${args.join(' ')}`); execFileSync(cmd, args, { stdio: 'inherit', env: process.env }) }
console.log(`[class-video] ${slug}`)
run('node', ['scripts/gen-class-media.mjs', slug, `--out=${dir}`])
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
