// 럭키 메이크업 · 오늘의 운세 공용 — 이미지 저장/공유 (2026-10-24 두 페이지로 나누며 분리)
import { nativeSaveImage, isNativeApp } from '../nativePicker'

export async function canvasToDataUrl(cv: HTMLCanvasElement) { return cv.toDataURL('image/jpeg', 0.92) }

/** 앱이면 앨범 저장, 웹이면 공유 시트(파일) → 안 되면 다운로드 */
export async function saveOrShare(dataUrl: string, name: string, isEn: boolean) {
  if (isNativeApp()) { await nativeSaveImage(dataUrl); return }
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], name, { type: 'image/jpeg' })
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean }
    if (nav.canShare?.({ files: [file] })) { await nav.share({ files: [file], title: isEn ? 'kissinskin' : '키스인스킨' }); return }
  } catch { /* 공유 취소 등 → 다운로드로 */ }
  const a = document.createElement('a'); a.href = dataUrl; a.download = name; a.click()
}
