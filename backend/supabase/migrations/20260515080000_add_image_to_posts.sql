-- posts 테이블에 image_url 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Storage 버킷 생성 (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 정책
CREATE POLICY "post-images: 누구나 조회"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "post-images: 로그인 사용자 업로드"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "post-images: 본인 파일 삭제"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
