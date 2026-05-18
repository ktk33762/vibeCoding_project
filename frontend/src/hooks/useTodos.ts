import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Todo, TodoItem } from '../types/todo'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('todos')
      .select('*, todo_items(*)')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      const sorted = (data as Todo[]).map(todo => ({
        ...todo,
        todo_items: [...todo.todo_items].sort((a, b) => a.sort_order - b.sort_order),
      }))
      setTodos(sorted)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  async function createTodo(title: string, memo?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Error('로그인이 필요합니다.')

    const { data, error } = await supabase
      .from('todos')
      .insert({ title, memo: memo || null, user_id: user.id })
      .select('*, todo_items(*)')
      .single()

    if (!error && data) {
      setTodos(prev => [data as Todo, ...prev])
    }
    return error
  }

  async function updateTodo(id: string, updates: Partial<Pick<Todo, 'title' | 'memo' | 'is_completed'>>) {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
    }
    return error
  }

  async function deleteTodo(id: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (!error) {
      setTodos(prev => prev.filter(t => t.id !== id))
    }
    return error
  }

  async function createTodoItem(todoId: string, content: string) {
    const existing = todos.find(t => t.id === todoId)?.todo_items ?? []
    const nextOrder = existing.length > 0
      ? Math.max(...existing.map(i => i.sort_order)) + 1
      : 0

    const { data, error } = await supabase
      .from('todo_items')
      .insert({ todo_id: todoId, content, sort_order: nextOrder })
      .select()
      .single()

    if (!error && data) {
      setTodos(prev => prev.map(t =>
        t.id === todoId
          ? { ...t, todo_items: [...t.todo_items, data as TodoItem] }
          : t
      ))
    }
    return error
  }

  async function updateTodoItem(id: string, todoId: string, updates: Partial<Pick<TodoItem, 'content' | 'is_checked'>>) {
    const { data, error } = await supabase
      .from('todo_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setTodos(prev => prev.map(t =>
        t.id === todoId
          ? { ...t, todo_items: t.todo_items.map(item => item.id === id ? { ...item, ...data } : item) }
          : t
      ))
    }
    return error
  }

  async function deleteTodoItem(id: string, todoId: string) {
    const { error } = await supabase
      .from('todo_items')
      .delete()
      .eq('id', id)

    if (!error) {
      setTodos(prev => prev.map(t =>
        t.id === todoId
          ? { ...t, todo_items: t.todo_items.filter(item => item.id !== id) }
          : t
      ))
    }
    return error
  }

  async function incrementTodoItemSet(id: string, todoId: string) {
    const todo = todos.find(t => t.id === todoId)
    const item = todo?.todo_items.find(i => i.id === id)
    if (!item || item.sets === null || item.is_checked) return

    const nextCompleted = item.completed_sets + 1
    const allDone = nextCompleted >= item.sets

    const { data, error } = await supabase
      .from('todo_items')
      .update({ completed_sets: nextCompleted, is_checked: allDone })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setTodos(prev => prev.map(t =>
        t.id === todoId
          ? { ...t, todo_items: t.todo_items.map(i => i.id === id ? { ...i, ...data } : i) }
          : t
      ))
    }
    return error
  }

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    createTodoItem,
    updateTodoItem,
    deleteTodoItem,
    incrementTodoItemSet,
  }
}
