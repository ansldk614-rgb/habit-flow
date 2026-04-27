import { Plus } from 'lucide-react'
import { formatCount, formatPercent } from '../../utils/habitUtils'

export default function LeftControlPanel({ today, monthlyProgress, todaySummary, onAddHabit }) {
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(today)

  return (
    <section className="dash-panel left-control-panel">
      <div className="tracker-brand">
        <strong>HABIT</strong>
        <span>TRACKER</span>
      </div>

      <div className="control-block">
        <span className="dash-label">Month</span>
        <strong>{monthLabel}</strong>
      </div>

      <div className="control-block">
        <span className="dash-label">Today</span>
        <strong>{new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(today)}</strong>
      </div>

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
          <span className="dash-label">Rate</span>
          <strong>{formatPercent(todaySummary.overallRate)}</strong>
        </div>
      </div>

      <div className="control-block control-block--accent">
        <span className="dash-label">Monthly Total</span>
        <strong>{formatPercent(monthlyProgress.percent)}</strong>
        <small>{formatCount(monthlyProgress.done)} done / {formatCount(monthlyProgress.total)} total</small>
      </div>

      <button type="button" className="dashboard-add-habit-button" onClick={onAddHabit}>
        <Plus size={16} />
        ADD HABIT
      </button>
    </section>
  )
}
