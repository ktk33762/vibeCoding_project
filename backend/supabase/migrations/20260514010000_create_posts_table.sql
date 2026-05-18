-- posts 테이블: 자유게시판
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  content text not null check (char_length(content) >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.posts enable row level security;

-- 로그인 사용자 전체 조회 허용
create policy "Posts are viewable by authenticated users"
  on public.posts for select
  to authenticated
  using (true);

-- 본인 글만 작성/수정/삭제
create policy "Users can insert own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- 인덱스
create index idx_posts_created_at on public.posts (created_at desc);
create index idx_posts_user_id on public.posts (user_id);

-- updated_at 자동 갱신
create trigger on_posts_updated
  before update on public.posts
  for each row execute function public.handle_updated_at();
