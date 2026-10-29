-- 나머지 8룩 알림 (2026-10-29 운영자 결정)
--
-- 왜:
--   무료 1룩을 만든 21명 중 다음 날 돌아온 사람 0명(10/28 점검). 다음 날 한 통이면 복귀 경로가 생긴다.
--   그런데 결제 안내 메일은 법상 광고성 정보라 별도 동의가 필요하다 — 주간 레터 동의 범위
--   ("일요일마다 신제품·뉴스·메이크업 방법")는 이걸 덮지 않는다.
--   → 결과 화면 "나머지 8룩 알림 받기(선택)" 체크를 따로 받고, 체크한 사람에게만 다음 날 1통.
--
-- 규칙:
--   • 회원 1명 = 1행. 평생 한 통(sent_at 이 찍히면 다시 체크해도 재발송 X).
--   • 체크 해제 = 미발송 행 삭제.
--   • 발송 전 건너뜀: 그사이 크레딧 구매 · 수신거부(email_optout). skipped 에 이유를 남긴다.
--   • 동의 증빙: consent_text(체크박스 문구 그대로) + created_at.
--   • 읽고 쓰는 건 서버 함수(functions/api/look-reminder.ts, service_role)뿐 — 클라이언트 직접 접근 없음.
--
-- 실행: Supabase SQL Editor 에 이 파일 전체를 붙여 실행. 멱등. (새 테이블은 GRANT 필수 — 아래 포함)

create table if not exists public.look_reminder (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  locale       text not null default 'ko' check (locale in ('ko', 'en')),
  style_id     text,                       -- 무료로 만든 룩(메일에서 그 룩을 빼고 나머지 8개를 보여 줌)
  consent_text text not null,              -- 체크박스 문구 원문(동의 증빙)
  created_at   timestamptz not null default now(),
  send_after   timestamptz not null,       -- 보통 created_at + 20시간
  sent_at      timestamptz,                -- 발송(또는 건너뜀) 처리 시각
  skipped      text                        -- 'purchased' | 'optout' 등. null + sent_at = 실제 발송
);

comment on table public.look_reminder is
  'AI 메이크업 "나머지 8룩 알림 받기" 별도 동의 + 다음 날 1통 발송 기록. 서버(service_role)만 접근.';

create index if not exists look_reminder_due_idx
  on public.look_reminder (send_after) where sent_at is null;

alter table public.look_reminder enable row level security;
-- 정책 없음 = anon/authenticated 접근 불가. 서버 함수만 쓴다.

grant select, insert, update, delete on table public.look_reminder to service_role;

-- 확인
select count(*) as rows, has_table_privilege('service_role', 'public.look_reminder', 'insert') as service_role_can_insert
from public.look_reminder;
