import { CheckSquare } from 'lucide-react'
import TodoForm from '../components/TodoForm'
import TodoItem from '../components/TodoItem'
import { getCompletedTodos, getTodayTodos, getWeekTodos, sortTodos } from '../utils/todoUtils'

function TodoSection({ title, caption, todos, toggleTodoCompleted, deleteTodo }) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="section-kicker">{caption}</p>
          <h2>{title}</h2>
        </div>
        <span className="dashboard-home__meta">{todos.length}개</span>
      </div>
      <div className="todo-list">
        {todos.length === 0 ? (
          <div className="empty-card"><p>표시할 할 일이 없어요.</p><span>새 할 일을 추가하거나 필터를 확인하세요.</span></div>
        ) : (
          todos.map((todo) => <TodoItem key={todo.id} todo={todo} toggleTodoCompleted={toggleTodoCompleted} deleteTodo={deleteTodo} />)
        )}
      </div>
    </section>
  )
}

export default function TodosPage({ todos, todoForm, todoErrors, updateTodoFormField, handleCreateTodo, resetTodoForm, toggleTodoCompleted, deleteTodo, todayKey, today }) {
  const todayTodos = getTodayTodos(todos, todayKey)
  const weekTodos = getWeekTodos(todos, today)
  const completedTodos = getCompletedTodos(todos)
  const allTodos = sortTodos(todos)

  return (
    <>
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="section-kicker">할 일 추가</p>
            <h2>마감일 기반 할 일</h2>
          </div>
          <CheckSquare size={18} />
        </div>
        <TodoForm todoForm={todoForm} errors={todoErrors} updateTodoFormField={updateTodoFormField} handleCreateTodo={handleCreateTodo} onCancel={resetTodoForm} />
      </section>

      <TodoSection title="오늘 할 일" caption="오늘" todos={todayTodos} toggleTodoCompleted={toggleTodoCompleted} deleteTodo={deleteTodo} />
      <TodoSection title="이번 주 할 일" caption="이번 주" todos={weekTodos} toggleTodoCompleted={toggleTodoCompleted} deleteTodo={deleteTodo} />
      <TodoSection title="완료된 할 일" caption="완료" todos={completedTodos} toggleTodoCompleted={toggleTodoCompleted} deleteTodo={deleteTodo} />
      <TodoSection title="전체 할 일" caption="전체" todos={allTodos} toggleTodoCompleted={toggleTodoCompleted} deleteTodo={deleteTodo} />
    </>
  )
}
