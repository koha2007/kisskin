// "나머지 8룩 알림 받기" — 결과 화면 체크박스 문구 (2026-10-29)
// ────────────────────────────────────────────────────────────────────
// 화면(MakeupResult)과 서버(functions/api/look-reminder.ts)가 같이 쓴다. 서버는 이 문구를
// 동의 증빙으로 look_reminder.consent_text 에 그대로 남긴다 → 문구를 바꾸면 증빙도 같이 바뀐다.
// 결제 안내 = 광고성 정보라 주간 레터 동의와 별개로 받는다(supabase/migrations/0011 주석).

export const LOOK_REMINDER_CONSENT = {
  ko: '나머지 8룩 알림 받기(선택) — 내일 한 번만, 결제 안내가 담긴 메일을 보내 드려요.',
  en: 'Remind me about the other 8 looks (optional) — one email tomorrow, including a purchase offer.',
} as const

/** 체크 후 첫 메일까지 — "다음 날" 같은 시간대보다 조금 이르게. */
export const LOOK_REMINDER_DELAY_HOURS = 20
