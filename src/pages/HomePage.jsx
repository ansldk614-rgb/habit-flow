import DashboardShell from '../components/dashboard/DashboardShell'
import DailyCompletionChart from '../components/dashboard/DailyCompletionChart'
import DailyHabitsGrid from '../components/dashboard/DailyHabitsGrid'
import LeftControlPanel from '../components/dashboard/LeftControlPanel'
import MonthlyOverviewGrid from '../components/dashboard/MonthlyOverviewGrid'
import RightStatsPanel from '../components/dashboard/RightStatsPanel'
import {
  calculateMonthlyProgress,
  getDailyChartData,
  getMonthWeeks,
  getOverallProgressRows,
  getTopHabits,
} from '../utils/dashboardStats'
import { getHabitLog, getHabitMetrics, safePercent } from '../utils/habitUtils'

export default function HomePage({
  habits = [],
  completions = {},
  todayKey,
  todayRate,
  todayHabits = [],
  today = new Date(),
  todayEvents = [],
  todayTodos = [],
  selectedDateKey,
  onSelectDate,
  onToggleHabitDate,
  onEditHabit,
}) {
  const year = today.getFullYear()
  const month = today.getMonth()
  const monthWeeks = getMonthWeeks(year, month)
  const chartData = getDailyChartData(habits, completions, year, month)
  const monthlyProgress = calculateMonthlyProgress(habits, completions, year, month)
  const topHabits = getTopHabits(habits, completions, year, month)
  const overallRows = getOverallProgressRows(habits, completions, year, month)

  const completedHabitCount = todayHabits.filter((habit) => {
    const metrics = getHabitMetrics(habit, getHabitLog(completions, todayKey, habit))
    return metrics.progressPercent >= 100
  }).length
  const completedTodoCount = todayTodos.filter((todo) => todo.isCompleted).length
  const overallTodayRate = safePercent(
    todayHabits.length + todayTodos.length === 0
      ? todayRate
      : ((todayRate * todayHabits.length) + completedTodoCount * 100) / Math.max(1, todayHabits.length + todayTodos.length),
  )
  const todaySummary = {
    events: todayEvents.length,
    todos: todayTodos.length,
    completedHabits: completedHabitCount,
    totalHabits: todayHabits.length,
    overallRate: overallTodayRate,
  }

  return (
    <DashboardShell
      leftPanel={<LeftControlPanel today={today} monthlyProgress={monthlyProgress} todaySummary={todaySummary} />}
      mainPanel={(
        <>
          <DailyCompletionChart chartData={chartData} />
          <MonthlyOverviewGrid weeks={monthWeeks} habits={habits} completions={completions} />
          <DailyHabitsGrid
            habits={habits}
            completions={completions}
            year={year}
            month={month}
            todayKey={todayKey}
            selectedDateKey={selectedDateKey}
            onSelectDate={onSelectDate}
            onToggleHabitDate={onToggleHabitDate}
            onEditHabit={onEditHabit}
          />
        </>
      )}
      rightPanel={<RightStatsPanel monthlyProgress={monthlyProgress} topHabits={topHabits} overallRows={overallRows} />}
    />
  )
}
