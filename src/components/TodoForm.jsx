import { Plus, X } from 'lucide-react'
import { TODO_CATEGORY_OPTIONS, TODO_PRIORITY_OPTIONS } from '../constants/habitConstants'

function FieldError({ message }) {
  return message ? <span className="field-error">{message}</span> : null
}

export default function TodoForm({ todoForm, errors = {}, updateTodoFormField, handleCreateTodo, onCancel }) {
  return (
    <form className="habit-form todo-form-compact" onSubmit={handleCreateTodo} noValidate>
      <label className="field">
        <span>할 일 제목</span>
        <input type="text" value={todoForm.title} onChange={(event) => updateTodoFormField('title', event.target.value)} placeholder="예: 과제 제출하기" aria-invalid={Boolean(errors.title)} />
        <FieldError message={errors.title} />
      </label>

      <div className="form-split">
        <label className="field">
          <span>마감일</span>
          <input type="date" value={todoForm.dueDate} onChange={(event) => updateTodoFormField('dueDate', event.target.value)} aria-invalid={Boolean(errors.dueDate)} />
          <FieldError message={errors.dueDate} />
        </label>
        <label className="field">
          <span>우선순위</span>
          <select className="select-field" value={todoForm.priority} onChange={(event) => updateTodoFormField('priority', event.target.value)}>
            {TODO_PRIORITY_OPTIONS.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}
          </select>
        </label>
      </div>

      <label className="field">
        <span>카테고리</span>
        <select className="select-field" value={todoForm.category} onChange={(event) => updateTodoFormField('category', event.target.value)}>
          {TODO_CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>

      <label className="field">
        <span>메모</span>
        <textarea className="memo-input memo-input--compact" value={todoForm.memo} onChange={(event) => updateTodoFormField('memo', event.target.value)} placeholder="필요한 내용을 적어두세요." />
      </label>

      <div className="form-actions todo-form-compact__actions">
        <button className="secondary-button" type="button" onClick={onCancel}><X size={18} />취소</button>
        <button className="primary-button" type="submit"><Plus size={18} />할 일 추가</button>
      </div>
    </form>
  )
}
