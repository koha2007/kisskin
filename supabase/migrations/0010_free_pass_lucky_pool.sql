-- 가입 무료권 풀에 'lucky'(럭키 메이크업 1장) 추가 (2026-10-24)
--
-- 운영자 10/24: 가입 무료권 2장 = ① 2026 메이크업 9룩 중 1룩 1장(makeup) + ② 럭키 메이크업 9가지 운 중 1개 1장(lucky).
--   옛 'tool' 풀(뷰티 DNA·정밀 사주 풀이)은 0장(크레딧만) — 기록 호환을 위해 check 에는 남겨 둔다.
-- 이 파일 실행 전에는 _freeUsage.ts 가 lucky 무료권을 KV(mu:lucky:)에 기록하는 방식으로 자동 후퇴한다.
-- 새 테이블이 아니라 기존 테이블 제약만 바꾸므로 추가 GRANT 는 필요 없다.
--
-- 실행: Supabase SQL Editor 에 이 파일 전체를 붙여 실행.

alter table public.free_pass_ledger drop constraint if exists free_pass_ledger_pool_check;
alter table public.free_pass_ledger
  add constraint free_pass_ledger_pool_check check (pool in ('makeup', 'tool', 'lucky'));

-- 확인: 'lucky' 가 들어 있으면 성공
select conname, pg_get_constraintdef(oid) as def
from pg_constraint
where conrelid = 'public.free_pass_ledger'::regclass and conname = 'free_pass_ledger_pool_check';
