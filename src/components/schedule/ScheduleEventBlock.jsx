import { StickyNote } from 'lucide-react'
import { getHabitDisplayName } from '../../utils/habitUtils'
import { getCategoryMeta, getRepeatLabel } from '../../utils/scheduleUtils'

export default function ScheduleEventBlock({ event, style, habits = [], todos = [], isConflict = false, onClick }) {
  const category = getCategoryMeta(event.category)
  const repeatLabel = getRepeatLabel(event.repeatType)
  const linkedHabit = event.linkedHabitId ? habits.find((habit) => habit.id === event.linkedHabitId) : null
  const linkedTodo = event.linkedTodoId ? todos.find((todo) => todo.id === event.linkedTodoId) : null
  const linkLabel = linkedHabit ? `습관 · ${getHabitDisplayName(linkedHabit)}` : linkedTodo ? `할 일 · ${linkedTodo.title}` : ''

  return (
    <button
      type="button"
      className={`weekly-schedule-block weekly-schedule-block--${category.id} ${isConflict ? 'weekly-schedule-block--conflict' : ''}`}
      style={{
        ...style,
        '--schedule-block-color': event.color || category.defaultColor,
      }}
      onClick={onClick}
      title={`${event.title} ${event.startTime}-${event.endTime}${event.memo ? ` · ${event.memo}` : ''}`}
    >
      <strong>{event.title}</strong>
      <span>{event.startTime} - {event.endTime}</span>
      <em>
        {category.label}
        {event.memo ? <StickyNote size={11} aria-label="메모 있음" /> : null}
      </em>
      {linkLabel ? <small className="weekly-schedule-block__link">{linkLabel}</small> : null}
      {repeatLabel ? <small className="weekly-schedule-block__repeat">{repeatLabel}</small> : null}
    </button>
  )
}
