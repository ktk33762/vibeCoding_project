-- 댓글 테이블
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments: 누구나 읽기"
ON comments FOR SELECT USING (true);

CREATE POLICY "comments: 로그인 사용자 작성"
ON comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments: 본인 삭제"
ON comments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 좋아요 테이블
CREATE TABLE post_likes (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_likes: 누구나 읽기"
ON post_likes FOR SELECT USING (true);

CREATE POLICY "post_likes: 로그인 사용자 좋아요"
ON post_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_likes: 본인 취소"
ON post_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);
