import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import { fetchPostById } from '../hooks/usePosts'
import { useComments } from '../hooks/useComments'
import { usePostLikes } from '../hooks/usePostLikes'
import type { Post } from '../types/post'
import '../styles/board.css'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  const { comments, addComment, deleteComment } = useComments(id ?? '')
  const { count: likeCount, isLiked, toggleLike, isLoggedIn } = usePostLikes(id ?? '')

  useEffect(() => {
    if (!id) return
    async function load() {
      const [postData, { data: { user } }] = await Promise.all([
        fetchPostById(id!),
        supabase.auth.getUser(),
      ])
      setPost(postData)
      setCurrentUserId(user?.id ?? null)
      setIsOwner(!!postData && !!user && postData.user_id === user.id)
      setLoading(false)
    }
    load()
  }, [id])

  function handleEdit() {
    if (!post) return
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!post || !editTitle.trim() || !editContent.trim()) return
    setSubmitting(true)
    setError('')

    const { data, error } = await supabase
      .from('posts')
      .update({ title: editTitle.trim(), content: editContent.trim() })
      .eq('id', post.id)
      .select('*, profiles(nickname)')
      .single()

    if (error) {
      setError(error.message)
    } else {
      setPost({ ...data, author_nickname: data.profiles?.nickname ?? null, profiles: undefined })
      setEditing(false)
    }
    setSubmitting(false)
  }

  async function handleDelete() {
    if (!post || !window.confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (!error) navigate('/board')
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    setCommentSubmitting(true)
    await addComment(commentText.trim())
    setCommentText('')
    setCommentSubmitting(false)
  }

  if (loading) return (
    <div className="board-page">
      <Header />
      <div className="board-content"><p className="board-empty">불러오는 중...</p></div>
    </div>
  )

  if (!post) return (
    <div className="board-page">
      <Header />
      <div className="board-content"><p className="board-empty">게시글을 찾을 수 없습니다.</p></div>
    </div>
  )

  return (
    <div className="board-page">
      <Header />

      <div className="board-content">
        <button className="btn-back" onClick={() => navigate('/board')} style={{ marginBottom: 16 }}>
          ← 목록으로
        </button>

        {editing ? (
          <form className="board-form" onSubmit={handleSave}>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              maxLength={100}
              required
              autoFocus
            />
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              required
            />
            {error && <p className="board-error">{error}</p>}
            <div className="board-form-actions">
              <button type="button" className="btn-back" onClick={() => setEditing(false)}>취소</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        ) : (
          <div className="post-detail">
            <div className="post-detail-header">
              <h1 className="post-detail-title">{post.title}</h1>
              <div className="post-detail-meta">
                <span>{post.author_nickname ?? '알 수 없음'}</span>
                <span>{formatDate(post.created_at)}</span>
                {post.updated_at !== post.created_at && <span>(수정됨)</span>}
              </div>
            </div>

            {post.image_url && (
              <img src={post.image_url} alt="게시글 이미지" className="post-detail-image" />
            )}
            <p className="post-detail-content">{post.content}</p>

            {/* 좋아요 */}
            <div className="post-like-row">
              <button
                className={`btn-like ${isLiked ? 'liked' : ''}`}
                onClick={toggleLike}
                disabled={!isLoggedIn}
                title={isLoggedIn ? undefined : '로그인이 필요합니다'}
              >
                {isLiked ? '♥' : '♡'} {likeCount}
              </button>
            </div>

            {isOwner && (
              <div className="post-detail-actions">
                <button className="btn-back" onClick={handleEdit}>수정</button>
                <button className="btn-icon danger" onClick={handleDelete}>삭제</button>
              </div>
            )}
          </div>
        )}

        {/* 댓글 섹션 */}
        <div className="comment-section">
          <h3 className="comment-section-title">댓글 {comments.length}개</h3>

          <div className="comment-list">
            {comments.length === 0 && (
              <p className="comment-empty">첫 댓글을 작성해보세요.</p>
            )}
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <Link to={`/profile/${comment.user_id}`} className="comment-author">
                    {comment.author_nickname ?? '알 수 없음'}
                  </Link>
                  <span className="comment-date">{formatDateShort(comment.created_at)}</span>
                  {currentUserId === comment.user_id && (
                    <button
                      className="comment-delete"
                      onClick={() => deleteComment(comment.id)}
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
          </div>

          {isLoggedIn && (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                ref={commentInputRef}
                className="comment-input"
                placeholder="댓글을 입력하세요"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
              />
              <div className="comment-form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={commentSubmitting || !commentText.trim()}
                >
                  {commentSubmitting ? '등록 중...' : '댓글 등록'}
                </button>
              </div>
            </form>
          )}
          {!isLoggedIn && (
            <p className="comment-login-hint">댓글을 작성하려면 <Link to="/login">로그인</Link>하세요.</p>
          )}
        </div>
      </div>
    </div>
  )
}
