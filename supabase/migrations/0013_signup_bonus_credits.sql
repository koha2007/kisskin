-- 가입 무료 크레딧 2개(30일) — 무료권(풀별 장수) → 크레딧 통합 (2026-11-27 운영자 B안)
--
-- 운영자 11/27: "가입하면 무료 2회로 원하는 콘텐츠 아무거나". 기능마다 따로 세던 무료권(메이크업 1·럭키 1)을 없애고,
--   가입 시 진짜 크레딧 2개를 잔액에 넣는다(유효기간 30일). 모든 생성(크레딧 1개짜리)에 쓸 수 있다.
--   · 기존 회원: 다음 로그인 때 "남은 무료권만큼"만 지급(2장 다 썼으면 0) — 총 2회 원칙 유지. 남은 수는 서버(TS)가 옛 KV 기록까지 합쳐 계산해 넘긴다.
--   · 같은 사람 판정: 이메일·소셜 고유번호 해시(free_pass_ledger 와 같은 'e:'/'p:' 형식). 탈퇴 후 재가입에도 다시 안 준다
--     → bonus_identity 는 auth.users 와 FK 없이 남긴다(개인정보처리방침: 해시만, 원문 X).
--   · 쓰는 순서: 무료분 먼저. 30일이 지나면 남은 무료분만 잔액에서 뺀다(type 'expire'). 결제 크레딧은 기한 없음.
--   · 첫 결제 특가 판정(checkout.isFirstPurchase: type='charge')에 섞이지 않게 지급은 type 'bonus'.
--
-- 실행: Supabase SQL Editor 에 이 파일 전체를 붙여 실행 → 맨 아래 확인 select 결과가 1행 나오면 성공.

-- ① 원장 종류 추가: bonus(가입 지급) · expire(기한 만료 회수)
alter table public.credit_transactions drop constraint if exists credit_transactions_type_check;
alter table public.credit_transactions
  add constraint credit_transactions_type_check check (type in ('charge', 'deduct', 'bonus', 'expire'));
create unique index if not exists credit_tx_bonus_ref_uniq
  on public.credit_transactions (ref) where type = 'bonus' and ref is not null;

-- ② 무료 크레딧 상태(사용자당 1행)
create table if not exists public.bonus_credits (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  granted    integer not null check (granted >= 0),
  remaining  integer not null check (remaining >= 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
comment on table public.bonus_credits is '가입 무료 크레딧(30일). 잔액 자체는 user_credits 에 들어 있고, 여기서는 무료분 남은 수·기한만.';

-- ③ 지급한 신원 해시(재가입 반복 지급 방지, 탈퇴해도 남김)
create table if not exists public.bonus_identity (
  hash       text primary key,
  user_id    uuid,
  created_at timestamptz not null default now()
);
comment on table public.bonus_identity is '가입 무료 크레딧을 받은 이메일·소셜 고유번호의 SHA-256 해시. 원문 저장 X.';

alter table public.bonus_credits  enable row level security;
alter table public.bonus_identity enable row level security;
drop policy if exists "read own bonus" on public.bonus_credits;
create policy "read own bonus" on public.bonus_credits for select to authenticated using (auth.uid() = user_id);

-- 10/30 이후 새 테이블은 GRANT 필수
grant select on public.bonus_credits to authenticated;
grant all on public.bonus_credits  to service_role;
grant all on public.bonus_identity to service_role;

-- ④ 기한 지난 무료분 회수(게으른 만료 — 잔액 조회·차감 때 먼저 부른다)
create or replace function public.expire_bonus(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rem integer;
  v_bal integer;
  v_take integer;
begin
  if p_user_id is null then return; end if;
  select remaining into v_rem from public.bonus_credits
   where user_id = p_user_id and remaining > 0 and expires_at <= now()
   for update;
  if v_rem is null then return; end if;

  select balance into v_bal from public.user_credits where user_id = p_user_id for update;
  v_take := least(v_rem, coalesce(v_bal, 0));
  update public.bonus_credits set remaining = 0 where user_id = p_user_id;
  if v_take > 0 then
    update public.user_credits set balance = balance - v_take, updated_at = now()
     where user_id = p_user_id returning balance into v_bal;
    insert into public.credit_transactions (user_id, type, amount, balance_after, ref)
    values (p_user_id, 'expire', v_take, v_bal, 'expire:' || p_user_id::text);
  end if;
end;
$$;
revoke execute on function public.expire_bonus(uuid) from public, anon, authenticated;
grant  execute on function public.expire_bonus(uuid) to service_role;

-- ⑤ 지급(서버 전용). p_amount = 이번에 줄 개수(기존 회원은 남은 무료권 수, 0 이면 기록만)
create or replace function public.grant_signup_bonus(
  p_user_id uuid,
  p_hashes  text[],
  p_amount  integer,
  p_days    integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bal integer;
  v_amt integer := greatest(0, least(coalesce(p_amount, 0), 2));
  v_exp timestamptz := now() + make_interval(days => coalesce(p_days, 30));
begin
  perform pg_advisory_xact_lock(hashtext('bonus:' || p_user_id::text));

  if exists (select 1 from public.bonus_credits where user_id = p_user_id) then
    return jsonb_build_object('granted', false, 'reason', 'already');
  end if;
  -- 같은 이메일·소셜 계정으로 예전에 받았으면 0개(재가입)
  if exists (select 1 from public.bonus_identity where hash = any(coalesce(p_hashes, '{}'))) then
    v_amt := 0;
  end if;

  insert into public.bonus_credits (user_id, granted, remaining, expires_at)
  values (p_user_id, v_amt, v_amt, v_exp);
  insert into public.bonus_identity (hash, user_id)
  select h, p_user_id from unnest(coalesce(p_hashes, '{}')) as h
  on conflict (hash) do nothing;

  if v_amt > 0 then
    insert into public.user_credits as uc (user_id, balance, updated_at)
    values (p_user_id, v_amt, now())
    on conflict (user_id) do update set balance = uc.balance + excluded.balance, updated_at = now()
    returning uc.balance into v_bal;
    insert into public.credit_transactions (user_id, type, amount, balance_after, ref)
    values (p_user_id, 'bonus', v_amt, v_bal, 'bonus:' || p_user_id::text);
  end if;

  return jsonb_build_object('granted', v_amt > 0, 'amount', v_amt, 'expires_at', v_exp);
end;
$$;
revoke execute on function public.grant_signup_bonus(uuid, text[], integer, integer) from public, anon, authenticated;
grant  execute on function public.grant_signup_bonus(uuid, text[], integer, integer) to service_role;

-- ⑥ 차감: 0002 와 같고, 먼저 만료 처리 + 성공하면 무료분부터 줄인다
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount  integer,
  p_ref     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'deduct amount must be positive (got %)', p_amount;
  end if;

  perform public.expire_bonus(p_user_id);

  select balance into v_balance from public.user_credits where user_id = p_user_id for update;

  if p_ref is not null and exists (
    select 1 from public.credit_transactions where type = 'deduct' and ref = p_ref and user_id = p_user_id
  ) then
    return jsonb_build_object('success', true, 'balance', coalesce(v_balance, 0), 'idempotent', true);
  end if;

  if v_balance is null then
    return jsonb_build_object('success', false, 'reason', 'no_credits', 'balance', 0);
  end if;
  if v_balance < p_amount then
    return jsonb_build_object('success', false, 'reason', 'insufficient', 'balance', v_balance);
  end if;

  update public.user_credits set balance = balance - p_amount, updated_at = now()
   where user_id = p_user_id returning balance into v_balance;
  insert into public.credit_transactions (user_id, type, amount, balance_after, ref)
  values (p_user_id, 'deduct', p_amount, v_balance, p_ref);

  -- 무료분 먼저 소진
  update public.bonus_credits set remaining = greatest(0, remaining - p_amount)
   where user_id = p_user_id and remaining > 0 and expires_at > now();

  return jsonb_build_object('success', true, 'balance', v_balance);
end;
$$;
revoke execute on function public.deduct_credits(uuid, integer, text) from public, anon, authenticated;
grant  execute on function public.deduct_credits(uuid, integer, text) to service_role;

-- ⑦ 화면 잔액 조회도 만료 먼저(같은 이름·인자 유지 → 화면 코드 변경 없음)
drop function if exists public.get_credit_balance();
create function public.get_credit_balance()
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.expire_bonus(auth.uid());
  return coalesce((select balance from public.user_credits where user_id = auth.uid()), 0);
end;
$$;
revoke execute on function public.get_credit_balance() from public;
grant  execute on function public.get_credit_balance() to authenticated, anon;

-- 확인: 함수 3개·테이블 2개가 모두 보이면 성공 (functions=3, tables=2)
select
  (select count(*) from pg_proc where proname in ('expire_bonus', 'grant_signup_bonus', 'get_credit_balance') and pronamespace = 'public'::regnamespace) as functions,
  (select count(*) from pg_tables where schemaname = 'public' and tablename in ('bonus_credits', 'bonus_identity')) as tables;
