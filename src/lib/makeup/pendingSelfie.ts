// 홈 → /analysis/ 셀카 핸드오프 + 로그인/충전 왕복 보존 (2026-07-12, 2026-07-16 확장)
// ────────────────────────────────────────────────────────────────────
// ① 홈 히어로에서 사진을 고르면 그대로 생성 흐름으로 들어가게 한다(업로드 단계 중복 제거).
// ② 생성 흐름 도중 로그인/충전으로 페이지를 떠나도 돌아오면 사진이 살아있게 한다
//    (로그인하고 왔더니 처음부터 다시 찍어야 하던 이탈 포인트 제거 — 2026-07-16 실기기).
// 파일 객체는 페이지 이동에서 살아남지 못하므로 dataURL 로 바꿔 sessionStorage 에 맡긴다.
//   · sessionStorage 는 탭 단위 + 용량이 5MB 안팎 → 반드시 축소해서 넣는다.
//   · 원본 비율은 유지한다(생성 결과가 원본 비율을 따르므로 여기서 크롭하면 안 된다).
//   · 생성이 성공하거나 사용자가 "다시 찍기"를 누르면 지운다(옛 사진 부활 방지).

const KEY = 'kisskin_pending_selfie'
const MAX_EDGE = 1280      // 긴 변 기준. gpt-image-2 입력은 이보다 작게 다시 맞춰지므로 충분.
const QUALITY = 0.85

/** 이미지 src(objectURL/dataURL)를 축소한 JPEG dataURL 로 만들어 세션에 저장. 실패하면 false. */
export async function savePendingSelfieFromSrc(src: string): Promise<boolean> {
  try {
    const img = new Image()
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej(new Error('image load failed'))
      img.src = src
    })
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.round(img.naturalWidth * scale)
    const h = Math.round(img.naturalHeight * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    ctx.drawImage(img, 0, 0, w, h)
    sessionStorage.setItem(KEY, canvas.toDataURL('image/jpeg', QUALITY))
    return true
  } catch {
    // HEIC 등 브라우저가 디코드 못 하는 포맷 → 저장 실패. /analysis/ 의 업로드 화면이 처리한다.
    return false
  }
}

/** 파일을 축소한 JPEG dataURL 로 만들어 세션에 저장. 실패하면 false(호출부는 그냥 이동). */
export async function savePendingSelfie(file: File): Promise<boolean> {
  try {
    const url = URL.createObjectURL(file)
    try {
      return await savePendingSelfieFromSrc(url)
    } finally {
      URL.revokeObjectURL(url)
    }
  } catch {
    return false
  }
}

/** 이미 축소된 dataURL 을 다시 맡긴다(꺼낸 걸 로그인 왕복 대비로 되돌려 놓을 때). */
export function keepPendingSelfie(dataUrl: string) {
  try { sessionStorage.setItem(KEY, dataUrl) } catch { /* 저장 실패는 무시 */ }
}

/** 보관 중인 셀카를 지운다(생성 성공/다시 찍기 시). */
export function clearPendingSelfie() {
  try { sessionStorage.removeItem(KEY) } catch { /* 무시 */ }
}

/** 세션에 맡겨둔 셀카를 꺼내고 지운다. 없으면 null. */
export function takePendingSelfie(): string | null {
  try {
    const v = sessionStorage.getItem(KEY)
    if (v) sessionStorage.removeItem(KEY)
    return v
  } catch {
    return null
  }
}
