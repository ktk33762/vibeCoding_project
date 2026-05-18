# FitLog

운동 루틴 관리부터 커뮤니티 소통까지, 피트니스 라이프를 한 곳에서 기록하고 공유하는 플랫폼입니다.

---

# 프로젝트 개요

## 프로젝트 목적

운동을 꾸준히 이어가고 싶지만 기록이 분산되거나 동기 부여가 어려운 사람들을 위해, **운동 기록·루틴 관리·커뮤니티**를 통합한 웹 앱을 만드는 것을 목표로 합니다.

## 주요 기능 설명

- **운동 세션 관리**: 루틴 템플릿 기반 오늘의 운동 진행, 세트 완료 체크, 휴식 타이머
- **운동 기록 & 통계**: 주간·월간 목표 설정, 운동 기록 저장, 차트 기반 통계 분석
- **루틴 공유**: 다른 사람의 프로필에서 루틴을 확인하고 내 루틴으로 가져오기
- **커뮤니티 게시판**: 운동 팁, 후기, 정보를 게시글·댓글·좋아요로 공유
- **소셜 기능**: 팔로우·팔로잉으로 관심 있는 사람의 활동 피드 구독

## 어떤 문제를 해결하는지

| 문제 | FitLog의 해결 방식 |
|------|-----------------|
| 운동 기록이 노트·앱에 분산됨 | 루틴 템플릿 → 세션 → 기록으로 이어지는 통합 흐름 |
| 혼자 운동하면 동기 부여가 떨어짐 | 팔로우 피드, 게시판, 루틴 공유로 커뮤니티 형성 |
| 내 운동 패턴을 파악하기 어려움 | 주간·부위별·요일별·볼륨 통계 차트 자동 집계 |
| 좋은 루틴을 찾기 어려움 | 다른 사람 프로필에서 루틴 확인 후 1클릭 가져오기 |

## 프로젝트 진행 배경

AI 에이전트(Claude Code)를 활용한 실전 개발 역량을 검증하기 위해 시작한 프로젝트입니다. 문서 기반 작업 방식(`CONTEXT.md`, `ARCHITECTURE.md`, `DOMAIN-*.md`)을 통해 에이전트와 협업하며 기획-설계-구현-리팩터링의 전 과정을 진행했습니다.

---

# 기술 스택

## Frontend

- **React 19** + **TypeScript**
- **Vite** (빌드 도구)
- **React Router DOM v7** (클라이언트 사이드 라우팅)
- **Recharts** (운동 통계 차트)
- 도메인별 CSS (외부 UI 라이브러리 미사용)

## Backend

- **Supabase** — PostgreSQL, Auth, Storage, Row Level Security

## AI Agent

- **Claude Code** — 전체 개발 사이클에 걸쳐 활용

---

# 주요 기능

- **오늘의 운동 세션**: 루틴 불러오기 → 종목별 세트 완료 체크 → 기록 저장 → 세트 간 휴식 타이머
- **루틴 템플릿 관리**: 루틴 생성·편집·삭제, 타인 루틴 가져오기
- **운동 목표 & 통계**: 주간·월간 목표, 4종 통계 차트(주간 횟수 / 부위별 비율 / 월간 볼륨 / 요일 분석)
- **커뮤니티 게시판**: 글·댓글·좋아요, 이미지 첨부, 전체·팔로잉 탭 전환
- **소셜 프로필**: 팔로우·언팔로우, 운동 현황 공개, 루틴 공유

---

# 프로젝트 구조

```text
subProject/
├── frontend/
│   └── src/
│       ├── pages/          # 라우트 컴포넌트 (WorkoutPage, BoardPage 등)
│       ├── components/     # 공용 컴포넌트 (Header, WorkoutTimer 등)
│       ├── hooks/          # 데이터 훅 (useWorkoutLogs, useRoutines 등)
│       ├── types/          # TypeScript 타입 정의
│       ├── styles/         # 도메인별 CSS
│       └── lib/
│           └── supabase.ts # Supabase 클라이언트
├── backend/
│   └── supabase/
│       └── migrations/     # SQL 마이그레이션 파일
├── docs/                   # 아키텍처·도메인·작업 문서
└── README.md
```

---

# 실행 방법

## 1. 프로젝트 설치

```bash
cd frontend
npm install
```

## 2. 환경변수 설정

`frontend/.env.local`

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 실행

```bash
npm run dev
```

### 테스트 계정

| 이메일 | 비밀번호 | 특징 |
|--------|---------|------|
| kim.fitness@test.com | Test1234! | 헬스 — 가슴·등·하체·어깨 루틴 |
| park.running@test.com | Test1234! | 러닝 — 하체·코어·인터벌 루틴 |
| lee.nutrition@test.com | Test1234! | 영양 — 전신·서킷 루틴 |
| choi.yoga@test.com | Test1234! | 요가 — 코어·스트레칭 루틴 |

---

# Supabase 설정

## Authentication

이메일 + 비밀번호 방식 사용. 회원가입 시 DB 트리거(`handle_new_user`)로 `profiles` 테이블에 레코드 자동 생성.

## 주요 테이블

| 테이블 | 설명 |
|--------|------|
| `profiles` | 사용자 닉네임, 소개글 |
| `follows` | 팔로워·팔로잉 관계 |
| `posts` / `comments` / `post_likes` | 게시판 |
| `todos` / `todo_items` | 할 일 + 체크리스트 |
| `routine_templates` / `routine_template_items` | 루틴 템플릿 |
| `workout_goals` | 주간·월간 목표 |
| `workout_logs` / `workout_log_items` | 운동 기록 상세 |

## 주요 RLS 정책

- `posts`, `comments`: 비로그인 SELECT 허용 / 쓰기는 본인만
- `workout_goals`, `workout_logs`, `workout_log_items`: SELECT 전체 공개 (프로필 조회용) / 쓰기는 본인만
- `routine_templates`, `routine_template_items`: 인증 사용자 SELECT 허용 (루틴 가져오기용) / 쓰기는 본인만
- 나머지 테이블: 본인 데이터만 전체 접근

## Storage

`post-images` 버킷 — 게시글 이미지 첨부 (최대 5MB)

---

# AI 에이전트 활용 방식

## 사용한 도구

**Claude Code (CLI)** — Anthropic의 공식 코딩 에이전트. 터미널에서 직접 실행하여 파일 읽기·쓰기·편집·명령 실행을 수행.

## 어떤 작업에 활용했는지

| 작업 유형 | 구체적 예시 |
|----------|-----------|
| 컴포넌트 생성 | WorkoutPage, ProfilePage, 각종 훅 전체 작성 |
| DB 설계 & 마이그레이션 | 테이블 설계 → SQL 작성 → `supabase db push` 실행 |
| 버그 수정 | PostgREST FK 오류, 무한 루프, 날짜 파싱 오류 분석 및 수정 |
| 리팩터링 | 인라인 코드를 재사용 가능한 컴포넌트/훅으로 추출 |
| 시드 데이터 작성 | `seed.mjs`, `seed-routines.mjs` 작성 및 실행 |
| 문서 정리 | CONTEXT.md, README.md, AI-ACTION-LOGS.md 작성·최신화 |

## 문서 기반 작업 방식

에이전트가 추측 없이 작업할 수 있도록 다음 문서 체계를 유지했습니다.

```
docs/
├── CONTEXT.md            # 현재 작업에 필요한 최소 컨텍스트 캐시
├── ARCHITECTURE-*.md     # 아키텍처 원칙 및 구현 규칙
├── DOMAIN-*-*.md         # 도메인별 원칙 및 규칙
├── TODO-*.md             # 작업 상태 (READY / DOING / BACKLOG / DONE)
└── AI-ACTION-LOGS.md     # 에이전트 작업 로그
```

에이전트는 항상 관련 문서를 먼저 읽고, 작업 후 변경 사항을 문서에 반영했습니다.

## 프롬프트 전략

- 기능 단위로 명확하게 요청 ("오늘의 운동 세션에서 삭제 기능 추가해줘")
- 범위 초과 구현 방지 — `CLAUDE.md`에 "요청된 작업 범위를 벗어난 기능을 임의로 추가하지 마라" 명시
- 문서가 없으면 구현 금지 — 새 도메인은 `DOMAIN-*.md` 먼저 생성 후 구현

## 코드 검증 방식

- TypeScript 타입 검사: 모든 구현 후 `npx tsc --noEmit` 실행
- 브라우저 직접 확인: 개발 서버 실행 후 기능 동작 검증
- 마이그레이션 검증: `supabase db push` 성공 여부 확인

---

# 트러블 슈팅

## 1. PostgREST 자동 조인 400 오류

### 문제 상황

게시글 목록을 불러올 때 작성자 닉네임이 표시되지 않고 400 오류 발생.

### 원인

`posts.user_id`가 `auth.users(id)`를 참조하고 있었는데, PostgREST는 `auth` 스키마를 직접 조인할 수 없습니다. `profiles(nickname)` 자동 조인을 하려면 FK가 반드시 `public.profiles(id)`를 참조해야 합니다.

### 해결 방법

마이그레이션으로 FK를 `public.profiles(id)` 참조로 변경. `comments.user_id`에도 동일 패턴 적용.

```sql
alter table public.posts
  drop constraint posts_user_id_fkey,
  add constraint posts_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;
```

---

## 2. 팔로잉 피드 무한 로딩

### 문제 상황

`/board` 팔로잉 탭에서 게시글이 무한 로딩되며 멈추지 않음.

### 원인

`useFollows` 훅 내 `getFollowingIds` 함수가 `useCallback` 없이 선언되어 렌더마다 새 참조가 생성됨. 이 함수를 `useEffect` 의존성 배열에 넣으면 렌더 → 함수 변경 → useEffect 재실행 → 렌더의 무한 루프가 발생.

### 해결 방법

의존성이 없는 async 함수도 `useCallback(fn, [])`으로 감싸는 패턴을 전체 훅에 적용.

```ts
const getFollowingIds = useCallback(async () => {
  // ...
}, [])
```

---

## 3. 요일 분석 차트 요일 오차

### 문제 상황

운동 통계의 요일 분석에서 실제 기록한 요일과 다른 요일에 카운트가 표시됨.

### 원인

`workout_logs.logged_date`는 `YYYY-MM-DD` 문자열인데, `new Date('2026-05-18')`은 UTC 기준으로 파싱합니다. 한국(UTC+9)에서는 자정 이전 시간대에 UTC 기준 전날로 해석되어 요일이 하루 밀리는 오차 발생.

### 해결 방법

로컬 기준으로 파싱하도록 변경.

```ts
// 오류 발생
const day = new Date('2026-05-18').getDay()

// 수정 후
const [y, m, d] = '2026-05-18'.split('-').map(Number)
const day = new Date(y, m - 1, d).getDay()
```

---

## 4. 루틴 공개 후 내 운동 페이지에 타인 루틴 혼입

### 문제 상황

루틴 가져오기 기능을 위해 `routine_templates` SELECT RLS를 인증 사용자 전체 허용으로 변경한 후, 내 운동 페이지에 다른 사람의 루틴이 함께 표시됨.

### 원인

`useRoutines.fetchRoutines`에 `user_id` 필터가 없어서 RLS가 허용하는 모든 루틴을 가져옴.

### 해결 방법

`fetchRoutines`에 `.eq('user_id', user.id)` 필터 추가. RLS가 공개된 테이블은 앱 레벨에서 본인 데이터 필터를 명시하는 패턴으로 통일.

---

# 회고

## 어려웠던 점

- **PostgREST 조인 제약**: `auth.users`와 `public.profiles` 간의 참조 구조 차이를 이해하는 데 시간이 걸렸습니다. Supabase 공식 문서보다 실제 오류를 통해 파악하게 된 내용이 많았습니다.
- **RLS 공개 범위 설계**: 기능 요구사항(타인 프로필 조회, 루틴 가져오기)과 데이터 보안(본인 데이터 보호) 사이의 균형을 잡는 것이 까다로웠습니다.

## 개선하고 싶은 점

- 게시글 수정 기능 미구현 (현재 삭제만 가능)
- 게시판 검색 및 페이지네이션 없음
- 모바일 반응형 CSS 부족
- 운동 기록 캘린더 뷰 (월간 달력에 운동 여부 표시)

## 새롭게 배운 점

- **Supabase RLS 설계 패턴**: 공개 SELECT + 앱 레벨 user_id 필터 조합으로 프로필 조회와 데이터 보안을 동시에 충족
- **PostgREST 자동 조인**: FK가 `public` 스키마를 참조해야만 자동 조인이 가능하다는 제약
- **React 훅 안정화**: `useCallback` 없는 함수가 의존성 배열에 들어가면 무한 루프가 발생한다는 것을 실전에서 경험
- **Recharts 활용**: ResponsiveContainer + 커스텀 Cell로 데이터 기반 색상 강조 패턴

## AI 에이전트를 사용하며 느낀 점

- **문서가 곧 품질**: `CONTEXT.md`와 도메인 문서가 잘 관리될수록 에이전트의 작업 품질이 높아졌습니다. 문서 없이 구현을 요청하면 추측 기반 코드가 나왔고, 이후 수정 비용이 컸습니다.
- **범위 지정의 중요성**: "운동 삭제 기능 추가"처럼 범위가 명확한 요청일수록 의도에 맞는 결과가 나왔습니다.
- **에이전트는 구현 파트너**: 설계 방향과 도메인 지식은 사람이 제공하고, 에이전트는 빠른 구현과 일관성 유지를 담당하는 역할 분담이 효과적이었습니다.

---

# 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Row Level Security 가이드](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgREST 공식 문서](https://postgrest.org/en/stable/)
- [React 공식 문서](https://react.dev)
- [Recharts 공식 문서](https://recharts.org/en-US)
- [React Router DOM v7](https://reactrouter.com/home)
- [Vite 공식 문서](https://vitejs.dev)
- [Claude Code 공식 문서](https://docs.anthropic.com/en/docs/claude-code)
