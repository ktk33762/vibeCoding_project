-- 팔로우 관계 테이블
create table public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;

-- 팔로워 수 조회는 비로그인도 가능
create policy "follows are viewable by everyone"
  on public.follows for select
  using (true);

-- 팔로우/언팔로우는 본인만 가능
create policy "users can manage own follows"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "users can delete own follows"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- 조회 성능 인덱스
create index idx_follows_follower on public.follows (follower_id);
create index idx_follows_following on public.follows (following_id);
