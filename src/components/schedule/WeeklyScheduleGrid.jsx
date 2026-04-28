import { useEffect, useRef } from 'react'
import { SCHEDULE_TIME_GRID } from '../../constants/scheduleConstants'
import ScheduleEventBlock from './ScheduleEventBlock'
import { getEventsForDay, getEventTopAndHeight, getTimeSlots, timeToMinutes } from '../../utils/scheduleUtils'

const SLOT_HEIGHT = 36

function getCurrentTimeLineTop(startHour, endHour, slotMinutes) {
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  const gridStart = startHour * 60
  const gridEnd = endHour * 60

  if (minutes < gridStart || minutes > gridEnd) return null
  return ((minutes - gridStart) / slotMinutes) * SLOT_HEIGHT
}

function layoutOverlappingEvents(events) {
  const layouts = new Map()
  let cluster = []
  let clusterEnd = -1

  function flushCluster() {
    if (cluster.length === 0) return

    const columns = []
    const clusterLayouts = []

    cluster.forEach((event) => {
      const eventStart = timeToMinutes(event.startTime) ?? 0
      const eventEnd = timeToMinutes(event.endTime) ?? eventStart
      const columnIndex = columns.findIndex((end) => end <= eventStart)
      const nextColumnIndex = columnIndex === -1 ? columns.length : columnIndex

      columns[nextColumnIndex] = eventEnd
      clusterLayouts.push({ event, columnIndex: nextColumnIndex })
    })

    const totalColumns = Math.max(1, columns.length)
    clusterLayouts.forEach(({ event, columnIndex }) => {
      layouts.set(event.id, {
        columnIndex,
        totalColumns,
        isConflict: totalColumns > 1,
      })
    })

    cluster = []
    clusterEnd = -1
  }

  events.forEach((event) => {
    const start = timeToMinutes(event.startTime) ?? 0
    const end = timeToMinutes(event.endTime) ?? start

    if (cluster.length > 0 && start >= clusterEnd) {
      flushCluster()
    }

    cluster.push(event)
    clusterEnd = Math.max(clusterEnd, end)
  })

  flushCluster()
  return layouts
}

function getOverlapStyle(layout) {
  const total = layout?.totalColumns ?? 1
  const index = layout?.columnIndex ?? 0

  if (total <= 1) {
    return {
      left: '6px',
      right: '6px',
    }
  }

  return {
    left: `calc(6px + ((100% - 12px) / ${total}) * ${index})`,
    width: `calc((100% - 12px) / ${total} - 3px)`,
    right: 'auto',
  }
}

export default function WeeklyScheduleGrid({ weekDays, schedules = [], habits = [], todos = [], onScheduleClick, onSlotClick }) {
  const scrollRef = useRef(null)
  const { startHour, endHour, slotMinutes } = SCHEDULE_TIME_GRID
  const timeSlots = getTimeSlots(startHour, endHour, slotMinutes)
  const gridHeight = (timeSlots.length - 1) * SLOT_HEIGHT
  const currentLineTop = getCurrentTimeLineTop(startHour, endHour, slotMinutes)
  const hasSchedules = schedules.length > 0
  const todayIndex = weekDays.findIndex((day) => day.isToday)

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller || todayIndex < 0 || window.innerWidth > 720) return

    const timeAxisWidth = 50
    const dayWidth = Math.max(1, (scroller.scrollWidth - timeAxisWidth) / Math.max(1, weekDays.length))
    scroller.scrollTo({
      left: Math.max(0, timeAxisWidth + dayWidth * todayIndex - dayWidth * 0.5),
      behavior: 'smooth',
    })
  }, [todayIndex, weekDays.length])

  return (
    <div className="weekly-grid-shell">
      {!hasSchedules ? (
        <p className="weekly-grid-empty">일정을 추가해서 이번 주 루틴을 계획해보세요.</p>
      ) : null}

      <div ref={scrollRef} className="weekly-grid-scroll" role="region" aria-label="Weekly schedule grid">
        <div className="weekly-grid" style={{ '--schedule-grid-height': `${gridHeight}px`, '--schedule-slot-height': `${SLOT_HEIGHT}px` }}>
          <div className="weekly-grid__corner" />

          {weekDays.map((day) => (
            <div key={day.dateKey} className={`weekly-grid__day-head ${day.isToday ? 'weekly-grid__day-head--today' : ''}`}>
              <strong>{day.label}</strong>
              <span>{day.date.getDate()}</span>
            </div>
          ))}

          <div className="weekly-grid__time-axis" style={{ height: gridHeight }}>
            {timeSlots.slice(0, -1).map((time) => (
              <span key={time} style={{ top: `${((timeToMinutes(time) - startHour * 60) / slotMinutes) * SLOT_HEIGHT}px` }}>
                {time.endsWith(':00') ? time : ''}
              </span>
            ))}
          </div>

          {weekDays.map((day) => {
            const dayEvents = getEventsForDay(schedules, day.dayOfWeek)
            const eventLayouts = layoutOverlappingEvents(dayEvents)

            return (
              <div
                key={day.dateKey}
                className={`weekly-grid__day-column ${day.isToday ? 'weekly-grid__day-column--today' : ''}`}
                style={{ height: gridHeight }}
                onClick={(clickEvent) => {
                  const rect = clickEvent.currentTarget.getBoundingClientRect()
                  const offsetY = Math.max(0, clickEvent.clientY - rect.top)
                  const slotIndex = Math.floor(offsetY / SLOT_HEIGHT)
                  const minutes = startHour * 60 + slotIndex * slotMinutes
                  onSlotClick?.(day.dayOfWeek, minutes)
                }}
                role="button"
                tabIndex={0}
                aria-label={`${day.longLabel} 일정 추가`}
              >
                <div className="weekly-grid__slot-lines" aria-hidden="true">
                  {timeSlots.slice(0, -1).map((time) => (
                    <span key={time} className={time.endsWith(':00') ? 'weekly-grid__slot-line weekly-grid__slot-line--hour' : 'weekly-grid__slot-line'} />
                  ))}
                </div>

                {day.isToday && currentLineTop !== null ? (
                  <span className="weekly-grid__now-line" style={{ top: `${currentLineTop}px` }} />
                ) : null}

                {dayEvents.map((event) => {
                  const position = getEventTopAndHeight(event, startHour, slotMinutes)
                  const overlapLayout = eventLayouts.get(event.id)
                  return (
                    <ScheduleEventBlock
                      key={event.id}
                      style={{
                        top: `${position.top * SLOT_HEIGHT}px`,
                        height: `${Math.max(position.height * SLOT_HEIGHT - 5, 34)}px`,
                        ...getOverlapStyle(overlapLayout),
                      }}
                      isConflict={overlapLayout?.isConflict}
                      event={event}
                      habits={habits}
                      todos={todos}
                      onClick={(blockEvent) => {
                        blockEvent.stopPropagation()
                        onScheduleClick?.(event)
                      }}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
