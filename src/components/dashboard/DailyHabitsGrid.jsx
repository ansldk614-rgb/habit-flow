import { useState } from 'react'
import { X } from 'lucide-react'
import {
  formatCount,
  formatPercent,
  getHabitDisplayName,
  getHabitEmoji,
  getHabitGoalLabel,
  getHabitLog,
  getHabitMonthlyGoalLabel,
  getHabitMetrics,
  isHabitScheduledForDate,
  safePercent,
} from '../../utils/habitUtils'

const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getDateMeta(dateKey, todayKey, selectedDateKey, weekStartDates) {
  return {
    dateKey,
    day: Number(dateKey.slice(-2)),
    weekday: weekdayFormatter.format(parseDateKey(dateKey)).slice(0, 3),
    isToday: dateKey === todayKey,
    isSelected: dateKey === selectedDateKey,
    isWeekStart: weekStartDates.has(dateKey),
  }
}

function getCompletionPatch(habit) {
  switch (habit.type) {
    case 'wake':
      return { actualTime: habit.target?.targetTime ?? '07:00', progressPercent: 100 }
    case 'workout':
      return { bodyPart: 'Workout', weight: Math.max(1, Number(habit.target?.targetVolume) || 1), reps: 1, sets: 1, progressPercent: 100 }
    case 'study':
      return { minutes: Math.max(1, Number(habit.target?.targetMinutes) || 1), progressPercent: 100 }
    default:
      return { progressPercent: 100 }
  }
}

function getResetPatch(habit) {
  switch (habit.type) {
    case 'wake':
      return { actualTime: '', progressPercent: 0 }
    case 'workout':
      return { bodyPart: '', weight: 0, reps: 0, sets: 0, progressPercent: 0 }
    case 'study':
      return { minutes: 0, progressPercent: 0 }
    default:
      return { progressPercent: 0 }
  }
}

function HabitGridLogModal({ habit, dateKey, completions, onClose, onUpdateHabitLog }) {
  const log = getHabitLog(completions, dateKey, habit)
  const metrics = getHabitMetrics(habit, log)
  const percent = safePercent(metrics.progressPercent)

  function update(patch) {
    onUpdateHabitLog?.(habit, dateKey, patch)
  }

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <section className="habit-grid-log-modal" role="dialog" aria-modal="true" aria-labelledby="habit-grid-log-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="habit-modal__head">
          <div>
            <span className="dash-label">{dateKey}</span>
            <h2 id="habit-grid-log-title">{getHabitEmoji(habit)} {getHabitDisplayName(habit)}</h2>
          </div>
          <button type="button" className="modal-icon-button" onClick={onClose} aria-label="Close habit record editor">
            <X size={18} />
          </button>
        </div>

        <div className="habit-grid-log-summary">
          <span className={`compact-badge ${percent >= 100 ? 'accent' : percent > 0 ? 'warning' : 'muted'}`}>{formatPercent(percent)}</span>
          <span>{getHabitGoalLabel(habit)}</span>
        </div>

        <div className="habit-grid-log-fields">
          {habit.type === 'wake' ? (
            <>
              <label className="modal-field">
                <span>TARGET TIME</span>
                <input type="time" value={habit.target?.targetTime ?? '07:00'} disabled />
              </label>
              <label className="modal-field">
                <span>ACTUAL TIME</span>
                <input type="time" value={log.actualTime ?? ''} onChange={(event) => update({ actualTime: event.target.value })} />
              </label>
            </>
          ) : null}

          {habit.type === 'workout' ? (
            <>
              <label className="modal-field modal-field--wide">
                <span>BODY PART</span>
                <input type="text" value={log.bodyPart ?? ''} onChange={(event) => update({ bodyPart: event.target.value })} />
              </label>
              <label className="modal-field">
                <span>WEIGHT</span>
                <input type="number" min="0" value={log.weight ?? 0} onChange={(event) => update({ weight: Number(event.target.value) || 0 })} />
              </label>
              <label className="modal-field">
                <span>REPS</span>
                <input type="number" min="0" value={log.reps ?? 0} onChange={(event) => update({ reps: Number(event.target.value) || 0 })} />
              </label>
              <label className="modal-field">
                <span>SETS</span>
                <input type="number" min="0" value={log.sets ?? 0} onChange={(event) => update({ sets: Number(event.target.value) || 0 })} />
              </label>
            </>
          ) : null}

          {habit.type === 'study' ? (
            <>
              <label className="modal-field">
                <span>TARGET MINUTES</span>
                <input type="number" value={formatCount(habit.target?.targetMinutes)} disabled />
              </label>
              <label className="modal-field">
                <span>ACTUAL MINUTES</span>
                <input type="number" min="0" value={log.minutes ?? 0} onChange={(event) => update({ minutes: Number(event.target.value) || 0 })} />
              </label>
            </>
          ) : null}

          {habit.type === 'custom' ? (
            <label className="modal-field modal-field--wide">
              <span>PROGRESS</span>
              <input type="range" min="0" max="100" step="5" value={safePercent(log.progressPercent)} onChange={(event) => update({ progressPercent: Number(event.target.value) })} />
            </label>
          ) : null}
        </div>

        <p className="habit-grid-log-detail">{metrics.detailText}</p>

        <div className="habit-grid-log-actions">
          <button type="button" className="modal-cancel-button" onClick={() => update(getResetPatch(habit))}>Set 0%</button>
          <button type="button" className="modal-save-button" onClick={() => update(getCompletionPatch(habit))}>Set 100%</button>
        </div>
      </section>
    </div>
  )
}

export default function DailyHabitsGrid({
  habits = [],
  completions = {},
  dates = [],
  weeks = [],
  periodMode = 'recent',
  todayKey,
  selectedDateKey,
  onSelectDate,
  onUpdateHabitLog,
  onEditHabit,
}) {
  const [editingCell, setEditingCell] = useState(null)
  const weekStartDates = new Set(weeks.map((week) => week.dates[0]).filter(Boolean))
  const dateColumns = dates.map((dateKey) => getDateMeta(dateKey, todayKey, selectedDateKey, weekStartDates))
  const gridTemplateColumns = `minmax(112px, 1.35fr) minmax(72px, 0.58fr) repeat(${dates.length}, minmax(12px, 1fr))`
  const isMonthMode = periodMode === 'month'

  return (
    <section className="dash-panel dash-panel--habits-grid">
      <div className="dash-panel__head">
        <div>
          <span className="dash-label">Daily Habits Grid</span>
          <strong>{isMonthMode ? 'This month habit table' : 'Recent 4 weeks habit table'}</strong>
        </div>
      </div>

      <div className="daily-habits-scroll">
        <div className="daily-habits-table daily-habits-table--week" style={{ gridTemplateColumns }}>
          <span className="daily-habits-sticky daily-habits-sticky--week">Daily Habits</span>
          <span className="daily-habits-goal daily-habits-goal--head">Monthly Goal</span>
          {weeks.map((week) => (
            <span key={week.label} className="daily-week-label" style={{ gridColumn: `span ${week.dates.length}` }}>
              {week.label}
            </span>
          ))}
        </div>

        <div className="daily-habits-table daily-habits-table--head" style={{ gridTemplateColumns }}>
          <span className="daily-habits-sticky">Habit</span>
          <span className="daily-habits-goal daily-habits-goal--head">Monthly Goal</span>
          {dateColumns.map((date) => (
            <button
              key={date.dateKey}
              type="button"
              className={[
                'daily-date-head',
                date.isToday ? 'daily-date-head--today' : '',
                date.isSelected ? 'daily-date-head--selected' : '',
                date.isWeekStart ? 'daily-date-head--week-start' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelectDate?.(date.dateKey)}
            >
              <strong>{date.day}</strong>
              <span>{date.weekday}</span>
            </button>
          ))}
        </div>

        {habits.length === 0 ? (
          <div className="dashboard-empty dashboard-empty--wide">Add a habit to start tracking</div>
        ) : habits.map((habit) => (
          <div key={habit.id} className="daily-habits-table daily-habits-table--row" style={{ gridTemplateColumns }}>
            <button type="button" className="daily-habit-name daily-habits-sticky" onClick={() => onEditHabit?.(habit)}>
              <span className="daily-habit-name__emoji" aria-hidden="true">{getHabitEmoji(habit)}</span>
              <span className="daily-habit-name__text">{getHabitDisplayName(habit)}</span>
            </button>
            <button type="button" className="daily-habits-goal daily-habits-goal--target" title={`Target: ${getHabitGoalLabel(habit)}`} onClick={() => onEditHabit?.(habit)}>
              {getHabitMonthlyGoalLabel(habit)}
            </button>
            {dates.map((dateKey) => {
              const scheduled = isHabitScheduledForDate(habit, dateKey)
              const progress = scheduled ? getHabitMetrics(habit, getHabitLog(completions, dateKey, habit)).progressPercent : 0
              const percent = safePercent(progress)
              const meta = getDateMeta(dateKey, todayKey, selectedDateKey, weekStartDates)

              return (
                <button
                  key={dateKey}
                  type="button"
                  className={[
                    'habit-grid-cell',
                    scheduled ? 'habit-grid-cell--scheduled' : '',
                    percent >= 100 ? 'habit-grid-cell--done' : '',
                    meta.isToday ? 'habit-grid-cell--today' : '',
                    meta.isSelected ? 'habit-grid-cell--selected' : '',
                    meta.isWeekStart ? 'habit-grid-cell--week-start' : '',
                  ].filter(Boolean).join(' ')}
                  style={scheduled ? { '--cell-alpha': String(0.08 + percent / 120) } : undefined}
                  title={`${getHabitDisplayName(habit)} / ${dateKey} / ${percent}%`}
                  disabled={!scheduled}
                  onClick={() => {
                    onSelectDate?.(dateKey)
                    setEditingCell({ habit, dateKey })
                  }}
                >
                  {scheduled && percent >= 100 ? '✓' : scheduled && percent > 0 ? percent : ''}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {editingCell ? (
        <HabitGridLogModal
          habit={editingCell.habit}
          dateKey={editingCell.dateKey}
          completions={completions}
          onClose={() => setEditingCell(null)}
          onUpdateHabitLog={onUpdateHabitLog}
        />
      ) : null}
    </section>
  )
}
