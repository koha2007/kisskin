-- 친구 초대 (2026-10-21 운영자 결정)
--
-- 규칙:
--   • 회원마다 초대 코드 1개(8자). 링크 = https://kissinskin.net/?ref=<코드> (어느 페이지든 ?ref= 가 붙으면 기억).
--   • 친구가 링크로 들어와 로그인하면 "초대받음"으로 묶는다(claim). 조건:
--       ① 자기 자신 코드 X  ② 이미 다른 사람에게 묶였으면 X  ③ 크레딧을 산 적이 있으면 X(첫 결제 전에만)
--       ④ 탈퇴 후 같은 이메일·구글 계정으로 재가입해 다시 묶기 X(신원 해시 — 0008 무료권과 같은 방식)
--   • 친구가 크레딧을 처음 사면(polar-webhook) 양쪽 +2 크레딧. 초대한 사람 보상은 최대 10명까지.
--     10명이 넘어도 친구 쪽 +2 는 그대로 준다(링크를 받은 사람이 손해 보지 않게).
--   • 보상 충전은 charge_credits(ref='referral:<주문id>:friend|inviter') — 웹훅 재시도에도 한 번만.
--
-- 실행: Supabase SQL Editor 에 이 파일 전체를 붙여 실행. (새 테이블은 GRANT 필수 — 아래 포함)

-- ── 초대 코드 ──
create table if not exists public.referral_codes (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  code       text not null unique check (code ~ '^[A-Z0-9]{8}$'),
  created_at timestamptz not null default now()
);

-- ── 초대 관계(친구 1명 = 1행) ──
create table if not exists public.referrals (
  id               bigserial primary key,
  referrer_id      uuid references auth.users(id) on delete set null,  -- 초대한 사람
  referee_id       uuid unique references auth.users(id) on delete set null, -- 초대받은 친구
  referee_hashes   text[] not null default '{}',   -- 친구의 'e:'·'p:' 신원 해시(재가입 재묶기 방지)
  code             text not null,
  created_at       timestamptz not null default now(),
  rewarded_at      timestamptz,                    -- 친구 첫 결제로 보상이 나간 때
  reward_order     text,                           -- 그 주문 id
  inviter_rewarded boolean not null default false  -- 초대한 사람도 받았는지(10명 한도)
);

create index if not exists referrals_referrer_idx on public.referrals (referrer_id);
create index if not exists referrals_hash_idx on public.referrals using gin (referee_hashes);

alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
revoke all on public.referral_codes from anon, authenticated;
revoke all on public.referrals from anon, authenticated;
grant select, insert, delete on public.referral_codes to service_role;
grant select, insert, update, delete on public.referrals to service_role;
grant usage, select on sequence public.referrals_id_seq to service_role;

-- ── 내 코드(없으면 만든다) ──
create or replace function public.get_or_create_referral_code(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  i int := 0;
begin
  select code into v_code from public.referral_codes where user_id = p_user_id;
  if v_code is not null then return v_code; end if;
  loop
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text || p_user_id::text), 1, 8));
    begin
      insert into public.referral_codes (user_id, code) values (p_user_id, v_code);
      return v_code;
    exception when unique_violation then
      -- 같은 user_id 동시 요청이면 이미 생긴 코드를 돌려준다
      select code into v_code from public.referral_codes where user_id = p_user_id;
      if v_code is not null then return v_code; end if;
      i := i + 1;
      if i > 5 then raise; end if;
    end;
  end loop;
end;
$$;

-- ── 초대받음 묶기 ──
-- 반환: { success, reason? }  reason = invalid_code | self | already | paid | rejoined
create or replace function public.claim_referral(p_referee uuid, p_hashes text[], p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer uuid;
  v_existing uuid;
begin
  select user_id into v_referrer from public.referral_codes where code = upper(trim(p_code));
  if v_referrer is null then
    return json_build_object('success', false, 'reason', 'invalid_code');
  end if;
  if v_referrer = p_referee then
    return json_build_object('success', false, 'reason', 'self');
  end if;

  perform pg_advisory_xact_lock(hashtext('referral:' || p_referee::text));

  select referrer_id into v_existing from public.referrals where referee_id = p_referee;
  if found then
    return json_build_object('success', v_existing = v_referrer, 'reason', 'already',
      'idempotent', v_existing = v_referrer);
  end if;
  if exists (select 1 from public.referrals where referee_hashes && coalesce(p_hashes, '{}')) then
    return json_build_object('success', false, 'reason', 'rejoined');
  end if;
  if exists (select 1 from public.credit_transactions where user_id = p_referee and type = 'charge'
               and (ref is null or ref not like 'referral:%')) then  -- 초대 보상은 결제가 아님
    return json_build_object('success', false, 'reason', 'paid');
  end if;

  insert into public.referrals (referrer_id, referee_id, referee_hashes, code)
  values (v_referrer, p_referee, coalesce(p_hashes, '{}'), upper(trim(p_code)));
  return json_build_object('success', true);
end;
$$;

-- ── 친구 첫 결제 → 양쪽 보상 ──
-- polar-webhook 이 크레딧 충전 직후 부른다. 묶인 적 없거나 이미 보상했으면 아무것도 안 한다.
-- 반환: { rewarded, friend, inviter }
create or replace function public.reward_referral(p_referee uuid, p_order text, p_bonus int, p_cap int)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.referrals%rowtype;
  v_inviter_count int;
  v_inviter boolean := false;
begin
  select * into r from public.referrals
  where referee_id = p_referee and rewarded_at is null
  for update;
  if not found then
    return json_build_object('rewarded', false);
  end if;

  perform public.charge_credits(p_referee, p_bonus, 'referral:' || p_order || ':friend');

  if r.referrer_id is not null then
    perform pg_advisory_xact_lock(hashtext('referral_inviter:' || r.referrer_id::text));
    select count(*) into v_inviter_count from public.referrals
    where referrer_id = r.referrer_id and inviter_rewarded;
    if v_inviter_count < p_cap then
      perform public.charge_credits(r.referrer_id, p_bonus, 'referral:' || p_order || ':inviter');
      v_inviter := true;
    end if;
  end if;

  update public.referrals
    set rewarded_at = now(), reward_order = p_order, inviter_rewarded = v_inviter
    where id = r.id;

  return json_build_object('rewarded', true, 'friend', p_bonus, 'inviter', case when v_inviter then p_bonus else 0 end);
end;
$$;

-- ── 내 초대 현황 ──
create or replace function public.referral_stats(p_user_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'joined',   count(*)::int,
    'paid',     count(*) filter (where rewarded_at is not null)::int,
    'rewarded', count(*) filter (where inviter_rewarded)::int
  )
  from public.referrals where referrer_id = p_user_id;
$$;

revoke all on function public.get_or_create_referral_code(uuid) from public, anon, authenticated;
revoke all on function public.claim_referral(uuid, text[], text) from public, anon, authenticated;
revoke all on function public.reward_referral(uuid, text, int, int) from public, anon, authenticated;
revoke all on function public.referral_stats(uuid) from public, anon, authenticated;
grant execute on function public.get_or_create_referral_code(uuid) to service_role;
grant execute on function public.claim_referral(uuid, text[], text) to service_role;
grant execute on function public.reward_referral(uuid, text, int, int) to service_role;
grant execute on function public.referral_stats(uuid) to service_role;

notify pgrst, 'reload schema';
