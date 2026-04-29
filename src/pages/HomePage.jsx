import DashboardShell from '../components/dashboard/DashboardShell'
import DailyCompletionChart from '../components/dashboard/DailyCompletionChart'
import DailyHabitsGrid from '../components/dashboard/DailyHabitsGrid'
import LeftControlPanel from '../components/dashboard/LeftControlPanel'
import MonthlyOverviewGrid from '../components/dashboard/MonthlyOverviewGrid'
import RightStatsPanel from '../components/dashboard/RightStatsPanel'
import TodayCommandCenter from '../components/dashboard/TodayCommandCenter'
import {
  calculateMonthlyProgress,
  getDailyChartData,
  getMonthDates,
  getMonthWeeks,
  getOverallProgressRows,
  getTopHabits,
} from '../utils/dashboardStats'
import {
  calculateRecentFourWeekProgress,
  getRecentDailyChartData,
  getRecentFourWeeks,
  getRecentOverallProgressRows,
  getRecentPeriodLabel,
  getRecentTopHabits,
} from '../utils/recentStats'
import { getHabitLog, getHabitMetrics, safePercent } from '../utils/habitUtils'

const monthLabelFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

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
  periodMode = 'recent',
  onPeriodModeChange,
  onSelectDate,
  onNavigate,
  onToggleHabitDate,
  onUpdateHabitLog,
  onEditHabit,
  onAddHabit,
  onOpenWeekDetail,
}) {
  const isMonthMode = periodMode === 'month'
  const year = today.getFullYear()
  const month = today.getMonth()
  const recentWeeks = getRecentFourWeeks(today)
  const recentDates = recentWeeks.flatMap((week) => week.dates)
  const monthWeeks = getMonthWeeks(year, month)
  const monthDates = getMonthDates(year, month)
  const periodLabel = isMonthMode ? monthLabelFormatter.format(today) : getRecentPeriodLabel(today)
  const chartData = isMonthMode ? getDailyChartData(habits, completions, year, month) : getRecentDailyChartData(habits, completions, today)
  const periodProgress = isMonthMode ? calculateMonthlyProgress(habits, completions, year, month) : calculateRecentFourWeekProgress(habits, completions, today)
  const topHabits = isMonthMode ? getTopHabits(habits, completions, year, month) : getRecentTopHabits(habits, completions, today)
  const overallRows = isMonthMode ? getOverallProgressRows(habits, completions, year, month) : getRecentOverallProgressRows(habits, completions, today)
  const overviewWeeks = isMonthMode ? monthWeeks : recentWeeks
  const dashboardDates = isMonthMode ? monthDates : recentDates
  const periodTitle = isMonthMode ? 'This Month Overview' : 'Recent 4 Weeks Overview'
  const periodSubtitle = isMonthMode ? 'This Month' : 'Recent 4 Weeks'
  const chartCaption = isMonthMode ? 'Based on this month' : 'Based on last 28 days'
  const totalLabel = isMonthMode ? 'Monthly Total' : 'Recent Total'
  const rightPanelLabel = isMonthMode ? 'This Month' : 'Recent 4 Weeks'
  const donutInnerLabel = isMonthMode ? 'THIS MONTH' : 'LAST 28 DAYS'

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
      leftPanel={<LeftControlPanel today={today} periodMode={periodMode} periodLabel={periodLabel} periodProgress={periodProgress} totalLabel={totalLabel} todaySummary={todaySummary} habits={habits} completions={completions} todayKey={todayKey} onPeriodModeChange={onPeriodModeChange} onToggleHabitDate={onToggleHabitDate} onAddHabit={onAddHabit} />}
      mainPanel={(
        <>
          <TodayCommandCenter
            today={today}
            todayKey={todayKey}
            habits={todayHabits}
            completions={completions}
            todos={todayTodos}
            onNavigate={onNavigate}
          />
          <DailyCompletionChart chartData={chartData} caption={chartCaption} />
          <MonthlyOverviewGrid
            title={periodTitle}
            subtitle={periodSubtitle}
            weeks={overviewWeeks}
            habits={habits}
            completions={completions}
            todayKey={todayKey}
            selectedDateKey={selectedDateKey}
            onSelectDate={onSelectDate}
            onOpenWeekDetail={onOpenWeekDetail}
          />
          <DailyHabitsGrid
            habits={habits}
            completions={completions}
            dates={dashboardDates}
            weeks={overviewWeeks}
            periodMode={periodMode}
            todayKey={todayKey}
            selectedDateKey={selectedDateKey}
            onSelectDate={onSelectDate}
            onToggleHabitDate={onToggleHabitDate}
            onUpdateHabitLog={onUpdateHabitLog}
            onEditHabit={onEditHabit}
          />
        </>
      )}
      rightPanel={<RightStatsPanel progress={periodProgress} topHabits={topHabits} overallRows={overallRows} label={rightPanelLabel} innerLabel={donutInnerLabel} />}
    />
  )
}
