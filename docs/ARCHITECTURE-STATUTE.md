# 아키텍처 구현 규칙

## 폴더 구조

```
frontend/src/
  components/   # 재사용 컴포넌트
  hooks/        # 도메인별 커스텀 훅 (useXxx.ts)
  pages/        # 라우트 단위 페이지 컴포넌트
  styles/       # 도메인별 CSS
  types/        # TypeScript 인터페이스
  lib/          # supabase 클라이언트 초기화
backend/supabase/migrations/  # 마이그레이션 SQL 파일
```

## 라우트 구조

| 경로 | 컴포넌트 | 인증 |
|------|----------|------|
| `/` | HomePage | 불필요 |
| `/login` | LoginPage | 불필요 |
| `/signup` | SignupPage | 불필요 |
| `/todos` | TodoPage | 필요 |
| `/board` | BoardPage | 불필요 |
| `/board/new` | PostWritePage | 필요 |
| `/board/:id` | PostDetailPage | 불필요 |
| `/workout` | WorkoutPage | 필요 |
| `/profile` | MyProfileRedirect | 필요 |
| `/profile/:userId` | ProfilePage | 불필요 |
| `/feed` | → `/board` 리다이렉트 | — |

## 훅 규칙

- 훅 이름: `useXxx` (도메인명 기준)
- 훅은 상태(useState) + 패치 함수 + 뮤테이션 함수를 묶어서 반환
- `useCallback`으로 함수 참조를 안정화해 무한 루프를 방지한다

## 마이그레이션 규칙

- 파일명: `YYYYMMDDHHMMSS_description.sql`
- `supabase db push`로 원격 적용
- 적용된 마이그레이션은 절대 수정하지 않고 새 파일로 보정한다

## FK 규칙

- `user_id`가 profiles와의 조인에 사용될 경우 `auth.users` 대신 `public.profiles(id)`를 참조해야 PostgREST 자동 조인이 동작한다
- 예: `posts.user_id`, `comments.user_id` → `references public.profiles(id)`
