import { CalendarDays, ChevronLeft, ChevronRight, CheckSquare, ClipboardList, MapPin, Trash2 } from 'lucide-react'
import CalendarGrid from '../components/CalendarGrid'
import EventForm from '../components/EventForm'
import { formatHeroDate, formatMonthLabel } from '../utils/dateUtils'
import { formatEventTime, getEventsForDate } from '../utils/eventUtils'
import { formatPercent, getHabitDisplayName, getHabitEmoji, getHabitLog, getHabitMetrics } from '../utils/habitUtils'
import { getPriorityLabel, getTodosForDate } from '../utils/todoUtils'

export default function CalendarPage({
  calendarDays,
  calendarAnchorDate,
  moveCalendarMonth,
  selectedDateKey,
  selectedDate,
  setSelectedDateKey,
  completions,
  selectedHabits,
  events,
  todos,
  eventCountsByDate,
  todoCountsByDate,
  eventForm,
  eventErrors,
  updateEventFormField,
  handleCreateEvent,
  resetEventForm,
  deleteEvent,
}) {
  const selectedEvents = getEventsForDate(events, selectedDateKey)
  const selectedTodos = getTodosForDate(todos, selectedDateKey)

  return (
    <>
      <section className="panel">
        <div className="calendar-toolbar">
          <button type="button" className="calendar-nav-button" onClick={() => moveCalendarMonth(-1)} aria-label="이전 달">
            <ChevronLeft size={18} />
          </button>
          <div>
            <p className="section-kicker">캘린더</p>
            <h2>{formatMonthLabel(calendarAnchorDate)}</h2>
          </div>
          <button type="button" className="calendar-nav-button" onClick={() => moveCalendarMonth(1)} aria-label="다음 달">
            <ChevronRight size={18} />
          </button>
        </div>
        <CalendarGrid days={calendarDays} onSelectDate={setSelectedDateKey} eventCountsByDate={eventCountsByDate} todoCountsByDate={todoCountsByDate} />
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="section-kicker">선택한 날짜</p>
            <h2>{formatHeroDate(selectedDate)}</h2>
          </div>
          <span className="dashboard-home__meta">
            일정 {selectedEvents.length} · 할 일 {selectedTodos.length} · 습관 {selectedHabits.length}
          </span>
        </div>

        <div className="calendar-detail-grid">
          <section className="calendar-detail-card">
            <div className="calendar-detail-card__head">
              <strong><CalendarDays size={15} /> 일정</strong>
              <span>{selectedEvents.length}개</span>
            </div>
            <div className="event-list">
              {selectedEvents.length === 0 ? (
                <p className="muted-copy">이 날짜에 등록된 일정이 없어요.</p>
              ) : (
                selectedEvents.map((event) => (
                  <article key={event.id} className="event-card event-card--compact">
                    <span className="event-card__accent" style={{ backgroundColor: event.color }} />
                    <div className="event-card__body">
                      <div className="event-card__head">
                        <div>
                          <strong>{event.title}</strong>
                          <span>{formatEventTime(event)} · {event.category}</span>
                        </div>
                        <button type="button" className="icon-danger-button" onClick={() => deleteEvent(event.id)} aria-label={`${event.title} 삭제`} title="삭제">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {event.location ? <p className="event-card__meta"><MapPin size={14} />{event.location}</p> : null}
                      {event.memo ? <p className="event-card__memo">{event.memo}</p> : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="calendar-detail-card">
            <div className="calendar-detail-card__head">
              <strong><CheckSquare size={15} /> 할 일</strong>
              <span>{selectedTodos.length}개</span>
            </div>
            <div className="todo-list">
              {selectedTodos.length === 0 ? (
                <p className="muted-copy">이 날짜가 마감인 할 일이 없어요.</p>
              ) : (
                selectedTodos.map((todo) => (
                  <article key={todo.id} className={`calendar-todo-row calendar-todo-row--${todo.priority} ${todo.isCompleted ? 'calendar-todo-row--done' : ''}`}>
                    <span className="todo-summary-check">{todo.isCompleted ? '✓' : ''}</span>
                    <div>
                      <strong>{todo.title}</strong>
                      <span>{getPriorityLabel(todo.priority)} · {todo.category}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="calendar-detail-card">
            <div className="calendar-detail-card__head">
              <strong><ClipboardList size={15} /> 습관 완료 기록</strong>
              <span>{selectedHabits.length}개</span>
            </div>
            <div className="habit-list">
              {selectedHabits.length === 0 ? (
                <p className="muted-copy">이 날짜에 반복되는 습관이 없어요.</p>
              ) : (
                selectedHabits.map((habit) => {
                  const metrics = getHabitMetrics(habit, getHabitLog(completions, selectedDateKey, habit))
                  return (
                    <article key={habit.id} className="calendar-habit-row">
                      <div>
                        <strong><span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</strong>
                        <span>{metrics.detailText}</span>
                      </div>
                      <span className="progress-pill">{formatPercent(metrics.progressPercent)}</span>
                    </article>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="section-kicker">일정 추가</p>
            <h2>새 일정 만들기</h2>
          </div>
          <CalendarDays size={18} />
        </div>
        <EventForm eventForm={eventForm} errors={eventErrors} updateEventFormField={updateEventFormField} handleCreateEvent={handleCreateEvent} onCancel={resetEventForm} />
      </section>
    </>
  )
}
