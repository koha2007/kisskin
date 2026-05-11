#!/usr/bin/env node
// searchKeywords 검증 — 규칙은 src/lib/recommendations/types.ts 상단 주석 참조
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const FILES = [
  'src/lib/recommendations/face-shape.ts',
  'src/lib/recommendations/personal-color.ts',
  'src/lib/recommendations/makeup-mbti.ts',
  'src/lib/recommendations/perfume-type.ts',
]

const MAX_WORDS = 5

const BANNED_TOKENS = new Set([
  '둥글게', '둥글', '사선', '세로', '가로', 'V자',
  '광대', '헤어라인', '콧등',
  '각진형', '둥근형', '긴형', '하트형', '계란형', '오벌형',
])

const BANNED_PHRASES = [
  '내 입술 같은',
  '광대 위', '광대 아래',
  '볼 위', '볼 아래',
]

const violations = []

for (const file of FILES) {
  const content = readFileSync(resolve(file), 'utf8')
  content.split('\n').forEach((line, i) => {
    const m = line.match(/searchKeywords:\s*'([^']+)'/)
    if (!m) return
    const keyword = m[1]
    const words = keyword.trim().split(/\s+/)
    const lineNo = i + 1

    if (words.length > MAX_WORDS) {
      violations.push(`${file}:${lineNo}  단어 ${words.length}개 (최대 ${MAX_WORDS})  →  "${keyword}"`)
    }
    for (const w of words) {
      if (BANNED_TOKENS.has(w)) {
        violations.push(`${file}:${lineNo}  금지 토큰 "${w}"  →  "${keyword}"`)
      }
    }
    for (const p of BANNED_PHRASES) {
      if (keyword.includes(p)) {
        violations.push(`${file}:${lineNo}  금지 구문 "${p}"  →  "${keyword}"`)
      }
    }
    if (/번짐/.test(keyword) && !/번짐\s*방지/.test(keyword)) {
      violations.push(`${file}:${lineNo}  부정 어감 "번짐" (단, "번짐 방지"는 OK)  →  "${keyword}"`)
    }
  })
}

if (violations.length === 0) {
  console.log('✅ searchKeywords 검증 통과')
  process.exit(0)
}

console.error('❌ searchKeywords 검증 실패:\n')
violations.forEach((v) => console.error('  ' + v))
console.error(`\n총 ${violations.length}건 위반.`)
console.error('규칙: src/lib/recommendations/types.ts 상단 주석 참조')
process.exit(1)
