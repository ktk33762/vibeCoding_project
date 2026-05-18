const SUPABASE_URL = 'https://fzkbikizkobdfzyzairx.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a2Jpa2l6a29iZGZ6eXphaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Njg1MTgsImV4cCI6MjA5NDE0NDUxOH0.f8eN_wJakdNAT2kSSgjkZ7yfp04HydOBriGIMQebwU4'

const DUMMY_USERS = [
  { email: 'kim.fitness@test.com',  password: 'Test1234!' },
  { email: 'park.running@test.com', password: 'Test1234!' },
  { email: 'lee.nutrition@test.com',password: 'Test1234!' },
  { email: 'choi.yoga@test.com',    password: 'Test1234!' },
]

// 운동/건강 관련 Picsum 시드 이미지
const IMAGE_SEEDS = [
  'fitness', 'gym', 'running', 'yoga', 'sport', 'health',
  'workout', 'bench', 'nutrition', 'protein', 'marathon', 'stretch',
]

function imageUrl(seed) {
  return `https://picsum.photos/seed/${seed}/800/500`
}

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

async function getMyPosts(token, userId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/posts?user_id=eq.${userId}&select=id,title&order=created_at.asc`,
    { headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${token}` } }
  )
  return res.json()
}

async function updatePostImage(token, postId, url) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ image_url: url }),
  })
  return res.ok
}

async function main() {
  console.log('🖼  게시글 이미지 추가 시작...\n')

  let seedIndex = 0

  for (const u of DUMMY_USERS) {
    const session = await signIn(u.email, u.password)
    if (!session.access_token) {
      console.log(`✗ 로그인 실패: ${u.email}`)
      continue
    }
    const { access_token, user: { id: userId } } = session

    const posts = await getMyPosts(access_token, userId)
    console.log(`👤 ${u.email} — 게시글 ${posts.length}개`)

    for (const post of posts) {
      const url = imageUrl(IMAGE_SEEDS[seedIndex % IMAGE_SEEDS.length])
      seedIndex++
      const ok = await updatePostImage(access_token, post.id, url)
      console.log(`   ${ok ? '✓' : '✗'} "${post.title}"`)
      console.log(`     ${url}`)
    }
    console.log()
  }

  console.log('✅ 완료!')
}

main().catch(console.error)
