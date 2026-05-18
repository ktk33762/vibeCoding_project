export interface TodoItem {
  id: string
  todo_id: string
  content: string
  is_checked: boolean
  sort_order: number
  created_at: string
  sets: number | null
  completed_sets: number
  weight_kg: number | null
  reps: number | null
}

export interface Todo {
  id: string
  user_id: string
  title: string
  memo: string | null
  is_completed: boolean
  created_at: string
  updated_at: string
  todo_items: TodoItem[]
}
