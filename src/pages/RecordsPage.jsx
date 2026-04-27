import { ClipboardList, TrendingUp, Trash2 } from 'lucide-react'
import HabitCard from '../components/HabitCard'
import { formatHeroDate, parseDateKey } from '../utils/dateUtils'
import {
  calculateDayRate,
  calculateHabitWeeklyRate,
  calculateStreak,
  formatCount,
  formatPercent,
  getCompletionCount,
  getHabitDisplayName,
  getHabitEmoji,
  getHabitLog,
  getHabitMetrics,
  getProgressCellStyle,
  isHabitScheduledForDate,
  safePercent,
} from '../utils/habitUtils'

export default function RecordsPage({ habits, completions, selectedDateKey, selectedDate, selectedHabits, todayKey, today, matrixDates, updateHabitLog, deleteHabit }) {
  return (
    <>
      <section className="panel">
        <div className="section-header"><div><p className="section-kicker">오늘 기록</p><h2>{selectedDateKey === todayKey ? '오늘의 일정' : formatHeroDate(selectedDate)}</h2></div><ClipboardList size={18} /></div>
        <div className="schedule-head"><strong>{selectedDateKey === todayKey ? '오늘' : formatHeroDate(selectedDate)}</strong><span>{formatPercent(calculateDayRate(habits, completions, selectedDateKey))} 완료</span></div>
        <div className="habit-list">
          {selectedHabits.length === 0 ? <div className="empty-card"><p>예정된 일이 없어요.</p><span>습관 관리 탭에서 먼저 습관을 추가해 보세요.</span></div> : selectedHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} completions={completions} selectedDateKey={selectedDateKey} todayKey={todayKey} today={today} updateHabitLog={updateHabitLog} deleteHabit={deleteHabit} />
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-header"><div><p className="section-kicker">기록 보드</p><h2>최근 35일 실행 기록</h2></div><TrendingUp size={18} /></div>
        <div className="matrix-header"><span>습관</span><div className="matrix-days">{matrixDates.map((dateKey) => <span key={dateKey}>{parseDateKey(dateKey).getDate()}</span>)}</div></div>
        <div className="overview-list">
          {habits.length === 0 ? <div className="empty-card"><p>아직 습관이 없어요.</p><span>빠른 추가나 직접 추가로 첫 습관을 만들어 보세요.</span></div> : habits.map((habit) => (
            <article key={habit.id} className="overview-card overview-card--matrix">
              <div className="overview-top"><span className="overview-dot" style={{ backgroundColor: habit.color }} /><strong><span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>{getHabitDisplayName(habit)}</strong><button type="button" className="icon-danger-button" onClick={() => deleteHabit(habit.id)} aria-label={`${habit.name} 삭제`} title="삭제"><Trash2 size={16} /></button></div>
              <div className="matrix-row">{matrixDates.map((dateKey) => {
                const scheduled = isHabitScheduledForDate(habit, dateKey)
                const progress = getHabitMetrics(habit, getHabitLog(completions, dateKey, habit)).progressPercent
                return <span key={dateKey} className={['matrix-cell', scheduled ? 'matrix-cell--scheduled' : '', progress === 100 ? 'matrix-cell--done' : ''].filter(Boolean).join(' ')} style={getProgressCellStyle(progress, scheduled)}>{scheduled && safePercent(progress) === 100 ? '✓' : ''}</span>
              })}</div>
              <div className="overview-stats"><span>{calculateStreak(habit, completions, todayKey)}일 연속</span><span>주간 {formatPercent(calculateHabitWeeklyRate(habit, completions, today))}</span><span>총 {formatCount(getCompletionCount(habit, completions))}회 완전 달성</span></div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
