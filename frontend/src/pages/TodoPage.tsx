import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTodos } from '../hooks/useTodos'
import Header from '../components/Header'
import TodoCard from '../components/TodoCard'
import '../styles/todo.css'

export default function TodoPage() {
  const { user } = useAuth()
  const { todos, loading, error, createTodo, updateTodo, deleteTodo, createTodoItem, updateTodoItem, deleteTodoItem, incrementTodoItemSet } = useTodos()

  const [newTitle, setNewTitle] = useState('')
  const [newMemo, setNewMemo] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    setCreateError('')

    const err = await createTodo(newTitle.trim(), newMemo.trim())
    if (err) {
      setCreateError(err.message)
    } else {
      setNewTitle('')
      setNewMemo('')
    }
    setCreating(false)
  }

  const nickname = user?.user_metadata?.nickname ?? user?.email?.split('@')[0] ?? '사용자'

  const actions = { updateTodo, deleteTodo, createTodoItem, updateTodoItem, deleteTodoItem, incrementTodoItemSet }

  return (
    <div className="todo-page">
      <Header right={
        <span style={{ fontSize: '0.875rem', color: '#555' }}>{nickname}</span>
      } />

      <main className="todo-content">
        <form className="todo-create-form" onSubmit={handleCreate}>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="새 할 일 제목"
            required
          />
          <textarea
            value={newMemo}
            onChange={e => setNewMemo(e.target.value)}
            placeholder="메모 (선택)"
          />
          {createError && <p className="todo-error">{createError}</p>}
          <button type="submit" className="btn-primary" disabled={creating || !newTitle.trim()}>
            {creating ? '추가 중...' : '+ 할 일 추가'}
          </button>
        </form>

        {loading && <p className="todo-empty">불러오는 중...</p>}
        {error && <p className="todo-error">{error}</p>}

        {!loading && todos.length === 0 && (
          <p className="todo-empty">아직 할 일이 없습니다. 위에서 추가해 보세요.</p>
        )}

        {todos.map(todo => (
          <TodoCard key={todo.id} todo={todo} actions={actions} />
        ))}
      </main>
    </div>
  )
}
