import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePostLikes(postId: string) {
  const [count, setCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [{ count: cnt }, { data: { user } }] = await Promise.all([
        supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId),
        supabase.auth.getUser(),
      ])
      setCount(cnt ?? 0)
      setUserId(user?.id ?? null)
      if (user) {
        const { data } = await supabase
          .from('post_likes')
          .select('user_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()
        setIsLiked(!!data)
      }
    }
    load()
  }, [postId])

  async function toggleLike() {
    if (!userId) return
    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
      setIsLiked(false)
      setCount(prev => prev - 1)
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
      setIsLiked(true)
      setCount(prev => prev + 1)
    }
  }

  return { count, isLiked, toggleLike, isLoggedIn: !!userId }
}
