# AI 작업 로그

최대 100개까지 유지합니다. 초과 시 오래된 항목부터 제거합니다.

## 로그 목록

| 번호 | 시간 | 작업 내용 | 관련 문서 | 결과 |
|------|------|----------|----------|------|
| 1 | 2026-05-12 | docs 폴더 및 문서 초기화 | CLAUDE.md | 성공 |
| 2 | 2026-05-12 | 기술 스택 확정 반영 | ARCHITECTURE-STATUTE.md, CONTEXT.md | 성공 |
| 3 | 2026-05-12 | 프론트엔드/백엔드 프로젝트 초기화 | frontend/, backend/ | 성공 |
| 4 | 2026-05-12 | Supabase 원격 프로젝트 연결 | backend/ | 성공 |
| 5 | 2026-05-12 | 프론트엔드 Supabase 클라이언트 설정 | frontend/ | 성공 |
| 6 | 2026-05-13 | 회원가입 시 profiles 자동 생성 트리거 마이그레이션 추가 및 적용 | backend/supabase/migrations/ | 성공 |
| 7 | 2026-05-13 | DOMAIN-MEMBER-STATUTE.md 엔티티 정의 완성 | DOMAIN-MEMBER-STATUTE.md | 성공 |
| 8 | 2026-05-13 | 프론트엔드 로그인/회원가입 화면 개발 | frontend/src/ | 성공 |
| 9 | 2026-05-14 | 할 일 앱 프론트엔드 구현 | frontend/src/hooks/useTodos.ts, pages/TodoPage.tsx | 성공 |
| 10 | 2026-05-14 | 공통 헤더 컴포넌트 구현 | frontend/src/components/Header.tsx | 성공 |
| 11 | 2026-05-14 | 자유게시판 도메인 문서 생성 | docs/DOMAIN-BOARD-*.md | 성공 |
| 12 | 2026-05-14 | 자유게시판 DB 스키마 마이그레이션 적용 | backend/supabase/migrations/ | 성공 |
| 13 | 2026-05-14 | 자유게시판 프론트엔드 구현 | BoardPage, PostWritePage, PostDetailPage, usePosts | 성공 |
| 14 | 2026-05-14 | 게시판 비로그인 접근 허용 RLS 수정 | 마이그레이션 20260514030000 | 성공 |
| 15 | 2026-05-15 | 운동 도메인 문서 생성 | docs/DOMAIN-WORKOUT-*.md | 성공 |
| 16 | 2026-05-15 | 운동 DB 스키마 마이그레이션 적용 | routine_templates, workout_goals, workout_logs | 성공 |
| 17 | 2026-05-15 | 운동 관리 프론트엔드 구현 | WorkoutPage, WorkoutTimer, useRoutines, useWorkoutGoals, useWorkoutLogs | 성공 |
| 18 | 2026-05-15 | 소셜 도메인 문서 생성 | docs/DOMAIN-SOCIAL-*.md | 성공 |
| 19 | 2026-05-15 | 소셜 DB 스키마 마이그레이션 (follows, bio) | backend/supabase/migrations/ | 성공 |
| 20 | 2026-05-15 | ProfilePage + useFollows 구현 | frontend/src/ | 성공 |
| 21 | 2026-05-15 | 팔로잉 피드 페이지 구현 (FeedPage) | FeedPage.tsx, usePosts | 성공 |
| 22 | 2026-05-15 | 더미 사용자 시드 스크립트 작성 | backend/seed.mjs | 성공 |
| 23 | 2026-05-15 | 더미 사용자 시드 실행 (이메일 확인 임시 비활성화 후 재활성화) | Supabase dashboard 설정 변경 | 성공 |
| 24 | 2026-05-15 | 게시글 이미지 첨부 기능 구현 | 마이그레이션 20260515080000, PostWritePage, usePosts | 성공 |
| 25 | 2026-05-15 | 기존 게시글 이미지 시드 | backend/seed-images.mjs, Picsum Photos | 성공 |
| 26 | 2026-05-15 | 게시글 목록 이미지 썸네일 표시 | BoardPage, board.css | 성공 |
| 27 | 2026-05-15 | 댓글 기능 구현 | 마이그레이션 20260515090000, useComments.ts, PostDetailPage | 성공 |
| 28 | 2026-05-15 | 좋아요 기능 구현 | post_likes 테이블, usePostLikes.ts, PostDetailPage | 성공 |
| 29 | 2026-05-15 | 댓글 400 오류 수정 (FK 변경) | 마이그레이션 20260515100000 | 성공 |
| 30 | 2026-05-15 | 게시판 전체/팔로잉 탭 통합 | BoardPage.tsx, App.tsx (FeedPage 제거) | 성공 |
| 31 | 2026-05-15 | BoardPage 무한 로딩 버그 수정 | useFollows.ts (getFollowingIds useCallback 적용) | 성공 |
| 32 | 2026-05-15 | 팔로워/팔로잉 목록 모달 구현 | FollowListModal.tsx, ProfilePage.tsx | 성공 |
| 33 | 2026-05-15 | 프로필 게시글 목록 썸네일/좋아요 표시 | ProfilePage.tsx, social.css | 성공 |
| 34 | 2026-05-15 | 프로필 페이지 운동 현황 표시 | 마이그레이션 20260515110000, ProfilePage.tsx | 성공 |
| 35 | 2026-05-15 | 운동 페이지 기록 상세 표시 기능 구현 | 마이그레이션 20260515120000, 20260515130000, WorkoutPage, useWorkoutLogs | 성공 |
| 36 | 2026-05-15 | "상세 기록 없음" 버그 수정 | useWorkoutLogs.ts (.eq('user_id') 필터 누락) | 성공 |
| 37 | 2026-05-15 | 전체 도메인/아키텍처 문서 업데이트 | docs/ 전체 | 성공 |
| 38 | 2026-05-18 | 오늘의 운동 세션 삭제 기능 추가 | WorkoutPage.tsx, workout.css | 성공 |
| 39 | 2026-05-18 | 다른 사용자 루틴 조회 및 가져오기 기능 구현 | 마이그레이션 20260518000000, ProfilePage.tsx, useRoutines.ts, social.css | 성공 |
| 40 | 2026-05-18 | 루틴 가져오기를 위한 RLS 정책 추가 | routine_templates/items SELECT 인증 사용자 허용 | 성공 |
| 41 | 2026-05-18 | useRoutines.fetchRoutines user_id 필터 추가 | 공개 SELECT 전환 후 타인 루틴 혼입 방지 | 성공 |
| 42 | 2026-05-18 | 더미 루틴·목표·운동기록 시드 작성 및 실행 | backend/seed-routines.mjs | 성공 |
| 43 | 2026-05-18 | 루틴 템플릿 편집 기능 구현 | useRoutines.ts (updateRoutineItems), WorkoutPage.tsx (RoutineCard 컴포넌트 추출), workout.css | 성공 |
| 44 | 2026-05-18 | 운동 통계 섹션 구현 (4종 차트) | useWorkoutStats.ts, WorkoutPage.tsx, recharts 설치, workout.css | 성공 |
| 45 | 2026-05-18 | 부위별 운동 비율 집계 방식 변경 | 종목 단위 → 루틴(세션) 단위 집계, classifyRoutine 함수 추가 | 성공 |
| 46 | 2026-05-18 | 루틴 수행률 카드 → 요일 분석 카드로 교체 | useWorkoutStats.ts (buildWeekdayData), WorkoutPage.tsx | 성공 |
| 47 | 2026-05-18 | README.md 작성 | 프로젝트 설명, 기능, 기술스택, DB스키마 포함 | 성공 |
| 48 | 2026-05-18 | CONTEXT.md 최신화 | 2026-05-15 이후 변경 사항 전체 반영 | 성공 |
| 49 | 2026-05-18 | 앱 로고 이름 변경 (MyTodo → FitLog) | Header.tsx, index.html | 성공 |
