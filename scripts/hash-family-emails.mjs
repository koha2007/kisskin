// src/lib/internalTraffic.ts 의 가족·운영자 이메일 원문(FAMILY_EMAILS)을 해시(FAMILY_EMAIL_HASHES)로 바꾼다 — 2026-11-26.
// 공개 JS 번들에 이메일 원문이 실리지 않게. 비교 방식: sha256('kissinskin-internal:' + 소문자 이메일).
//
// 사용: 새 이메일을 추가할 때 internalTraffic.ts 에
//   const FAMILY_EMAILS = new Set([ '새주소', ... ])
// 블록을 (해시 Set 위에) 적고 `node scripts/hash-family-emails.mjs` — 기존 해시와 합쳐 원문 블록을 지운다.
// 출력에는 이메일 원문을 찍지 않는다(개수만).
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const FILE = 'src/lib/internalTraffic.ts'
const SALT = 'kissinskin-internal:'
let s = readFileSync(FILE, 'utf8')

const plain = /\/\/[^\n]*\n(?=const FAMILY_EMAILS = )|const FAMILY_EMAILS = new Set\(\[([\s\S]*?)\]\)\n?/g
const emails = []
s = s.replace(plain, (m, body) => {
  if (body) for (const x of body.matchAll(/'([^']+)'/g)) emails.push(x[1].trim().toLowerCase())
  return ''
})
const hashes = new Set(emails.map((e) => createHash('sha256').update(SALT + e).digest('hex')))

const existing = /const FAMILY_EMAIL_HASHES = new Set\(\[([\s\S]*?)\]\)/.exec(s)
if (existing) for (const x of existing[1].matchAll(/'([0-9a-f]{64})'/g)) hashes.add(x[1])

const block = `// 가족·운영자 계정 — 이메일 원문이 아니라 해시만 둔다(scripts/hash-family-emails.mjs 로 생성).\nconst FAMILY_EMAIL_HASHES = new Set([\n${[...hashes].map((h) => `  '${h}',`).join('\n')}\n])`
if (existing) s = s.replace(existing[0], block)
else s = s.replace(/let cached: boolean \| null = null/, `${block}\n\nlet cached: boolean | null = null`)

if (/@[a-z0-9-]+\.[a-z]/i.test(s.replace(/\/\/.*$/gm, ''))) { console.error('[hash] 아직 이메일 모양 글자가 남아 있음 — 확인 필요'); process.exit(1) }
writeFileSync(FILE, s)
console.log(`[hash] ${emails.length} emails → ${hashes.size} hashes`)
