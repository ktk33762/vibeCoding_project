# 현재 작업 캐시

> 이 파일은 다음 대화에서 바로 이어받을 수 있도록 현재 프로젝트 상태를 기록한다.
> 마지막 업데이트: 2026-05-18

---

## 프로젝트 기본 정보

- **경로**: `C:\aibe6\subProject`
- **프론트엔드**: `C:\aibe6\subProject\frontend` (Vite + React 19 + TypeScript)
- **백엔드**: `C:\aibe6\subProject\backend` (Supabase CLI)
- **Supabase 프로젝트 ref**: `fzkbikizkobdfzyzairx`
- **기술 스택**: Vite + React 19 + TypeScript / Supabase (Auth + Postgres + Storage + RLS) / Recharts / 도메인별 CSS

---

## 실행 방법

```bash
cd C:\aibe6\subProject\frontend
npm run dev
```

---

## 더미 사용자 (테스트용)

| 이메일 | 비밀번호 | 특징 |
|--------|---------|------|
| kim.fitness@test.com | Test1234! | 헬스 — 가슴·등·하체·어깨 루틴 |
| park.running@test.com | Test1234! | 러닝 — 하체·코어·인터벌 루틴 |
| lee.nutrition@test.com | Test1234! | 영양 — 전신·서킷 루틴 |
| choi.yoga@test.com | Test1234! | 요가 — 근력·코어·아침 루틴 |

---

## 적용된 마이그레이션 (전체)

| 파일명 | 내용 |
|--------|------|
| 20250512084300 | profiles 테이블 + handle_new_user 트리거 |
| 20260513000000 | 회원가입 트리거 보완 |
| 20260514000000 | todos + todo_items 테이블 |
| 20260514010000 | posts 테이블 |
| 20260514020000 | posts.user_id → public.profiles(id) FK 변경 |
| 20260514030000 | posts SELECT 비로그인 허용 |
| 20260515000000 | routine_templates + routine_template_items |
| 20260515010000 | workout_goals 테이블 |
| 20260515020000 | workout_logs 테이블 |
| 20260515030000 | routine_template_items에 sets 추가, content → name rename |
| 20260515040000 | todo_items에 sets 관련 컬럼 추가 |
| 20260515050000 | routine_template_items / todo_items에 weight_kg, reps 추가 |
| 20260515060000 | profiles에 bio 컬럼 추가 |
| 20260515070000 | follows 테이블 |
| 20260515080000 | posts.image_url 컬럼 + Storage 버킷 post-images |
| 20260515090000 | comments + post_likes 테이블 |
| 20260515100000 | comments.user_id → public.profiles(id) FK 변경 |
| 20260515110000 | workout_goals/logs SELECT 공개 RLS |
| 20260515120000 | workout_logs.routine_name 컬럼 추가 |
| 20260515130000 | workout_log_items 테이블 |
| 20260518000000 | routine_templates/items 인증 사용자 SELECT 허용 (루틴 가져오기) |

> **마이그레이션 추가 방법**: `backend/supabase/migrations/` 에 파일 생성 후 `npx supabase db push`

---

## 구현된 기능 전체 목록

### 인증 (Auth)
- 회원가입: 이메일 + 비밀번호(8자 이상) + 닉네임 → profiles 자동 생성
- 로그인 / 로그아웃
- 보호 라우트: `ProtectedRoute` 컴포넌트

### 할 일 (/todos)
- 할 일 CRUD (제목, 설명, 완료 여부)
- 체크리스트 항목(todo_items) CRUD
- 본인 데이터만 조회 (RLS)

### 게시판 (/board)
- 목록: 전체 탭 / 팔로잉 탭 (탭 전환)
- 글쓰기: 제목 + 본문 + 이미지(선택, 최대 5MB)
- 상세: 이미지 표시 / 좋아요 토글 / 댓글 작성·삭제 / 본인 글 삭제
- 목록에 이미지 썸네일 + 좋아요 수 표시
- 비로그인 목록·상세 조회 가능
- /feed → /board 리다이렉트

### 소셜 (/profile/:userId)
- 프로필: 닉네임, bio, 팔로워/팔로잉 수
- 프로필 편집 (닉네임, bio 수정)
- 팔로우 / 언팔로우
- 팔로워/팔로잉 수 클릭 → 목록 모달
- 게시글 목록 (썸네일 + 좋아요)
- 운동 현황 (주간/월간 목표 Progress Bar)
- **루틴 목록 조회**: 종목 펼쳐보기 (무게·횟수·세트)
- **루틴 가져오기**: 다른 사람 루틴을 내 루틴에 1클릭 복사
- /profile → 내 userId로 자동 리다이렉트

### 운동 (/workout)

**오늘의 운동 세션**
- 루틴 불러오기 → 종목별 세트 완료 체크
- 세트 간 휴식 타이머 (60/90/120초, 로컬 상태)
- 운동 완료 기록 버튼
- 진행 중인 운동 삭제 (✕ 버튼)
- 완료된 운동 삭제 (✕ 버튼)

**목표 달성 현황**
- 주간/월간 목표 설정 (upsert) + 달성 Progress Bar
- 운동 기록 목록: 날짜 + 루틴명
- "상세 ▼" 토글 → workout_log_items 지연 로딩
- 운동 기록 삭제

**루틴 템플릿**
- 루틴 생성 (종목명, 무게, 횟수, 세트)
- **루틴 편집**: 종목별 무게·횟수·세트 수정
- 루틴 삭제
- 루틴 → 오늘의 운동 세션으로 불러오기

**운동 통계**
- 주간 운동 횟수 (최근 8주 막대 그래프)
- 부위별 운동 비율 (최근 30일 도넛 차트, 루틴 1회 = 1카운트)
- 월간 총 볼륨 (최근 6개월, 무게 × 횟수 × 완료세트)
- 요일 분석 (요일별 횟수 막대 그래프, 최다 요일 강조)

---

## 핵심 파일 경로

### 프론트엔드

```
frontend/src/
  App.tsx                          # 라우트 정의
  lib/supabase.ts                  # Supabase 클라이언트

  types/
    post.ts                        # Post, Comment 타입
    workout.ts                     # WorkoutLog, WorkoutLogItem, WorkoutGoal,
                                   # RoutineTemplate, RoutineTemplateItem 타입

  hooks/
    useAuth.ts                     # 로그인 상태
    useTodos.ts                    # 할 일 CRUD
    usePosts.ts                    # 게시글 목록/생성/삭제 + 이미지 업로드
    useComments.ts                 # 댓글 CRUD
    usePostLikes.ts                # 좋아요 토글
    useFollows.ts                  # 팔로우 관계
    useWorkoutGoals.ts             # 운동 목표
    useWorkoutLogs.ts              # 운동 기록
    useRoutines.ts                 # 루틴 템플릿 CRUD + 편집
    useWorkoutStats.ts             # 운동 통계 데이터 계산

  pages/
    HomePage.tsx
    LoginPage.tsx
    SignupPage.tsx
    TodoPage.tsx
    BoardPage.tsx                  # 전체/팔로잉 탭
    PostWritePage.tsx              # 이미지 첨부 포함
    PostDetailPage.tsx             # 댓글 + 좋아요
    WorkoutPage.tsx                # 타이머 + 목표 + 기록 + 통계 + 루틴편집
    ProfilePage.tsx                # 프로필 + 루틴조회/가져오기 + 운동현황 + 게시글
    MyProfileRedirect.tsx

  components/
    Header.tsx                     # 공통 헤더
    ProtectedRoute.tsx             # 인증 가드
    FollowListModal.tsx            # 팔로워/팔로잉 목록 모달
    WorkoutTimer.tsx               # 휴식 타이머

  styles/
    board.css / todo.css / workout.css / social.css / auth.css
```

### 백엔드

```
backend/
  supabase/
    migrations/                    # 마이그레이션 SQL 파일들
  seed.mjs                         # 더미 사용자 + 게시글 시드
  seed-images.mjs                  # 기존 게시글에 Picsum 이미지 추가
  seed-routines.mjs                # 더미 루틴 + 운동 목표 + 운동 기록 시드
```

---

## DB 스키마 요약

### profiles
`id(PK,FK auth.users)` / `nickname(UNIQUE)` / `bio` / `created_at` / `updated_at`

### todos
`id` / `user_id(FK auth.users)` / `title` / `memo` / `is_completed` / `created_at`

### todo_items
`id` / `todo_id(FK todos)` / `content` / `is_checked` / `sets` / `completed_sets` / `weight_kg` / `reps` / `sort_order`

### posts
`id` / `user_id(FK profiles)` / `title` / `content` / `image_url` / `created_at` / `updated_at`
> user_id가 profiles 참조 → PostgREST 자동 조인으로 nickname 가져옴

### comments
`id` / `post_id(FK posts)` / `user_id(FK profiles)` / `content` / `created_at`
> user_id가 profiles 참조 필수 (auth.users 참조 시 400 오류)

### post_likes
`post_id(PK)` / `user_id(PK)` / `created_at`
> 복합 PK로 1인 1좋아요 보장

### follows
`follower_id(PK,FK auth.users)` / `following_id(PK,FK auth.users)` / `created_at`
> auth.users 참조 → profiles 자동 조인 불가 → 두 단계 쿼리 사용

### routine_templates
`id` / `user_id(FK auth.users)` / `name` / `created_at`
> SELECT: 인증된 모든 사용자 허용 (루틴 가져오기) / INSERT·UPDATE·DELETE: 본인만

### routine_template_items
`id` / `template_id(FK routine_templates)` / `name` / `sets` / `weight_kg` / `reps` / `sort_order`
> SELECT: 인증된 모든 사용자 허용 / 쓰기: 본인 템플릿만

### workout_goals
`id` / `user_id(FK auth.users)` / `period_type('weekly'|'monthly')` / `target_count` / `created_at`
> UNIQUE(user_id, period_type) → upsert 저장

### workout_logs
`id` / `user_id(FK auth.users)` / `logged_date` / `routine_name` / `note` / `created_at`
> SELECT RLS 공개 (프로필 페이지 조회용) → 훅에서 .eq('user_id', user.id) 필수

### workout_log_items
`id` / `log_id(FK workout_logs)` / `user_id(FK auth.users)` / `exercise_name` / `sets` / `completed_sets` / `weight_kg` / `reps` / `sort_order`
> SELECT RLS 공개

---

## 반드시 기억해야 할 패턴

### 1. FK는 public.profiles(id) 참조
- `user_id`가 `profiles(nickname)` 조인에 쓰이는 컬럼은 반드시 `public.profiles(id)` 참조
- `auth.users` 참조 시 PostgREST 자동 조인 불가 → 400 오류
- 적용 테이블: posts, comments

### 2. follows 두 단계 쿼리
- follows 테이블은 auth.users 참조 → profiles 자동 조인 불가
- 팔로워/팔로잉 목록: follows에서 ID 조회 → profiles IN 쿼리로 별도 조회

### 3. useCallback으로 함수 참조 안정화
- 훅 내 async 함수는 의존성 없어도 `useCallback(fn, [])` 적용
- 미적용 시 useEffect 의존성 배열이 매 렌더마다 변경 → 무한 루프

### 4. 공개 SELECT 테이블에서 user_id 필터 명시
- workout_goals, workout_logs, routine_templates는 SELECT가 전체 공개
- 본인 데이터만 조회하는 훅에서 `.eq('user_id', user.id)` 반드시 명시
- useRoutines.fetchRoutines에서 user_id 필터 적용 중

### 5. 댓글 추가 후 재조회
- 댓글 insert 후 select().single() 방식이 아닌 fetchComments() 재호출
- insert 직후 profiles 조인이 안 되는 타이밍 이슈 방지

### 6. 날짜 파싱 — 로컬 시간 기준
- logged_date는 'YYYY-MM-DD' 문자열
- `new Date('YYYY-MM-DD')`는 UTC 기준 파싱 → 요일 오차 발생
- `new Date(y, m-1, d)` 로컬 파싱으로 처리

---

## 현재 미완성 / 다음에 할 일

| 우선순위 | 작업 | 설명 |
|---------|------|------|
| 높음 | 게시글 수정 | 현재 삭제만 가능 |
| 중간 | 할 일 필터 | 완료/미완료 탭 필터 (로컬 필터, 구현 쉬움) |
| 중간 | 게시판 검색 | 제목/본문 검색 (.ilike 쿼리) |
| 낮음 | 게시판 페이지네이션 | Supabase .range() 기반 |
| 낮음 | 할 일 마감일 | due_date 컬럼 추가 + D-day 표시 |

---

## 라우트 구조

| 경로 | 컴포넌트 | 인증 |
|------|----------|------|
| / | HomePage | 불필요 |
| /login | LoginPage | 불필요 |
| /signup | SignupPage | 불필요 |
| /todos | TodoPage | 필요 |
| /board | BoardPage | 불필요 |
| /board/new | PostWritePage | 필요 |
| /board/:id | PostDetailPage | 불필요 |
| /workout | WorkoutPage | 필요 |
| /profile | MyProfileRedirect | 필요 |
| /profile/:userId | ProfilePage | 불필요 |
| /feed | → /board 리다이렉트 | — |
