// AI 생성 표시를 이미지 자체에 박는다 (2026-11-25, AI 기본법 제31조 — 실제 사람을 닮은 결과물 = 눈에 보이는 표시)
// 화면 위 DOM 워터마크만 있으면 길게 눌러 저장할 때 표시 없는 사진이 나간다.

/**
 * 2026-11-25 미리보기 사진 자체에 표시를 박는다. 화면 위 워터마크(DOM)만 있으면 길게 눌러 저장할 때
 * 표시 없는 사진이 나간다 → AI 기본법 제31조(실제 사람을 닮은 결과물 = 눈에 보이는 표시).
 * 실패하면 원본을 그대로 쓴다(화면 워터마크는 남아 있음).
 */
export async function stampPreview(src: string, isEn: boolean): Promise<string> {
  try {
    const img = new Image()
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('load')); img.src = src })
    const c = document.createElement('canvas')
    c.width = img.naturalWidth; c.height = img.naturalHeight
    const ctx = c.getContext('2d')
    if (!ctx) return src
    ctx.drawImage(img, 0, 0)
    const f = Math.max(12, Math.round(c.width * 0.04))
    ctx.save()
    ctx.translate(c.width / 2, c.height / 2)
    ctx.rotate(-24 * Math.PI / 180)
    ctx.font = `800 ${f}px system-ui, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255,255,255,0.38)'
    const line = isEn ? 'kissinskin · AI-generated · PREVIEW' : 'kissinskin · AI 생성 · PREVIEW'
    for (let i = -3; i <= 3; i++) ctx.fillText(line, 0, i * f * 3.2)
    ctx.restore()
    const label = isEn ? 'AI-generated' : 'AI 생성'
    const lf = Math.max(11, Math.round(c.width * 0.032))
    ctx.font = `700 ${lf}px system-ui, sans-serif`
    const w = ctx.measureText(label).width + lf * 1.2, h = lf * 1.7, m = lf * 0.8
    ctx.fillStyle = 'rgba(7,9,40,0.62)'
    ctx.fillRect(c.width - w - m, c.height - h - m, w, h)
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText(label, c.width - w - m + lf * 0.6, c.height - h / 2 - m)
    return c.toDataURL('image/jpeg', 0.9)
  } catch { return src }
}

/** 고화질 결과용 — 오른쪽 아래 작은 "AI 생성" 알약만(워터마크 없음). 실패하면 원본. */
export async function stampLabel(src: string, isEn: boolean): Promise<string> {
  try {
    const img = new Image()
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('load')); img.src = src })
    const c = document.createElement('canvas')
    c.width = img.naturalWidth; c.height = img.naturalHeight
    const ctx = c.getContext('2d')
    if (!ctx) return src
    ctx.drawImage(img, 0, 0)
    const label = isEn ? 'AI-generated · kissinskin' : 'AI 생성 · kissinskin'
    const lf = Math.max(12, Math.round(c.width * 0.024))
    ctx.font = `700 ${lf}px system-ui, sans-serif`
    const w = ctx.measureText(label).width + lf * 1.2, h = lf * 1.7, m = lf * 0.9
    ctx.fillStyle = 'rgba(7,9,40,0.62)'
    ctx.fillRect(c.width - w - m, c.height - h - m, w, h)
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText(label, c.width - w - m + lf * 0.6, c.height - h / 2 - m)
    return c.toDataURL('image/jpeg', 0.92)
  } catch { return src }
}
