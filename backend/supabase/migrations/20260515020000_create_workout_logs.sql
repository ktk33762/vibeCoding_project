-- 운동 완료 기록 테이블
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

alter table public.workout_logs enable row level security;

create policy "users can manage own logs"
  on public.workout_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
