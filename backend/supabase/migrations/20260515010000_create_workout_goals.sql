-- 운동 목표 테이블 (주간/월간)
create table public.workout_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_type text not null check (period_type in ('weekly', 'monthly')),
  target_count int not null check (target_count > 0),
  created_at timestamptz not null default now(),
  unique (user_id, period_type)
);

alter table public.workout_goals enable row level security;

create policy "users can manage own goals"
  on public.workout_goals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
