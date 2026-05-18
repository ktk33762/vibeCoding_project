# FitLog — 운동 기록 & 커뮤니티 플랫폼

운동 루틴 관리, 기록 추적, 통계 분석, 소셜 기능을 하나의 앱에서 제공하는 피트니스 플랫폼입니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **프론트엔드** | React 19, TypeScript, Vite |
| **라우팅** | React Router DOM v7 |
| **차트** | Recharts |
| **백엔드** | Supabase (PostgreSQL, Auth, Storage, RLS) |
| **스타일** | 도메인별 CSS (라이브러리 미사용) |

---

## 핵심 기능

### 인증
- 이메일 + 비밀번호 회원가입 / 로그인 / 로그아웃
- 회원가입 시 `profiles` 자동 생성 (DB 트리거)
- 보호 라우트 (미인증 접근 차단)

### 할 일 (`/todos`)
- 할 일 CRUD (제목, 메모, 완료 여부)
- 할 일별 체크리스트 항목 CRUD

### 게시판 (`/board`)
- 전체 / 팔로잉 탭 전환
- 글쓰기 — 제목, 본문, 이미지 첨부 (최대 5 MB, Supabase Storage)
- 상세 — 이미지 뷰, 좋아요 토글, 댓글 작성·삭제, 본인 글 삭제
- 목록 — 썸네일 + 좋아요 수 표시
- 비로그인 조회 가능

### 소셜 (`/profile/:userId`)
- 프로필 카드 (닉네임, 소개글, 팔로워·팔로잉 수)
- 프로필 편집
- 팔로우 / 언팔로우, 팔로워·팔로잉 목록 모달
- 상대방 운동 루틴 목록 조회 및 **내 루틴으로 가져오기**
- 운동 현황 Progress Bar (주간·월간 목표 달성률)
- 게시글 목록

### 운동 (`/workout`)

**오늘의 운동 세션**
- 루틴 템플릿 불러오기 → 종목별 세트 완료 체크
- 세트 간 휴식 타이머 (60 / 90 / 120 초)
- 운동 완료 기록
- 진행 중 / 완료된 운동 삭제

**목표 달성 현황**
- 주간·월간 목표 설정 및 Progress Bar
- 운동 기록 목록 — 날짜, 루틴명, 상세 종목 토글
- 운동 기록 삭제

**루틴 템플릿**
- 루틴 생성 — 종목명, 무게, 횟수, 세트 수
- 루틴 편집 — 종목별 무게·횟수·세트 수정
- 루틴 삭제
- 루틴 → 오늘의 운동 세션으로 불러오기

**운동 통계**
- 주간 운동 횟수 (최근 8주 막대 그래프)
- 부위별 운동 비율 (최근 30일 도넛 차트, 루틴 단위 집계)
- 월간 총 볼륨 (최근 6개월, 무게 × 횟수 × 완료세트)
- 요일 분석 (요일별 운동 횟수, 최다 요일 강조)

---

## 도메인 구조

```
auth        — 인증 (Supabase Auth)
member      — 프로필, 팔로우 관계
board       — 게시글, 댓글, 좋아요
todo        — 할 일, 체크리스트 항목
workout     — 루틴 템플릿, 운동 목표, 운동 기록
```

---

## DB 스키마

### `profiles`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | auth.users FK |
| nickname | text UNIQUE | 닉네임 |
| bio | text | 소개글 |
| created_at | timestamptz | |

### `follows`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| follower_id | uuid PK | auth.users FK |
| following_id | uuid PK | auth.users FK |
| created_at | timestamptz | |

### `posts`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid | profiles FK (PostgREST 조인용) |
| title | text | |
| content | text | |
| image_url | text | Storage URL |
| created_at / updated_at | timestamptz | |

### `comments`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| post_id | uuid | posts FK |
| user_id | uuid | profiles FK |
| content | text | |
| created_at | timestamptz | |

### `post_likes`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| post_id | uuid PK | posts FK |
| user_id | uuid PK | auth.users FK |
| created_at | timestamptz | 복합 PK로 1인 1좋아요 보장 |

### `todos`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid | auth.users FK |
| title | text | |
| memo | text | |
| is_completed | boolean | |
| created_at | timestamptz | |

### `todo_items`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| todo_id | uuid | todos FK |
| content | text | |
| is_checked | boolean | |
| sets / completed_sets | int | 운동 세트 추적용 |
| weight_kg / reps | numeric/int | |
| sort_order | int | |

### `routine_templates`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid | auth.users FK |
| name | text | |
| created_at | timestamptz | |

### `routine_template_items`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| template_id | uuid | routine_templates FK |
| name | text | 종목명 |
| sets | int | |
| weight_kg | numeric | nullable |
| reps | int | nullable |
| sort_order | int | |

### `workout_goals`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid | auth.users FK |
| period_type | text | `weekly` \| `monthly` |
| target_count | int | |
| created_at | timestamptz | UNIQUE(user_id, period_type) |

### `workout_logs`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid | auth.users FK |
| logged_date | date | |
| routine_name | text | nullable |
| note | text | nullable |
| created_at | timestamptz | |

### `workout_log_items`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| log_id | uuid | workout_logs FK |
| user_id | uuid | auth.users FK |
| exercise_name | text | |
| sets / completed_sets | int | |
| weight_kg / reps | numeric/int | nullable |
| sort_order | int | |

---

## 실행 방법

```bash
# 의존성 설치
cd frontend
npm install

# 개발 서버 실행
npm run dev
```


---

## 프로젝트 구조

```
subProject/
├── frontend/
│   └── src/
│       ├── pages/          # 라우트 컴포넌트
│       ├── components/     # 공용 컴포넌트
│       ├── hooks/          # 데이터 훅
│       ├── types/          # TypeScript 타입
│       ├── styles/         # 도메인별 CSS
│       └── lib/
│           └── supabase.ts # Supabase 클라이언트
└── backend/
    └── supabase/
        └── migrations/     # SQL 마이그레이션 파일
```
