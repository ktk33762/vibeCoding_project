import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { usePosts } from '../hooks/usePosts'
import '../styles/board.css'

export default function PostWritePage() {
  const navigate = useNavigate()
  const { createPost } = usePosts()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지는 5MB 이하만 업로드 가능합니다.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  function handleRemoveImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    setError('')

    const err = await createPost(title.trim(), content.trim(), imageFile)
    if (err) {
      setError(err.message)
      setSubmitting(false)
    } else {
      navigate('/board')
    }
  }

  return (
    <div className="board-form-page">
      <Header />

      <div className="board-form-content">
        <h2>글쓰기</h2>

        <form className="board-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="제목을 입력하세요 (최대 100자)"
            maxLength={100}
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />
          <textarea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />

          <div className="board-image-upload">
            {imagePreview ? (
              <div className="board-image-preview-wrap">
                <img src={imagePreview} alt="미리보기" className="board-image-preview" />
                <button type="button" className="board-image-remove" onClick={handleRemoveImage}>✕ 이미지 제거</button>
              </div>
            ) : (
              <button type="button" className="board-image-btn" onClick={() => fileInputRef.current?.click()}>
                + 이미지 첨부 (선택, 최대 5MB)
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </div>

          {error && <p className="board-error">{error}</p>}
          <div className="board-form-actions">
            <button type="button" className="btn-back" onClick={() => navigate('/board')}>취소</button>
            <button type="submit" className="btn-primary" disabled={submitting || !title.trim() || !content.trim()}>
              {submitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
