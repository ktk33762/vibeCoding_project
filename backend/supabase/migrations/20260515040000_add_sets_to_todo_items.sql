-- todo_items에 세트 추적 컬럼 추가
-- sets: NULL이면 일반 체크리스트 항목, 숫자면 루틴에서 불러온 운동 항목
alter table public.todo_items
  add column sets int,
  add column completed_sets int not null default 0;
