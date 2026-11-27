// AI 이상형 — 유료 고르기용 "실사 AI 가상 인물" 기준 사진 (2026-11-27 운영자: 유료는 그림 말고 실제 사람으로)
//   ① ref  : 무료 그림(피크닉) → 같은 사람·옷의 실사 프로필 사진(허리 위, 크림 배경 통일) · high ≈ $0.17/장
//   ② test : 그 실사 사진을 참고로 실제 유료와 같은 프롬프트(단독·데이트)를 돌려 "같은 사람으로 나오나" 확인 · medium
//   npx tsx scripts/gen-ideal-type-real.mts ref golden-retriever
//   npx tsx scripts/gen-ideal-type-real.mts test golden-retriever
//   결과: tmp-ideal-type/real/ (git 제외) — 검수 뒤에만 public 으로
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { IDEAL_MAKEUP, IDEAL_TYPES, type IdealOutfit, type IdealTypeCode } from '../src/lib/ideal-type/types'
import { buildSidePrompt, buildSoloPrompt } from '../functions/api/ideal-side'

const ROOT = resolve(import.meta.dirname, '..')
const env: Record<string, string> = Object.fromEntries(readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const OUT = resolve(ROOT, 'tmp-ideal-type/real')
mkdirSync(OUT, { recursive: true })

const [mode, code] = process.argv.slice(2) as ['ref' | 'test', IdealTypeCode | 'all']
if (code !== 'all' && !IDEAL_TYPES[code]) throw new Error('type?')

function endpoint() {
  const base = env.OPENAI_BASE_URL?.replace(/\/$/, '')
  const headers: Record<string, string> = {}
  let url = 'https://api.openai.com/v1/images/edits'
  if (base && env.CF_AIG_TOKEN) { url = `${base}/v1/images/edits`; headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}` }
  else { if (base) url = `${base}/v1/images/edits`; headers.Authorization = `Bearer ${env.OPENAI_API_KEY}` }
  return { url, headers }
}

async function edit(id: string, images: string[], prompt: string, quality: 'high' | 'medium') {
  const out = resolve(OUT, `${id}.webp`)
  if (existsSync(out)) { console.log('skip', id); return }
  const { url, headers } = endpoint()
  const fd = new FormData()
  fd.append('model', 'gpt-image-2'); fd.append('size', '1024x1536'); fd.append('quality', quality); fd.append('n', '1')
  for (const [i, p] of images.entries()) fd.append('image[]', new Blob([await sharp(p).png().toBuffer()], { type: 'image/png' }), `in${i}.png`)
  fd.append('prompt', prompt)
  const res = await fetch(url, { method: 'POST', headers, body: fd })
  const text = await res.text()
  if (!res.ok) throw new Error(`${id} ${res.status} ${text.slice(0, 300)}`)
  await sharp(Buffer.from(JSON.parse(text).data[0].b64_json, 'base64')).webp({ quality: 90 }).toFile(out)
  console.log('ok', id)
}

// 11/27 다시 뽑기: 늑대상 여 = 크롭 후드(배 노출)·인상이 한국인 같지 않음, 여우상 여 = 인상 보정
const FIX: Record<string, string> = {
  'wolf-f': ' IMPORTANT: she is clearly an ethnically Korean woman with natural East Asian Korean features (monolid or soft double eyelids, natural Korean face), not Southeast Asian or mixed. The grey hoodie is a REGULAR full-length hoodie that fully covers her stomach — NOT cropped, no bare midriff. Natural light makeup with a muted rose lip (no red lip).',
  'fox-f': ' IMPORTANT: she is clearly an ethnically Korean woman with natural Korean features and a fresh, youthful late-20s look. The blouse is buttoned up modestly (no deep neckline).',
}

function refPrompt(c: IdealTypeCode, g: 'm' | 'f') {
  const t = IDEAL_TYPES[c]
  return (
    'Turn the illustrated person in the image into ONE photorealistic portrait photo of an original, fictional Korean ' +
    `${g === 'm' ? 'man' : 'woman'} in their late 20s with a "${t.en}" vibe: ${t.faceEn.join(', ').toLowerCase()}. ` +
    'Keep the same hairstyle, hair length and colour, the same outfit and its colours as the illustration. ' +
    `Makeup: ${IDEAL_MAKEUP[c][g]} ` +
    'Framed from the waist up, face large and clearly the focus, looking straight at the camera with a natural, warm expression, body slightly angled. ' +
    'Background: one plain seamless warm cream paper backdrop, soft even studio light. 85mm lens, crisp focus on the eyes, real skin texture and natural hair, no plastic smoothing. ' +
    'An attractive but believable everyday person — must NOT resemble any celebrity, idol, actor or real person. ' +
    'Non-sexual, fully clothed, modest. Portrait orientation. No text, letters, numbers, logos or watermark.' +
    (FIX[`${c}-${g}`] ?? '')
  )
}


// 동시 4개(속도 제한 대비)
const pool = async (jobs: (() => Promise<void>)[], n = 4) => {
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => { while (i < jobs.length) { const j = jobs[i++]; await j().catch((e) => { console.error('FAIL', (e as Error).message); process.exitCode = 1 }) } }))
}

if (mode === 'ref') {
  const codes = code === 'all' ? (Object.keys(IDEAL_TYPES) as IdealTypeCode[]) : [code]
  await pool(codes.flatMap((c) => (['m', 'f'] as const).map((g) => () => edit(`${c}-${g}`, [resolve(ROOT, `tmp-ideal-type/set/${c}-${g}-picnic.webp`)], refPrompt(c, g), 'high'))))
} else {
  if (code === 'all') throw new Error('test 는 유형 1개')
  // 사용자 셀카 대역: 남 이상형 ↔ 여자 예시 모델(9-kpop-idol.png), 여 이상형 ↔ 운영자 사진(기존 예시와 같은 조합)
  const userFor = { m: resolve(ROOT, '9-kpop-idol.png'), f: resolve(ROOT, 'public/real/koha-front-natural-glow.webp') }
  // 의상: 3번째 인자(쉼표로 남,여) — 예: test wolf quarterzip,oldmoney  · 사이트에 들어간 참고 사진(public)으로 시험
  const [om, of] = ((process.argv[4] || 'type,type').split(',')) as [IdealOutfit, IdealOutfit]
  const outfitFor = { m: om, f: of ?? om }
  const jobs: (() => Promise<void>)[] = []
  for (const g of ['m', 'f'] as const) {
    const ref = resolve(ROOT, `public/ideal-type/real/${code}-${g}.webp`)
    if (!existsSync(ref)) throw new Error(`먼저 ref: ${ref}`)
    const o = outfitFor[g]
    jobs.push(() => edit(`test-${code}-${g}-solo-${o}`, [ref], buildSoloPrompt(code, g, o), 'medium'))
    jobs.push(() => edit(`test-${code}-${g}-side-${o}`, [userFor[g], ref], buildSidePrompt(code, g, g === 'm' ? 'picnic' : 'photobooth', o), 'medium'))
  }
  await pool(jobs)
}
