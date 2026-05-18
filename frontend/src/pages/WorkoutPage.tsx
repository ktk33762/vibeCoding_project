import { useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import Header from '../components/Header'
import WorkoutTimer from '../components/WorkoutTimer'
import { useRoutines } from '../hooks/useRoutines'
import { useWorkoutGoals } from '../hooks/useWorkoutGoals'
import { useWorkoutLogs } from '../hooks/useWorkoutLogs'
import { useWorkoutStats, type WorkoutStatsData } from '../hooks/useWorkoutStats'
import { useTodos } from '../hooks/useTodos'
import type { Todo, TodoItem } from '../types/todo'
import type { WorkoutLog, WorkoutLogItem, RoutineTemplate, RoutineTemplateItem } from '../types/workout'
import '../styles/workout.css'

interface RoutineItemDraft {
  name: string
  sets: number
  weight_kg: string
  reps: string
}

export default function WorkoutPage() {
  const { routines, loading: rLoading, createRoutine, updateRoutineItems, deleteRoutine, loadRoutineToTodo } = useRoutines()
  const { data: statsData, loading: statsLoading } = useWorkoutStats()
  const { weeklyGoal, monthlyGoal, upsertGoal } = useWorkoutGoals()
  const { thisWeekLogs, thisMonthLogs, logWorkout, deleteLog, loading: lLoading } = useWorkoutLogs()
  const { todos, loading: tLoading, fetchTodos, incrementTodoItemSet, updateTodo, deleteTodo } = useTodos()

  const [showRoutineForm, setShowRoutineForm] = useState(false)
  const [routineName, setRoutineName] = useState('')
  const [routineItems, setRoutineItems] = useState<RoutineItemDraft[]>([{ name: '', sets: 3, weight_kg: '', reps: '' }])
  const [rCreating, setRCreating] = useState(false)
  const [rError, setRError] = useState('')

  const [editingGoal, setEditingGoal] = useState<'weekly' | 'monthly' | null>(null)
  const [goalInput, setGoalInput] = useState('')

  const [logging, setLogging] = useState(false)
  const [loadingRoutineId, setLoadingRoutineId] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const loggedToday = thisWeekLogs.some(l => l.logged_date === today)

  // 세트 항목이 있는 Todo - 진행 중 / 완료 분리
  const activeTodos = todos.filter(
    todo => !todo.is_completed && todo.todo_items.some(item => item.sets !== null)
  )
  const completedWorkoutTodos = todos.filter(
    todo => todo.is_completed && todo.todo_items.some(item => item.sets !== null)
  )
  const hasCompletedWorkout = completedWorkoutTodos.length > 0

  async function handleLogWorkout() {
    setLogging(true)
    const routineNames = completedWorkoutTodos.map(t => t.title).join(', ')
    const items = completedWorkoutTodos.flatMap(todo =>
      todo.todo_items
        .filter(item => item.sets !== null)
        .map(item => ({
          exercise_name: item.content,
          sets: item.sets,
          completed_sets: item.completed_sets,
          weight_kg: item.weight_kg,
          reps: item.reps,
        }))
    )
    const err = await logWorkout(routineNames || undefined, items)
    if (err) alert(`오류: ${err.message}`)
    setLogging(false)
  }

  async function handleLoadRoutine(routineId: string, name: string) {
    setLoadingRoutineId(routineId)
    const err = await loadRoutineToTodo(routineId)
    if (err) {
      alert(`오류: ${err.message}`)
    } else {
      await fetchTodos() // 운동 세션 섹션에 바로 반영
    }
    setLoadingRoutineId(null)
  }

  async function handleCreateRoutine(e: React.FormEvent) {
    e.preventDefault()
    if (!routineName.trim()) return
    setRCreating(true)
    setRError('')
    const items = routineItems
      .filter(i => i.name.trim())
      .map(i => ({
        name: i.name.trim(),
        sets: i.sets,
        weight_kg: i.weight_kg !== '' ? parseFloat(i.weight_kg) : null,
        reps: i.reps !== '' ? parseInt(i.reps) : null,
      }))
    const err = await createRoutine(routineName.trim(), items)
    if (err) {
      setRError(err.message)
    } else {
      setRoutineName('')
      setRoutineItems([{ name: '', sets: 3, weight_kg: '', reps: '' }])
      setShowRoutineForm(false)
    }
    setRCreating(false)
  }

  function updateItemName(idx: number, name: string) {
    setRoutineItems(prev => prev.map((item, i) => i === idx ? { ...item, name } : item))
  }

  function updateItemSets(idx: number, delta: number) {
    setRoutineItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, sets: Math.max(1, item.sets + delta) } : item
    ))
  }

  function updateItemField(idx: number, field: 'weight_kg' | 'reps', value: string) {
    setRoutineItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  function removeItem(idx: number) {
    setRoutineItems(prev => prev.filter((_, i) => i !== idx))
  }

  function startEditGoal(type: 'weekly' | 'monthly') {
    const current = type === 'weekly' ? weeklyGoal?.target_count : monthlyGoal?.target_count
    setEditingGoal(type)
    setGoalInput(current !== undefined ? String(current) : '')
  }

  async function handleSaveGoal() {
    if (!editingGoal) return
    const count = parseInt(goalInput)
    if (isNaN(count) || count < 1) return
    await upsertGoal(editingGoal, count)
    setEditingGoal(null)
    setGoalInput('')
  }

  return (
    <div className="workout-page">
      <Header />
      <main className="workout-content">
        <h1 className="workout-heading">운동 관리</h1>

        {/* 오늘의 운동 세션 + 타이머 */}
        <section className="workout-section session-section">
          <h2 className="section-title">오늘의 운동</h2>

          {tLoading && <p className="workout-empty">불러오는 중...</p>}

          {!tLoading && activeTodos.length === 0 && completedWorkoutTodos.length === 0 && (
            <p className="workout-empty">
              진행 중인 운동이 없습니다. 아래 루틴을 불러와 시작하세요.
            </p>
          )}

          {activeTodos.map(todo => (
            <ActiveWorkout
              key={todo.id}
              todo={todo}
              onSetComplete={incrementTodoItemSet}
              onMarkDone={() => updateTodo(todo.id, { is_completed: true })}
              onDelete={() => {
                if (window.confirm(`"${todo.title}" 운동을 삭제할까요?`)) deleteTodo(todo.id)
              }}
            />
          ))}

          {completedWorkoutTodos.length > 0 && (
            <div className="completed-workouts">
              {completedWorkoutTodos.map(todo => (
                <div key={todo.id} className="completed-workout-row">
                  <span className="completed-check">✓</span>
                  <span className="completed-title">{todo.title}</span>
                  <button
                    className="btn-text-danger completed-workout-delete"
                    onClick={() => {
                      if (window.confirm(`"${todo.title}" 운동을 삭제할까요?`)) deleteTodo(todo.id)
                    }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {hasCompletedWorkout && (
            <button
              className={`btn-log session-log-btn${loggedToday ? ' logged' : ''}`}
              onClick={handleLogWorkout}
              disabled={logging || loggedToday}
            >
              {loggedToday ? '✓ 오늘 운동 완료 기록됨' : '오늘 운동 완료로 기록하기'}
            </button>
          )}

          <div className="session-timer">
            <p className="timer-label">세트 간 휴식 타이머</p>
            <WorkoutTimer />
          </div>
        </section>

        {/* 목표 달성 현황 */}
        <section className="workout-section">
          <h2 className="section-title">목표 달성 현황</h2>
          <div className="goal-grid">
            <GoalCard
              label="이번 주"
              current={thisWeekLogs.length}
              target={weeklyGoal?.target_count ?? null}
              logs={thisWeekLogs}
              editing={editingGoal === 'weekly'}
              goalInput={goalInput}
              onEditStart={() => startEditGoal('weekly')}
              onGoalInputChange={setGoalInput}
              onSave={handleSaveGoal}
              onCancel={() => setEditingGoal(null)}
              onDeleteLog={deleteLog}
            />
            <GoalCard
              label="이번 달"
              current={thisMonthLogs.length}
              target={monthlyGoal?.target_count ?? null}
              logs={thisMonthLogs}
              editing={editingGoal === 'monthly'}
              goalInput={goalInput}
              onEditStart={() => startEditGoal('monthly')}
              onGoalInputChange={setGoalInput}
              onSave={handleSaveGoal}
              onCancel={() => setEditingGoal(null)}
              onDeleteLog={deleteLog}
            />
          </div>
        </section>

        {/* 운동 통계 */}
        <WorkoutStatsSection data={statsData} loading={statsLoading} />

        {/* 루틴 템플릿 */}
        <section className="workout-section">
          <div className="section-header">
            <h2 className="section-title">루틴 템플릿</h2>
            <button className="btn-secondary" onClick={() => setShowRoutineForm(v => !v)}>
              {showRoutineForm ? '닫기' : '+ 새 루틴'}
            </button>
          </div>

          {showRoutineForm && (
            <form className="routine-form" onSubmit={handleCreateRoutine}>
              <input
                className="routine-name-input"
                placeholder="루틴 이름 (예: 가슴 루틴)"
                value={routineName}
                onChange={e => setRoutineName(e.target.value)}
                required
              />
              <div className="routine-items-editor">
                {routineItems.map((item, idx) => (
                  <div key={idx} className="routine-item-row">
                    <input
                      className="routine-item-name"
                      placeholder="운동 이름 (예: 벤치프레스)"
                      value={item.name}
                      onChange={e => updateItemName(idx, e.target.value)}
                    />
                    <div className="sets-stepper">
                      <button type="button" className="stepper-btn" onClick={() => updateItemSets(idx, -1)} disabled={item.sets <= 1}>−</button>
                      <span className="sets-value">{item.sets}세트</span>
                      <button type="button" className="stepper-btn" onClick={() => updateItemSets(idx, 1)}>+</button>
                    </div>
                    <div className="item-metric">
                      <input type="number" className="metric-input" placeholder="무게" min={0} step={0.5} value={item.weight_kg} onChange={e => updateItemField(idx, 'weight_kg', e.target.value)} />
                      <span className="metric-unit">kg</span>
                    </div>
                    <div className="item-metric">
                      <input type="number" className="metric-input" placeholder="횟수" min={1} value={item.reps} onChange={e => updateItemField(idx, 'reps', e.target.value)} />
                      <span className="metric-unit">회</span>
                    </div>
                    {routineItems.length > 1 && (
                      <button type="button" className="btn-text-danger" onClick={() => removeItem(idx)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-text" onClick={() => setRoutineItems(prev => [...prev, { name: '', sets: 3, weight_kg: '', reps: '' }])}>
                  + 운동 추가
                </button>
              </div>
              {rError && <p className="form-error">{rError}</p>}
              <button type="submit" className="btn-primary" disabled={rCreating || !routineName.trim()}>
                {rCreating ? '저장 중...' : '루틴 저장'}
              </button>
            </form>
          )}

          {rLoading && <p className="workout-empty">불러오는 중...</p>}
          {!rLoading && routines.length === 0 && !showRoutineForm && (
            <p className="workout-empty">저장된 루틴이 없습니다. 새 루틴을 만들어 보세요.</p>
          )}

          <div className="routine-list">
            {routines.map(routine => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                loadingStart={loadingRoutineId === routine.id}
                onStart={() => handleLoadRoutine(routine.id, routine.name)}
                onDelete={() => { if (window.confirm(`"${routine.name}" 루틴을 삭제할까요?`)) deleteRoutine(routine.id) }}
                onUpdateItems={(items) => updateRoutineItems(routine.id, items)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

/* ── 운동 세션 카드 ── */
interface ActiveWorkoutProps {
  todo: Todo
  onSetComplete: (itemId: string, todoId: string) => void
  onMarkDone: () => void
  onDelete: () => void
}

function ActiveWorkout({ todo, onSetComplete, onMarkDone, onDelete }: ActiveWorkoutProps) {
  const setItems = todo.todo_items.filter(item => item.sets !== null)
  const allDone = setItems.length > 0 && setItems.every(item => item.is_checked)

  return (
    <div className={`active-workout-card${allDone ? ' all-done' : ''}`}>
      <div className="active-workout-header">
        <span className="active-workout-title">{todo.title}</span>
        <div className="active-workout-header-actions">
          {allDone && (
            <button className="btn-primary btn-sm" onClick={onMarkDone}>
              운동 완료
            </button>
          )}
          <button className="btn-text-danger btn-sm" onClick={onDelete}>✕</button>
        </div>
      </div>
      <div className="active-exercise-list">
        {setItems.map(item => (
          <ExerciseRow
            key={item.id}
            item={item}
            onSetComplete={() => onSetComplete(item.id, todo.id)}
          />
        ))}
      </div>
    </div>
  )
}

/* ── 개별 운동 행 ── */
interface ExerciseRowProps {
  item: TodoItem
  onSetComplete: () => void
}

function ExerciseRow({ item, onSetComplete }: ExerciseRowProps) {
  const done = item.is_checked
  const sets = item.sets ?? 0

  return (
    <div className={`exercise-row${done ? ' exercise-done' : ''}`}>
      <div className="exercise-info">
        <span className="exercise-name">{item.content}</span>
        {(item.weight_kg !== null || item.reps !== null) && (
          <span className="exercise-spec">
            {item.weight_kg !== null ? `${item.weight_kg}kg` : ''}
            {item.weight_kg !== null && item.reps !== null ? ' × ' : ''}
            {item.reps !== null ? `${item.reps}회` : ''}
          </span>
        )}
      </div>
      <div className="exercise-track">
        <div className="exercise-dots">
          {Array.from({ length: sets }).map((_, i) => (
            <span key={i} className={`exercise-dot${i < item.completed_sets ? ' done' : ''}`} />
          ))}
        </div>
        <span className="exercise-progress">
          {done ? '완료!' : `${item.completed_sets} / ${sets}세트`}
        </span>
      </div>
      {!done && (
        <button className="btn-set-done" onClick={onSetComplete}>
          세트 완료
        </button>
      )}
    </div>
  )
}

/* ── 목표 카드 ── */
interface GoalCardProps {
  label: string
  current: number
  target: number | null
  logs: WorkoutLog[]
  editing: boolean
  goalInput: string
  onEditStart: () => void
  onGoalInputChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  onDeleteLog: (id: string) => void
}

function GoalCard({ label, current, target, logs, editing, goalInput, onEditStart, onGoalInputChange, onSave, onCancel, onDeleteLog }: GoalCardProps) {
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : 0

  return (
    <div className="goal-card">
      <div className="goal-label">{label}</div>
      {target !== null ? (
        <>
          <div className="goal-count">
            <span className="goal-current">{current}</span>
            <span className="goal-sep"> / </span>
            <span className="goal-target">{target}회</span>
          </div>
          <div className="goal-bar">
            <div className="goal-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="goal-pct">{pct}%</div>
        </>
      ) : (
        <div className="goal-count">
          <span className="goal-current">{current}</span>
          <span className="goal-sep">회</span>
        </div>
      )}
      {editing ? (
        <div className="goal-edit">
          <input
            type="number" min={1} value={goalInput}
            onChange={e => onGoalInputChange(e.target.value)}
            placeholder="목표 횟수" autoFocus
            onKeyDown={e => { if (e.key === 'Enter') onSave() }}
          />
          <button className="btn-primary btn-sm" onClick={onSave}>저장</button>
          <button className="btn-secondary btn-sm" onClick={onCancel}>취소</button>
        </div>
      ) : (
        <button className="btn-text" onClick={onEditStart}>
          {target !== null ? '목표 수정' : '목표 설정'}
        </button>
      )}

      {logs.length > 0 && (
        <ul className="goal-log-list">
          {logs.map(log => (
            <LogItem key={log.id} log={log} onDelete={onDeleteLog} />
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── 로그 아이템 (상세 보기 포함) ── */
function LogItem({ log, onDelete }: { log: WorkoutLog; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<WorkoutLogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function toggleDetail() {
    if (!open && !loaded) {
      setLoading(true)
      const { data } = await supabase
        .from('workout_log_items')
        .select('*')
        .eq('log_id', log.id)
        .order('sort_order', { ascending: true })
      setItems((data ?? []) as WorkoutLogItem[])
      setLoaded(true)
      setLoading(false)
    }
    setOpen(v => !v)
  }

  return (
    <li className="goal-log-item-wrap">
      <div className="goal-log-item">
        <div className="goal-log-info">
          <span className="goal-log-date">{log.logged_date}</span>
          {log.routine_name && (
            <span className="goal-log-routine">{log.routine_name}</span>
          )}
        </div>
        <div className="goal-log-actions">
          <button className="btn-text goal-log-detail" onClick={toggleDetail}>
            {open ? '접기 ▲' : '상세 ▼'}
          </button>
          <button className="btn-text-danger goal-log-delete" onClick={() => onDelete(log.id)}>✕</button>
        </div>
      </div>
      {open && (
        <div className="goal-log-detail-panel">
          {loading && <p className="goal-log-detail-empty">불러오는 중...</p>}
          {!loading && items.length === 0 && (
            <p className="goal-log-detail-empty">상세 기록이 없습니다.</p>
          )}
          {items.map(item => (
            <div key={item.id} className="goal-log-detail-row">
              <span className="goal-log-detail-name">{item.exercise_name}</span>
              <div className="goal-log-detail-meta">
                {item.weight_kg !== null && <span>{item.weight_kg}kg</span>}
                {item.reps !== null && <span>{item.reps}회</span>}
                {item.sets !== null && (
                  <span>{item.completed_sets ?? 0}/{item.sets}세트</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </li>
  )
}

/* ── 루틴 카드 (편집 기능 포함) ── */
interface RoutineCardProps {
  routine: RoutineTemplate
  loadingStart: boolean
  onStart: () => void
  onDelete: () => void
  onUpdateItems: (items: RoutineTemplateItem[]) => Promise<any>
}

interface DraftItem {
  id: string
  name: string
  sets: number
  weight_kg: string
  reps: string
}

function RoutineCard({ routine, loadingStart, onStart, onDelete, onUpdateItems }: RoutineCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<DraftItem[]>([])
  const [saving, setSaving] = useState(false)

  function startEdit() {
    setDraft(routine.routine_template_items.map(item => ({
      id: item.id,
      name: item.name,
      sets: item.sets,
      weight_kg: item.weight_kg !== null ? String(item.weight_kg) : '',
      reps: item.reps !== null ? String(item.reps) : '',
    })))
    setEditing(true)
  }

  function updateDraft(idx: number, field: 'sets' | 'weight_kg' | 'reps', value: string | number) {
    setDraft(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d))
  }

  async function handleSave() {
    setSaving(true)
    const items: RoutineTemplateItem[] = draft.map((d, idx) => ({
      id: d.id,
      template_id: routine.id,
      name: d.name,
      sets: d.sets,
      weight_kg: d.weight_kg !== '' ? parseFloat(d.weight_kg) : null,
      reps: d.reps !== '' ? parseInt(d.reps) : null,
      sort_order: idx,
    }))
    const err = await onUpdateItems(items)
    if (err) alert(`저장 실패: ${err.message}`)
    else setEditing(false)
    setSaving(false)
  }

  return (
    <div className="routine-card">
      <div className="routine-card-header">
        <strong className="routine-card-name">{routine.name}</strong>
        <div className="routine-card-actions">
          {!editing && (
            <>
              <button className="btn-primary btn-sm" disabled={loadingStart} onClick={onStart}>
                {loadingStart ? '추가 중...' : '운동 시작'}
              </button>
              <button className="btn-secondary btn-sm" onClick={startEdit}>수정</button>
              <button className="btn-danger btn-sm" onClick={onDelete}>삭제</button>
            </>
          )}
          {editing && (
            <>
              <button className="btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
              <button className="btn-secondary btn-sm" onClick={() => setEditing(false)} disabled={saving}>취소</button>
            </>
          )}
        </div>
      </div>

      {!editing && routine.routine_template_items.length > 0 && (
        <ul className="routine-items-preview">
          {routine.routine_template_items.map(item => (
            <li key={item.id}>
              <span className="preview-name">{item.name}</span>
              <div className="preview-badges">
                {item.weight_kg !== null && <span className="preview-badge">{item.weight_kg}kg</span>}
                {item.reps !== null && <span className="preview-badge">{item.reps}회</span>}
                <span className="preview-sets">{item.sets}세트</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="routine-edit-list">
          {draft.map((item, idx) => (
            <div key={item.id} className="routine-edit-row">
              <span className="routine-edit-name">{item.name}</span>
              <div className="routine-edit-fields">
                <div className="routine-edit-field">
                  <input
                    type="number"
                    className="routine-edit-input"
                    placeholder="무게"
                    min={0}
                    step={0.5}
                    value={item.weight_kg}
                    onChange={e => updateDraft(idx, 'weight_kg', e.target.value)}
                  />
                  <span className="routine-edit-unit">kg</span>
                </div>
                <div className="routine-edit-field">
                  <input
                    type="number"
                    className="routine-edit-input"
                    placeholder="횟수"
                    min={1}
                    value={item.reps}
                    onChange={e => updateDraft(idx, 'reps', e.target.value)}
                  />
                  <span className="routine-edit-unit">회</span>
                </div>
                <div className="routine-edit-sets">
                  <button type="button" className="stepper-btn" onClick={() => updateDraft(idx, 'sets', Math.max(1, item.sets - 1))}>−</button>
                  <span className="sets-value">{item.sets}세트</span>
                  <button type="button" className="stepper-btn" onClick={() => updateDraft(idx, 'sets', item.sets + 1)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── 운동 통계 섹션 ── */
const PART_COLORS = ['#4f46e5', '#7c3aed', '#059669', '#2563eb', '#d97706', '#dc2626', '#0891b2', '#6b7280']

function fmtVolume(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}t`
  return `${v}kg`
}

function WorkoutStatsSection({ data, loading }: { data: WorkoutStatsData | null; loading: boolean }) {
  if (loading) return (
    <section className="workout-section">
      <h2 className="section-title">운동 통계</h2>
      <p className="workout-empty">불러오는 중...</p>
    </section>
  )
  if (!data) return null

  const hasWeekly = data.weeklyData.some(d => d.count > 0)
  const hasBodyPart = data.bodyPartData.length > 0
  const hasVolume = data.monthlyVolumeData.some(d => d.volume > 0)

  return (
    <section className="workout-section">
      <h2 className="section-title">운동 통계</h2>
      <div className="stats-grid">

        {/* 주간 운동 횟수 */}
        <div className="stat-card">
          <p className="stat-card-title">주간 운동 횟수</p>
          {!hasWeekly ? (
            <p className="stat-empty">운동 기록이 없습니다</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data.weeklyData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} width={20} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${v}회`, '운동 횟수']} />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 부위별 운동 비율 */}
        <div className="stat-card">
          <p className="stat-card-title">부위별 운동 비율 <span className="stat-card-sub">(최근 30일)</span></p>
          {!hasBodyPart ? (
            <p className="stat-empty">운동 상세 기록이 없습니다</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data.bodyPartData}
                  dataKey="count"
                  nameKey="part"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={30}
                >
                  {data.bodyPartData.map((_, i) => (
                    <Cell key={i} fill={PART_COLORS[i % PART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [`${v}회`, name]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 월간 총 볼륨 */}
        <div className="stat-card">
          <p className="stat-card-title">월간 총 볼륨</p>
          {!hasVolume ? (
            <p className="stat-empty">볼륨 기록이 없습니다</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data.monthlyVolumeData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtVolume} tick={{ fontSize: 11, fill: '#6b7280' }} width={36} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()}kg`, '총 볼륨']} />
                <Bar dataKey="volume" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 요일 분석 */}
        <div className="stat-card">
          <p className="stat-card-title">요일 분석</p>
          {data.weekdayData.every(d => d.count === 0) ? (
            <p className="stat-empty">운동 기록이 없습니다</p>
          ) : (
            <>
              <p className="stat-weekday-top">
                가장 많이 운동한 요일:&nbsp;
                <strong>{data.weekdayData.find(d => d.isTop)?.day}요일</strong>
              </p>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={data.weekdayData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} width={20} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [`${v}회`, '운동 횟수']} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.weekdayData.map((entry, i) => (
                      <Cell key={i} fill={entry.isTop ? '#4f46e5' : '#c7d2fe'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

      </div>
    </section>
  )
}
