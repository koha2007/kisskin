// Internal / family-traffic exclusion for GA4 + Clarity.
//
// Goal: dashboards must reflect only real external visitors. The family runs the
// site through free (100%-discount) codes and the operator browses constantly,
// which otherwise shows up as fake purchases and inflated revenue.
//
// Two entry points share the localStorage flag written here:
//   1. pages/+config.ts `loadAnalytics()` — read at page load. If the flag (or
//      ?internal=1) is present it sets the GA4 kill switch and skips loading GA4
//      and Clarity entirely, so even the automatic page_view never fires.
//   2. This module — flips the same flag live when a known family email logs in,
//      so their first session also stops sending hits without a reload.
//
// ⭐ 2026-08-15: 위 두 경로 모두 **localStorage 플래그**에 의존하는데, Expo 앱의
// WebView 는 브라우저와 **저장소 컨텍스트가 분리**돼 있어 운영자가 브라우저에서
// 켜 둔 플래그가 앱 안으로 넘어오지 않았다. 그 결과 앱 빌드 테스트가 통째로
// 외부 트래픽으로 집계됐다 — GA4 28일치(7/19~8/15) 기준:
//   Android Webview 사용자 3명 = 참여세션 36% · 이벤트 53% · **주요이벤트 80%**
//   (card_saved 49건·affiliate_click 21건이 전부 이 3명), 사용자당 체류 19분 02초.
// 대시보드의 "성과"가 사실상 운영자 본인이었다. 아래 isAppWebView() 로 차단한다.

const GA_ID = 'G-JJ7G39W5T3'
const INTERNAL_KEY = 'kisskin_internal'

/**
 * 앱 트래픽 처리 방식. 스토어 출시 **전**이라 앱 WebView 유입은 100% 운영자·테스터다
 * ([[project_expo_app]] — 아직 Play Console 등록 전).
 *
 * ⚠️ **스토어 출시 시점에 'measure' 로 바꿀 것.** 그때부터는 앱 사용자가 진짜
 * 사용자이므로 버리면 안 된다. 다만 웹과 섞이면 또 판단이 흐려지니, 전환할 때
 * GA4 에 별도 스트림을 만들거나 최소한 user_property 로 web/app 을 갈라 둘 것.
 */
const APP_TRAFFIC: 'exclude' | 'measure' = 'exclude'

// Family accounts (also the operator). Lower-cased; compared case-insensitively.
const FAMILY_EMAILS = new Set([
  'koha2007@naver.com',
  'koha3d77@gmail.com',
  'dangni81@naver.com',
  'shj01205@naver.com',
])

let cached: boolean | null = null

export function isInternalEmail(email?: string | null): boolean {
  return !!email && FAMILY_EMAILS.has(email.trim().toLowerCase())
}

/**
 * True inside **our own** Expo app's WebView.
 *
 * 판별은 앱이 주입하는 브릿지 전역(`window.ReactNativeWebView`) 하나로만 한다
 * (이미 `src/lib/nativePicker.ts` 가 같은 값으로 네이티브 피커를 분기한다).
 *
 * ⚠️ **UserAgent 의 `wv` 로 거르지 말 것.** 카카오톡·네이버 인앱 브라우저도 같은
 * 마커를 달고 오는데, 우리 유입의 최대 덩어리가 바로 네이버 모바일 검색
 * (Clarity 3일치 62세션 중 41건이 m.search.naver.com)이다. UA 로 거르면 잡으려던
 * 운영자 3명 대신 진짜 방문자 수십 명을 통계에서 지우게 된다.
 * `ReactNativeWebView` 는 우리 앱만 주입하므로 오탐이 없다.
 */
export function isAppWebView(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView
}

/** True if this device has been tagged as internal (family/operator/app tester). */
export function isInternalTraffic(): boolean {
  if (typeof window === 'undefined') return false
  if (cached !== null) return cached
  if (APP_TRAFFIC === 'exclude' && isAppWebView()) {
    cached = true
    return cached
  }
  try {
    cached = window.localStorage.getItem(INTERNAL_KEY) === '1'
  } catch {
    cached = false
  }
  return cached
}

/**
 * Google's official per-property opt-out. Once set, gtag.js drops every hit for
 * this measurement ID (including auto page_view), regardless of how it loaded.
 */
function disableAnalytics() {
  if (typeof window === 'undefined') return
  ;(window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true
}

/** Persist the internal flag for this device and stop GA4 hits immediately. */
export function markInternal() {
  if (typeof window === 'undefined') return
  cached = true
  try {
    window.localStorage.setItem(INTERNAL_KEY, '1')
  } catch {
    /* private mode / quota — the in-memory cache still gates this session */
  }
  disableAnalytics()
}

/** Tag the device as internal when an authenticated email is a family account. */
export function markInternalIfFamily(email?: string | null) {
  if (isInternalEmail(email)) markInternal()
}
