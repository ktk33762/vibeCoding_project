# 회원 도메인 헌법

## 회원 개념

- 회원(Member)은 Supabase Auth가 관리하는 사용자다.
- `public.profiles`는 Auth 사용자와 1:1로 연결되는 공개 프로필이다.

## 책임 범위

- 회원 가입 (이메일/비밀번호)
- 로그인, 로그아웃
- 프로필 조회 (공개) 및 수정 (본인만)
- 닉네임, 소개글(bio) 관리

## 원칙

- 회원가입 시 `profiles` 레코드가 DB 트리거로 자동 생성된다.
- 프로필은 전체 공개 (SELECT)이며, 수정은 본인만 가능하다.
- 별도 REST API 서버 없음 — Supabase Auth 및 PostgREST를 직접 사용한다.
- 닉네임은 중복을 허용하지 않는다.
- 비밀번호는 최소 8자 이상이어야 한다.

## 훅 / 페이지

- 훅: 별도 커스텀 훅 없음 — 페이지에서 `supabase.auth.*` 직접 사용
- 페이지: `/login` (LoginPage), `/signup` (SignupPage)
- 프로필 조회/수정은 소셜 도메인 `ProfilePage`에서 처리
