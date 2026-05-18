# 소셜 도메인 법률

## DB 테이블 정의

### profiles (회원 도메인 공유)

추가 컬럼:

| 컬럼 | 타입 | 설명 |
|------|------|------|
| bio | text NULL | 소개글 |

전체 컬럼은 `DOMAIN-MEMBER-STATUTE.md` 참조

### follows

| 컬럼 | 타입 | 설명 |
|------|------|------|
| follower_id | uuid FK auth.users | 팔로우하는 사람 |
| following_id | uuid FK auth.users | 팔로우 받는 사람 |
| created_at | timestamptz | 팔로우 시각 |

- PRIMARY KEY(follower_id, following_id) — 중복 팔로우 방지
- CHECK follower_id ≠ following_id — 자기 자신 팔로우 방지

## RLS 정책

- `follows`: SELECT → 누구나 가능 / INSERT·DELETE → 본인(follower_id = auth.uid())만 가능
- `profiles`: SELECT 전체 공개, UPDATE 본인만

## 프론트엔드 규칙

### 페이지

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| /profile | MyProfileRedirect | 내 userId로 리다이렉트 |
| /profile/:userId | ProfilePage | 공개 프로필 (팔로우 버튼, 게시글, 운동 현황) |
| /feed | (없음) | → /board 로 리다이렉트 (`<Navigate to="/board" replace />`) |

### 훅

- `useFollows(targetUserId)`: 팔로워 수, 팔로잉 수, isFollowing 상태, follow/unfollow 함수
  - `getFollowingIds()`: `useCallback(async () => {...}, [])` — 참조 안정화 필수 (무한 루프 방지)

### 컴포넌트

- `FollowListModal`: 팔로워/팔로잉 목록 모달
  - Props: `userId`, `type: 'followers' | 'following'`, `onClose`
  - 두 단계 쿼리: `follows`에서 ID 목록 → `profiles` IN 쿼리로 닉네임 조회
  - 오버레이 클릭 시 닫힘, 스크롤 가능 목록

### 쿼리 패턴

- follows.follower_id/following_id는 `auth.users` 참조 → PostgREST로 profiles 자동 조인 불가
- 팔로워/팔로잉 목록: 두 단계 쿼리 사용
  1. `follows` 에서 follower_id 또는 following_id 목록 조회
  2. `profiles` 에서 `id IN (목록)` 쿼리로 닉네임 포함 정보 조회

### ProfilePage 표시 내용

| 섹션 | 내용 |
|------|------|
| 상단 | 닉네임, bio, 팔로워/팔로잉 수(클릭 → 모달), 팔로우 버튼 |
| 운동 현황 | 주간/월간 목표 진행 바 (workout_goals, workout_logs count 쿼리) |
| 게시글 목록 | 작성한 posts (썸네일, 제목, 날짜, 좋아요 수) |
