#!/usr/bin/env node
/**
 * 홈 '실제 사람' 섹션 띠 — 운영자 koha 의 9룩 정면 사진을 사이트용으로 자른다.
 *
 *   node scripts/crop-real-person.mjs
 *
 * 원본: casting/originals/OpenAI Playground 2026-07-19 at 17.11.23.png (git 밖, 1086×1448 3×3, 2026-10-18 운영자 지정).
 * 칸마다 아래쪽에 한국어 라벨이 박혀 있어 라벨 위까지만 4:5(320×400)로 자른다. 순서 = 9룩 번호 순.
 * (그 전엔 비스듬한 컬렉션 낱장 casting/originals/1-002~010.jpg 를 썼다 — 운영자가 정면 사진으로 바꾸라 함.)
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const SRC = 'casting/originals/OpenAI Playground 2026-07-19 at 17.11.23.png'
const ORDER = ['natural-glow', 'cloud-skin', 'blood-lip', 'maximalist-eye', 'metallic-eye', 'bold-lip', 'blush-draping', 'grunge', 'kpop-idol']
const { width, height } = await sharp(SRC).metadata()
const cw = width / 3, ch = height / 3
await mkdir('public/real', { recursive: true })
for (const [i, id] of ORDER.entries()) {
  const r = Math.floor(i / 3), c = i % 3
  await sharp(SRC)
    .extract({ left: Math.round(c * cw + 21), top: Math.round(r * ch + 6), width: 320, height: 400 })
    .webp({ quality: 82 })
    .toFile(`public/real/koha-front-${id}.webp`)
  console.log('✓', id)
}
