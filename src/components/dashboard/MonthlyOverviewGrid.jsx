import { calculateDailyCompletionRate, calculateWeeklyCompletionRate } from '../../utils/dashboardStats'
import { formatPercent } from '../../utils/habitUtils'

export default function MonthlyOverviewGrid({ weeks, habits, completions }) {
  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <span className="dash-label">Monthly Overview</span>
          <strong>Week 1 - Week 5</strong>
        </div>
      </div>

      <div className="month-overview-grid">
        {weeks.map((week) => (
          <article key={week.label} className="month-week-card">
            <div className="month-week-card__head">
              <strong>{week.label}</strong>
              <span>{formatPercent(calculateWeeklyCompletionRate(habits, completions, week.dates))}</span>
            </div>
            <div className="month-week-card__days">
              {week.dates.map((dateKey) => {
                const rate = calculateDailyCompletionRate(habits, completions, dateKey)
                return (
                  <div key={dateKey} className="month-day-cell" title={`${dateKey} ${formatPercent(rate)}`}>
                    <span>{Number(dateKey.slice(-2))}</span>
                    <i style={{ height: `${Math.max(8, rate)}%` }} />
                  </div>
                )
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
