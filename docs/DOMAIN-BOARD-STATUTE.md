# 게시판 도메인 법률

## 엔티티

### posts

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK | 게시글 식별자 |
| user_id | uuid | NOT NULL, FK(**public.profiles(id)**), ON DELETE CASCADE | 작성자 |
| title | text | NOT NULL | 제목 |
| content | text | NOT NULL | 본문 |
| image_url | text | NULL | 첨부 이미지 URL (Supabase Storage) |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 작성 시각 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 수정 시각 (트리거 자동 갱신) |

> `user_id`는 `public.profiles(id)` 참조 — PostgREST가 `profiles(nickname)` 자동 조인 가능

### comments

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK | 댓글 식별자 |
| post_id | uuid | NOT NULL, FK(posts), ON DELETE CASCADE | 소속 게시글 |
| user_id | uuid | NOT NULL, FK(**public.profiles(id)**), ON DELETE CASCADE | 작성자 |
| content | text | NOT NULL | 댓글 내용 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 작성 시각 |

> `user_id`는 `public.profiles(id)` 참조 — `profiles(nickname)` 자동 조인 필수

### post_likes

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| post_id | uuid | PK(복합), FK(posts), ON DELETE CASCADE | 게시글 |
| user_id | uuid | PK(복합), FK(auth.users), ON DELETE CASCADE | 좋아요 한 사용자 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 좋아요 시각 |

- PRIMARY KEY(post_id, user_id) — 1인 1좋아요 보장

## RLS 정책

### posts

| 정책명 | 대상 | 조건 |
|--------|------|------|
| Posts are viewable by everyone | SELECT | 누구나 허용 |
| Users can insert own posts | INSERT | auth.uid() = user_id |
| Users can update own posts | UPDATE | auth.uid() = user_id |
| Users can delete own posts | DELETE | auth.uid() = user_id |

### comments

| 정책명 | 대상 | 조건 |
|--------|------|------|
| Comments are viewable by everyone | SELECT | 누구나 허용 |
| Users can insert own comments | INSERT | auth.uid() = user_id |
| Users can delete own comments | DELETE | auth.uid() = user_id |

### post_likes

| 정책명 | 대상 | 조건 |
|--------|------|------|
| Likes are viewable by everyone | SELECT | 누구나 허용 |
| Users can manage own likes | INSERT | auth.uid() = user_id |
| Users can delete own likes | DELETE | auth.uid() = user_id |

## Supabase Storage

- 버킷명: `post-images` (공개 버킷)
- 업로드 경로: `{userId}/{timestamp}_{filename}`
- RLS: 로그인한 사용자만 업로드 / 삭제; 조회는 공개

## 트리거

| 트리거명 | 이벤트 | 함수 | 설명 |
|---------|--------|------|------|
| on_posts_updated | UPDATE on posts | handle_updated_at() | updated_at 자동 갱신 |

## 프론트엔드 규칙

### 페이지

| 경로 | 설명 | 인증 |
|------|------|------|
| /board | 게시글 목록 (전체/팔로잉 탭) | 불필요 |
| /board/new | 게시글 작성 (이미지 첨부 가능) | 필요 |
| /board/:id | 게시글 상세 (댓글, 좋아요) | 불필요 |

### 훅

- `usePosts`: 게시글 목록 조회 (post_likes count 포함), 생성, 삭제
- `useComments(postId)`: 댓글 목록 조회, 작성, 삭제
- `usePostLikes(postId)`: 좋아요 수 및 isLiked 상태, toggleLike

### 쿼리 패턴

- 게시글 목록: `posts` + `profiles(nickname)` + `post_likes(count)` 한번에 조회
- 댓글: `comments` + `profiles(nickname)` 조인 (FK가 profiles라 PostgREST 자동 조인)
- 댓글 추가 후: `select` 없이 `fetchComments()` 재호출 (조인 타이밍 이슈 방지)
- 팔로잉 탭: `follows`에서 following_id 목록 → `posts` IN 쿼리 (두 단계 쿼리)
- 좋아요 토글: optimistic UI 업데이트

### 규칙

- 제목: 1자 이상 필수
- 본문: 1자 이상 필수
- 이미지: 최대 5MB (클라이언트 검증), 첨부 선택
- 목록 정렬: 최신순 (created_at DESC)
- `/feed` → `/board` 리다이렉트 (`<Navigate to="/board" replace />`)
