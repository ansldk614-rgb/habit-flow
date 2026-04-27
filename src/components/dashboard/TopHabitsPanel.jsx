import { formatCount, getHabitDisplayName, getHabitEmoji } from '../../utils/habitUtils'

export default function TopHabitsPanel({ habits = [] }) {
  const topHabits = habits.slice(0, 8)

  return (
    <section className="dash-panel stat-panel stat-panel--top">
      <div className="dash-panel__head stat-panel__head">
        <div>
          <span className="dash-label">Top Habits</span>
          <strong>TOP HABITS</strong>
        </div>
      </div>

      <div className="top-habits-list">
        {topHabits.length === 0 ? <div className="dashboard-empty">No habits yet</div> : topHabits.map((habit, index) => (
          <div key={habit.id} className={`top-habit-row ${index === 0 ? 'top-habit-row--best' : ''}`}>
            <span className="top-habit-rank">{index + 1}</span>
            <strong><span aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</strong>
            <b>{formatCount(habit.done)}</b>
          </div>
        ))}
      </div>
    </section>
  )
}
