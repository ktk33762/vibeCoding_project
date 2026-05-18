-- 회원 프로필 테이블 생성
-- Supabase Auth의 auth.users와 1:1 관계로 추가 프로필 정보를 저장

-- profiles 테이블
-- id: auth.users.id와 동일한 UUID, CASCADE DELETE (회원 탈퇴 시 자동 삭제)
-- nickname: 중복 불가, 필수
-- status: 회원 상태 (ACTIVE, INACTIVE, WITHDRAWN)
-- created_at, updated_at: 자동 관리

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text not null unique,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE', 'WITHDRAWN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security 활성화 (RLS)
-- 사용자별 데이터 접근 제어를 위해 필수
alter table public.profiles enable row level security;

-- RLS 정책: 모든 사용자가 프로필을 조회할 수 있음
-- (닉네임 표시 등의 공개 프로필 정보용)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- RLS 정책: 본인만 자신의 프로필을 생성할 수 있음
-- (회원가입 시 트리거 또는 클라이언트에서 본인 id로 생성)
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- RLS 정책: 본인만 자신의 프로필을 수정할 수 있음
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 닉네임 조회 성능 향상용 인덱스
create index idx_profiles_nickname on public.profiles (nickname);

-- updated_at 자동 갱신 트리거 함수
create function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- profiles 테이블 UPDATE 시 updated_at 자동 갱신
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();
