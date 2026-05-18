import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import { useFollows } from '../hooks/useFollows'
import type { Post } from '../types/post'
import '../styles/social.css'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default function FeedPage() {
  const { getFollowingIds } = useFollows()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { fetchFeed() }, [])

  async function fetchFeed() {
    setLoading(true)
    setError(null)
    const followingIds = await getFollowingIds()

    if (followingIds.length === 0) {
      setPosts([])
      setIsEmpty(true)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(nickname)')
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      const mapped = (data as any[]).map(row => ({
        ...row,
        author_nickname: row.profiles?.nickname ?? null,
        profiles: undefined,
      })) as Post[]
      setPosts(mapped)
      setIsEmpty(false)
    }
    setLoading(false)
  }

  return (
    <div className="social-page">
      <Header />
      <main className="social-content">
        <h1 className="social-heading">팔로잉 피드</h1>

        {loading && <p className="social-empty">불러오는 중...</p>}
        {error && <p className="social-error">{error}</p>}

        {!loading && isEmpty && (
          <div className="feed-empty-box">
            <p className="feed-empty-title">아직 팔로잉한 사람이 없습니다.</p>
            <p className="feed-empty-desc">
              <Link to="/board">게시판</Link>에서 글 작성자를 클릭해 팔로우해 보세요.
            </p>
          </div>
        )}

        {!loading && !isEmpty && posts.length === 0 && (
          <p className="social-empty">팔로잉한 사람들의 게시글이 아직 없습니다.</p>
        )}

        <div className="feed-list">
          {posts.map(post => (
            <div key={post.id} className="feed-card">
              <Link to={`/profile/${post.user_id}`} className="feed-author-row">
                <div className="feed-avatar">{post.author_nickname?.charAt(0).toUpperCase() ?? '?'}</div>
                <span className="feed-nickname">{post.author_nickname ?? '알 수 없음'}</span>
              </Link>
              <Link to={`/board/${post.id}`} className="feed-post-body">
                <p className="feed-post-title">{post.title}</p>
                <p className="feed-post-preview">
                  {post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content}
                </p>
                <span className="feed-post-date">{formatDate(post.created_at)}</span>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
