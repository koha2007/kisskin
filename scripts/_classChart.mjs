// 메이크업 클래스 페이스 차트 1장 — 9룩 차트와 **같은 빈 도안**(public/looks/charts/blank.webp)에
// 그 편의 메이크업만 칠한다(gpt-image-2 edit). 같은 도안이라 CHART_CROP 좌표 한 세트로
// 단계 확대가 된다. 원본 생성기: _archive/originals/face-charts/gen-face-charts.mjs (2026-10-02).
// 비용: high 1024×1536 ≈ $0.22/장 (2026-09 실측).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

export const CHART_DIR = resolve('public/class/charts')

export async function makeClassChart(apiKey, slug, makeup) {
  if (!apiKey) throw new Error('OPENAI_API_KEY 없음 — 차트 생성 불가')
  const blankPng = await sharp(readFileSync(resolve('public/looks/charts/blank.webp'))).png().toBuffer()
  const fd = new FormData()
  fd.append('model', 'gpt-image-2')
  fd.append('size', '1024x1536')
  fd.append('quality', 'high')
  fd.append('image', new Blob([blankPng], { type: 'image/png' }), 'blank.png')
  fd.append('prompt',
    `Paint makeup onto this exact face chart as a makeup artist would, using real makeup textures (powder, cream, pigment, shimmer) applied on the paper: ${makeup}. ` +
    'Keep the line art, face, pose, framing and paper exactly the same — only add the makeup color on the face and neck. Do not draw hands, tools, products or any other object. No text, no letters, no numbers, no arrows, no logos.')
  const r = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: fd })
  const j = await r.json()
  if (!r.ok) throw new Error(`gpt-image-2 edit ${r.status}: ${JSON.stringify(j).slice(0, 300)}`)
  mkdirSync(CHART_DIR, { recursive: true })
  const out = resolve(CHART_DIR, `${slug}.webp`)
  writeFileSync(out, await sharp(Buffer.from(j.data[0].b64_json, 'base64')).webp({ quality: 84 }).toBuffer())
  return out
}
