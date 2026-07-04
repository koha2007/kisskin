-- ════════════════════════════════════════════════════════════════════
-- FREE_PIVOT_PLAN P1-5 · 2단계: 크레딧 저장소 (user_credits + 이력 + RPC)
-- ────────────────────────────────────────────────────────────────────
-- 운영자가 Supabase 대시보드 → SQL Editor 에 통째로 붙여넣어 실행한다.
-- 멱등(idempotent): create ... if not exists / create or replace 라 재실행 안전.
--
-- 원칙:
--   • 새 테이블만 추가. 기존 테이블(subscriptions/orders/usage_tracking/
--     webhook_events)·auth 는 손대지 않는다.
--   • 잔액 변경(충전/차감)은 전부 아래 RPC 안에서만 → "읽고-계산-쓰기" 경합
--     (이중충전·이중차감) 원천 차단. 클라이언트는 잔액을 직접 못 쓴다.
--   • 돈 = fail-safe. 차감은 잔액 부족 시 "변경 없음 + 실패 신호"를 돌려준다
--     (3단계 호출부는 success=false 면 결과 생성을 막는다).
--
--   ※ auth.users 를 참조(FK)하지만 auth.users 자체를 변경하지는 않는다.
--     (profiles → auth.users 와 동일한 Supabase 표준 패턴. REFERENCES 권한만 사용.)
-- ════════════════════════════════════════════════════════════════════

-- ── 1. 잔액 테이블 ───────────────────────────────────────────────────
create table if not exists public.user_credits (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  balance    integer not null default 0 check (balance >= 0),   -- 음수 불가(안전망)
  updated_at timestamptz not null default now()
);

comment on table public.user_credits is '유저별 크레딧 잔액. 변경은 RPC(charge/deduct_credits)로만.';

-- ── 2. 거래 이력 (결제·차감 분쟁 추적) ───────────────────────────────
create table if not exists public.credit_transactions (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          text not null check (type in ('charge', 'deduct')),
  amount        integer not null check (amount > 0),  -- 항상 양수, 방향은 type 으로
  balance_after integer not null,                     -- 거래 직후 잔액(감사용)
  ref           text,                                  -- polar order id / 생성 작업 id 등
  created_at    timestamptz not null default now()
);

comment on table public.credit_transactions is '크레딧 충전/차감 원장. append-only 이력.';

create index if not exists credit_tx_user_created_idx
  on public.credit_transactions (user_id, created_at desc);

-- 충전 멱등성: 같은 ref(예: Polar order id)로 두 번 충전 방지(웹훅 재시도 대비).
create unique index if not exists credit_tx_charge_ref_uniq
  on public.credit_transactions (ref)
  where type = 'charge' and ref is not null;

-- ── 3. RLS: 유저는 자기 것만 읽기. 쓰기 정책 없음 → service_role 전용 ──
alter table public.user_credits        enable row level security;
alter table public.credit_transactions enable row level security;

-- 자기 잔액 읽기
drop policy if exists "read own credits" on public.user_credits;
create policy "read own credits" on public.user_credits
  for select to authenticated
  using (auth.uid() = user_id);

-- 자기 거래이력 읽기
drop policy if exists "read own transactions" on public.credit_transactions;
create policy "read own transactions" on public.credit_transactions
  for select to authenticated
  using (auth.uid() = user_id);

-- ⚠ INSERT/UPDATE/DELETE 정책을 일부러 만들지 않는다.
--   → anon/authenticated 는 잔액을 쓸 수 없다(누구나 무한충전 차단).
--   → service_role(서버)은 RLS 를 우회하고, 아래 SECURITY DEFINER RPC 로만 변경.

-- ════════════════════════════════════════════════════════════════════
-- 4. RPC (원자적 잔액 변경) — 전부 SECURITY DEFINER, search_path 고정
-- ════════════════════════════════════════════════════════════════════

-- 4-1. 잔액 조회 (클라이언트용) — 호출자 본인(auth.uid())만, 행 없으면 0
create or replace function public.get_credit_balance()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select balance from public.user_credits where user_id = auth.uid()),
    0
  );
$$;

revoke execute on function public.get_credit_balance() from public;
grant  execute on function public.get_credit_balance() to authenticated, anon;
-- anon 은 auth.uid() 가 null → 항상 0 (안전).

-- 4-2. 충전(+) — service_role 전용. ref 멱등.
create or replace function public.charge_credits(
  p_user_id uuid,
  p_amount  integer,
  p_ref     text default null
)
returns integer            -- 충전 후 잔액
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'charge amount must be positive (got %)', p_amount;
  end if;

  -- 멱등: 같은 ref 충전이 이미 있으면 현재 잔액만 반환(중복 충전 방지)
  if p_ref is not null and exists (
    select 1 from public.credit_transactions
    where type = 'charge' and ref = p_ref
  ) then
    return coalesce((select balance from public.user_credits where user_id = p_user_id), 0);
  end if;

  -- 원자적 upsert (+amount)
  insert into public.user_credits as uc (user_id, balance, updated_at)
  values (p_user_id, p_amount, now())
  on conflict (user_id) do update
    set balance    = uc.balance + excluded.balance,
        updated_at = now()
  returning uc.balance into v_balance;

  insert into public.credit_transactions (user_id, type, amount, balance_after, ref)
  values (p_user_id, 'charge', p_amount, v_balance, p_ref);

  return v_balance;
end;
$$;

revoke execute on function public.charge_credits(uuid, integer, text) from public;
revoke execute on function public.charge_credits(uuid, integer, text) from anon, authenticated;
grant  execute on function public.charge_credits(uuid, integer, text) to service_role;

-- 4-3. 차감(-) — service_role 전용. fail-safe: 부족하면 변경 없이 실패 반환.
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount  integer,
  p_ref     text default null
)
returns jsonb              -- { success, balance, reason? }
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

  -- 행 잠금 → 동시 차감 직렬화(이중차감 차단)
  select balance into v_balance
  from public.user_credits
  where user_id = p_user_id
  for update;

  if v_balance is null then
    return jsonb_build_object('success', false, 'reason', 'no_credits', 'balance', 0);
  end if;

  if v_balance < p_amount then
    return jsonb_build_object('success', false, 'reason', 'insufficient', 'balance', v_balance);
  end if;

  update public.user_credits
    set balance = balance - p_amount, updated_at = now()
    where user_id = p_user_id
    returning balance into v_balance;

  insert into public.credit_transactions (user_id, type, amount, balance_after, ref)
  values (p_user_id, 'deduct', p_amount, v_balance, p_ref);

  return jsonb_build_object('success', true, 'balance', v_balance);
end;
$$;

revoke execute on function public.deduct_credits(uuid, integer, text) from public;
revoke execute on function public.deduct_credits(uuid, integer, text) from anon, authenticated;
grant  execute on function public.deduct_credits(uuid, integer, text) to service_role;

-- ════════════════════════════════════════════════════════════════════
-- 검증 쿼리(선택): 실행 후 아래로 확인
--   select * from public.user_credits;
--   select * from public.credit_transactions order by created_at desc limit 20;
--   -- service_role 키로(서버에서) 충전 테스트:
--   -- select public.charge_credits('<uuid>', 5, 'test-order-1');
--   -- select public.deduct_credits('<uuid>', 1, 'test-job-1');
-- ════════════════════════════════════════════════════════════════════
