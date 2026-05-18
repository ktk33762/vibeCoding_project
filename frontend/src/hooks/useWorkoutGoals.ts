import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { WorkoutGoal } from '../types/workout'

export function useWorkoutGoals() {
  const [goals, setGoals] = useState<WorkoutGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('workout_goals')
      .select('*')

    if (error) setError(error.message)
    else setGoals(data as WorkoutGoal[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  async function upsertGoal(periodType: 'weekly' | 'monthly', targetCount: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Error('로그인이 필요합니다.')

    const { data, error } = await supabase
      .from('workout_goals')
      .upsert(
        { user_id: user.id, period_type: periodType, target_count: targetCount },
        { onConflict: 'user_id,period_type' }
      )
      .select()
      .single()

    if (!error && data) {
      setGoals(prev => {
        const filtered = prev.filter(g => g.period_type !== periodType)
        return [...filtered, data as WorkoutGoal]
      })
    }
    return error
  }

  const weeklyGoal = goals.find(g => g.period_type === 'weekly') ?? null
  const monthlyGoal = goals.find(g => g.period_type === 'monthly') ?? null

  return { goals, loading, error, weeklyGoal, monthlyGoal, upsertGoal }
}
