# 아키텍처 핵심 원칙

## 기술 스택

- **Frontend**: Vite + React + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **스타일**: 도메인별 CSS 파일 분리 (`src/styles/`)

## 프로젝트 구조

- `backend/` — Supabase CLI 설정 + 마이그레이션 파일 관리
- `frontend/` — Vite + React 앱
- 별도 서버 없음. 모든 비즈니스 로직은 클라이언트 + DB RLS로 처리

## 불변 원칙

1. **BaaS 우선** — 별도 서버 없이 Supabase REST API / Auth / Storage를 직접 사용한다
2. **훅 기반 데이터 레이어** — 페이지는 커스텀 훅을 통해 데이터에 접근한다. 단순 1회성 fetch는 페이지 내 직접 허용
3. **RLS가 인증 경계** — 모든 테이블은 RLS를 활성화하고, 접근 제어는 DB 레벨에서 보장한다
4. **단방향 데이터 흐름** — 상태는 훅이 소유하고, 페이지/컴포넌트는 props와 콜백으로 상호작용한다
5. **도메인별 파일 분리** — hooks, types, styles는 도메인별로 파일을 분리한다
6. **마이그레이션 기반 스키마 관리** — DB 스키마 변경은 반드시 `backend/supabase/migrations/` 파일로 관리한다
