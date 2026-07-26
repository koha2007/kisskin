-- ════════════════════════════════════════════════════════════════════
-- 보안: 공유 결과 전체 노출 차단 (Security Advisor 경고 1·2·3)
-- ────────────────────────────────────────────────────────────────────
-- 운영자가 Supabase 대시보드 → SQL Editor 에 통째로 붙여넣어 실행한다.
-- 멱등(idempotent): 정책을 지우고 다시 만들고, 함수는 create or replace 라
-- 몇 번을 실행해도 결과가 같다.
--
-- ── 무엇이 문제였나 (2026-07-26 익명 키로 실측)
--   · shared_results 에 USING (true) 정책이 있어, id 없이 select * 를 던지면
--     108행이 전부 돌아왔다. 리포트 전문 + 사진 경로 + 성별 + 생성시각.
--   · storage 버킷 results 에 목록 조회(SELECT) 정책이 있어, 테이블을 거치지
--     않고도 익명이 파일 108개(합계 173.5MB) 목록을 그대로 뽑을 수 있었다.
--   · 익명 키(anon key)는 브라우저 번들에 들어 있다 = 누구나 가진 키다.
--   → 이용자 108명 전원의 셀카와 분석 리포트가 인터넷에 열려 있었다.
--     구멍이 두 개라 한쪽만 막으면 소용이 없다.
--
-- ── 어떻게 막나
--   · 공유 링크(/result/{id})는 계속 로그인 없이 열려야 한다. 그래서 "목록
--     조회"만 막고 "id 로 한 건 조회"는 SECURITY DEFINER 함수로 열어준다.
--     RLS 로는 "WHERE 절을 반드시 붙여라"를 강제할 수 없어서 함수로 간다.
--   · 버킷은 공개(public=true)로 둔다. 공개 버킷의 /object/public/ 경로는
--     RLS 를 타지 않으므로 **기존 공유 링크의 이미지가 그대로 뜬다.**
--     RLS 를 타는 건 목록 조회 API 쪽이라, SELECT 정책만 없애면 목록이 막힌다.
--     (버킷을 비공개로 돌리면 서명 URL 발급까지 필요해 작업이 커진다.)
--   · 저장(업로드·INSERT)은 authenticated 로 좁힌다. AI 메이크업은 무료 1회도
--     로그인 필수라(MakeupFlow 로그인 게이트) 기능에 영향이 없고, 익명이
--     버킷에 파일을 무한정 쌓는 경로가 덤으로 함께 막힌다.
--
-- ── 함께 고치는 것
--   경고 3 (get_credit_balance 를 익명이 실행 가능). 인자 없이 auth.uid() 로
--   본인 잔액만 보는 함수라 실제 유출은 없었지만, 로그인 없이 호출될 이유가
--   없으므로 익명 EXECUTE 를 회수한다.
-- ════════════════════════════════════════════════════════════════════


-- ── 1. shared_results 정책 초기화 ────────────────────────────────────
alter table public.shared_results enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'shared_results'
  loop
    execute format('drop policy %I on public.shared_results', p.policyname);
    raise notice '[shared_results] 정책 제거: %', p.policyname;
  end loop;
end $$;

-- 저장만 허용한다. SELECT 정책을 아예 만들지 않으므로 직접 조회는 전부 거부된다.
-- (to authenticated 라 with check 는 사실상 중복이지만, 의도를 남기고 동시에
--  "USING (true)" 류의 무조건 참 표현을 피하려고 명시한다.)
create policy shared_results_insert_authenticated
  on public.shared_results
  for insert
  to authenticated
  with check (auth.uid() is not null);


-- ── 2. id 로 한 건만 돌려주는 조회 함수 ───────────────────────────────
-- security definer = 정의자(소유자) 권한으로 돌아 RLS 를 통과한다. 그래서
-- 반드시 search_path 를 고정한다(고정하지 않으면 검색 경로를 바꿔치기해
-- 다른 스키마의 동명 객체를 호출시키는 공격이 가능하다).
create or replace function public.get_shared_result(p_id uuid)
returns table (image_path text, report jsonb, gender text, styles text[])
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select s.image_path, s.report, s.gender, s.styles
  from public.shared_results s
  where s.id = p_id
$$;

revoke all on function public.get_shared_result(uuid) from public;
-- 공유 링크는 로그아웃 상태에서도 열려야 하므로 anon 에게도 준다.
-- 한 건씩만 나오므로 목록을 훑을 수는 없다.
grant execute on function public.get_shared_result(uuid) to anon, authenticated;


-- ── 3. storage.objects — 목록 조회 차단, 업로드는 유지 ────────────────
-- 버킷이 results 하나뿐이라(2026-07-26 확인) 정책을 초기화하고 필요한 것만
-- 다시 만든다. 버킷이 늘어나면 이 블록을 버킷별로 쪼개야 한다.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
    raise notice '[storage.objects] 정책 제거: %', p.policyname;
  end loop;
end $$;

-- 업로드만. SELECT 정책이 없으므로 목록 조회 API 는 빈 결과를 준다.
-- 읽기는 공개 버킷의 /object/public/<path> 경로가 RLS 없이 계속 처리한다.
create policy results_insert_authenticated
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'results');


-- ── 4. get_credit_balance 익명 EXECUTE 회수 (경고 3) ──────────────────
-- 시그니처가 바뀌어도 깨지지 않게 실제 등록된 함수를 찾아 회수한다.
-- authenticated 는 남긴다 — src/lib/credits.ts 가 로그인 상태로 호출한다.
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'get_credit_balance'
  loop
    execute format('revoke execute on function %s from anon', f.sig);
    raise notice '[get_credit_balance] anon EXECUTE 회수: %', f.sig;
  end loop;
end $$;


-- ── 5. 확인용 — 실행 후 아래 결과를 눈으로 확인한다 ───────────────────
--   shared_results  : insert 정책 1개만 (select 없음)
--   storage.objects : insert 정책 1개만 (select 없음)
select schemaname || '.' || tablename as target, policyname, cmd, roles
from pg_policies
where (schemaname = 'public' and tablename = 'shared_results')
   or (schemaname = 'storage' and tablename = 'objects')
order by 1, 2;
