// Supabase 인증 에러 → 사람이 읽는 한/영 문구 (2026-09-22)
// ────────────────────────────────────────────────────────────────────
// 여태 AuthPage·MyPage 가 `setError(err.message)` 로 **Supabase 원문을 그대로** 띄웠다.
// 한국어 사용자에게 "Invalid login credentials" 가 뜨는 셈이라, 무엇을 고쳐야 하는지
// 알 수 없어 그 자리에서 이탈한다. 가입·로그인은 구독 퍼널의 가장 좁은 목이라
// (SUBSCRIBER_GROWTH_PLAN) 여기서 새는 건 그대로 손실이다.
//
// 매칭 기준은 `message` 가 아니라 **`code`** 다. 문구는 Supabase 버전마다 바뀌지만
// 코드는 안 바뀐다. 코드가 없는 구버전 응답을 위해 message 대조를 폴백으로 둔다.
//
// 목록에 없는 코드는 원문을 그대로 보여준다 — 뭉개진 "오류가 발생했습니다" 보다
// 검색이라도 할 수 있는 원문이 낫고, 새 코드가 생겼을 때 우리가 알아채기도 쉽다.

import type { AuthError } from '@supabase/supabase-js'

type Msg = { ko: string; en: string }

const BY_CODE: Record<string, Msg> = {
  invalid_credentials: {
    ko: '이메일 또는 비밀번호가 올바르지 않습니다.',
    en: 'That email or password is incorrect.',
  },
  email_not_confirmed: {
    ko: '이메일 인증이 아직 안 됐습니다. 받은 편지함에서 확인 메일의 링크를 눌러 주세요. (스팸함도 확인해 보세요)',
    en: 'Your email is not verified yet. Open the confirmation email and tap the link. (Check your spam folder too.)',
  },
  user_already_exists: {
    ko: '이미 가입된 이메일입니다. 로그인하거나 "비밀번호를 잊으셨나요?"를 눌러 주세요.',
    en: 'This email is already registered. Log in, or use "Forgot your password?".',
  },
  email_exists: {
    ko: '이미 가입된 이메일입니다. 로그인하거나 "비밀번호를 잊으셨나요?"를 눌러 주세요.',
    en: 'This email is already registered. Log in, or use "Forgot your password?".',
  },
  weak_password: {
    ko: '비밀번호가 너무 약합니다. 6자 이상으로, 숫자나 기호를 섞어 주세요.',
    en: 'That password is too weak. Use 6+ characters and mix in a number or symbol.',
  },
  same_password: {
    ko: '지금 쓰고 있는 비밀번호와 같습니다. 다른 비밀번호를 입력해 주세요.',
    en: 'That is your current password. Please choose a different one.',
  },
  email_address_invalid: {
    ko: '사용할 수 없는 이메일 주소입니다. 주소를 다시 확인해 주세요.',
    en: 'That email address cannot be used. Please check it again.',
  },
  over_email_send_rate_limit: {
    ko: '메일을 너무 자주 요청했습니다. 잠시 후(약 1분) 다시 시도해 주세요.',
    en: 'Too many emails requested. Please try again in about a minute.',
  },
  over_request_rate_limit: {
    ko: '요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.',
    en: 'Too many requests. Please try again in a moment.',
  },
  otp_expired: {
    ko: '링크가 만료됐습니다. 메일을 다시 보내 주세요.',
    en: 'That link has expired. Please request a new email.',
  },
  signup_disabled: {
    ko: '현재 신규 가입을 받고 있지 않습니다. 잠시 후 다시 시도해 주세요.',
    en: 'Sign-ups are temporarily unavailable. Please try again later.',
  },
  user_banned: {
    ko: '이용이 제한된 계정입니다. 문의하기로 연락해 주세요.',
    en: 'This account is restricted. Please contact us.',
  },
  session_expired: {
    ko: '로그인이 만료됐습니다. 다시 로그인해 주세요.',
    en: 'Your session expired. Please log in again.',
  },
  validation_failed: {
    ko: '입력값을 다시 확인해 주세요.',
    en: 'Please check the values you entered.',
  },
}

// code 가 없던 시절 응답용 폴백 — 원문 일부로 맞춘다(소문자 비교).
const BY_MESSAGE: [string, string][] = [
  ['invalid login credentials', 'invalid_credentials'],
  ['email not confirmed', 'email_not_confirmed'],
  ['user already registered', 'user_already_exists'],
  ['password should be at least', 'weak_password'],
  ['new password should be different', 'same_password'],
  ['unable to validate email address', 'email_address_invalid'],
  ['for security purposes', 'over_request_rate_limit'],
  ['email rate limit exceeded', 'over_email_send_rate_limit'],
]

/** 네트워크가 끊긴 경우는 Supabase 에러가 아니라 fetch 실패로 온다. */
function isNetworkFailure(err: unknown): boolean {
  if (err instanceof TypeError) return true
  const m = err instanceof Error ? err.message.toLowerCase() : ''
  return m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed')
}

/**
 * 어떤 에러든 화면에 띄울 문구로 바꾼다.
 * 매칭되는 게 없으면 원문을 그대로 돌려준다(위 주석 참고).
 */
export function authErrorMessage(err: unknown, locale: string): string {
  const ko = locale === 'ko'

  if (isNetworkFailure(err)) {
    return ko
      ? '네트워크에 연결할 수 없습니다. 연결 상태를 확인하고 다시 시도해 주세요.'
      : 'Could not reach the server. Check your connection and try again.'
  }

  const raw = err instanceof Error ? err.message : String(err)
  const code = (err as AuthError | undefined)?.code
    ?? BY_MESSAGE.find(([needle]) => raw.toLowerCase().includes(needle))?.[1]

  const hit = code ? BY_CODE[code] : undefined
  if (!hit) return raw
  return ko ? hit.ko : hit.en
}
