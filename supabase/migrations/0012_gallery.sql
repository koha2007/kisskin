-- 고객 메이크업 갤러리 (2026-11-02 운영자 결정: 별점 없는 갤러리)
--
-- 왜 별점이 아닌가: 별점은 결국 사람 얼굴 점수가 된다. 룩을 응원하는 하트 1인 1개만 둔다.
--
-- 규칙:
--   • 올리는 건 본인이 고른 AI 결과 이미지 1장뿐. 원본 셀카는 올라가지 않는다.
--   • 공개 동의·성인 본인 확인을 받고(consent_text 증빙), 운영자가 승인해야 공개된다.
--   • 승인 전 이미지는 비공개 버킷(gallery-pending), 승인 후에만 공개 버킷(gallery)으로 옮긴다.
--   • 신고 3건이면 공개를 내리고 다시 검토한다. 본인은 언제든 삭제할 수 있다.
--   • 이름·이메일은 화면에 내보내지 않는다.
--   • 읽고 쓰는 건 서버 함수(functions/api/gallery*.ts, service_role)뿐 — 클라이언트 직접 접근 없음.
--
-- 실행: Supabase SQL Editor 에 이 파일 전체를 붙여 실행. 멱등. (새 테이블은 GRANT 필수 — 아래 포함)

create table if not exists public.gallery_post (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  source        text not null check (source in ('makeup', 'lucky', 'paint', 'hair')),  -- 11/11 페인팅·헤어 추가
  look_id       text not null,
  image_bucket  text not null default 'gallery-pending' check (image_bucket in ('gallery-pending', 'gallery')),
  image_path    text not null,
  status        text not null default 'pending' check (status in ('pending', 'approved')),
  locale        text not null default 'ko' check (locale in ('ko', 'en')),
  consent_text  text not null,
  heart_count   integer not null default 0,
  report_count  integer not null default 0,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz
);
create index if not exists gallery_post_status_idx on public.gallery_post (status, created_at desc);
create index if not exists gallery_post_user_idx on public.gallery_post (user_id);

create table if not exists public.gallery_heart (
  post_id    uuid not null references public.gallery_post(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index if not exists gallery_heart_user_idx on public.gallery_heart (user_id);

create table if not exists public.gallery_report (
  post_id    uuid not null references public.gallery_post(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.gallery_post enable row level security;
alter table public.gallery_heart enable row level security;
alter table public.gallery_report enable row level security;
-- 정책 없음 = anon/authenticated 접근 불가. 서버 함수만 쓴다.

grant select, insert, update, delete on table public.gallery_post to service_role;
grant select, insert, update, delete on table public.gallery_heart to service_role;
grant select, insert, update, delete on table public.gallery_report to service_role;

-- 하트 토글(1인 1개). 공개된 사진에만.
create or replace function public.gallery_toggle_heart(p_post uuid, p_user uuid)
returns table (hearted boolean, heart_count integer)
language plpgsql security definer set search_path = public as $$
declare
  removed integer;
begin
  perform 1 from gallery_post where id = p_post and status = 'approved' for update;
  if not found then raise exception 'not_public'; end if;
  delete from gallery_heart h where h.post_id = p_post and h.user_id = p_user;
  get diagnostics removed = row_count;
  if removed = 0 then
    insert into gallery_heart (post_id, user_id) values (p_post, p_user);
  end if;
  return query
    update gallery_post p
       set heart_count = greatest(0, p.heart_count + case when removed = 0 then 1 else -1 end)
     where p.id = p_post
    returning (removed = 0), p.heart_count;
end $$;

-- 신고(1인 1회). 3건이 되면 공개를 내려 다시 검토한다. hidden = 이번 신고로 내려갔는지.
create or replace function public.gallery_report_post(p_post uuid, p_user uuid)
returns table (hidden boolean)
language plpgsql security definer set search_path = public as $$
declare
  added integer;
  cnt integer;
begin
  perform 1 from gallery_post where id = p_post and status = 'approved' for update;
  if not found then return query select false; return; end if;
  insert into gallery_report (post_id, user_id) values (p_post, p_user) on conflict do nothing;
  get diagnostics added = row_count;
  if added = 0 then return query select false; return; end if;
  update gallery_post set report_count = report_count + 1 where id = p_post returning report_count into cnt;
  if cnt >= 3 then
    update gallery_post set status = 'pending' where id = p_post;
    return query select true; return;
  end if;
  return query select false;
end $$;

revoke all on function public.gallery_toggle_heart(uuid, uuid) from public, anon, authenticated;
revoke all on function public.gallery_report_post(uuid, uuid) from public, anon, authenticated;
grant execute on function public.gallery_toggle_heart(uuid, uuid) to service_role;
grant execute on function public.gallery_report_post(uuid, uuid) to service_role;

-- 저장소: 승인 전 = 비공개, 승인 후 = 공개. JPEG 2MB 까지.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery-pending', 'gallery-pending', false, 2097152, array['image/jpeg']),
  ('gallery', 'gallery', true, 2097152, array['image/jpeg'])
on conflict (id) do nothing;
