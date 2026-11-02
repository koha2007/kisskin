#!/usr/bin/env node
/**
 * 9룩 이미지의 홈 히어로용 경량본 — 원본(1024×1536, 장당 ~110KB)을 그대로 쓰면
 * 홈 첫 화면이 9룩 썸네일만으로 1MB 를 받는다(2026-10-18 실측). 로컬 sharp, API 0원.
 *
 *   node scripts/gen-look-variants.mjs
 *
 * hero/{id}-{before,after}.webp  600×900  — 히어로 비포/애프터 슬라이더(LCP)
 * thumb/{id}.webp                 192×192 — 룩 고르기 동그라미(얼굴 중심 크롭)
 * thumb/{id}-before.webp          192×192 — /analysis/ 업로드 화면 '이런 셀카면 → 이렇게' 예시
 * 원본을 다시 만들면 이 스크립트도 다시 돌리고 lookImages.ts 의 V 를 올릴 것.
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { MAKEUP_IDS } from './_lookIds.mjs'

const DIR = 'public/styles/looks'
await mkdir(`${DIR}/hero`, { recursive: true })
await mkdir(`${DIR}/thumb`, { recursive: true })
for (const id of MAKEUP_IDS) {
  for (const kind of ['before', 'after']) {
    await sharp(`${DIR}/${id}-${kind}.webp`).resize(600, 900).webp({ quality: 80 }).toFile(`${DIR}/hero/${id}-${kind}.webp`)
  }
  // 2026-11-02 새 모델 원본: 눈 y≈655·입 y≈950 — 럭키 버튼 사진(object-position 22%)과 같은 범위로 잘라 얼굴 크기를 맞춘다(현재 9룩만, 보관 룩은 옛 파일 유지).
  await sharp(`${DIR}/${id}-after.webp`).extract({ left: 0, top: 113, width: 1024, height: 1024 }).resize(192, 192).webp({ quality: 78 }).toFile(`${DIR}/thumb/${id}.webp`)
  await sharp(`${DIR}/${id}-before.webp`).extract({ left: 0, top: 113, width: 1024, height: 1024 }).resize(192, 192).webp({ quality: 78 }).toFile(`${DIR}/thumb/${id}-before.webp`)
  console.log('✓', id)
}
