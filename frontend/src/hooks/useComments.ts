import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Comment } from '../types/comment'

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(nickname)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (data) {
      setComments(data.map(row => ({
        ...row,
        author_nickname: row.profiles?.nickname ?? null,
        profiles: undefined,
      })))
    }
    setLoading(false)
  }, [postId])

  useEffect(() => { fetchComments() }, [fetchComments])

  async function addComment(content: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Error('로그인이 필요합니다.')

    const { error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, content })

    if (!error) await fetchComments()
    return error
  }

  async function deleteComment(id: string) {
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (!error) setComments(prev => prev.filter(c => c.id !== id))
    return error
  }

  return { comments, loading, addComment, deleteComment }
}
