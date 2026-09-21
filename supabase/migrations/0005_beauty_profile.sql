-- ════════════════════════════════════════════════════════════════════
-- SUBSCRIBER_GROWTH_PLAN P1 · "내 뷰티 기록" — 무료 도구 결과를 계정에 저장
-- ────────────────────────────────────────────────────────────────────
-- 운영자가 Supabase 대시보드 → SQL Editor 에 통째로 붙여넣어 실행한다.
-- 멱등(create ... if not exists / drop policy if exists)이라 재실행 안전.
--
-- 왜 필요한가:
--   무료 도구 4종(퍼스널컬러·얼굴형·향수·메이크업MBTI)의 결과는 여태
--   localStorage 에만 있었다 → 폰을 바꾸거나 브라우저를 지우면 소멸하고,
--   계정과 아무 관계가 없었다. 그래서 "가입할 이유"도 "돌아올 이유"도 없었다.
--   이 표가 생기면 결과가 계정에 남아 기기를 넘어 따라다닌다.
--
-- 설계:
--   • 유저당 딱 한 행(user_id = PK). 결과는 4개 짧은 코드뿐이라 이력이 필요 없고,
--     "지금의 나"만 있으면 된다. 다시 진단하면 덮어쓴다.
--   • 값은 코드 문자열(예: 'spring_warm', 'oval'). 표시 문구는 프런트가 가진다
--     (src/lib/*/types.ts) — DB 에 사람 말을 넣으면 i18n 이 갈라진다.
--   • 본인 행만 읽고 쓴다(RLS). service_role 은 RLS 를 우회하므로 별도 정책 불필요.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.beauty_profile (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  personal_color text,
  face_shape     text,
  perfume        text,
  mbti           text,
  -- 기기 간 병합 판정에 쓴다. 클라이언트의 BeautyDna.updatedAt 과 같은 값.
  dna_updated_at timestamptz,
  updated_at     timestamptz not null default now()
);

comment on table public.beauty_profile is
  '무료 도구 4종 진단 결과(내 뷰티 기록). 유저당 1행, 다시 진단하면 덮어씀.';

alter table public.beauty_profile enable row level security;

-- 본인 행만. select/insert/update 를 각각 둔다(upsert 가 둘 다 필요).
drop policy if exists "own row select" on public.beauty_profile;
create policy "own row select" on public.beauty_profile
  for select using (auth.uid() = user_id);

drop policy if exists "own row insert" on public.beauty_profile;
create policy "own row insert" on public.beauty_profile
  for insert with check (auth.uid() = user_id);

drop policy if exists "own row update" on public.beauty_profile;
create policy "own row update" on public.beauty_profile
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 삭제 정책은 두지 않는다. 계정 탈퇴 시 on delete cascade 로 함께 사라지고,
-- 그 외에 행을 지울 일이 없다("처음부터 다시 하기"는 값을 비우는 update 다).
