import { CalendarDays, CheckSquare, ClipboardCheck } from 'lucide-react'
import { WEEKDAY_LABELS } from '../constants/habitConstants'
import { formatPercent, safePercent } from '../utils/habitUtils'

export default function CalendarGrid({ days, onSelectDate, eventCountsByDate = {}, todoCountsByDate = {} }) {
  return (
    <div>
      <div className="calendar-legend">
        <span><CalendarDays size={13} /> 일정</span>
        <span><CheckSquare size={13} /> 할 일</span>
        <span><ClipboardCheck size={13} /> 습관 완료율</span>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day) => {
          const eventCount = eventCountsByDate[day.dateKey] || 0
          const todoCount = todoCountsByDate[day.dateKey] || 0
          const completion = safePercent(day.averageProgress)

          return (
            <button
              key={day.dateKey}
              type="button"
              className={[
                'calendar-cell',
                !day.inMonth ? 'calendar-cell--muted' : '',
                day.isToday ? 'calendar-cell--today' : '',
                day.isSelected ? 'calendar-cell--selected' : '',
                completion >= 75 ? 'calendar-cell--strong-progress' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectDate(day.dateKey)}
            >
              <span className="calendar-number">{day.dayNumber}</span>
              <span className="calendar-meta">{formatPercent(completion)}</span>
              <span className="calendar-markers">
                {eventCount > 0 ? <span className="calendar-marker calendar-marker--event"><CalendarDays size={10} />{eventCount}</span> : null}
                {todoCount > 0 ? <span className="calendar-marker calendar-marker--todo"><CheckSquare size={10} />{todoCount}</span> : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
