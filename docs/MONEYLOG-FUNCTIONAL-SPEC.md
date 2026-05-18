# 머니로그 기능 명세서

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| UI 라이브러리 | Tailwind CSS + shadcn/ui |
| 차트 | Recharts |
| BaaS | Supabase (Auth + Postgres + RLS) |
| 배포 | Vercel |

---

## DB 스키마

### user_profiles

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, FK(auth.users) ON DELETE CASCADE | Supabase Auth 사용자 ID |
| nickname | text | NOT NULL | 표시 이름 |
| initial_balance | numeric | NOT NULL DEFAULT 0 | 초기 잔액 |
| salary_amount | numeric | NOT NULL DEFAULT 0 | 월급액 |
| salary_day | int | NOT NULL DEFAULT 25, CHECK(1~31) | 월급일 |
| created_at | timestamptz | NOT NULL DEFAULT now() | 생성 시각 |

- 회원가입 시 DB 트리거로 자동 생성

### expenses

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK DEFAULT gen_random_uuid() | 거래 식별자 |
| user_id | uuid | NOT NULL, FK(auth.users) ON DELETE CASCADE | 소유자 |
| tx_type | text | NOT NULL, CHECK('income','expense') | 거래 유형 |
| category | text | NOT NULL | 카테고리 |
| amount | numeric | NOT NULL, CHECK(> 0) | 금액 (항상 양수) |
| description | text | NULL | 내용/메모 |
| tx_date | date | NOT NULL | 거래 날짜 |
| created_at | timestamptz | NOT NULL DEFAULT now() | 입력 시각 |

**category 허용 값**
- tx_type = 'expense': `식비`, `주거`, `교통`, `쇼핑`, `여가`, `기타`
- tx_type = 'income': `월급`, `부수입`, `기타수입`

### budgets

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK DEFAULT gen_random_uuid() | 예산 식별자 |
| user_id | uuid | NOT NULL, FK(auth.users) ON DELETE CASCADE | 소유자 |
| category | text | NOT NULL | 카테고리 |
| month | text | NOT NULL | 'YYYY-MM' 형식 |
| amount | numeric | NOT NULL, CHECK(>= 0) | 예산 금액 |
| created_at | timestamptz | NOT NULL DEFAULT now() | 생성 시각 |

- UNIQUE(user_id, category, month) — upsert 기반 저장

### goals

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK DEFAULT gen_random_uuid() | 목표 식별자 |
| user_id | uuid | NOT NULL, FK(auth.users) ON DELETE CASCADE | 소유자 |
| name | text | NOT NULL | 목표명 |
| target_amount | numeric | NOT NULL, CHECK(> 0) | 목표 금액 |
| current_amount | numeric | NOT NULL DEFAULT 0, CHECK(>= 0) | 현재 진행 금액 |
| due_date | date | NULL | 목표 달성 기한 |
| created_at | timestamptz | NOT NULL DEFAULT now() | 생성 시각 |

---

## RLS 정책 (전 테이블 공통)

```
SELECT  auth.uid() = user_id
INSERT  auth.uid() = user_id
UPDATE  auth.uid() = user_id
DELETE  auth.uid() = user_id
```

비로그인 사용자는 어떤 테이블도 조회 불가.

---

## 라우트 구조

| 경로 | 페이지 | 인증 |
|------|--------|------|
| `/` | 랜딩 또는 `/dashboard` 리다이렉트 | — |
| `/login` | 로그인 | 불필요 |
| `/signup` | 회원가입 (온보딩 포함) | 불필요 |
| `/dashboard` | 대시보드 | 필요 |
| `/transactions` | 거래 내역 전체 | 필요 |
| `/budget` | 예산 관리 | 필요 |
| `/goals` | 목표 관리 | 필요 |

---

## 기능 명세

---

### F-01. 회원가입 (온보딩)

**목적**: 재무 초기값을 입력받아 가입 즉시 대시보드 사용 가능 상태로 만든다.

**화면 구성**
- 단계 1: 이메일, 비밀번호
- 단계 2: 닉네임, 초기 잔액, 월급일(1–31), 월급액
- (선택) 단계 구분 없이 한 페이지로 처리 가능

**입력 필드**

| 필드 | 유형 | 검증 규칙 |
|------|------|-----------|
| 이메일 | email | 표준 이메일 형식 |
| 비밀번호 | password | 8자 이상 |
| 닉네임 | text | 1자 이상, 20자 이하 |
| 초기 잔액 | number | 0 이상 |
| 월급일 | number | 1–31 |
| 월급액 | number | 0 이상 |

**처리 순서**
1. `supabase.auth.signUp()` 호출 (metadata에 닉네임/초기잔액/월급 정보 포함)
2. DB 트리거(`handle_new_user`)가 `user_profiles` 자동 생성
3. 가입 완료 → `/dashboard` 리다이렉트

**완료 기준**
- [ ] 필수 필드 미입력 시 제출 불가
- [ ] 이메일 중복 시 오류 메시지
- [ ] 가입 후 user_profiles 레코드 정상 생성 확인
- [ ] 가입 후 `/dashboard` 자동 이동

---

### F-02. 로그인 / 로그아웃

**로그인**
- 이메일/비밀번호 → `supabase.auth.signInWithPassword()`
- 성공 → `/dashboard` 이동
- 실패 → "이메일 또는 비밀번호가 올바르지 않습니다" 표시

**로그아웃**
- 헤더 버튼 → `supabase.auth.signOut()` → `/login` 이동

**완료 기준**
- [ ] 비로그인 상태에서 `/dashboard` 접근 시 `/login` 리다이렉트
- [ ] 로그인 후 보호된 페이지 접근 가능

---

### F-03. 대시보드

**목적**: 이번 달 재무 상태를 한 화면에서 파악한다.

#### F-03-1. 헤더 / 월 네비게이터

- "안녕하세요, {nickname}님 👋" + 현재 선택 월 표시
- `<` `>` 버튼으로 이전/다음 월 이동 (선택 월이 대시보드 전체 기준 월)
- 오늘 포함 월은 "이번 달" 표시

#### F-03-2. KPI 카드 (4개)

| 카드 | 계산식 |
|------|--------|
| 현재 잔액 | `initial_balance` + 전체 기간 수입 합계 − 전체 기간 지출 합계 |
| 이번 달 수입 | 선택 월 `tx_type='income'` `amount` 합계 |
| 이번 달 지출 | 선택 월 `tx_type='expense'` `amount` 합계 |
| 저축 | 이번 달 수입 − 이번 달 지출 |

- 저축이 음수이면 빨간색 표시

#### F-03-3. 현금 흐름 차트 (Recharts LineChart 또는 BarChart)

- **기간 선택**: 1주 / 1개월 / 3개월 / 1년 탭
- X축: 날짜(일별) 또는 월(월별)
- Y축: 금액
- 수입 라인(파란색), 지출 라인(빨간색) 동시 표시
- 툴팁: 해당 날짜/월의 수입·지출 금액

#### F-03-4. 카테고리별 지출 도넛 차트 (Recharts PieChart)

- 선택 월 기준 카테고리별 `amount` 합계
- 각 카테고리 색 고정 (식비: 주황, 주거: 파랑, 교통: 초록, 쇼핑: 보라, 여가: 노랑, 기타: 회색)
- 범례 + 비중 % 툴팁

#### F-03-5. 거래 내역 위젯

- 선택 월 기준 최근 10건 표시 (날짜 내림차순)
- 검색 입력창 (description 대상)
- 카테고리 필터 드롭다운
- **거래 추가 버튼** → 다이얼로그 열림 (F-04 참고)
- 각 행 클릭 → 수정/삭제 다이얼로그
- "전체 보기" 링크 → `/transactions`

#### F-03-6. 예산 현황 위젯

- 선택 월 기준, 예산이 등록된 카테고리만 표시
- 각 카테고리: `[카테고리명] [사용액] / [예산] Progress Bar`
- 소진률 80% 이상: 주황색 / 100% 초과: 빨간색
- "예산 설정" 링크 → `/budget`

**완료 기준**
- [ ] 월 이동 시 모든 위젯 데이터 재조회
- [ ] 거래 추가/수정/삭제 후 KPI 카드 즉시 갱신
- [ ] 차트 기간 탭 전환 동작 확인

---

### F-04. 거래 추가 다이얼로그

**목적**: 뷰 전환 없이 거래를 빠르게 등록한다.

**입력 필드**

| 필드 | 유형 | 기본값 | 검증 |
|------|------|--------|------|
| 유형 | 토글 (수입/지출) | 지출 | 필수 |
| 카테고리 | Select | — | 필수 (유형에 따라 목록 변경) |
| 금액 | number | — | 필수, 양수 |
| 날짜 | date | 오늘 | 필수 |
| 내용 | text | — | 선택, 100자 이하 |

**처리**
- Supabase `insert` → 성공 시 다이얼로그 닫힘 + 위젯 데이터 갱신
- 실패 시 오류 메시지 표시 (다이얼로그 유지)

---

### F-05. 거래 수정/삭제 다이얼로그

**수정**
- 기존 값으로 폼 초기화
- 변경 후 저장 → Supabase `update`

**삭제**
- 삭제 확인 문구 표시 → 확인 → Supabase `delete`

---

### F-06. 거래 내역 페이지 (/transactions)

**목적**: 전체 거래를 필터·정렬하며 관리한다.

**기능**
- 월 필터 (드롭다운 또는 날짜 범위)
- 유형 필터: 전체 / 수입 / 지출
- 카테고리 필터 (멀티 선택)
- 검색 (description)
- 정렬: 날짜 내림차순 기본, 금액 정렬 지원
- 거래 추가 버튼 (F-04 다이얼로그)
- 각 행: 수정/삭제 아이콘

**테이블 컬럼**

| 날짜 | 유형 | 카테고리 | 내용 | 금액 | 액션 |
|------|------|----------|------|------|------|

**완료 기준**
- [ ] 필터 조합 정상 동작
- [ ] 거래 수정/삭제 후 목록 즉시 갱신

---

### F-07. 예산 관리 (/budget)

**목적**: 카테고리별 월 지출 한도를 설정하고 소진률을 파악한다.

**화면 구성**
- 상단: 월 선택 (기본 이번 달)
- 카테고리 목록 (지출 카테고리 6개):
  - 카테고리명
  - 예산 금액 입력 (인라인 편집 또는 별도 입력란)
  - 현재 사용액 (해당 월 expenses 합계)
  - 소진률 Progress Bar
  - 소진률 % 텍스트

**저장 방식**
- 입력 후 "저장" → `budgets` upsert (onConflict: user_id, category, month)
- 개별 카테고리 단위로 즉시 저장 가능

**완료 기준**
- [ ] 예산 미설정 카테고리는 사용액만 표시
- [ ] 소진률 초과 시 시각적 경고
- [ ] 대시보드 예산 위젯과 동일한 데이터 사용 확인

---

### F-08. 목표 관리 (/goals)

**목적**: 중장기 저축 목표를 추적한다.

**목표 카드 표시**
- 목표명
- 목표 금액 / 현재 진행 금액
- 달성률 Progress Bar
- 마감일 (있을 경우 D-day 표시)
- 수정 / 삭제 버튼

**목표 추가 다이얼로그**

| 필드 | 유형 | 검증 |
|------|------|------|
| 목표명 | text | 필수, 50자 이하 |
| 목표 금액 | number | 필수, 양수 |
| 현재 진행 금액 | number | 선택, 0 이상 |
| 마감일 | date | 선택 |

**목표 수정 다이얼로그**
- 현재 진행 금액 업데이트가 주 사용 패턴
- 모든 필드 수정 가능

**삭제**
- 확인 후 삭제

**완료 기준**
- [ ] 달성률 100% 이상 시 완료 뱃지 표시
- [ ] 마감일 지난 미완료 목표 강조 표시

---

### F-09. 월급 자동 반영

**목적**: 매월 `salary_day`에 해당 월 월급 거래를 자동 등록한다.

**동작 방식**
- Option A (권장 — Supabase Edge Function + Cron):
  - Cron: 매일 자정 실행
  - 오늘 날짜 = user.salary_day인 사용자 목록 조회
  - 해당 월에 이미 월급 자동 등록된 레코드가 없으면 `expenses` INSERT
  - `description = '월급 자동 입력'`, `tx_type = 'income'`, `category = '월급'`
- Option B (클라이언트):
  - 로그인 시 이번 달 월급 자동 등록 여부 체크 → 없으면 등록

**방어 규칙**
- 같은 월에 `category = '월급'` + `description LIKE '%자동%'` 레코드가 있으면 중복 삽입 금지

**완료 기준**
- [ ] 월급일에 자동 거래 등록 확인
- [ ] 이미 등록된 달은 중복 등록 없음

---

### F-10. 다크/라이트 모드

- next-themes 또는 Tailwind `dark:` 클래스 기반
- 헤더에 토글 버튼
- 시스템 설정 기본 감지

---

## 컴포넌트 구조 (주요)

```
src/
  app/
    (auth)/
      login/page.tsx
      signup/page.tsx
    (protected)/
      layout.tsx         # 인증 확인 + 공통 레이아웃
      dashboard/page.tsx
      transactions/page.tsx
      budget/page.tsx
      goals/page.tsx
  components/
    ui/                  # shadcn/ui 기본 컴포넌트
    dashboard/
      KpiCard.tsx
      CashFlowChart.tsx
      CategoryPieChart.tsx
      TransactionWidget.tsx
      BudgetWidget.tsx
    transactions/
      TransactionDialog.tsx   # 추가/수정/삭제 통합
      TransactionTable.tsx
    budget/
      BudgetRow.tsx
    goals/
      GoalCard.tsx
      GoalDialog.tsx
    layout/
      Header.tsx
      Sidebar.tsx (선택)
  lib/
    supabase/
      client.ts          # 브라우저 클라이언트
      server.ts          # 서버 컴포넌트용 클라이언트
    utils.ts             # 날짜, 숫자 포맷 유틸
  types/
    index.ts             # Expense, Budget, Goal, UserProfile 인터페이스
```

---

## 숫자/날짜 포맷 규칙

- 금액: `toLocaleString('ko-KR')` → `1,234,567`원
- 날짜: `YYYY-MM-DD` 저장, 화면 표시는 `MM월 DD일`
- 월 키: `YYYY-MM` 문자열 (budgets.month 기준)
- 소진률: 소수점 1자리 `%` (예: `83.4%`)
