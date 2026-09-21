-- ════════════════════════════════════════════════════════════════════
-- SUBSCRIBER_GROWTH_PLAN P1 · 내 메이크업 룩 — AI 메이크업 결과를 계정에 남긴다
-- ────────────────────────────────────────────────────────────────────
-- 운영자가 Supabase 대시보드 → SQL Editor 에 붙여넣어 실행. 멱등이라 재실행 안전.
--
-- 왜:
--   AI 메이크업 결과는 만들고 나면 사라졌다. 크레딧을 쓴 결과물인데도 남는 게
--   없어서, 유료 기능을 쓴 사람조차 다시 올 이유가 없었다. 0005(진단 4종)와
--   합쳐져 마이페이지의 "내 뷰티 기록"을 이룬다.
--
-- 설계:
--   • id 는 shared_results 의 id 와 같은 값을 쓴다. 저장/공유 시 이미 그 이름으로
--     results 버킷에 이미지를 올리므로, **이미지를 두 번 올리지 않는다.**
--   • 그래서 행은 "저장하거나 공유한 룩"만 쌓인다. 생성할 때마다 자동으로 올리면
--     쓰지도 않을 이미지로 스토리지가 불어난다(무료 티어 1GB).
--   • 본인 행만 읽고 쓴다(RLS).
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.makeup_look (
  -- shared_results.id 와 동일 = results 버킷의 <id>.jpg 를 가리킨다.
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  style_id   text,          -- 스타일 코드(예: 'glass_skin'). 표시 문구는 프런트가 가진다.
  style_name text,          -- 생성 당시 표시명 — 스타일 목록이 바뀌어도 기록은 남게
  image_path text not null, -- '<id>.jpg' (results 버킷, 공개 경로)
  created_at timestamptz not null default now()
);

comment on table public.makeup_look is
  'AI 메이크업 룩 기록(내 뷰티 기록). 저장/공유한 룩만 쌓인다. 이미지는 results 버킷.';

-- 마이페이지는 "내 최신 룩 몇 개"만 읽는다.
create index if not exists makeup_look_user_created_idx
  on public.makeup_look (user_id, created_at desc);

alter table public.makeup_look enable row level security;

drop policy if exists "own looks select" on public.makeup_look;
create policy "own looks select" on public.makeup_look
  for select using (auth.uid() = user_id);

drop policy if exists "own looks insert" on public.makeup_look;
create policy "own looks insert" on public.makeup_look
  for insert with check (auth.uid() = user_id);

-- 지우기는 본인만. "이 룩 지우기"를 붙일 때 필요하고, 그 전엔 쓰이지 않는다.
drop policy if exists "own looks delete" on public.makeup_look;
create policy "own looks delete" on public.makeup_look
  for delete using (auth.uid() = user_id);
