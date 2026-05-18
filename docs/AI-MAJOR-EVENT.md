# 주요 사건 및 의사결정 기록

중요한 결정이나 사건이 발생할 때마다 기록합니다.

## 기록 목록

| 번호 | 시간 | 사건/결정 | 설명 | 영향 |
|------|------|----------|------|------|
| 1 | 2026-05-12 | 프로젝트 문서 구조 초기화 | CLAUDE.md 기반 docs 폴더 및 문서 생성 | 프로젝트 가이드라인 확립 |
| 2 | 2026-05-12 | 기술 스택 확정 | 프론트엔드: Vite+React+TS, 백엔드: Supabase | 아키텍처 및 폴더 구성 규칙 확정 |
| 3 | 2026-05-12 | 프로젝트 초기화 완료 | 프론트엔드: Vite+React+TS, 백엔드: Supabase CLI | 개발 환경 구축 완료 |
| 4 | 2026-05-12 | Supabase 프로젝트 연결 완료 | 프로젝트 ref: fzkbikizkobdfzyzairx | 원격 DB 연동 가능 |
| 5 | 2026-05-15 | posts.user_id FK를 public.profiles(id)로 변경 결정 | PostgREST 자동 조인이 auth.users를 거치지 못하는 문제 해결 | FK를 profiles 참조 시 닉네임 자동 조인 가능 — 이후 comments에도 동일 패턴 적용 |
| 6 | 2026-05-15 | 팔로잉 피드를 /feed 페이지에서 /board 탭으로 통합 | UX 개선 — 트위터 스타일의 탭 전환 방식 채택 | /feed 경로 제거, FeedPage 삭제, BoardPage에 전체/팔로잉 탭 추가 |
| 7 | 2026-05-15 | workout_goals/logs SELECT RLS를 공개로 변경 | 프로필 페이지에서 타인의 운동 현황 조회 필요 | 공개 SELECT + 앱에서 user_id 필터 명시 패턴 확립 |
| 8 | 2026-05-15 | workout_log_items 테이블 신설 | 운동 기록에 세부 종목/세트/무게 정보 저장 필요 | WorkoutPage에서 상세 내역 지연 로딩 패턴 도입 |
| 9 | 2026-05-15 | 댓글 user_id FK → public.profiles(id) 변경 | auth.users 참조 시 PostgREST profiles(nickname) 조인 불가 — 400 오류 발생 | comments 테이블도 FK를 profiles 참조로 교정 (마이그레이션 20260515100000) |
| 10 | 2026-05-15 | getFollowingIds를 useCallback으로 감싸는 패턴 확립 | 함수 참조가 매 렌더마다 바뀌어 useEffect 무한 루프 발생 | 의존성이 없는 async 함수도 useCallback 적용 필수 |
