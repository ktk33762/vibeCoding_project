# 할 일 도메인 법률

## 엔티티

### todos

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 할 일 고유 ID |
| user_id | uuid | NOT NULL, FK(auth.users), ON DELETE CASCADE | 소유자 |
| title | text | NOT NULL | 할 일 제목 |
| memo | text | NULL 허용 | 부가 메모 |
| is_completed | boolean | NOT NULL, DEFAULT false | 완료 여부 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 생성 시각 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 수정 시각 (트리거 자동 갱신) |

### todo_items

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 항목 고유 ID |
| todo_id | uuid | NOT NULL, FK(todos), ON DELETE CASCADE | 소속 할 일 |
| content | text | NOT NULL | 항목 내용 |
| is_checked | boolean | NOT NULL, DEFAULT false | 체크 여부 |
| sort_order | integer | NOT NULL, DEFAULT 0 | 정렬 순서 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 생성 시각 |

### RLS 정책

#### todos

| 정책명 | 대상 | 조건 |
|--------|------|------|
| Users can view own todos | SELECT | auth.uid() = user_id |
| Users can insert own todos | INSERT | auth.uid() = user_id |
| Users can update own todos | UPDATE | auth.uid() = user_id |
| Users can delete own todos | DELETE | auth.uid() = user_id |

#### todo_items

| 정책명 | 대상 | 조건 |
|--------|------|------|
| Users can view own todo items | SELECT | 소속 todos.user_id = auth.uid() |
| Users can insert own todo items | INSERT | 소속 todos.user_id = auth.uid() |
| Users can update own todo items | UPDATE | 소속 todos.user_id = auth.uid() |
| Users can delete own todo items | DELETE | 소속 todos.user_id = auth.uid() |

### 트리거

| 트리거명 | 이벤트 | 함수 | 설명 |
|---------|--------|------|------|
| on_todos_updated | UPDATE on todos | handle_updated_at() | updated_at 자동 갱신 |

## 규칙

- title은 빈 문자열을 허용하지 않는다.
- todo_items는 항상 sort_order 오름차순으로 정렬하여 조회한다.
- 할 일 완료(is_completed=true) 시 체크리스트 항목은 자동 변경하지 않는다.
