export interface RoutineTemplateItem {
  id: string
  template_id: string
  name: string
  sets: number
  weight_kg: number | null
  reps: number | null
  sort_order: number
}

export interface RoutineTemplate {
  id: string
  user_id: string
  name: string
  created_at: string
  routine_template_items: RoutineTemplateItem[]
}

export interface WorkoutGoal {
  id: string
  user_id: string
  period_type: 'weekly' | 'monthly'
  target_count: number
  created_at: string
}

export interface WorkoutLogItem {
  id: string
  log_id: string
  exercise_name: string
  sets: number | null
  completed_sets: number | null
  weight_kg: number | null
  reps: number | null
  sort_order: number
}

export interface WorkoutLog {
  id: string
  user_id: string
  logged_date: string
  note: string | null
  routine_name: string | null
  created_at: string
}
