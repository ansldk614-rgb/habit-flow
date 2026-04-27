import { Plus } from 'lucide-react'
import TodayFocusCard from './TodayFocusCard'
import { formatCount, formatPercent } from '../../utils/habitUtils'

const PERIOD_OPTIONS = [
  { id: 'recent', label: 'Recent 4 Weeks' },
  { id: 'month', label: 'This Month' },
]

export default function LeftControlPanel({
  today,
  periodMode = 'recent',
  periodLabel,
  periodProgress,
  totalLabel,
  todaySummary,
  habits,
  completions,
  todayKey,
  onPeriodModeChange,
  onToggleHabitDate,
  onAddHabit,
}) {
  return (
    <section className="dash-panel left-control-panel">
      <div className="tracker-brand">
        <strong>HABIT</strong>
        <span>TRACKER</span>
      </div>

      <div className="period-toggle" role="group" aria-label="Dashboard period">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={periodMode === option.id ? 'period-toggle__button period-toggle__button--active' : 'period-toggle__button'}
            onClick={() => onPeriodModeChange?.(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="control-block">
        <span className="dash-label">{periodMode === 'month' ? 'Month' : 'Period'}</span>
        <strong>{periodLabel}</strong>
      </div>

      <div className="control-block">
        <span className="dash-label">Today</span>
        <strong>{new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(today)}</strong>
      </div>

      <TodayFocusCard habits={habits} completions={completions} todayKey={todayKey} onToggleHabitDate={onToggleHabitDate} />

      <div className="control-grid">
        <div>
          <span className="dash-label">Events</span>
          <strong>{formatCount(todaySummary.events)}</strong>
        </div>
        <div>
          <span className="dash-label">Todos</span>
          <strong>{formatCount(todaySummary.todos)}</strong>
        </div>
        <div>
          <span className="dash-label">Habits</span>
          <strong>{formatCount(todaySummary.completedHabits)}/{formatCount(todaySummary.totalHabits)}</strong>
        </div>
        <div>
          <span className="dash-label">Today Rate</span>
          <strong>{formatPercent(todaySummary.overallRate)}</strong>
        </div>
      </div>

      <div className="control-block control-block--accent">
        <span className="dash-label">{totalLabel}</span>
        <strong>{formatPercent(periodProgress.percent)}</strong>
        <small>{formatCount(periodProgress.done)} done / {formatCount(periodProgress.total)} total</small>
      </div>

      <button type="button" className="dashboard-add-habit-button" onClick={onAddHabit}>
        <Plus size={16} />
        ADD HABIT
      </button>
    </section>
  )
}
