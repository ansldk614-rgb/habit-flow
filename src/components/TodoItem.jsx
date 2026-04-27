import { Check, Trash2 } from 'lucide-react'
import { getPriorityLabel } from '../utils/todoUtils'

export default function TodoItem({ todo, toggleTodoCompleted, deleteTodo }) {
  return (
    <article className={`todo-card todo-card--${todo.priority} ${todo.isCompleted ? 'todo-card--done' : ''}`}>
      <button type="button" className="todo-check" onClick={() => toggleTodoCompleted(todo.id)} aria-label={`${todo.title} 완료 전환`}>
        {todo.isCompleted ? <Check size={16} /> : null}
      </button>
      <div className="todo-card__body">
        <div className="todo-card__head">
          <strong>{todo.title}</strong>
          <span className={`priority-pill priority-pill--${todo.priority}`}>{getPriorityLabel(todo.priority)}</span>
        </div>
        <div className="todo-card__meta">
          <span>{todo.dueDate}</span>
          <span>{todo.category}</span>
        </div>
        {todo.memo ? <p>{todo.memo}</p> : null}
      </div>
      <button type="button" className="icon-danger-button" onClick={() => deleteTodo(todo.id)} aria-label={`${todo.title} 삭제`} title="삭제">
        <Trash2 size={16} />
      </button>
    </article>
  )
}
