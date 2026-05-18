-- posts.user_id FK를 auth.users → profiles로 변경
-- PostgREST가 posts와 profiles 간의 관계를 인식할 수 있게 함
alter table public.posts drop constraint posts_user_id_fkey;

alter table public.posts
  add constraint posts_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
