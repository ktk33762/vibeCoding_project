-- routine_template_items에 세트 수 컬럼 추가
alter table public.routine_template_items
  add column sets int not null default 3 check (sets >= 1);

-- 기존 content 컬럼을 운동 이름(name)으로 rename
alter table public.routine_template_items
  rename column content to name;
