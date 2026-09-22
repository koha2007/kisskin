// Centralized GA4 event wrapper for the free-pivot funnel (P0-6 측정 / FINAL §6).
//
// Single choke point for every custom event so the rules live in one place:
//   - SSR guard (no window)
//   - internal/family traffic exclusion (shared flag with pages/+config.ts kill
//     switch and AnalysisApp's gtagEvent — dashboards must show only real visitors)
//
// The five funnel events:
//   style_selected · free_trial_used · credit_purchased · card_saved · affiliate_click
// card_saved + affiliate_click have live triggers today; the other three are wired
// from the P1 makeup pipeline / credit system once those land.

import { isInternalTraffic } from './internalTraffic'

type Params = Record<string, unknown>

/** Fire a GA4 event unless this is SSR or internal/family traffic. */
export function trackEvent(name: string, params?: Params): void {
  if (typeof window === 'undefined') return
  if (isInternalTraffic()) return
  ;(window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', name, params)
}

/** User picked a makeup style from the 5-style menu (P1 makeup UI). */
export function trackStyleSelected(style: string, extra?: Params): void {
  trackEvent('style_selected', { style, ...extra })
}

/** User consumed their one free makeup render (P1 free-once guard). */
export function trackFreeTrialUsed(extra?: Params): void {
  trackEvent('free_trial_used', extra)
}

/** User purchased a credit pack (P1 credits). */
export function trackCreditPurchased(pack: string, value: number, extra?: Params): void {
  trackEvent('credit_purchased', { pack, value, currency: 'USD', ...extra })
}

/** User saved an identity-card PNG (P0-2). */
export function trackCardSaved(params: Params): void {
  trackEvent('card_saved', params)
}

/**
 * 무료 도구 결과 → AI 메이크업으로 넘어가는 지점의 클릭.
 *
 * 결과 페이지마다 이 다리가 여러 위치에 있으므로 **어느 자리가 실제로 먹히는지**
 * 를 `creative_slot` 으로만 가른다. 이벤트 이름·promotion_id·promotion_name 은
 * 옛 ToolUpsellCTA 시절과 똑같이 유지할 것 — 바꾸면 5월~6월 데이터와 이어 볼 수
 * 없다(원래 주의사항은 BentoGrid.tsx BentoBanner 주석에 있었고, 히어로 CTA 가
 * 생기면서 두 곳이 같은 규칙을 써야 해 이리로 끌어올렸다).
 *
 * @param slot 'hero_primary' | 'bento_banner' 등 페이지 내 위치.
 */
export function trackToolPromotion(tool: string, slug: string | undefined, slot: string): void {
  trackEvent('select_promotion', {
    promotion_id: `tool_cta_${tool}`,
    promotion_name: `${tool} result → AI analysis`,
    creative_slot: slot,
    items: slug ? [{ item_id: slug, item_name: `${tool}:${slug}` }] : undefined,
  })
}

// ── 가입 퍼널 (2026-09-21) ────────────────────────────────────────
// 여태 결제 이벤트만 20종 넘게 있고 **가입 관련 이벤트는 하나도 없었다.**
// 유입의 대부분이 들어오는 무료 도구도 이벤트를 안 쐈다 → 어디서 새는지 모른 채
// 고치고 있었다. 퍼널: tool_complete → auth_view → sign_up_start → sign_up.
// (저장 단계는 "내 뷰티 기록"이 생기면 tool_complete 와 auth_view 사이에 들어간다.)

/**
 * 무료 도구 진단 완료 — 결과 페이지로 넘어가기 **직전**에 쏜다.
 *
 * ⚠️ 바로 뒤에 `window.location.href` 가 따라붙어 페이지가 날아간다. 그래서
 * `transport_type: 'beacon'` 이 필수다 — 일반 전송은 네비게이션에 잘려 유실된다.
 * 결과 페이지에서 쏘지 않는 이유: 그 URL 은 검색으로도 직접 들어오는 착지
 * 페이지라, 거기서 쏘면 "진단을 끝낸 사람"과 "구글에서 온 사람"이 섞인다.
 */
export function trackToolComplete(tool: string, slug: string): void {
  trackEvent('tool_complete', { tool, result_slug: slug, transport_type: 'beacon' })
}

/** 로그인/가입 화면 도달. `next` 로 어느 기능이 사람을 여기로 보냈는지 가른다. */
export function trackAuthView(mode: string, next: string | null): void {
  trackEvent('auth_view', { auth_mode: mode, next_path: next ?? '(none)' })
}

/** 가입 폼 제출 — 성공 전. 제출 대비 완료율로 폼 자체의 이탈을 본다. */
export function trackSignUpStart(method: string): void {
  trackEvent('sign_up_start', { method })
}

/** 가입 완료. GA4 권장 이벤트명이라 표준 리포트에 그대로 잡힌다. */
export function trackSignUp(method: string): void {
  trackEvent('sign_up', { method })
}

/** 로그인 완료. GA4 권장 이벤트명. */
export function trackLogin(method: string): void {
  trackEvent('login', { method })
}

/**
 * 무로그인 사용자가 "결과 저장하기"를 눌러 로그인으로 넘어간 순간.
 * 퍼널의 빠져 있던 칸이다 — tool_complete 는 많은데 sign_up 이 적다면,
 * 원인이 "저장을 권하는 자리가 안 보여서"인지 "권했는데 안 눌러서"인지
 * 이 이벤트 없이는 구분이 안 된다.
 */
export function trackSaveIntent(done: number, total: number): void {
  trackEvent('dna_save_intent', { results_done: done, results_total: total })
}

/** 진단 결과가 실제로 계정에 올라갔을 때(로그인 후 동기화 완료). */
export function trackDnaSaved(fields: number): void {
  trackEvent('dna_saved', { results_saved: fields })
}

// ── 이메일 구독 (2026-09-22) ────────────────────────────────────────
// 가입 퍼널(auth_view → sign_up)과 **별개의 퍼널**이다. 가입까지 가지 않는 사람을
// 담는 낮은 문턱이라, 둘을 한 지표로 합치면 무엇이 듣는지 안 보인다.
//   subscribe_submit  폼 제출(신청 시도)
//   subscribe_pending 확인 메일 발송 성공 — 화면에서 잴 수 있는 마지막 지점
//   subscribe_already 이미 구독 중이던 주소
//   subscribe_error   실패
// ⚠ 진짜 구독 성립(확인 클릭)은 메일 밖에서 일어나 GA4 에 안 잡힌다. 실제 구독자 수는
//   Supabase public.email_subscriber(confirmed_at not null) 가 유일한 진실이다.
// ⚠ source 파라미터를 화면별로 보려면 GA4 맞춤측정기준(이벤트 범위)에 `source` 등록 필요.

/** 구독 폼 제출. slot = 어느 화면(personal-color / article / home …). */
export function trackSubscribeSubmit(source: string): void {
  trackEvent('subscribe_submit', { source })
}

/** 확인 메일이 나갔다(= 신청 성공). */
export function trackSubscribePending(source: string): void {
  trackEvent('subscribe_pending', { source })
}
