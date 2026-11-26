// 카카오 공유 SDK(83KB) — 2026-11-26 홈 점검: 모든 페이지 <head> 에서 받던 것을 공유 버튼이 있는 화면에서만 받는다.
// 클릭 후에 받으면 팝업 차단에 걸릴 수 있어, 공유 UI 가 화면에 붙을 때(useEffect) 미리 받는다.
let loading = false
export function loadKakaoSdk(): void {
  if (typeof window === 'undefined' || window.Kakao || loading) return
  loading = true
  const s = document.createElement('script')
  s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'
  s.crossOrigin = 'anonymous'
  s.async = true
  s.onerror = () => { loading = false }
  document.head.appendChild(s)
}
