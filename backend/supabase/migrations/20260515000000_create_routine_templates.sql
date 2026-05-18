-- 루틴 템플릿 테이블
create table public.routine_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.routine_templates enable row level security;

create policy "users can manage own templates"
  on public.routine_templates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 루틴 항목 테이블
create table public.routine_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.routine_templates(id) on delete cascade,
  content text not null,
  sort_order int not null default 0
);

alter table public.routine_template_items enable row level security;

create policy "users can manage own template items"
  on public.routine_template_items
  for all
  using (
    exists (
      select 1 from public.routine_templates
      where id = routine_template_items.template_id and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.routine_templates
      where id = routine_template_items.template_id and user_id = auth.uid()
    )
  );
