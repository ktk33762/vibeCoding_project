// 더미 사용자 및 게시글 생성 시드 스크립트
const SUPABASE_URL = 'https://fzkbikizkobdfzyzairx.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a2Jpa2l6a29iZGZ6eXphaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Njg1MTgsImV4cCI6MjA5NDE0NDUxOH0.f8eN_wJakdNAT2kSSgjkZ7yfp04HydOBriGIMQebwU4'

const DUMMY_USERS = [
  {
    email: 'kim.fitness@test.com',
    password: 'Test1234!',
    nickname: '김헬스',
    bio: '헬스 5년차 | 3대 운동 매일 기록 중',
    posts: [
      {
        title: '벤치프레스 초보를 위한 완벽 가이드',
        content: `안녕하세요, 헬스 5년차 김헬스입니다.

벤치프레스를 처음 시작하시는 분들이 자주 묻는 질문들을 정리해봤어요.

1. 그립 너비
어깨보다 약간 넓게 잡는 것이 기본입니다. 너무 좁으면 삼두근에, 너무 넓으면 어깨에 부담이 집중됩니다.

2. 등 아치
과도한 아치는 좋지 않습니다. 자연스러운 아치를 유지하세요.

3. 호흡법
바벨을 내릴 때 숨을 들이쉬고, 밀어올릴 때 내쉬세요.

처음엔 빈 봉으로 자세를 잡는 게 중요합니다. 무게는 천천히 늘려가세요!`,
      },
      {
        title: '3대 500 달성 후기',
        content: `드디어 해냈습니다!!

스쿼트 180kg, 데드리프트 200kg, 벤치 120kg — 합계 500kg 달성했습니다.

시작한 지 5년이 걸렸네요. 처음엔 스쿼트 60kg도 힘들었는데...

결승선을 넘는 느낌이라고 할까요. 핵심은 꾸준함이었어요. 매일 가지 않아도 됩니다. 주 4회, 3년이면 누구나 가능합니다.

다음 목표는 3대 600! 응원해주세요.`,
      },
      {
        title: '헬스장 에티켓 — 이것만은 꼭 지켜주세요',
        content: `헬스장을 다니면서 불편했던 점들을 공유합니다.

1. 기구 쓰고 닦기
땀이 묻은 기구는 꼭 닦아주세요. 다음 사람을 위한 기본 배려입니다.

2. 폰 보면서 기구 독점 금지
사용 중이 아니면 양보해주세요.

3. 원판 제자리에 놓기
다 쓴 원판은 반드시 원래 자리에.

4. 과도한 소음 자제
'아이고' 정도는 이해하지만 지나치게 큰 소리는 민폐입니다.

헬스장은 모두가 함께 쓰는 공간입니다. 서로 배려해요!`,
      },
    ],
  },
  {
    email: 'park.running@test.com',
    password: 'Test1234!',
    nickname: '박달리기',
    bio: '마라톤 완주 3회 | 러너의 일상을 공유합니다',
    posts: [
      {
        title: '첫 하프마라톤 완주 후기',
        content: `21.0975km... 드디어 완주했습니다!

준비 기간: 3개월
완주 시간: 2시간 11분

처음 10km까지는 생각보다 쉬웠는데, 15km 이후부터가 진짜였어요. 다리가 벽돌처럼 무거워지면서 포기하고 싶었지만 결승선 테이프를 끊는 순간 눈물이 났습니다.

달리기를 시작하고 싶은 분들께 — 일단 시작하세요. 처음엔 5분도 힘들지만 3개월 후엔 달라져 있을 거예요.`,
      },
      {
        title: '러닝화 고르는 법 — 초보자 완벽 가이드',
        content: `러닝화, 그냥 예쁜 거 사면 안 됩니다.

러닝화를 고를 때 가장 중요한 건 발볼과 발바닥 아치 타입이에요.

1. 오버프로네이션 (발이 안쪽으로 꺾임)
→ 스태빌리티/모션컨트롤 타입 추천

2. 중립 (일반적인 발)
→ 뉴트럴 타입 추천

3. 슈퍼피네이션 (발이 바깥쪽으로 꺾임)
→ 쿠셔닝 타입 추천

전문 러닝샵에서 보행 분석을 받아보시는 걸 강력 추천합니다. 발에 맞는 신발 하나가 부상을 막아줍니다.`,
      },
      {
        title: '비 오는 날 실내 러닝 vs 야외 러닝',
        content: `러너라면 한 번쯤 고민해봤을 주제입니다.

[야외 러닝의 장점]
- 지형 변화로 다양한 근육 자극
- 신선한 공기와 경치
- 실제 레이스 환경 적응

[실내 러닝(트레드밀)의 장점]
- 날씨 무관
- 속도/경사 정밀 조절
- 무릎에 약간 더 친절함

개인적으로는 비가 와도 웬만하면 야외를 선호합니다. 빗속 달리기, 생각보다 상쾌합니다. 단, 번개가 치면 반드시 실내로!`,
      },
    ],
  },
  {
    email: 'lee.nutrition@test.com',
    password: 'Test1234!',
    nickname: '이영양',
    bio: '스포츠 영양 전문가 | 올바른 식단으로 퍼포먼스를 높이세요',
    posts: [
      {
        title: '운동 전후 식사 타이밍의 모든 것',
        content: `운동 전후로 뭘 먹어야 할지 헷갈리시나요?

[운동 전]
운동 1.5~2시간 전: 탄수화물 + 단백질 위주 식사
예) 닭가슴살 + 고구마, 오트밀 + 달걀

운동 30분 전: 바나나 1개 정도의 간단한 탄수화물

[운동 후]
운동 직후 30분~1시간 이내가 골든타임입니다.
단백질 20~40g + 탄수화물을 함께 섭취하세요.
예) 단백질 쉐이크 + 바나나, 그릭요거트 + 과일

가장 중요한 건 꾸준함입니다. 타이밍보다 총 섭취량이 더 중요해요.`,
      },
      {
        title: '프로틴 보충제, 꼭 먹어야 하나요?',
        content: `자주 받는 질문입니다: "프로틴 안 먹으면 근육이 안 붙나요?"

결론부터: 식사로 단백질을 충분히 섭취한다면 꼭 필요하지 않습니다.

단백질 필요량은 체중 1kg당 1.6~2.2g입니다.
체중 70kg → 하루 112~154g의 단백질 필요

닭가슴살 100g = 단백질 23g
달걀 1개 = 단백질 6g
두부 100g = 단백질 8g
그릭요거트 150g = 단백질 15g

바쁜 현대인에게 프로틴 쉐이크는 편의성 면에서 도움이 됩니다. 하지만 식사를 대체할 수 없고 마법의 약도 아닙니다.`,
      },
      {
        title: '다이어트 중 외식할 때 메뉴 선택법',
        content: `다이어트 중 외식, 피할 수 없죠. 그럼 잘 먹는 법을 알아야 해요!

[추천 메뉴]
- 샐러드 (드레싱 따로 요청)
- 구운 생선 or 닭가슴살 요리
- 국물 위주 음식 (칼국수보단 육개장)
- 회 (초장은 조금만)

[피해야 할 메뉴]
- 튀김류 전반
- 크림소스 파스타
- 뷔페 (통제가 어려움)
- 달콤한 음료

핵심 전략: 단백질 먼저 먹고, 채소, 마지막에 탄수화물.

완벽하게 지키려 하지 마세요. 80%만 지켜도 충분합니다. 오늘 외식했다고 내일을 포기하지 마세요!`,
      },
    ],
  },
  {
    email: 'choi.yoga@test.com',
    password: 'Test1234!',
    nickname: '최요가',
    bio: '요가 강사 10년차 | 몸과 마음의 균형을 찾아드립니다',
    posts: [
      {
        title: '헬스와 요가, 같이 하면 더 좋은 이유',
        content: `많은 분들이 "헬스하는데 요가가 필요해요?"라고 물으십니다.

네, 강력히 추천합니다.

이유:
1. 유연성 향상 → 부상 예방
2. 코어 강화 → 기본 운동 자세 개선
3. 호흡 조절 → 운동 퍼포먼스 향상
4. 회복 촉진 → 지연성 근육통 감소

특히 헬스 직후 30분 요가는 근육 회복에 탁월합니다.

처음이라면 "회복 요가(Restorative Yoga)"부터 시작해보세요. 난이도도 낮고 부담이 없습니다. 주 1~2회만 추가해도 1달 후 몸이 달라져 있을 거예요.`,
      },
      {
        title: '직장인을 위한 10분 사무실 스트레칭',
        content: `하루 종일 앉아 계신 직장인 분들을 위한 루틴입니다.

[목·어깨 — 3분]
- 목 좌우 기울이기 30초씩
- 어깨 앞뒤 돌리기 각 10회
- 귀를 어깨에 붙이는 스트레칭 각 20초

[허리·골반 — 4분]
- 의자에 앉아 상체 비틀기 좌우 20초씩
- 한쪽 다리 당겨 앉아서 햄스트링 스트레칭
- 골반 전후 틸트 10회

[손목·손가락 — 3분]
- 손목 돌리기 각 방향 10회
- 손가락 스트레칭 및 쥐었다 펴기

매 2시간마다 일어나서 이 루틴을 해보세요. 목·허리 통증이 현저히 줄어듭니다!`,
      },
    ],
  },
]

function baseHeaders(token) {
  const h = {
    'Content-Type': 'application/json',
    apikey: ANON_KEY,
  }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

async function signUp(email, password, nickname) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email, password, data: { nickname } }),
  })
  const data = await res.json()
  if (data.error || data.error_description) {
    throw new Error(data.error_description || data.error)
  }
  return data
}

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (data.error || data.error_description) {
    throw new Error(data.error_description || data.error)
  }
  return data
}

async function updateProfile(token, userId, bio) {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: baseHeaders(token),
    body: JSON.stringify({ bio }),
  })
}

async function createPost(token, userId, title, content) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
    method: 'POST',
    headers: { ...baseHeaders(token), Prefer: 'return=minimal' },
    body: JSON.stringify({ title, content, user_id: userId }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }
}

async function main() {
  console.log('🌱 더미 데이터 시드 시작...\n')

  for (const user of DUMMY_USERS) {
    console.log(`👤 [${user.nickname}] (${user.email})`)

    // 1. 회원가입
    try {
      await signUp(user.email, user.password, user.nickname)
      console.log(`   ✓ 회원가입 완료`)
    } catch (e) {
      if (e.message.includes('already registered') || e.message.includes('already been registered')) {
        console.log(`   - 이미 존재하는 계정, 로그인 시도`)
      } else {
        console.log(`   ! 회원가입 오류: ${e.message}`)
      }
    }

    // 2. 로그인
    let session
    try {
      session = await signIn(user.email, user.password)
      console.log(`   ✓ 로그인 완료 (userId: ${session.user.id.slice(0, 8)}...)`)
    } catch (e) {
      console.log(`   ✗ 로그인 실패: ${e.message}`)
      if (e.message.includes('Email not confirmed')) {
        console.log(`   ⚠  이메일 인증이 필요합니다.`)
        console.log(`      Supabase 대시보드 → Authentication → Providers → Email → "Confirm email" 비활성화 후 재시도`)
      }
      continue
    }

    const { access_token, user: { id: userId } } = session

    // 3. 프로필 소개글 업데이트
    try {
      await updateProfile(access_token, userId, user.bio)
      console.log(`   ✓ 소개글 설정`)
    } catch (e) {
      console.log(`   ! 소개글 설정 실패: ${e.message}`)
    }

    // 4. 게시글 작성
    for (const post of user.posts) {
      try {
        await createPost(access_token, userId, post.title, post.content)
        console.log(`   ✓ 게시글: "${post.title}"`)
      } catch (e) {
        console.log(`   ! 게시글 실패: ${e.message}`)
      }
    }

    console.log()
  }

  console.log('✅ 시드 완료!')
  console.log('\n더미 계정 목록:')
  for (const u of DUMMY_USERS) {
    console.log(`  ${u.nickname.padEnd(8)} ${u.email}  /  비밀번호: ${u.password}`)
  }
}

main().catch(console.error)
