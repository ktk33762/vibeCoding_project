-- comments.user_id FK를 auth.users → profiles로 변경
-- posts와 동일하게 PostgREST가 profiles 조인을 인식할 수 있게 함
ALTER TABLE public.comments DROP CONSTRAINT comments_user_id_fkey;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
