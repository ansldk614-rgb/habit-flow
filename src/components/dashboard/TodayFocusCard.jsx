import { Check } from 'lucide-react'
import {
  formatCount,
  getHabitDisplayName,
  getHabitEmoji,
  getHabitLog,
  getHabitMetrics,
  isHabitScheduledForDate,
  safePercent,
} from '../../utils/habitUtils'

function getTodayFocusItems(habits, completions, todayKey) {
  return habits
    .filter((habit) => isHabitScheduledForDate(habit, todayKey))
    .map((habit) => {
      const metrics = getHabitMetrics(habit, getHabitLog(completions, todayKey, habit))
      const percent = safePercent(metrics.progressPercent)

      return {
        habit,
        isDone: percent >= 100,
        percent,
      }
    })
}

export default function TodayFocusCard({
  habits = [],
  completions = {},
  todayKey,
  onToggleHabitDate,
  limit = 5,
}) {
  const focusItems = getTodayFocusItems(habits, completions, todayKey)
  const remainingItems = focusItems.filter((item) => !item.isDone)
  const visibleItems = remainingItems.slice(0, limit)

  return (
    <section className="today-focus-card" aria-label="Today focus habits">
      <div className="today-focus-card__head">
        <span className="dash-label">Today Focus</span>
        <strong>{formatCount(remainingItems.length)} left</strong>
      </div>

      <div className="today-focus-list">
        {habits.length === 0 ? (
          <p>Add your first habit to start tracking</p>
        ) : remainingItems.length === 0 ? (
          <p><Check size={13} /> All habits completed today</p>
        ) : visibleItems.map(({ habit }) => (
          <button key={habit.id} type="button" className="today-focus-item" onClick={() => onToggleHabitDate?.(habit, todayKey)}>
            <span aria-hidden="true">{getHabitEmoji(habit)}</span>
            <strong>{getHabitDisplayName(habit)}</strong>
          </button>
        ))}
      </div>
    </section>
  )
}
