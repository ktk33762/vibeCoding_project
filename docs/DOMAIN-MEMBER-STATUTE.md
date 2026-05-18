# 회원 도메인 법률

## 엔티티

### profiles

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, FK(auth.users), ON DELETE CASCADE | Supabase Auth 사용자 ID |
| nickname | text | NOT NULL, UNIQUE | 닉네임 (중복 불가) |
| bio | text | NULL | 소개글 |
| status | text | NOT NULL, DEFAULT 'ACTIVE', CHECK | 회원 상태 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 생성 시각 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 수정 시각 (트리거 자동 갱신) |

**status 허용 값:** `ACTIVE`, `INACTIVE`, `WITHDRAWN`

### RLS 정책

| 정책명 | 대상 | 조건 |
|--------|------|------|
| Profiles are viewable by everyone | SELECT | 누구나 허용 |
| Users can insert their own profile | INSERT | auth.uid() = id |
| Users can update own profile | UPDATE | auth.uid() = id |

### 트리거

| 트리거명 | 이벤트 | 함수 | 설명 |
|---------|--------|------|------|
| on_auth_user_created | INSERT on auth.users | handle_new_user() | 회원가입 시 profiles 자동 생성 |
| on_profiles_updated | UPDATE on profiles | handle_updated_at() | updated_at 자동 갱신 |

### handle_new_user() 동작

- `raw_user_meta_data.nickname` 값이 있으면 그것을 닉네임으로 사용
- 없으면 이메일 앞부분(`@` 앞)을 기본 닉네임으로 사용

## 규칙

- 닉네임은 중복을 허용하지 않는다.
- 비밀번호는 최소 8자 이상이어야 한다 (Supabase Auth 설정).
- 회원 상태: `ACTIVE`, `INACTIVE`, `WITHDRAWN`
