# 주요 사건 요약

사람이 빠르게 읽기 위한 요약본입니다.

## 요약

- **2026-05-12**: 프로젝트 문서 구조 초기화 완료 (`CLAUDE.md` 기반)
- **2026-05-12**: 기술 스택 확정 — Vite+React+TypeScript + Supabase BaaS
- **2026-05-12**: Supabase 원격 프로젝트 연결 완료 (ref: fzkbikizkobdfzyzairx)
- **2026-05-15**: `posts.user_id` FK를 `public.profiles(id)`로 변경 — PostgREST 자동 조인 패턴 확립
- **2026-05-15**: `/feed` 페이지 제거 → `/board` 탭(전체/팔로잉)으로 통합
- **2026-05-15**: `workout_goals/logs` SELECT RLS 공개 전환 — 앱에서 user_id 필터 명시 패턴 도입
- **2026-05-15**: `workout_log_items` 테이블 신설 — 운동 기록 상세 항목 저장 및 지연 로딩
- **2026-05-15**: `comments.user_id` FK → `public.profiles(id)` 변경 — 댓글 400 오류 수정
- **2026-05-15**: `getFollowingIds` useCallback 적용 — 무한 루프 방지 패턴 확립
- **2026-05-18**: `routine_templates` SELECT RLS 공개 전환 — 루틴 가져오기 기능 구현, `fetchRoutines`에 user_id 필터 추가 필수
- **2026-05-18**: 부위별 통계 집계 단위 종목→루틴(세션)으로 변경 — classifyRoutine 함수 도입
- **2026-05-18**: `new Date('YYYY-MM-DD')` UTC 파싱 오류 → `new Date(y, m-1, d)` 로컬 파싱 패턴 확립
- **2026-05-18**: 앱 이름 MyTodo → FitLog 변경

## 현재 구현된 기능

- 회원가입/로그인/로그아웃
- 할 일(Todo) CRUD + 체크리스트
- 게시판: 목록(전체/팔로잉 탭)/상세/작성 + 이미지/댓글/좋아요
- 소셜: 프로필 편집, 팔로우/언팔로우, 팔로워·팔로잉 목록 모달, **타인 루틴 조회·가져오기**
- 운동: 루틴 템플릿 생성/**편집**/삭제, 목표 설정, 기록(루틴명+세부항목), 진행 바, 타이머, 운동 삭제
- **운동 통계**: 주간 횟수, 부위별 비율(루틴 단위), 월간 볼륨, 요일 분석

## 핵심 패턴

- user_id FK → `public.profiles(id)` (PostgREST 자동 조인)
- follows는 auth.users 참조 → 두 단계 쿼리 필수
- public SELECT 테이블에서 본인 데이터 조회 시 `.eq('user_id', user.id)` 명시
- async 함수 useCallback 적용 → 무한 루프 방지
- 날짜 파싱은 `new Date(y, m-1, d)` 로컬 기준 사용 (UTC 파싱 시 요일 오차)
