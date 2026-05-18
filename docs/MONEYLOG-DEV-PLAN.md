# 머니로그 개발 계획서

## 개발 전제

- 기능 명세: `MONEYLOG-FUNCTIONAL-SPEC.md` 참고
- 각 Phase는 독립 동작 가능한 상태로 완료
- Phase 완료 기준: lint + build 통과 + 해당 Phase 기능 육안 확인

---

## Phase 0. 프로젝트 초기화

**목표**: 개발 가능한 환경 구성

### 작업 목록

| # | 작업 | 세부 내용 |
|---|------|----------|
| 0-1 | Next.js 프로젝트 생성 | `npx create-next-app@latest moneylog --typescript --tailwind --app` |
| 0-2 | shadcn/ui 설치 | `npx shadcn-ui@latest init` — Button, Card, Dialog, Input, Select, Progress, Badge 컴포넌트 추가 |
| 0-3 | Recharts 설치 | `npm install recharts` |
| 0-4 | Supabase 클라이언트 설정 | `npm install @supabase/supabase-js @supabase/ssr` / `lib/supabase/client.ts`, `lib/supabase/server.ts` 작성 |
| 0-5 | 환경 변수 설정 | `.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| 0-6 | 공통 타입 정의 | `types/index.ts` — Expense, Budget, Goal, UserProfile 인터페이스 |
| 0-7 | 유틸 함수 작성 | `lib/utils.ts` — 금액 포맷, 날짜 포맷, 월 범위 계산 |

**완료 기준**
- [ ] `npm run dev` 정상 실행
- [ ] Supabase 연결 확인 (anon key ping)

---

## Phase 1. DB 스키마 및 RLS

**목표**: 전체 테이블 생성 및 권한 설정

### 마이그레이션 파일 목록

| 파일명 | 내용 |
|--------|------|
| `001_user_profiles.sql` | user_profiles 테이블 + handle_new_user 트리거 |
| `002_expenses.sql` | expenses 테이블 + RLS |
| `003_budgets.sql` | budgets 테이블 + RLS + UNIQUE 제약 |
| `004_goals.sql` | goals 테이블 + RLS |

### RLS 패턴 (전 테이블 동일)

```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own" ON {table} FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON {table} FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON {table} FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own" ON {table} FOR DELETE USING (auth.uid() = user_id);
```

### handle_new_user 트리거

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nickname, initial_balance, salary_amount, salary_day)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'initial_balance')::numeric, 0),
    COALESCE((NEW.raw_user_meta_data->>'salary_amount')::numeric, 0),
    COALESCE((NEW.raw_user_meta_data->>'salary_day')::int, 25)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**완료 기준**
- [ ] Supabase 대시보드에서 4개 테이블 확인
- [ ] RLS 활성화 확인
- [ ] 트리거 등록 확인

---

## Phase 2. 인증

**목표**: 회원가입(온보딩 포함) + 로그인 + 라우트 보호

### 작업 목록

| # | 작업 | 세부 내용 |
|---|------|----------|
| 2-1 | 미들웨어 작성 | `middleware.ts` — 비로그인 시 보호 라우트 → `/login` 리다이렉트 |
| 2-2 | 로그인 페이지 | `/login` — 이메일/비밀번호 폼, 오류 메시지 |
| 2-3 | 회원가입 페이지 | `/signup` — 이메일/비밀번호 + 닉네임/초기잔액/월급일/월급액 |
| 2-4 | 서버 액션 작성 | `signUp`, `signIn`, `signOut` 서버 액션 |
| 2-5 | 보호 레이아웃 | `(protected)/layout.tsx` — 세션 확인 후 공통 헤더 렌더 |
| 2-6 | 헤더 컴포넌트 | `components/layout/Header.tsx` — 닉네임 표시 + 로그아웃 버튼 + 다크모드 토글 |

**완료 기준**
- [ ] 회원가입 → user_profiles 생성 확인
- [ ] 비로그인 `/dashboard` 접근 → `/login` 리다이렉트
- [ ] 로그인 후 보호 페이지 정상 접근
- [ ] 로그아웃 후 `/login` 이동

---

## Phase 3. 거래 CRUD

**목표**: 거래 추가/수정/삭제의 핵심 데이터 레이어 완성

### 작업 목록

| # | 작업 | 세부 내용 |
|---|------|----------|
| 3-1 | 거래 서버 액션 | `addExpense`, `updateExpense`, `deleteExpense` |
| 3-2 | TransactionDialog | 추가/수정 폼 통합 다이얼로그 — 유형 토글, 카테고리 Select, 금액, 날짜, 내용 |
| 3-3 | 삭제 확인 | 삭제 전 확인 다이얼로그 (AlertDialog) |
| 3-4 | 거래 내역 페이지 | `/transactions` — 전체 목록 + 월/유형/카테고리 필터 + 검색 |
| 3-5 | TransactionTable | 필터/정렬/행별 수정·삭제 UI |

**완료 기준**
- [ ] 거래 추가 → DB 반영 확인
- [ ] 거래 수정 → 변경 내용 DB 반영 확인
- [ ] 거래 삭제 → DB 삭제 확인
- [ ] 필터 조합 동작 확인

---

## Phase 4. 대시보드

**목표**: KPI 카드 + 차트 + 거래 위젯 + 예산 위젯 통합

### 작업 목록

| # | 작업 | 세부 내용 |
|---|------|----------|
| 4-1 | 대시보드 레이아웃 | `/dashboard/page.tsx` — 월 네비게이터 + 그리드 레이아웃 |
| 4-2 | KPI 카드 | `KpiCard.tsx` — 4개 카드 (잔액, 수입, 지출, 저축) |
| 4-3 | 현금 흐름 차트 | `CashFlowChart.tsx` — Recharts LineChart, 기간 탭 4개 |
| 4-4 | 카테고리 도넛 차트 | `CategoryPieChart.tsx` — Recharts PieChart + 범례 |
| 4-5 | 거래 내역 위젯 | `TransactionWidget.tsx` — 최근 10건 + 검색 + 필터 + 거래 추가 버튼 |
| 4-6 | 예산 현황 위젯 | `BudgetWidget.tsx` — 카테고리별 Progress Bar + 소진률 |
| 4-7 | 데이터 쿼리 최적화 | 대시보드 초기 로드 쿼리를 서버 컴포넌트에서 병렬 실행 |

**완료 기준**
- [ ] 월 이동 시 전체 위젯 재조회 확인
- [ ] 거래 추가 후 KPI 카드 즉시 갱신
- [ ] 차트 기간 탭 전환 확인
- [ ] 빈 데이터 상태(거래 없음) 화면 정상 표시

---

## Phase 5. 예산 관리

**목표**: 카테고리별 월 예산 설정 및 소진률 시각화

### 작업 목록

| # | 작업 | 세부 내용 |
|---|------|----------|
| 5-1 | 예산 서버 액션 | `upsertBudget` (onConflict: user_id, category, month) |
| 5-2 | BudgetRow 컴포넌트 | 카테고리 + 예산 입력 + 사용액 + Progress Bar |
| 5-3 | 예산 페이지 | `/budget/page.tsx` — 월 선택 + 카테고리 목록 |

**완료 기준**
- [ ] 예산 저장 → DB upsert 확인
- [ ] 동일 월/카테고리 재저장 시 중복 레코드 없음
- [ ] 소진률 100% 초과 시 빨간색 표시

---

## Phase 6. 목표 관리

**목표**: 저축 목표 CRUD 및 달성률 추적

### 작업 목록

| # | 작업 | 세부 내용 |
|---|------|----------|
| 6-1 | 목표 서버 액션 | `addGoal`, `updateGoal`, `deleteGoal` |
| 6-2 | GoalCard 컴포넌트 | 목표명 + 금액 + Progress Bar + D-day + 수정·삭제 버튼 |
| 6-3 | GoalDialog 컴포넌트 | 추가/수정 통합 폼 |
| 6-4 | 목표 페이지 | `/goals/page.tsx` — 카드 그리드 + 추가 버튼 |

**완료 기준**
- [ ] 목표 추가/수정/삭제 DB 반영 확인
- [ ] 달성률 100% 이상 시 완료 뱃지 표시
- [ ] 마감일 초과 미완료 목표 강조 표시

---

## Phase 7. 월급 자동 반영

**목표**: 매월 지정일에 월급 거래 자동 등록

### 작업 목록

| # | 작업 | 세부 내용 |
|---|------|----------|
| 7-1 | 자동 등록 로직 | 로그인 시 이번 달 월급 자동 등록 여부 체크 → 없으면 INSERT |
| 7-2 | 중복 방지 | `category='월급'` + 이번 달 범위로 기존 레코드 확인 후 없을 때만 삽입 |
| 7-3 | (선택) Edge Function | Supabase Cron + Edge Function으로 서버 측 자동화 |

**완료 기준**
- [ ] 월급일 이후 첫 로그인 시 월급 거래 자동 등록 확인
- [ ] 이미 등록된 달 재로그인 시 중복 등록 없음

---

## Phase 8. 마무리 및 배포

**목표**: 품질 완성 및 Vercel 배포

### 작업 목록

| # | 작업 | 세부 내용 |
|---|------|----------|
| 8-1 | 다크/라이트 모드 | next-themes 적용, 헤더 토글, Tailwind `dark:` 클래스 일괄 점검 |
| 8-2 | 빈 상태 UI | 거래/예산/목표 없을 때 안내 문구 표시 |
| 8-3 | 반응형 점검 | 모바일/태블릿 레이아웃 확인 |
| 8-4 | 에러 처리 통일 | 서버 액션 실패 시 toast 또는 인라인 메시지 |
| 8-5 | lint + build 통과 | `npm run lint`, `npm run build` 에러 0 |
| 8-6 | Vercel 배포 | 프로젝트 연결 + 환경 변수 설정 |
| 8-7 | 배포 후 E2E 확인 | 회원가입 → 거래 추가 → 대시보드 확인 전체 흐름 |

---

## 전체 Phase 요약

| Phase | 내용 | 산출물 |
|-------|------|--------|
| 0 | 프로젝트 초기화 | Next.js 앱, Supabase 클라이언트, 공통 타입 |
| 1 | DB 스키마 & RLS | 4개 테이블 + 트리거 + RLS |
| 2 | 인증 | 회원가입/로그인/미들웨어/헤더 |
| 3 | 거래 CRUD | 거래 추가/수정/삭제/목록 |
| 4 | 대시보드 | KPI + 차트 + 거래 위젯 + 예산 위젯 |
| 5 | 예산 관리 | 카테고리별 예산 설정/소진률 |
| 6 | 목표 관리 | 저축 목표 CRUD/달성률 |
| 7 | 월급 자동 반영 | 로그인 시 자동 거래 등록 |
| 8 | 마무리/배포 | 다크모드, 빈 상태 UI, Vercel 배포 |

---

## 개발 우선순위 판단 기준

- Phase 3(거래)이 Phase 4(대시보드)보다 먼저 — 데이터 없이 차트 개발 불가
- Phase 5(예산) → Phase 4의 예산 위젯 구현 전 완료 불필요 (위젯은 빈 상태 허용)
- Phase 7(월급 자동 반영)은 Phase 3 완료 후 언제든 병행 가능
- Phase 8(배포)은 Phase 6까지 완료 후 진행
