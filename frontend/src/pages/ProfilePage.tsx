import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import { useProfile } from '../hooks/useProfile'
import { useFollows } from '../hooks/useFollows'
import FollowListModal from '../components/FollowListModal'
import type { Post } from '../types/post'
import type { RoutineTemplate } from '../types/workout'
import '../styles/social.css'

function WorkoutStatBar({ label, count, goal }: { label: string; count: number; goal: number | null }) {
  const pct = goal ? Math.min(100, Math.round((count / goal) * 100)) : null
  return (
    <div className="workout-stat-card">
      <div className="workout-stat-header">
        <span className="workout-stat-label">{label}</span>
        <span className="workout-stat-count">
          {count}회{goal ? ` / ${goal}회` : ''}
        </span>
      </div>
      {pct !== null && (
        <div className="workout-stat-bar-bg">
          <div className="workout-stat-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
      {pct !== null && (
        <span className="workout-stat-pct">{pct}% 달성</span>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { profile, loading: pLoading, error: pError, fetchProfile, updateProfile } = useProfile()
  const { isFollowing, followerCount, followingCount, loading: fLoading, fetchStats, follow, unfollow } = useFollows()

  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(false)

  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null)
  const [monthlyGoal, setMonthlyGoal] = useState<number | null>(null)
  const [weekCount, setWeekCount] = useState(0)
  const [monthCount, setMonthCount] = useState(0)

  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null)

  const [routines, setRoutines] = useState<RoutineTemplate[]>([])
  const [routinesLoading, setRoutinesLoading] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set())

  const [editing, setEditing] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null))
  }, [])

  useEffect(() => {
    if (!userId) return
    fetchProfile(userId)
    fetchStats(userId)
    fetchUserPosts(userId)
    fetchWorkoutData(userId)
    fetchUserRoutines(userId)
  }, [userId])

  async function fetchWorkoutData(uid: string) {
    const now = new Date()
    const day = now.getDay()
    const mon = new Date(now)
    mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    const weekStart = mon.toISOString().slice(0, 10)
    const weekEnd = new Date(mon.getTime() + 6 * 86400000).toISOString().slice(0, 10)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

    const [goalsRes, weekRes, monthRes] = await Promise.all([
      supabase.from('workout_goals').select('period_type, target_count').eq('user_id', uid),
      supabase.from('workout_logs').select('id', { count: 'exact', head: true })
        .eq('user_id', uid).gte('logged_date', weekStart).lte('logged_date', weekEnd),
      supabase.from('workout_logs').select('id', { count: 'exact', head: true })
        .eq('user_id', uid).gte('logged_date', monthStart).lte('logged_date', monthEnd),
    ])

    const goals = goalsRes.data ?? []
    setWeeklyGoal(goals.find(g => g.period_type === 'weekly')?.target_count ?? null)
    setMonthlyGoal(goals.find(g => g.period_type === 'monthly')?.target_count ?? null)
    setWeekCount(weekRes.count ?? 0)
    setMonthCount(monthRes.count ?? 0)
  }

  async function fetchUserRoutines(uid: string) {
    setRoutinesLoading(true)
    const { data } = await supabase
      .from('routine_templates')
      .select('*, routine_template_items(*)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    setRoutines(
      (data ?? []).map((r: any) => ({
        ...r,
        routine_template_items: [...r.routine_template_items].sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        ),
      })) as RoutineTemplate[]
    )
    setRoutinesLoading(false)
  }

  async function handleImportRoutine(routine: RoutineTemplate) {
    setImportingId(routine.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setImportingId(null); return }

    const { data: template, error: tErr } = await supabase
      .from('routine_templates')
      .insert({ name: routine.name, user_id: user.id })
      .select()
      .single()

    if (tErr || !template) {
      alert('가져오기에 실패했습니다.')
      setImportingId(null)
      return
    }

    if (routine.routine_template_items.length > 0) {
      await supabase.from('routine_template_items').insert(
        routine.routine_template_items.map((item, idx) => ({
          template_id: template.id,
          name: item.name,
          sets: item.sets,
          weight_kg: item.weight_kg,
          reps: item.reps,
          sort_order: idx,
        }))
      )
    }

    setImportedIds(prev => new Set(prev).add(routine.id))
    setImportingId(null)
  }

  async function fetchUserPosts(uid: string) {
    setPostsLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*, post_likes(count)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    setPosts(
      (data ?? []).map((row: any) => ({
        ...row,
        likes_count: row.post_likes?.[0]?.count ?? 0,
        post_likes: undefined,
      })) as Post[]
    )
    setPostsLoading(false)
  }

  const isOwnProfile = !!currentUserId && currentUserId === userId

  function startEdit() {
    setEditNickname(profile?.nickname ?? '')
    setEditBio(profile?.bio ?? '')
    setSaveError('')
    setEditing(true)
  }

  async function handleSave() {
    if (!editNickname.trim()) return
    setSaving(true)
    setSaveError('')
    const err = await updateProfile({ nickname: editNickname.trim(), bio: editBio.trim() || undefined })
    if (err) setSaveError(err.message)
    else setEditing(false)
    setSaving(false)
  }

  async function handleToggleFollow() {
    if (!userId) return
    if (isFollowing) await unfollow(userId)
    else await follow(userId)
  }

  const avatarLetter = profile?.nickname?.charAt(0).toUpperCase() ?? '?'

  if (pLoading) {
    return (
      <div className="social-page">
        <Header />
        <p className="social-empty">불러오는 중...</p>
      </div>
    )
  }

  if (pError || !profile) {
    return (
      <div className="social-page">
        <Header />
        <p className="social-empty">프로필을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="social-page">
      <Header />
      <main className="social-content">

        {/* 프로필 카드 */}
        <div className="profile-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{avatarLetter}</div>
          </div>

          {editing ? (
            <div className="profile-edit-form">
              <input
                value={editNickname}
                onChange={e => setEditNickname(e.target.value)}
                placeholder="닉네임"
                maxLength={30}
              />
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                placeholder="소개글을 입력하세요"
                rows={3}
                maxLength={200}
              />
              {saveError && <p className="profile-error">{saveError}</p>}
              <div className="profile-edit-actions">
                <button className="btn-social-primary" onClick={handleSave} disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button className="btn-social-secondary" onClick={() => setEditing(false)}>취소</button>
              </div>
            </div>
          ) : (
            <div className="profile-info">
              <h1 className="profile-nickname">{profile.nickname}</h1>
              {profile.bio
                ? <p className="profile-bio">{profile.bio}</p>
                : isOwnProfile && <p className="profile-bio-empty">소개글을 추가해보세요</p>
              }
            </div>
          )}

          <div className="profile-stats">
            <button className="stat-item stat-item-btn" onClick={() => setFollowModal('followers')}>
              <span className="stat-num">{followerCount}</span>
              <span className="stat-label">팔로워</span>
            </button>
            <div className="stat-divider" />
            <button className="stat-item stat-item-btn" onClick={() => setFollowModal('following')}>
              <span className="stat-num">{followingCount}</span>
              <span className="stat-label">팔로잉</span>
            </button>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">{posts.length}</span>
              <span className="stat-label">게시글</span>
            </div>
          </div>

          {isOwnProfile && !editing && (
            <button className="btn-social-secondary" onClick={startEdit}>프로필 편집</button>
          )}
          {!isOwnProfile && currentUserId && (
            <button
              className={isFollowing ? 'btn-social-secondary' : 'btn-social-primary'}
              onClick={handleToggleFollow}
              disabled={fLoading}
            >
              {isFollowing ? '팔로잉 ✓' : '팔로우'}
            </button>
          )}
        </div>

        {/* 운동 현황 */}
        {(weekCount > 0 || monthCount > 0 || weeklyGoal || monthlyGoal) && (
          <div className="profile-workout-section">
            <h2 className="profile-posts-title">운동 현황</h2>
            <div className="workout-stat-row">
              <WorkoutStatBar label="이번 주" count={weekCount} goal={weeklyGoal} />
              <WorkoutStatBar label="이번 달" count={monthCount} goal={monthlyGoal} />
            </div>
          </div>
        )}

        {/* 루틴 목록 */}
        {(routinesLoading || routines.length > 0) && (
          <div className="profile-routines-section">
            <h2 className="profile-posts-title">루틴 ({routines.length})</h2>
            {routinesLoading && <p className="social-empty">불러오는 중...</p>}
            <div className="profile-routine-list">
              {routines.map(routine => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  canImport={!isOwnProfile && !!currentUserId}
                  importing={importingId === routine.id}
                  imported={importedIds.has(routine.id)}
                  onImport={() => handleImportRoutine(routine)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 게시글 목록 */}
        <div className="profile-posts-section">
          <h2 className="profile-posts-title">게시글 ({posts.length})</h2>
          {postsLoading && <p className="social-empty">불러오는 중...</p>}
          {!postsLoading && posts.length === 0 && (
            <p className="social-empty">아직 작성한 게시글이 없습니다.</p>
          )}
          <div className="profile-post-list">
            {posts.map(post => (
              <Link key={post.id} to={`/board/${post.id}`} className="profile-post-card">
                <div className="profile-post-body">
                  <p className="profile-post-title">{post.title}</p>
                  <div className="profile-post-meta">
                    <span className="profile-post-date">{formatDate(post.created_at)}</span>
                    {(post.likes_count ?? 0) > 0 && (
                      <span className="profile-post-likes">♥ {post.likes_count}</span>
                    )}
                  </div>
                </div>
                {post.image_url && (
                  <img src={post.image_url} alt="" className="profile-post-thumb" />
                )}
              </Link>
            ))}
          </div>
        </div>

      </main>

      {followModal && userId && (
        <FollowListModal
          userId={userId}
          type={followModal}
          onClose={() => setFollowModal(null)}
        />
      )}
    </div>
  )
}

interface RoutineCardProps {
  routine: RoutineTemplate
  canImport: boolean
  importing: boolean
  imported: boolean
  onImport: () => void
}

function RoutineCard({ routine, canImport, importing, imported, onImport }: RoutineCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="profile-routine-card">
      <div className="profile-routine-header">
        <button className="profile-routine-toggle" onClick={() => setOpen(v => !v)}>
          <span className="profile-routine-name">{routine.name}</span>
          <span className="profile-routine-count">{routine.routine_template_items.length}종목</span>
          <span className="profile-routine-arrow">{open ? '▲' : '▼'}</span>
        </button>
        {canImport && (
          <button
            className={`btn-routine-import${imported ? ' imported' : ''}`}
            onClick={onImport}
            disabled={importing || imported}
          >
            {imported ? '추가됨 ✓' : importing ? '추가 중...' : '내 루틴에 추가'}
          </button>
        )}
      </div>
      {open && (
        <ul className="profile-routine-items">
          {routine.routine_template_items.map(item => (
            <li key={item.id} className="profile-routine-item">
              <span className="profile-routine-item-name">{item.name}</span>
              <div className="profile-routine-item-badges">
                {item.weight_kg !== null && <span className="profile-routine-badge">{item.weight_kg}kg</span>}
                {item.reps !== null && <span className="profile-routine-badge">{item.reps}회</span>}
                <span className="profile-routine-badge">{item.sets}세트</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
