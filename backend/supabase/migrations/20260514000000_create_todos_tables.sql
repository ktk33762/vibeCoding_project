-- todos 테이블: 사용자별 할 일 관리
create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  memo text,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- todo_items 테이블: 할 일별 체크리스트 항목
create table public.todo_items (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null references public.todos on delete cascade,
  content text not null,
  is_checked boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.todos enable row level security;
alter table public.todo_items enable row level security;

-- todos RLS: 소유자만 CRUD
create policy "Users can view own todos"
  on public.todos for select
  using (auth.uid() = user_id);

create policy "Users can insert own todos"
  on public.todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on public.todos for update
  using (auth.uid() = user_id);

create policy "Users can delete own todos"
  on public.todos for delete
  using (auth.uid() = user_id);

-- todo_items RLS: 소속 todo의 소유자만 CRUD
create policy "Users can view own todo items"
  on public.todo_items for select
  using (
    exists (
      select 1 from public.todos
      where todos.id = todo_id
        and todos.user_id = auth.uid()
    )
  );

create policy "Users can insert own todo items"
  on public.todo_items for insert
  with check (
    exists (
      select 1 from public.todos
      where todos.id = todo_id
        and todos.user_id = auth.uid()
    )
  );

create policy "Users can update own todo items"
  on public.todo_items for update
  using (
    exists (
      select 1 from public.todos
      where todos.id = todo_id
        and todos.user_id = auth.uid()
    )
  );

create policy "Users can delete own todo items"
  on public.todo_items for delete
  using (
    exists (
      select 1 from public.todos
      where todos.id = todo_id
        and todos.user_id = auth.uid()
    )
  );

-- 인덱스
create index idx_todos_user_id on public.todos (user_id);
create index idx_todo_items_todo_id on public.todo_items (todo_id, sort_order);

-- todos updated_at 자동 갱신 트리거
create trigger on_todos_updated
  before update on public.todos
  for each row execute function public.handle_updated_at();
