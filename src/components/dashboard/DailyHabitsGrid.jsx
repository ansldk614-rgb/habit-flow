import { getMonthDates } from '../../utils/dashboardStats'
import { formatCount, getHabitDisplayName, getHabitEmoji, getHabitLog, getHabitMetrics, isHabitScheduledForDate, safePercent } from '../../utils/habitUtils'

export default function DailyHabitsGrid({ habits, completions, year, month }) {
  const dates = getMonthDates(year, month)

  return (
    <section className="dash-panel dash-panel--habits-grid">
      <div className="dash-panel__head">
        <div>
          <span className="dash-label">Daily Habits Grid</span>
          <strong>월간 습관 체크 보드</strong>
        </div>
      </div>

      <div className="daily-habits-scroll">
        <div className="daily-habits-table daily-habits-table--head">
          <span>Daily Habits</span>
          <span>Goal</span>
          {dates.map((dateKey) => <span key={dateKey}>{Number(dateKey.slice(-2))}</span>)}
        </div>

        {habits.length === 0 ? (
          <div className="dashboard-empty">등록된 습관이 없어요.</div>
        ) : habits.map((habit) => (
          <div key={habit.id} className="daily-habits-table">
            <strong><span aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</strong>
            <b>{formatCount(habit.monthlyGoal, dates.filter((dateKey) => isHabitScheduledForDate(habit, dateKey)).length)}</b>
            {dates.map((dateKey) => {
              const scheduled = isHabitScheduledForDate(habit, dateKey)
              const progress = scheduled ? getHabitMetrics(habit, getHabitLog(completions, dateKey, habit)).progressPercent : 0
              return (
                <span
                  key={dateKey}
                  className={`habit-grid-cell ${scheduled ? 'habit-grid-cell--scheduled' : ''} ${safePercent(progress) >= 100 ? 'habit-grid-cell--done' : ''}`}
                  style={scheduled ? { '--cell-alpha': String(0.08 + safePercent(progress) / 120) } : undefined}
                  title={`${dateKey} ${safePercent(progress)}%`}
                >
                  {scheduled && safePercent(progress) >= 100 ? '✓' : ''}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
