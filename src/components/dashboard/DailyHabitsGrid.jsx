import { getMonthDates, getMonthWeeks } from '../../utils/dashboardStats'
import {
  formatCount,
  getHabitDisplayName,
  getHabitEmoji,
  getHabitGoalLabel,
  getHabitLog,
  getHabitMetrics,
  isHabitScheduledForDate,
  safePercent,
} from '../../utils/habitUtils'

const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getDateMeta(dateKey, todayKey, selectedDateKey, weekStartDates) {
  return {
    dateKey,
    day: Number(dateKey.slice(-2)),
    weekday: weekdayFormatter.format(parseDateKey(dateKey)).slice(0, 3),
    isToday: dateKey === todayKey,
    isSelected: dateKey === selectedDateKey,
    isWeekStart: weekStartDates.has(dateKey),
  }
}

function getMonthlyGoal(habit, dates) {
  return formatCount(
    habit.monthlyGoal,
    dates.filter((dateKey) => isHabitScheduledForDate(habit, dateKey)).length,
  )
}

export default function DailyHabitsGrid({
  habits = [],
  completions = {},
  year,
  month,
  todayKey,
  selectedDateKey,
  onSelectDate,
  onToggleHabitDate,
  onEditHabit,
}) {
  const dates = getMonthDates(year, month)
  const weeks = getMonthWeeks(year, month)
  const weekStartDates = new Set(weeks.map((week) => week.dates[0]).filter(Boolean))
  const dateColumns = dates.map((dateKey) => getDateMeta(dateKey, todayKey, selectedDateKey, weekStartDates))
  const gridTemplateColumns = `220px 74px repeat(${dates.length}, 28px)`

  return (
    <section className="dash-panel dash-panel--habits-grid">
      <div className="dash-panel__head">
        <div>
          <span className="dash-label">Daily Habits Grid</span>
          <strong>월간 습관 체크 테이블</strong>
        </div>
      </div>

      <div className="daily-habits-scroll">
        <div className="daily-habits-table daily-habits-table--week" style={{ gridTemplateColumns }}>
          <span className="daily-habits-sticky daily-habits-sticky--week">Daily Habits</span>
          <span className="daily-habits-goal daily-habits-goal--head">Goal</span>
          {weeks.map((week) => (
            <span key={week.label} className="daily-week-label" style={{ gridColumn: `span ${week.dates.length}` }}>
              {week.label}
            </span>
          ))}
        </div>

        <div className="daily-habits-table daily-habits-table--head" style={{ gridTemplateColumns }}>
          <span className="daily-habits-sticky">Habit</span>
          <span className="daily-habits-goal daily-habits-goal--head">Goal</span>
          {dateColumns.map((date) => (
            <button
              key={date.dateKey}
              type="button"
              className={[
                'daily-date-head',
                date.isToday ? 'daily-date-head--today' : '',
                date.isSelected ? 'daily-date-head--selected' : '',
                date.isWeekStart ? 'daily-date-head--week-start' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelectDate?.(date.dateKey)}
            >
              <strong>{date.day}</strong>
              <span>{date.weekday}</span>
            </button>
          ))}
        </div>

        {habits.length === 0 ? (
          <div className="dashboard-empty dashboard-empty--wide">Add a habit to start tracking</div>
        ) : habits.map((habit) => (
          <div key={habit.id} className="daily-habits-table daily-habits-table--row" style={{ gridTemplateColumns }}>
            <button type="button" className="daily-habit-name daily-habits-sticky" onClick={() => onEditHabit?.(habit)}>
              <span className="daily-habit-name__emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>
              <span className="daily-habit-name__text">{getHabitDisplayName(habit)}</span>
            </button>
            <button type="button" className="daily-habits-goal" title={getHabitGoalLabel(habit)} onClick={() => onEditHabit?.(habit)}>
              {getMonthlyGoal(habit, dates)}
            </button>
            {dates.map((dateKey) => {
              const scheduled = isHabitScheduledForDate(habit, dateKey)
              const progress = scheduled ? getHabitMetrics(habit, getHabitLog(completions, dateKey, habit)).progressPercent : 0
              const percent = safePercent(progress)
              const meta = getDateMeta(dateKey, todayKey, selectedDateKey, weekStartDates)

              return (
                <button
                  key={dateKey}
                  type="button"
                  className={[
                    'habit-grid-cell',
                    scheduled ? 'habit-grid-cell--scheduled' : '',
                    percent >= 100 ? 'habit-grid-cell--done' : '',
                    meta.isToday ? 'habit-grid-cell--today' : '',
                    meta.isSelected ? 'habit-grid-cell--selected' : '',
                    meta.isWeekStart ? 'habit-grid-cell--week-start' : '',
                  ].filter(Boolean).join(' ')}
                  style={scheduled ? { '--cell-alpha': String(0.08 + percent / 120) } : undefined}
                  title={`${getHabitDisplayName(habit)} / ${dateKey} / ${percent}%`}
                  disabled={!scheduled}
                  onClick={() => onToggleHabitDate?.(habit, dateKey)}
                >
                  {scheduled && percent >= 100 ? '✓' : ''}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
