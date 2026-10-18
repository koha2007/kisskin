#!/usr/bin/env node
/**
 * 홈 '실제 사람' 섹션 — 운영자 koha 의 9룩 컬렉션 낱장(라이브 도구 결과)을 사이트용으로 자른다.
 *
 *   node scripts/crop-real-person.mjs
 *
 * 원본: casting/originals/1-002.jpg ~ 1-009.jpg (git 밖, 1080×1350 낱장 카드, 2026-10-18 운영자 제공).
 * 카드 안 사진 영역은 x 166~914, y 106~1110. 아래 라벨 띠(y ~1040~)는 폰에서 카드를 넘기던 중
 * 캡처돼 다음 카드 라벨이 겹쳐 비치는 장이 있어서(3·6번) 라벨 위까지만 4:5 로 자른다.
 * 9번째(K-pop 아이돌)는 받은 파일에 없다.
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const MAP = ['natural-glow', 'cloud-skin', 'blood-lip', 'maximalist-eye', 'metallic-eye', 'bold-lip', 'blush-draping', 'grunge']
await mkdir('public/real', { recursive: true })
for (const [i, id] of MAP.entries()) {
  const src = `casting/originals/1-${String(i + 2).padStart(3, '0')}.jpg`
  await sharp(src).extract({ left: 168, top: 106, width: 744, height: 930 }).resize(480, 600).webp({ quality: 80 }).toFile(`public/real/koha-${id}.webp`)
  console.log('✓', src, '→', id)
}
