import {
  calculateDailyCompletionRate,
  calculateWeeklyCompletionRate,
} from '../../utils/dashboardStats'
import {
  formatCount,
  formatPercent,
  getHabitLog,
  getHabitMetrics,
  isHabitScheduledForDate,
  safePercent,
} from '../../utils/habitUtils'

function getDayCounts(habits, completions, dateKey) {
  const scheduled = habits.filter((habit) => isHabitScheduledForDate(habit, dateKey))
  const done = scheduled.filter((habit) => {
    const metrics = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit))
    return safePercent(metrics.progressPercent) >= 100
  }).length

  return {
    done,
    total: scheduled.length,
  }
}

export default function MonthlyOverviewGrid({
  weeks = [],
  habits = [],
  completions = {},
  todayKey,
  selectedDateKey,
  onSelectDate,
  onOpenWeekDetail,
}) {
  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <span className="dash-label">Monthly Overview</span>
          <strong>Week 1 - Week {formatCount(weeks.length)}</strong>
        </div>
      </div>

      <div className="month-overview-grid">
        {weeks.map((week) => {
          const weeklyRate = calculateWeeklyCompletionRate(habits, completions, week.dates)

          return (
            <article key={week.label} className="month-week-card">
              <button type="button" className="month-week-card__head" onClick={() => onOpenWeekDetail?.(week)}>
                <strong>{week.label}</strong>
                <span>{formatPercent(weeklyRate)}</span>
              </button>

              <div className="month-week-card__days">
                {week.dates.map((dateKey) => {
                  const rate = calculateDailyCompletionRate(habits, completions, dateKey)
                  const counts = getDayCounts(habits, completions, dateKey)
                  const alpha = 0.08 + safePercent(rate) / 115
                  const dayNumber = Number(dateKey.slice(-2))

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      className={[
                        'month-day-cell',
                        dateKey === todayKey ? 'month-day-cell--today' : '',
                        dateKey === selectedDateKey ? 'month-day-cell--selected' : '',
                      ].filter(Boolean).join(' ')}
                      style={{ '--day-alpha': String(alpha), '--bar-height': `${Math.max(8, rate)}%` }}
                      title={`${dateKey}: ${formatPercent(rate)}`}
                      onClick={() => onSelectDate?.(dateKey)}
                    >
                      <span className="month-day-cell__date">{dayNumber}</span>
                      <i aria-hidden="true" />
                      <small>{formatCount(counts.done)}/{formatCount(counts.total)}</small>
                    </button>
                  )
                })}
              </div>

              <div className="month-week-card__foot">
                <span>Weekly</span>
                <strong>{formatPercent(weeklyRate)}</strong>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
