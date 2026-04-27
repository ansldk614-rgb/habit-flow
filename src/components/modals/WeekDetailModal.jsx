import { useEffect } from 'react'
import { X } from 'lucide-react'
import { calculateDailyCompletionRate } from '../../utils/dashboardStats'
import {
  formatCount,
  formatPercent,
  getHabitDisplayName,
  getHabitEmoji,
  getHabitLog,
  getHabitMetrics,
  isHabitScheduledForDate,
  safePercent,
} from '../../utils/habitUtils'

const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
const dateFormatter = new Intl.DateTimeFormat('ko-KR', { month: '2-digit', day: '2-digit' })

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function isDateInMonth(dateKey, activeMonth) {
  if (!activeMonth) return true
  const date = parseDateKey(dateKey)
  return date.getFullYear() === activeMonth.year && date.getMonth() === activeMonth.month
}

function getDayRows(habits, completions, dateKey) {
  return habits
    .filter((habit) => isHabitScheduledForDate(habit, dateKey))
    .map((habit) => {
      const metrics = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit))
      const percent = safePercent(metrics.progressPercent)

      return {
        habit,
        percent,
        isDone: percent >= 100,
      }
    })
}

export default function WeekDetailModal({
  week,
  habits = [],
  completions = {},
  todayKey,
  activeMonth,
  onClose,
  onToggleHabitDate,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const dates = week?.dates ?? []

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <section className="week-detail-modal" role="dialog" aria-modal="true" aria-labelledby="week-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="habit-modal__head">
          <h2 id="week-detail-title">{`WEEK ${week?.weekNumber ?? ''} DETAIL`}</h2>
          <button type="button" className="modal-icon-button" onClick={onClose} aria-label="Close week detail modal">
            <X size={18} />
          </button>
        </div>

        <div className="week-detail-board">
          {dates.map((dateKey) => {
            const date = parseDateKey(dateKey)
            const isInMonth = isDateInMonth(dateKey, activeMonth)
            const rows = isInMonth ? getDayRows(habits, completions, dateKey) : []
            const done = rows.filter((row) => row.isDone).length
            const notDone = Math.max(0, rows.length - done)
            const rate = isInMonth ? calculateDailyCompletionRate(habits, completions, dateKey) : 0

            return (
              <article key={dateKey} className={`week-day-card ${dateKey === todayKey ? 'week-day-card--today' : ''} ${!isInMonth ? 'week-day-card--disabled' : ''}`}>
                <div className="week-day-card__head">
                  <strong>{weekdayFormatter.format(date)}</strong>
                  <span>{dateFormatter.format(date)}</span>
                </div>

                <div className="week-day-ring" style={{ background: `conic-gradient(#86ff5d ${rate}%, rgba(255,255,255,0.08) 0)` }}>
                  <div>{formatPercent(rate)}</div>
                </div>

                <div className="week-day-card__tasks">TASKS</div>

                <div className="week-task-list">
                  {!isInMonth ? (
                    <p className="week-task-empty">Out of month</p>
                  ) : rows.length === 0 ? (
                    <p className="week-task-empty">No scheduled habits</p>
                  ) : rows.map(({ habit, isDone, percent }) => (
                    <button key={habit.id} type="button" className={`week-task-row ${isDone ? 'week-task-row--done' : ''}`} onClick={() => onToggleHabitDate?.(habit, dateKey)}>
                      <span>{isDone ? '✓' : '×'}</span>
                      <strong><i aria-hidden="true">{getHabitEmoji(habit)}</i>{getHabitDisplayName(habit)}</strong>
                      <em>{formatPercent(percent)}</em>
                    </button>
                  ))}
                </div>

                <div className="week-day-card__foot">
                  <span><b>{formatCount(done)}</b> Completed</span>
                  <span className={notDone === 0 ? 'is-clear' : ''}><b>{formatCount(notDone)}</b> Not Completed</span>
                </div>
              </article>
            )
          })}

          {dates.length === 0 ? <div className="dashboard-empty">No week data</div> : null}
        </div>
      </section>
    </div>
  )
}
