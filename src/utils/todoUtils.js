import { getDateKey, parseDateKey } from './dateUtils'

export function createDefaultTodo(dateKey = getDateKey()) {
  return {
    title: '',
    dueDate: dateKey,
    priority: 'medium',
    isCompleted: false,
    completedAt: null,
    category: '개인',
    memo: '',
  }
}

export function normalizeTodo(todo) {
  const now = new Date().toISOString()
  const priority = ['high', 'medium', 'low'].includes(todo.priority) ? todo.priority : 'medium'

  return {
    id: String(todo.id || ''),
    title: String(todo.title || '').trim(),
    dueDate: String(todo.dueDate || getDateKey()),
    priority,
    isCompleted: Boolean(todo.isCompleted),
    completedAt: todo.completedAt ? String(todo.completedAt) : null,
    category: String(todo.category || '개인'),
    memo: String(todo.memo || ''),
    createdAt: String(todo.createdAt || now),
    updatedAt: String(todo.updatedAt || todo.createdAt || now),
  }
}

export function normalizeTodos(todos) {
  return Array.isArray(todos)
    ? todos.map(normalizeTodo).filter((todo) => todo.id && todo.title && todo.dueDate)
    : []
}

export function getTodosForDate(todos, dateKey) {
  return sortTodos(normalizeTodos(todos).filter((todo) => todo.dueDate === dateKey))
}

export function countTodosByDate(todos) {
  return normalizeTodos(todos).reduce((acc, todo) => {
    acc[todo.dueDate] = (acc[todo.dueDate] || 0) + 1
    return acc
  }, {})
}

export function getTodayTodos(todos, todayKey = getDateKey()) {
  return getTodosForDate(todos, todayKey)
}

export function getWeekTodos(todos, anchorDate = new Date()) {
  const base = new Date(anchorDate)
  base.setHours(0, 0, 0, 0)
  const day = base.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const start = new Date(base)
  start.setDate(base.getDate() + mondayOffset)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return sortTodos(normalizeTodos(todos).filter((todo) => {
    const due = parseDateKey(todo.dueDate)
    return due >= start && due <= end
  }))
}

export function getCompletedTodos(todos) {
  return sortTodos(normalizeTodos(todos).filter((todo) => todo.isCompleted))
}

export function sortTodos(todos) {
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return [...todos].sort((left, right) => {
    if (left.isCompleted !== right.isCompleted) return left.isCompleted ? 1 : -1
    const dateCompare = left.dueDate.localeCompare(right.dueDate)
    if (dateCompare !== 0) return dateCompare
    return priorityOrder[left.priority] - priorityOrder[right.priority]
  })
}

export function getPriorityLabel(priority) {
  if (priority === 'high') return 'High'
  if (priority === 'low') return 'Low'
  return 'Medium'
}
