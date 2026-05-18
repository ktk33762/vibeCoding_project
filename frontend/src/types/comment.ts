export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  author_nickname: string | null
}
