import { useState, useRef } from 'react'
import type { Todo } from '../types/todo'
import type { useTodos } from '../hooks/useTodos'

interface Props {
  todo: Todo
  actions: Pick<ReturnType<typeof useTodos>, 'updateTodo' | 'deleteTodo' | 'createTodoItem' | 'updateTodoItem' | 'deleteTodoItem' | 'incrementTodoItemSet'>
}

export default function TodoCard({ todo, actions }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editMemo, setEditMemo] = useState(todo.memo ?? '')
  const [newItemContent, setNewItemContent] = useState('')
  const newItemRef = useRef<HTMLInputElement>(null)

  async function handleToggleComplete() {
    await actions.updateTodo(todo.id, { is_completed: !todo.is_completed })
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) return
    await actions.updateTodo(todo.id, {
      title: editTitle.trim(),
      memo: editMemo.trim() || null,
    })
    setEditing(false)
  }

  function handleCancelEdit() {
    setEditTitle(todo.title)
    setEditMemo(todo.memo ?? '')
    setEditing(false)
  }

  async function handleAddItem() {
    if (!newItemContent.trim()) return
    await actions.createTodoItem(todo.id, newItemContent.trim())
    setNewItemContent('')
    newItemRef.current?.focus()
  }

  function handleItemKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAddItem()
  }

  const checkedCount = todo.todo_items.filter(i => i.is_checked).length
  const totalCount = todo.todo_items.length

  return (
    <div className="todo-card">
      <div className="todo-card-header">
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.is_completed}
          onChange={handleToggleComplete}
        />

        {editing ? (
          <div className="todo-edit-form">
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="제목"
              autoFocus
            />
            <textarea
              value={editMemo}
              onChange={e => setEditMemo(e.target.value)}
              placeholder="메모 (선택)"
            />
            <div className="todo-edit-actions">
              <button className="btn-save" onClick={handleSaveEdit}>저장</button>
              <button className="btn-cancel" onClick={handleCancelEdit}>취소</button>
            </div>
          </div>
        ) : (
          <div className="todo-card-body">
            <p className={`todo-title${todo.is_completed ? ' completed' : ''}`}>{todo.title}</p>
            {todo.memo && <p className="todo-memo">{todo.memo}</p>}
          </div>
        )}

        {!editing && (
          <div className="todo-card-actions">
            <button className="btn-icon" onClick={() => setEditing(true)}>편집</button>
            <button className="btn-icon danger" onClick={() => actions.deleteTodo(todo.id)}>삭제</button>
          </div>
        )}
      </div>

      <div className="todo-items-section">
        <button
          className="todo-items-toggle"
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? '▲ 체크리스트 접기' : `▼ 체크리스트 ${totalCount > 0 ? `(${checkedCount}/${totalCount})` : '열기'}`}
        </button>

        {expanded && (
          <>
            {todo.todo_items.map(item => (
              item.sets !== null ? (
                /* 루틴에서 불러온 세트 추적 항목 */
                <div key={item.id} className={`todo-item-row set-item-row${item.is_checked ? ' set-item-done' : ''}`}>
                  <div className="set-item-main">
                    <div className="set-item-header">
                      <span className={`set-item-name${item.is_checked ? ' checked' : ''}`}>
                        {item.content}
                      </span>
                      {(item.weight_kg !== null || item.reps !== null) && (
                        <span className="set-item-spec">
                          {item.weight_kg !== null && `${item.weight_kg}kg`}
                          {item.weight_kg !== null && item.reps !== null && ' × '}
                          {item.reps !== null && `${item.reps}회`}
                        </span>
                      )}
                    </div>
                    <div className="set-dots">
                      {Array.from({ length: item.sets }).map((_, i) => (
                        <span
                          key={i}
                          className={`set-dot${i < item.completed_sets ? ' done' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="set-progress">
                      {item.is_checked ? '완료!' : `${item.completed_sets}/${item.sets}세트`}
                    </span>
                  </div>
                  <div className="set-item-actions">
                    {!item.is_checked && (
                      <button
                        className="btn-set-complete"
                        onClick={() => actions.incrementTodoItemSet(item.id, todo.id)}
                      >
                        세트 완료
                      </button>
                    )}
                    <button
                      className="btn-delete-item"
                      onClick={() => actions.deleteTodoItem(item.id, todo.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : (
                /* 일반 체크리스트 항목 */
                <div key={item.id} className="todo-item-row">
                  <input
                    type="checkbox"
                    className="todo-item-checkbox"
                    checked={item.is_checked}
                    onChange={() => actions.updateTodoItem(item.id, todo.id, { is_checked: !item.is_checked })}
                  />
                  <span className={`todo-item-content${item.is_checked ? ' checked' : ''}`}>
                    {item.content}
                  </span>
                  <button
                    className="btn-delete-item"
                    onClick={() => actions.deleteTodoItem(item.id, todo.id)}
                  >
                    ×
                  </button>
                </div>
              )
            ))}

            <div className="todo-item-add">
              <input
                ref={newItemRef}
                value={newItemContent}
                onChange={e => setNewItemContent(e.target.value)}
                onKeyDown={handleItemKeyDown}
                placeholder="항목 추가 후 Enter"
              />
              <button onClick={handleAddItem}>추가</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
