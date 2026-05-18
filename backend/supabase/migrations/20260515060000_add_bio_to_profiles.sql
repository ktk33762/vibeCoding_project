-- profiles 테이블에 소개글 컬럼 추가
alter table public.profiles
  add column bio text;
