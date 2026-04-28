import { useState } from 'react'
import { ChevronDown, ChevronUp, Flame, Sparkles, Trash2, TrendingUp } from 'lucide-react'
import { HABIT_TYPES, PROGRESS_STEPS } from '../constants/habitConstants'
import {
  calculateHabitWeeklyRate,
  calculateStreak,
  formatCount,
  formatPercent,
  getHabitEmoji,
  getHabitDisplayName,
  getHabitLog,
  getHabitMetrics,
  getHabitTypeIcon,
  safeNumber,
  safePercent,
} from '../utils/habitUtils'

export default function HabitCard({ habit, completions, selectedDateKey, todayKey, today, updateHabitLog, deleteHabit }) {
  const HabitIcon = getHabitTypeIcon(habit.type)
  const log = getHabitLog(completions, selectedDateKey, habit)
  const metrics = getHabitMetrics(habit, log)
  const typeLabel = HABIT_TYPES.find((item) => item.value === habit.type)?.label ?? habit.type
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  function nudgeCustomProgress(direction) {
    const currentProgress = getHabitLog(completions, selectedDateKey, habit).progressPercent
    const currentIndex = PROGRESS_STEPS.findIndex((step) => step === currentProgress)
    const safeIndex = currentIndex === -1 ? 0 : currentIndex
    const nextIndex = Math.max(0, Math.min(PROGRESS_STEPS.length - 1, safeIndex + direction))
    updateHabitLog(habit, selectedDateKey, { progressPercent: PROGRESS_STEPS[nextIndex] })
  }

  return (
    <article className={`habit-card ${metrics.progressPercent === 100 ? 'habit-card--done' : ''}`}>
      <span className="habit-accent" style={{ backgroundColor: habit.color }} />
      <div className="habit-main">
        <div className="habit-title-row">
          <div className="habit-title-group">
            <HabitIcon size={18} />
            <span className="habit-emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>
            <strong>{getHabitDisplayName(habit)}</strong>
            <span className="habit-type-badge">{typeLabel}</span>
          </div>
          <div className="habit-card-actions">
            <span className="progress-pill">{formatPercent(metrics.progressPercent)}</span>
            <button type="button" className="habit-detail-toggle" onClick={() => setIsDetailOpen((current) => !current)} aria-expanded={isDetailOpen} aria-label={`${habit.name} 세부 정보 ${isDetailOpen ? '닫기' : '열기'}`}>
              {isDetailOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button type="button" className="icon-danger-button" onClick={() => deleteHabit(habit.id)} aria-label={`${habit.name} 삭제`} title="삭제">
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="habit-meta">
          <span><Flame size={14} />{calculateStreak(habit, completions, todayKey)}일 연속</span>
          <span><TrendingUp size={14} />주간 {formatPercent(calculateHabitWeeklyRate(habit, completions, today))}</span>
          <span><Sparkles size={14} />골드 +{formatCount(metrics.rewardGold)}</span>
        </div>

        <div className="habit-detail-card">
          {habit.type === 'wake' && (
            <div className="detail-grid detail-grid--time">
              <label className="compact-field"><span>목표 기상</span><input type="time" value={habit.target?.targetTime ?? '07:00'} disabled /></label>
              <label className="compact-field"><span>실제 기상</span><input type="time" value={log.actualTime ?? ''} onChange={(event) => updateHabitLog(habit, selectedDateKey, { actualTime: event.target.value })} /></label>
            </div>
          )}

          {habit.type === 'workout' && (
            <div className="detail-grid detail-grid--workout">
              <label className="compact-field compact-field--wide"><span>부위</span><input type="text" value={log.bodyPart} placeholder="예: 하체" onChange={(event) => updateHabitLog(habit, selectedDateKey, { bodyPart: event.target.value })} /></label>
              <label className="compact-field"><span>무게</span><input type="number" value={log.weight} onChange={(event) => updateHabitLog(habit, selectedDateKey, { weight: Number(event.target.value) || 0 })} /></label>
              <label className="compact-field"><span>횟수</span><input type="number" value={log.reps} onChange={(event) => updateHabitLog(habit, selectedDateKey, { reps: Number(event.target.value) || 0 })} /></label>
              <label className="compact-field"><span>세트</span><input type="number" value={log.sets} onChange={(event) => updateHabitLog(habit, selectedDateKey, { sets: Number(event.target.value) || 0 })} /></label>
              <div className="metric-inline"><span>목표 볼륨</span><strong>{formatCount(habit.target?.targetVolume)}</strong></div>
            </div>
          )}

          {habit.type === 'study' && (
            <div className="detail-grid detail-grid--study">
              <label className="compact-field"><span>목표 시간</span><input type="number" value={formatCount(habit.target?.targetMinutes)} disabled /></label>
              <label className="compact-field"><span>공부 시간(분)</span><input type="number" value={safeNumber(log.minutes)} onChange={(event) => updateHabitLog(habit, selectedDateKey, { minutes: Number(event.target.value) || 0 })} /></label>
            </div>
          )}

          {habit.type === 'custom' && (
            <div className="habit-progress-row">
              <button type="button" className="progress-button" onClick={() => nudgeCustomProgress(-1)} aria-label={`${habit.name} 진행률 낮추기`}><ChevronDown size={16} /></button>
              <input type="range" min="0" max="100" step="25" value={safePercent(log.progressPercent)} className="progress-slider" onChange={(event) => updateHabitLog(habit, selectedDateKey, { progressPercent: Number(event.target.value) })} />
              <button type="button" className="progress-button" onClick={() => nudgeCustomProgress(1)} aria-label={`${habit.name} 진행률 높이기`}><ChevronUp size={16} /></button>
            </div>
          )}

          {isDetailOpen ? <p className="detail-text">{metrics.detailText}</p> : null}
        </div>
      </div>
    </article>
  )
}
