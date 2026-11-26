// 아이콘 폰트(Material Symbols) 필요한 것만 받기 — 2026-11-26 홈 점검: 전체 폰트 2.3MB → 쓰는 아이콘만 ≈124KB.
// 빌드마다 소스에서 아이콘 이름을 모아 src/lib/iconNames.generated.ts 를 다시 쓴다(새 아이콘을 써도 자동 포함).
// 모으는 곳: ① material-symbols 스팬 안 글자 ② 아이콘을 쓰는 파일의 따옴표 문자열(데이터의 icon 필드 등)
// → scripts/material-symbols-names.txt(구글 공식 이름 목록)와 겹치는 것만. 넉넉하게 잡혀도 손해는 몇 KB.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const valid = new Set(readFileSync('scripts/material-symbols-names.txt', 'utf8').split('\n').map((s) => s.trim()).filter(Boolean))
const files = []
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(tsx?|html)$/.test(f) && !f.endsWith('.generated.ts')) files.push(p) } }
walk('src'); walk('pages')
const used = new Set()
for (const f of files) {
  const s = readFileSync(f, 'utf8')
  for (const m of s.matchAll(/material-symbols[^>]*>\s*([a-z0-9_]+)\s*</g)) used.add(m[1])
  if (s.includes('material-symbols') || /\bicon\w*\s*[:=]/.test(s)) for (const m of s.matchAll(/['"`]([a-z][a-z0-9_]{1,40})['"`]/g)) used.add(m[1])
}
const names = [...used].filter((n) => valid.has(n)).sort()
writeFileSync('src/lib/iconNames.generated.ts', `// 자동 생성(scripts/gen-icon-names.mjs) — 손으로 고치지 말 것\nexport const ICON_NAMES = '${names.join(',')}'\n`)
console.log(`[icons] ${names.length} material symbols`)
