import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { WorkoutLog } from '../types/workout'

function getWeekRange(): { start: string; end: string } {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return {
    start: mon.toISOString().slice(0, 10),
    end: sun.toISOString().slice(0, 10),
  }
}

function getMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  return { start, end }
}

export function useWorkoutLogs() {
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { start } = getMonthRange()
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_date', start)
      .order('logged_date', { ascending: false })

    if (error) setError(error.message)
    else setLogs(data as WorkoutLog[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  async function logWorkout(
    routineName?: string,
    items?: { exercise_name: string; sets: number | null; completed_sets: number | null; weight_kg: number | null; reps: number | null }[],
    note?: string,
  ) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Error('로그인이 필요합니다.')

    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('workout_logs')
      .insert({ user_id: user.id, logged_date: today, routine_name: routineName ?? null, note: note ?? null })
      .select()
      .single()

    if (error || !data) return error

    if (items && items.length > 0) {
      const { error: itemsError } = await supabase.from('workout_log_items').insert(
        items.map((item, idx) => ({ ...item, log_id: data.id, user_id: user.id, sort_order: idx }))
      )
      if (itemsError) console.error('workout_log_items insert error:', itemsError)
    }

    setLogs(prev => [data as WorkoutLog, ...prev])
    return null
  }

  async function deleteLog(id: string) {
    const { error } = await supabase
      .from('workout_logs')
      .delete()
      .eq('id', id)

    if (!error) {
      setLogs(prev => prev.filter(l => l.id !== id))
    }
    return error
  }

  const { start: weekStart, end: weekEnd } = getWeekRange()
  const { start: monthStart } = getMonthRange()

  const thisWeekLogs = logs.filter(l => l.logged_date >= weekStart && l.logged_date <= weekEnd)
  const thisMonthLogs = logs.filter(l => l.logged_date >= monthStart)

  return { logs, loading, error, thisWeekLogs, thisMonthLogs, logWorkout, deleteLog }
}
