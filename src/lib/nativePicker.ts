// ────────────────────────────────────────────────────────────────────
// 이미지 픽커 공용 헬퍼 — 앱(Expo WebView)과 브라우저를 한 함수로 흡수한다.
//
// 왜 필요한가(2026-07-16 실기기 버그):
//   안드로이드 WebView 에서 숨긴 <input type=file> 을 재사용하면 파일선택기가
//   첫 닫힘 이후 얼어붙는다 — 홈 히어로·메이크업 업로드 버튼이 두 번째부터
//   무반응이던 원인. capture="user" 카메라도 웹뷰에선 열리지 않았다.
//   네이티브 브릿지는 AnalysisApp.tsx 에만 연결돼 있었는데 그 파일은 죽은
//   코드라(라이브 /analysis/ = MakeupFlow), 앱에서 브릿지가 한 번도 안 불렸다.
//
// 동작:
//   · 앱 안(window.ReactNativeWebView 존재): postMessage 브릿지로 네이티브
//     expo-image-picker 를 연다. 결과는 'nativePickResult' CustomEvent 로 온다.
//     (네이티브 쪽 구현: kisskin-app/App.tsx handleMessage)
//   · 브라우저: 클릭마다 새 <input> 을 만들어 한 번 쓰고 버린다(재사용 금지).
//
// ⚠️ 반드시 onClick 핸들러에서 "직접"(await 뒤가 아니라) 호출할 것 —
//   브라우저 폴백의 input.click() 은 사용자 제스처 밖에서는 조용히 무시된다.

type RNWebView = { postMessage: (s: string) => void }

function getBridge(): RNWebView | null {
  const rn = (window as unknown as { ReactNativeWebView?: RNWebView }).ReactNativeWebView
  return rn && typeof rn.postMessage === 'function' ? rn : null
}

/** Expo 앱 웹뷰 안에서 실행 중인지 */
export function isNativeApp(): boolean {
  return getBridge() !== null
}

/** dataURL → File. 브릿지 결과를 브라우저 경로와 같은 타입으로 맞춘다. */
async function dataUrlToFile(dataUrl: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob()
  const ext = blob.type.split('/')[1] || 'jpg'
  return new File([blob], `selfie.${ext}`, { type: blob.type || 'image/jpeg' })
}

/**
 * 갤러리/카메라에서 이미지 한 장을 고른다. 취소하면 null.
 * (브라우저에서 파일선택 창을 그냥 닫으면 change 가 안 와서 영영 resolve 되지
 *  않을 수 있다 — 호출부는 결과를 기다렸다가 "있으면 처리" 패턴으로만 쓸 것.)
 */
export function pickImage(mode: 'gallery' | 'camera'): Promise<File | null> {
  const rn = getBridge()
  if (rn) {
    return new Promise((resolve) => {
      const onResult = (e: Event) => {
        window.removeEventListener('nativePickResult', onResult)
        const detail = (e as CustomEvent<{ canceled: boolean; dataUrl: string | null }>).detail
        if (!detail || detail.canceled || !detail.dataUrl) return resolve(null)
        dataUrlToFile(detail.dataUrl).then(resolve).catch(() => resolve(null))
      }
      window.addEventListener('nativePickResult', onResult)
      rn.postMessage(JSON.stringify({ type: mode === 'camera' ? 'pickCamera' : 'pickGallery' }))
    })
  }

  // 브라우저 폴백 — input 은 매번 새로 만든다(재사용하면 웹뷰/일부 브라우저가 얼어붙음).
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    // 갤러리: 명시적 확장자 목록 — 일부 안드로이드 브라우저는 "image/*" 만 주면
    // 갤러리 옆에 카메라 인텐트를 같이 띄운다.
    input.accept = mode === 'camera'
      ? 'image/*'
      : 'image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif'
    // 전면(셀카) 카메라 — 얼굴 분석 플로우라 후면이 열리면 사용자가 이탈한다.
    if (mode === 'camera') input.setAttribute('capture', 'user')
    input.style.position = 'fixed'
    input.style.left = '-9999px'
    input.style.top = '0'
    input.style.opacity = '0'
    input.onchange = () => {
      resolve(input.files?.[0] ?? null)
      setTimeout(() => {
        try { document.body.removeChild(input) } catch { /* already removed */ }
      }, 0)
    }
    document.body.appendChild(input)
    input.click()
  })
}
