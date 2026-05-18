# 공통 도메인 법률

## 공통 DB 규칙

- 모든 PK: `gen_random_uuid()` 자동 생성 UUID
- 모든 테이블: `created_at timestamptz NOT NULL DEFAULT now()` 포함
- 모든 테이블: RLS 활성화 필수

## 공통 RLS 패턴

| 데이터 유형 | SELECT | INSERT/UPDATE/DELETE |
|-------------|--------|----------------------|
| 공개 콘텐츠 (posts, profiles, follows) | 누구나 | 본인만 (auth.uid() = user_id) |
| 개인 데이터 (todos, workout_goals, workout_logs) | 본인만 또는 공개 (도메인 결정) | 본인만 |

## 공통 트리거 함수

### handle_updated_at()

- `updated_at` 컬럼이 있는 테이블에 UPDATE 트리거로 등록
- `NEW.updated_at := now()` 처리

### handle_new_user()

- `auth.users` INSERT 시 `public.profiles` 자동 생성
- `raw_user_meta_data.nickname` → 없으면 이메일 @ 앞부분 사용

## FK 규칙

- `user_id`가 `profiles(nickname)` 조인에 사용되는 경우 반드시 `public.profiles(id)` 참조
- `auth.users(id)` 참조 시 PostgREST 자동 조인 불가
- `follows` 테이블처럼 auth.users를 직접 참조하는 경우 → 두 번 쿼리 패턴 사용 (ID 목록 조회 → profiles IN 쿼리)

## 공통 훅 패턴

- 훅 이름: `useXxx` (도메인명 기준)
- `useCallback`으로 함수 참조 안정화 → 무한 루프 방지
- 의존성 배열이 비어 있어도 `useCallback` 적용 (참조 동일성 보장 목적)

## 마이그레이션 규칙

- 파일명: `YYYYMMDDHHMMSS_description.sql`
- `npx supabase db push`로 원격 적용
- 적용된 마이그레이션 수정 금지 → 새 파일로 보정
