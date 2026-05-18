import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFollows() {
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchStats = useCallback(async (targetUserId: string) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const [followerRes, followingRes] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId),
    ])

    setFollowerCount(followerRes.count ?? 0)
    setFollowingCount(followingRes.count ?? 0)

    if (user && user.id !== targetUserId) {
      const { data } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle()
      setIsFollowing(!!data)
    } else {
      setIsFollowing(false)
    }

    setLoading(false)
  }, [])

  async function follow(targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: targetUserId })
    if (!error) {
      setIsFollowing(true)
      setFollowerCount(prev => prev + 1)
    }
  }

  async function unfollow(targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
    if (!error) {
      setIsFollowing(false)
      setFollowerCount(prev => prev - 1)
    }
  }

  const getFollowingIds = useCallback(async (): Promise<string[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    return (data ?? []).map((r: { following_id: string }) => r.following_id)
  }, [])

  return { isFollowing, followerCount, followingCount, loading, fetchStats, follow, unfollow, getFollowingIds }
}
