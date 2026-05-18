-- 루틴 템플릿 항목에 무게/반복횟수 추가
alter table public.routine_template_items
  add column weight_kg numeric,
  add column reps int;

-- todo 항목에도 무게/반복횟수 추가 (루틴에서 불러올 때 복사)
alter table public.todo_items
  add column weight_kg numeric,
  add column reps int;
