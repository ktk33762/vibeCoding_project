import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/social'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) setError(error.message)
    else setProfile(data as Profile)
    setLoading(false)
  }, [])

  async function updateProfile(updates: { nickname?: string; bio?: string }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Error('로그인이 필요합니다.')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) setProfile(data as Profile)
    return error
  }

  return { profile, loading, error, fetchProfile, updateProfile }
}
