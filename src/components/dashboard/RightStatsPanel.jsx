import MonthlyProgressDonut from './MonthlyProgressDonut'
import OverallProgressPanel from './OverallProgressPanel'
import TopHabitsPanel from './TopHabitsPanel'

export default function RightStatsPanel({ progress, topHabits, overallRows, label, innerLabel }) {
  return (
    <div className="right-stats-panel" aria-label={`${label} statistics`}>
      <MonthlyProgressDonut progress={progress} label={label} innerLabel={innerLabel} />
      <TopHabitsPanel habits={topHabits} />
      <OverallProgressPanel rows={overallRows} />
    </div>
  )
}
