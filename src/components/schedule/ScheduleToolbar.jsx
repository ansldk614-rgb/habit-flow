import { useRef } from 'react'
import { CalendarClock, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

function formatWeekRange(weekDays) {
  if (!weekDays.length) return ''

  const formatter = new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
  const first = weekDays[0].date
  const last = weekDays[weekDays.length - 1].date

  return `${formatter.format(first)} - ${formatter.format(last)}`
}

export default function ScheduleToolbar({
  weekDays,
  selectedDateKey,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onSelectDate,
  onAddSchedule,
}) {
  const dateInputRef = useRef(null)

  function openDatePicker() {
    const input = dateInputRef.current
    if (!input) {
      onToday?.()
      return
    }

    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }

    input.focus()
    input.click()
  }

  return (
    <div className="schedule-toolbar">
      <div className="schedule-toolbar__title">
        <p className="section-kicker"><CalendarClock size={15} /> Weekly Planner</p>
        <h2>주간 시간표</h2>
        <span>{formatWeekRange(weekDays)}</span>
      </div>

      <div className="schedule-toolbar__actions">
        <button type="button" className="schedule-nav-button" onClick={onPreviousWeek} aria-label="이전 주">
          <ChevronLeft size={17} />
        </button>
        <button type="button" className="secondary-button schedule-today-button" onClick={openDatePicker}>
          이번주
        </button>
        <input
          ref={dateInputRef}
          className="schedule-date-picker"
          type="date"
          value={selectedDateKey ?? ''}
          onChange={(event) => onSelectDate?.(event.target.value)}
          aria-label="날짜 선택"
        />
        <button type="button" className="schedule-nav-button" onClick={onNextWeek} aria-label="다음 주">
          <ChevronRight size={17} />
        </button>
        <button type="button" className="primary-button schedule-add-button" onClick={onAddSchedule}>
          <Plus size={17} /> 일정 추가
        </button>
      </div>
    </div>
  )
}
