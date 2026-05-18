import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { RoutineTemplate } from '../types/workout'

export function useRoutines() {
  const [routines, setRoutines] = useState<RoutineTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoutines = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data, error } = await supabase
      .from('routine_templates')
      .select('*, routine_template_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      const sorted = (data as RoutineTemplate[]).map(r => ({
        ...r,
        routine_template_items: [...r.routine_template_items].sort((a, b) => a.sort_order - b.sort_order),
      }))
      setRoutines(sorted)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchRoutines() }, [fetchRoutines])

  async function createRoutine(name: string, items: { name: string; sets: number; weight_kg: number | null; reps: number | null }[]) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Error('로그인이 필요합니다.')

    const { data: template, error: tErr } = await supabase
      .from('routine_templates')
      .insert({ name, user_id: user.id })
      .select()
      .single()

    if (tErr || !template) return tErr

    if (items.length > 0) {
      const { error: iErr } = await supabase
        .from('routine_template_items')
        .insert(items.map((item, idx) => ({
          template_id: template.id,
          name: item.name,
          sets: item.sets,
          weight_kg: item.weight_kg,
          reps: item.reps,
          sort_order: idx,
        })))
      if (iErr) return iErr
    }

    await fetchRoutines()
    return null
  }

  async function updateRoutineItems(routineId: string, items: RoutineTemplateItem[]) {
    const results = await Promise.all(
      items.map(item =>
        supabase.from('routine_template_items')
          .update({ sets: item.sets, weight_kg: item.weight_kg, reps: item.reps })
          .eq('id', item.id)
      )
    )
    const err = results.find(r => r.error)?.error ?? null
    if (!err) {
      setRoutines(prev => prev.map(r =>
        r.id === routineId ? { ...r, routine_template_items: items } : r
      ))
    }
    return err
  }

  async function deleteRoutine(id: string) {
    const { error } = await supabase
      .from('routine_templates')
      .delete()
      .eq('id', id)

    if (!error) {
      setRoutines(prev => prev.filter(r => r.id !== id))
    }
    return error
  }

  async function loadRoutineToTodo(routineId: string): Promise<Error | null> {
    const routine = routines.find(r => r.id === routineId)
    if (!routine) return new Error('루틴을 찾을 수 없습니다.')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Error('로그인이 필요합니다.')

    const { data: todo, error: tErr } = await supabase
      .from('todos')
      .insert({ title: routine.name, user_id: user.id })
      .select()
      .single()

    if (tErr || !todo) return tErr as Error

    if (routine.routine_template_items.length > 0) {
      const { error: iErr } = await supabase
        .from('todo_items')
        .insert(routine.routine_template_items.map(item => ({
          todo_id: todo.id,
          content: item.name,
          sets: item.sets,
          completed_sets: 0,
          weight_kg: item.weight_kg,
          reps: item.reps,
          sort_order: item.sort_order,
        })))
      if (iErr) return iErr as Error
    }

    return null
  }

  return { routines, loading, error, fetchRoutines, createRoutine, updateRoutineItems, deleteRoutine, loadRoutineToTodo }
}
