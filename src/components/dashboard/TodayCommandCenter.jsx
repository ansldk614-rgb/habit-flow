import { CalendarClock, CheckCircle2, Circle, ClipboardList, Coins, Sparkles } from 'lucide-react'
import { SCHEDULE_STORAGE_KEY } from '../../constants/scheduleConstants'
import { formatPercent, getHabitDisplayName, getHabitEmoji, getHabitLog, getHabitMetrics, safePercent } from '../../utils/habitUtils'
import { getScheduleEventsForWeek, getScheduleLinkLabel, getWeekDays, normalizeScheduleEvents } from '../../utils/scheduleUtils'

const CATEGORY_LABELS = {
  study: '공부',
  exercise: '운동',
  class: '수업',
  work: '업무',
  personal: '개인',
  rest: '휴식',
  routine: '루틴',
  important: '중요',
}

function loadStoredSchedules() {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(SCHEDULE_STORAGE_KEY)
    return saved ? normalizeScheduleEvents(JSON.parse(saved)) : []
  } catch {
    return []
  }
}

function getTodaySchedules(today) {
  const schedules = loadStoredSchedules()
  const todayWeek = getWeekDays(today)
  const todayKey = todayWeek.find((day) => day.isToday)?.dateKey

  return getScheduleEventsForWeek(schedules, todayWeek)
    .filter((event) => event.occurrenceDateKey === todayKey)
    .sort((left, right) => left.startTime.localeCompare(right.startTime))
}

function getTodoDueDate(todo) {
  return todo?.dueDate || todo?.deadline || todo?.date || ''
}

function getFirstLinkedSchedule(schedules, field, id) {
  if (!id) return null
  return schedules.find((schedule) => schedule[field] === id) ?? null
}

function getScheduleTimeText(schedule) {
  return schedule ? `오늘 ${schedule.startTime} 예정` : ''
}

function StatusBadge({ done }) {
  return (
    <span className={`today-command-row__badge ${done ? 'today-command-row__badge--done' : ''}`}>
      {done ? '완료' : '남음'}
    </span>
  )
}

export default function TodayCommandCenter({
  today = new Date(),
  todayKey,
  habits = [],
  completions = {},
  todos = [],
  onNavigate,
}) {
  const todaySchedules = getTodaySchedules(today)
  const habitItems = habits.map((habit) => {
    const metrics = getHabitMetrics(habit, getHabitLog(completions, todayKey, habit))
    return {
      habit,
      linkedSchedule: getFirstLinkedSchedule(todaySchedules, 'linkedHabitId', habit.id),
      percent: safePercent(metrics.progressPercent),
      isDone: metrics.progressPercent >= 100,
    }
  })
  const todoItems = todos
    .filter((todo) => getTodoDueDate(todo) === todayKey)
    .map((todo) => ({
      ...todo,
      linkedSchedule: getFirstLinkedSchedule(todaySchedules, 'linkedTodoId', todo.id),
    }))
  const completedHabitCount = habitItems.filter((item) => item.isDone).length
  const completedTodoCount = todoItems.filter((todo) => todo.isCompleted).length
  const completedScheduleCount = todaySchedules.filter((event) => event.isCompleted).length
  const totalCount = habitItems.length + todoItems.length + todaySchedules.length
  const completedCount = completedHabitCount + completedTodoCount + completedScheduleCount
  const remainingCount = Math.max(0, totalCount - completedCount)
  const progressPercent = totalCount === 0 ? 0 : safePercent((completedCount / totalCount) * 100)

  return (
    <section className="today-command-card" aria-label="Today Command Center">
      <header className="today-command-card__head">
        <div>
          <span className="dash-label">Today Command Center</span>
          <h2>오늘의 실행 계획</h2>
          <p>오늘 {totalCount}개 중 {completedCount}개 완료 · 남은 {remainingCount}개</p>
        </div>
        <strong className={`today-command-card__rate ${progressPercent >= 100 ? 'today-command-card__rate--done' : ''}`}>
          {formatPercent(progressPercent)}
        </strong>
      </header>

      <div className="today-command-progress" aria-label={`오늘 진행률 ${formatPercent(progressPercent)}`}>
        <span style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="today-command-reward">
        <Sparkles size={15} />
        <span>남은 항목을 완료하면 슬라임 성장에 필요한 XP와 Gold를 얻을 수 있어요.</span>
      </div>

      <div className="today-command-sections">
        <section className="today-command-section">
          <div className="today-command-section__title">
            <Coins size={15} />
            <strong>습관</strong>
            <span>{completedHabitCount}/{habitItems.length}</span>
          </div>
          <div className="today-command-list">
            {habitItems.length === 0 ? (
              <p className="today-command-empty">오늘 활성 습관이 없습니다.</p>
            ) : habitItems.slice(0, 5).map(({ habit, linkedSchedule, percent, isDone }) => (
              <button
                key={habit.id}
                type="button"
                className={`today-command-row today-command-row--button ${isDone ? 'today-command-row--done' : ''}`}
                onClick={() => onNavigate?.('records')}
              >
                <span className="today-command-row__icon" aria-hidden="true">{getHabitEmoji(habit)}</span>
                <span className="today-command-row__body">
                  <strong>{getHabitDisplayName(habit)}</strong>
                  <small>{formatPercent(percent)} complete</small>
                  {linkedSchedule ? <small className="today-command-row__link">{getScheduleTimeText(linkedSchedule)}</small> : null}
                </span>
                <StatusBadge done={isDone} />
              </button>
            ))}
          </div>
        </section>

        <section className="today-command-section">
          <div className="today-command-section__title">
            <ClipboardList size={15} />
            <strong>할 일</strong>
            <span>{completedTodoCount}/{todoItems.length}</span>
          </div>
          <div className="today-command-list">
            {todoItems.length === 0 ? (
              <p className="today-command-empty">오늘 마감 할 일이 없습니다.</p>
            ) : todoItems.slice(0, 5).map((todo) => (
              <button
                key={todo.id}
                type="button"
                className={`today-command-row today-command-row--button ${todo.isCompleted ? 'today-command-row--done' : ''}`}
                onClick={() => onNavigate?.('todos')}
              >
                <span className="today-command-row__icon" aria-hidden="true">
                  {todo.isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </span>
                <span className="today-command-row__body">
                  <strong>{todo.title || 'Untitled todo'}</strong>
                  <small>{todo.priority || 'medium'} priority</small>
                  {todo.linkedSchedule ? <small className="today-command-row__link">{getScheduleTimeText(todo.linkedSchedule)}</small> : null}
                </span>
                <StatusBadge done={todo.isCompleted} />
              </button>
            ))}
          </div>
        </section>

        <section className="today-command-section">
          <div className="today-command-section__title">
            <CalendarClock size={15} />
            <strong>시간표</strong>
            <span>{todaySchedules.length}</span>
          </div>
          <div className="today-command-list">
            {todaySchedules.length === 0 ? (
              <p className="today-command-empty">오늘 시간표 일정이 없습니다.</p>
            ) : todaySchedules.slice(0, 5).map((event) => {
              const link = getScheduleLinkLabel(event, habits, todos)
              const linkedName = link.name || (link.isMissing ? '삭제된 항목' : '')

              return (
                <button
                  key={event.occurrenceId ?? event.id}
                  type="button"
                  className="today-command-row today-command-row--button"
                  onClick={() => onNavigate?.('weeklyPlanner')}
                >
                  <span className="today-command-row__icon today-command-row__icon--schedule" aria-hidden="true" />
                  <span className="today-command-row__body">
                    <strong>{event.title || 'Untitled schedule'}</strong>
                    <small>{event.startTime} - {event.endTime} · {CATEGORY_LABELS[event.category] ?? event.category ?? '일정'}</small>
                    {link.type !== 'none' ? (
                      <small className="today-command-row__link">
                        {link.type === 'habit' ? '습관' : '할 일'}: {linkedName || '연결된 항목'}
                      </small>
                    ) : null}
                  </span>
                  <span className={`today-command-row__badge today-command-row__badge--time ${link.type !== 'none' ? 'today-command-row__badge--linked' : ''}`}>
                    {link.type === 'none' ? event.startTime : link.badge}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <div className="today-command-card__foot">
        <button type="button" className="today-command-view-button" onClick={() => onNavigate?.('records')}>
          전체 보기
        </button>
      </div>
    </section>
  )
}
