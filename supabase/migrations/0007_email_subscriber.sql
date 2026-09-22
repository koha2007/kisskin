-- 이메일 구독자 명단 (회원가입과 무관한 "구독만 한 사람").
--
-- 배경(2026-09-22): 여태 주간 다이제스트 수신자는 **Supabase auth.users 전원**이었다.
-- 즉 메일을 받으려면 반드시 회원가입을 해야 했고, 사이트 어디에도 "이메일만 남기는"
-- 경로가 없었다. 유입의 대부분은 무료 도구 결과 페이지에서 끝나고 가입까지 가지 않으므로
-- 구독자가 늘 수 없는 구조였다 (1차 목표가 구독자 증가인데 그 입구가 0).
--
-- 이 표가 그 입구다. 가입 없이 이메일만 받고, 확인 메일의 링크를 누른 사람만
-- (= confirmed_at 이 채워진 사람만) 발송 대상에 들어간다.
--
-- 왜 더블 옵트인인가:
--   ① 남의 주소를 아무나 적어 넣는 걸 막는다(확인 링크는 그 주소로만 간다).
--   ② 오타·봇 주소로 보내면 반송률이 올라 도메인 평판이 깎인다(Resend 발송 전체가 위험).
--   ③ 정보통신망법의 "수신동의 사실 보관" 을 confirmed_at 하나로 증명한다.
--      동의 증빙을 위해 IP 를 남기는 방식도 있지만, 개인정보를 새로 더 모으지 않기로 하고
--      "그 주소의 소유자가 직접 누른 시각" 으로 갈음한다.
--
-- 수신거부는 기존 public.email_optout 을 그대로 쓴다(발송기가 매번 빼고 보낸다).
-- 다시 구독하면 functions/api/subscribe.ts 가 optout 행을 지운다 — 안 지우면
-- 재구독해도 영영 안 간다.
--
-- 적용: Supabase 대시보드 → SQL Editor 에 이 파일을 붙여넣고 실행.

create table if not exists public.email_subscriber (
  email           text primary key,
  -- 어느 언어로 보낼지. 신청한 화면의 언어를 그대로 쓴다.
  locale          text not null default 'ko',
  -- 어느 화면에서 신청했는지(personal-color / face-shape / news / home …).
  -- "어떤 페이지가 구독자를 만드는가" 를 재는 유일한 근거라 꼭 채운다.
  source          text,
  -- 확인 링크를 누른 시각. null 이면 미확인 = 발송 대상 아님.
  confirmed_at    timestamptz,
  -- 확인 메일을 마지막으로 보낸 시각. 같은 주소로 반복 신청해 메일폭탄을 만드는 걸 막는다.
  confirm_sent_at timestamptz,
  created_at      timestamptz not null default now()
);

-- 발송기는 "확인된 사람" 만 훑는다.
create index if not exists email_subscriber_confirmed_idx
  on public.email_subscriber (confirmed_at)
  where confirmed_at is not null;

-- 이 표는 service_role(=RLS 우회) 로만 읽고 쓴다. 정책을 하나도 두지 않아
-- anon/authenticated 로부터는 완전히 잠긴다(이메일 명단이 그대로 노출되면 안 된다).
alter table public.email_subscriber enable row level security;

comment on table public.email_subscriber is
  '주간 다이제스트 이메일 구독자(비회원 포함). functions/api/subscribe.ts 가 기록, announce-products.ts 가 발송.';
