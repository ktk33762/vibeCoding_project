# 완료된 작업 기록

## 완료 작업 목록

| 번호 | 작업 내용 | 완료 시간 | 관련 문서 | 비고 |
|------|----------|----------|----------|------|
| 1 | docs 폴더 및 문서 초기화 | 2026-05-12 | CLAUDE.md | 프로젝트 문서 구조 생성 |
| 2 | 프론트엔드/백엔드 프로젝트 초기화 | 2026-05-12 | ARCHITECTURE-STATUTE.md | Vite+React+TS, Supabase CLI init, supabase-js 설치 |
| 3 | Supabase 원격 프로젝트 연결 | 2026-05-12 | CONTEXT.md | CLI 로그인 및 프로젝트 fzkbikizkobdfzyzairx 링크 |
| 4 | 프론트엔드 Supabase 클라이언트 설정 | 2026-05-12 | frontend/ | .env, supabase.ts, 타입 정의 생성 |
| 5 | 회원 도메인 DB 스키마 설계 및 마이그레이션 적용 | 2026-05-13 | DOMAIN-MEMBER-STATUTE.md | profiles 테이블, RLS, 자동 생성 트리거 적용 완료 |
| 6 | 프론트엔드 로그인/회원가입 화면 개발 | 2026-05-13 | frontend/src/ | LoginPage, SignupPage, HomePage, ProtectedRoute, useAuth 구현 |
| 7 | 할 일 앱 프론트엔드 구현 | 2026-05-14 | frontend/src/ | useTodos, TodoCard, TodoPage, todo.css 구현 |
| 8 | 공통 헤더 컴포넌트 구현 | 2026-05-14 | frontend/src/components/Header.tsx | 로고(홈 이동) + 로그인/로그아웃 버튼 내장 |
| 9 | 자유게시판 도메인 문서 생성 | 2026-05-14 | docs/DOMAIN-BOARD-*.md | CONSTITUTION, STATUTE 생성 |
| 10 | 자유게시판 DB 스키마 및 마이그레이션 | 2026-05-14 | backend/supabase/migrations/ | posts 테이블, RLS, posts→profiles FK 연결 |
| 11 | 자유게시판 프론트엔드 구현 | 2026-05-14 | frontend/src/ | BoardPage, PostWritePage, PostDetailPage, usePosts, board.css |
| 12 | 비로그인 게시판 접근 허용 | 2026-05-14 | App.tsx, RLS | 홈·게시판 목록·상세 비로그인 접근 허용 |
| 13 | 운동 도메인 문서 생성 | 2026-05-15 | docs/DOMAIN-WORKOUT-*.md | CONSTITUTION, STATUTE 생성 |
| 14 | 운동 DB 스키마 및 마이그레이션 | 2026-05-15 | backend/supabase/migrations/ | routine_templates, workout_goals, workout_logs 테이블 + RLS |
| 15 | 운동 관리 프론트엔드 구현 | 2026-05-15 | frontend/src/ | WorkoutPage, WorkoutTimer, useRoutines, useWorkoutGoals, useWorkoutLogs |
| 16 | 소셜/팔로우 도메인 문서 및 DB 구현 | 2026-05-15 | DOMAIN-SOCIAL-*.md | follows 테이블, ProfilePage, useFollows |
| 17 | 팔로잉 피드 페이지 구현 | 2026-05-15 | FeedPage → BoardPage 탭으로 통합 | /feed 경로 구현 후 나중에 탭으로 이관 |
| 18 | 더미 사용자 시드 스크립트 작성 및 실행 | 2026-05-15 | backend/seed.mjs | 4명 더미 사용자 + 게시글 생성 |
| 19 | 게시글 이미지 첨부 기능 구현 | 2026-05-15 | posts.image_url, Storage | 업로드, 미리보기, 5MB 검증 |
| 20 | 기존 게시글 이미지 시드 추가 | 2026-05-15 | backend/seed-images.mjs | Picsum Photos URL로 11개 게시글 이미지 등록 |
| 21 | 게시글 목록 이미지 썸네일 표시 | 2026-05-15 | BoardPage, board.css | 목록 우측 작은 썸네일 |
| 22 | 댓글 기능 구현 | 2026-05-15 | comments 테이블, useComments, PostDetailPage | 댓글 작성/삭제, 닉네임 표시 |
| 23 | 좋아요 기능 구현 | 2026-05-15 | post_likes 테이블, usePostLikes | 토글, 목록/상세에 카운트 표시 |
| 24 | 댓글 400 오류 수정 | 2026-05-15 | 마이그레이션 20260515100000 | comments.user_id FK → public.profiles(id) 변경 |
| 25 | 게시판 팔로잉 탭 통합 | 2026-05-15 | BoardPage | 전체/팔로잉 탭, /feed → /board 리다이렉트 |
| 26 | BoardPage 무한 로딩 버그 수정 | 2026-05-15 | useFollows.ts | getFollowingIds useCallback 적용 |
| 27 | 팔로워/팔로잉 목록 모달 구현 | 2026-05-15 | FollowListModal.tsx, ProfilePage | 클릭 시 사용자 목록 모달 표시 |
| 28 | 프로필 페이지 게시글 썸네일/좋아요 표시 | 2026-05-15 | ProfilePage | post_likes count, image_url 표시 |
| 29 | 프로필 페이지 운동 현황 표시 | 2026-05-15 | ProfilePage, workout_goals/logs 공개 RLS | 주간/월간 목표 진행 바 |
| 30 | 운동 페이지 기록 상세 표시 | 2026-05-15 | WorkoutPage, workout_log_items | 루틴명, 상세 항목 지연 로딩 토글 |
| 31 | "상세 기록 없음" 버그 수정 | 2026-05-15 | useWorkoutLogs.ts | fetchLogs에 .eq('user_id', user.id) 필터 추가 |
| 32 | 전체 도메인 문서 업데이트 | 2026-05-15 | docs/ | ARCHITECTURE, DOMAIN 모든 문서 현행화 |
