-- 주간 제품 다이제스트 메일 수신거부 명단.
--
-- 배경: 회원(Supabase auth.users)에게 매주 신제품 요약 메일을 보낸다
-- (.github/workflows/weekly-digest.yml → functions/api/announce-products.ts).
-- 마케팅성 메일이므로 작동하는 수신거부가 법적으로 필수다. 메일 푸터의
-- "수신거부" 링크와 List-Unsubscribe 헤더가 functions/api/email-optout.ts 를
-- 호출하고, 그 함수가 이 표에 이메일을 넣는다. 발송기는 매번 이 표를 빼고 보낸다.
--
-- 적용: Supabase 대시보드 → SQL Editor 에 이 파일을 붙여넣고 실행.

create table if not exists public.email_optout (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- 이 표는 service_role(=RLS 우회) 로만 읽고 쓴다. 정책을 하나도 두지 않아
-- anon/authenticated 로부터는 완전히 잠긴다.
alter table public.email_optout enable row level security;

comment on table public.email_optout is
  '주간 제품 다이제스트 메일 수신거부 명단. functions/api/email-optout.ts 가 기록.';
