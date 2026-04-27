import MonthlyProgressDonut from './MonthlyProgressDonut'
import OverallProgressPanel from './OverallProgressPanel'
import TopHabitsPanel from './TopHabitsPanel'

export default function RightStatsPanel({ monthlyProgress, topHabits, overallRows }) {
  return (
    <div className="right-stats-panel" aria-label="Monthly statistics">
      <MonthlyProgressDonut progress={monthlyProgress} />
      <TopHabitsPanel habits={topHabits} />
      <OverallProgressPanel rows={overallRows} />
    </div>
  )
}
