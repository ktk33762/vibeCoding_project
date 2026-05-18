import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import { useFollows } from '../hooks/useFollows'
import type { Post } from '../types/post'
import '../styles/board.css'

type Tab = 'all' | 'following'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function mapPost(row: any): Post {
  return {
    ...row,
    author_nickname: row.profiles?.nickname ?? null,
    likes_count: row.post_likes?.[0]?.count ?? 0,
    profiles: undefined,
    post_likes: undefined,
  }
}

export default function BoardPage() {
  const navigate = useNavigate()
  const { getFollowingIds } = useFollows()

  const [tab, setTab] = useState<Tab>('all')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [followingEmpty, setFollowingEmpty] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user))
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    setFollowingEmpty(false)
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(nickname), post_likes(count)')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setPosts((data as any[]).map(mapPost))
    setLoading(false)
  }, [])

  const fetchFollowing = useCallback(async () => {
    setLoading(true)
    setError(null)
    setFollowingEmpty(false)
    const ids = await getFollowingIds()
    if (ids.length === 0) {
      setPosts([])
      setFollowingEmpty(true)
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(nickname), post_likes(count)')
      .in('user_id', ids)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setPosts((data as any[]).map(mapPost))
    setLoading(false)
  }, [getFollowingIds])

  useEffect(() => {
    if (tab === 'all') fetchAll()
    else fetchFollowing()
  }, [tab, fetchAll, fetchFollowing])

  return (
    <div className="board-page">
      <Header />

      <div className="board-content">
        {/* 탭 */}
        <div className="board-tabs">
          <button
            className={`board-tab ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            전체
          </button>
          <button
            className={`board-tab ${tab === 'following' ? 'active' : ''}`}
            onClick={() => setTab('following')}
          >
            팔로잉
          </button>
        </div>

        {/* 글쓰기 버튼 */}
        <div className="board-title-row">
          <span />
          <button className="btn-primary" onClick={() => navigate('/board/new')}>글쓰기</button>
        </div>

        {loading && <p className="board-empty">불러오는 중...</p>}
        {error && <p className="board-error">{error}</p>}

        {/* 팔로잉 탭 - 비로그인 */}
        {!loading && tab === 'following' && !isLoggedIn && (
          <p className="board-empty">
            팔로잉 피드를 보려면 <Link to="/login" style={{ color: '#4f46e5' }}>로그인</Link>하세요.
          </p>
        )}

        {/* 팔로잉 탭 - 팔로잉 없음 */}
        {!loading && tab === 'following' && isLoggedIn && followingEmpty && (
          <div className="board-empty">
            <p>아직 팔로잉한 사람이 없습니다.</p>
            <p style={{ fontSize: '0.875rem', marginTop: 6 }}>
              게시글 작성자를 클릭해 프로필에서 팔로우해 보세요.
            </p>
          </div>
        )}

        {/* 게시글 없음 */}
        {!loading && !followingEmpty && posts.length === 0 && (
          <p className="board-empty">
            {tab === 'all' ? '아직 게시글이 없습니다. 첫 글을 작성해보세요.' : '팔로잉한 사람들의 게시글이 없습니다.'}
          </p>
        )}

        {!loading && posts.length > 0 && (
          <div className="board-list">
            {posts.map(post => (
              <div
                key={post.id}
                className="board-list-item"
                onClick={() => navigate(`/board/${post.id}`)}
              >
                <div className="board-item-body">
                  <p className="board-item-title">{post.title}</p>
                  <div className="board-item-meta">
                    <Link
                      to={`/profile/${post.user_id}`}
                      className="board-author-link"
                      onClick={e => e.stopPropagation()}
                    >
                      {post.author_nickname ?? '알 수 없음'}
                    </Link>
                    <span>{formatDate(post.created_at)}</span>
                    {(post.likes_count ?? 0) > 0 && (
                      <span className="board-item-likes">♥ {post.likes_count}</span>
                    )}
                  </div>
                </div>
                {post.image_url && (
                  <img src={post.image_url} alt="" className="board-item-thumb" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
