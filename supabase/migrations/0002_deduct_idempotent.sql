-- ════════════════════════════════════════════════════════════════════
-- FREE_PIVOT_PLAN P1-5 · 3단계: deduct_credits 에 ref 멱등성 추가
-- ────────────────────────────────────────────────────────────────────
-- 운영자가 Supabase 대시보드 → SQL Editor 에 붙여넣어 실행한다(0001 다음).
-- create or replace 라 재실행 안전. 0001 의 user_credits/credit_transactions
-- 는 그대로 두고, deduct_credits 함수만 교체한다(기존 테이블·auth 무변경).
--
-- 목적("결제 토큰" 모델):
--   같은 ref(생성 작업 id)로 차감이 이미 있으면 → 재차감 없이 성공 반환.
--   → 응답 유실/일시 실패 재시도에 같은 jobId 가 와도 이중차감 안 됨.
--   → OpenAI 일시 실패 시 환불하지 않고, 같은 jobId 재시도로 무료 재호출.
-- ════════════════════════════════════════════════════════════════════

-- 하드 가드: deduct ref 도 유니크(같은 작업 두 줄 방지). 부분 유니크.
create unique index if not exists credit_tx_deduct_ref_uniq
  on public.credit_transactions (ref)
  where type = 'deduct' and ref is not null;

create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount  integer,
  p_ref     text default null
)
returns jsonb              -- { success, balance, reason?, idempotent? }
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

  -- ── 멱등: 같은 ref 차감이 이미 있으면 재차감 없이 현재 잔액 반환 ──
  --   ("결제 토큰" 모델: 이 작업은 이미 결제됨 → 재시도는 무료 재호출)
  if p_ref is not null and exists (
    select 1 from public.credit_transactions
    where type = 'deduct' and ref = p_ref and user_id = p_user_id
  ) then
    return jsonb_build_object(
      'success', true,
      'balance', coalesce(v_balance, 0),
      'idempotent', true
    );
  end if;

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

-- create or replace 는 기존 권한을 보존하지만, 명시적으로 재적용(멱등).
revoke execute on function public.deduct_credits(uuid, integer, text) from public;
revoke execute on function public.deduct_credits(uuid, integer, text) from anon, authenticated;
grant  execute on function public.deduct_credits(uuid, integer, text) to service_role;

-- ════════════════════════════════════════════════════════════════════
-- 검증(선택): 같은 ref 두 번 → 두 번째는 idempotent:true, 잔액 그대로
--   select public.deduct_credits('<uuid>', 1, 'job-test-1');  -- success, balance -1
--   select public.deduct_credits('<uuid>', 1, 'job-test-1');  -- success, idempotent, 동일잔액
-- ════════════════════════════════════════════════════════════════════
