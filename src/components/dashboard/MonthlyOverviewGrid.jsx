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

const rangeFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

function getGaugeStyle(rate) {
  const percent = safePercent(rate)

  if (percent === 0) {
    return {
      '--day-alpha': '0.02',
      '--bar-height': '2px',
      '--bar-min-height': '1px',
      '--bar-opacity': '0.22',
      '--bar-glow': '0',
      '--heat-bg': '0',
      '--heat-border': '0',
      '--bar-color-start': 'var(--color-accent-soft)',
      '--bar-color-end': 'transparent',
    }
  }

  if (percent <= 25) {
    return {
      '--day-alpha': String(0.04 + percent / 240),
      '--bar-height': `${Math.max(4, percent * 0.42)}px`,
      '--bar-min-height': '3px',
      '--bar-opacity': '0.58',
      '--bar-glow': '0.08',
      '--heat-bg': '0.08',
      '--heat-border': '0.18',
      '--bar-color-start': 'color-mix(in srgb, var(--color-accent) 45%, var(--color-accent-soft))',
      '--bar-color-end': 'var(--color-accent-soft)',
    }
  }

  if (percent <= 50) {
    return {
      '--day-alpha': String(0.09 + percent / 170),
      '--bar-height': `${percent}%`,
      '--bar-min-height': '5px',
      '--bar-opacity': '0.68',
      '--bar-glow': '0.12',
      '--heat-bg': '0.14',
      '--heat-border': '0.28',
      '--bar-color-start': 'color-mix(in srgb, var(--color-accent) 62%, var(--color-accent-soft))',
      '--bar-color-end': 'var(--color-accent-soft)',
    }
  }

  if (percent <= 75) {
    return {
      '--day-alpha': String(0.14 + percent / 145),
      '--bar-height': `${percent}%`,
      '--bar-min-height': '5px',
      '--bar-opacity': '0.8',
      '--bar-glow': '0.18',
      '--heat-bg': '0.2',
      '--heat-border': '0.42',
      '--bar-color-start': 'color-mix(in srgb, var(--color-accent) 78%, var(--color-text))',
      '--bar-color-end': 'color-mix(in srgb, var(--color-accent) 52%, var(--color-accent-soft))',
    }
  }

  return {
    '--day-alpha': String(0.18 + percent / 130),
    '--bar-height': `${percent}%`,
    '--bar-min-height': '5px',
    '--bar-opacity': percent >= 100 ? '1' : '0.78',
    '--bar-glow': percent >= 100 ? '0.34' : '0.24',
    '--heat-bg': percent >= 100 ? '0.3' : '0.25',
    '--heat-border': percent >= 100 ? '0.72' : '0.56',
    '--bar-color-start': percent >= 100 ? 'color-mix(in srgb, var(--color-accent) 82%, var(--color-text))' : 'var(--color-accent)',
    '--bar-color-end': 'color-mix(in srgb, var(--color-accent) 64%, var(--color-accent-soft))',
  }
}

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
  title = 'Recent 4 Weeks Overview',
  subtitle = 'Recent 4 Weeks',
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
          <span className="dash-label">{title}</span>
          <strong>{subtitle}</strong>
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

              {week.startDate && week.endDate ? (
                <div className="month-week-card__range">
                  {rangeFormatter.format(new Date(`${week.startDate}T00:00:00`))} - {rangeFormatter.format(new Date(`${week.endDate}T00:00:00`))}
                </div>
              ) : null}

              <div className="month-week-card__days">
                {week.dates.map((dateKey) => {
                  const rate = calculateDailyCompletionRate(habits, completions, dateKey)
                  const counts = getDayCounts(habits, completions, dateKey)
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
                      style={getGaugeStyle(rate)}
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
                <span>Week Avg</span>
                <strong>{formatPercent(weeklyRate)}</strong>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
