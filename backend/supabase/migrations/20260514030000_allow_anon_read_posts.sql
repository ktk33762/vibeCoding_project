-- 비로그인 사용자도 게시글 조회 허용
drop policy "Posts are viewable by authenticated users" on public.posts;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);
