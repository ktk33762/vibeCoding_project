# 운동 도메인 법률

## DB 테이블 정의

### routine_templates

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | 자동 생성 |
| user_id | uuid FK auth.users | 소유자 |
| name | text NOT NULL | 루틴 이름 (예: 가슴 루틴) |
| created_at | timestamptz | 생성 시각 |

### routine_template_items

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | 자동 생성 |
| template_id | uuid FK routine_templates | 소속 루틴 |
| content | text NOT NULL | 운동 내용 (예: 벤치프레스 3세트) |
| sort_order | int | 순서 |

### workout_goals

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | 자동 생성 |
| user_id | uuid FK auth.users | 소유자 |
| period_type | text | 'weekly' 또는 'monthly' |
| target_count | int | 목표 횟수 |
| created_at | timestamptz | 생성/수정 시각 |

- UNIQUE(user_id, period_type): 기간 유형별 하나만 허용

### workout_logs

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | 자동 생성 |
| user_id | uuid FK auth.users | 소유자 |
| logged_date | date | 운동 완료 날짜 |
| routine_name | text NULL | 수행한 루틴 이름 (선택) |
| note | text NULL | 메모 (선택) |
| created_at | timestamptz | 기록 시각 |

### workout_log_items

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | 자동 생성 |
| log_id | uuid FK workout_logs ON DELETE CASCADE | 소속 운동 기록 |
| user_id | uuid FK auth.users | 소유자 |
| exercise_name | text NOT NULL | 운동 종목명 |
| sets | int NULL | 목표 세트 수 |
| completed_sets | int NULL | 완료 세트 수 |
| weight_kg | numeric NULL | 무게 (kg) |
| reps | int NULL | 반복 횟수 |
| sort_order | int | 운동 순서 |
| created_at | timestamptz | 기록 시각 |

## RLS 정책

### workout_goals / workout_logs / workout_log_items

| 대상 | SELECT | INSERT / UPDATE / DELETE |
|------|--------|--------------------------|
| 조건 | 누구나 허용 (프로필 페이지에서 타인 현황 조회용) | auth.uid() = user_id |

> **주의**: SELECT가 공개이므로 본인 데이터만 조회하는 훅에서는 반드시 `.eq('user_id', user.id)` 명시

### routine_templates / routine_template_items

| 대상 | 조건 |
|------|------|
| 모든 작업 | auth.uid() = user_id (본인만) |

## API 규칙

- 루틴 불러오기: `routine_templates` → `todos` + `todo_items` 순으로 INSERT
- 목표 저장: `upsert`로 처리 (onConflict: user_id, period_type)
- 운동 기록 조회: 현재 월 기준으로 필터링, `.eq('user_id', user.id)` 필수
- 운동 기록 상세: log_id 기준으로 `workout_log_items` 별도 조회 (지연 로딩)

## 프론트엔드 규칙

### 페이지

- `/workout` (WorkoutPage): 목표 설정, 루틴 관리, 운동 기록

### 훅

- `useWorkoutGoals`: 목표 조회/저장
- `useWorkoutLogs`: 기록 목록, 기록 추가(`logWorkout`), 삭제
  - `logWorkout(routineName?, items?, note?)`: 로그 생성 후 log_items 일괄 삽입
  - 반환: `logs`, `thisWeekLogs`, `thisMonthLogs`

### UI 규칙

- 목표 카드: 기간별 목표 + 달성 진행 바 + 날짜별 로그 목록
- 로그 항목: 날짜 + 루틴명 표시, "상세 ▼" 토글로 workout_log_items 지연 로딩
- 타이머 프리셋: 60초, 90초, 120초 (로컬 상태만 사용)
- "오늘 운동 기록" 별도 섹션 없음 — 목표 카드 내 로그 목록으로 통합
