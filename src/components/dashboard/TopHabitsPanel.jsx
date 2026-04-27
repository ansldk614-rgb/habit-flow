import { formatCount, getHabitDisplayName, getHabitEmoji } from '../../utils/habitUtils'

export default function TopHabitsPanel({ habits }) {
  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <span className="dash-label">Top Habits</span>
          <strong>가장 많이 해낸 습관</strong>
        </div>
      </div>
      <div className="top-habits-list">
        {habits.length === 0 ? <div className="dashboard-empty">표시할 습관이 없어요.</div> : habits.slice(0, 8).map((habit, index) => (
          <div key={habit.id} className="top-habit-row">
            <span>{index + 1}</span>
            <strong><span aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</strong>
            <b>{formatCount(habit.done)}</b>
          </div>
        ))}
      </div>
    </section>
  )
}
