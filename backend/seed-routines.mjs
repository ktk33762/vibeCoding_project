// 루틴 템플릿 + 운동 목표 + 운동 기록 시드 스크립트
const SUPABASE_URL = 'https://fzkbikizkobdfzyzairx.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a2Jpa2l6a29iZGZ6eXphaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Njg1MTgsImV4cCI6MjA5NDE0NDUxOH0.f8eN_wJakdNAT2kSSgjkZ7yfp04HydOBriGIMQebwU4'

// 오늘로부터 N일 전 날짜 문자열
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const USERS_DATA = [
  {
    email: 'kim.fitness@test.com',
    password: 'Test1234!',
    nickname: '김헬스',
    goals: { weekly: 5, monthly: 20 },
    logDaysAgo: [1, 2, 4, 6, 8, 10, 12, 15],
    routines: [
      {
        name: '가슴 루틴',
        items: [
          { name: '벤치프레스', sets: 5, weight_kg: 80, reps: 5 },
          { name: '인클라인 덤벨 프레스', sets: 4, weight_kg: 30, reps: 10 },
          { name: '딥스', sets: 3, weight_kg: null, reps: 12 },
          { name: '케이블 크로스오버', sets: 3, weight_kg: 15, reps: 15 },
        ],
      },
      {
        name: '등 루틴',
        items: [
          { name: '데드리프트', sets: 5, weight_kg: 150, reps: 3 },
          { name: '랫풀다운', sets: 4, weight_kg: 70, reps: 10 },
          { name: '바벨 로우', sets: 4, weight_kg: 80, reps: 8 },
          { name: '원암 덤벨 로우', sets: 3, weight_kg: 35, reps: 12 },
          { name: '시티드 케이블 로우', sets: 3, weight_kg: 60, reps: 12 },
        ],
      },
      {
        name: '하체 루틴',
        items: [
          { name: '스쿼트', sets: 5, weight_kg: 140, reps: 5 },
          { name: '레그 프레스', sets: 4, weight_kg: 180, reps: 10 },
          { name: '레그 컬', sets: 3, weight_kg: 50, reps: 12 },
          { name: '레그 익스텐션', sets: 3, weight_kg: 50, reps: 12 },
          { name: '카프레이즈', sets: 4, weight_kg: 60, reps: 20 },
        ],
      },
      {
        name: '어깨 루틴',
        items: [
          { name: '오버헤드 프레스', sets: 4, weight_kg: 60, reps: 8 },
          { name: '사이드 레터럴 레이즈', sets: 4, weight_kg: 12, reps: 15 },
          { name: '페이스 풀', sets: 3, weight_kg: 20, reps: 15 },
          { name: '프론트 레이즈', sets: 3, weight_kg: 10, reps: 12 },
        ],
      },
    ],
  },
  {
    email: 'park.running@test.com',
    password: 'Test1234!',
    nickname: '박달리기',
    goals: { weekly: 4, monthly: 16 },
    logDaysAgo: [0, 3, 5, 7, 9, 11, 14],
    routines: [
      {
        name: '러너 하체 강화',
        items: [
          { name: '불가리안 스플릿 스쿼트', sets: 3, weight_kg: 20, reps: 12 },
          { name: '루마니안 데드리프트', sets: 3, weight_kg: 60, reps: 12 },
          { name: '카프레이즈', sets: 4, weight_kg: null, reps: 25 },
          { name: '힙 어브덕션', sets: 3, weight_kg: 30, reps: 15 },
          { name: '글루트 브릿지', sets: 3, weight_kg: null, reps: 20 },
        ],
      },
      {
        name: '러너 코어 루틴',
        items: [
          { name: '플랭크', sets: 3, weight_kg: null, reps: null },
          { name: '사이드 플랭크', sets: 3, weight_kg: null, reps: null },
          { name: '데드버그', sets: 3, weight_kg: null, reps: 10 },
          { name: '버드독', sets: 3, weight_kg: null, reps: 10 },
          { name: '힙 브릿지', sets: 3, weight_kg: null, reps: 15 },
        ],
      },
      {
        name: '인터벌 보조 루틴',
        items: [
          { name: '박스 점프', sets: 4, weight_kg: null, reps: 10 },
          { name: '점프 스쿼트', sets: 4, weight_kg: null, reps: 12 },
          { name: '런지 점프', sets: 3, weight_kg: null, reps: 10 },
          { name: '스텝업', sets: 3, weight_kg: 10, reps: 15 },
        ],
      },
    ],
  },
  {
    email: 'lee.nutrition@test.com',
    password: 'Test1234!',
    nickname: '이영양',
    goals: { weekly: 3, monthly: 12 },
    logDaysAgo: [2, 5, 8, 12, 16, 20],
    routines: [
      {
        name: '전신 루틴 A',
        items: [
          { name: '스쿼트', sets: 3, weight_kg: 60, reps: 10 },
          { name: '벤치프레스', sets: 3, weight_kg: 50, reps: 10 },
          { name: '바벨 로우', sets: 3, weight_kg: 50, reps: 10 },
          { name: '오버헤드 프레스', sets: 3, weight_kg: 35, reps: 10 },
          { name: '바벨 컬', sets: 3, weight_kg: 25, reps: 12 },
        ],
      },
      {
        name: '고강도 전신 서킷',
        items: [
          { name: '케틀벨 스윙', sets: 4, weight_kg: 24, reps: 15 },
          { name: '메디신볼 슬램', sets: 3, weight_kg: 8, reps: 12 },
          { name: '버피', sets: 3, weight_kg: null, reps: 10 },
          { name: '배틀로프', sets: 4, weight_kg: null, reps: null },
          { name: '점프 로프', sets: 4, weight_kg: null, reps: null },
        ],
      },
    ],
  },
  {
    email: 'choi.yoga@test.com',
    password: 'Test1234!',
    nickname: '최요가',
    goals: { weekly: 6, monthly: 24 },
    logDaysAgo: [0, 1, 2, 4, 5, 7, 8, 10, 11, 13],
    routines: [
      {
        name: '요가 보조 근력 루틴',
        items: [
          { name: '푸시업', sets: 3, weight_kg: null, reps: 15 },
          { name: '글루트 브릿지', sets: 3, weight_kg: null, reps: 20 },
          { name: '수퍼맨', sets: 3, weight_kg: null, reps: 15 },
          { name: '캣카우', sets: 3, weight_kg: null, reps: 10 },
          { name: '차일드 포즈 유지', sets: 3, weight_kg: null, reps: null },
        ],
      },
      {
        name: '코어 & 유연성 루틴',
        items: [
          { name: '플랭크', sets: 3, weight_kg: null, reps: null },
          { name: '브이 싯업', sets: 3, weight_kg: null, reps: 15 },
          { name: '레그레이즈', sets: 3, weight_kg: null, reps: 15 },
          { name: '러시안 트위스트', sets: 3, weight_kg: 5, reps: 20 },
          { name: '스파이더맨 스트레칭', sets: 3, weight_kg: null, reps: 10 },
        ],
      },
      {
        name: '아침 활성화 루틴',
        items: [
          { name: '선 자세 스트레칭', sets: 2, weight_kg: null, reps: null },
          { name: '고양이 소 자세', sets: 2, weight_kg: null, reps: 10 },
          { name: '다운독 → 업독', sets: 3, weight_kg: null, reps: 8 },
          { name: '전사 자세 1', sets: 2, weight_kg: null, reps: null },
          { name: '전사 자세 2', sets: 2, weight_kg: null, reps: null },
        ],
      },
    ],
  },
]

function headers(token) {
  const h = { 'Content-Type': 'application/json', apikey: ANON_KEY }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error_description || data.error)
  return data
}

async function insertRoutine(token, userId, routine) {
  // 템플릿 생성
  const tRes = await fetch(`${SUPABASE_URL}/rest/v1/routine_templates`, {
    method: 'POST',
    headers: { ...headers(token), Prefer: 'return=representation' },
    body: JSON.stringify({ name: routine.name, user_id: userId }),
  })
  const tData = await tRes.json()
  if (!tRes.ok) throw new Error(JSON.stringify(tData))
  const templateId = tData[0].id

  // 항목 생성
  if (routine.items.length > 0) {
    const iRes = await fetch(`${SUPABASE_URL}/rest/v1/routine_template_items`, {
      method: 'POST',
      headers: { ...headers(token), Prefer: 'return=minimal' },
      body: JSON.stringify(
        routine.items.map((item, idx) => ({
          template_id: templateId,
          name: item.name,
          sets: item.sets,
          weight_kg: item.weight_kg ?? null,
          reps: item.reps ?? null,
          sort_order: idx,
        }))
      ),
    })
    if (!iRes.ok) throw new Error(await iRes.text())
  }
}

async function upsertGoal(token, userId, periodType, targetCount) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/workout_goals`,
    {
      method: 'POST',
      headers: { ...headers(token), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ user_id: userId, period_type: periodType, target_count: targetCount }),
    }
  )
  if (!res.ok) throw new Error(await res.text())
}

async function insertWorkoutLog(token, userId, loggedDate, routineName) {
  const lRes = await fetch(`${SUPABASE_URL}/rest/v1/workout_logs`, {
    method: 'POST',
    headers: { ...headers(token), Prefer: 'return=representation' },
    body: JSON.stringify({ user_id: userId, logged_date: loggedDate, routine_name: routineName }),
  })
  if (!lRes.ok) throw new Error(await lRes.text())
  return (await lRes.json())[0].id
}

const ROUTINE_NAMES_FOR_LOG = {
  '김헬스': ['가슴 루틴', '등 루틴', '하체 루틴', '어깨 루틴'],
  '박달리기': ['러너 하체 강화', '러너 코어 루틴', '인터벌 보조 루틴'],
  '이영양': ['전신 루틴 A', '고강도 전신 서킷'],
  '최요가': ['요가 보조 근력 루틴', '코어 & 유연성 루틴', '아침 활성화 루틴'],
}

async function main() {
  console.log('🌱 루틴 & 운동 데이터 시드 시작...\n')

  for (const user of USERS_DATA) {
    console.log(`👤 [${user.nickname}] (${user.email})`)

    let session
    try {
      session = await signIn(user.email, user.password)
      console.log(`   ✓ 로그인`)
    } catch (e) {
      console.log(`   ✗ 로그인 실패: ${e.message}`)
      continue
    }

    const { access_token, user: { id: userId } } = session

    // 루틴 삽입
    const names = ROUTINE_NAMES_FOR_LOG[user.nickname]
    for (const routine of user.routines) {
      try {
        await insertRoutine(access_token, userId, routine)
        console.log(`   ✓ 루틴: "${routine.name}"`)
      } catch (e) {
        console.log(`   ! 루틴 실패: ${e.message}`)
      }
    }

    // 운동 목표 설정
    try {
      await upsertGoal(access_token, userId, 'weekly', user.goals.weekly)
      await upsertGoal(access_token, userId, 'monthly', user.goals.monthly)
      console.log(`   ✓ 목표: 주 ${user.goals.weekly}회 / 월 ${user.goals.monthly}회`)
    } catch (e) {
      console.log(`   ! 목표 설정 실패: ${e.message}`)
    }

    // 운동 기록 삽입
    let logCount = 0
    for (const daysBack of user.logDaysAgo) {
      const dateStr = daysAgo(daysBack)
      const routineName = names[logCount % names.length]
      try {
        await insertWorkoutLog(access_token, userId, dateStr, routineName)
        logCount++
      } catch (e) {
        // 날짜 중복 등 무시
      }
    }
    console.log(`   ✓ 운동 기록 ${logCount}개 추가`)
    console.log()
  }

  console.log('✅ 시드 완료!')
}

main().catch(console.error)
