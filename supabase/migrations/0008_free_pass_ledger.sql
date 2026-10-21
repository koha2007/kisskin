-- 가입 무료권 장부 (2026-10-21) — KV(MAKEUP_USAGE) 카운터를 대체
--
-- 왜 옮기나:
--   ① 무료권이 "돈"처럼 정확해야 한다. KV 는 읽고-쓰기 사이에 틈이 있어 동시에 두 번 누르면
--      무료가 두 번 나갈 수 있고, 지역 간 반영이 늦다(최대 60초).
--   ② 무료권 쓰임새가 늘었다 — 메이크업 1장 + 무료 도구 1장(뷰티 DNA 또는 정밀 사주 풀이 중 택1).
--      "언제·무엇에 썼는지"를 남겨야 마이페이지·고객 문의에 답할 수 있다.
--
-- 규칙(functions/api/_freeUsage.ts 와 같다):
--   • 풀(pool) 2개: 'makeup'(AI 메이크업 1룩) · 'tool'(뷰티 DNA 모델 또는 정밀 사주 풀이). 각 1장.
--   • 한 사람 판정 = user_id 또는 신원 해시(이메일·소셜 로그인 고유번호의 SHA-256) 중 하나라도 겹치면 같은 사람.
--     → 로그아웃·재로그인, 탈퇴 후 같은 이메일/구글 계정 재가입에도 소진 상태 유지.
--   • 탈퇴하면 user_id 만 비워지고(on delete set null) 해시는 남는다 — 개인정보처리방침 15항 고지.
--   • 생성 "전"에 원자적으로 잡고(claim), 생성이 실패하면 풀어 준다(release). 같은 ref 재요청은 멱등.
--
-- 실행: Supabase SQL Editor 에 이 파일 전체를 붙여 실행. (2026-10-30 이후 새 테이블 자동 GRANT 없음 → 아래 grant 포함)

create table if not exists public.free_pass_ledger (
  id              bigserial primary key,
  pool            text not null check (pool in ('makeup', 'tool')),
  used_for        text not null,                 -- 'makeup' | 'dna' | 'reading' …
  user_id         uuid references auth.users(id) on delete set null,
  identity_hashes text[] not null default '{}',  -- 'e:<sha256(email)>', 'p:<sha256(provider:id)>'
  ref             text not null unique,          -- 생성 작업 id(jobId) — 멱등 키
  created_at      timestamptz not null default now()
);

create index if not exists free_pass_ledger_user_idx on public.free_pass_ledger (user_id);
create index if not exists free_pass_ledger_hash_idx on public.free_pass_ledger using gin (identity_hashes);

-- 서버(service_role)만 읽고 쓴다. 클라이언트는 /api/free-status 로만 조회.
alter table public.free_pass_ledger enable row level security;
revoke all on public.free_pass_ledger from anon, authenticated;
grant select, insert, delete on public.free_pass_ledger to service_role;
grant usage, select on sequence public.free_pass_ledger_id_seq to service_role;

-- ── 사용 수(풀별) ──
create or replace function public.free_pass_used(p_user_id uuid, p_hashes text[], p_pool text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.free_pass_ledger
  where pool = p_pool
    and (user_id = p_user_id or identity_hashes && coalesce(p_hashes, '{}'));
$$;

-- ── 무료권 잡기(원자적) ──
-- 반환: { success, used, idempotent, reason }
create or replace function public.claim_free_pass(
  p_user_id  uuid,
  p_hashes   text[],
  p_pool     text,
  p_limit    integer,
  p_used_for text,
  p_ref      text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer;
begin
  if p_ref is null or length(p_ref) = 0 then
    return json_build_object('success', false, 'reason', 'missing_ref');
  end if;

  -- 같은 사람의 동시 요청을 한 줄로 세운다(이중 무료 방지)
  perform pg_advisory_xact_lock(hashtext('free_pass:' || p_user_id::text));

  if exists (select 1 from public.free_pass_ledger where ref = p_ref) then
    return json_build_object('success', true, 'idempotent', true,
      'used', public.free_pass_used(p_user_id, p_hashes, p_pool));
  end if;

  v_used := public.free_pass_used(p_user_id, p_hashes, p_pool);
  if v_used >= p_limit then
    return json_build_object('success', false, 'reason', 'used', 'used', v_used);
  end if;

  insert into public.free_pass_ledger (pool, used_for, user_id, identity_hashes, ref)
  values (p_pool, p_used_for, p_user_id, coalesce(p_hashes, '{}'), p_ref);

  return json_build_object('success', true, 'used', v_used + 1);
end;
$$;

-- ── 생성 실패 시 되돌리기 ──
create or replace function public.release_free_pass(p_user_id uuid, p_ref text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.free_pass_ledger where ref = p_ref and user_id = p_user_id;
$$;

revoke all on function public.free_pass_used(uuid, text[], text) from public, anon, authenticated;
revoke all on function public.claim_free_pass(uuid, text[], text, integer, text, text) from public, anon, authenticated;
revoke all on function public.release_free_pass(uuid, text) from public, anon, authenticated;
grant execute on function public.free_pass_used(uuid, text[], text) to service_role;
grant execute on function public.claim_free_pass(uuid, text[], text, integer, text, text) to service_role;
grant execute on function public.release_free_pass(uuid, text) to service_role;
